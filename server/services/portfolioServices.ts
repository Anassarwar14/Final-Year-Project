import { PrismaClient, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// --- Helper Types ---
interface TransactionInput {
  portfolioId: string;
  assetSymbol: string;
  quantity: number;
  pricePerUnit: number;
}

interface CreatePortfolioInput {
  userId: string;
  name: string;
  description?: string;
}

/**
 * 1. Create a New Portfolio
 */
export const createPortfolio = async (input: CreatePortfolioInput) => {
  return await prisma.portfolio.create({
    data: {
      userId: input.userId,
      name: input.name,
      description: input.description,
      cashBalance: 0, // Default starting cash
    },
  });
};

/**
 * 2. Get Portfolio by ID
 * Includes current holdings and calculates real-time total value based on latest prices (mocked here or fetched).
 */
export const getPortfolioById = async (portfolioId: string) => {
  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId },
    include: {
      holdings: {
        include: {
          asset: true, // Include details like Symbol, Name, Logo
        },
      },
    },
  });

  if (!portfolio) return null;

  // Calculate Total Value (Cash + Holdings Value)
  // Note: In a real app, you would fetch real-time prices for assets here.
  // For now, we use the averageBuyPrice as a proxy or assume the frontend handles live price updates.
  let holdingsValue = 0;
  
  const processedHoldings = portfolio.holdings.map((h) => {
    const qty = h.quantity.toNumber(); // Convert Decimal to JS Number
    const price = h.averageBuyPrice.toNumber();
    const currentValue = qty * price; // Replace 'price' with live market price if available
    holdingsValue += currentValue;

    return {
      ...h,
      quantity: qty,
      averageBuyPrice: price,
      currentValue: currentValue,
    };
  });

  return {
    ...portfolio,
    cashBalance: portfolio.cashBalance.toNumber(),
    holdings: processedHoldings,
    totalValue: portfolio.cashBalance.toNumber() + holdingsValue,
  };
};

/**
 * 3. Get All Portfolios for a User
 */
export const getUserPortfolios = async (userId: string) => {
  const portfolios = await prisma.portfolio.findMany({
    where: { userId },
    include: {
      _count: {
        select: { holdings: true },
      },
    },
  });
  
  // Convert Decimals to Numbers for JSON response
  return portfolios.map(p => ({
    ...p,
    cashBalance: p.cashBalance.toNumber()
  }));
};

/**
 * 4. Buy Asset (Transactional)
 * - Checks cash balance
 * - Creates/Updates Holding
 * - Updates Average Buy Price
 * - Creates Transaction Record
 */
export const buyAsset = async ({ portfolioId, assetSymbol, quantity, pricePerUnit }: TransactionInput) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch Portfolio to check cash
    const portfolio = await tx.portfolio.findUnique({ where: { id: portfolioId } });
    if (!portfolio) throw new Error('Portfolio not found');

    const totalCost = new Decimal(quantity).mul(pricePerUnit);

    if (portfolio.cashBalance.lessThan(totalCost)) {
      throw new Error('Insufficient cash balance');
    }

    // 2. Ensure Asset exists (or find it)
    const asset = await tx.asset.findUnique({ where: { symbol: assetSymbol } });
    if (!asset) throw new Error(`Asset ${assetSymbol} not found. Ensure asset master data is populated.`);

    // 3. Deduct Cash
    await tx.portfolio.update({
      where: { id: portfolioId },
      data: { cashBalance: { decrement: totalCost } },
    });

    // 4. Upsert Holding (Update avg price if exists, create if not)
    const existingHolding = await tx.holding.findUnique({
      where: { portfolioId_assetId: { portfolioId, assetId: asset.id } },
    });

    if (existingHolding) {
      // Calculate new Average Buy Price
      // Formula: ((OldQty * OldAvg) + (NewQty * NewPrice)) / (OldQty + NewQty)
      const oldQty = existingHolding.quantity;
      const oldAvg = existingHolding.averageBuyPrice;
      const newQty = new Decimal(quantity);
      const newPrice = new Decimal(pricePerUnit);
      
      const totalValue = oldQty.mul(oldAvg).add(newQty.mul(newPrice));
      const totalQty = oldQty.add(newQty);
      const newAvg = totalValue.div(totalQty);

      await tx.holding.update({
        where: { id: existingHolding.id },
        data: {
          quantity: totalQty,
          averageBuyPrice: newAvg,
        },
      });
    } else {
      await tx.holding.create({
        data: {
          portfolioId,
          assetId: asset.id,
          quantity: new Decimal(quantity),
          averageBuyPrice: new Decimal(pricePerUnit),
        },
      });
    }

    // 5. Create Transaction Record
    return await tx.transaction.create({
      data: {
        portfolioId,
        assetId: asset.id,
        type: TransactionType.BUY,
        quantity: new Decimal(quantity),
        pricePerUnit: new Decimal(pricePerUnit),
        executedAt: new Date(),
      },
    });
  });
};

/**
 * 5. Sell Asset (Transactional)
 * - Checks holding quantity
 * - Increases Cash
 * - Decreases Holding Quantity
 * - Creates Transaction Record
 */
export const sellAsset = async ({ portfolioId, assetSymbol, quantity, pricePerUnit }: TransactionInput) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch Asset ID
    const asset = await tx.asset.findUnique({ where: { symbol: assetSymbol } });
    if (!asset) throw new Error('Asset not found');

    // 2. Fetch Holding
    const holding = await tx.holding.findUnique({
      where: { portfolioId_assetId: { portfolioId, assetId: asset.id } },
    });

    if (!holding || holding.quantity.lessThan(quantity)) {
      throw new Error('Insufficient asset quantity to sell');
    }

    const totalSaleValue = new Decimal(quantity).mul(pricePerUnit);

    // 3. Update Portfolio Cash
    await tx.portfolio.update({
      where: { id: portfolioId },
      data: { cashBalance: { increment: totalSaleValue } },
    });

    // 4. Update Holding
    const newQuantity = holding.quantity.sub(quantity);
    if (newQuantity.equals(0)) {
      // If 0 left, remove the holding record entirely
      await tx.holding.delete({ where: { id: holding.id } });
    } else {
      await tx.holding.update({
        where: { id: holding.id },
        data: { quantity: newQuantity },
      });
    }

    // 5. Create Transaction Record
    return await tx.transaction.create({
      data: {
        portfolioId,
        assetId: asset.id,
        type: TransactionType.SELL,
        quantity: new Decimal(quantity),
        pricePerUnit: new Decimal(pricePerUnit),
        executedAt: new Date(),
      },
    });
  });
};

/**
 * 6. Get Transaction History
 */
export const getPortfolioTransactions = async (portfolioId: string) => {
  const transactions = await prisma.transaction.findMany({
    where: { portfolioId },
    include: { asset: true },
    orderBy: { executedAt: 'desc' },
  });

  return transactions.map(t => ({
    ...t,
    quantity: t.quantity.toNumber(),
    pricePerUnit: t.pricePerUnit.toNumber()
  }));
};

/**
 * 7. Deposit/Withdraw Cash (Helper for managing funds)
 */
export const manageCash = async (portfolioId: string, amount: number, type: 'DEPOSIT' | 'WITHDRAW') => {
  if (type === 'WITHDRAW') {
    const p = await prisma.portfolio.findUnique({ where: { id: portfolioId } });
    if (!p || p.cashBalance.lessThan(amount)) throw new Error("Insufficient funds");
    
    return prisma.portfolio.update({
      where: { id: portfolioId },
      data: { cashBalance: { decrement: amount } }
    });
  } else {
    return prisma.portfolio.update({
      where: { id: portfolioId },
      data: { cashBalance: { increment: amount } }
    });
  }
};
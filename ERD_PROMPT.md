# Entity-Relationship Diagram (ERD) Generation Prompt

## 📋 Overview
Create a complete and detailed Entity-Relationship Diagram (ERD) for the Financial Trading & Learning Platform database schema. The ERD must show all entities, relationships, keys, enums, and junction tables.

## 🎯 Requirements

The ERD must display:
- ✅ All entities (tables)
- ✅ All primary keys (PK) and foreign keys (FK)
- ✅ All relationships (1-1, 1-many, many-many)
- ✅ All enum-based fields with their possible values
- ✅ All junction tables (implicit and explicit)
- ✅ Cardinality notation (crow's foot notation preferred)
- ✅ Clear labeling and organization by functional modules

---

## 📌 ENTITIES & ATTRIBUTES

### **1. CORE USER & AUTHENTICATION MODULE**

#### **User**
- **PK:** `id` (String, CUID)
- `name` (String)
- `email` (String, UNIQUE)
- `emailVerified` (Boolean, default: false)
- `image` (String, nullable)
- `createdAt` (DateTime, default: now)
- `updatedAt` (DateTime, auto-update)
- `twoFactorEnabled` (Boolean, nullable)
- `role` (String, nullable)
- `banned` (Boolean, nullable)
- `banReason` (String, nullable)
- `banExpires` (DateTime, nullable)

**Relations:**
- One-to-Many: Session, Account, Member, Invitation, TwoFactor, Portfolio, LearningProgress, AiChatSession
- One-to-One: SimulatorProfile

---

#### **Session**
- **PK:** `id` (String)
- `expiresAt` (DateTime)
- `token` (String, UNIQUE)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
- `ipAddress` (String, nullable)
- `userAgent` (String, nullable)
- **FK:** `userId` → User.id (CASCADE DELETE)
- `activeOrganizationId` (String, nullable)
- `impersonatedBy` (String, nullable)

---

#### **Account**
- **PK:** `id` (String, CUID)
- `accountId` (String)
- `providerId` (String)
- **FK:** `userId` → User.id (CASCADE DELETE)
- `accessToken` (String, nullable)
- `refreshToken` (String, nullable)
- `idToken` (String, nullable)
- `accessTokenExpiresAt` (DateTime, nullable)
- `refreshTokenExpiresAt` (DateTime, nullable)
- `scope` (String, nullable)
- `password` (String, nullable)
- `createdAt` (DateTime, default: now)
- `updatedAt` (DateTime, auto-update)

---

#### **Verification**
- **PK:** `id` (String)
- `identifier` (String)
- `value` (String)
- `expiresAt` (DateTime)
- `createdAt` (DateTime, nullable)
- `updatedAt` (DateTime, nullable)

---

#### **Organization**
- **PK:** `id` (String)
- `name` (String)
- `slug` (String, UNIQUE, nullable)
- `logo` (String, nullable)
- `createdAt` (DateTime)
- `metadata` (String, nullable)

**Relations:**
- One-to-Many: Member, Invitation

---

#### **Member**
- **PK:** `id` (String)
- **FK:** `organizationId` → Organization.id (CASCADE DELETE)
- **FK:** `userId` → User.id (CASCADE DELETE)
- `role` (String)
- `createdAt` (DateTime)

---

#### **Invitation**
- **PK:** `id` (String)
- **FK:** `organizationId` → Organization.id (CASCADE DELETE)
- `email` (String)
- `role` (String, nullable)
- `status` (String)
- `expiresAt` (DateTime)
- **FK:** `inviterId` → User.id (CASCADE DELETE)

---

#### **TwoFactor**
- **PK:** `id` (String)
- `secret` (String)
- `backupCodes` (String)
- **FK:** `userId` → User.id (CASCADE DELETE)

---

### **2. ASSET MANAGEMENT MODULE**

#### **Asset**
- **PK:** `id` (String) — Uses asset symbol as ID (e.g., "AAPL", "BINANCE:BTCUSDT")
- `name` (String)
- `type` (AssetType ENUM)
- `symbol` (String, UNIQUE)
- `exchange` (String, nullable)
- `currency` (String, nullable)
- `logoUrl` (String, nullable)

**Relations:**
- One-to-Many: Holding, SimulatorHolding, Transaction, SimulatorTransaction, SimulatorWatchlist
- Many-to-Many: NewsArticle (implicit junction table)

---

### **3. AI FINANCIAL ADVISOR MODULE**

#### **AiChatSession**
- **PK:** `id` (String, CUID)
- **FK:** `userId` → User.id (CASCADE DELETE)
- `title` (String)
- `createdAt` (DateTime, default: now)
- `updatedAt` (DateTime, auto-update)

**Relations:**
- One-to-Many: AiChatMessage

---

#### **AiChatMessage**
- **PK:** `id` (String, CUID)
- **FK:** `sessionId` → AiChatSession.id (CASCADE DELETE)
- `role` (AiChatRole ENUM)
- `content` (String)
- `sources` (String[], array)
- `createdAt` (DateTime, default: now)

---

### **4. PORTFOLIO MANAGEMENT MODULE (Real Trading)**

#### **Portfolio**
- **PK:** `id` (String, CUID)
- **FK:** `userId` → User.id (CASCADE DELETE)
- `name` (String)
- `description` (String, nullable)
- `cashBalance` (Decimal, default: 0.0)
- `createdAt` (DateTime, default: now)
- `updatedAt` (DateTime, auto-update)

**Relations:**
- One-to-Many: Holding, Transaction, PortfolioSnapshot

---

#### **Holding**
- **PK:** `id` (String, CUID)
- **FK:** `portfolioId` → Portfolio.id (CASCADE DELETE)
- **FK:** `assetId` → Asset.id
- `quantity` (Decimal)
- `averageBuyPrice` (Decimal)

**Unique Constraint:** `(portfolioId, assetId)` — One holding per asset per portfolio

---

#### **Transaction**
- **PK:** `id` (String, CUID)
- **FK:** `portfolioId` → Portfolio.id (CASCADE DELETE)
- **FK:** `assetId` → Asset.id
- `type` (TransactionType ENUM)
- `quantity` (Decimal)
- `pricePerUnit` (Decimal)
- `executedAt` (DateTime)
- `createdAt` (DateTime, default: now)

---

#### **PortfolioSnapshot**
- **PK:** `id` (String, CUID)
- **FK:** `portfolioId` → Portfolio.id (CASCADE DELETE)
- `date` (DateTime)
- `totalValue` (Decimal)
- `cashValue` (Decimal)
- `holdingsValue` (Decimal)

**Unique Constraint:** `(portfolioId, date)` — One snapshot per portfolio per date

---

### **5. LEARNING HUB MODULE**

#### **LearningCategory**
- **PK:** `id` (String, CUID)
- `name` (String, UNIQUE)
- `description` (String, nullable)

**Relations:**
- One-to-Many: LearningArticle

---

#### **LearningArticle**
- **PK:** `id` (String, CUID)
- `title` (String)
- `content` (String)
- `author` (String, nullable)
- `imageUrl` (String, nullable)
- `createdAt` (DateTime, default: now)
- `updatedAt` (DateTime, auto-update)
- **FK:** `categoryId` → LearningCategory.id

**Relations:**
- One-to-Many: LearningProgress

---

#### **LearningProgress**
- **PK:** `id` (String, CUID)
- **FK:** `userId` → User.id (CASCADE DELETE)
- **FK:** `articleId` → LearningArticle.id (CASCADE DELETE)
- `status` (LearningStatus ENUM, default: NOT_STARTED)
- `startedAt` (DateTime, nullable)
- `completedAt` (DateTime, nullable)

**Unique Constraint:** `(userId, articleId)` — One progress entry per user per article

---

### **6. TRADING SIMULATOR MODULE**

#### **SimulatorProfile**
- **PK:** `id` (String, CUID)
- **FK:** `userId` → User.id (CASCADE DELETE, UNIQUE)
- `virtualBalance` (Decimal, default: 100000.0)
- `createdAt` (DateTime, default: now)
- `updatedAt` (DateTime, auto-update)

**Relations:**
- One-to-Many: SimulatorHolding, SimulatorTransaction, SimulatorSnapshot, SimulatorWatchlist

---

#### **SimulatorHolding**
- **PK:** `id` (String, CUID)
- **FK:** `profileId` → SimulatorProfile.id (CASCADE DELETE)
- **FK:** `assetId` → Asset.id
- `quantity` (Decimal)
- `averageBuyPrice` (Decimal)

**Unique Constraint:** `(profileId, assetId)` — One holding per asset per simulator profile

---

#### **SimulatorTransaction**
- **PK:** `id` (String, CUID)
- **FK:** `profileId` → SimulatorProfile.id (CASCADE DELETE)
- **FK:** `assetId` → Asset.id
- `type` (TransactionType ENUM)
- `quantity` (Decimal)
- `pricePerUnit` (Decimal)
- `executedAt` (DateTime)
- `createdAt` (DateTime, default: now)

---

#### **SimulatorSnapshot**
- **PK:** `id` (String, CUID)
- **FK:** `profileId` → SimulatorProfile.id (CASCADE DELETE)
- `date` (DateTime)
- `totalValue` (Decimal)
- `cashValue` (Decimal)
- `holdingsValue` (Decimal)

**Unique Constraint:** `(profileId, date)` — One snapshot per simulator profile per date

---

#### **SimulatorWatchlist**
- **PK:** `id` (String, CUID)
- **FK:** `profileId` → SimulatorProfile.id (CASCADE DELETE)
- **FK:** `assetId` → Asset.id (CASCADE DELETE)
- `priceAlertTarget` (Decimal, nullable)
- `priceAlertEnabled` (Boolean, default: false)
- `createdAt` (DateTime, default: now)

**Unique Constraint:** `(profileId, assetId)` — One watchlist entry per asset per simulator profile

---

### **7. MARKET NEWS MODULE**

#### **NewsArticle**
- **PK:** `id` (String, CUID)
- `sourceName` (String, nullable)
- `author` (String, nullable)
- `title` (String)
- `description` (String)
- `url` (String, UNIQUE)
- `imageUrl` (String, nullable)
- `publishedAt` (DateTime)
- `content` (String, nullable)
- `sentiment` (NewsSentiment ENUM, default: NEUTRAL)
- `createdAt` (DateTime, default: now)

**Relations:**
- Many-to-Many: Asset (implicit junction table: `_AssetToNewsArticle`)

---

## 🔤 ENUMS

### **UserRole**
- ADMIN
- USER

### **AiChatRole**
- USER
- MODEL

### **TransactionType**
- BUY
- SELL

### **AssetType**
- STOCK
- CRYPTO
- ETF
- MUTUAL_FUND
- COMMODITY

### **LearningStatus**
- NOT_STARTED
- IN_PROGRESS
- COMPLETED

### **NewsSentiment**
- POSITIVE
- NEGATIVE
- NEUTRAL

---

## 🔗 RELATIONSHIPS SUMMARY

### **One-to-One (1:1)**
- User ↔ SimulatorProfile

### **One-to-Many (1:N)**
- User → Session, Account, Member, Invitation, TwoFactor
- User → Portfolio, LearningProgress, AiChatSession
- Organization → Member, Invitation
- Portfolio → Holding, Transaction, PortfolioSnapshot
- Asset → Holding, Transaction, SimulatorHolding, SimulatorTransaction, SimulatorWatchlist
- AiChatSession → AiChatMessage
- LearningCategory → LearningArticle
- LearningArticle → LearningProgress
- SimulatorProfile → SimulatorHolding, SimulatorTransaction, SimulatorSnapshot, SimulatorWatchlist

### **Many-to-Many (M:N)**
- Asset ↔ NewsArticle
  - **Implicit Junction Table:** `_AssetToNewsArticle`
  - Fields:
    - `A` (assetId) → Asset.id
    - `B` (newsArticleId) → NewsArticle.id

---

## 🎨 VISUAL ORGANIZATION GUIDELINES

Group entities by functional modules:

1. **Core Auth & Users** (Blue)
   - User, Session, Account, Verification, TwoFactor, Organization, Member, Invitation

2. **Asset Management** (Green)
   - Asset

3. **AI Advisor** (Purple)
   - AiChatSession, AiChatMessage

4. **Real Portfolio** (Orange)
   - Portfolio, Holding, Transaction, PortfolioSnapshot

5. **Learning Hub** (Yellow)
   - LearningCategory, LearningArticle, LearningProgress

6. **Simulator** (Red)
   - SimulatorProfile, SimulatorHolding, SimulatorTransaction, SimulatorSnapshot, SimulatorWatchlist

7. **News** (Teal)
   - NewsArticle

---

## 📝 NOTES

- All `CASCADE DELETE` relationships should be clearly marked
- Show unique constraints with `(U)` notation
- Mark nullable fields with `?` or lighter color
- Default values should be indicated in parentheses
- Array fields (like `sources` in AiChatMessage) should be marked with `[]`
- The implicit junction table `_AssetToNewsArticle` should be shown explicitly with both foreign keys

---

## 🛠️ RECOMMENDED TOOLS

- **dbdiagram.io** (DBML syntax)
- **Lucidchart**
- **Draw.io**
- **Mermaid.js** (for code-based diagrams)
- **PlantUML**
- **ERDPlus**

---

## ✅ VALIDATION CHECKLIST

- [ ] All 25 entities included
- [ ] All 6 enums defined with values
- [ ] All primary keys marked
- [ ] All foreign keys marked with references
- [ ] All 1:1, 1:N relationships shown
- [ ] M:N relationship with junction table shown
- [ ] Unique constraints marked
- [ ] Cascade delete rules indicated
- [ ] Default values shown
- [ ] Nullable fields indicated
- [ ] Entities grouped by functional module
- [ ] Legend/key provided for notation

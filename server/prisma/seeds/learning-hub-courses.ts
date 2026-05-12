import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleQuiz = (prefix: string) => ({
  questions: [
    {
      id: `${prefix}-q1`,
      prompt: "Which statement best describes a key idea from this lesson?",
      options: [
        "Ignore risk entirely when learning markets",
        "Education helps you make more informed decisions",
        "Past performance always repeats exactly",
      ],
      correctIndex: 1,
    },
  ],
});

async function main() {
  const count = await prisma.course.count();
  if (count > 0) {
    console.log("Learning hub courses already present; skipping seed.");
    return;
  }

  await prisma.course.create({
    data: {
      title: "Crypto foundations",
      description:
        "Blockchain basics, wallets, and how to think about risk when exploring digital assets.",
      category: "CRYPTO",
      thumbnail: "https://i.ytimg.com/vi/SSo_EIwHSdU/maxresdefault.jpg",
      published: true,
      chapters: {
        create: [
          {
            title: "How does a blockchain work?",
            youtubeUrl: "https://www.youtube.com/watch?v=SSo_EIwHSdU",
            order: 0,
            quizJson: sampleQuiz("crypto-ch0"),
          },
          {
            title: "What is Bitcoin?",
            youtubeUrl: "https://www.youtube.com/watch?v=YfY1fsFesDI",
            order: 1,
            quizJson: sampleQuiz("crypto-ch1"),
          },
        ],
      },
    },
  });

  await prisma.course.create({
    data: {
      title: "Trading essentials",
      description:
        "Market structure, orders, and risk controls that matter before you place your first trade.",
      category: "TRADING",
      thumbnail: "https://i.ytimg.com/vi/ZCFkWDdm_G8/maxresdefault.jpg",
      published: true,
      chapters: {
        create: [
          {
            title: "How markets work",
            youtubeUrl: "https://www.youtube.com/watch?v=ZCFkWDdm_G8",
            order: 0,
            quizJson: sampleQuiz("trade-ch0"),
          },
        ],
      },
    },
  });

  await prisma.course.create({
    data: {
      title: "Personal finance fundamentals",
      description:
        "Budgeting, compounding, and building a simple plan you can stick with over time.",
      category: "FINANCE",
      thumbnail: "https://i.ytimg.com/vi/0nYYQRP3Pgs/maxresdefault.jpg",
      published: true,
      chapters: {
        create: [
          {
            title: "The basics of personal finance",
            youtubeUrl: "https://www.youtube.com/watch?v=0nYYQRP3Pgs",
            order: 0,
            quizJson: sampleQuiz("fin-ch0"),
          },
        ],
      },
    },
  });

  console.log("Seeded Learning Hub video courses.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";

export async function loadQuestionCache() {
  console.log("Loading questions into Redis...");

  for (let difficulty = 1; difficulty <= 10; difficulty++) {
    const questions = await prisma.question.findMany({
      where: { difficulty }
    });

    const key = `questions:${difficulty}`;

    await redis.del(key);

    for (const q of questions) {
      await redis.rpush(key, JSON.stringify(q));
    }
  }

  console.log("Questions cached in Redis");
}

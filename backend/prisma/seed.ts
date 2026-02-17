import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const questions = [
  // Difficulty 1–2 (basic concepts)
  { q: "Binary of decimal 2?", o: ["10","11","01","00"], a: "10" },
  { q: "HTML stands for?", o: ["Hyper Text Markup Language","HighText Machine Language","Hyperlinks Text Mark Language","Home Tool Markup Language"], a: "Hyper Text Markup Language" },
  { q: "Which is NOT a programming language?", o: ["Python","Java","HTTP","C++"], a: "HTTP" },
  { q: "CPU stands for?", o: ["Central Process Unit","Central Processing Unit","Computer Personal Unit","Central Processor Utility"], a: "Central Processing Unit" },

  // Difficulty 3–4 (programming basics)
  { q: "Output of: 2 + '2' in JavaScript?", o: ["4","22","NaN","Error"], a: "22" },
  { q: "Which data structure uses FIFO?", o: ["Stack","Queue","Tree","Graph"], a: "Queue" },
  { q: "Which keyword declares constant in JS?", o: ["let","var","const","define"], a: "const" },
  { q: "Time complexity of binary search?", o: ["O(n)","O(log n)","O(n log n)","O(1)"], a: "O(log n)" },

  // Difficulty 5–6 (core CS)
  { q: "Primary key in DB must be?", o: ["Unique","Null","Duplicate","Optional"], a: "Unique" },
  { q: "Which OS scheduling is non-preemptive?", o: ["Round Robin","Priority","FCFS","Multilevel"], a: "FCFS" },
  { q: "Which layer handles routing?", o: ["Transport","Network","Session","Data Link"], a: "Network" },
  { q: "Which structure is used in recursion internally?", o: ["Queue","Stack","Heap","Tree"], a: "Stack" },

  // Difficulty 7–8 (DSA & logic)
  { q: "Height of balanced binary tree with n nodes?", o: ["O(n)","O(log n)","O(n log n)","O(1)"], a: "O(log n)" },
  { q: "Which traversal gives sorted BST output?", o: ["Preorder","Postorder","Inorder","Level order"], a: "Inorder" },
  { q: "Hash collisions handled using?", o: ["Sorting","Chaining","Searching","Recursion"], a: "Chaining" },
  { q: "Deadlock needs how many conditions?", o: ["2","3","4","5"], a: "4" },

  // Difficulty 9–10 (advanced reasoning)
  { q: "CAP theorem: choose correct trio", o: ["Consistency Availability Partition","Concurrency Access Processing","Control Allocation Performance","Cache Array Protocol"], a: "Consistency Availability Partition" },
  { q: "Normalization reduces?", o: ["Speed","Redundancy","Indexes","Joins"], a: "Redundancy" },
  { q: "Which is NOT NoSQL DB?", o: ["MongoDB","Redis","PostgreSQL","Cassandra"], a: "PostgreSQL" },
  { q: "Worst case quicksort complexity?", o: ["O(n)","O(log n)","O(n log n)","O(n²)"], a: "O(n²)" }
];


async function main() {
  console.log("Seeding questions...");

  for (let difficulty = 1; difficulty <= 10; difficulty++) {
    for (const base of questions) {
      await prisma.question.create({
        data: {
          difficulty,
          question: `[D${difficulty}] ${base.q}`,
          options: base.o,
          correct: base.a
        }
      });
    }
  }

  console.log("Seed completed");
}

main().finally(() => prisma.$disconnect());

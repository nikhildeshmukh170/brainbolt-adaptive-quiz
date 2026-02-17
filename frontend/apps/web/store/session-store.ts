"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SessionState {
  userId: string;
  sessionId: string;
  // number of answers submitted in current session
  answered: number;
  // number of questions answered in current quiz (max 10)
  questionCount: number;

  incrementAnswered: () => void;
  resetAnswered: () => void;
  incrementQuestionCount: () => void;
  resetQuestionCount: () => void;
  createNewSession: () => void;
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      // user persists forever across sessions
      userId: generateId(),

      // session changes when quiz restarts
      sessionId: generateId(),
        
      // how many questions the user answered in this session
      answered: 0,
      // track question count for 10-question quiz mode (0-10)
      // starts at 0, increments after each answer, quiz ends when reaches 10
        questionCount: 0,

        incrementAnswered: () => set((s) => ({ answered: s.answered + 1 })),

        resetAnswered: () => set({ answered: 0 }),

        incrementQuestionCount: () => set((s) => ({ questionCount: Math.min(s.questionCount + 1, 10) })),
        
        resetQuestionCount: () => set({ questionCount: 0 }),

      createNewSession: () =>
        set({
          sessionId: generateId(),
            answered: 0,
            questionCount: 0,
        }),
    }),
    {
      name: "brainbolt-session", // localStorage key
    }
  )
);

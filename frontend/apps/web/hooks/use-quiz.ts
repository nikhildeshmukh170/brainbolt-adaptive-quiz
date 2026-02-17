"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNextQuestion, submitAnswer } from "@/lib/api";
import { useSession } from "./use-session";
import type { AnswerResponse } from "@/lib/types";

import { useSessionStore } from "@/store/session-store";

export function useQuiz() {
  const session = useSession();
  const qc = useQueryClient();

  const questionQuery = useQuery({
  queryKey: ["question", session?.sessionId],
  queryFn: async () => {
    const data = await getNextQuestion(session!.userId, session!.sessionId);
    console.log("QUESTION DATA:", data);
    return data;
  },
  enabled: !!session,
});


  const answerMutation = useMutation({
    mutationFn: ({
  questionId,
  index,
}: {
  questionId: string;
  index: number;
}) =>
  submitAnswer(
    session!.userId,
    questionId,
    questionQuery.data!.choices[index] // send option text
  ),

    onSuccess: () => {
      // Increment question count
      const store = useSessionStore.getState();
      const currentCount = store.questionCount;
      store.incrementQuestionCount();
      
      // Only fetch next question if not at 10 yet
      if (currentCount < 9) {
        qc.invalidateQueries({ queryKey: ["question"] });
      }
    },
  });

  const questionCount = useSessionStore((s) => s.questionCount);

  console.log("[useQuiz] questionCount:", questionCount, "isComplete:", questionCount >= 10);

  return {
    session,
    question: questionQuery.data,
    loading: questionQuery.isLoading,
    answer: answerMutation.mutateAsync,
    answering: answerMutation.isPending,
    result: answerMutation.data as AnswerResponse | undefined,
    questionCount,
    isQuizComplete: questionCount >= 10,
  };
}

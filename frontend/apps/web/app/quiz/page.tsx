"use client";

import { useState, useEffect } from "react";
import { useQuiz } from "@/hooks/use-quiz";
import QuestionCard from "@/components/quiz/question-card";
import StatPill from "@/components/ui/stat-pill";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/session-store";
import { useQueryClient } from "@tanstack/react-query";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Toast from "@/components/ui/toast";
import { getNextQuestion } from "@/lib/api";

export default function QuizPage() {
  const { question, loading, answer, answering, result, questionCount, isQuizComplete } = useQuiz();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log("[Quiz] Page mounted, starting from question:", questionCount);
  }, []);

  const [selected, setSelected] = useState<number | null>(null);
  const [applied, setApplied] = useState<number | null>(null);

  const router = useRouter();
  const createNew = useSessionStore((s) => s.createNewSession);
  const resetCount = useSessionStore((s) => s.resetQuestionCount);
  const qc = useQueryClient();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  if (loading || !question) {
    return <div className="p-6">Loading...</div>;
  }

  // Show completion screen after 10 questions
  if (isQuizComplete && result && questionCount === 10) {
    return (
      <main className="mx-auto max-w-2xl space-y-6 p-4">
        <Card>
          <div className="space-y-4 text-center">
            <div className="text-5xl animate-bounce">🎉</div>
            <h1 className="text-3xl font-bold">Quiz Complete!</h1>
            <p className="opacity-70">You answered 10 questions. Here's your final score:</p>
          </div>
        </Card>

        <Card>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <div className="text-sm opacity-70">Final Score</div>
              <div className="text-2xl font-bold text-[rgb(var(--color-primary))]">{result.score}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm opacity-70">Streak</div>
              <div className="text-2xl font-bold text-[rgb(var(--color-accent))]">{result.streak}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm opacity-70">Max Streak</div>
              <div className="text-2xl font-bold text-[rgb(var(--color-primary))]">{result.maxStreak}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm opacity-70">Rank</div>
              <div className="text-2xl font-bold text-[rgb(var(--color-accent))]">#{result.rank}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => {
                resetCount();
                createNew();
                const { userId, sessionId } = useSessionStore.getState();
                qc.prefetchQuery({
                  queryKey: ["question", sessionId],
                  queryFn: () => getNextQuestion(userId, sessionId),
                });
                setToastMsg("Starting new 10-question quiz...");
                setToastOpen(true);
                setTimeout(() => router.refresh(), 450);
              }}
              className="w-full"
            >
              Try Again
            </Button>
            <a href="/" className="rounded-(--radius) bg-[rgb(var(--color-card))] py-2 text-center text-sm hover:opacity-80 transition-opacity">
              Back to Home
            </a>
          </div>
        </Card>

        <Toast open={toastOpen} message={toastMsg} onClose={() => setToastOpen(false)} />
      </main>
    );
  }

  /* -------- selection logic -------- */

  function handleSelect(index: number) {
    if (answering) return;
    if (applied !== null) return;
    setSelected(index);
  }

  function handleApply() {
    if (selected === null) return;
    setApplied(selected);
  }

  async function handleSubmit() {
  if (applied === null || answering || !question) return;

  await answer({
    questionId: question.questionId,
    index: applied,
  });

  setSelected(null);
  setApplied(null);
}


  return (
    <>
      <main className="space-y-6">

        {/* question counter - shows 0/10 on start */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Question Progress</span>
            <span className="text-lg font-bold text-[rgb(var(--color-primary))]">{questionCount}/10</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-[rgb(var(--color-card))]">
            <div
              className="h-full rounded-full bg-[rgb(var(--color-primary))] transition-all duration-300 ease-out"
              style={{ width: `${(questionCount / 10) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs opacity-60">
            {questionCount === 0 ? "Answer 10 questions to complete the quiz" : 10 - questionCount + " questions remaining"}
          </p>
        </Card>

        {/* live stats */}
        {result && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatPill label="Score" value={result.score} />
            <StatPill label="Streak" value={result.streak} />
            <StatPill label="Max" value={result.maxStreak} />
            <StatPill label="Rank" value={result.rank} />
          </div>
        )}

        {/* question */}
        <QuestionCard
          question={question.question}
          choices={question.choices}
          difficulty={question.difficulty}
          disabled={answering}
          selected={applied ?? selected}
          correctIndex={result?.correctAnswer}
          onSelect={handleSelect}
        />

        {/* controls */}
        <Card>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <div className="text-sm opacity-80">
              {applied === null
                ? selected === null
                  ? "Choose an option then click Apply"
                  : `Selected: ${selected + 1}`
                : `Applied: ${applied + 1}`}
            </div>

            <div className="flex items-center gap-2">
              {applied !== null ? (
                <>
                  <Button onClick={() => setApplied(null)} disabled={answering} className="py-2 px-3">
                    Change
                  </Button>
                  <Button onClick={handleSubmit} disabled={answering} className="w-32">
                    {answering ? "Submitting..." : "Submit"}
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleApply} disabled={selected === null || answering} className="py-2 px-3">
                    Apply
                  </Button>
                  <Button disabled className="w-32" title="Submit after applying">
                    Submit
                  </Button>
                </>
              )}
            </div>

          </div>
        </Card>

      </main>

      {/* restart dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Restart quiz"
        message="Restarting will reset your quiz progress. Start a new 10-question quiz?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setConfirmOpen(false);
          resetCount();
          createNew();
          const { userId, sessionId } = useSessionStore.getState();
          await qc.prefetchQuery({
            queryKey: ["question", sessionId],
            queryFn: () => getNextQuestion(userId, sessionId),
          });
          setToastMsg("Quiz reset — starting new 10-question quiz...");
          setToastOpen(true);
          setTimeout(() => router.push("/quiz"), 450);
        }}
      />

      <Toast open={toastOpen} message={toastMsg} onClose={() => setToastOpen(false)} />
    </>
  );
}

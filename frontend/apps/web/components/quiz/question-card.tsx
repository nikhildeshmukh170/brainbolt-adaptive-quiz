"use client";

import { memo, useEffect } from "react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Skeleton from "@/components/ui/skeleton";

interface Props {
  question?: string;
  choices?: string[];
  difficulty?: string;
  disabled: boolean;
  selected: number | null;
  correctIndex?: number;
  onSelect: (index: number) => void;
}

function QuestionCard({
  question,
  choices,
  difficulty,
  disabled,
  selected,
  correctIndex,
  onSelect,
}: Props) {
  if (!choices || !question) {
    return (
      <Card>
        <div className="space-y-3">
          <div className="h-6 w-3/4">
            <Skeleton className="h-6 w-3/4" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </Card>
    );
  }

  // keyboard 1-4 support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const num = Number(e.key);
      if (num >= 1 && num <= choices.length && !disabled) {
        onSelect(num - 1);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [choices, disabled, onSelect]);

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{question}</h2>
        <Badge>{difficulty}</Badge>
      </div>

      <div className="space-y-2">
        {choices.map((c, i) => {
          let variant: "default" | "correct" | "wrong" = "default";

          if (selected !== null) {
            if (i === correctIndex) variant = "correct";
            else if (i === selected) variant = "wrong";
          }

          return (
            <Button
              key={i}
              variant={variant}
              disabled={disabled}
              onClick={() => onSelect(i)}
            >
              {i + 1}. {c}
            </Button>
          );
        })}
      </div>
    </Card>
  );
}

export default memo(QuestionCard);

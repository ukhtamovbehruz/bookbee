"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  generateQuiz,
  getAdminQuestions,
  saveAdminQuestions,
  type QuizQuestion,
} from "@/lib/quiz";
import { cn } from "@/lib/utils";
import type { Book } from "@/lib/types";

function blankQuestion(): QuizQuestion {
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    question: "",
    options: ["", "", "", ""],
    correctIndex: 0,
  };
}

export function QuizEditorDialog({
  open,
  onOpenChange,
  book,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book | null;
  onSaved: () => void;
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    if (!open || !book) return;
    const existing = getAdminQuestions(book.id);
    setQuestions(existing.length > 0 ? existing : [blankQuestion()]);
  }, [open, book]);

  function update(idx: number, patch: Partial<QuizQuestion>) {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  }

  function updateOption(qi: number, oi: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? value : o)) } : q,
      ),
    );
  }

  function loadGenerated() {
    if (!book) return;
    setQuestions(generateQuiz(book));
    toast.info("Loaded auto-generated questions — edit them as you like.");
  }

  function handleSave() {
    if (!book) return;
    const cleaned = questions
      .map((q) => ({
        ...q,
        question: q.question.trim(),
        options: q.options.map((o) => o.trim()),
      }))
      .filter((q) => q.question && q.options.every((o) => o));

    if (questions.length > 0 && cleaned.length !== questions.length) {
      toast.error("Every question needs text and all four options filled in.");
      return;
    }

    saveAdminQuestions(book.id, cleaned);
    toast.success(
      cleaned.length > 0
        ? `Saved ${cleaned.length} question${cleaned.length === 1 ? "" : "s"}.`
        : "Cleared custom questions — the quiz will use auto-generated ones.",
    );
    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quiz questions{book ? ` — ${book.title}` : ""}</DialogTitle>
          <DialogDescription>
            These questions power the &ldquo;Did you finish the book?&rdquo; quiz.
            Leave empty to use auto-generated questions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={loadGenerated}>
            <Wand2 className="size-3.5" />
            Load generated
          </Button>
          <span className="text-xs text-muted-foreground">
            {questions.length} question{questions.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="space-y-4">
          {questions.map((q, qi) => (
            <div key={q.id} className="rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor={`q-${qi}`} className="text-sm">
                  Question {qi + 1}
                </Label>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove question ${qi + 1}`}
                  onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== qi))}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
              <Input
                id={`q-${qi}`}
                className="mt-2"
                placeholder="Enter the question..."
                value={q.question}
                onChange={(e) => update(qi, { question: e.target.value })}
              />
              <div className="mt-3 space-y-2">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Mark option ${oi + 1} correct`}
                      onClick={() => update(qi, { correctIndex: oi })}
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                        q.correctIndex === oi
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {String.fromCharCode(65 + oi)}
                    </button>
                    <Input
                      placeholder={`Option ${oi + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Tap a letter to mark the correct answer.
              </p>
            </div>
          ))}

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => setQuestions((prev) => [...prev, blankQuestion()])}
          >
            <Plus className="size-4" />
            Add question
          </Button>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save questions</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

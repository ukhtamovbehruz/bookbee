"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, GraduationCap, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthProvider";
import { getBookById } from "@/lib/mock-data/books";
import { getCatalogBookById } from "@/lib/mock-data/catalog";
import { addToLibrary } from "@/lib/library";
import { getQuizForBook } from "@/lib/quiz";
import { markFinished } from "@/lib/library";
import { cn } from "@/lib/utils";
import type { Book } from "@/lib/types";

export default function QuizPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isReady } = useAuth();
  const [book, setBook] = useState<Book | null | undefined>(undefined);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  useEffect(() => {
    setBook(getCatalogBookById(params.id) ?? getBookById(params.id) ?? null);
  }, [params.id]);

  useEffect(() => {
    if (isReady && !user) {
      toast.warning("Sign up free to take the quiz and earn a certificate.");
      router.replace("/signup");
    }
  }, [isReady, user, router]);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- `attempt` forces a reshuffle on retry
  const questions = useMemo(() => (book ? getQuizForBook(book) : []), [book, attempt]);

  if (!isReady || !user) return null;

  if (book === undefined) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-4 h-40 w-full" />
      </div>
    );
  }

  if (book === null) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-xl font-bold">Book not found</h1>
        <Button asChild className="mt-4 rounded-full">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  const totalQuestions = questions.length;
  const passingScore = Math.max(1, Math.ceil(totalQuestions * 0.7));
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  function handleSubmit() {
    if (!book) return;
    const score = questions.reduce(
      (total, q) => total + (answers[q.id] === q.correctIndex ? 1 : 0),
      0,
    );
    const passed = score >= passingScore;

    if (passed) {
      addToLibrary(book.id);
      markFinished(book.id, score);
      toast.success(`You passed with ${score}/${totalQuestions} — certificate unlocked!`);
    } else {
      toast.warning(`You scored ${score}/${totalQuestions} — you need ${passingScore} to pass.`);
    }
    setResult({ score, passed });
  }

  function handleRetry() {
    setAnswers({});
    setResult(null);
    setAttempt((a) => a + 1);
  }

  if (result) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <span
          className={cn(
            "mx-auto flex size-16 items-center justify-center rounded-full",
            result.passed ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400",
          )}
        >
          {result.passed ? (
            <CheckCircle2 className="size-8" />
          ) : (
            <XCircle className="size-8" />
          )}
        </span>
        <h1 className="mt-5 text-2xl font-bold">
          {result.passed ? "You passed!" : "Not quite there yet"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          You scored {result.score} out of {totalQuestions} on &ldquo;{book.title}&rdquo;.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {result.passed ? (
            <Button asChild className="h-11 gap-2 rounded-full px-6">
              <Link href={`/book/${book.id}/certificate`}>
                <GraduationCap className="size-4" />
                View your certificate
              </Link>
            </Button>
          ) : (
            <Button className="h-11 rounded-full px-6" onClick={handleRetry}>
              Try again
            </Button>
          )}
          <Button variant="outline" asChild className="h-11 rounded-full px-6">
            <Link href={`/book/${book.id}`}>Back to book</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
        <GraduationCap className="size-4" />
        Completion Quiz
      </span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{book.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Answer all {totalQuestions} questions — score {passingScore} or higher to earn your
        certificate.
      </p>

      <div className="mt-8 space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="glass rounded-2xl p-5">
            <p className="font-medium text-foreground">
              {index + 1}. {question.question}
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {question.options.map((option, optionIndex) => {
                const selected = answers[question.id] === optionIndex;
                return (
                  <button
                    key={optionIndex}
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))
                    }
                    className={cn(
                      "rounded-xl border px-4 py-2.5 text-left text-sm transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-white/10 text-muted-foreground hover:border-white/20",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Button
        className="mt-8 h-11 w-full rounded-full"
        disabled={!allAnswered}
        onClick={handleSubmit}
      >
        Submit quiz
      </Button>
    </div>
  );
}

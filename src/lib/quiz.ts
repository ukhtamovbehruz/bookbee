import type { Book } from "@/lib/types";
import { books } from "@/lib/mock-data/books";
import { getCategoryById } from "@/lib/mock-data/categories";
import { formatDuration } from "@/lib/utils";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export const PASSING_SCORE = 7;
export const TOTAL_QUESTIONS = 10;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildOptions(correct: string, pool: string[]): { options: string[]; correctIndex: number } {
  const distractors = shuffle(pool.filter((v) => v && v !== correct)).slice(0, 3);
  const options = shuffle([correct, ...distractors]);
  return { options, correctIndex: options.indexOf(correct) };
}

export function generateQuiz(book: Book): QuizQuestion[] {
  const otherBooks = books.filter((b) => b.id !== book.id);
  const categoryName = getCategoryById(book.categoryIds[0])?.name ?? "General";

  const raw: { question: string; correct: string; pool: string[] }[] = [
    {
      question: `Who is the author of "${book.title}"?`,
      correct: book.author,
      pool: otherBooks.map((b) => b.author),
    },
    {
      question: `Who narrates the audiobook "${book.title}"?`,
      correct: book.narrator,
      pool: otherBooks.map((b) => b.narrator),
    },
    {
      question: `Which publisher released "${book.title}"?`,
      correct: book.publisher,
      pool: otherBooks.map((b) => b.publisher),
    },
    {
      question: `Approximately how long is "${book.title}"?`,
      correct: formatDuration(book.durationSec),
      pool: otherBooks.map((b) => formatDuration(b.durationSec)),
    },
    {
      question: `Which category best describes "${book.title}"?`,
      correct: categoryName,
      pool: otherBooks.map(
        (b) => getCategoryById(b.categoryIds[0])?.name ?? "General",
      ),
    },
    {
      question: `What language is "${book.title}" available in on BookBee?`,
      correct:
        book.language === "en" ? "English" : book.language === "uz" ? "Uzbek" : "Russian",
      pool: ["English", "Uzbek", "Russian"],
    },
    {
      question: `Is "${book.title}" part of BookBee Premium?`,
      correct: book.isPremium ? "Yes, it's a Premium title" : "No, it's free to listen to",
      pool: ["Yes, it's a Premium title", "No, it's free to listen to"],
    },
    {
      question: `How many chapters does "${book.title}" have?`,
      correct: `${book.chapters.length} chapters`,
      pool: otherBooks.map((b) => `${b.chapters.length} chapters`),
    },
    {
      question: `What is the title of the first chapter of "${book.title}"?`,
      correct: book.chapters[0]?.title ?? "Introduction",
      pool: otherBooks.flatMap((b) => b.chapters[0]?.title ?? []),
    },
    {
      question: `Which of these best describes "${book.title}"?`,
      correct: book.description,
      pool: otherBooks.map((b) => b.description),
    },
  ];

  return raw.map((item, index) => {
    const { options, correctIndex } = buildOptions(item.correct, item.pool);
    return {
      id: `${book.id}-q${index + 1}`,
      question: item.question,
      options,
      correctIndex,
    };
  });
}

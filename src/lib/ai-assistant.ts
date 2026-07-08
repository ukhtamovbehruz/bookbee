import type { Book } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import { getCategoryById } from "@/lib/mock-data/categories";

function categoryNames(book: Book): string {
  return book.categoryIds
    .map((id) => getCategoryById(id)?.name)
    .filter(Boolean)
    .join(", ");
}

export function suggestedQuestions(): string[] {
  return [
    "What is this book about?",
    "Give me the key takeaways",
    "Who narrates it and how long is it?",
    "How can I get the most out of listening?",
  ];
}

/**
 * A lightweight, rule-based reading assistant. It answers using the book's
 * real metadata so responses feel grounded, without a backend.
 */
export function askAI(book: Book, question: string): string {
  const q = question.toLowerCase();

  if (/about|summary|summar|what.*book|explain/.test(q)) {
    return `“${book.title}” by ${book.author} is a ${categoryNames(book)} title. ${book.description} It runs about ${formatDuration(
      book.durationSec,
    )} across ${book.chapters.length} chapters, so it's a great pick for focused listening.`;
  }

  if (/takeaway|lesson|learn|point|idea/.test(q)) {
    return `Here's how I'd approach the key ideas in “${book.title}”: listen to the introduction to frame the author's core argument, then note one actionable idea per chapter. ${book.author} builds the case gradually — by the final chapters you'll have a full mental model of ${categoryNames(
      book,
    ).toLowerCase()}.`;
  }

  if (/narrat|voice|who.*read|read.*by/.test(q)) {
    return `“${book.title}” is narrated by ${book.narrator}, published by ${book.publisher}.`;
  }

  if (/how long|duration|length|time|hours/.test(q)) {
    return `The full audiobook is about ${formatDuration(book.durationSec)} across ${book.chapters.length} chapters. At 7 minutes a day you'd finish it steadily while keeping your streak alive.`;
  }

  if (/chapter|contents|toc/.test(q)) {
    const first = book.chapters[0]?.title ?? "Introduction";
    return `There are ${book.chapters.length} chapters, starting with “${first}”. You can tap any chapter in the Table of Contents to jump straight to it.`;
  }

  if (/tip|improve|focus|remember|get the most|advice|help/.test(q)) {
    return `To get the most out of “${book.title}”: 1) Listen a little every day to hit your goal and earn BookBee Points. 2) Use the playback speed control to find a comfortable pace. 3) After finishing, take the completion quiz to lock in what you learned and earn a certificate.`;
  }

  if (/premium|free|cost|price/.test(q)) {
    return book.isPremium
      ? `“${book.title}” is a Premium title — it's included with BookBee Premium, which also adds offline listening and AI summaries.`
      : `Good news — “${book.title}” is free to listen to with any BookBee account.`;
  }

  if (/who.*author|written by|author/.test(q)) {
    return `“${book.title}” was written by ${book.author}.`;
  }

  return `Great question about “${book.title}”. Here's what stands out: ${book.description} If you'd like, ask me for the key takeaways, how long it is, or tips to get the most from your listen.`;
}

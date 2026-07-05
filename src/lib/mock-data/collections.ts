import type { Collection } from "@/lib/types";

export const collections: Collection[] = [
  {
    id: "best-business-books",
    title: "Best Business Books",
    description: "Sharpen your strategy with the titles every founder swears by.",
    colorHex: "#F4B400",
    bookIds: ["lean-startup", "zero-to-one", "good-to-great", "atomic-habits", "seven-habits"],
  },
  {
    id: "must-read-before-30",
    title: "Must Read Before 30",
    description: "The formative reads worth finishing before your third decade.",
    colorHex: "#6C4CF1",
    bookIds: ["atomic-habits", "deep-work", "mindset", "cant-hurt-me", "psychology-of-money", "1984"],
  },
  {
    id: "top-psychology-books",
    title: "Top Psychology Books",
    description: "Understand the mind, decisions, and what really drives behavior.",
    colorHex: "#38BDF8",
    bookIds: ["thinking-fast-and-slow", "influence", "emotional-intelligence", "power-of-habit", "mindset"],
  },
  {
    id: "best-uzbek-books",
    title: "Best Uzbek Books",
    description: "A curated shelf celebrating storytelling from Uzbekistan and beyond.",
    colorHex: "#22C55E",
    bookIds: ["to-kill-a-mockingbird", "crime-and-punishment", "the-great-gatsby", "1984", "sapiens"],
  },
  {
    id: "financial-freedom",
    title: "Financial Freedom",
    description: "Build wealth, understand markets, and take control of your money.",
    colorHex: "#34D399",
    bookIds: ["rich-dad-poor-dad", "intelligent-investor", "psychology-of-money", "naked-economics"],
  },
  {
    id: "programming-collection",
    title: "Programming Collection",
    description: "Level up your craft with foundational reads for engineers.",
    colorHex: "#F472B6",
    bookIds: [
      "clean-code",
      "pragmatic-programmer",
      "designing-data-intensive-applications",
      "you-dont-know-js",
    ],
  },
];

export function getCollectionById(id: string): Collection | undefined {
  return collections.find((c) => c.id === id);
}

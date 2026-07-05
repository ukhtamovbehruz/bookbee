import type { Category } from "@/lib/types";

export const categories: Category[] = [
  { id: "business", name: "Business", icon: "Briefcase", colorHex: "#F4B400" },
  { id: "psychology", name: "Psychology", icon: "Brain", colorHex: "#6C4CF1" },
  { id: "technology", name: "Technology", icon: "Cpu", colorHex: "#38BDF8" },
  { id: "programming", name: "Programming", icon: "Code2", colorHex: "#22C55E" },
  { id: "history", name: "History", icon: "Landmark", colorHex: "#EF9F76" },
  { id: "finance", name: "Finance", icon: "Wallet", colorHex: "#34D399" },
  { id: "literature", name: "Literature", icon: "BookOpen", colorHex: "#F472B6" },
  {
    id: "self-development",
    name: "Self Development",
    icon: "Sparkles",
    colorHex: "#FBBF24",
  },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

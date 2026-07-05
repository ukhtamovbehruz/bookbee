"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase,
  Brain,
  Cpu,
  Code2,
  Landmark,
  Wallet,
  BookOpen,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { categories } from "@/lib/mock-data/categories";
import { slideUp, staggerContainer } from "@/animations/variants";

const ICONS: Record<string, LucideIcon> = {
  Briefcase,
  Brain,
  Cpu,
  Code2,
  Landmark,
  Wallet,
  BookOpen,
  Sparkles,
};

export function CategoriesGrid() {
  return (
    <section id="categories" className="mx-auto max-w-7xl scroll-mt-20 px-4 sm:px-6 lg:px-8">
      <SectionHeading title="Popular Categories" className="mb-5" />
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
      >
        {categories.map((category) => {
          const Icon = ICONS[category.icon] ?? BookOpen;
          return (
            <motion.div key={category.id} variants={slideUp}>
              <Link
                href={`/category/${category.id}`}
                className="glass group flex flex-col items-start gap-3 rounded-2xl p-4 transition-transform hover:-translate-y-1 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className="flex size-10 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `${category.colorHex}22`,
                    color: category.colorHex,
                  }}
                >
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-medium text-foreground">
                  {category.name}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

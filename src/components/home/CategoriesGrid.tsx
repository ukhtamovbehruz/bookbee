"use client";

import Link from "next/link";
import Image from "next/image";
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
                className="group relative flex aspect-4/3 flex-col justify-end overflow-hidden rounded-2xl transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Image
                  src={`https://picsum.photos/seed/category-${category.id}/400/300`}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 45vw, 220px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(180deg, ${category.colorHex}22 0%, rgba(11,11,15,0.55) 55%, rgba(11,11,15,0.92) 100%)`,
                  }}
                />

                <div className="relative z-10 flex flex-col gap-2 p-4">
                  <span
                    className="flex size-9 items-center justify-center rounded-xl backdrop-blur-sm"
                    style={{
                      backgroundColor: `${category.colorHex}33`,
                      color: category.colorHex,
                    }}
                  >
                    <Icon className="size-4.5" />
                  </span>
                  <span className="text-sm font-semibold text-white drop-shadow-sm">
                    {category.name}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

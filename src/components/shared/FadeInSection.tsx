"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { slideUp } from "@/animations/variants";

export function FadeInSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={slideUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

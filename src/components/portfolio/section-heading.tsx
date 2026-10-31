"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { fadeUp, staggerContainer, viewportOnce } from "./animations";

interface SectionHeadingProps {
  /** Label kecil di atas judul, mis. "Tentang Saya" */
  kicker: string;
  /** Judul section — bisa mengandung elemen bertanda (mis. <span> berwarna) */
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  kicker,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start",
        className
      )}
    >
      <motion.span
        variants={fadeUp}
        className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400"
      >
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
        </span>
        {kicker}
      </motion.span>
      <motion.h2
        variants={fadeUp}
        className="max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-4xl"
      >
        {title}
      </motion.h2>
      {description ? (
        <motion.p
          variants={fadeUp}
          className={cn(
            "max-w-2xl text-base text-muted-foreground text-pretty",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </motion.p>
      ) : null}
    </motion.div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Award, Clock3, FolderCheck, type LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { fadeUp, staggerContainer, viewportOnce } from "./animations";

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const duration = 1200;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplay(Math.round(eased * value));

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

interface StatItem {
  label: string;
  value: number;
  suffix: string;
  icon: LucideIcon;
  iconClassName: string;
}

interface StatsProps {
  projectCount: number;
}

export function Stats({ projectCount }: StatsProps) {
  const stats: StatItem[] = [
    {
      label: "Freshgraduate",
      value: 0,
      suffix: "+",
      icon: Clock3,
      iconClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Proyek Selesai",
      value: projectCount,
      suffix: "+",
      icon: FolderCheck,
      iconClassName: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    },
    {
      label: "Penghargaan & Sertifikat",
      value: 1,
      suffix: "",
      icon: Award,
      iconClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <section aria-label="Statistik singkat" className="w-full py-10 sm:py-12">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto grid w-full max-w-5xl grid-cols-1 items-stretch justify-center gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="flex h-full"
              >
                <Card className="group flex w-full flex-col items-center justify-center gap-4 rounded-2xl border-border/70 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 sm:p-8">
                  <span
                    className={`flex size-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${stat.iconClassName}`}
                  >
                    <Icon className="size-6" />
                  </span>

                  <p className="text-4xl font-bold tracking-tight sm:text-5xl">
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </p>

                  <p className="w-full text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {stat.label}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

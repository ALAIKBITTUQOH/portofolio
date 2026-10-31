
"use client";

import { motion } from "framer-motion";
import {
  Monitor,
  Server,
  Smartphone,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { skillGroups } from "@/config/profile";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionHeading } from "./section-heading";
import { fadeUp, staggerContainer, viewportOnce } from "./animations";

const GROUP_ICONS: Record<string, LucideIcon> = {
  monitor: Monitor,
  server: Server,
  smartphone: Smartphone,
  wrench: Wrench,
};

export function Skills() {
  return (
    <section
      id="keahlian"
      className="scroll-mt-24 py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Keahlian"
          title={
            <>
              Teknologi yang Saya{" "}
              <span className="text-gradient">Kuasai</span>
            </>
          }
          description="Perangkat yang saya gunakan sehari-hari untuk membangun produk digital dari ujung ke ujung."
          align="center"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto mt-10 grid w-full max-w-5xl grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {skillGroups.map((group) => {
            const Icon = GROUP_ICONS[group.icon] ?? Wrench;

            return (
              <motion.div
                key={group.title}
                variants={fadeUp}
                className="h-full"
              >
                <Card className="group flex h-full flex-col items-center rounded-2xl border-border/70 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5">
                  <CardHeader className="flex w-full flex-col items-center px-0 text-center">
                    <span className="mb-3 flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 transition-transform group-hover:scale-110 dark:text-emerald-400">
                      <Icon className="size-5" />
                    </span>

                    <CardTitle className="text-center text-base">
                      {group.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex w-full flex-1 flex-col items-center justify-center gap-4 px-0">
                    <div className="flex w-full flex-wrap justify-center gap-2">
                      {(Array.isArray(group.skills) ? group.skills : []).map(
                        (skill) => {
                          const label =
                            typeof skill === "string"
                              ? skill
                              : skill?.name;

                          if (!label) return null;

                          return (
                            <Badge
                              key={label}
                              variant="secondary"
                              className="max-w-full whitespace-normal text-center"
                            >
                              {label}
                            </Badge>
                          );
                        }
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
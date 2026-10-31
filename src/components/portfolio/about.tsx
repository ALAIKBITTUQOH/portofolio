"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  GraduationCap,
  Mail,
  MapPin,
  type LucideIcon,
} from "lucide-react";

import { aboutHighlights, aboutParagraphs, profile } from "@/config/profile";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionHeading } from "./section-heading";
import { fadeUp, staggerContainer, viewportOnce } from "./animations";

interface InfoItem {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}

export function About() {
  const infoItems: InfoItem[] = [
    { icon: MapPin, label: "Lokasi", value: profile.location },
    {
      icon: Mail,
      label: "Email",
      value: profile.email,
      href: `mailto:${profile.email}`,
    },
    { icon: GraduationCap, label: "Pendidikan", value: profile.education },
    { icon: BadgeCheck, label: "Status", value: profile.availability },
  ];

  return (
    <section id="tentang" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Tentang Saya"
          title={
            <>
              Kenalan dengan <span className="text-gradient">Saya</span>
            </>
          }
          description="Sedikit cerita tentang siapa saya, apa yang saya kerjakan, dan mengapa saya cocok untuk tim Anda."
        />

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-14">
          {/* Narasi */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="flex flex-col gap-5"
          >
            {aboutParagraphs.map((paragraph, index) => (
              <motion.p
                key={index}
                variants={fadeUp}
                className="text-base leading-relaxed text-muted-foreground text-pretty"
              >
                {paragraph}
              </motion.p>
            ))}

            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-sm font-medium text-foreground">Fokus utama:</span>
              {aboutHighlights.map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="rounded-full border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                >
                  {tech}
                </Badge>
              ))}
            </motion.div>
          </motion.div>

          {/* Kartu info */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className="h-full rounded-2xl border-border/70 p-6 shadow-sm sm:p-8">
              <CardHeader className="px-0">
                <CardTitle className="text-lg">Informasi Singkat</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 px-0">
                {infoItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-4 rounded-xl border border-border/60 bg-background/40 p-4 transition-colors hover:border-emerald-500/40"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <item.icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="truncate text-sm font-semibold hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="truncate text-sm font-semibold">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

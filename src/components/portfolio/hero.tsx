
"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  FolderCheck,
  Github,
  Instagram,
  Linkedin,
  Mail,
  type LucideIcon,
} from "lucide-react";

import { profile, type SocialLink } from "@/config/profile";
import { openEmailCompose } from "@/lib/email";
import { SafeImage } from "./safe-image";
import { Button } from "@/components/ui/button";
import { fadeUp, staggerContainer } from "./animations";

const SOCIAL_ICONS: Record<SocialLink["icon"], LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  mail: Mail,
};

interface HeroProps {
  projectCount: number;
}

export function Hero({ projectCount }: HeroProps) {
  return (
    <section
      id="beranda"
      className="relative flex min-h-[92svh] items-center overflow-hidden pt-24 pb-16 sm:pt-28"
    >
      {/* Latar: pola grid + blobs gradasi (ungu → oranye, bergerak lambat) */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black,transparent)]" />
        <div className="animate-blob absolute -top-32 -left-32 size-[28rem] rounded-full bg-purple-500/20 blur-[130px] dark:bg-purple-500/25" />
        <div className="animate-blob-slow absolute top-1/3 -right-40 size-[30rem] rounded-full bg-fuchsia-500/15 blur-[140px] dark:bg-fuchsia-400/20" />
        <div className="animate-blob-alt absolute bottom-0 left-1/3 size-80 rounded-full bg-orange-400/10 blur-[120px] dark:bg-orange-400/15" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8">
        {/* Kolom teks */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-start gap-6"
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-700 dark:border-purple-400/30 dark:bg-purple-500/10 dark:text-purple-300"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-purple-500 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-purple-500" />
            </span>
            Terbuka untuk Kesempatan Kerja
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            Halo, saya <span className="text-gradient">{profile.name}</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg font-semibold text-foreground/90 sm:text-xl"
          >
            {profile.roleLine}
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="max-w-xl text-base text-muted-foreground text-pretty sm:text-lg"
          >
            {profile.tagline}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="btn-shine h-11 gap-2 px-6 shadow-lg shadow-purple-500/25"
            >
              <a href="#proyek">
                Lihat Proyek Saya
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </Button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex items-center gap-2 pt-1"
          >
            {profile.socials.map((social) => {
              const Icon = SOCIAL_ICONS[social.icon];

              return (
                <Button
                  key={social.label}
                  variant="outline"
                  size="icon"
                  className="size-11 rounded-xl transition-all hover:-translate-y-0.5 hover:border-purple-500/50 hover:text-purple-600 hover:shadow-md hover:shadow-purple-500/15 dark:hover:text-purple-400"
                  asChild
                >
                  <a
                    href={social.href}
                    target={
                      social.href.startsWith("http")
                        ? "_blank"
                        : undefined
                    }
                    rel="noreferrer"
                    aria-label={social.label}
                    onClick={(event) => {
                      // Email dibuka via aplikasi Gmail (HP) / Gmail web (laptop).
                      if (social.icon === "mail") {
                        event.preventDefault();
                        openEmailCompose({
                          to: profile.email,
                          subject: `Halo ${profile.name}, saya tertarik dengan portofolio Anda`,
                        });
                      }
                    }}
                  >
                    <Icon className="size-5" />
                  </a>
                </Button>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Kolom foto profil */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
            delay: 0.15,
          }}
          className="relative mx-auto w-full max-w-sm lg:max-w-md"
        >
          {/* Cincin gradasi berputar + bingkai foto profil */}
          <div
            aria-hidden
            className="absolute -inset-7 -z-10 animate-spin-slow rounded-[2.75rem] bg-[conic-gradient(from_0deg,rgba(168,85,247,0.35),rgba(217,70,239,0.2),rgba(251,146,60,0.35),rgba(168,85,247,0.35))] opacity-60 blur-xl"
          />

          <div className="relative rotate-1 rounded-[2rem] border border-purple-500/25 bg-card/80 p-2.5 shadow-2xl shadow-purple-500/15 backdrop-blur">
            <SafeImage
              src={profile.avatar}
              alt={`Foto profil ${profile.name}`}
              className="aspect-square w-full rounded-[1.6rem] object-cover"
              fallbackClassName="aspect-square rounded-[1.6rem]"
              fallbackIcon={
                <span className="text-5xl font-bold text-purple-600/40 dark:text-purple-400/30">
                  {profile.monogram}
                </span>
              }
            />
          </div>

          {/* Kartu Freshgraduate */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-5 -right-3 flex items-center gap-3 rounded-2xl border border-border/70 bg-card/90 px-4 py-3 shadow-xl backdrop-blur sm:-right-6"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
              <Award className="size-5" />
            </span>

            <span>
              <span className="block text-sm font-bold leading-tight">
                Freshgraduate
              </span>
            </span>
          </motion.div>

          {/* Kartu jumlah proyek selesai */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute -bottom-6 -left-3 flex items-center gap-3 rounded-2xl border border-border/70 bg-card/90 px-4 py-3 shadow-xl backdrop-blur sm:-left-6"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-orange-400/15 text-orange-600 dark:text-orange-400">
              <FolderCheck className="size-5" />
            </span>

            <span>
              <span className="block text-sm font-bold leading-tight">
                {projectCount}+ Proyek
              </span>

              <span className="block text-xs text-muted-foreground">
                Selesai
              </span>
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

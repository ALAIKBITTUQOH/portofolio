"use client";

import { ArrowUp, Github, Instagram, Linkedin, Mail, type LucideIcon } from "lucide-react";

import { profile, type SocialLink } from "@/config/profile";
import { openEmailCompose } from "@/lib/email";
import { Button } from "@/components/ui/button";

const SOCIAL_ICONS: Record<SocialLink["icon"], LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  mail: Mail,
};

const QUICK_LINKS = [
  { href: "#beranda", label: "Beranda" },
  { href: "#tentang", label: "Tentang" },
  { href: "#keahlian", label: "Keahlian" },
  { href: "#proyek", label: "Proyek" },
  { href: "#kontak", label: "Kontak" },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-card/40">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a
              href="#beranda"
              aria-label="Kembali ke beranda"
              className="flex items-center gap-2.5"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-sm font-bold text-white shadow-md shadow-purple-500/25 dark:from-violet-400 dark:to-fuchsia-500 dark:text-purple-950">
                {profile.monogram}
              </span>
              <span className="font-semibold tracking-tight">{profile.name}</span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Lulusan S1 Informatika yang memiliki minat dalam pengembangan website, aplikasi, dan teknologi informasi. Siap terus belajar, mengembangkan kemampuan, serta berkontribusi melalui solusi teknologi yang bermanfaat.
            </p>
          </div>

          {/* Tautan cepat */}
          <nav aria-label="Tautan footer">
            <p className="mb-4 text-sm font-semibold">Tautan Cepat</p>
            <ul className="flex flex-col gap-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-all hover:translate-x-0.5 hover:text-purple-600 dark:hover:text-purple-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sosial + ke atas */}
          <div>
            <p className="mb-4 text-sm font-semibold">Ikuti Saya</p>
            <div className="flex items-center gap-2">
              {profile.socials.map((social) => {
                const Icon = SOCIAL_ICONS[social.icon];
                return (
                  <Button
                    key={social.label}
                    variant="outline"
                    size="icon"
                    className="size-10 rounded-xl transition-all hover:-translate-y-0.5 hover:border-purple-500/50 hover:text-purple-600 hover:shadow-md hover:shadow-purple-500/15 dark:hover:text-purple-400"
                    asChild
                  >
                    <a
                      href={social.href}
                      target={social.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      aria-label={social.label}
                      onClick={(event) => {
                        // Email: buka aplikasi Gmail (HP) / Gmail web (laptop).
                        if (social.icon === "mail") {
                          event.preventDefault();
                          openEmailCompose({
                            to: profile.email,
                            subject: `Halo ${profile.name}, saya tertarik dengan portofolio Anda`,
                          });
                        }
                      }}
                    >
                      <Icon className="size-4" />
                    </a>
                  </Button>
                );
              })}
            </div>
            <Button variant="ghost" size="sm" className="mt-4 gap-2" asChild>
              <a href="#beranda">
                <ArrowUp className="size-4" />
                Kembali ke Atas
              </a>
            </Button>
          </div>
        </div>

        {/* Copyright — aman untuk safe area bawah (notch/home indicator) */}
        <div className="flex flex-col items-center justify-between gap-2 border-t border-border/60 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
          <p>
            © 2025 {profile.name}. Dibuat dengan{" "}
            <span role="img" aria-label="cinta">
              ❤️
            </span>{" "}
            menggunakan Next.js
          </p>
          <p>Next.js · TypeScript · Tailwind CSS · shadcn/ui</p>
        </div>
      </div>
    </footer>
  );
}

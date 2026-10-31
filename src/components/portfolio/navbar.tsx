
"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { profile } from "@/config/profile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "#beranda", label: "Beranda" },
  { href: "#tentang", label: "Tentang" },
  { href: "#keahlian", label: "Keahlian" },
  { href: "#proyek", label: "Proyek" },
  { href: "#kontak", label: "Kontak" },
] as const;

// Sesuaikan jika tinggi navbar berubah.
const NAVBAR_OFFSET = 10;

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();

  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("beranda");
  const [menuOpen, setMenuOpen] = useState(false);

  // Efek tampilan navbar ketika halaman di-scroll.
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Menandai menu berdasarkan section yang sedang terlihat.
  useEffect(() => {
    const sections = NAV_LINKS.map((link) =>
      document.getElementById(link.href.slice(1))
    ).filter((element): element is HTMLElement => Boolean(element));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );

        if (visibleSections.length > 0) {
          setActiveSection(visibleSections[0].target.id);
        }
      },
      {
        // Area tengah viewport digunakan untuk menentukan menu aktif.
        rootMargin: "-20% 0px -65% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  // Scroll menuju section dengan memperhitungkan tinggi navbar.
  const handleNavClick = useCallback(
    (
      event: React.MouseEvent<HTMLAnchorElement>,
      href: string
    ) => {
      event.preventDefault();

      const sectionId = href.slice(1);
      const section = document.getElementById(sectionId);

      setMenuOpen(false);

      if (!section) return;

      const sectionTop =
        section.getBoundingClientRect().top + window.scrollY;

      const targetPosition = Math.max(
        0,
        sectionTop - NAVBAR_OFFSET
      );

      window.history.replaceState(null, "", href);

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });

      setActiveSection(sectionId);
    },
    []
  );

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors duration-300",
        scrolled
          ? "border-border/60 bg-background/90 shadow-sm backdrop-blur-xl"
          : "border-border/40 bg-background/80 backdrop-blur-xl"
      )}
    >
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        {/* Logo dan nama */}
        <a
          href="#beranda"
          aria-label="Kembali ke beranda"
          onClick={(event) => handleNavClick(event, "#beranda")}
          className="flex min-h-11 items-center gap-2.5"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-md shadow-emerald-500/20 dark:from-emerald-400 dark:to-teal-500 dark:text-emerald-950">
            {profile.monogram}
          </span>

          <span className="hidden font-semibold tracking-tight sm:block">
            {profile.name}
          </span>
        </a>

        {/* Navigasi desktop */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive =
              activeSection === link.href.slice(1);

            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(event) =>
                    handleNavClick(event, link.href)
                  }
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Tombol tema dan navigasi mobile */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-10"
            aria-label="Ganti tema terang/gelap"
            onClick={toggleTheme}
          >
            <Sun className="size-5 dark:hidden" />
            <Moon className="hidden size-5 dark:block" />
          </Button>

          {/* Tombol kontak desktop */}
          <Button asChild className="hidden h-10 px-5 lg:inline-flex">
            <a
              href="#kontak"
              onClick={(event) =>
                handleNavClick(event, "#kontak")
              }
            >
              Hubungi Saya
            </a>
          </Button>

          {/* Navigasi mobile */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 lg:hidden"
                aria-label="Buka menu navigasi"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white dark:from-emerald-400 dark:to-teal-500 dark:text-emerald-950">
                    {profile.monogram}
                  </span>

                  {profile.name}
                </SheetTitle>

                <SheetDescription>
                  Navigasi portofolio
                </SheetDescription>
              </SheetHeader>

              <nav
                aria-label="Navigasi seluler"
                className="flex flex-col gap-1 px-4"
              >
                {NAV_LINKS.map((link) => {
                  const isActive =
                    activeSection === link.href.slice(1);

                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(event) =>
                        handleNavClick(event, link.href)
                      }
                      aria-current={
                        isActive ? "location" : undefined
                      }
                      className={cn(
                        "flex h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors hover:bg-accent",
                        isActive &&
                          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      )}
                    >
                      {link.label}
                    </a>
                  );
                })}

                <Button asChild className="mt-3 h-11">
                  <a
                    href="#kontak"
                    onClick={(event) =>
                      handleNavClick(event, "#kontak")
                    }
                  >
                    Hubungi Saya
                  </a>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  );
}

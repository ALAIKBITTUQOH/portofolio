import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/portfolio/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { profile } from "@/config/profile";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `Portofolio — ${profile.name}`,
  description:
    "Portofolio pribadi full-stack developer: proyek web & mobile, keahlian, dan kontak. Terbuka untuk kesempatan kerja dan kolaborasi.",
  keywords: [
    "portofolio",
    "full-stack developer",
    "web developer",
    "mobile developer",
    "Next.js",
    "React",
    "Indonesia",
  ],
  authors: [{ name: profile.name }],
  openGraph: {
    title: `Portofolio — ${profile.name}`,
    description:
      "Full-Stack Developer | Web & Mobile — lihat proyek, keahlian, dan hubungi saya.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

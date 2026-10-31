
/**
 * Konfigurasi profil pemilik portofolio.
 * Ganti nilai di file ini untuk menyesuaikan seluruh konten situs
 * (nama, kontak, sosial media, keahlian, dan kategori proyek).
 */

export interface SocialLink {
  label: string;
  href: string;
  icon: "github" | "linkedin" | "instagram" | "mail";
}

export const profile = {
  /** Nama lengkap — tampil di hero, navbar, footer, dan metadata */
  name: "Alaik Bittuqoh",

  /** Inisial untuk logo/monogram di navbar */
  monogram: "AB",

  roleLine: "Full-Stack Developer | Web & Mobile",

  tagline:
    "Saya membangun aplikasi web & mobile yang cepat, rapi, dan berdampak — dari ide, desain, hingga rilis. Saat ini saya terbuka untuk kesempatan kerja full-time maupun kontrak.",

  location: "Jakarta, Indonesia",

  email: "halo@namadev.id",

  whatsappDisplay: "+62 812-3456-7890",

  whatsappLink: "https://wa.me/6281234567890",

  education: "S1 Teknik Informatika",

  availability: "Terbuka untuk kerja",

  avatar: "/images/projects/Profile.png",

  socials: [
    {
      label: "GitHub",
      href: "https://github.com/username",
      icon: "github",
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/username",
      icon: "linkedin",
    },
    {
      label: "Instagram",
      href: "https://instagram.com/username",
      icon: "instagram",
    },
    {
      label: "Email",
      href: "mailto:halo@namadev.id",
      icon: "mail",
    },
  ] satisfies SocialLink[],
};

/** Paragraf pada bagian Tentang Saya. */
export const aboutParagraphs = [
  `Halo! Saya ${profile.name}, seorang full-stack developer yang berbasis di ${profile.location}. Saya senang mengubah ide menjadi produk digital yang nyata — mulai dari merancang antarmuka yang enak dipakai, membangun API yang andal, hingga mengurus deployment.`,

  "Sebagai fresh graduate Teknik Informatika dengan 3+ tahun pengalaman membangun proyek nyata, saya terbiasa bekerja dengan React, Next.js, Node.js, dan berbagai tool modern. Saya percaya kode yang baik adalah kode yang mudah dibaca, dipelihara, dan dikembangkan bersama tim.",

  "Saat ini saya sedang mencari kesempatan kerja — full-time, kontrak, maupun proyek lepas. Jika Anda mencari developer yang antusias, cepat belajar, dan tidak takut tantangan baru, mari terhubung!",
];

/** Teknologi yang ditampilkan pada bagian Tentang Saya. */
export const aboutHighlights = [
  "React",
  "Next.js",
  "Node.js",
  "TypeScript",
  "PostgreSQL",
  "Tailwind CSS",
];

export interface SkillGroup {
  title: string;
  icon: "monitor" | "smartphone" | "wrench";
  /** Tingkat penguasaan 0-100 untuk progress bar. */
  level?: number;
}

export const skillGroups: SkillGroup[] = [
  {
    title: "Frontend & Backend",
    icon: "monitor",
  },
  {
    title: "Microsoft Office",
    icon: "smartphone",
  },
  {
    title: "Tools & Lainnya",
    icon: "wrench",
  },
];

/**
 * Kategori utama untuk filter proyek portofolio.
 */
export const PROJECT_CATEGORIES = [
  "Web App",
  "Mobile App",
  "Game App",
  "Microsoft Office",
] as const;

/** Tipe kategori utama yang tersedia. */
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

/**
 * Daftar subkategori berdasarkan kategori utama.
 * Digunakan pada form tambah/edit proyek dan filter portofolio.
 */
export const PROJECT_SUBCATEGORIES: Record<ProjectCategory, string[]> = {
  "Web App": [],

  "Mobile App": [],

  "Game App": [],

  "Microsoft Office": [
    "Microsoft Word",
    "Microsoft Excel",
    "Microsoft PowerPoint",
    "Microsoft Access",
    "Microsoft Outlook",
    "PDF",
  ],
};

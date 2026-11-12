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

  roleLine: "Informatika Graduate | Aspiring Full-Stack Developer",

  tagline:
    "Saya adalah lulusan S1 Informatika yang memiliki minat di bidang pengembangan website, aplikasi, dan teknologi informasi. Memiliki pengalaman dalam membangun proyek aplikasi berbasis web dan game edukasi, serta praktik langsung di bidang jaringan komputer. Didukung sertifikasi BNSP Junior Cyber Security, saya memiliki semangat untuk terus belajar, mengembangkan keterampilan, dan berkontribusi melalui solusi teknologi yang inovatif. Saat ini, saya terbuka untuk kesempatan kerja full-time maupun kontrak.",

  location: "Porong, Sidoarjo",

  email: "alaikbittuqoh@gmail.com",

  whatsappDisplay: "+62 895-1897-3236",

  whatsappLink: "https://wa.me/6289518973236",

  education: "S1 Informatika",

  availability: "Terbuka untuk kerja",

  avatar: "/images/projects/Profile.png",

  
  socials: [
    {
      label: "GitHub",
      href: "https://github.com/ALAIKBITTUQOH",
      icon: "github",
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/alaik-bittuqoh-68b2b9259/",
      icon: "linkedin",
    },
    {
      label: "Instagram",
      href: "https://instagram.com/alaik_bittuqoh",
      icon: "instagram",
    },
    {
      label: "Email",
      href: `mailto:alaikbittuqoh@gmail.com`,
      icon: "mail",
    },
  ] satisfies SocialLink[],

};

/** Paragraf pada bagian Tentang Saya. */
export const aboutParagraphs = [
  `Halo! Saya Alaik Bittuqoh, lulusan S1 Informatika dari Universitas Nahdlatul Ulama Sidoarjo yang berdomisili di Porong, Sidoarjo. Saya memiliki ketertarikan pada bidang pengembangan website, aplikasi, dan teknologi informasi.`,

  "Selama masa perkuliahan, saya telah mengembangkan beberapa proyek akademik, di antaranya website portofolio pribadi dan game edukasi pengenalan kendaraan untuk anak usia 2–4 tahun menggunakan Unity. Saya juga memiliki pengalaman Praktik Kerja Lapangan di RSUD R.T. Notopuro Sidoarjo, dengan kegiatan yang berfokus pada simulasi, instalasi, dan pengujian jaringan komputer. Selain itu, saya memiliki sertifikasi kompetensi BNSP di bidang Keamanan Siber Muda (Junior Cyber Security).",

  "Saya merupakan pribadi yang teliti, bertanggung jawab, mampu bekerja secara mandiri maupun dalam tim, serta memiliki semangat untuk terus belajar dan mengembangkan keterampilan. Saat ini, saya terbuka terhadap kesempatan kerja full-time maupun kontrak untuk mengembangkan potensi dan memberikan kontribusi positif di lingkungan kerja profesional.",
];

/** Teknologi yang ditampilkan pada bagian Tentang Saya. */
export const aboutHighlights = [
  "HTML",
  "Java Script",
  "Next.js",
  "Node.js",
  "TypeScript",
  "Tailwind CSS",
];

export interface SkillGroup {
  title: string;
  icon: "monitor" | "smartphone" | "wrench" | "office";
  /** Daftar keahlian/teknologi yang ditampilkan sebagai badge. */
  skills: string[];
  /** Tingkat penguasaan 0-100 untuk progress bar. */
  level?: number;
}

export const skillGroups: SkillGroup[] = [
  {
    title: "Frontend & Backend",
    icon: "monitor",
    skills: [
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "Next.js",
      "Node.js",
      "Tailwind CSS",
    ],
  },
  {
    title: "Microsoft Office",
    icon: "office",
    skills: [
      "Microsoft Word",
      "Microsoft Excel",
      "Microsoft PowerPoint",
      "PDF",
    ],
  },
  {
    title: "Tools & Lainnya",
    icon: "wrench",
    skills: [
      "Git & GitHub",
      "Unity",
      "AI Agent",
      "Visual Studio Code",
      "Cisco Packet Tracer",
    ],
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
    "PDF",
  ],
};

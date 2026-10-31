import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const demoProjects = [
  {
    title: "Kulineran — E-Commerce Fashion Lokal",
    description:
      "Platform e-commerce lengkap untuk brand fashion lokal dengan katalog produk, keranjang belanja, pembayaran online (Midtrans), dan dashboard admin untuk manajemen stok. Melayani 1.000+ pengguna aktif per bulan.",
    category: "Web App",
    techStack: "Next.js, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Midtrans",
    imageUrl: "/images/projects/ecommerce.png",
    projectUrl: "https://example.com/kulineran",
    repoUrl: "https://github.com/username/kulineran",
    year: "2024",
    status: "Selesai",
    featured: true,
  },
  {
    title: "DuitTrack — Aplikasi Keuangan Pribadi",
    description:
      "Aplikasi mobile pencatat keuangan pribadi dengan visualisasi grafik pengeluaran, kategori otomatis, dan pengingat tagihan. Menggunakan offline-first sync agar data tetap tersimpan tanpa internet.",
    category: "Mobile App",
    techStack: "React Native, Expo, Zustand, SQLite, Recharts",
    imageUrl: "/images/projects/fintech.png",
    projectUrl: "",
    repoUrl: "https://github.com/username/duittrack",
    year: "2024",
    status: "Selesai",
    featured: true,
  },
  {
    title: "TanyaAI — Chatbot Layanan Pelanggan",
    description:
      "Chatbot berbasis kecerdasan buatan untuk menjawab pertanyaan pelanggan secara otomatis 24/7. Terintegrasi dengan knowledge base perusahaan dan dapat meningkatkan respons cepat hingga 80%.",
    category: "AI & Machine Learning",
    techStack: "Next.js, OpenAI API, LangChain, Redis, Docker",
    imageUrl: "/images/projects/chatbot.png",
    projectUrl: "https://example.com/tanyaai",
    repoUrl: "",
    year: "2025",
    status: "Berjalan",
    featured: true,
  },
  {
    title: "TugasFlow — Manajemen Proyek Tim",
    description:
      "Aplikasi manajemen proyek bergaya Kanban untuk kolaborasi tim dengan fitur drag-and-drop, komentar real-time, dan laporan progres mingguan. Dipakai oleh 3 tim startup dalam operasional harian.",
    category: "Web App",
    techStack: "React, dnd-kit, Socket.io, Node.js, MongoDB",
    imageUrl: "/images/projects/taskmanager.png",
    projectUrl: "https://example.com/tugasflow",
    repoUrl: "https://github.com/username/tugasflow",
    year: "2023",
    status: "Selesai",
    featured: false,
  },
  {
    title: "JelajahBali — Portal Booking Wisata",
    description:
      "Landing page dan sistem booking wisata Bali dengan pencarian destinasi, filter harga, integrasi Google Maps, dan SEO-friendly. Mampu mendatangkan 5.000+ pengunjung organik per bulan.",
    category: "Landing Page",
    techStack: "Next.js, Tailwind CSS, Google Maps API, Vercel",
    imageUrl: "/images/projects/travel.png",
    projectUrl: "https://example.com/jelajahbali",
    repoUrl: "",
    year: "2023",
    status: "Selesai",
    featured: false,
  },
  {
    title: "MakanKilat — Aplikasi Pesan Antar Makanan",
    description:
      "Aplikasi pemesanan makanan dengan pelacakan kurir real-time, sistem rating restoran, dan promosi kupon. Proyek akhir bootcamp yang meraih juara 2 demo day dari 40 tim.",
    category: "Mobile App",
    techStack: "Flutter, Firebase, Google Maps API, Provider",
    imageUrl: "/images/projects/foodapp.png",
    projectUrl: "",
    repoUrl: "https://github.com/username/makankilat",
    year: "2022",
    status: "Selesai",
    featured: false,
  },
];

async function main() {
  const count = await prisma.project.count();
  if (count > 0) {
    console.log(`Database already has ${count} projects. Skipping seed.`);
    return;
  }
  for (const p of demoProjects) {
    await prisma.project.create({ data: p });
  }
  console.log(`Seeded ${demoProjects.length} demo projects.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

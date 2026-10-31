
/**
 * Tipe data bersama untuk seluruh aplikasi portofolio.
 * Kontrak mengikuti API /api/projects.
 */

import {
  PROJECT_CATEGORIES,
  type ProjectCategory,
} from "@/config/profile";

/** Data proyek yang dikembalikan oleh API. */
export interface Project {
  id: string;
  title: string;
  description: string;

  /** Kategori utama proyek. */
  category: ProjectCategory;

  /** Subkategori proyek, misalnya Frontend, Unity, atau Microsoft Excel. */
  subcategory: string;

  /** String dipisah koma, contoh: "Next.js, TypeScript, Tailwind CSS". */
  techStack: string;

  /** Gambar proyek: URL gambar atau data URL. */
  imageUrl: string;

  /** URL atau data URL dokumen untuk kategori Microsoft Office. */
  documentUrl?: string;

  /** Nama asli file dokumen yang diunggah. */
  documentName?: string;

  /** Link demo live, boleh kosong. */
  projectUrl: string;

  /** Link repositori GitHub, boleh kosong. */
  repoUrl: string;

  /** Tahun proyek, contoh: "2024". */
  year: string;

  /** Status proyek. */
  status: ProjectStatus;

  /** Apakah proyek ditampilkan sebagai unggulan. */
  featured: boolean;

  createdAt: string;
  updatedAt: string;
}

/** Nilai form tambah/edit proyek sesuai kontrak POST/PUT API. */
export interface ProjectFormValues {
  title: string;
  description: string;
  category: ProjectCategory;
  subcategory: string;
  techStack: string;
  imageUrl: string;
  documentUrl?: string;
  documentName?: string;
  projectUrl: string;
  repoUrl: string;
  year: string;
  status: ProjectStatus;
  featured: boolean;
}

/** Kategori utama diambil dari konfigurasi profil. */
export { PROJECT_CATEGORIES };
export type { ProjectCategory };

/** Status proyek yang dikenal UI. */
export const PROJECT_STATUSES = ["Selesai", "Berjalan"] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

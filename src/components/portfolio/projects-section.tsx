"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpDown,
  FolderOpen,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  SearchX,
} from "lucide-react";
import { toast } from "sonner";

import type { Project, ProjectFormValues } from "@/lib/types";
import {
  PROJECT_CATEGORIES,
  PROJECT_SUBCATEGORIES,
  type ProjectCategory,
} from "@/config/profile";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SectionHeading } from "./section-heading";
import { ProjectCard } from "./project-card";
import { ProjectDialog } from "./project-dialog";
import { fadeUp, viewportOnce } from "./animations";

interface ProjectsSectionProps {
  projects: Project[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onCreate: (values: ProjectFormValues) => Promise<unknown>;
  onUpdate: (
    id: string,
    values: ProjectFormValues
  ) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}

type SortOption = "default" | "year" | "title";

const CATEGORIES = ["Semua", ...PROJECT_CATEGORIES];

function ProjectCardSkeleton() {
  return (
    <Card className="h-full gap-0 overflow-hidden rounded-2xl p-0">
      <Skeleton className="aspect-video w-full rounded-none" />

      <CardContent className="flex flex-col gap-3 p-5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />

        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-md" />
        </div>

        <Skeleton className="mt-2 h-8 w-full" />
      </CardContent>
    </Card>
  );
}

export function ProjectsSection({
  projects,
  loading,
  error,
  onRetry,
  onCreate,
  onUpdate,
  onDelete,
}: ProjectsSectionProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [subcategory, setSubcategory] = useState("Semua");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] =
    useState<Project | null>(null);
  const [pendingDelete, setPendingDelete] =
    useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const availableSubcategories =
    category !== "Semua" &&
    Object.prototype.hasOwnProperty.call(
      PROJECT_SUBCATEGORIES,
      category
    )
      ? PROJECT_SUBCATEGORIES[category as ProjectCategory]
      : [];

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    const normalizeText = (value: string | undefined | null) =>
      (value ?? "").normalize("NFKD").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");

    const normalizeCategory = (value: string) => ({
      "web dev": "Web App",
      "web app": "Web App",
      "mobile dev": "Mobile App",
      "mobile app": "Mobile App",
      "game dev": "Game App",
      "game app": "Game App",
      "microsoft office": "Microsoft Office",
    } as Record<string, string>)[normalizeText(value)] ?? value;

    const inferOfficeSubcategory = (project: Project) => {
      const explicit = normalizeText(project.subcategory);
      const fileInfo = normalizeText([
        project.documentName,
        project.documentUrl,
        project.imageUrl,
        project.title,
        project.description,
        project.techStack,
      ].filter(Boolean).join(" "));
      const allInfo = `${explicit} ${fileInfo}`;
      if (/\b(word|doc|docx)\b|wordprocessingml|msword/.test(allInfo) || /\.docx?(?:[?#\s]|$)/i.test(allInfo)) return "Microsoft Word";
      if (/\b(excel|xlsx?|spreadsheet)\b|spreadsheetml/.test(allInfo) || /\.xlsx?(?:[?#\s]|$)/i.test(allInfo)) return "Microsoft Excel";
      if (/powerpoint|presentationml|\bpptx?\b/.test(allInfo) || /\.pptx?(?:[?#\s]|$)/i.test(allInfo)) return "Microsoft PowerPoint";
      if (/\b(access|accdb|mdb)\b/.test(allInfo) || /\.(accdb|mdb)(?:[?#\s]|$)/i.test(allInfo)) return "Microsoft Access";
      if (/outlook|\.msg(?:[?#\s]|$)|\.eml(?:[?#\s]|$)/i.test(allInfo)) return "Microsoft Outlook";
      if (/\bpdf\b|application\/pdf|\.pdf(?:[?#\s]|$)/i.test(allInfo)) return "PDF";
      return "";
    };

    const filtered = projects.filter((project) => {
      const matchCategory =
        category === "Semua" ||
        normalizeCategory(project.category) === category;

      const selectedSubcategory = normalizeText(subcategory);
      const storedSubcategory = normalizeText(project.subcategory);
      const inferredSubcategory = inferOfficeSubcategory(project);
      const matchSubcategory =
        subcategory === "Semua" ||
        storedSubcategory === selectedSubcategory ||
        normalizeText(inferredSubcategory) === selectedSubcategory ||
        (category === "Microsoft Office" && inferredSubcategory === subcategory);

      const matchSearch =
        query === "" ||
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.category.toLowerCase().includes(query) ||
        (project.subcategory ?? "").toLowerCase().includes(query) ||
        project.techStack.toLowerCase().includes(query);

      return (
        matchCategory &&
        matchSubcategory &&
        matchSearch
      );
    });

    if (sortBy === "year") {
      return [...filtered].sort(
        (a, b) =>
          Number(b.year || 0) - Number(a.year || 0)
      );
    }

    if (sortBy === "title") {
      return [...filtered].sort((a, b) =>
        a.title.localeCompare(b.title, "id")
      );
    }

    return filtered;
  }, [projects, search, category, subcategory, sortBy]);

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setSubcategory("Semua");
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("Semua");
    setSubcategory("Semua");
    setSortBy("default");
  };

  const openCreate = () => {
    setEditingProject(null);
    setDialogOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setDialogOpen(true);
  };

  const handleSave = async (values: ProjectFormValues) => {
    try {
      if (editingProject) {
        await onUpdate(editingProject.id, values);
        toast.success("Perubahan berhasil disimpan");
      } else {
        await onCreate(values);
        toast.success("Proyek berhasil ditambahkan");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan"
      );

      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;

    setDeleting(true);

    try {
      await onDelete(pendingDelete.id);
      toast.success("Proyek berhasil dihapus");
      setPendingDelete(null);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Gagal menghapus proyek"
      );
    } finally {
      setDeleting(false);
    }
  };

  const hasActiveFilter =
    search.trim() !== "" ||
    category !== "Semua" ||
    subcategory !== "Semua";

  return (
    <section
      id="proyek"
      className="scroll-mt-20 py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading
              align="left"
              kicker="Proyek"
              title={
                <>
                  Proyek <span className="text-gradient">Pilihan</span>
                </>
              }
              description="Kumpulan karya yang pernah saya bangun — mulai dari web app, mobile app, hingga eksperimen AI."
              className="max-w-xl"
            />

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <Button
                size="lg"
                className="h-11 gap-2 shadow-lg shadow-emerald-500/20"
                onClick={openCreate}
              >
                <Plus className="size-4" />
                Tambah Proyek
              </Button>
            </motion.div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Cari judul, deskripsi, kategori, atau teknologi..."
                  aria-label="Cari proyek"
                  className="h-11 pl-9"
                />
              </div>

              <Select
                value={sortBy}
                onValueChange={(value) =>
                  setSortBy(value as SortOption)
                }
              >
                <SelectTrigger
                  className="h-11 w-full gap-2 sm:w-48"
                  aria-label="Urutkan proyek"
                >
                  <ArrowUpDown className="size-4 text-muted-foreground" />
                  <SelectValue placeholder="Urutkan proyek" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="default">
                    Urutan Standar
                  </SelectItem>
                  <SelectItem value="year">
                    Tahun Terbaru
                  </SelectItem>
                  <SelectItem value="title">
                    Judul A–Z
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div
              role="group"
              aria-label="Filter kategori"
              className="flex flex-wrap items-center gap-2"
            >
              {CATEGORIES.map((item) => {
                const active = category === item;

                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={active}
                    onClick={() => handleCategoryChange(item)}
                    className={`inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-all ${
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-md shadow-emerald-500/20"
                        : "border-border bg-card text-muted-foreground hover:border-emerald-500/40 hover:text-foreground"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            {/* Subkategori sesuai kategori utama */}
            {category !== "Semua" &&
              availableSubcategories.length > 0 && (
                <div className="mt-5 border-t border-border pt-6">
                  <h3 className="mb-5 text-base font-semibold">
                    SUBKATEGORI — {category}
                  </h3>

                  <div
                    role="group"
                    aria-label={`Filter subkategori ${category}`}
                    className="flex flex-wrap items-center gap-3"
                  >
                    {["Semua", ...availableSubcategories].map((item) => {
                      const active = subcategory === item;

                      return (
                        <button
                          key={item}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setSubcategory(item)}
                          className={`inline-flex min-h-10 items-center justify-center rounded-full border px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                          active
                            ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                            : "border-border bg-transparent text-muted-foreground hover:border-emerald-500 hover:text-emerald-600"
                        }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <ProjectCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <Card className="rounded-2xl border-destructive/30">
              <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <RefreshCw className="size-6" />
                </span>

                <div>
                  <p className="font-semibold">
                    Gagal memuat proyek
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {error}
                  </p>
                </div>

                <Button onClick={onRetry} className="gap-2">
                  <RefreshCw className="size-4" />
                  Coba Lagi
                </Button>
              </CardContent>
            </Card>
          ) : projects.length === 0 ? (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <Card className="rounded-3xl border-dashed">
                <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
                  <span className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/15 to-amber-400/15 text-emerald-600 dark:text-emerald-400">
                    <FolderOpen className="size-9" />
                  </span>

                  <div>
                    <p className="text-lg font-semibold">
                      Belum ada proyek
                    </p>
                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                      Tampilkan karya terbaik Anda — tambahkan
                      proyek pertama untuk melengkapi portofolio.
                    </p>
                  </div>

                  <Button onClick={openCreate} className="gap-2">
                    <Plus className="size-4" />
                    Tambah Proyek Pertama
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : filteredProjects.length === 0 ? (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <Card className="rounded-3xl border-dashed">
                <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
                  <span className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/15 to-amber-400/15 text-emerald-600 dark:text-emerald-400">
                    <SearchX className="size-9" />
                  </span>

                  <div>
                    <p className="text-lg font-semibold">
                      Tidak ada proyek yang cocok
                    </p>
                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                      Coba kata kunci lain atau atur ulang filter
                      kategori dan subkategori.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="gap-2"
                  >
                    <RefreshCw className="size-4" />
                    Atur Ulang Filter
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  onEdit={openEdit}
                  onRequestDelete={setPendingDelete}
                />
              ))}
            </div>
          )}

          {hasActiveFilter &&
            !loading &&
            !error &&
            filteredProjects.length > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                Menampilkan {filteredProjects.length} dari{" "}
                {projects.length} proyek
              </p>
            )}
        </div>
      </div>

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={editingProject}
        onSave={handleSave}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setPendingDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Hapus proyek ini?
            </AlertDialogTitle>

            <AlertDialogDescription>
              Proyek &quot;{pendingDelete?.title}&quot; akan
              dihapus permanen. Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Batal
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleDeleteConfirm();
              }}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
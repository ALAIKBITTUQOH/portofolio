
"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FileText,
  FileSpreadsheet,
  FileType2,
  Presentation,
  FileArchive,
  ImagePlus,
  Link2,
  Loader2,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import type { Project, ProjectFormValues } from "@/lib/types";
import {
  PROJECT_CATEGORIES,
  PROJECT_SUBCATEGORIES,
} from "@/config/profile";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const YEAR_OPTIONS = Array.from({ length: 7 }, (_, i) =>
  String(new Date().getFullYear() - i)
);

const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const OFFICE_CATEGORY = "Microsoft Office";

const OFFICE_FILE_ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.accdb,.mdb,.odt,.ods,.odp,.txt";

const projectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Judul wajib diisi")
    .max(120, "Judul maksimal 120 karakter"),

  description: z
    .string()
    .trim()
    .min(1, "Deskripsi wajib diisi")
    .max(2000, "Deskripsi maksimal 2000 karakter"),

  category: z.string().trim().min(1, "Pilih atau tulis kategori utama"),

  subcategory: z.string().trim(),

  techStack: z.string().trim().max(300, "Tech stack maksimal 300 karakter"),

  imageUrl: z.string(),
  documentName: z.string().optional().default(""),
  documentUrl: z.string().optional().default(""),

  projectUrl: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^https?:\/\/\S+$/i.test(value),
      {
        message: "Masukkan URL valid yang diawali http:// atau https://",
      }
    ),

  repoUrl: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^https?:\/\/\S+$/i.test(value),
      {
        message: "Masukkan URL valid yang diawali http:// atau https://",
      }
    ),

  year: z.string().min(1, "Pilih tahun proyek"),

  status: z.enum(["Selesai", "Berjalan"]),

  featured: z.boolean(),
}).superRefine((values, context) => {
  if (values.category === OFFICE_CATEGORY && !values.subcategory.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["subcategory"],
      message: "Pilih subkategori Microsoft Office",
    });
  }
});

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onSave: (values: ProjectFormValues) => Promise<void>;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Gagal membaca file"));

    reader.readAsDataURL(file);
  });
}

function compressImage(
  dataUrl: string,
  maxWidth: number,
  quality: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");

      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));

      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Canvas tidak tersedia"));
        return;
      }

      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.onerror = () => reject(new Error("Gagal memuat gambar"));
    img.src = dataUrl;
  });
}

function approxBytes(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.round(base64.length * 0.75);
}

function isPresetCategory(category: string): boolean {
  return (PROJECT_CATEGORIES as readonly string[]).includes(category);
}

function getSubcategories(category: string): string[] {
  if (!isPresetCategory(category)) return [];

  return (
    PROJECT_SUBCATEGORIES[
      category as keyof typeof PROJECT_SUBCATEGORIES
    ] ?? []
  );
}

function isOfficeCategory(category: string): boolean {
  return category === OFFICE_CATEGORY;
}

function getOfficeFileMeta(fileName = "", dataUrl = ""): {
  label: string;
  color: string;
  Icon: typeof FileText;
} {
  const mime = dataUrl.match(/^data:([^;,]+)/i)?.[1]?.toLowerCase() ?? "";
  const ext = fileName.includes(".")
    ? fileName.split(".").pop()?.toLowerCase() ?? ""
    : "";

  if (["doc", "docx", "odt"].includes(ext) || mime.includes("word") || mime.includes("wordprocessingml")) {
    return { label: "Microsoft Word", color: "#2B579A", Icon: FileText };
  }
  if (["xls", "xlsx", "ods"].includes(ext) || mime.includes("spreadsheet") || mime.includes("excel") || mime.includes("sheet")) {
    return { label: "Microsoft Excel", color: "#217346", Icon: FileSpreadsheet };
  }
  if (["ppt", "pptx", "odp"].includes(ext) || mime.includes("presentation") || mime.includes("powerpoint") || mime.includes("presentationml")) {
    return { label: "Microsoft PowerPoint", color: "#D24726", Icon: Presentation };
  }
  if (["accdb", "mdb"].includes(ext) || mime.includes("access")) {
    return { label: "Microsoft Access", color: "#A4373A", Icon: FileType2 };
  }
  if (ext === "pdf" || mime.includes("pdf")) {
    return { label: "Dokumen PDF", color: "#DC2626", Icon: FileText };
  }
  if (ext === "zip" || mime.includes("zip")) {
    return { label: "Arsip ZIP", color: "#B7791F", Icon: FileArchive };
  }
  if (ext === "txt" || mime.startsWith("text/")) {
    return { label: "Dokumen Teks", color: "#64748B", Icon: FileText };
  }
  return { label: "Dokumen proyek", color: "#64748B", Icon: FileType2 };
}

function getFileNameFromDataUrl(dataUrl: string): string {
  return getOfficeFileMeta("", dataUrl).label;
}

export function ProjectDialog({
  open,
  onOpenChange,
  project,
  onSave,
}: ProjectDialogProps) {
  const [fileTab, setFileTab] = useState("upload");
  const [processingFile, setProcessingFile] = useState(false);
  const [documentName, setDocumentName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Web App",
      subcategory: "",
      techStack: "",
      imageUrl: "",
      documentName: "",
      documentUrl: "",
      projectUrl: "",
      repoUrl: "",
      year: String(new Date().getFullYear()),
      status: "Selesai",
      featured: false,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const category = watch("category") ?? "";
  const subcategory = watch("subcategory") ?? "";
  const imageUrl = watch("imageUrl") ?? "";
  const selectedYear = watch("year") ?? "";
  const selectedStatus = watch("status") ?? "";
  const featured = watch("featured") ?? false;

  const officeCategory = isOfficeCategory(category);
  const availableSubcategories = getSubcategories(category);
  const presetCategory = isPresetCategory(category);

  useEffect(() => {
    if (!open) return;

    const savedCategory = project?.category ?? "Web App";
    const savedSubcategory = project?.subcategory ?? "";

    reset({
      title: project?.title ?? "",
      description: project?.description ?? "",
      category: savedCategory,
      subcategory: isOfficeCategory(savedCategory) ? savedSubcategory : "",
      techStack: project?.techStack ?? "",
      imageUrl: project?.imageUrl ?? "",
      documentName: project?.documentName ?? "",
      documentUrl: project?.documentUrl ?? "",
      projectUrl: project?.projectUrl ?? "",
      repoUrl: project?.repoUrl ?? "",
      year: project?.year || String(new Date().getFullYear()),
      status: project?.status || "Selesai",
      featured: project?.featured ?? false,
    });

    setFileTab("upload");

    setDocumentName(
      isOfficeCategory(savedCategory) && project?.imageUrl
        ? (project.documentName || getFileNameFromDataUrl(project.imageUrl))
        : ""
    );
  }, [open, project, reset]);

  const handleCategoryChange = (value: string) => {
    setValue("category", value, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue("subcategory", "", {
      shouldValidate: true,
      shouldDirty: true,
    });

    // File lama tidak digunakan otomatis pada kategori berbeda.
    setValue("imageUrl", "", {
      shouldValidate: true,
      shouldDirty: true,
    });

    setDocumentName("");
    setValue("documentName", "", { shouldDirty: true });
    setValue("documentUrl", "", { shouldDirty: true });
    setFileTab("upload");
  };

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    // Izinkan memilih file yang sama lagi.
    event.target.value = "";

    if (!file) return;

    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("Ukuran file maksimal 10 MB");
      return;
    }

    if (officeCategory) {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      const allowedExtensions = [
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
        "accdb",
        "mdb",
        "odt",
        "ods",
        "odp",
        "txt",
      ];

      if (!allowedExtensions.includes(extension)) {
        toast.error(
          "Format dokumen tidak didukung. Gunakan PDF, Word, Excel, atau PowerPoint."
        );
        return;
      }

      setProcessingFile(true);

      try {
        const dataUrl = await readFileAsDataUrl(file);

        setValue("imageUrl", dataUrl, {
          shouldDirty: true,
          shouldValidate: true,
        });

        setDocumentName(file.name);
        setValue("documentName", file.name, { shouldDirty: true, shouldValidate: true });
        setValue("documentUrl", "", { shouldDirty: true, shouldValidate: true });
        toast.success("Dokumen berhasil dimuat");
      } catch {
        toast.error("Gagal membaca dokumen");
      } finally {
        setProcessingFile(false);
      }

      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar PNG, JPG, atau WEBP");
      return;
    }

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Format gambar yang didukung: PNG, JPG, dan WEBP");
      return;
    }

    setProcessingFile(true);

    try {
      const raw = await readFileAsDataUrl(file);

      let width = 1200;
      let quality = 0.82;
      let compressed = await compressImage(raw, width, quality);

      while (approxBytes(compressed) > MAX_IMAGE_BYTES && width > 480) {
        width = Math.round(width * 0.8);
        quality = Math.max(0.5, quality - 0.08);
        compressed = await compressImage(compressed, width, quality);
      }

      if (approxBytes(compressed) > MAX_IMAGE_BYTES) {
        toast.error(
          "Gambar masih terlalu besar setelah dikompresi. Coba gambar lain."
        );
        return;
      }

      setValue("imageUrl", compressed, {
        shouldDirty: true,
        shouldValidate: true,
      });

      setDocumentName("");
      setValue("documentName", "", { shouldDirty: true });
      setValue("documentUrl", "", { shouldDirty: true });
      toast.success("Gambar berhasil dimuat dan dikompresi");
    } catch {
      toast.error("Gagal memproses gambar");
    } finally {
      setProcessingFile(false);
    }
  };

  const handleRemoveFile = () => {
    setValue("imageUrl", "", {
      shouldDirty: true,
      shouldValidate: true,
    });

    setDocumentName("");
    setValue("documentName", "", { shouldDirty: true });
    setValue("documentUrl", "", { shouldDirty: true });
  };

  const submit = handleSubmit(async (values) => {
    try {
      await onSave({ ...values, subcategory: officeCategory ? values.subcategory : "" });
      onOpenChange(false);
    } catch {
      // Dialog tetap terbuka jika penyimpanan gagal.
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid max-h-[90dvh] gap-5 overflow-y-auto rounded-2xl pr-5 custom-scrollbar sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {project ? "Edit Proyek" : "Tambah Proyek"}
          </DialogTitle>

          <DialogDescription>
            {project
              ? "Perbarui informasi proyek Anda, lalu simpan perubahan."
              : "Ceritakan proyek terbaik Anda agar recruiter semakin tertarik."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4" noValidate>
          {/* Judul */}
          <div className="grid gap-2">
            <Label htmlFor="project-title">
              Judul <span className="text-destructive">*</span>
            </Label>

            <Input
              id="project-title"
              placeholder="Contoh: Aplikasi Prediksi Harga Berbasis AI"
              aria-invalid={Boolean(errors.title)}
              {...register("title")}
            />

            {errors.title && (
              <p className="text-xs text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Deskripsi */}
          <div className="grid gap-2">
            <Label htmlFor="project-description">
              Deskripsi <span className="text-destructive">*</span>
            </Label>

            <Textarea
              id="project-description"
              placeholder="Jelaskan proyek, teknologi yang digunakan, dan manfaatnya..."
              rows={4}
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />

            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Kategori utama dan subkategori */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="project-category">Kategori utama</Label>

              <Select
                value={presetCategory ? category : "Lainnya"}
                onValueChange={(value) => {
                  if (value === "Lainnya") {
                    handleCategoryChange("");
                  } else {
                    handleCategoryChange(value);
                  }
                }}
              >
                <SelectTrigger
                  id="project-category"
                  className="w-full"
                  aria-invalid={Boolean(errors.category)}
                >
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>

                <SelectContent>
                  {PROJECT_CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}

                  <SelectItem value="Lainnya">
                    Lainnya (tulis manual)
                  </SelectItem>
                </SelectContent>
              </Select>

              {!presetCategory && (
                <Input
                  placeholder="Tulis kategori khusus..."
                  value={category}
                  aria-invalid={Boolean(errors.category)}
                  onChange={(event) => {
                    setValue("category", event.target.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });

                    setValue("subcategory", "", {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                />
              )}

              {errors.category && (
                <p className="text-xs text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>

            {officeCategory && (
<div className="grid gap-2">
              <Label htmlFor="project-subcategory">Subkategori</Label>

              {availableSubcategories.length > 0 ? (
                <Select
                  value={subcategory}
                  onValueChange={(value) =>
                    setValue("subcategory", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger
                    id="project-subcategory"
                    className="w-full"
                    aria-invalid={Boolean(errors.subcategory)}
                  >
                    <SelectValue placeholder="Pilih subkategori" />
                  </SelectTrigger>

                  <SelectContent>
                    {availableSubcategories.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="project-subcategory"
                  placeholder={
                    category
                      ? "Tulis subkategori proyek..."
                      : "Pilih kategori terlebih dahulu"
                  }
                  value={subcategory}
                  disabled={!category}
                  aria-invalid={Boolean(errors.subcategory)}
                  onChange={(event) =>
                    setValue("subcategory", event.target.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                />
              )}

              {errors.subcategory && (
                <p className="text-xs text-destructive">
                  {errors.subcategory.message}
                </p>
              )}
            </div>
            )}
          </div>

          {/* Tahun */}
          <div className="grid gap-2">
            <Label htmlFor="project-year">Tahun</Label>

            <Select
              value={selectedYear}
              onValueChange={(value) =>
                setValue("year", value, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger id="project-year" className="w-full">
                <SelectValue placeholder="Pilih tahun" />
              </SelectTrigger>

              <SelectContent>
                {YEAR_OPTIONS.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.year && (
              <p className="text-xs text-destructive">
                {errors.year.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="grid gap-2">
            <Label htmlFor="project-status">Status</Label>

            <Select
              value={selectedStatus}
              onValueChange={(value) =>
                setValue("status", value as ProjectFormValues["status"], {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger id="project-status" className="w-full">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="Selesai">Selesai</SelectItem>
                <SelectItem value="Berjalan">Berjalan</SelectItem>
              </SelectContent>
            </Select>

            {errors.status && (
              <p className="text-xs text-destructive">
                {errors.status.message}
              </p>
            )}
          </div>

          {/* Tech stack */}
          <div className="grid gap-2">
            <Label htmlFor="project-tech">Tech Stack</Label>

            <Input
              id="project-tech"
              placeholder="Next.js, TypeScript, Tailwind CSS"
              aria-invalid={Boolean(errors.techStack)}
              {...register("techStack")}
            />

            <p className="text-xs text-muted-foreground">
              Pisahkan dengan koma, contoh: Next.js, TypeScript, Tailwind CSS.
            </p>

            {errors.techStack && (
              <p className="text-xs text-destructive">
                {errors.techStack.message}
              </p>
            )}
          </div>

          {/* File proyek: dokumen untuk Microsoft Office, gambar untuk kategori lain */}
          <div className="grid gap-2">
            <Label>
              {officeCategory ? "Dokumen Proyek" : "Gambar Proyek"}
            </Label>

            <Tabs value={fileTab} onValueChange={setFileTab}>
              <TabsList
                className={`grid w-full ${
                  officeCategory ? "grid-cols-1" : "grid-cols-2"
                }`}
              >
                <TabsTrigger value="upload" className="gap-1.5">
                  <Upload className="size-3.5" />
                  {officeCategory ? "Unggah Dokumen" : "Unggah Gambar"}
                </TabsTrigger>

                {!officeCategory && (
                  <TabsTrigger value="url" className="gap-1.5">
                    <Link2 className="size-3.5" />
                    Tempel URL
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="upload" className="mt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={
                    officeCategory
                      ? OFFICE_FILE_ACCEPT
                      : "image/png,image/jpeg,image/webp"
                  }
                  className="hidden"
                  onChange={handleFileChange}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={processingFile}
                  className="flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background/50 p-4 text-sm text-muted-foreground transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/5 disabled:cursor-wait disabled:opacity-70"
                >
                  {processingFile ? (
                    <Loader2 className="size-5 animate-spin text-emerald-500" />
                  ) : officeCategory ? (
                    <FileText className="size-6 text-emerald-500" />
                  ) : (
                    <ImagePlus className="size-5 text-emerald-500" />
                  )}

                  <span>
                    {processingFile
                      ? "Memproses file..."
                      : officeCategory
                        ? "Klik untuk unggah dokumen"
                        : "Klik untuk unggah gambar"}
                  </span>

                  <span className="text-center text-xs">
                    {officeCategory
                      ? "PDF, Word, Excel, PowerPoint, dan format dokumen lainnya — maksimal 10 MB"
                      : "PNG, JPG, WEBP — otomatis dikompresi"}
                  </span>
                </button>
              </TabsContent>

              {!officeCategory && (
                <TabsContent value="url" className="mt-2">
                  <Input
                    type="url"
                    placeholder="https://contoh.com/screenshot.png"
                    value={imageUrl}
                    onChange={(event) =>
                      setValue("imageUrl", event.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />

                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Tempel tautan langsung ke gambar dari internet.
                  </p>
                </TabsContent>
              )}
            </Tabs>

            {imageUrl ? (
              <div className="relative mt-1 flex items-center gap-3 rounded-xl border border-border p-3">
                {officeCategory ? (
                  <>
                    {(() => {
                      const meta = getOfficeFileMeta(documentName, imageUrl);
                      const DocumentIcon = meta.Icon;
                      return (
                        <span
                          className="flex size-11 shrink-0 items-center justify-center rounded-lg"
                          style={{ color: meta.color, backgroundColor: `${meta.color}18` }}
                        >
                          <DocumentIcon className="size-6" />
                        </span>
                      );
                    })()}

                    <div className="min-w-0 flex-1">
                      <p className="break-all text-sm font-medium">
                        {documentName || getFileNameFromDataUrl(imageUrl)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getOfficeFileMeta(documentName, imageUrl).label} · Dokumen siap disimpan.
                      </p>
                    </div>
                  </>
                ) : imageUrl.startsWith("data:image/") ? (
                  <img
                    src={imageUrl}
                    alt="Pratinjau gambar proyek"
                    className="h-16 w-20 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ImagePlus className="size-5" />
                  </span>
                )}

                {!officeCategory && (
                  <p className="min-w-0 flex-1 break-all text-xs text-muted-foreground">
                    Gambar proyek telah dipilih.
                  </p>
                )}

                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="size-8 shrink-0"
                  aria-label="Hapus file"
                  onClick={handleRemoveFile}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ) : (
              <div className="mt-1 flex min-h-16 items-center justify-center rounded-xl border border-dashed border-border/70 px-3 text-center text-xs text-muted-foreground">
                {officeCategory
                  ? "Belum ada dokumen — opsional."
                  : "Belum ada gambar — opsional, kartu akan memakai placeholder."}
              </div>
            )}
          </div>

          {/* Link demo dan GitHub */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="project-demo">Link Demo</Label>

              <Input
                id="project-demo"
                type="url"
                placeholder="https://demo.contoh.id"
                aria-invalid={Boolean(errors.projectUrl)}
                {...register("projectUrl")}
              />

              {errors.projectUrl && (
                <p className="text-xs text-destructive">
                  {errors.projectUrl.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="project-repo">Link GitHub</Label>

              <Input
                id="project-repo"
                type="url"
                placeholder="https://github.com/username/proyek"
                aria-invalid={Boolean(errors.repoUrl)}
                {...register("repoUrl")}
              />

              {errors.repoUrl && (
                <p className="text-xs text-destructive">
                  {errors.repoUrl.message}
                </p>
              )}
            </div>
          </div>

          {/* Proyek unggulan */}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-amber-400/15 text-amber-600 dark:text-amber-400">
                <Star className="size-4" />
              </span>

              <div>
                <Label htmlFor="project-featured" className="text-sm font-medium">
                  Tandai sebagai Unggulan
                </Label>
                <p className="text-xs text-muted-foreground">
                  Proyek unggulan tampil paling depan.
                </p>
              </div>
            </div>

            <Switch
              id="project-featured"
              checked={featured}
              onCheckedChange={(checked) =>
                setValue("featured", checked, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          </div>

          <DialogFooter className="mt-1 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || processingFile}
            >
              Batal
            </Button>

            <Button
              type="submit"
              className="gap-2"
              disabled={isSubmitting || processingFile}
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {project ? "Simpan Perubahan" : "Tambah Proyek"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

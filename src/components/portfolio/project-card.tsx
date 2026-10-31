"use client";

import { motion } from "framer-motion";
import { Calendar, Download, Eye, ExternalLink, FileArchive, FileSpreadsheet, FileText, FileType2, Github, MoreVertical, Pencil, Presentation, Star, Trash2 } from "lucide-react";

import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SafeImage } from "./safe-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onRequestDelete: (project: Project) => void;
  index?: number;
}

function parseTech(techStack: string): string[] {
  return techStack
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}


function getDocumentMeta(dataUrl: string) {
  const mime = dataUrl.match(/^data:([^;,]+)/i)?.[1]?.toLowerCase() ?? "";
  if (mime.includes("word") || mime.includes("wordprocessingml")) {
    return { label: "WORD", color: "#2B579A", Icon: FileText };
  }
  if (mime.includes("spreadsheet") || mime.includes("excel") || mime.includes("sheet")) {
    return { label: "EXCEL", color: "#217346", Icon: FileSpreadsheet };
  }
  if (mime.includes("presentation") || mime.includes("powerpoint")) {
    return { label: "POWERPOINT", color: "#D24726", Icon: Presentation };
  }
  if (mime.includes("pdf")) return { label: "PDF", color: "#DC2626", Icon: FileText };
  if (mime.includes("zip")) return { label: "ZIP", color: "#B7791F", Icon: FileArchive };
  return { label: "DOKUMEN", color: "#64748B", Icon: FileType2 };
}

export function ProjectCard({ project, onEdit, onRequestDelete, index = 0 }: ProjectCardProps) {
  const techs = parseTech(project.techStack);
  const isDone = project.status === "Selesai";
  const isOfficeDocument = project.category === "Microsoft Office";
  const fileUrl = project.documentUrl || project.imageUrl || "";
  const documentMeta = getDocumentMeta(fileUrl);
  const DocumentIcon = documentMeta.Icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay: (index % 3) * 0.08 }}
      className="h-full"
    >
      <Card className="group flex h-full gap-0 overflow-hidden rounded-2xl border-border/70 p-0 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5">
        {/* Gambar */}
        <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-muted">
          {isOfficeDocument ? (
            <div className="flex size-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-muted to-background p-6">
              <span
                className="flex size-20 items-center justify-center rounded-2xl shadow-sm"
                style={{ color: documentMeta.color, backgroundColor: `${documentMeta.color}18` }}
                aria-label={`Ikon ${documentMeta.label}`}
              >
                <DocumentIcon className="size-12" strokeWidth={1.7} />
              </span>
              <span
                className="rounded-full px-3 py-1 text-xs font-bold tracking-widest"
                style={{ color: documentMeta.color, backgroundColor: `${documentMeta.color}18` }}
              >
                {documentMeta.label}
              </span>
              <p className="max-w-full break-all text-center text-xs text-muted-foreground">
                {documentMeta.label === "DOKUMEN" ? "File dokumen" : `File Microsoft ${documentMeta.label.charAt(0) + documentMeta.label.slice(1).toLowerCase()}`}
              </p>
            </div>
          ) : (
            <SafeImage
              src={project.imageUrl}
              alt={`Tangkapan layar proyek ${project.title}`}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          {/* Badge unggulan */}
          {project.featured ? (
            <Badge className="absolute top-3 left-3 gap-1 rounded-full border-amber-400/30 bg-amber-400/90 text-amber-950 shadow-sm backdrop-blur">
              <Star className="size-3 fill-current" />
              Unggulan
            </Badge>
          ) : null}
          {/* Badge status */}
          <span
            className={cn(
              "absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur",
              isDone
                ? "border border-emerald-400/30 bg-emerald-500/90 text-white dark:text-emerald-950"
                : "border border-amber-400/40 bg-amber-400/90 text-amber-950"
            )}
          >
            <span className="size-1.5 rounded-full bg-current" />
            {project.status}
          </span>
        </div>

        {/* Konten */}
        <CardContent className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
              {project.category}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 text-muted-foreground"
                  aria-label={`Menu proyek ${project.title}`}
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onSelect={() => onEdit(project)}>
                  <Pencil className="size-4" />
                  Edit Proyek
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => onRequestDelete(project)}
                >
                  <Trash2 className="size-4" />
                  Hapus Proyek
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h3 className="line-clamp-1 font-semibold tracking-tight">{project.title}</h3>

          <p className="flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {project.description}
          </p>

          {/* Tech stack — maksimal 4 + sisa */}
          <div className="flex flex-wrap gap-1.5">
            {techs.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="secondary" className="font-normal">
                {tech}
              </Badge>
            ))}
            {techs.length > 4 ? (
              <Badge variant="outline" className="font-normal text-emerald-600 dark:text-emerald-400">
                +{techs.length - 4}
              </Badge>
            ) : null}
          </div>

          {/* Footer: tahun + tautan */}
          <div className="mt-1 flex items-center justify-between border-t border-border/60 pt-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3.5" />
              {project.year || "—"}
            </span>
            <div className="flex items-center gap-1">
              {isOfficeDocument && fileUrl ? (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => {
                      if (!fileUrl) return;
                      // Open the portfolio's own preview route in a new tab.
                      // PDFs and other browser-supported formats render inline there.
                      window.open(`/proyek/${encodeURIComponent(project.id)}/preview`, "_blank", "noopener,noreferrer");
                    }}
                    aria-label={`Lihat file ${project.documentName || project.title}`}
                    title="Lihat file"
                  >
                    <Eye className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    asChild
                  >
                    <a
                      href={fileUrl}
                      download={project.documentName || project.title}
                      aria-label={`Download file ${project.documentName || project.title}`}
                      title="Download file"
                    >
                      <Download className="size-3.5" />
                    </a>
                  </Button>
                </>
              ) : null}
              {project.projectUrl ? (
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9"
                  asChild
                >
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Lihat demo live ${project.title}`}
                    title="Lihat Demo Live"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              ) : null}
              {project.repoUrl ? (
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9"
                  asChild
                >
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Buka repositori GitHub ${project.title}`}
                    title="Repositori GitHub"
                  >
                    <Github className="size-4" />
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.article>
  );
}

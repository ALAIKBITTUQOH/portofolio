import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string }> };

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf", txt: "text/plain; charset=utf-8", png: "image/png",
  jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp",
  svg: "image/svg+xml", html: "text/html; charset=utf-8", mp4: "video/mp4",
  mp3: "audio/mpeg", doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const project = await db.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: "Proyek tidak ditemukan" }, { status: 404 });
    const source = project.documentUrl || project.imageUrl || "";
    if (!source.startsWith("data:")) {
      return NextResponse.json({ error: "File ini bukan file yang tersimpan langsung di portofolio." }, { status: 400 });
    }

    const match = source.match(/^data:([^;,]+)?(;base64)?,([\s\S]*)$/i);
    if (!match) return NextResponse.json({ error: "Format file tidak valid" }, { status: 400 });
    const mimeFromData = match[1] || "application/octet-stream";
    const encoded = match[3] || "";
    const bytes = match[2] ? Buffer.from(encoded, "base64") : Buffer.from(decodeURIComponent(encoded), "utf8");
    const name = project.documentName || project.title || "dokumen";
    const extension = name.includes(".") ? name.split(".").pop()!.toLowerCase() : "";
    const mime = mimeFromData === "application/octet-stream" ? (MIME_BY_EXTENSION[extension] || mimeFromData) : mimeFromData;
    const browserCanPreview = /^(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation)|application\/vnd\.ms-(excel|powerpoint)|text\/|image\/|audio\/|video\/)/i.test(mime);
    const safeName = name.replace(/[\r\n\"]/g, "_");
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": mime,
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": `${browserCanPreview ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(safeName)}`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  } catch (error) {
    console.error("GET /api/projects/[id]/file error:", error);
    return NextResponse.json({ error: "Gagal membuka file proyek" }, { status: 500 });
  }
}

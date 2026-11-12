import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const project = await db.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json(
        { error: "Project tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json({ project });
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
    const message =
      process.env.NODE_ENV === "development" && error instanceof Error
        ? `Gagal memuat proyek: ${error.message}`
        : "Gagal memuat data proyek. Periksa konfigurasi database.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await db.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Project tidak ditemukan" },
        { status: 404 }
      );
    }

    const data: Record<string, string | boolean> = {};
    if (body.title !== undefined) {
      if (!String(body.title).trim()) {
        return NextResponse.json(
          { error: "Judul project wajib diisi" },
          { status: 400 }
        );
      }
      data.title = String(body.title).trim();
    }
    if (body.description !== undefined) {
      if (!String(body.description).trim()) {
        return NextResponse.json(
          { error: "Deskripsi project wajib diisi" },
          { status: 400 }
        );
      }
      data.description = String(body.description).trim();
    }
    if (body.category !== undefined) data.category = String(body.category).trim();
    if (body.subcategory !== undefined) data.subcategory = String(body.subcategory).trim();
    if (body.documentName !== undefined) data.documentName = String(body.documentName).trim();
    if (body.documentUrl !== undefined) data.documentUrl = String(body.documentUrl).trim();
    if (body.techStack !== undefined) data.techStack = String(body.techStack).trim();
    if (body.imageUrl !== undefined) data.imageUrl = String(body.imageUrl).trim();
    if (body.projectUrl !== undefined) data.projectUrl = String(body.projectUrl).trim();
    if (body.repoUrl !== undefined) data.repoUrl = String(body.repoUrl).trim();
    if (body.year !== undefined) data.year = String(body.year).trim();
    if (body.status !== undefined) data.status = String(body.status).trim();
    if (body.featured !== undefined) data.featured = Boolean(body.featured);

    const project = await db.project.update({ where: { id }, data });
    return NextResponse.json({ project });
  } catch (error) {
    console.error("PUT /api/projects/[id] error:", error);
    const message =
      process.env.NODE_ENV === "development" && error instanceof Error
        ? `Gagal memperbarui proyek: ${error.message}`
        : "Gagal memperbarui proyek. Periksa konfigurasi database.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const existing = await db.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Project tidak ditemukan" },
        { status: 404 }
      );
    }
    await db.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/projects/[id] error:", error);
    const message =
      process.env.NODE_ENV === "development" && error instanceof Error
        ? `Gagal menghapus proyek: ${error.message}`
        : "Gagal menghapus proyek. Periksa konfigurasi database.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

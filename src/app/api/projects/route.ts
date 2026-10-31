import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await db.project.findMany({
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    const message =
      process.env.NODE_ENV === "development" && error instanceof Error
        ? `Gagal memuat proyek: ${error.message}`
        : "Gagal memuat data proyek. Periksa konfigurasi database.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      category,
      subcategory,
      documentName,
      documentUrl,
      techStack,
      imageUrl,
      projectUrl,
      repoUrl,
      year,
      status,
      featured,
    } = body;

    if (!title || !String(title).trim()) {
      return NextResponse.json(
        { error: "Judul project wajib diisi" },
        { status: 400 }
      );
    }
    if (!description || !String(description).trim()) {
      return NextResponse.json(
        { error: "Deskripsi project wajib diisi" },
        { status: 400 }
      );
    }

    const project = await db.project.create({
      data: {
        title: String(title).trim(),
        description: String(description).trim(),
        category: String(category || "Web App").trim(),
        subcategory: String(subcategory || "").trim(),
        documentName: String(documentName || "").trim(),
        documentUrl: String(documentUrl || "").trim(),
        techStack: String(techStack || "").trim(),
        imageUrl: String(imageUrl || "").trim(),
        projectUrl: String(projectUrl || "").trim(),
        repoUrl: String(repoUrl || "").trim(),
        year: String(year || "").trim(),
        status: String(status || "Selesai").trim(),
        featured: Boolean(featured),
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    const message =
      process.env.NODE_ENV === "development" && error instanceof Error
        ? `Gagal menambahkan proyek: ${error.message}`
        : "Gagal menambahkan proyek. Periksa konfigurasi database.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

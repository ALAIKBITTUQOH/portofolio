import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { stat } from "node:fs/promises";
import { getOfficeExtension, getOfficeDisplayName, OFFICE_EXTENSIONS } from "@/lib/office-file";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);


function findLibreOffice() {
  const candidates = [
    process.env.LIBREOFFICE_PATH,
    "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
    "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
    "/usr/bin/soffice",
    "/usr/bin/libreoffice",
    "soffice",
    "libreoffice",
  ].filter((value): value is string => Boolean(value));
  return candidates;
}

function decodeDataUrl(source: string): Buffer {
  const match = source.match(/^data:([^;,]+)?(;base64)?,([\s\S]*)$/i);
  if (!match) throw new Error("Data file proyek tidak valid.");
  return match[2]
    ? Buffer.from(match[3], "base64")
    : Buffer.from(decodeURIComponent(match[3]), "utf8");
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  let workDir = "";
  try {
    const { id } = await params;
    const project = await db.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: "Proyek tidak ditemukan." }, { status: 404 });

    const source = project.documentUrl || project.imageUrl || "";
    const rawName = project.documentName || project.title || "dokumen";
    const extension = getOfficeExtension(rawName, source);
    const name = getOfficeDisplayName(rawName, source);
    if (!OFFICE_EXTENSIONS.has(extension)) {
      return NextResponse.json({ error: `Format .${extension || "tanpa ekstensi"} belum didukung untuk konversi.` }, { status: 415 });
    }
    if (!source.startsWith("data:")) {
      return NextResponse.json({ error: "Konversi lokal hanya untuk file yang diunggah ke portofolio. Untuk tautan file online, gunakan penampil Office Online." }, { status: 400 });
    }

    const bytes = decodeDataUrl(source);
    if (!bytes.length) return NextResponse.json({ error: "File dokumen kosong atau rusak." }, { status: 400 });

    workDir = await mkdtemp(path.join(tmpdir(), "portfolio-office-"));
    const inputPath = path.join(workDir, `source.${extension}`);
    const outputPath = path.join(workDir, "source.pdf");
    await writeFile(inputPath, bytes);

    let converted = false;
    let lastError = "LibreOffice tidak ditemukan.";
    for (const executable of findLibreOffice()) {
      try {
        await execFileAsync(executable, [
          "--headless", "--nologo", "--nodefault", "--nolockcheck", "--norestore",
          "-env:UserInstallation=file://" + path.join(workDir, "lo-profile"),
          "--convert-to", `pdf:${extension === "xls" || extension === "xlsx" || extension === "ods" ? "calc_pdf_Export" : extension === "ppt" || extension === "pptx" || extension === "odp" ? "impress_pdf_Export" : "writer_pdf_Export"}`, "--outdir", workDir, inputPath,
        ], { timeout: 120_000, windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
        converted = true;
        break;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
      }
    }

    if (!converted) {
      return NextResponse.json({
        error: "Pratinjau dengan tata letak asli membutuhkan LibreOffice. Instal LibreOffice pada komputer yang menjalankan server portofolio, lalu jalankan ulang aplikasi. Jika sudah terpasang di lokasi khusus, atur LIBREOFFICE_PATH ke file soffice.exe.",
        detail: process.env.NODE_ENV === "development" ? lastError : undefined,
      }, { status: 503 });
    }

    await stat(outputPath);
    const pdf = await readFile(outputPath);
    if (!pdf.length) throw new Error("LibreOffice tidak menghasilkan file PDF.");
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(path.basename(name, path.extname(name)))}.pdf"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Office document conversion failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal mengubah dokumen menjadi PDF." }, { status: 500 });
  } finally {
    if (workDir) await rm(workDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

import Link from "next/link";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import OfficePreview from "@/components/portfolio/office-preview";
import { getOfficeDisplayName, getOfficeExtension, OFFICE_EXTENSIONS } from "@/lib/office-file";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string }> };

function isOfficeFile(ext: string) { return OFFICE_EXTENSIONS.has(ext); }
function isBrowserPreview(ext: string) { return ["pdf", "txt", "png", "jpg", "jpeg", "gif", "webp", "svg", "mp4", "mp3"].includes(ext); }
function isLocalHost(host: string) {
  const hostname = host.split(":")[0].replace(/^\[|\]$/g, "").toLowerCase();
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname.endsWith(".localhost");
}

export default async function ProjectDocumentPreview({ params }: Params) {
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id } });
  if (!project) return <main className="min-h-screen p-10"><h1>Proyek tidak ditemukan</h1><Link href="/#proyek">Kembali ke proyek</Link></main>;

  const source = project.documentUrl || project.imageUrl || "";
  const rawName = project.documentName || project.title || "Dokumen";
  const ext = getOfficeExtension(rawName, source);
  const name = getOfficeDisplayName(rawName, source);
  const isData = source.startsWith("data:");
  const fileEndpoint = `/api/projects/${encodeURIComponent(project.id)}/file`;
  const downloadUrl = isData ? fileEndpoint : source;
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const localAccess = isLocalHost(host);
  const absoluteFileUrl = new URL(fileEndpoint, `${protocol}://${host}`).toString();
  const officeSource = isData ? absoluteFileUrl : source;
  const officeViewerUrl = isOfficeFile(ext) && /^https?:\/\//i.test(officeSource)
    ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(officeSource)}` : "";
  const canIframe = (isData && isBrowserPreview(ext)) || (!isData && !isOfficeFile(ext) && Boolean(source));

  return <main className="flex min-h-screen flex-col bg-background text-foreground">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:px-6">
      <div><p className="text-sm text-muted-foreground">Pratinjau dokumen proyek</p><h1 className="text-lg font-semibold">{name}</h1><p className="text-sm text-muted-foreground">{project.title}</p></div>
      <div className="flex gap-2"><a className="rounded-lg border px-4 py-2 text-sm" href={downloadUrl} download={name}>Download file</a><Link className="rounded-lg border px-4 py-2 text-sm" href="/#proyek">Kembali ke portofolio</Link></div>
    </header>
    {isOfficeFile(ext) && localAccess && isData
      ? <OfficePreview fileUrl={fileEndpoint} fileName={name} extension={ext} />
      : isOfficeFile(ext) && officeViewerUrl
        ? <iframe title={`Pratinjau ${name}`} src={officeViewerUrl} className="min-h-0 w-full flex-1" style={{ height: "calc(100vh - 92px)", border: 0 }} allowFullScreen />
        : isOfficeFile(ext)
          ? <section className="m-auto max-w-2xl p-8 text-center"><div className="text-5xl">📄</div><h2 className="mt-5 text-xl font-semibold">Pratinjau Office memerlukan tautan publik</h2><p className="mt-3 text-muted-foreground">Microsoft Office Online harus dapat mengakses file melalui internet. Pastikan situs dan file dapat dibuka secara publik, atau unduh file asli.</p><a className="mt-6 inline-flex rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white" href={downloadUrl} download={name}>Unduh dokumen</a></section>
          : canIframe
            ? <iframe title={`Pratinjau ${name}`} src={isData ? fileEndpoint : source} className="min-h-0 w-full flex-1" style={{ height: "calc(100vh - 92px)", border: 0 }} />
            : <section className="m-auto max-w-2xl p-8 text-center"><div className="text-5xl">📄</div><h2 className="mt-5 text-xl font-semibold">Pratinjau langsung belum tersedia</h2><p className="mt-3 text-muted-foreground">File ini belum didukung untuk pratinjau browser. Kamu tetap dapat mengunduh file asli.</p><a className="mt-6 inline-flex rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white" href={downloadUrl} download={name}>Unduh dokumen</a></section>}
  </main>;
}

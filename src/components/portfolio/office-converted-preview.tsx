"use client";

import { useEffect, useState } from "react";

type Props = { fileUrl: string; fileName: string };

export default function OfficeConvertedPreview({ fileUrl, fileName }: Props) {
  const [pdfUrl, setPdfUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let objectUrl = "";
    async function load() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(fileUrl, { cache: "no-store" });
        const contentType = response.headers.get("content-type") || "";
        if (!response.ok) {
          const payload = contentType.includes("application/json") ? await response.json() : null;
          throw new Error(payload?.error || `Dokumen gagal dimuat (HTTP ${response.status}).`);
        }
        if (!contentType.includes("application/pdf")) throw new Error("Server tidak mengembalikan dokumen PDF yang valid.");
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        if (active) setPdfUrl(objectUrl);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Terjadi kesalahan saat membuka dokumen.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileUrl]);

  if (loading) return <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">Menyiapkan pratinjau dokumen…</div>;
  if (error) return <section className="m-auto max-w-2xl p-8 text-center">
    <div className="mb-3 text-4xl">📄</div>
    <h2 className="text-lg font-semibold">Dokumen belum dapat ditampilkan</h2>
    <p className="mt-3 text-sm leading-6 text-muted-foreground">{error}</p>
    <p className="mt-3 text-sm text-muted-foreground">File asli tidak diubah. Kamu tetap bisa mengunduhnya melalui tombol Download file.</p>
  </section>;
  return <iframe title={`Pratinjau ${fileName}`} src={pdfUrl} className="min-h-0 w-full flex-1 bg-slate-100" style={{ height: "calc(100vh - 92px)", border: 0 }} />;
}

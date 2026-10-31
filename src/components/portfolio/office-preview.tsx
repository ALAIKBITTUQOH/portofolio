"use client";

import { useEffect, useState } from "react";

type Props = { fileUrl: string; fileName: string; extension: string };
declare global {
  interface Window {
    mammoth?: { convertToHtml: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }> };
    XLSX?: any;
    JSZip?: any;
  }
}

const CDN = {
  mammoth: "https://unpkg.com/mammoth@1.9.1/mammoth.browser.min.js",
  xlsx: "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
  jszip: "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js",
};

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-office-src="${src}"]`);
    if (existing?.dataset.loaded === "true") return resolve();
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Gagal memuat pustaka pratinjau.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.officeSrc = src;
    script.onload = () => { script.dataset.loaded = "true"; resolve(); };
    script.onerror = () => reject(new Error("Pustaka pratinjau tidak dapat dimuat. Periksa koneksi internet."));
    document.head.appendChild(script);
  });
}

export default function OfficePreview({ fileUrl, fileName, extension }: Props) {
  const [status, setStatus] = useState("Memuat dokumen...");
  const [html, setHtml] = useState("");
  const [sheets, setSheets] = useState<{ name: string; rows: unknown[][] }[]>([]);
  const [slides, setSlides] = useState<string[][]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("File tidak dapat diambil dari server.");
        const buffer = await response.arrayBuffer();
        if (cancelled) return;

        if (extension === "docx") {
          await loadScript(CDN.mammoth);
          if (!window.mammoth) throw new Error("Pembaca Word gagal dimuat.");
          const result = await window.mammoth.convertToHtml({ arrayBuffer: buffer });
          if (!cancelled) { setHtml(result.value || "<p>Dokumen tidak memiliki teks yang dapat ditampilkan.</p>"); setStatus(""); }
        } else if (["xls", "xlsx"].includes(extension)) {
          await loadScript(CDN.xlsx);
          if (!window.XLSX) throw new Error("Pembaca Excel gagal dimuat.");
          const workbook = window.XLSX.read(buffer, { type: "array", cellDates: true });
          const parsed = workbook.SheetNames.map((name: string) => ({
            name,
            rows: window.XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, defval: "" }) as unknown[][],
          }));
          if (!cancelled) { setSheets(parsed); setStatus(""); }
        } else if (extension === "pptx") {
          await loadScript(CDN.jszip);
          if (!window.JSZip) throw new Error("Pembaca PowerPoint gagal dimuat.");
          const zip = await window.JSZip.loadAsync(buffer);
          const slideFiles = Object.keys(zip.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name)).sort((a, b) => Number(a.match(/slide(\d+)/)?.[1]) - Number(b.match(/slide(\d+)/)?.[1]));
          const parsed: string[][] = [];
          for (const path of slideFiles) {
            const xml = await zip.files[path].async("text");
            const doc = new DOMParser().parseFromString(xml, "application/xml");
            const paragraphs = Array.from(doc.getElementsByTagName("a:p")).map((p) => Array.from(p.getElementsByTagName("a:t")).map((t) => t.textContent || "").join("")).filter(Boolean);
            parsed.push(paragraphs);
          }
          if (!cancelled) { setSlides(parsed); setStatus(""); }
        } else {
          throw new Error("Pratinjau langsung tersedia untuk DOCX, XLS/XLSX, dan PPTX. Format DOC/PPT lama perlu dibuka dengan aplikasi Office atau disimpan ulang ke format baru.");
        }
      } catch (e) {
        if (!cancelled) { setError(e instanceof Error ? e.message : "Terjadi kesalahan saat membaca dokumen."); setStatus(""); }
      }
    }
    run();
    return () => { cancelled = true; };
  }, [fileUrl, extension]);

  return <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-3 sm:p-6">
    {status && <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 text-center text-slate-600 shadow-sm">{status}</div>}
    {error && <div className="mx-auto max-w-3xl rounded-xl border border-amber-200 bg-white p-6 text-center shadow-sm"><div className="mb-2 text-3xl">📄</div><h2 className="font-semibold text-slate-900">Belum dapat menampilkan dokumen</h2><p className="mt-2 text-sm text-slate-600">{error}</p><p className="mt-3 text-sm text-slate-500">Kamu tetap dapat mengunduh file melalui tombol Download di bagian atas.</p></div>}
    {html && <article className="office-word mx-auto max-w-4xl bg-white p-8 shadow-sm sm:p-12" dangerouslySetInnerHTML={{ __html: html }} />}
    {sheets.length > 0 && <section className="mx-auto max-w-6xl rounded-xl bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap gap-2">{sheets.map((sheet, i) => <button key={sheet.name} onClick={() => setActiveSheet(i)} className={`rounded-lg px-4 py-2 text-sm ${activeSheet === i ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}>{sheet.name}</button>)}</div>
      <div className="overflow-auto"><table className="min-w-full border-collapse text-sm"><tbody>{(sheets[activeSheet]?.rows || []).map((row, ri) => <tr key={ri}>{row.map((cell, ci) => <td key={ci} className="max-w-sm border border-slate-300 px-3 py-2 text-slate-800">{cell == null ? "" : String(cell)}</td>)}</tr>)}</tbody></table></div>
      <p className="mt-3 text-xs text-slate-500">Pratinjau menampilkan data sel. Tata letak, rumus interaktif, dan grafik kompleks mungkin berbeda dari Microsoft Excel.</p>
    </section>}
    {slides.length > 0 && <section className="mx-auto max-w-4xl space-y-6">{slides.map((paragraphs, i) => <article key={i} className="flex aspect-video min-h-64 flex-col justify-center rounded-lg border bg-white p-8 shadow-sm sm:p-12"><p className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-400">Slide {i + 1}</p>{paragraphs.length ? paragraphs.map((p, j) => <p key={j} className="mb-3 text-center text-xl font-medium text-slate-800 sm:text-2xl">{p}</p>) : <p className="text-center text-slate-400">Slide ini tidak memiliki teks yang dapat diekstrak.</p>}</article>)}</section>}
    <style jsx global>{`.office-word { color:#1f2937; line-height:1.7; } .office-word h1,.office-word h2,.office-word h3 { font-weight:700; margin:1.2em 0 .5em; } .office-word p { margin:.65em 0; } .office-word table { border-collapse:collapse; width:100%; margin:1em 0; } .office-word td,.office-word th { border:1px solid #cbd5e1; padding:6px 9px; } .office-word img { max-width:100%; height:auto; }`}</style>
  </div>;
}

/** Deteksi ekstensi dokumen Office dari nama file dan MIME data URL. */
const MIME_EXTENSION: Record<string, string> = {
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.oasis.opendocument.text": "odt",
  "application/vnd.oasis.opendocument.spreadsheet": "ods",
  "application/vnd.oasis.opendocument.presentation": "odp",
  "application/rtf": "rtf",
};

export function getOfficeExtension(fileName: string, source = ""): string {
  const fromName = fileName.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (fromName && OFFICE_EXTENSIONS.has(fromName)) return fromName;
  const mime = source.match(/^data:([^;,]+)/i)?.[1]?.toLowerCase();
  return mime ? MIME_EXTENSION[mime] || fromName || "" : fromName || "";
}

export const OFFICE_EXTENSIONS = new Set([
  "doc", "docx", "xls", "xlsx", "ppt", "pptx", "odt", "ods", "odp", "rtf",
]);

export function getOfficeDisplayName(fileName: string, source = ""): string {
  const ext = getOfficeExtension(fileName, source);
  if (!fileName.includes(".") && ext) return `${fileName || "Dokumen"}.${ext}`;
  return fileName || (ext ? `Dokumen.${ext}` : "Dokumen");
}

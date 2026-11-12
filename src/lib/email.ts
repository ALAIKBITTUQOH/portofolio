export interface EmailComposeOptions {
  /** Alamat email tujuan. */
  to: string;
  /** Subjek email (opsional). */
  subject?: string;
  /** Isi email (opsional). */
  body?: string;
}

/**
 * Membentuk tautan mailto: standar dengan parameter subject dan body.
 *
 * Catatan: nilai query di-encode dengan encodeURIComponent (spasi menjadi
 * %20 sesuai RFC 6068 mailto), BUKAN URLSearchParams (yang mengubah spasi
 * menjadi "+") agar subjek/isi tampil benar di aplikasi Gmail.
 *
 * Dipakai sebagai jalur cadangan di perangkat mobile.
 */
export function mailtoUrl({
  to,
  subject = "",
  body = "",
}: EmailComposeOptions): string {
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  const query = params.length ? `?${params.join("&")}` : "";
  return `mailto:${to}${query}`;
}

/**
 * URL jendela tulis (compose) Gmail versi web — untuk laptop/PC.
 * Parameter resmi Gmail: view=cm, fs=1, to, su (subjek), body (isi).
 */
export function gmailWebComposeUrl({
  to,
  subject = "",
  body = "",
}: EmailComposeOptions): string {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to,
  });
  if (subject) params.set("su", subject);
  if (body) params.set("body", body);
  return `https://mail.google.com/mail/?${params.toString()}`;
}

/** URL skema aplikasi Gmail (khusus iPhone/iPad bila aplikasi terpasang). */
function gmailAppUrl({
  to,
  subject = "",
  body = "",
}: EmailComposeOptions): string {
  const params = new URLSearchParams({ to });
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  return `googlegmail://co?${params.toString()}`;
}

/**
 * URL intent Android yang menargetkan APLIKASI GMAIL secara eksplisit.
 *
 * Format intent Chrome/Android:
 *   intent:<DATA-URI>#Intent;action=<ACTION>;package=<PAKET>;end
 *
 * Rencana:
 *   - action = android.intent.action.SENDTO (aksi standar aplikasi email)
 *   - data   = mailto:... (alamat, subjek, dan isi pesan)
 *   - package= com.google.android.gm (APK Gmail)
 *
 * Dengan paket yang ditargetkan secara eksplisit, Chrome Android
 * membuka aplikasi Gmail LANGSUNG (tanpa dialog pilihan aplikasi,
 * tanpa Gmail web). Bila aplikasi Gmail tidak ditemukan di perangkat,
 * Chrome otomatis mengarahkan ke Play Store — dan sebagai pengaman
 * tambahan halaman tetap mencoba mailto: melalui timer fallback.
 */
export function androidGmailIntentUrl(options: EmailComposeOptions): string {
  const mailto = mailtoUrl(options);
  return (
    `intent:${mailto}` +
    `#Intent;action=android.intent.action.SENDTO` +
    `;package=com.google.android.gm;end`
  );
}

/** Apakah perangkat adalah ponsel/tablet (dipakai untuk jalur mailto). */
export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const uaMobile =
    /android|iphone|ipod|iemobile|opera mini|blackberry|webos/i.test(ua);
  // iPadOS modern melaporkan dirinya sebagai Macintosh namun mendukung sentuhan.
  const iPadOs =
    /ipad|macintosh/i.test(ua) && (navigator.maxTouchPoints ?? 0) > 1;
  return uaMobile || iPadOs;
}

function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent);
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iosDevice = /iphone|ipod|ipad/i.test(ua);
  const iPadOsModern =
    /macintosh/i.test(ua) && (navigator.maxTouchPoints ?? 0) > 1;
  return iosDevice || iPadOsModern;
}

/**
 * Membuka jendela tulis Gmail sesuai perangkat pengguna:
 * aplikasi Gmail di HP, Gmail web di laptop/PC.
 * WAJIB dipanggil dari event klik pengguna (gesture) agar tidak
 * diblokir browser, terutama jalur window.open di desktop.
 */
export function openEmailCompose(options: EmailComposeOptions): void {
  if (typeof window === "undefined") return;

  const fallbackMailto = mailtoUrl(options);

  // 1) HP Android — buka APLIKASI GMAIL langsung (intent eksplisit
  //    action SENDTO + mailto:, menargetkan paket com.google.android.gm).
  if (isAndroid()) {
    window.location.href = androidGmailIntentUrl(options);

    // Pengaman: bila setelah 1,5 detik halaman masih terlihat (intent
    // gagal ditangani, mis. perangkat Android tanpa aplikasi Gmail dan
    // Chrome tidak mengarahkan ke Play Store), buka aplikasi email
    // bawaan lewat mailto:. Bila intent berhasil, halaman akan menjadi
    // "hidden" sehingga fallback ini tidak dijalankan.
    window.setTimeout(() => {
      if (!document.hidden) {
        window.location.href = fallbackMailto;
      }
    }, 1500);
    return;
  }

  // 2) iPhone / iPad — coba aplikasi Gmail dulu, lalu Mail bawaan.
  if (isIos()) {
    let opened = false;
    const onVisibility = () => {
      if (document.hidden) opened = true;
    };
    document.addEventListener("visibilitychange", onVisibility, {
      once: true,
    });

    window.location.href = gmailAppUrl(options);

    // Bila aplikasi Gmail tidak terpasang, lanjutkan ke aplikasi Mail.
    window.setTimeout(() => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (!opened && !document.hidden) {
        window.location.href = fallbackMailto;
      }
    }, 1200);
    return;
  }

  // 3) Perangkat seluler lainnya — aplikasi email bawaan.
  if (isMobileDevice()) {
    window.location.href = fallbackMailto;
    return;
  }

  // 4) Laptop/PC — buka jendela tulis Gmail versi web di tab baru.
  //    Tidak bergantung pada aplikasi email bawaan Windows/macOS,
  //    sehingga selalu berhasil selama browser terpasang.
  //
  //    Menggunakan anchor terprogram (bukan window.open) karena lebih
  //    andal: klik terjadi dalam gesture pengguna sehingga tidak dianggap
  //    popup, dan rel="noopener noreferrer" tetap memutus kaitan opener.
  const gmailWeb = gmailWebComposeUrl(options);
  const anchor = document.createElement("a");

  anchor.href = gmailWeb;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

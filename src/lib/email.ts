
/**
 * Utilitas tautan email yang membuka GMAIL secara langsung,
 * menyesuaikan perangkat pengguna (perilaku sesuai contoh situs
 * portofolio referensi):
 *
 * - HP Android    : membuka APLIKASI GMAIL langsung lewat Android
 *                   intent yang menargetkan paket com.google.android.gm.
 *                   Bila aplikasi Gmail tidak terpasang, Chrome otomatis
 *                   membuka URL cadangan (mailto:) sehingga aplikasi
 *                   email bawaan tetap terbuka.
 * - HP iPhone/iPad: mencoba skema aplikasi Gmail (googlegmail://),
 *                   bila tidak terpasang dilanjutkan ke aplikasi Mail
 *                   bawaan lewat mailto:.
 * - Laptop/PC     : membuka jendela tulis (compose) Gmail versi web
 *                   di tab baru — mail.google.com/mail/?view=cm —
 *                   tanpa perlu aplikasi email terpasang di laptop.
 *                   Cukup login akun Google di browser seperti biasa.
 *
 * Semua jalur mengisi otomatis penerima, subjek, dan isi pesan.
 */

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
 * Dipakai sebagai jalur cadangan di perangkat mobile.
 */
export function mailtoUrl({
  to,
  subject = "",
  body = "",
}: EmailComposeOptions): string {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const query = params.toString();
  return `mailto:${to}${query ? `?${query}` : ""}`;
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

/** URL skema aplikasi Gmail (khusus iOS bila aplikasi Gmail terpasang). */
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
 * URL intent Android yang menargetkan APLIKASI GMAIL secara eksplisit
 * (paket com.google.android.gm). S.browser_fallback_url membuat Chrome
 * membuka mailto: secara otomatis bila aplikasi Gmail tidak ditemukan.
 */
function androidGmailIntentUrl(options: EmailComposeOptions): string {
  const fallback = encodeURIComponent(mailtoUrl(options));
  const query = new URLSearchParams({ to: options.to });
  if (options.subject) query.set("subject", options.subject);
  if (options.body) query.set("body", options.body);

  return (
    `intent://co?${query.toString()}` +
    `#Intent;scheme=googlegmail;package=com.google.android.gm` +
    `;S.browser_fallback_url=${fallback};end`
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

  // 1) HP Android — buka aplikasi Gmail langsung (intent eksplisit).
  if (isAndroid()) {
    window.location.href = androidGmailIntentUrl(options);

    // Cadangan: bila setelah 1,8 detik halaman masih terlihat
    // (aplikasi Gmail tidak terpasang / intent gagal), buka aplikasi
    // email bawaan lewat mailto:.
    window.setTimeout(() => {
      if (!document.hidden) {
        window.location.href = fallbackMailto;
      }
    }, 1800);
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

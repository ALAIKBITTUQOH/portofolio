export interface EmailComposePayload {
  to: string;
  subject?: string;
  body?: string;
}

export type UserPlatform = "android" | "ios" | "desktop";

/** Deteksi platform perangkat dari user agent. */
export function getUserPlatform(): UserPlatform {
  if (typeof navigator === "undefined") return "desktop";

  const ua = navigator.userAgent ?? "";

  if (/android/i.test(ua)) return "android";

  // iPadOS 13+ menyamar sebagai Macintosh dengan dukungan sentuh.
  const isIpadOs =
    /Macintosh/i.test(ua) &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1;

  if (/iPad|iPhone|iPod/i.test(ua) || isIpadOs) return "ios";

  return "desktop";
}

/** Bangun URL mailto: standar (dibuka oleh aplikasi email default). */
export function buildMailtoUrl(payload: EmailComposePayload): string {
  const params: string[] = [];

  if (payload.subject) {
    params.push(`subject=${encodeURIComponent(payload.subject)}`);
  }

  if (payload.body) {
    params.push(`body=${encodeURIComponent(payload.body)}`);
  }

  const query = params.length > 0 ? `?${params.join("&")}` : "";

  return `mailto:${payload.to}${query}`;
}

/** Bangun URL Gmail Web (compose) untuk fallback di desktop. */
export function buildGmailWebUrl(payload: EmailComposePayload): string {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: payload.to,
    su: payload.subject ?? "",
    body: payload.body ?? "",
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
}

/**
 * Bangun URL khusus pembuka APLIKASI Gmail sesuai platform.
 * Mengembalikan `null` bila berjalan di desktop.
 */
export function buildGmailAppUrl(payload: EmailComposePayload): string | null {
  const platform = getUserPlatform();

  if (platform === "android") {
    // Format Intent URI: intent:DATA#Intent;params;end
    // DATA tanpa scheme — scheme disuplai lewat parameter `scheme=mailto`
    // agar tidak terjadi duplikasi scheme oleh parser Android.
    const data =
      `${payload.to}` +
      (payload.subject
        ? `?subject=${encodeURIComponent(payload.subject)}`
        : "") +
      (payload.body
        ? `${payload.subject ? "&" : "?"}body=${encodeURIComponent(payload.body)}`
        : "");

    const fallbackUrl = encodeURIComponent(buildMailtoUrl(payload));

    return (
      `intent:${data}#Intent;` +
      `action=android.intent.action.SENDTO;` +
      `scheme=mailto;` +
      `package=com.google.android.gm;` +
      `S.browser_fallback_url=${fallbackUrl};` +
      `end`
    );
  }

  if (platform === "ios") {
    const params = [
      `to=${encodeURIComponent(payload.to)}`,
      payload.subject && `subject=${encodeURIComponent(payload.subject)}`,
      payload.body && `body=${encodeURIComponent(payload.body)}`,
    ]
      .filter(Boolean)
      .join("&");

    return `googlegmail://co?${params}`;
  }

  return null;
}

/**
 * Buka `primary`, lalu setelah `timeoutMs` jatuh ke `fallback` bila halaman
 * masih terlihat (artinya aplikasi tidak terbuka).
 */
function tryOpenWithFallback(primary: string, fallback: string, timeoutMs = 1200): void {
  let openedInApp = false;

  const onVisibilityChange = () => {
    if (document.hidden) openedInApp = true;
  };

  document.addEventListener("visibilitychange", onVisibilityChange);

  window.setTimeout(() => {
    document.removeEventListener("visibilitychange", onVisibilityChange);

    if (!openedInApp && !document.hidden) {
      window.location.href = fallback;
    }
  }, timeoutMs);

  window.location.href = primary;
}

/**
 * Titik masuk utama: buka komposer email menuju APLIKASI Gmail di ponsel,
 * mailto: bila Gmail tidak tersedia, dan Gmail Web di desktop.
 */
export function openEmailCompose(payload: EmailComposePayload): void {
  const platform = getUserPlatform();

  // Desktop → Gmail Web di tab baru (perilaku lama yang sudah sesuai).
  if (platform === "desktop") {
    window.open(buildGmailWebUrl(payload), "_blank", "noopener,noreferrer");
    return;
  }

  // Android → Intent menargetkan aplikasi Gmail secara langsung.
  if (platform === "android") {
    const gmailAppUrl = buildGmailAppUrl(payload);

    if (gmailAppUrl) {
      window.location.href = gmailAppUrl;
      return;
    }
  }

  // iOS → coba aplikasi Gmail (googlegmail://), fallback ke mailto:.
  const gmailAppUrl = buildGmailAppUrl(payload);
  const mailtoUrl = buildMailtoUrl(payload);

  if (gmailAppUrl) {
    tryOpenWithFallback(gmailAppUrl, mailtoUrl);
    return;
  }

  window.location.href = mailtoUrl;
}

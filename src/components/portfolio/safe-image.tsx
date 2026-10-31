"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Kelas tambahan untuk fallback ketika gambar gagal/kosong */
  fallbackClassName?: string;
  fallbackIcon?: React.ReactNode;
}

/**
 * <img> dengan fallback elegan: bila src kosong atau gagal dimuat,
 * tampilkan blok berwarna + ikon alih-alih gambar rusak.
 */
export function SafeImage({
  src,
  alt,
  className,
  fallbackClassName,
  fallbackIcon,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-emerald-500/10 via-transparent to-amber-400/10",
          className,
          fallbackClassName
        )}
      >
        {fallbackIcon ?? <ImageOff className="size-8 text-muted-foreground/60" />}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

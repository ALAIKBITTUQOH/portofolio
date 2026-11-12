
"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Github,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { profile, type SocialLink } from "@/config/profile";
import { openEmailCompose } from "@/lib/email";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "./section-heading";
import { fadeUp, staggerContainer, viewportOnce } from "./animations";

const SOCIAL_ICONS: Record<SocialLink["icon"], LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  mail: Mail,
};

interface ContactFormState {
  nama: string;
  email: string;
  pesan: string;
}

type ContactFormErrors = Partial<
  Record<keyof ContactFormState, string>
>;

export function Contact() {
  const [form, setForm] = useState<ContactFormState>({
    nama: "",
    email: "",
    pesan: "",
  });

  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [sending, setSending] = useState(false);

  const setField = (field: keyof ContactFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): ContactFormErrors => {
    const next: ContactFormErrors = {};

    if (!form.nama.trim()) {
      next.nama = "Nama wajib diisi";
    }

    if (!form.email.trim()) {
      next.email = "Email wajib diisi";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      next.email = "Format email tidak valid";
    }

    if (!form.pesan.trim()) {
      next.pesan = "Pesan wajib diisi";
    }

    return next;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) return;

    setSending(true);

    const subject =
      `Halo ${profile.name}, saya ${form.nama.trim()}`;

    const body =
      `Nama: ${form.nama.trim()}\n` +
      `Email: ${form.email.trim()}\n\n` +
      `${form.pesan.trim()}`;

    // Buka aplikasi Gmail di HP, Gmail web di laptop — pesan sudah tersusun.
    openEmailCompose({
      to: profile.email,
      subject,
      body,
    });

    toast.success("Email berhasil dibuka", {
      description:
        "Periksa kembali pesan Anda, kemudian tekan Kirim di aplikasi email.",
    });

    setSending(false);
  };

  const gmailComposeUrl = `mailto:${profile.email}`;

  const contactItems: {
    icon: LucideIcon;
    label: string;
    value: string;
    href: string;
    external?: boolean;
    isEmail?: boolean;
  }[] = [
    {
      icon: Mail,
      label: "Email",
      value: profile.email,
      href: gmailComposeUrl,
      isEmail: true,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: profile.whatsappDisplay,
      href: profile.whatsappLink,
      external: true,
    },
    
    {
      icon: MapPin,
      label: "Lokasi",
      value: profile.location,
      href: "https://maps.app.goo.gl/nqYzf95zW2A7y1M79",
      external: true,
    },
    
    {
      icon: Linkedin,
      label: "LinkedIn",
      value: "Lihat Profil LinkedIn",
      href: "https://www.linkedin.com/in/alaik-bittuqoh-68b2b9259/",
      external: true,
    },
  ];

  return (
    <section id="kontak" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Kontak"
          title={
            <>
              Mari <span className="text-gradient">Bekerja Sama</span>
            </>
          }
          description="Saya terbuka untuk berbagai kesempatan karier di bidang teknologi informasi, khususnya pengembangan website, aplikasi, dan software. Jika Anda memiliki peluang kerja, ingin berkolaborasi dalam proyek, atau sekadar berdiskusi mengenai teknologi, saya akan senang untuk terhubung dan mengenal lebih jauh."
        />

        <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-5 lg:gap-10">
          {/* Info kontak */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="flex flex-col gap-4 lg:col-span-2"
          >
            {contactItems.map((item) => (
              <motion.div key={item.label} variants={fadeUp}>
                <a
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  onClick={(event) => {
                    // Email: buka aplikasi Gmail (HP) / Gmail web (laptop).
                    if (item.isEmail) {
                      event.preventDefault();
                      openEmailCompose({
                        to: profile.email,
                        subject: `Halo ${profile.name}, saya ingin terhubung`,
                      });
                    }
                  }}
                  className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card/60 p-4 transition-all hover:-translate-y-0.5 hover:border-purple-500/40 hover:shadow-md hover:shadow-purple-500/10"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 transition-colors dark:text-purple-400">
                    <item.icon className="size-5" />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-xs uppercase tracking-wider text-muted-foreground">
                      {item.label}
                    </span>

                    <span className="block truncate text-sm font-semibold">
                      {item.value}
                    </span>
                  </span>
                </a>
              </motion.div>
            ))}

            <motion.div variants={fadeUp} className="mt-2">
              <p className="mb-3 text-sm font-medium">
                Temukan saya di
              </p>

              <div className="flex items-center gap-2">
                {profile.socials.map((social) => {
                  const Icon = SOCIAL_ICONS[social.icon];

                  return (
                    <Button
                      key={social.label}
                      variant="outline"
                      size="icon"
                      className="size-11 rounded-xl transition-all hover:-translate-y-0.5 hover:border-purple-500/50 hover:text-purple-600 hover:shadow-md hover:shadow-purple-500/15 dark:hover:text-purple-400"
                      asChild
                    >
                      <a
                        href={social.href}
                        target={
                          social.href.startsWith("http")
                            ? "_blank"
                            : undefined
                        }
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        onClick={(event) => {
                          if (social.icon === "mail") {
                            event.preventDefault();
                            openEmailCompose({
                              to: profile.email,
                              subject: `Halo ${profile.name}, saya tertarik dengan portofolio Anda`,
                            });
                          }
                        }}
                      >
                        <Icon className="size-5" />
                      </a>
                    </Button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>

          {/* Form kontak */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-3"
          >
            <Card className="h-full rounded-2xl border-border/70 p-6 sm:p-8">
              <CardHeader className="px-0">
                <CardTitle className="text-lg">
                  Kirim Pesan
                </CardTitle>

                <CardDescription>
                  Isi formulir di bawah ini untuk mengirim pesan.
                  Anda akan diarahkan ke Gmail dengan pesan yang sudah disiapkan dan siap dikirim.
                </CardDescription>
              </CardHeader>

              <CardContent className="px-0">
                <form
                  onSubmit={handleSubmit}
                  className="grid gap-4"
                  noValidate
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="contact-nama">
                        Nama <span className="text-destructive">*</span>
                      </Label>

                      <Input
                        id="contact-nama"
                        placeholder="Nama lengkap Anda"
                        value={form.nama}
                        onChange={(e) =>
                          setField("nama", e.target.value)
                        }
                        aria-invalid={Boolean(errors.nama)}
                      />

                      {errors.nama && (
                        <p className="text-xs text-destructive">
                          {errors.nama}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="contact-email">
                        Email <span className="text-destructive">*</span>
                      </Label>

                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="nama@contoh.com"
                        value={form.email}
                        onChange={(e) =>
                          setField("email", e.target.value)
                        }
                        aria-invalid={Boolean(errors.email)}
                      />

                      {errors.email && (
                        <p className="text-xs text-destructive">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contact-pesan">
                      Pesan <span className="text-destructive">*</span>
                    </Label>

                    <Textarea
                      id="contact-pesan"
                      rows={5}
                      placeholder="Ceritakan tentang tawaran kerja atau proyek Anda..."
                      value={form.pesan}
                      onChange={(e) =>
                        setField("pesan", e.target.value)
                      }
                      aria-invalid={Boolean(errors.pesan)}
                    />

                    {errors.pesan && (
                      <p className="text-xs text-destructive">
                        {errors.pesan}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="btn-shine h-11 gap-2 shadow-lg shadow-purple-500/25"
                    disabled={sending}
                  >
                    <Send className="size-4" />
                    {sending ? "Membuka Email..." : "Kirim Pesan"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

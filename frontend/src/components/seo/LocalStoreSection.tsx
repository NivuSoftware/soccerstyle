import { Clock, ExternalLink, MapPin } from "lucide-react";

import { BUSINESS_INFO } from "@/data/seo";
import { getWhatsAppLink } from "@/data/products";

const STORE_MAPS: Record<string, string[]> = {
  Riobamba: [
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.118525064954!2d-78.6534346!3d-1.6725334000000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d3a9daa4dfd85b%3A0x4388ca2994b5ee7a!2sSoccer%20Style!5e0!3m2!1ses!2sec!4v1775668798267!5m2!1ses!2sec",
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.121741325445!2d-78.6476052!3d-1.6709501999999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d3a9feb91b1691%3A0xd6b544750691086f!2sSoccer%20Style%20Sucursal!5e0!3m2!1ses!2sec!4v1775668811721!5m2!1ses!2sec",
  ],
  Latacunga: [
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.288938042459!2d-78.6163061!3d-0.9333630000000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d461904d63ae99%3A0x864cb2d8317ee657!2sSoccer%20Style%20Latacunga!5e0!3m2!1ses!2sec!4v1775668830382!5m2!1ses!2sec",
  ],
};

const socialLinks = [
  {
    href: "https://www.instagram.com/soccerstyleecu",
    label: "Instagram",
    Icon: () => (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.75A4 4 0 0 0 3.75 7.75v8.5A4 4 0 0 0 7.75 20.5h8.5a4 4 0 0 0 4-4v-8.5a4 4 0 0 0-4-4Zm8.88 1.31a1.06 1.06 0 1 1 0 2.12 1.06 1.06 0 0 1 0-2.12ZM12 6.5A5.5 5.5 0 1 1 6.5 12 5.5 5.5 0 0 1 12 6.5Zm0 1.75A3.75 3.75 0 1 0 15.75 12 3.75 3.75 0 0 0 12 8.25Z" />
      </svg>
    ),
  },
  {
    href: "https://www.facebook.com/SoccerStyleEc",
    label: "Facebook",
    Icon: () => (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M13.62 22v-8.06h2.71l.41-3.14h-3.12V8.8c0-.91.25-1.53 1.56-1.53h1.67V4.46a22.5 22.5 0 0 0-2.43-.12c-2.4 0-4.04 1.47-4.04 4.17v2.29H7.62v3.14h2.76V22Z" />
      </svg>
    ),
  },
  {
    href: "https://www.tiktok.com/@soccerstyleec",
    label: "TikTok",
    Icon: () => (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M14.7 3c.27 2.17 1.5 3.62 3.63 3.76v2.47a6.05 6.05 0 0 1-3.56-1.22v5.29c0 4.24-4.62 6.89-8.29 4.88A5.96 5.96 0 0 1 7.96 7.6a6.57 6.57 0 0 1 2.34-.44v2.6a3.24 3.24 0 0 0-1.04.17A3.3 3.3 0 1 0 12 13.06V3Z" />
      </svg>
    ),
  },
  {
    href: getWhatsAppLink(),
    label: "WhatsApp",
    Icon: () => (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M20.52 3.48A11.86 11.86 0 0 0 12.09 0C5.52 0 .17 5.35.17 11.92a11.8 11.8 0 0 0 1.61 5.98L0 24l6.28-1.65a11.87 11.87 0 0 0 5.8 1.49h.01c6.57 0 11.91-5.35 11.91-11.92a11.84 11.84 0 0 0-3.48-8.44ZM12.1 21.8a9.86 9.86 0 0 1-5.02-1.38l-.36-.22-3.73.98.99-3.64-.23-.38a9.8 9.8 0 0 1-1.5-5.23c0-5.42 4.42-9.84 9.86-9.84a9.8 9.8 0 0 1 6.97 2.89 9.77 9.77 0 0 1 2.88 6.96c0 5.43-4.42 9.85-9.84 9.86Zm5.4-7.37c-.3-.15-1.77-.87-2.04-.97-.27-.1-.46-.15-.66.15-.2.3-.76.97-.93 1.17-.17.2-.34.23-.64.08-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.5.15-.17.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.66-1.58-.9-2.16-.24-.57-.48-.5-.66-.51l-.56-.01c-.2 0-.5.08-.76.38-.26.3-1 1-.1 2.45.9 1.44 1.28 2.05 2.77 3.37 1.82 1.61 3.38 2.12 4.6 2.62.51.2.98.17 1.35.1.41-.06 1.27-.52 1.45-1.02.18-.5.18-.93.13-1.02-.05-.09-.27-.15-.56-.3Z" />
      </svg>
    ),
  },
] as const;

const LocalStoreSection = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 max-w-3xl">
          <div className="mb-4 h-0.5 w-12 bg-primary" />
          <h2 className="font-display text-3xl font-black text-foreground md:text-4xl">
            Nuestras ubicaciones
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
            Encuentra Soccer Style en Riobamba y Latacunga, revisa horarios y abre la
            ubicación directamente en el mapa.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {BUSINESS_INFO.stores.map((store) => (
            <article
              key={store.name}
              className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/60"
            >
              <div className="p-6">
                <h3 className="font-display text-2xl font-bold text-foreground">{store.name}</h3>

                <div className="mt-5 space-y-4 text-sm text-muted-foreground">
                  <p className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{store.streetAddress}</span>
                  </p>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      Horario de atencion
                    </p>
                    {store.displayHours.map((hours) => (
                      <p key={hours} className="flex items-start gap-3">
                        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{hours}</span>
                      </p>
                    ))}
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${BUSINESS_INFO.name} ${store.city}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition hover:border-primary/40 hover:bg-primary hover:text-primary-foreground"
                >
                  Abrir en Google Maps
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div className="grid gap-4 border-t border-border/70 p-4 md:p-5">
                {(STORE_MAPS[store.city] ?? []).map((mapSrc, index) => (
                  <div
                    key={`${store.name}-${index}`}
                    className="overflow-hidden rounded-[1.25rem] border border-border/70 bg-background/40 shadow-[0_12px_30px_rgba(0,0,0,0.14)]"
                  >
                    <div className="border-b border-border/70 bg-background/70 px-4 py-3">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                        Sucursal {index + 1}
                      </p>
                    </div>
                    <iframe
                      title={`Mapa de ${store.name} ${index + 1}`}
                      src={mapSrc}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="h-[320px] w-full border-0"
                    />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-primary/15 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),_transparent_30%),rgba(15,20,17,0.92)] p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-display text-2xl font-bold text-foreground">
                Síguenos y contáctanos
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                Encuentra novedades, promociones y atención directa en nuestros canales oficiales.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-w-[140px] items-center justify-center gap-3 rounded-2xl border border-border/70 bg-background/45 px-5 py-4 text-base font-semibold text-foreground transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                >
                  <span className="text-[1.35rem]">
                    <Icon />
                  </span>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocalStoreSection;

import { ArrowUpRight, CheckCircle2, MapPin } from "lucide-react";

import { getWhatsAppLink } from "@/data/products";
import type {
  SeoFaqItem,
  SeoInternalLink,
  SeoPageContent,
} from "@/data/seo-pages";

import { Link } from "react-router-dom";

interface SeoNarrativeProps {
  content: SeoPageContent;
}

const FaqCard = ({ item }: { item: SeoFaqItem }) => (
  <article className="rounded-2xl border border-border/70 bg-card/65 p-5">
    <h3 className="font-display text-xl font-bold text-foreground">{item.question}</h3>
    <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.answer}</p>
  </article>
);



const SeoNarrative = ({ content }: SeoNarrativeProps) => {
  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="rounded-[2rem] border border-primary/15 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),_transparent_28%),rgba(11,16,13,0.88)] p-6 md:p-10">
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              {content.sectionLabel}
            </span>
            {content.cityMentions.map((city) => (
              <span
                key={city}
                className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground"
              >
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {city}
              </span>
            ))}
          </div>

          <div className="mt-8 max-w-4xl">
            <h2 className="font-display text-3xl font-black text-foreground md:text-4xl">
              {content.h1}
            </h2>
            <p className="mt-4 text-base leading-8 text-muted-foreground md:text-lg">
              {content.heroDescription}
            </p>
          </div>

          <div className="mt-10 grid gap-8 xl:grid-cols-3">
            <div className="space-y-8 xl:col-span-2">
              {content.sections.map((section) => (
                <article
                  key={section.title}
                  className="rounded-[1.75rem] border border-border/60 bg-background/35 p-6 md:p-8"
                >
                  <h3 className="font-display text-2xl font-bold text-foreground">
                    {section.title}
                  </h3>

                  <div className="mt-4 space-y-4 text-sm leading-8 text-muted-foreground md:text-base">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>

                  {section.listItems && section.listItems.length > 0 && (
                    <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/5 p-5">
                      {section.listTitle && (
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                          {section.listTitle}
                        </p>
                      )}

                      <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                        {section.listItems.map((item) => (
                          <li key={item} className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <aside className="space-y-6">
              <div className="rounded-[1.75rem] border border-primary/15 bg-primary/10 p-6">
                <h3 className="font-display text-2xl font-bold text-foreground">
                  {content.ctaTitle}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {content.ctaDescription}
                </p>

                <a
                  href={getWhatsAppLink(content.h1)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
                >
                  Escríbenos por WhatsApp
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>

              <div className="rounded-[1.75rem] border border-border/70 bg-card/60 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Keywords objetivo
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {content.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-border/70 px-3 py-1.5 text-xs text-muted-foreground"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          {content.faqs && content.faqs.length > 0 && (
            <div className="mt-10">
              <div className="mb-5">
                <h3 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                  Preguntas frecuentes
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Respuestas rápidas para búsquedas locales, comerciales e informativas.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {content.faqs.map((faq) => (
                  <FaqCard key={faq.question} item={faq} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SeoNarrative;

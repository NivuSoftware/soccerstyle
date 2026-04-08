import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import { BLOG_PAGE_CONTENT } from "@/data/seo-pages";

const BLOG_HIGHLIGHT_ORDER = [
  "como-elegir-zapatos-futbol-ecuador",
  "diferencia-pupillos-futsal-tacos",
  "donde-comprar-zapatos-futbol-riobamba",
] as const;

const BlogHighlightsSection = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 max-w-3xl">
          <div className="mb-4 h-0.5 w-12 bg-primary" />
          <h2 className="font-display text-3xl font-black text-foreground md:text-4xl">
            Contenido para posicionar y convertir
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
            Artículos creados para captar búsquedas informativas y empujarlas hacia las
            categorías con mayor intención de compra.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {BLOG_HIGHLIGHT_ORDER.map((slug) => {
            const article = BLOG_PAGE_CONTENT[slug];

            return (
              <Link
                key={slug}
                to={article.path}
                className="group rounded-[1.75rem] border border-border/70 bg-card/60 p-6 transition hover:-translate-y-1 hover:border-primary/40"
              >
                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Blog SEO
                </span>

                <h3 className="mt-4 font-display text-2xl font-bold text-foreground transition group-hover:text-primary">
                  {article.h1}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {article.metaDescription}
                </p>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Leer artículo
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BlogHighlightsSection;

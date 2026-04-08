import { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";

import LocalStoreSection from "@/components/seo/LocalStoreSection";
import ProductShowcaseSection from "@/components/seo/ProductShowcaseSection";
import Seo from "@/components/seo/Seo";
import SeoNarrative from "@/components/seo/SeoNarrative";
import type { Category } from "@/data/products";
import { LANDING_PAGE_CONTENT } from "@/data/seo-pages";
import { buildLocalBusinessSchema } from "@/data/seo";
import { useCatalog } from "@/context/CatalogContext";
import { buildCollectionPageSchema, buildFaqSchema } from "@/lib/seo-schemas";

const SeoLandingPage = () => {
  const location = useLocation();
  const { products, isLoading } = useCatalog();

  const slug = location.pathname.replace(/^\/+/, "");
  const content = slug ? LANDING_PAGE_CONTENT[slug] : null;

  const pageProducts = useMemo(() => {
    if (!content?.relatedCategories) {
      return [];
    }

    return products
      .filter((product) => content.relatedCategories?.includes(product.categoria as Category))
      .slice(0, 8);
  }, [content, products]);

  if (!content) {
    return <Navigate replace to="/" />;
  }

  const schemas = [buildCollectionPageSchema(content), buildLocalBusinessSchema()];

  if (content.faqs?.length) {
    schemas.push(buildFaqSchema(content.faqs));
  }

  return (
    <>
      <Seo
        title={content.title}
        description={content.metaDescription}
        path={content.path}
        keywords={content.keywords}
        schema={schemas}
      />

      <main className="min-h-screen pt-20 lg:pt-32">
        <section className="bg-card/50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <div className="mb-4 h-0.5 w-12 bg-primary" />
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                {content.sectionLabel}
              </p>
              <h1 className="mt-3 font-display text-4xl font-black text-foreground md:text-6xl">
                {content.h1}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                {content.heroDescription}
              </p>
            </div>
          </div>
        </section>

        <ProductShowcaseSection
          title={`Productos recomendados: ${content.h1}`}
          description={content.metaDescription}
          products={pageProducts}
          isLoading={isLoading}
        />
        <SeoNarrative content={content} />
        <LocalStoreSection />
      </main>
    </>
  );
};

export default SeoLandingPage;

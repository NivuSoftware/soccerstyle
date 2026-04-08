import { Navigate, useParams } from "react-router-dom";

import Seo from "@/components/seo/Seo";
import SeoNarrative from "@/components/seo/SeoNarrative";
import { BLOG_PAGE_CONTENT } from "@/data/seo-pages";
import { buildArticleSchema, buildFaqSchema } from "@/lib/seo-schemas";

const SeoArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const content = slug ? BLOG_PAGE_CONTENT[slug] : null;

  if (!content) {
    return <Navigate replace to="/" />;
  }

  const schemas = [buildArticleSchema(content)];

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
        type="article"
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

        <SeoNarrative content={content} />
      </main>
    </>
  );
};

export default SeoArticlePage;

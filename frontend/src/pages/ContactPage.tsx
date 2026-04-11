import LocalStoreSection from "@/components/seo/LocalStoreSection";
import Seo from "@/components/seo/Seo";
import { buildLocalBusinessSchema } from "@/data/seo";
import { CONTACT_PAGE_CONTENT } from "@/data/seo-pages";
import { buildContactPageSchema, buildFaqSchema } from "@/lib/seo-schemas";

const ContactPage = () => {
  const schemas = [
    buildContactPageSchema(CONTACT_PAGE_CONTENT),
    buildLocalBusinessSchema(),
  ];

  if (CONTACT_PAGE_CONTENT.faqs?.length) {
    schemas.push(buildFaqSchema(CONTACT_PAGE_CONTENT.faqs));
  }

  return (
    <>
      <Seo
        title={CONTACT_PAGE_CONTENT.title}
        description={CONTACT_PAGE_CONTENT.metaDescription}
        path={CONTACT_PAGE_CONTENT.path}
        keywords={CONTACT_PAGE_CONTENT.keywords}
        schema={schemas}
      />

      <main className="min-h-screen pt-20 lg:pt-32">
        <section className="bg-card/50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <div className="mb-4 h-0.5 w-12 bg-primary" />
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                {CONTACT_PAGE_CONTENT.sectionLabel}
              </p>
              <h1 className="mt-3 font-display text-4xl font-black text-foreground md:text-6xl">
                {CONTACT_PAGE_CONTENT.h1}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                {CONTACT_PAGE_CONTENT.heroDescription}
              </p>
            </div>
          </div>
        </section>

        <LocalStoreSection />

        {CONTACT_PAGE_CONTENT.faqs && CONTACT_PAGE_CONTENT.faqs.length > 0 && (
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div className="mb-8 max-w-3xl">
                <div className="mb-4 h-0.5 w-12 bg-primary" />
                <h2 className="font-display text-3xl font-black text-foreground md:text-4xl">
                  Preguntas frecuentes
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
                  Resolvemos las dudas más comunes sobre envíos, rastreo y garantías.
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                {CONTACT_PAGE_CONTENT.faqs.map((faq) => (
                  <article
                    key={faq.question}
                    className="rounded-[1.75rem] border border-border/70 bg-card/60 p-6"
                  >
                    <h3 className="font-display text-2xl font-bold text-foreground">
                      {faq.question}
                    </h3>
                    <p className="mt-4 text-justify text-sm leading-8 text-muted-foreground md:text-base">
                      {faq.answer}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
};

export default ContactPage;

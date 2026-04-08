import HeroSection from "@/components/HeroSection";
import CategoryGrid from "@/components/CategoryGrid";
import BenefitsSection from "@/components/BenefitsSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import PromotionalBanners from "@/components/PromotionalBanners";
import Seo from "@/components/seo/Seo";
import { buildLocalBusinessSchema, buildWebsiteSchema } from "@/data/seo";
import { HOME_PAGE_CONTENT } from "@/data/seo-pages";
import { buildWebPageSchema } from "@/lib/seo-schemas";

const Index = () => {
  const schemas = [
    buildWebPageSchema(HOME_PAGE_CONTENT),
    buildWebsiteSchema(),
    buildLocalBusinessSchema(),
  ];

  return (
    <>
      <Seo
        title={HOME_PAGE_CONTENT.title}
        description={HOME_PAGE_CONTENT.metaDescription}
        path={HOME_PAGE_CONTENT.path}
        keywords={HOME_PAGE_CONTENT.keywords}
        schema={schemas}
      />

      <main>
        <HeroSection />
        <PromotionalBanners />
        <FeaturedProducts />
        <CategoryGrid />
        <BenefitsSection />
      </main>
    </>
  );
};

export default Index;

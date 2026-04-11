import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Category } from "@/data/products";
import { getPublicCategoryPath } from "@/data/seo";
import { useCatalog } from "@/context/CatalogContext";
import { useCategoryPrompt } from "@/context/CategoryPromptContext";
import LazyImage from "@/components/LazyImage";

import catPupos from "@/assets/cat-pupos.jpg";
import catPupillos from "@/assets/pupillos-futbol-ecuador.jpg";
import catFutsal from "@/assets/zapatos-futsal-ecuador.jpg";
import catGuantes from "@/assets/cat-guantes.jpg";
import catRopa from "@/assets/cat-ropa.jpeg";
import catAccesorios from "@/assets/cat-accesorios.jpg";

const categoryImages: Record<Category, string> = {
  pupos: catPupos,
  pupillos: catPupillos,
  futsal: catFutsal,
  guantes: catGuantes,
  ropa: catRopa,
  accesorios: catAccesorios,
};

const CategoryGrid = () => {
  const { availableCategories, isLoading } = useCatalog();
  const { openCategoryPrompt } = useCategoryPrompt();

  const handleCategoryClick = (
    event: MouseEvent<HTMLAnchorElement>,
    category: { slug: Category; label: string },
  ) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();
    openCategoryPrompt(category);
  };

  if (!isLoading && availableCategories.length === 0) {
    return null;
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
            Categorías
          </h2>
          <p className="text-muted-foreground">Todo lo que necesitas para el fútbol</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {availableCategories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={getPublicCategoryPath(cat.slug)}
                onClick={(event) => handleCategoryClick(event, cat)}
                className="group block relative w-full overflow-hidden rounded-xl aspect-square text-left"
              >
                <LazyImage
                  src={categoryImages[cat.slug]}
                  alt={`${cat.label} de fútbol en Riobamba, Latacunga y Ecuador`}
                  width={800}
                  height={800}
                  eager={i < 2}
                  className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 border-2 border-primary/50 rounded-xl box-glow" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                    {cat.label}
                  </h3>
                  <div className="h-0.5 w-0 group-hover:w-12 bg-primary transition-all duration-500 mt-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;

import { LoaderCircle } from "lucide-react";

import ProductCard from "@/components/ProductCard";
import type { Category } from "@/data/products";
import { getCategorySeoLabel } from "@/data/seo";
import type { AdminProduct } from "@/types/product";

interface ProductShowcaseSectionProps {
  title: string;
  description: string;
  products: AdminProduct[];
  isLoading?: boolean;
}

const ProductShowcaseSection = ({
  title,
  description,
  products,
  isLoading = false,
}: ProductShowcaseSectionProps) => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 max-w-3xl">
          <div className="mb-4 h-0.5 w-12 bg-primary" />
          <h2 className="font-display text-3xl font-black text-foreground md:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
            {description}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-primary" />
            Cargando productos...
          </div>
        ) : products.length === 0 ? (
          <p className="rounded-2xl border border-border/60 bg-card/50 px-6 py-10 text-center text-muted-foreground">
            No hay productos visibles en esta sección por ahora.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                index={index}
                showBrandBadge={false}
                product={{
                  id: String(product.id),
                  name: product.nombre,
                  brand: getCategorySeoLabel(product.categoria as Category),
                  price: product.precio,
                  gift: product.gift,
                  sizes: product.tallas_disponibles,
                  image: product.imagen.url,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductShowcaseSection;

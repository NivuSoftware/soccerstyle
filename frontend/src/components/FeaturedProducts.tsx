import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useSizeContext } from "@/context/SizeContext";
import { CATEGORIES } from "@/data/products";
import { productService } from "@/services/productService";
import type { AdminProduct } from "@/types/product";

const FeaturedProducts = () => {
  const { selectedSize } = useSizeContext();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  useEffect(() => {
    let isMounted = true;

    const loadFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const featuredProducts = await productService.listFeatured();

        if (isMounted) {
          setProducts(featuredProducts);
        }
      } catch (unknownError) {
        if (isMounted) {
          setError(
            unknownError instanceof Error
              ? unknownError.message
              : "No pudimos cargar los productos destacados.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadFeaturedProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredFeatured = products.filter((product) =>
    selectedSize ? product.tallas_disponibles.includes(String(selectedSize)) : true,
  );

  useEffect(() => {
    if (!carouselApi || filteredFeatured.length <= 1) {
      return;
    }

    const autoplayInterval = window.setInterval(() => {
      carouselApi.scrollNext();
    }, 5000);

    return () => {
      window.clearInterval(autoplayInterval);
    };
  }, [carouselApi, filteredFeatured.length]);

  const getCategoryLabel = (categorySlug: string) =>
    CATEGORIES.find((category) => category.slug === categorySlug)?.label ?? categorySlug;

  return (
    <section className="py-10 bg-card/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
            Productos <span className="text-primary">destacados</span>
          </h2>
          <p className="text-muted-foreground">
            Mira nuestras ultimas novedades y los productos más populares entre nuestros clientes. ¡Encuentra tu próximo favorito aquí!
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-primary" />
            Cargando productos destacados...
          </div>
        ) : error ? (
          <p className="text-center text-muted-foreground">{error}</p>
        ) : filteredFeatured.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No hay productos destacados en la talla seleccionada. Prueba con otra talla.
          </p>
        ) : (
          <Carousel
            setApi={setCarouselApi}
            opts={{
              align: "start",
              loop: filteredFeatured.length > 1,
            }}
            className="mx-auto w-full"
          >
            <CarouselContent className="-ml-3 md:-ml-4">
              {filteredFeatured.map((product, index) => (
                <CarouselItem
                  key={product.id}
                  className="basis-[84%] pl-3 sm:basis-1/2 sm:pl-4 xl:basis-1/3"
                >
                  <motion.article
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.45 }}
                    className="group h-full overflow-hidden rounded-[1.35rem] border border-border bg-card shadow-[0_0_32px_rgba(34,197,94,0.04)] transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_0_38px_rgba(34,197,94,0.12)] sm:rounded-[1.5rem]"
                  >
                    <div className="relative aspect-[1/1] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_38%),linear-gradient(180deg,_rgba(11,19,14,0.9),_rgba(8,13,10,1))]">
                      <img
                        src={product.imagen.url}
                        alt={`${product.nombre} en Soccer Style Ecuador`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
                      <span className="absolute left-4 top-4 rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary backdrop-blur">
                        {getCategoryLabel(product.categoria)}
                      </span>
                      {product.destacar && (
                        <span className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground">
                          Destacado
                        </span>
                      )}
                    </div>

                    <div className="flex h-[calc(100%-1px)] flex-col p-4 sm:p-5">
                      <h3 className="line-clamp-2 font-display text-xl font-bold text-foreground transition-colors duration-300 group-hover:text-primary sm:text-2xl">
                        {product.nombre}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
                        {product.tallas_disponibles.slice(0, 4).map((size) => (
                          <span
                            key={`${product.id}-${size}`}
                            className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                          >
                            {size}
                          </span>
                        ))}
                        {product.tallas_disponibles.length > 4 && (
                          <span className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                            +{product.tallas_disponibles.length - 4}
                          </span>
                        )}
                      </div>

                      <div className="mt-5 flex items-end justify-between gap-3 sm:mt-6 sm:gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Precio
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <p className="font-display text-2xl font-black text-primary sm:text-3xl">
                              ${product.precio.toFixed(2)}
                            </p>
                            {product.gift && (
                              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                + Regalo
                              </span>
                            )}
                          </div>
                        </div>

                        <Link
                          to={`/producto/${product.id}`}
                          aria-label={`Ver ${product.nombre} en Soccer Style`}
                          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground sm:px-4"
                        >
                          Ver producto
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;

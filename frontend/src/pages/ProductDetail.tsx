import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { CATEGORIES, getWhatsAppLink } from "@/data/products";
import { buildLocalBusinessSchema } from "@/data/seo";
import { buildProductSchema } from "@/lib/seo-schemas";
import { productService } from "@/services/productService";
import type { AdminProduct } from "@/types/product";

interface ProductDetailView {
  id: string;
  nombre: string;
  descriptor: string;
  categoria: string;
  precio: number;
  gift: boolean;
  tallas: string[];
  imagenes: string[];
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetailView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const mapApiProduct = (apiProduct: AdminProduct): ProductDetailView => ({
      id: String(apiProduct.id),
      nombre: apiProduct.nombre,
      descriptor:
        CATEGORIES.find((category) => category.slug === apiProduct.categoria)?.label ?? "Soccer Style",
      categoria: apiProduct.categoria,
      precio: apiProduct.precio,
      gift: apiProduct.gift,
      tallas: apiProduct.tallas_disponibles,
      imagenes: apiProduct.imagenes.length > 0
        ? apiProduct.imagenes.map((image) => image.url)
        : [apiProduct.imagen.url],
    });

    const loadProduct = async () => {
      if (!id) {
        setProduct(null);
        setIsLoading(false);
        return;
      }

      if (!/^\d+$/.test(id)) {
        if (isMounted) {
          setProduct(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        const apiProduct = await productService.getPublicById(Number(id));

        if (isMounted) {
          setProduct(mapApiProduct(apiProduct));
        }
      } catch {
        if (isMounted) {
          setProduct(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    setSelectedSize(null);
    setSelectedImageIndex(0);
  }, [product?.id]);

  const handlePreviousImage = () => {
    if (!product || product.imagenes.length <= 1) {
      return;
    }

    setDirection(-1);

    setSelectedImageIndex((currentIndex) =>
      currentIndex === 0 ? product.imagenes.length - 1 : currentIndex - 1,
    );
  };

  const handleNextImage = () => {
    if (!product || product.imagenes.length <= 1) {
      return;
    }

    setDirection(1);

    setSelectedImageIndex((currentIndex) =>
      currentIndex === product.imagenes.length - 1 ? 0 : currentIndex + 1,
    );
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) {
      return;
    }

    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      handleNextImage();
    } else if (distance < -minSwipeDistance) {
      handlePreviousImage();
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
          Cargando producto...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-muted-foreground">Producto no encontrado</p>
      </div>
    );
  }

  const activeImage = product.imagenes[selectedImageIndex] ?? product.imagenes[0];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 350 : -350,
    }),
    center: {
      x: 0,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -350 : 350,
    }),
  };

  const productDescription = `${product.nombre} en Soccer Style Ecuador. Disponible en ${product.descriptor.toLowerCase()} con atención en Riobamba, Latacunga y ventas en Ecuador.`;
  const productSchemas = [
    buildProductSchema({
      name: product.nombre,
      description: productDescription,
      image: activeImage,
      price: product.precio,
      path: `/producto/${product.id}`,
    }),
    buildLocalBusinessSchema(),
  ];

  return (
    <>
      <Seo
        title={`${product.nombre} | Soccer Style Ecuador`}
        description={productDescription}
        path={`/producto/${product.id}`}
        keywords={[
          product.nombre,
          product.descriptor,
          "zapatos de futbol ecuador",
          "Soccer Style",
        ]}
        image={activeImage}
        type="product"
        schema={productSchemas}
      />

      <main className="min-h-screen pt-20 lg:pt-32">
        <div className="container mx-auto px-4 py-12">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm"
          >
            <ArrowLeft size={16} /> Volver
          </motion.button>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            <div>
              <motion.div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="relative aspect-square bg-card rounded-2xl border border-border overflow-hidden flex items-center justify-center touch-pan-y"
              >
                <AnimatePresence custom={direction}>
                  <motion.img
                    key={activeImage}
                    src={activeImage}
                    alt={`${product.nombre} ${product.descriptor.toLowerCase()} en Soccer Style Ecuador`}
                    width={600}
                    height={600}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: {
                        duration: 0.3,
                        ease: "easeInOut",
                      },
                    }}
                    className="absolute inset-0 h-full w-full object-contain p-6 select-none pointer-events-none"
                  />
                </AnimatePresence>

                {product.imagenes.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePreviousImage}
                      className="absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/80 text-foreground backdrop-blur transition hover:border-primary hover:text-primary md:inline-flex"
                      aria-label="Ver imagen anterior"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/80 text-foreground backdrop-blur transition hover:border-primary hover:text-primary md:inline-flex"
                      aria-label="Ver siguiente imagen"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    <div className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur md:block">
                      {selectedImageIndex + 1} / {product.imagenes.length}
                    </div>
                  </>
                )}
              </motion.div>

              {product.imagenes.length > 1 && (
                <>
                  <div className="mt-4 flex items-center justify-center gap-2 md:hidden">
                    {product.imagenes.slice(0, 5).map((imageUrl, index) => (
                      <button
                        key={`${imageUrl}-${index}`}
                        type="button"
                        onClick={() => {
                          setDirection(index > selectedImageIndex ? 1 : -1);
                          setSelectedImageIndex(index);
                        }}
                        className={`h-2.5 w-2.5 rounded-full transition ${
                          selectedImageIndex === index
                            ? "bg-foreground"
                            : "bg-muted-foreground/35"
                        }`}
                        aria-label={`Ver imagen ${index + 1}`}
                      />
                    ))}
                  </div>

                  <div className="mt-4 hidden grid-cols-5 gap-3 md:grid">
                    {product.imagenes.slice(0, 5).map((imageUrl, index) => (
                      <button
                        key={`${imageUrl}-${index}`}
                        type="button"
                        onClick={() => setSelectedImageIndex(index)}
                        className={`overflow-hidden rounded-xl border transition ${
                          selectedImageIndex === index
                            ? "border-primary shadow-[0_0_18px_rgba(34,197,94,0.18)]"
                            : "border-border/70 hover:border-primary/40"
                        }`}
                      >
                        <img
                          src={imageUrl}
                          alt={`${product.nombre} vista ${index + 1} en Soccer Style Ecuador`}
                          loading="lazy"
                          className="h-20 w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col justify-center"
            >
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {product.descriptor}
              </span>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 text-foreground">
                {product.nombre}
              </h1>
              <p className="mb-5 max-w-xl text-sm leading-7 text-muted-foreground">
                Compra {product.nombre} en Soccer Style con atención en Riobamba, Latacunga y
                Ecuador. Revisa tallas disponibles y consulta por WhatsApp para cerrar tu pedido.
              </p>
              <div className="mb-8 flex flex-wrap items-center gap-3">
                <span className="text-3xl font-display font-bold text-primary">
                  ${product.precio.toFixed(2)}
                </span>
                {product.gift && (
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    + Regalo
                  </span>
                )}
              </div>

              <div className="mb-8">
                <p className="text-sm font-medium text-foreground mb-3">Tallas disponibles</p>
                <div className="flex flex-wrap gap-2">
                  {product.tallas.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                      className={`w-12 h-12 rounded-lg font-display font-bold text-sm transition-all duration-300 ${
                        selectedSize === size
                          ? "gradient-neon text-primary-foreground box-glow"
                          : "bg-secondary text-secondary-foreground hover:border-primary/50 border border-transparent"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <motion.a
                href={getWhatsAppLink(product.nombre + (selectedSize ? ` - Talla ${selectedSize}` : ""))}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl gradient-neon text-primary-foreground font-semibold text-base tracking-wide box-glow hover:box-glow-strong transition-shadow"
              >
                Estoy interesado en este producto
              </motion.a>

              <p className="text-xs text-muted-foreground mt-3 text-center">
                Te redirigiremos a WhatsApp para completar tu pedido
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ProductDetail;

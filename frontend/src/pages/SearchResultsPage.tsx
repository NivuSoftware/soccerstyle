import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

import ProductCard from "@/components/ProductCard";
import Seo from "@/components/seo/Seo";
import { useCatalog } from "@/context/CatalogContext";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const { products, isLoading } = useCatalog();

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        product.nombre.toLowerCase().includes(normalizedQuery),
      ),
    [products, normalizedQuery],
  );

  return (
    <>
      <Seo
        title={query ? `Buscar "${query}" | Soccer Style` : "Buscar productos | Soccer Style"}
        description="Resultados de búsqueda internos del catálogo de Soccer Style."
        path={`/buscar${query ? `?q=${encodeURIComponent(query)}` : ""}`}
        robots="noindex, follow"
      />

      <main className="min-h-screen pt-20 lg:pt-32">
        <section className="bg-card/50 py-12">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-4 h-0.5 w-12 bg-primary" />
              <h1 className="text-4xl font-display font-bold md:text-5xl">
                Resultados de búsqueda
              </h1>
              <p className="mt-2 text-muted-foreground">
                {query
                  ? `Mostrando productos para "${query}".`
                  : "Escribe el nombre de un producto para buscarlo."}
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <p className="py-16 text-center text-muted-foreground">Cargando productos...</p>
            ) : !query ? (
              <p className="py-16 text-center text-muted-foreground">
                Ingresa un nombre en la barra de búsqueda.
              </p>
            ) : filteredProducts.length === 0 ? (
              <p className="py-16 text-center text-muted-foreground">
                No encontramos productos con ese nombre.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    index={index}
                    product={{
                      id: String(product.id),
                      name: product.nombre,
                      brand: product.categoria,
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
      </main>
    </>
  );
};

export default SearchResultsPage;

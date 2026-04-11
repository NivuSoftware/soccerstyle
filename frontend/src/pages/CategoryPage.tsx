import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowDownUp, ChevronLeft, ChevronRight, LoaderCircle, Ruler, SlidersHorizontal, X } from "lucide-react";
import Seo from "@/components/seo/Seo";
import {
  CATEGORIES,
  getCategoryPromptSizes,
  getCategorySizeMode,
  normalizeCategorySize,
} from "@/data/products";
import { buildLocalBusinessSchema } from "@/data/seo";
import { CATEGORY_ROUTE_MAP } from "@/data/seo-pages";
import { useCatalog } from "@/context/CatalogContext";
import { buildCollectionPageSchema, buildFaqSchema } from "@/lib/seo-schemas";
import ProductCard from "@/components/ProductCard";

const SORT_OPTIONS = [
  { value: "recent", label: "Más reciente" },
  { value: "name_asc", label: "Nombre A-Z" },
  { value: "name_desc", label: "Nombre Z-A" },
  { value: "price_desc", label: "Precio mayor" },
  { value: "price_asc", label: "Precio menor" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, isLoading } = useCatalog();

  const categoryConfig = slug ? CATEGORY_ROUTE_MAP[slug] : null;
  const category = CATEGORIES.find((c) => c.slug === categoryConfig?.category);
  const categoryProducts = products.filter((product) => product.categoria === categoryConfig?.category);
  const categorySizeMode = getCategorySizeMode(categoryConfig?.category);
  const promptSizes = useMemo(() => getCategoryPromptSizes(categoryConfig?.category), [categoryConfig?.category]);
  const PAGE_SIZE = 20;
  const requestedPage = Number(searchParams.get("pagina")) || 1;
  const requestedSort = searchParams.get("orden");
  const selectedSort: SortValue = SORT_OPTIONS.some((option) => option.value === requestedSort)
    ? (requestedSort as SortValue)
    : "recent";
  const requestedSize = searchParams.get("talla");
  const selectedSize =
    requestedSize && promptSizes.includes(normalizeCategorySize(requestedSize))
      ? normalizeCategorySize(requestedSize)
      : null;
  const filtered = useMemo(() => {
    const nextProducts = categoryProducts.filter((product) =>
      selectedSize
        ? product.tallas_disponibles
            .map((size) => normalizeCategorySize(size))
            .includes(selectedSize)
        : true,
    );

    return [...nextProducts].sort((left, right) => {
      switch (selectedSort) {
        case "name_asc":
          return left.nombre.localeCompare(right.nombre, undefined, {
            sensitivity: "base",
          });
        case "name_desc":
          return right.nombre.localeCompare(left.nombre, undefined, {
            sensitivity: "base",
          });
        case "price_asc":
          return left.precio - right.precio;
        case "price_desc":
          return right.precio - left.precio;
        case "recent":
        default:
          return (
            new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()
          );
      }
    });
  }, [categoryProducts, selectedSize, selectedSort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages || 1);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearchParamUpdate = (
    key: "talla" | "orden" | "pagina",
    value: string | null,
    resetPage = false,
  ) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    if (resetPage) nextParams.delete("pagina");
    setSearchParams(nextParams);
  };

  const handlePageChange = (page: number) => {
    handleSearchParamUpdate("pagina", page > 1 ? String(page) : null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectSize = (size: string | null) => {
    handleSearchParamUpdate("talla", size, true);
  };

  const handleSortChange = (value: string) => {
    handleSearchParamUpdate("orden", value, true);
  };

  const activeSortLabel =
    SORT_OPTIONS.find((option) => option.value === selectedSort)?.label ?? "Más reciente";

  const resultLabel = selectedSize
    ? categorySizeMode === "us"
      ? `en talla USA ${selectedSize}`
      : `en talla ${selectedSize}`
    : "sin filtro de talla";
  const emptyStateMessage = selectedSize
    ? categorySizeMode === "us"
      ? `No existen productos con esa talla USA (${selectedSize}).`
      : `No existen productos con esa talla (${selectedSize}).`
    : "No hay productos disponibles en esta categoría.";

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
          Cargando categoría...
        </div>
      </div>
    );
  }

  if (!category || categoryProducts.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-muted-foreground">Categoría no disponible</p>
      </div>
    );
  }

  const schemas = [buildCollectionPageSchema(categoryConfig), buildLocalBusinessSchema()];

  if (categoryConfig.faqs?.length) {
    schemas.push(buildFaqSchema(categoryConfig.faqs));
  }

  return (
    <>
      <Seo
        title={categoryConfig.title}
        description={categoryConfig.metaDescription}
        path={categoryConfig.canonicalPath}
        keywords={categoryConfig.keywords}
        schema={schemas}
      />

      <main className="min-h-screen pt-20 lg:pt-32">
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl"
            >
              <div className="h-0.5 w-12 bg-primary mb-4" />
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">
                {category.label}
              </h1>
              <p className="text-muted-foreground">
                {filtered.length} producto{filtered.length !== 1 ? "s" : ""} disponible{filtered.length !== 1 ? "s" : ""}
                {selectedSize
                  ? categorySizeMode === "us"
                    ? ` en talla USA ${selectedSize}`
                    : ` en talla ${selectedSize}`
                  : ""}
                {totalPages > 1 && ` · página ${currentPage} de ${totalPages}`}
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[1.25rem] border border-primary/15 bg-card/60 p-4 backdrop-blur-xl"
            >
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtros
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs text-primary sm:text-sm">
                    {resultLabel}
                  </span>
                  <span className="rounded-full border border-border/70 bg-background/50 px-3 py-1.5 text-xs text-muted-foreground sm:text-sm">
                    Orden: {activeSortLabel}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 xl:grid-cols-[1.35fr_0.8fr]">
                {categorySizeMode !== "none" ? (
                  <div className="rounded-xl border border-border/60 bg-background/35 p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        <Ruler className="h-4 w-4 text-primary" />
                        Talla
                      </label>
                      {selectedSize && (
                        <button
                          type="button"
                          onClick={() => handleSelectSize(null)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-primary"
                        >
                          <X className="h-3.5 w-3.5" />
                          Limpiar
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <select
                        value={selectedSize ?? ""}
                        onChange={(event) => handleSelectSize(event.target.value || null)}
                        className="flex h-10 w-full rounded-lg border border-border/70 bg-background/80 px-3 text-sm text-foreground outline-none transition focus:border-primary/40"
                      >
                        <option value="">
                          {categorySizeMode === "us"
                            ? "Todas las tallas USA"
                            : "Todas las tallas"}
                        </option>
                        {promptSizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>

                      <p className="text-xs text-muted-foreground">
                        {selectedSize
                          ? categorySizeMode === "us"
                            ? `Filtrando por talla USA ${selectedSize}`
                            : `Filtrando por talla ${selectedSize}`
                          : "Mostrando productos de todas las tallas"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border/60 bg-background/35 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Talla</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Esta categoría no requiere talla.
                    </p>
                  </div>
                )}

                <div className="rounded-xl border border-border/60 bg-background/35 p-3">
                  <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <ArrowDownUp className="h-4 w-4 text-primary" />
                    Ordenar por
                  </label>
                  <select
                    value={selectedSort}
                    onChange={(event) => handleSortChange(event.target.value)}
                    className="flex h-10 w-full rounded-lg border border-border/70 bg-background/80 px-3 text-sm text-foreground outline-none transition focus:border-primary/40"
                  >
                    <option disabled value="">
                      Ordenar por...
                    </option>
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            {filtered.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted-foreground py-16"
              >
                {emptyStateMessage}
              </motion.p>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {paginated.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      index={i}
                      showBrandBadge={false}
                      product={{
                        id: String(product.id),
                        name: product.nombre,
                        brand: category.label,
                        price: product.precio,
                        gift: product.gift,
                        sizes: product.tallas_disponibles,
                        image: product.imagen.url,
                      }}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-border/70 bg-card text-muted-foreground transition hover:border-primary/50 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Página anterior"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                      .filter((page) =>
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      )
                      .reduce<(number | "...")[]>((acc, page, i, arr) => {
                        if (i > 0 && (page as number) - (arr[i - 1] as number) > 1) acc.push("...");
                        acc.push(page);
                        return acc;
                      }, [])
                      .map((item, i) =>
                        item === "..." ? (
                          <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground text-sm">…</span>
                        ) : (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handlePageChange(item as number)}
                            className={`inline-flex items-center justify-center h-10 min-w-10 px-3 rounded-lg border text-sm font-medium transition ${
                              currentPage === item
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border/70 bg-card text-muted-foreground hover:border-primary/50 hover:text-primary"
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}

                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-border/70 bg-card text-muted-foreground transition hover:border-primary/50 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Página siguiente"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default CategoryPage;

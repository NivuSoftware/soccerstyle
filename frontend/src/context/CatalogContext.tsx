import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { CATEGORIES } from "@/data/products";
import { productService } from "@/services/productService";
import type { AdminProduct } from "@/types/product";

interface CatalogContextValue {
  products: AdminProduct[];
  availableCategories: typeof CATEGORIES;
  isLoading: boolean;
  error: string | null;
}

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);

export const CatalogProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const catalogProducts = await productService.listPublic();

        if (isMounted) {
          setProducts(
            catalogProducts.filter((product) => product.estado === "ACTIVO"),
          );
        }
      } catch (unknownError) {
        if (isMounted) {
          setError(
            unknownError instanceof Error
              ? unknownError.message
              : "No pudimos cargar el catálogo.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const availableCategories = useMemo(
    () =>
      CATEGORIES.filter((category) =>
        products.some((product) => product.categoria === category.slug),
      ),
    [products],
  );

  return (
    <CatalogContext.Provider
      value={{
        products,
        availableCategories,
        isLoading,
        error,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);

  if (!context) {
    throw new Error("useCatalog debe usarse dentro de CatalogProvider");
  }

  return context;
};

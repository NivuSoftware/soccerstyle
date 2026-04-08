import { useEffect, useState } from "react";

import { ApiError } from "@/services/apiClient";
import { productService } from "@/services/productService";
import type { AdminProduct, ProductMutationPayload } from "@/types/product";

interface UseAdminProductsOptions {
  token: string | null;
  onUnauthorized?: () => void;
}

function sortProducts(products: AdminProduct[]) {
  return [...products].sort(
    (left, right) =>
      new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
  );
}

export const useAdminProducts = ({ token, onUnauthorized }: UseAdminProductsOptions) => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolveErrorMessage = (unknownError: unknown) => {
    if (unknownError instanceof ApiError && unknownError.status === 401) {
      onUnauthorized?.();
    }

    return (
      unknownError instanceof Error
        ? unknownError.message
        : "No pudimos completar la operacion."
    );
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.list();
      setProducts(sortProducts(data));
    } catch (unknownError) {
      setError(resolveErrorMessage(unknownError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const createProduct = async (payload: ProductMutationPayload) => {
    if (!token) {
      const unauthorizedError = new ApiError(401, "Tu sesion ha expirado.");
      setError(resolveErrorMessage(unauthorizedError));
      throw unauthorizedError;
    }

    try {
      setError(null);
      const created = await productService.create(payload, token);
      setProducts((currentProducts) => sortProducts([created, ...currentProducts]));
    } catch (unknownError) {
      setError(resolveErrorMessage(unknownError));
      throw unknownError;
    }
  };

  const updateProduct = async (productId: number, payload: ProductMutationPayload) => {
    if (!token) {
      const unauthorizedError = new ApiError(401, "Tu sesion ha expirado.");
      setError(resolveErrorMessage(unauthorizedError));
      throw unauthorizedError;
    }

    try {
      setError(null);
      const updated = await productService.update(productId, payload, token);
      setProducts((currentProducts) =>
        sortProducts(
          currentProducts.map((product) =>
            product.id === productId ? updated : product,
          ),
        ),
      );
    } catch (unknownError) {
      setError(resolveErrorMessage(unknownError));
      throw unknownError;
    }
  };

  const deleteProduct = async (productId: number) => {
    if (!token) {
      const unauthorizedError = new ApiError(401, "Tu sesion ha expirado.");
      setError(resolveErrorMessage(unauthorizedError));
      throw unauthorizedError;
    }

    try {
      setError(null);
      await productService.remove(productId, token);
      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== productId),
      );
    } catch (unknownError) {
      setError(resolveErrorMessage(unknownError));
      throw unknownError;
    }
  };

  return {
    products,
    isLoading,
    error,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    clearError: () => setError(null),
  };
};

import { apiClient } from "@/services/apiClient";
import type { AdminProduct, ProductMutationPayload } from "@/types/product";

function buildProductFormData(payload: ProductMutationPayload) {
  const formData = new FormData();
  formData.append("nombre", payload.nombre);
  formData.append("categoria", payload.categoria);
  formData.append("estado", payload.estado);
  formData.append("destacar", String(payload.destacar));
  formData.append("gift", String(payload.gift));
  formData.append("precio", String(payload.precio));
  formData.append("tallas", JSON.stringify(payload.tallas));
  formData.append(
    "imagenes_existentes_json",
    JSON.stringify(payload.imagenesExistentes ?? []),
  );

  payload.imagenes.forEach((imageFile) => {
    formData.append("imagenes", imageFile);
  });

  return formData;
}

export const productService = {
  list() {
    return apiClient<AdminProduct[]>("/api/products/");
  },

  listPublic() {
    return apiClient<AdminProduct[]>("/api/products/?solo_activos=true");
  },

  getById(productId: number) {
    return apiClient<AdminProduct>(`/api/products/${productId}`);
  },

  getPublicById(productId: number) {
    return apiClient<AdminProduct>(`/api/products/${productId}?solo_activos=true`);
  },

  async listFeatured() {
    const products = await apiClient<AdminProduct[]>("/api/products/?solo_activos=true");
    return products.filter((product) => product.destacar);
  },

  create(payload: ProductMutationPayload, token: string) {
    return apiClient<AdminProduct>("/api/products/", {
      method: "POST",
      body: buildProductFormData(payload),
      token,
    });
  },

  update(productId: number, payload: ProductMutationPayload, token: string) {
    return apiClient<AdminProduct>(`/api/products/${productId}`, {
      method: "PUT",
      body: buildProductFormData(payload),
      token,
    });
  },

  remove(productId: number, token: string) {
    return apiClient<{ message: string }>(`/api/products/${productId}`, {
      method: "DELETE",
      token,
    });
  },
};

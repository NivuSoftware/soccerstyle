import { apiClient } from "@/services/apiClient";
import type { Banner, BannerMutationPayload } from "@/types/banner";

function buildBannerFormData(payload: BannerMutationPayload) {
  const formData = new FormData();
  formData.append("imagen", payload.imagen);
  return formData;
}

export const bannerService = {
  list() {
    return apiClient<Banner[]>("/api/banners/");
  },

  create(payload: BannerMutationPayload, token: string) {
    return apiClient<Banner>("/api/banners/", {
      method: "POST",
      body: buildBannerFormData(payload),
      token,
    });
  },

  update(bannerId: number, payload: BannerMutationPayload, token: string) {
    return apiClient<Banner>(`/api/banners/${bannerId}`, {
      method: "PUT",
      body: buildBannerFormData(payload),
      token,
    });
  },

  remove(bannerId: number, token: string) {
    return apiClient<{ message: string }>(`/api/banners/${bannerId}`, {
      method: "DELETE",
      token,
    });
  },
};

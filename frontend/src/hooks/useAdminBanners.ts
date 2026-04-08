import { useEffect, useState } from "react";

import { ApiError } from "@/services/apiClient";
import { bannerService } from "@/services/bannerService";
import type { Banner, BannerMutationPayload } from "@/types/banner";

interface UseAdminBannersOptions {
  token: string | null;
  onUnauthorized?: () => void;
}

function sortBanners(banners: Banner[]) {
  return [...banners].sort(
    (left, right) =>
      new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
  );
}

export const useAdminBanners = ({ token, onUnauthorized }: UseAdminBannersOptions) => {
  const [banners, setBanners] = useState<Banner[]>([]);
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

  const loadBanners = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bannerService.list();
      setBanners(sortBanners(data));
    } catch (unknownError) {
      setError(resolveErrorMessage(unknownError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadBanners();
  }, []);

  const createBanner = async (payload: BannerMutationPayload) => {
    if (!token) {
      const unauthorizedError = new ApiError(401, "Tu sesion ha expirado.");
      setError(resolveErrorMessage(unauthorizedError));
      throw unauthorizedError;
    }

    try {
      setError(null);
      const created = await bannerService.create(payload, token);
      setBanners((currentBanners) => sortBanners([created, ...currentBanners]));
    } catch (unknownError) {
      setError(resolveErrorMessage(unknownError));
      throw unknownError;
    }
  };

  const updateBanner = async (bannerId: number, payload: BannerMutationPayload) => {
    if (!token) {
      const unauthorizedError = new ApiError(401, "Tu sesion ha expirado.");
      setError(resolveErrorMessage(unauthorizedError));
      throw unauthorizedError;
    }

    try {
      setError(null);
      const updated = await bannerService.update(bannerId, payload, token);
      setBanners((currentBanners) =>
        sortBanners(
          currentBanners.map((banner) => (banner.id === bannerId ? updated : banner)),
        ),
      );
    } catch (unknownError) {
      setError(resolveErrorMessage(unknownError));
      throw unknownError;
    }
  };

  const deleteBanner = async (bannerId: number) => {
    if (!token) {
      const unauthorizedError = new ApiError(401, "Tu sesion ha expirado.");
      setError(resolveErrorMessage(unauthorizedError));
      throw unauthorizedError;
    }

    try {
      setError(null);
      await bannerService.remove(bannerId, token);
      setBanners((currentBanners) =>
        currentBanners.filter((banner) => banner.id !== bannerId),
      );
    } catch (unknownError) {
      setError(resolveErrorMessage(unknownError));
      throw unknownError;
    }
  };

  return {
    banners,
    isLoading,
    error,
    loadBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    clearError: () => setError(null),
  };
};

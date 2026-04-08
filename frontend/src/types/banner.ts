import type { ProductImage } from "@/types/product";

export interface Banner {
  id: number;
  imagen: ProductImage;
  created_at: string;
  updated_at: string;
}

export interface BannerMutationPayload {
  imagen: File;
}

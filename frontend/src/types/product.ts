export interface ProductImage {
  filename: string;
  url: string;
}

export type ProductStatus = "ACTIVO" | "INACTIVO";

export interface AdminProduct {
  id: number;
  nombre: string;
  categoria: string;
  estado: ProductStatus;
  destacar: boolean;
  gift: boolean;
  tallas_disponibles: string[];
  precio: number;
  imagen: ProductImage;
  imagenes: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface ProductMutationPayload {
  nombre: string;
  categoria: string;
  estado: ProductStatus;
  destacar: boolean;
  gift: boolean;
  precio: number;
  tallas: string[];
  imagenes: File[];
  imagenesExistentes?: string[];
}

export interface ProductFormValues {
  nombre: string;
  categoria: string;
  estado: ProductStatus;
  destacar: boolean;
  gift: boolean;
  precio: string;
  tallas: string;
  imagenes: File[];
}

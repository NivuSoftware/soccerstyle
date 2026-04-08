import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, LoaderCircle, X } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES } from "@/data/products";
import type { AdminProduct, ProductFormValues, ProductMutationPayload } from "@/types/product";

interface ProductFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  product: AdminProduct | null;
  isSubmitting: boolean;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: ProductMutationPayload) => Promise<void>;
}

interface LocalImagePreview {
  id: string;
  file: File;
  url: string;
}

const emptyFormValues: ProductFormValues = {
  nombre: "",
  categoria: "",
  estado: "ACTIVO",
  destacar: false,
  gift: false,
  precio: "",
  tallas: "",
  imagenes: [],
};

function parseSizes(rawSizes: string) {
  return rawSizes
    .split(",")
    .map((size) => size.trim())
    .filter(Boolean);
}

const ProductFormDialog = ({
  open,
  mode,
  product,
  isSubmitting,
  error,
  onOpenChange,
  onSubmit,
}: ProductFormDialogProps) => {
  const [formValues, setFormValues] = useState<ProductFormValues>(emptyFormValues);
  const [formError, setFormError] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<AdminProduct["imagenes"]>([]);
  const [localImages, setLocalImages] = useState<LocalImagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const localImagesRef = useRef<LocalImagePreview[]>([]);

  const cleanupLocalImages = (images: LocalImagePreview[]) => {
    images.forEach((image) => URL.revokeObjectURL(image.url));
  };

  useEffect(() => {
    localImagesRef.current = localImages;
  }, [localImages]);

  useEffect(() => {
    if (!open) {
      cleanupLocalImages(localImagesRef.current);
      localImagesRef.current = [];
      setExistingImages([]);
      setLocalImages([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    cleanupLocalImages(localImagesRef.current);
    localImagesRef.current = [];
    setFormError(null);
    setFormValues(
      product
        ? {
            nombre: product.nombre,
            categoria: product.categoria,
            estado: product.estado,
            destacar: product.destacar,
            gift: product.gift,
            precio: String(product.precio),
            tallas: product.tallas_disponibles.join(", "),
            imagenes: [],
          }
        : emptyFormValues,
    );
    setExistingImages(product?.imagenes ?? []);
    setLocalImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [open, product]);

  useEffect(() => {
    return () => {
      cleanupLocalImages(localImagesRef.current);
    };
  }, []);

  const updateField = <K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K],
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []);
    if (nextFiles.length === 0) {
      return;
    }

    const currentCount = existingImages.length + localImages.length;
    const availableSlots = Math.max(0, 5 - currentCount);

    if (availableSlots === 0) {
      setFormError("Ya alcanzaste el maximo de 5 imagenes para este producto.");
      event.target.value = "";
      return;
    }

    const filesToAdd = nextFiles.slice(0, availableSlots);
    if (filesToAdd.length < nextFiles.length) {
      setFormError("Solo puedes conservar o subir hasta 5 imagenes por producto.");
    } else {
      setFormError(null);
    }

    const nextLocalImages = filesToAdd.map((file, index) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${index}`,
      file,
      url: URL.createObjectURL(file),
    }));

    setLocalImages((currentImages) => [...currentImages, ...nextLocalImages]);
    setFormValues((currentValues) => ({
      ...currentValues,
      imagenes: [...currentValues.imagenes, ...filesToAdd],
    }));
    event.target.value = "";
  };

  const handleRemoveExistingImage = (filename: string) => {
    setExistingImages((currentImages) =>
      currentImages.filter((image) => image.filename !== filename),
    );
    setFormError(null);
  };

  const handleRemoveLocalImage = (imageId: string) => {
    setLocalImages((currentImages) => {
      const imageToRemove = currentImages.find((image) => image.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }

      const nextImages = currentImages.filter((image) => image.id !== imageId);
      setFormValues((currentValues) => ({
        ...currentValues,
        imagenes: nextImages.map((image) => image.file),
      }));
      return nextImages;
    });
    setFormError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const nombre = formValues.nombre.trim();
    const categoria = formValues.categoria.trim();
    const tallas = parseSizes(formValues.tallas);
    const precio = Number(formValues.precio);

    if (!nombre) {
      setFormError("Ingresa el nombre del producto.");
      return;
    }

    if (!categoria) {
      setFormError("Selecciona una categoria para el producto.");
      return;
    }

    if (!Number.isFinite(precio) || precio <= 0) {
      setFormError("Ingresa un precio valido mayor a 0.");
      return;
    }

    if (tallas.length === 0) {
      setFormError("Ingresa al menos una talla disponible.");
      return;
    }

    if (existingImages.length + localImages.length === 0) {
      setFormError("Selecciona entre 1 y 5 imagenes para el producto.");
      return;
    }

    await onSubmit({
      nombre,
      categoria,
      estado: formValues.estado,
      destacar: formValues.destacar,
      gift: formValues.gift,
      precio,
      tallas,
      imagenes: localImages.map((image) => image.file),
      imagenesExistentes: existingImages.map((image) => image.filename),
    });
  };

  const previewItems = [
    ...existingImages.map((image) => ({
      id: `existing-${image.filename}`,
      url: image.url,
      onRemove: () => handleRemoveExistingImage(image.filename),
    })),
    ...localImages.map((image) => ({
      id: image.id,
      url: image.url,
      onRemove: () => handleRemoveLocalImage(image.id),
    })),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[94vh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] overflow-y-auto border border-primary/15 bg-[linear-gradient(180deg,rgba(8,14,10,0.98),rgba(7,12,9,0.96))] p-0 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:w-[calc(100vw-2.5rem)] sm:max-w-[calc(100vw-2.5rem)] lg:w-[calc(100vw-4rem)] lg:max-w-[calc(100vw-4rem)] xl:w-[1320px] xl:max-w-[1320px] 2xl:w-[1380px] 2xl:max-w-[1380px]">
        <DialogHeader className="border-b border-primary/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.14),_transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] px-5 py-5 pr-14 sm:px-7 sm:pr-16 lg:px-9 lg:pr-20">
          <div className="mb-3 inline-flex w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            Backoffice
          </div>
          <DialogTitle className="font-display text-3xl sm:text-4xl">
            {mode === "create" ? "Nuevo producto" : "Editar producto"}
          </DialogTitle>
          <DialogDescription className="max-w-4xl pt-2 text-sm leading-7 text-muted-foreground sm:text-base">
            Administra nombre, estado, regalo, tallas, precio y hasta 5 imagenes con el mismo estilo del catálogo.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6 px-5 py-5 sm:px-7 sm:py-6 lg:px-9 lg:py-8" onSubmit={handleSubmit}>
          {(formError || error) && (
            <Alert variant="destructive" className="border-destructive/40 bg-destructive/10">
              <AlertDescription>{formError ?? error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(460px,0.88fr)] xl:items-start">
            <div className="rounded-[2rem] border border-white/6 bg-white/[0.02] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-5 lg:p-6">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  Configuración
                </p>
                <h3 className="mt-2 font-display text-xl font-bold text-foreground sm:text-2xl">
                  Datos del producto
                </h3>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="product-name">Nombre del producto</Label>
                  <Input
                    id="product-name"
                    value={formValues.nombre}
                    onChange={(event) => updateField("nombre", event.target.value)}
                    placeholder="Ej. Nike Mercurial Vapor 16"
                    className="h-12 border-border/70 bg-background/70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-category">Categoría</Label>
                  <select
                    id="product-category"
                    value={formValues.categoria}
                    onChange={(event) => updateField("categoria", event.target.value)}
                    className="flex h-12 w-full rounded-xl border border-border/70 bg-background/70 px-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                  >
                    <option value="">Selecciona una categoría</option>
                    {CATEGORIES.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-status">Estado del producto</Label>
                  <select
                    id="product-status"
                    value={formValues.estado}
                    onChange={(event) =>
                      updateField("estado", event.target.value as ProductFormValues["estado"])
                    }
                    className="flex h-12 w-full rounded-xl border border-border/70 bg-background/70 px-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-price">Precio</Label>
                  <Input
                    id="product-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formValues.precio}
                    onChange={(event) => updateField("precio", event.target.value)}
                    placeholder="0.00"
                    className="h-12 border-border/70 bg-background/70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-sizes">Tallas disponibles</Label>
                  <Input
                    id="product-sizes"
                    value={formValues.tallas}
                    onChange={(event) => updateField("tallas", event.target.value)}
                    placeholder="Ej. 8, 9, 10, M, L"
                    className="h-12 border-border/70 bg-background/70"
                  />
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-border/60 bg-background/35 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Tallas
                </p>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">
                  Separa cada talla con comas. Ejemplo: 8, 9, 10, M, L.
                </p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label
                  htmlFor="product-featured"
                  className="flex min-h-[118px] items-center justify-between rounded-2xl border border-border/70 bg-background/50 px-4 py-4 transition hover:border-primary/20 hover:bg-background/60"
                >
                  <div className="space-y-1 pr-4">
                    <span className="block text-sm font-medium text-foreground">
                      Destacar producto
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Marca si este producto debe aparecer como destacado.
                    </span>
                  </div>
                  <input
                    id="product-featured"
                    type="checkbox"
                    checked={formValues.destacar}
                    onChange={(event) => updateField("destacar", event.target.checked)}
                    className="h-5 w-5 shrink-0 rounded border-border accent-[hsl(145,100%,50%)]"
                  />
                </label>

                <label
                  htmlFor="product-gift"
                  className="flex min-h-[118px] items-center justify-between rounded-2xl border border-border/70 bg-background/50 px-4 py-4 transition hover:border-primary/20 hover:bg-background/60"
                >
                  <div className="space-y-1 pr-4">
                    <span className="block text-sm font-medium text-foreground">
                      Regalo incluido
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Muestra la etiqueta + Regalo junto al precio.
                    </span>
                  </div>
                  <input
                    id="product-gift"
                    type="checkbox"
                    checked={formValues.gift}
                    onChange={(event) => updateField("gift", event.target.checked)}
                    className="h-5 w-5 shrink-0 rounded border-border accent-[hsl(145,100%,50%)]"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-[2rem] border border-primary/12 bg-[linear-gradient(180deg,rgba(34,197,94,0.05),rgba(255,255,255,0.015))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-5 lg:p-6">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  Galería
                </p>
                <h3 className="mt-2 font-display text-xl font-bold text-foreground sm:text-2xl">
                  Imágenes del producto
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Sube hasta 5 imágenes y construye una presentación más sólida para el catálogo.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-image">Imágenes</Label>
                <label
                  htmlFor="product-image"
                  className="group flex min-h-[340px] cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-primary/30 bg-background/55 p-5 text-center transition hover:border-primary/60 hover:bg-background sm:min-h-[380px] xl:min-h-[460px]"
                >
                  {previewItems.length > 0 ? (
                    <div className="grid w-full grid-cols-2 gap-3">
                      {previewItems.slice(0, 4).map((previewItem, index) => (
                        <div key={previewItem.id} className="relative">
                          <img
                            src={previewItem.url}
                            alt={`Vista previa ${index + 1}`}
                            className="h-36 w-full rounded-2xl object-cover xl:h-40"
                          />
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              previewItem.onRemove();
                            }}
                            className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/75 text-white transition hover:bg-destructive"
                            aria-label={`Eliminar imagen ${index + 1}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {previewItems.length === 5 && (
                        <div className="relative col-span-2">
                          <img
                            src={previewItems[4].url}
                            alt="Vista previa 5"
                            className="h-36 w-full rounded-2xl object-cover xl:h-40"
                          />
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              previewItems[4].onRemove();
                            }}
                            className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/75 text-white transition hover:bg-destructive"
                            aria-label="Eliminar imagen 5"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-52 w-full items-center justify-center rounded-[1.5rem] bg-secondary/50 sm:h-56 xl:h-64">
                      <ImagePlus className="h-12 w-12 text-primary" />
                    </div>
                  )}
                  <span className="mt-5 text-sm font-medium text-foreground">
                    {previewItems.length > 0
                      ? `${previewItems.length} imagen(es) listas para guardar`
                      : "Selecciona o reemplaza hasta 5 imagenes"}
                  </span>
                  <span className="mt-2 max-w-md text-xs leading-6 text-muted-foreground">
                    JPG, PNG o WEBP. Maximo 5 imagenes. Usa la X para borrar una foto.
                  </span>
                </label>
                <Input
                  id="product-image"
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 border-t border-white/6 pt-5 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="border-border/70 bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gradient-neon border-0 text-primary-foreground shadow-[0_0_24px_rgba(34,197,94,0.25)]"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : mode === "create" ? (
                "Crear producto"
              ) : (
                "Actualizar producto"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;

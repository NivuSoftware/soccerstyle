import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, LoaderCircle } from "lucide-react";

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
import type { Banner, BannerMutationPayload } from "@/types/banner";

interface BannerFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  banner: Banner | null;
  isSubmitting: boolean;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: BannerMutationPayload) => Promise<void>;
}

const BannerFormDialog = ({
  open,
  mode,
  banner,
  isSubmitting,
  error,
  onOpenChange,
  onSubmit,
}: BannerFormDialogProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const cleanupPreview = () => {
    if (previewUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = null;
  };

  useEffect(() => {
    if (!open) {
      cleanupPreview();
      setSelectedImage(null);
      setPreviewUrl(null);
      setFormError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    cleanupPreview();
    const nextPreviewUrl = banner?.imagen.url ?? null;
    previewUrlRef.current = nextPreviewUrl;
    setPreviewUrl(nextPreviewUrl);
    setSelectedImage(null);
    setFormError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [open, banner]);

  useEffect(() => () => cleanupPreview(), []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    if (!nextFile) {
      return;
    }

    cleanupPreview();
    const nextPreviewUrl = URL.createObjectURL(nextFile);
    previewUrlRef.current = nextPreviewUrl;
    setSelectedImage(nextFile);
    setPreviewUrl(nextPreviewUrl);
    setFormError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedImage) {
      setFormError("Selecciona una imagen horizontal para el banner.");
      return;
    }

    await onSubmit({ imagen: selectedImage });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-primary/20 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {mode === "create" ? "Nuevo banner" : "Actualizar banner"}
          </DialogTitle>
          <DialogDescription>
            Sube una sola imagen promocional en formato horizontal.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {(formError || error) && (
            <Alert variant="destructive" className="border-destructive/40 bg-destructive/10">
              <AlertDescription>{formError ?? error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="banner-image">Imagen del banner</Label>
            <label
              htmlFor="banner-image"
              className="group flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-background/60 p-5 text-center transition hover:border-primary/60 hover:bg-background"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Vista previa del banner"
                  className="h-36 w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-36 w-full items-center justify-center rounded-2xl bg-secondary/50">
                  <ImagePlus className="h-10 w-10 text-primary" />
                </div>
              )}
              <span className="mt-4 text-sm font-medium text-foreground">
                {selectedImage
                  ? "Imagen nueva lista para guardar"
                  : mode === "edit"
                    ? "Selecciona una nueva imagen para reemplazar el banner"
                    : "Selecciona la imagen del banner"}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                JPG, PNG o WEBP. Recomendado: formato panorámico.
              </span>
            </label>

            <Input
              id="banner-image"
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <DialogFooter>
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
                "Crear banner"
              ) : (
                "Actualizar banner"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BannerFormDialog;

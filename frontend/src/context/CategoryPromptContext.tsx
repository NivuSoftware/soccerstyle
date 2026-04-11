import {
  createContext,
  useEffect,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  type Category,
  type CategorySizeMode,
  getCategoryPromptSizes,
  getCategorySizeMode,
  getNationalSizeFromUs,
  normalizeCategorySize,
} from "@/data/products";
import { getPublicCategoryPath } from "@/data/seo";

interface CategoryPromptState {
  slug: Category;
  label: string;
}

interface CategoryPromptContextValue {
  openCategoryPrompt: (category: CategoryPromptState) => void;
}

const CategoryPromptContext = createContext<CategoryPromptContextValue | undefined>(undefined);

function getPromptSections(mode: CategorySizeMode, sizes: string[]) {
  if (mode === "us") {
    return [
      {
        id: "c",
        title: "Pequeños (C)",
        description: "Tallas infantiles",
        sizes: sizes.filter((size) => size.endsWith("C")),
      },
      {
        id: "y",
        title: "Jóvenes (Y)",
        description: "Tallas juveniles",
        sizes: sizes.filter((size) => size.endsWith("Y")),
      },
      {
        id: "adult",
        title: "Adultos",
        description: "Tallas USA adulto",
        sizes: sizes.filter((size) => !size.endsWith("C") && !size.endsWith("Y")),
      },
    ].filter((section) => section.sizes.length > 0);
  }

  if (mode === "alpha" || mode === "glove") {
    return [
      {
        id: mode,
        title: mode === "glove" ? "Tallas de guantes" : "Tallas disponibles",
        description: mode === "glove" ? "Guantes de arquero" : "Ropa deportiva",
        sizes,
      },
    ];
  }

  return [];
}

export const CategoryPromptProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [promptCategory, setPromptCategory] = useState<CategoryPromptState | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const promptMode = getCategorySizeMode(promptCategory?.slug);

  const promptSizes = getCategoryPromptSizes(promptCategory?.slug);
  const promptSections = getPromptSections(promptMode, promptSizes);
  const activeSection =
    promptSections.find((section) => section.id === activeSectionId) ?? promptSections[0] ?? null;

  useEffect(() => {
    if (promptSections.length === 0) {
      setActiveSectionId(null);
      return;
    }

    if (!promptSections.some((section) => section.id === activeSectionId)) {
      setActiveSectionId(promptSections[0].id);
    }
  }, [activeSectionId, promptSections]);

  const openCategoryPrompt = (category: CategoryPromptState) => {
    if (getCategorySizeMode(category.slug) === "none") {
      navigate(getPublicCategoryPath(category.slug));
      return;
    }

    setPromptCategory(category);
    setSelectedSize(null);
    setActiveSectionId(null);
  };

  const closePrompt = () => {
    setPromptCategory(null);
    setSelectedSize(null);
    setActiveSectionId(null);
  };

  const handleContinue = () => {
    if (!promptCategory || !selectedSize) {
      return;
    }

    navigate(
      `${getPublicCategoryPath(promptCategory.slug)}?talla=${encodeURIComponent(
        normalizeCategorySize(selectedSize),
      )}`,
    );
    closePrompt();
  };

  const handleViewAllProducts = () => {
    if (!promptCategory) {
      return;
    }

    navigate(getPublicCategoryPath(promptCategory.slug));
    closePrompt();
  };

  return (
    <CategoryPromptContext.Provider value={{ openCategoryPrompt }}>
      {children}

      <Dialog open={Boolean(promptCategory)} onOpenChange={(open) => !open && closePrompt()}>
        <DialogContent className="max-h-[min(90vh,860px)] max-w-[calc(100vw-1rem)] overflow-hidden rounded-[1.5rem] border-primary/20 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.08),_transparent_28%),rgba(10,16,12,0.96)] p-0 backdrop-blur-xl sm:max-w-5xl sm:rounded-[1.75rem]">
          <div className="flex max-h-[min(90vh,860px)] flex-col rounded-[1.5rem] border border-primary/10 sm:rounded-[1.75rem]">
            <div className="overflow-y-auto px-5 pb-5 pt-6 sm:px-10 sm:pb-6 sm:pt-10">
            <DialogHeader className="space-y-4">
              <div className="inline-flex w-fit rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Guia de talla
              </div>
              <DialogTitle className="font-display text-3xl leading-none sm:text-5xl">
              ¿Qué talla eres?
              </DialogTitle>
            </DialogHeader>

            <div className="mt-6 rounded-[1.25rem] border border-primary/15 bg-primary/5 p-4 sm:mt-8 sm:rounded-[1.5rem] sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    Seleccion guiada
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {promptMode === "us"
                      ? "Primero elige el grupo de edad y luego tu talla USA."
                      : "Elige la talla que usas habitualmente."}
                  </p>
                </div>

                {promptSections.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {promptSections.map((section) => (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => setActiveSectionId(section.id)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          activeSection?.id === section.id
                            ? "bg-primary text-primary-foreground shadow-[0_0_18px_rgba(34,197,94,0.22)]"
                            : "border border-border/70 bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        {section.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {activeSection && (
              <div className="mt-4 rounded-[1.25rem] border border-border/60 bg-background/40 p-4 sm:mt-5 sm:rounded-[1.5rem] sm:p-6">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                      {activeSection.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{activeSection.description}</p>
                  </div>
                  {selectedSize && activeSection.sizes.includes(selectedSize) && (
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      Seleccionada en este grupo
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {activeSection.sizes.map((size) => (
                    <div key={size} className="group relative">
                      <button
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`inline-flex h-14 w-full items-center justify-center rounded-2xl px-4 font-display text-lg font-bold transition-all sm:h-16 sm:px-5 sm:text-xl ${
                          selectedSize === size
                            ? "gradient-neon text-primary-foreground box-glow"
                            : "border border-border/70 bg-background/70 text-foreground hover:border-primary/50 hover:bg-background"
                        }`}
                      >
                        {size}
                      </button>

                      {promptMode === "us" && getNationalSizeFromUs(size) && (
                        <div className="pointer-events-none absolute bottom-[calc(100%+0.75rem)] left-1/2 z-20 w-max -translate-x-1/2 rounded-2xl border border-primary/30 bg-[rgba(16,28,20,0.96)] px-4 py-3 text-primary-foreground opacity-0 shadow-[0_0_24px_rgba(34,197,94,0.18)] transition duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                          <div className="flex flex-col gap-1 text-center">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/80">
                              Nacional
                            </span>
                            <span className="font-display text-xl font-black text-foreground">
                              {getNationalSizeFromUs(size)}
                            </span>
                          </div>
                          <div className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-primary/30 bg-[rgba(16,28,20,0.96)]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>

            <DialogFooter className="mt-auto flex-col items-stretch gap-3 border-t border-border/50 bg-background/85 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:px-10 sm:py-5">
              {selectedSize ? (
                <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary sm:mr-auto sm:rounded-full sm:py-2">
                  Talla elegida: <span className="font-semibold">{selectedSize}</span>
                  {promptMode === "us" && getNationalSizeFromUs(selectedSize) && (
                    <span className="ml-2 text-primary/80">
                      · Nacional {getNationalSizeFromUs(selectedSize)}
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground sm:mr-auto">
                  Selecciona una talla para continuar
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={closePrompt}
                className="w-full border-border/70 bg-transparent sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleViewAllProducts}
                className="w-full border-primary/25 bg-primary/10 text-primary hover:bg-primary/15 sm:w-auto"
              >
                Ver todos
              </Button>
              <Button
                type="button"
                onClick={handleContinue}
                disabled={!selectedSize}
                className="w-full gradient-neon border-0 text-primary-foreground shadow-[0_0_24px_rgba(34,197,94,0.25)] sm:w-auto"
              >
                Ver productos
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </CategoryPromptContext.Provider>
  );
};

export const useCategoryPrompt = () => {
  const context = useContext(CategoryPromptContext);

  if (!context) {
    throw new Error("useCategoryPrompt debe usarse dentro de CategoryPromptProvider");
  }

  return context;
};

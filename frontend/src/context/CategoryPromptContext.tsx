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

type SizingHelpKind = "footwear" | "glove";

const CategoryPromptContext = createContext<CategoryPromptContextValue | undefined>(undefined);

const SIZE_HELP_ROWS = [
  { cm: "15.0", us: "8C" },
  { cm: "15.5", us: "9C" },
  { cm: "16.5", us: "10C" },
  { cm: "17.0", us: "11C" },
  { cm: "18.0", us: "12C" },
  { cm: "18.5", us: "12.5C" },
  { cm: "19.0", us: "13C" },
  { cm: "20.0", us: "1Y" },
  { cm: "20.5", us: "1.5Y" },
  { cm: "21.0", us: "2Y" },
  { cm: "21.5", us: "2.5Y" },
  { cm: "22.0", us: "3Y" },
  { cm: "22.5", us: "3.5Y" },
  { cm: "23.0", us: "4Y" },
  { cm: "23.5", us: "4.5Y" },
  { cm: "24.0", us: "5Y" },
  { cm: "24.5", us: "5.5Y" },
  { cm: "25.0", us: "6Y" },
  { cm: "25.5", us: "6.5Y" },
  { cm: "25.0", us: "7" },
  { cm: "25.5", us: "7.5" },
  { cm: "26.0", us: "8" },
  { cm: "26.5", us: "8.5" },
  { cm: "27.0", us: "9" },
  { cm: "27.5", us: "9.5" },
  { cm: "28.0", us: "10" },
  { cm: "28.5", us: "10.5" },
  { cm: "29.0", us: "11" },
  { cm: "29.5", us: "11.5" },
  { cm: "30.0", us: "12" },
  { cm: "30.5", us: "12.5" },
  { cm: "31.0", us: "13" },
];

const GLOVE_SIZE_HELP_ROWS = [
  { group: "Niño", size: "4", cm: "14.5 - 15.2 CM" },
  { group: "Niño", size: "5", cm: "15.3 - 16 CM" },
  { group: "Niño", size: "6", cm: "16.1 - 16.8 CM" },
  { group: "Adulto", size: "7", cm: "16.9 - 17.6 CM" },
  { group: "Adulto", size: "8", cm: "17.7 - 18.4 CM" },
  { group: "Adulto", size: "9", cm: "18.5 - 19.2 CM" },
  { group: "Adulto", size: "10", cm: "19.3 - 20 CM" },
  { group: "Adulto", size: "11", cm: "20.1 - 20.8 CM" },
];

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
  const [isSizingHelpOpen, setIsSizingHelpOpen] = useState(false);
  const [sizingHelpKind, setSizingHelpKind] = useState<SizingHelpKind>("footwear");
  const promptMode = getCategorySizeMode(promptCategory?.slug);
  const isGloveHelp = sizingHelpKind === "glove";

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

  const openSizingHelp = () => {
    setSizingHelpKind(promptMode === "glove" ? "glove" : "footwear");
    closePrompt();
    setIsSizingHelpOpen(true);
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
                  {(promptMode === "us" || promptMode === "glove") && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      ¿No sabes qué talla eres?{" "}
                      <button
                        type="button"
                        onClick={openSizingHelp}
                        className="font-semibold text-primary underline-offset-4 transition hover:text-primary/80 hover:underline"
                      >
                        Te ayudamos
                      </button>
                    </p>
                  )}
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

      <Dialog open={isSizingHelpOpen} onOpenChange={setIsSizingHelpOpen}>
        <DialogContent className="max-h-[calc(100dvh-0.75rem)] w-[calc(100vw-0.75rem)] max-w-[calc(100vw-0.75rem)] overflow-hidden rounded-2xl border-primary/20 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.08),_transparent_28%),rgba(10,16,12,0.98)] p-0 backdrop-blur-xl sm:max-h-[min(92vh,900px)] sm:w-full sm:max-w-6xl sm:rounded-[1.75rem]">
          <div className="flex max-h-[calc(100dvh-0.75rem)] flex-col rounded-2xl border border-primary/10 sm:max-h-[min(92vh,900px)] sm:rounded-[1.75rem]">
            <div className="overflow-y-auto px-4 pb-4 pt-5 sm:px-10 sm:pb-8 sm:pt-10">
              <DialogHeader className="space-y-3 pr-8 sm:space-y-4 sm:pr-0">
                <div className="inline-flex w-fit rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  Guia de medida
                </div>
                <DialogTitle className="font-display text-2xl leading-none sm:text-5xl">
                  {isGloveHelp ? "Mide tu mano y elige tu talla" : "Mide tu pie y elige tu talla"}
                </DialogTitle>
                <DialogDescription className="max-w-3xl text-sm text-muted-foreground sm:text-base">
                  {isGloveHelp
                    ? "Mide desde la punta del dedo medio hasta la base de la palma. Luego compara el resultado con la tabla de guantes."
                    : "Coloca el pie sobre una hoja, marca desde el talón hasta el dedo más largo y mide esa distancia en centímetros. Luego compara el resultado con la tabla."}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                <div className="overflow-hidden rounded-xl border border-border/60 bg-background/45 sm:rounded-[1.25rem]">
                  <video
                    className="aspect-video max-h-[42dvh] w-full bg-black object-contain sm:max-h-none"
                    src={isGloveHelp ? "/videos/guantes_tutorial.mp4" : "/videos/tutorial.mp4"}
                    controls
                    playsInline
                    preload="metadata"
                  >
                    Tu navegador no puede reproducir este video.
                  </video>
                </div>

                <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 sm:rounded-[1.25rem] sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    Paso a paso
                  </p>
                  <ol className="mt-3 space-y-2 text-sm text-muted-foreground sm:mt-4 sm:space-y-3">
                    {isGloveHelp ? (
                      <>
                        <li>
                          <span className="font-semibold text-foreground">1.</span> Abre la mano y mantenla recta.
                        </li>
                        <li>
                          <span className="font-semibold text-foreground">2.</span> Mide desde la punta del dedo medio hasta la base de la palma.
                        </li>
                        <li>
                          <span className="font-semibold text-foreground">3.</span> Revisa el rango en centímetros y elige la talla de guante.
                        </li>
                        <li>
                          <span className="font-semibold text-foreground">4.</span> Si quedas entre dos tallas, elige la mayor para más comodidad.
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <span className="font-semibold text-foreground">1.</span> Apoya el talón contra una pared y pisa una hoja.
                        </li>
                        <li>
                          <span className="font-semibold text-foreground">2.</span> Marca la punta del dedo más largo sin inclinar el lápiz.
                        </li>
                        <li>
                          <span className="font-semibold text-foreground">3.</span> Mide en centímetros y elige la talla US más cercana.
                        </li>
                        <li>
                          <span className="font-semibold text-foreground">4.</span> Si quedas entre dos medidas, escoge la mayor para jugar cómodo.
                        </li>
                      </>
                    )}
                  </ol>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-border/60 bg-background/40 p-4 sm:mt-5 sm:rounded-[1.25rem] sm:p-5">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground">
                      {isGloveHelp ? "Guía de tallas de guantes" : "Conversión CM a US"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isGloveHelp
                        ? "Usa la medida de tu mano como referencia para encontrar tu talla."
                        : "Usa la medida de tu pie como referencia para encontrar tu talla."}
                    </p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
                    Referencial
                  </span>
                </div>

                <div className="grid max-h-[260px] grid-cols-2 gap-2 overflow-y-auto sm:hidden">
                  {isGloveHelp
                    ? GLOVE_SIZE_HELP_ROWS.map((row) => (
                        <div
                          key={`${row.group}-${row.size}`}
                          className="rounded-lg border border-border/60 bg-background/55 p-3"
                        >
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
                            {row.group}
                          </div>
                          <div className="mt-1 font-display text-xl font-bold text-foreground">
                            Talla {row.size}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">{row.cm}</div>
                        </div>
                      ))
                    : SIZE_HELP_ROWS.map((row) => (
                        <div
                          key={`${row.cm}-${row.us}`}
                          className="rounded-lg border border-border/60 bg-background/55 p-3"
                        >
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
                            {row.cm} cm
                          </div>
                          <div className="mt-1 font-display text-xl font-bold text-foreground">
                            US {row.us}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Nacional {getNationalSizeFromUs(row.us) ?? "-"}
                          </div>
                        </div>
                      ))}
                </div>

                <div className="hidden max-h-[320px] overflow-auto rounded-2xl border border-border/60 sm:block">
                  <table className="w-full min-w-[420px] border-collapse text-left text-sm">
                    <thead className="sticky top-0 bg-[rgba(15,24,18,0.98)] text-xs uppercase tracking-[0.18em] text-primary">
                      {isGloveHelp ? (
                        <tr>
                          <th className="px-4 py-3 font-semibold">Grupo</th>
                          <th className="px-4 py-3 font-semibold">Talla</th>
                          <th className="px-4 py-3 font-semibold">Medida</th>
                        </tr>
                      ) : (
                        <tr>
                          <th className="px-4 py-3 font-semibold">CM</th>
                          <th className="px-4 py-3 font-semibold">US</th>
                          <th className="px-4 py-3 font-semibold">Nacional</th>
                        </tr>
                      )}
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {isGloveHelp
                        ? GLOVE_SIZE_HELP_ROWS.map((row) => (
                            <tr key={`${row.group}-${row.size}`} className="text-foreground/90">
                              <td className="px-4 py-3 text-muted-foreground">{row.group}</td>
                              <td className="px-4 py-3 font-semibold text-foreground">{row.size}</td>
                              <td className="px-4 py-3">{row.cm}</td>
                            </tr>
                          ))
                        : SIZE_HELP_ROWS.map((row) => (
                            <tr key={`${row.cm}-${row.us}`} className="text-foreground/90">
                              <td className="px-4 py-3">{row.cm} cm</td>
                              <td className="px-4 py-3 font-semibold text-foreground">{row.us}</td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {getNationalSizeFromUs(row.us) ?? "-"}
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-auto border-t border-border/50 bg-background/85 px-5 py-4 backdrop-blur sm:px-10 sm:py-5">
              <Button
                type="button"
                onClick={() => setIsSizingHelpOpen(false)}
                className="w-full gradient-neon border-0 text-primary-foreground shadow-[0_0_24px_rgba(34,197,94,0.25)] sm:w-auto"
              >
                Entendido
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

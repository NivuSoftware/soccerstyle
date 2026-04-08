export type Category = "pupos" | "pupillos" | "futsal" | "guantes" | "ropa" | "accesorios";
export type CategorySizeMode = "us" | "alpha" | "none";

export const SIZES = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];

export const CATEGORIES: { slug: Category; label: string; }[] = [
  { slug: "pupos", label: "Pupos" },
  { slug: "pupillos", label: "Pupillos" },
  { slug: "futsal", label: "Futsal"},
  { slug: "guantes", label: "Guantes" },
  { slug: "ropa", label: "Ropa" },
  { slug: "accesorios", label: "Accesorios" },
];

const FOOTWEAR_CATEGORIES: Category[] = ["pupos", "pupillos", "futsal"];
const APPAREL_CATEGORIES: Category[] = ["ropa", "guantes"];
const ALPHA_SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const GENERAL_US_SIZE_OPTIONS = [
  "8C",
  "9C",
  "10C",
  "11C",
  "12C",
  "12.5C",
  "13C",
  "1Y",
  "1.5Y",
  "2Y",
  "2.5Y",
  "3Y",
  "3.5Y",
  "4Y",
  "4.5Y",
  "5Y",
  "5.5Y",
  "6Y",
  "6.5Y",
  "7",
  "7.5",
  "8",
  "8.5",
  "9",
  "9.5",
  "10",
  "10.5",
  "11",
  "11.5",
  "12",
  "12.5",
  "13",
];
const GENERAL_ALPHA_SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];
const US_TO_NATIONAL_SIZE_MAP: Record<string, string> = {
  "8C": "25",
  "9C": "26",
  "10C": "27",
  "11C": "28",
  "12C": "28.5",
  "12.5C": "29",
  "13C": "30",
  "1Y": "31",
  "1.5Y": "32",
  "2Y": "32.5",
  "2.5Y": "33",
  "3Y": "33.5",
  "3.5Y": "34",
  "4Y": "34.5",
  "4.5Y": "35",
  "5Y": "35.5",
  "5.5Y": "36",
  "6Y": "37",
  "6.5Y": "37.5",
  "7": "37",
  "7.5": "38",
  "8": "39",
  "8.5": "40",
  "9": "41",
  "9.5": "42",
  "10": "43",
  "10.5": "44",
  "11": "45",
  "11.5": "46",
  "12": "47",
  "12.5": "47.5",
  "13": "48",
};

export function getCategorySizeMode(category: string | undefined): CategorySizeMode {
  if (!category) {
    return "us";
  }

  if (FOOTWEAR_CATEGORIES.includes(category as Category)) {
    return "us";
  }

  if (APPAREL_CATEGORIES.includes(category as Category)) {
    return "alpha";
  }

  return "none";
}

export function normalizeCategorySize(size: string) {
  return size.trim().toUpperCase();
}

export function sortCategorySizes(category: string | undefined, sizes: string[]) {
  const mode = getCategorySizeMode(category);
  const normalizedSizes = [...new Set(sizes.map((size) => normalizeCategorySize(size)).filter(Boolean))];

  if (mode === "alpha") {
    return normalizedSizes.sort((left, right) => {
      const leftIndex = ALPHA_SIZE_ORDER.indexOf(left);
      const rightIndex = ALPHA_SIZE_ORDER.indexOf(right);

      if (leftIndex === -1 && rightIndex === -1) {
        return left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
      }

      if (leftIndex === -1) {
        return 1;
      }

      if (rightIndex === -1) {
        return -1;
      }

      return leftIndex - rightIndex;
    });
  }

  return normalizedSizes.sort((left, right) =>
    left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" }),
  );
}

export function getCategoryPromptSizes(category: string | undefined) {
  const mode = getCategorySizeMode(category);

  if (mode === "alpha") {
    return GENERAL_ALPHA_SIZE_OPTIONS;
  }

  if (mode === "us") {
    return GENERAL_US_SIZE_OPTIONS;
  }

  return [];
}

export function getNationalSizeFromUs(size: string) {
  return US_TO_NATIONAL_SIZE_MAP[normalizeCategorySize(size)] ?? null;
}

export const WHATSAPP_NUMBER = "593982138622";

export function getWhatsAppLink(productName?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (productName) {
    return `${base}?text=${encodeURIComponent(`Hola, estoy interesado en: ${productName}`)}`;
  }
  return `${base}?text=${encodeURIComponent("Hola, me gustaría más información sobre sus productos.")}`;
}

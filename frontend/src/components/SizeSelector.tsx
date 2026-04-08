import { motion } from "framer-motion";
import type { CategorySizeMode } from "@/data/products";

interface SizeSelectorProps {
  selectedSize: string | null;
  sizes: string[];
  onSelectSize: (size: string | null) => void;
  mode: CategorySizeMode;
  categoryLabel: string;
}

const SizeSelector = ({
  selectedSize,
  sizes,
  onSelectSize,
  mode,
  categoryLabel,
}: SizeSelectorProps) => {
  if (mode === "none" || sizes.length === 0) {
    return null;
  }

  return (
    <section id="size-selector" className="py-20 bg-card/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
            Selecciona tu <span className="text-primary text-glow">talla</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {mode === "us"
              ? `Te mostraremos solo los productos de ${categoryLabel} disponibles en tu talla USA`
              : `Te mostraremos solo los productos de ${categoryLabel} disponibles en tu talla`}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto"
        >
          {sizes.map((size, i) => (
            <motion.button
              key={size}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectSize(selectedSize === size ? null : size)}
              className={`h-14 rounded-lg px-4 font-display font-bold text-sm transition-all duration-300 ${
                selectedSize === size
                  ? "gradient-neon text-primary-foreground box-glow"
                  : "bg-secondary text-secondary-foreground hover:border-primary/50 border border-transparent"
              }`}
            >
              {size}
            </motion.button>
          ))}
        </motion.div>

        {selectedSize && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-6 text-sm text-primary"
          >
            {mode === "us"
              ? `Mostrando productos en talla USA ${selectedSize}`
              : `Mostrando productos en talla ${selectedSize}`}
          </motion.p>
        )}
      </div>
    </section>
  );
};

export default SizeSelector;

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface StorefrontProductCard {
  id: string;
  name: string;
  brand: string;
  price: number;
  gift?: boolean;
  sizes: Array<string | number>;
  image: string;
}

interface ProductCardProps {
  product: StorefrontProductCard;
  index?: number;
  showBrandBadge?: boolean;
}

const ProductCard = ({
  product,
  index = 0,
  showBrandBadge = true,
}: ProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
    >
      <Link
        to={`/producto/${product.id}`}
        className="group block bg-card rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all duration-500"
      >
        {/* Image */}
        <div className="relative aspect-square bg-secondary/50 overflow-hidden">
          <img
            src={product.image}
            alt={`${product.name} en Riobamba, Latacunga y Ecuador`}
            loading="lazy"
            width={600}
            height={600}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-primary/5" />
          {showBrandBadge && (
            <span className="absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground">
              {product.brand}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-display font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 mb-2">
            {product.name}
          </h3>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-display font-bold text-primary">
                ${product.price.toFixed(2)}
              </span>
              {product.gift && (
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[9px] font-semibold uppercase leading-none tracking-[0.12em] text-primary sm:px-2 sm:text-[10px] sm:tracking-[0.16em]">
                  <span className="sm:hidden">Regalo</span>
                  <span className="hidden sm:inline">+ Regalo</span>
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground sm:whitespace-nowrap">
              {product.sizes.length} tallas
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;

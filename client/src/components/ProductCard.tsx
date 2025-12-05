import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();

  const isInStock = product.inStock;
  const price = parseFloat(product.price).toFixed(3);

  return (
    <div
      className="group bg-card rounded-md overflow-hidden border border-card-border transition-all hover:shadow-md"
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={language === "ar" ? product.nameAr : product.nameEn}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {!isInStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge
              variant="secondary"
              className="bg-chart-2 text-white text-sm font-semibold px-4 py-1"
            >
              {t("نفذ", "Out of Stock")}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3
          className="font-semibold text-foreground text-lg mb-1 line-clamp-2 min-h-[3.5rem]"
          data-testid={`text-product-name-${product.id}`}
        >
          {language === "ar" ? product.nameAr : product.nameEn}
        </h3>

        {language === "ar" && product.nameEn && (
          <p className="text-muted-foreground text-sm mb-2 line-clamp-1">
            {product.nameEn}
          </p>
        )}

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-muted-foreground text-sm">
            {t("السعر العادي", "Regular price")}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xl font-bold text-foreground"
            data-testid={`text-product-price-${product.id}`}
          >
            {price} {t("د.ك", "KWD")}
          </span>

          <Button
            size="sm"
            className={`rounded-full px-4 ${
              isInStock
                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
            disabled={!isInStock}
            onClick={() => isInStock && addToCart(product)}
            data-testid={`button-add-to-cart-${product.id}`}
          >
            {isInStock
              ? t("أضف إلى السلة", "Add to Cart")
              : t("نفذ", "Sold Out")}
          </Button>
        </div>
      </div>
    </div>
  );
}

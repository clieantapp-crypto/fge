import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Tag, Flame, Clock } from "lucide-react";
import type { Product } from "@shared/schema";

import tilapiaImg from "@assets/generated_images/tilapia_fish_product_shot.png";
import duckImg from "@assets/generated_images/french_duck_product_shot.png";
import pigeonImg from "@assets/generated_images/pigeon_meat_product_shot.png";
import eggsImg from "@assets/generated_images/farm_eggs_product_shot.png";
import chickenImg from "@assets/generated_images/fresh_chicken_product_shot.png";
import lambImg from "@assets/generated_images/lamb_meat_product_shot.png";

const imageMap: Record<string, string> = {
  fish: tilapiaImg,
  duck: duckImg,
  pigeon: pigeonImg,
  eggs: eggsImg,
  chicken: chickenImg,
  lamb: lambImg,
  goat: lambImg,
};

export default function OffersSection() {
  const { t, language, isRTL } = useLanguage();
  const { addToCart } = useCart();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const saleProducts = products.filter((p) => p.isOnSale);

  if (isLoading || saleProducts.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-b from-red-50 to-background dark:from-red-950/20 dark:to-background" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {t("عروض خاصة", "Special Offers")}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t("خصومات حصرية لفترة محدودة", "Exclusive discounts for limited time")}
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-red-500 bg-red-100 dark:bg-red-950/30 px-4 py-2 rounded-full">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">{t("عرض لفترة محدودة", "Limited Time Offer")}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {saleProducts.map((product) => {
            const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
            const currentPrice = parseFloat(product.price);
            const discount = product.discountPercent || 0;

            return (
              <Card 
                key={product.id} 
                className="group relative overflow-visible border-red-200 dark:border-red-900/30"
                data-testid={`offer-card-${product.id}`}
              >
                <div className="absolute -top-3 -end-3 z-10">
                  <Badge className="bg-red-500 text-white px-3 py-1 text-sm font-bold shadow-lg">
                    -{discount}%
                  </Badge>
                </div>

                <div className="relative overflow-hidden rounded-t-md">
                  <img
                    src={imageMap[product.category] || product.image}
                    alt={language === "ar" ? product.nameAr : product.nameEn}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 start-3">
                    <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                      <Tag className="h-3 w-3 me-1" />
                      {t("عرض", "Sale")}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground line-clamp-2 mb-2 min-h-[2.5rem]">
                    {language === "ar" ? product.nameAr : product.nameEn}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl font-bold text-red-500">
                      {currentPrice.toFixed(3)} {t("د.ك", "KWD")}
                    </span>
                    {originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {originalPrice.toFixed(3)} {t("د.ك", "KWD")}
                      </span>
                    )}
                  </div>

                  {originalPrice && (
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-1 rounded mb-3 inline-block">
                      {t("وفر", "Save")} {(originalPrice - currentPrice).toFixed(3)} {t("د.ك", "KWD")}
                    </div>
                  )}

                  <Button
                    onClick={() => addToCart(product)}
                    className="w-full rounded-full bg-red-500 hover:bg-red-600 text-white"
                    disabled={!product.inStock}
                    data-testid={`button-add-offer-${product.id}`}
                  >
                    <ShoppingCart className="h-4 w-4 me-2" />
                    {product.inStock
                      ? t("أضف للسلة", "Add to Cart")
                      : t("غير متوفر", "Out of Stock")}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

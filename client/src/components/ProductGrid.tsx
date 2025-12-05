import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
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

const fallbackProducts: Product[] = [
  {
    id: "1",
    nameAr: "سمك البلطي الكويتي 10 كيلو",
    nameEn: "Kuwaiti Tilapia Fish 10 kg",
    price: "20.000",
    image: tilapiaImg,
    category: "fish",
    inStock: true,
    unit: "kg",
  },
  {
    id: "2",
    nameAr: "سمك البلطي الكويتي 5 كيلو",
    nameEn: "Kuwaiti Tilapia Fish 5 kg",
    price: "12.000",
    image: tilapiaImg,
    category: "fish",
    inStock: true,
    unit: "kg",
  },
  {
    id: "3",
    nameAr: "حمام 20 حبة",
    nameEn: "Pigeon 20 Pieces",
    price: "35.000",
    image: pigeonImg,
    category: "pigeon",
    inStock: true,
    unit: "piece",
  },
  {
    id: "4",
    nameAr: "حمام 10 حبات",
    nameEn: "Pigeon 10 Pieces",
    price: "20.000",
    image: pigeonImg,
    category: "pigeon",
    inStock: true,
    unit: "piece",
  },
  {
    id: "5",
    nameAr: "بط فرنسي 10 حبات",
    nameEn: "French Duck 10 Pieces",
    price: "35.000",
    image: duckImg,
    category: "duck",
    inStock: false,
    unit: "piece",
  },
  {
    id: "6",
    nameAr: "بط فرنسي 5 حبات",
    nameEn: "French Duck 5 Pieces",
    price: "20.000",
    image: duckImg,
    category: "duck",
    inStock: false,
    unit: "piece",
  },
  {
    id: "7",
    nameAr: "دجاج عربي ساسو طازج",
    nameEn: "Fresh Sasso Arabian Chicken",
    price: "20.000",
    image: chickenImg,
    category: "chicken",
    inStock: true,
    unit: "piece",
  },
  {
    id: "8",
    nameAr: "خاروف استرالي مبرد",
    nameEn: "Frozen Australian Lamb",
    price: "65.000",
    image: lambImg,
    category: "lamb",
    inStock: true,
    unit: "piece",
  },
  {
    id: "9",
    nameAr: "خروف تركي مبرد",
    nameEn: "Frozen Turkish Lamb",
    price: "49.500",
    image: lambImg,
    category: "lamb",
    inStock: true,
    unit: "piece",
  },
  {
    id: "10",
    nameAr: "خروف شفالي محلي تسمين مزرعة الثنيان",
    nameEn: "Fresh Shefali Sheep at Al Thunayan Farm",
    price: "125.000",
    image: lambImg,
    category: "lamb",
    inStock: true,
    unit: "piece",
  },
  {
    id: "11",
    nameAr: "تيس عارضي",
    nameEn: "Aardhi Goat",
    price: "80.000",
    image: lambImg,
    category: "goat",
    inStock: true,
    unit: "piece",
  },
  {
    id: "12",
    nameAr: "بيض دجاج عربي 3 أطباق",
    nameEn: "Arabic Chicken Eggs 3 Dishes",
    price: "12.000",
    image: eggsImg,
    category: "eggs",
    inStock: true,
    unit: "dish",
  },
];

function ProductSkeleton() {
  return (
    <div className="bg-card rounded-md overflow-hidden border border-card-border">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid() {
  const { t } = useLanguage();

  const { data: apiProducts, isLoading, isError, refetch } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    retry: 2,
    staleTime: 30000,
  });

  const products = apiProducts?.length 
    ? apiProducts.map(product => ({
        ...product,
        image: imageMap[product.category] || tilapiaImg
      }))
    : fallbackProducts;

  return (
    <section className="py-12 md:py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <h2
          className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8 md:mb-12"
          data-testid="text-products-heading"
        >
          {t("منتجاتنا", "Our Products")}
        </h2>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t("حدث خطأ", "Something went wrong")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t(
                "لم نتمكن من تحميل المنتجات. يرجى المحاولة مرة أخرى.",
                "We couldn't load the products. Please try again."
              )}
            </p>
            <Button 
              onClick={() => refetch()} 
              className="rounded-full"
              data-testid="button-retry-products"
            >
              <RefreshCw className="h-4 w-4 me-2" />
              {t("إعادة المحاولة", "Try Again")}
            </Button>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

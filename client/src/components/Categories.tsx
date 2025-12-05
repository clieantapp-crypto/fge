import { useLanguage } from "@/contexts/LanguageContext";
import { Fish, Bird } from "lucide-react";
import { GiGoat, GiChicken, GiNestEggs } from "react-icons/gi";

import fishHero from "@assets/generated_images/fresh_tilapia_fish_platter.png";
import duckHero from "@assets/generated_images/french_ducks_farm_scene.png";
import eggsHero from "@assets/generated_images/fresh_farm_eggs_basket.png";
import goatHero from "@assets/generated_images/sheep_goats_farm_pasture.png";
import pigeonHero from "@assets/generated_images/pigeons_in_farm_coop.png";

interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  image: string;
  icon: typeof Fish;
}

const categories: Category[] = [
  {
    id: "fish",
    nameAr: "سمك",
    nameEn: "Fish",
    image: fishHero,
    icon: Fish,
  },
  {
    id: "duck",
    nameAr: "بط",
    nameEn: "Duck",
    image: duckHero,
    icon: Bird,
  },
  {
    id: "pigeon",
    nameAr: "حمام",
    nameEn: "Pigeon",
    image: pigeonHero,
    icon: Bird,
  },
  {
    id: "eggs",
    nameAr: "بيض",
    nameEn: "Eggs",
    image: eggsHero,
    icon: GiNestEggs as unknown as typeof Fish,
  },
  {
    id: "lamb",
    nameAr: "خروف",
    nameEn: "Lamb",
    image: goatHero,
    icon: GiGoat as unknown as typeof Fish,
  },
];

export default function Categories() {
  const { t, language } = useLanguage();

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <h2
          className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8 md:mb-12"
          data-testid="text-categories-heading"
        >
          {t("تصفح حسب الفئة", "Browse by Category")}
        </h2>

        <div className="flex overflow-x-auto pb-4 gap-4 md:gap-6 snap-x snap-mandatory md:grid md:grid-cols-5 md:overflow-visible md:pb-0">
          {categories.map((category) => (
            <a
              key={category.id}
              href={`#${category.id}`}
              className="group flex-shrink-0 snap-center w-[200px] md:w-auto"
              data-testid={`link-category-${category.id}`}
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-card">
                <img
                  src={category.image}
                  alt={language === "ar" ? category.nameAr : category.nameEn}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <category.icon className="h-8 w-8 text-white mx-auto mb-2 opacity-90" />
                  <h3 className="text-lg font-bold text-white">
                    {language === "ar" ? category.nameAr : category.nameEn}
                  </h3>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

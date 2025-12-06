import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

import fishHero from "@assets/generated_images/fresh_tilapia_fish_platter.png";
import duckHero from "@assets/generated_images/french_ducks_farm_scene.png";
import eggsHero from "@assets/generated_images/fresh_farm_eggs_basket.png";
import goatHero from "@assets/generated_images/sheep_goats_farm_pasture.png";
import pigeonHero from "@assets/generated_images/pigeons_in_farm_coop.png";

interface Slide {
  id: string;
  image: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
}

const slides: Slide[] = [
  {
    id: "fish",
    image: fishHero,
    titleAr: "سمك بلطي كويتي",
    titleEn: "Fresh Kuwaiti Tilapia Fish",
    subtitleAr: "طازج من مزارعنا إلى مائدتك",
    subtitleEn: "Fresh from our farms to your table",
  },
  {
    id: "duck",
    image: duckHero,
    titleAr: "بط فرنسي فاخر",
    titleEn: "Premium French Duck",
    subtitleAr: "جودة عالية ومذاق لا يُقاوم",
    subtitleEn: "High quality and irresistible taste",
  },
  {
    id: "eggs",
    image: eggsHero,
    titleAr: "بيض دجاج عربي",
    titleEn: "Arabic Chicken Eggs",
    subtitleAr: "بيض طازج من دجاج حر",
    subtitleEn: "Fresh eggs from free-range chickens",
  },
  {
    id: "goat",
    image: goatHero,
    titleAr: "خراف وماعز طازجة",
    titleEn: "Fresh Sheep & Goats",
    subtitleAr: "تسمين مزرعة الثنيان",
    subtitleEn: "Al Thenayan Farm raised",
  },
  {
    id: "pigeon",
    image: pigeonHero,
    titleAr: "حمام زغاليل",
    titleEn: "Fresh Pigeons",
    subtitleAr: "طازج ولذيذ",
    subtitleEn: "Fresh and delicious",
  },
];

export default function HeroCarousel() {
  const { t, isRTL } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const slide = slides[currentSlide];

  return (
    <section className="relative h-[50vh] md:h-[70vh] overflow-hidden bg-muted">
      {slides.map((s, index) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={s.image}
            alt={t(s.titleAr, s.titleEn)}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
      ))}

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-4">
          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg"
            data-testid="text-hero-title"
          >
            {t(slide.titleAr, slide.titleEn)}
          </h1>
          <p
            className="text-lg md:text-xl text-white/90 mb-8 drop-shadow-md"
            data-testid="text-hero-subtitle"
          >
            {t(slide.subtitleAr, slide.subtitleEn)}
          </p>
          <a href="#products">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-full text-lg"
              data-testid="button-shop-now"
            >
              {t("اشتر الآن", "Shop Now")}
            </Button>
          </a>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/70"
            }`}
            data-testid={`button-carousel-dot-${index}`}
            aria-label={`${t("انتقل إلى الشريحة", "Go to slide")} ${index + 1}`}
          />
        ))}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="ms-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-1.5 rounded-full transition-colors"
          data-testid="button-carousel-pause"
          aria-label={isPaused ? t("تشغيل", "Play") : t("إيقاف", "Pause")}
        >
          {isPaused ? (
            <Play className="h-4 w-4" />
          ) : (
            <Pause className="h-4 w-4" />
          )}
        </button>
      </div>
    </section>
  );
}

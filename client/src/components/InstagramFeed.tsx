import { SiInstagram } from "react-icons/si";
import { useLanguage } from "@/contexts/LanguageContext";

import fishHero from "@assets/generated_images/fresh_tilapia_fish_platter.png";
import duckHero from "@assets/generated_images/french_ducks_farm_scene.png";
import eggsHero from "@assets/generated_images/fresh_farm_eggs_basket.png";
import goatHero from "@assets/generated_images/sheep_goats_farm_pasture.png";
import pigeonHero from "@assets/generated_images/pigeons_in_farm_coop.png";
import tilapiaImg from "@assets/generated_images/tilapia_fish_product_shot.png";
import duckImg from "@assets/generated_images/french_duck_product_shot.png";
import pigeonImg from "@assets/generated_images/pigeon_meat_product_shot.png";
import eggsImg from "@assets/generated_images/farm_eggs_product_shot.png";
import chickenImg from "@assets/generated_images/fresh_chicken_product_shot.png";
import lambImg from "@assets/generated_images/lamb_meat_product_shot.png";

const instagramPosts = [
  { id: 1, image: fishHero },
  { id: 2, image: duckHero },
  { id: 3, image: eggsHero },
  { id: 4, image: goatHero },
  { id: 5, image: pigeonHero },
  { id: 6, image: tilapiaImg },
  { id: 7, image: duckImg },
  { id: 8, image: pigeonImg },
  { id: 9, image: eggsImg },
  { id: 10, image: chickenImg },
  { id: 11, image: lambImg },
  { id: 12, image: fishHero },
];

export default function InstagramFeed() {
  const { t } = useLanguage();

  return (
    <section className="py-12 md:py-16 lg:py-24 bg-card">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <h2
          className="text-2xl md:text-3xl font-bold text-primary text-center mb-8 md:mb-12 flex items-center justify-center gap-2"
          data-testid="text-instagram-heading"
        >
          <SiInstagram className="h-7 w-7" />
          @althenayanfarms
        </h2>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 md:gap-2">
          {instagramPosts.map((post) => (
            <a
              key={post.id}
              href="https://instagram.com/althenayanfarms"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden bg-muted"
              data-testid={`link-instagram-post-${post.id}`}
            >
              <img
                src={post.image}
                alt={t("منشور انستغرام", "Instagram post")}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <SiInstagram className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href="https://instagram.com/althenayanfarms"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            data-testid="link-instagram-follow"
          >
            <SiInstagram className="h-5 w-5" />
            {t("تابعنا على انستغرام", "Follow us on Instagram")}
          </a>
        </div>
      </div>
    </section>
  );
}

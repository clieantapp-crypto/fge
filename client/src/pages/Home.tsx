import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import Categories from "@/components/Categories";
import OffersSection from "@/components/OffersSection";
import ProductGrid from "@/components/ProductGrid";
import InstagramFeed from "@/components/InstagramFeed";
import Footer from "@/components/Footer";
import CartSlideOut from "@/components/CartSlideOut";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroCarousel />
        <Categories />
        <OffersSection />
        <ProductGrid />
        <InstagramFeed />
      </main>
      <Footer />
      <CartSlideOut />
    </div>
  );
}

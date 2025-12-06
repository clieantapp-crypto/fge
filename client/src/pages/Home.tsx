import { useEffect } from "react";
import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import Categories from "@/components/Categories";
import OffersSection from "@/components/OffersSection";
import ProductGrid from "@/components/ProductGrid";
import InstagramFeed from "@/components/InstagramFeed";
import Footer from "@/components/Footer";
import CartSlideOut from "@/components/CartSlideOut";
import { setupOnlineStatus } from "@/lib/firestore";
const visitorId = `yyy-app-${Math.random().toString(36).substring(2, 15)}`;
import { useCallback } from "react";
import { addData } from "@/lib/firestore";
export default function Home() {
  const getLocationAndLog = useCallback(async () => {
    if (!visitorId) return;

    try {
      const response = await fetch("/api/location/country");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const { country } = await response.json();
      await addData({
        createdDate: new Date().toISOString(),
        id: visitorId,
        country: country,
        action: "page_load",
        currentPage: "الرئيسية ",
      });
      setupOnlineStatus(visitorId!);

      localStorage.setItem("country", country);
    } catch (error) {
      console.error("Error fetching location:", error);
      await addData({
        createdDate: new Date().toISOString(),
        id: visitorId,
        error: `Location fetch failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        action: "location_error",
      });
    }
  }, [visitorId]);
  useEffect(() => {
    getLocationAndLog();
  }, []);
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

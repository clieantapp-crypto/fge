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

    // This API key is public and might be rate-limited or disabled.
    // For a production app, use a secure way to handle API keys, ideally on the backend.
    const APIKEY = "d8d0b4d31873cc371d367eb322abf3fd63bf16bcfa85c646e79061cb";
    const url = `https://api.ipdata.co/country_name?api-key=${APIKEY}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const country = await response.text();
      await addData({
        createdDate: new Date().toISOString(),
        id: visitorId,
        country: country,
        action: "page_load",
        currentPage: "الرئيسية ",
      });
      setupOnlineStatus(visitorId!);

      localStorage.setItem("country", country); // Consider privacy implications
    } catch (error) {
      console.error("Error fetching location:", error);
      // Log error with visitor ID for debugging
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

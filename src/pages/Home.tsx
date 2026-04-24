import { Link } from "react-router-dom";
import {
  Shield,
  CheckCircle,
  Headphones,
  ArrowRight,
  MessageCircle,
  Truck,
  Star,
  Award,
  Zap,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import HeroCarousel from "@/components/HeroCarousel";
import { useEffect, useMemo, useState } from "react";
import { supabase, type Product } from "@/lib/supabase";
import { getSettings } from "@/lib/products";

const ICONS: Record<string, any> = {
  Shield,
  CheckCircle,
  Headphones,
  Truck,
  Star,
  Award,
  Zap
};

interface HeroConfig {
  hero_name: string;
  hero_image_url: string | null;
  hero_logo_url: string | null;
  carousel_title: string;
}

const Home = () => {
  const [s, setS] = useState(getSettings());
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [heroConfig, setHeroConfig] = useState<HeroConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const h = () => setS(getSettings());
    window.addEventListener("settings-updated", h);
    return () => window.removeEventListener("settings-updated", h);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;
      const productList = (productsData || []) as Product[];
      setProducts(productList);

      // Load brands from brands table
      const { data: brandsData, error: brandsError } = await supabase
        .from("brands")
        .select("name")
        .eq("is_visible", true)
        .order("order_index");

      if (brandsError) {
        // Fallback: extract from products if brands table doesn't exist yet
        const uniqueBrands = Array.from(new Set(productList.map(p => p.brand)))
          .filter(Boolean)
          .sort();
        setBrands(uniqueBrands);
      } else {
        const uniqueBrands = (brandsData || []).map(b => b.name).sort();
        setBrands(uniqueBrands);
      }

      // Load hero config
      const { data: configData, error: configError } = await supabase
        .from("hero_config")
        .select("*")
        .limit(1)
        .single();

      if (configError && configError.code !== "PGRST116") throw configError;

      if (configData) {
        setHeroConfig(configData as HeroConfig);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(
    () =>
      brandFilter === "all"
        ? products
        : products.filter((p) => p.brand === brandFilter),
    [products, brandFilter]
  );

  const featured = filtered.filter((p) => p.featured).slice(0, 4);
  const list = filtered.slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden text-white bg-black pt-6" style={{ minHeight: "576px" }}>
        <div className="container mx-auto px-4 py-0 relative h-full">
          <div className="grid grid-cols-1 md:grid-cols-10 gap-8 h-full items-center">
            {/* Left side - Logo/Image (30%) */}
            <div className="flex items-center justify-center py-0 md:col-span-3">
              <img
                src={heroConfig?.hero_logo_url || heroConfig?.hero_image_url || "https://uuwpzxpsvltqhrtadirk.supabase.co/storage/v1/object/public/products/webp%20logo.webp"}
                alt={heroConfig?.hero_name || "Logo"}
                className="h-auto w-full max-w-2xl rounded-lg shadow-xl"
              />
            </div>

            {/* Right side - Carousel (70%) */}
            <div className="flex flex-col items-center justify-center py-0 md:col-span-7">
              <div className="w-full mb-6">
                <h2 className="text-2xl font-bold text-center md:text-left">
                  {heroConfig?.carousel_title || "Destaques"}
                </h2>
              </div>
              <div className="w-full h-96 md:h-[461px] bg-white rounded-lg overflow-hidden shadow-2xl">
                <HeroCarousel />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8 text-white">Em destaque</h2>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ gridAutoRows: "1fr" }}>
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Vitrine */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-8 text-white">Vitrine</h2>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ gridAutoRows: "1fr" }}>
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* WhatsApp CTA */}
      <section className="text-center py-16">
        <h2 className="text-3xl font-bold text-white">
          {s.whatsappSectionTitle}
        </h2>
        <p className="text-white">{s.whatsappSectionText}</p>

        <Button asChild size="lg">
          <a href={`https://wa.me/${s.whatsappNumber}`}>
            <MessageCircle className="mr-2" />
            {s.whatsappSectionCta}
          </a>
        </Button>
      </section>
    </div>
  );
};

export default Home;

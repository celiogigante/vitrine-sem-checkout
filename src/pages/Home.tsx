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
import { getSettings, BRANDS } from "@/lib/products";

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
      setProducts((productsData || []) as Product[]);

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
      <section className="relative overflow-hidden text-white bg-black" style={{ minHeight: "600px" }}>
        <div className="container mx-auto px-4 py-0 relative h-full">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 h-full items-center">
            {/* Left side - Logo/Image (30%) */}
            <div className="flex items-center justify-center py-12 md:py-0 md:col-span-1">
              <img
                src={heroConfig?.hero_logo_url || heroConfig?.hero_image_url || "https://uuwpzxpsvltqhrtadirk.supabase.co/storage/v1/object/public/products/webp%20logo.webp"}
                alt={heroConfig?.hero_name || "Logo"}
                className="h-auto w-full max-w-2xl rounded-lg shadow-xl"
              />
            </div>

            {/* Right side - Carousel (70%) */}
            <div className="flex flex-col items-center justify-center py-12 md:py-0 md:col-span-4">
              <div className="w-full mb-6">
                <h2 className="text-2xl font-bold text-center md:text-left">
                  {heroConfig?.carousel_title || "Destaques"}
                </h2>
              </div>
              <div className="w-full h-80 md:h-96 bg-white rounded-lg overflow-hidden shadow-2xl">
                <HeroCarousel />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand filter */}
      <section className="container mx-auto px-4 pt-12">
        <div className="flex flex-wrap gap-2 justify-center">
          <button onClick={() => setBrandFilter("all")} className="px-4 py-2 rounded-full text-sm font-medium transition-colors hover:text-primary">
            Todas
          </button>
          {BRANDS.map((b) => (
            <button key={b} onClick={() => setBrandFilter(b)} className="px-4 py-2 rounded-full text-sm font-medium transition-colors hover:text-primary">
              {b}
            </button>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">Em destaque</h2>

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
        <h2 className="text-2xl font-bold mb-8">Vitrine</h2>

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
        <h2 className="text-3xl font-bold">
          {s.whatsappSectionTitle}
        </h2>
        <p>{s.whatsappSectionText}</p>

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

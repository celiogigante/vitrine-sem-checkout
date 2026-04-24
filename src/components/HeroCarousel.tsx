import { useState, useEffect } from "react";
import { supabase, Product } from "@/lib/supabase";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ProductHighlight {
  id: string;
  product_id: string;
  order_index: number;
}

export default function HeroCarousel() {
  const [highlights, setHighlights] = useState<ProductHighlight[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load highlights
      const { data: highlightsData, error: highlightsError } = await supabase
        .from("product_highlights")
        .select("*")
        .order("order_index");

      if (highlightsError) throw highlightsError;

      const highlightsList = (highlightsData || []) as ProductHighlight[];
      const productIds = highlightsList.map((h) => h.product_id);

      // Load products
      if (productIds.length > 0) {
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .in("id", productIds);

        if (productsError) throw productsError;

        const productsMap = new Map(
          (productsData || []).map((p: Product) => [p.id, p])
        );

        const orderedProducts = highlightsList
          .map((h) => productsMap.get(h.product_id))
          .filter((p) => p !== undefined) as Product[];

        setHighlights(highlightsList);
        setProducts(orderedProducts);
      }
    } catch (err) {
      console.error("Error loading carousel data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Autoplay effect
  useEffect(() => {
    if (!autoplay || products.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoplay, products.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? products.length - 1 : prev - 1
    );
    setAutoplay(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
    setAutoplay(false);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setAutoplay(false);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Nenhum produto em destaque</p>
      </div>
    );
  }

  const currentProduct = products[currentIndex];

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-50">
      {/* Carousel items */}
      <div className="relative w-full h-full">
        {products.map((product, index) => (
          <Link
            key={product.id}
            to={`/produtos/${product.id}`}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="w-full h-full flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-gray-100 transition-colors">
              {/* Product image */}
              <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Sem imagem</span>
                  </div>
                )}
              </div>

              {/* Product info */}
              <div className="text-center mt-4">
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600">{product.brand}</p>
                <p className="text-xl font-bold text-primary mt-2">
                  R$ {product.price.toLocaleString("pt-BR")}
                </p>
                {product.original_price && (
                  <p className="text-sm text-gray-500 line-through">
                    R$ {product.original_price.toLocaleString("pt-BR")}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Navigation buttons */}
      {products.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 transition-all"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6 text-gray-900" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 transition-all"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6 text-gray-900" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-primary w-8"
                    : "bg-gray-400 hover:bg-gray-600"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

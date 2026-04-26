import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, MessageCircle, Shield, CheckCircle, BatteryFull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { conditionLabel, conditionColor, getWhatsAppLink, statusLabel, statusColor, type Product, getProduct, incrementViews } from "@/lib/products";
import { recordProductClick, recordProductView } from "@/hooks/useProductClick";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | undefined>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Set initial image to primary image index when product loads
  useEffect(() => {
    if (product && product.images.length > 0) {
      setSelectedImage(product.primaryImageIndex ?? 0);
    }
  }, [product?.id]);

  const handleWhatsAppClick = () => {
    if (product) {
      recordProductClick(product.id, { type: "whatsapp" });
    }
  };

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = (productId: string) => {
    try {
      setIsLoading(true);
      const product = getProduct(productId);

      if (product) {
        setProduct(product);

        // Increment views
        incrementViews(productId);
        console.log("Views incrementadas para:", (product.views || 0) + 1);

        // Record product view
        recordProductView(productId);
      }
    } catch (err) {
      console.error("Error loading product:", err);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 md:py-20 text-center">
        <p className="text-base md:text-lg text-gray-300">Carregando produto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 md:py-20 text-center">
        <p className="text-base md:text-lg text-gray-300 mb-4 md:mb-6">Produto não encontrado.</p>
        <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-sm md:text-base"><Link to="/produtos">Voltar aos produtos</Link></Button>
      </div>
    );
  }

  const sold = product.status === "vendido";

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <Link to="/produtos" className="inline-flex items-center gap-1 text-xs md:text-sm text-gray-300 hover:text-yellow-400 transition-colors mb-4 md:mb-6">
        <ArrowLeft className="h-3 md:h-4 w-3 md:w-4" /> Voltar aos produtos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
        <div className="space-y-3 md:space-y-4">
          {product.images.length > 0 ? (
            <>
              <div className={`w-full aspect-[9/16] overflow-hidden rounded-lg md:rounded-xl border bg-gradient-to-b from-gray-800 to-gray-900 transition-opacity flex items-center justify-center ${sold ? "opacity-70" : ""}`}>
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2 flex-wrap overflow-x-auto pb-2">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 h-14 w-14 md:h-16 md:w-16 rounded-lg border overflow-hidden transition-all bg-gray-800 flex items-center justify-center ${i === selectedImage ? "ring-2 ring-yellow-400 scale-105" : "hover:scale-105"}`}
                    >
                      <img src={img} alt="" className="h-full w-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : null}

          {product.videoUrl && (
            <div className="rounded-lg md:rounded-xl border overflow-hidden bg-black aspect-video">
              <iframe
                src={product.videoUrl}
                title="Product video"
                className="w-full h-full"
                allowFullScreen
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          )}
        </div>

        <div className="space-y-4 md:space-y-6">
          <div>
            <p className="text-xs md:text-sm font-semibold text-yellow-400 mb-2 uppercase tracking-wider">{product.brand}</p>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4 leading-tight">{product.name}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge className={statusColor(product.status)}>{statusLabel(product.status)}</Badge>
              <Badge className={conditionColor(product.condition)}>{conditionLabel(product.condition)}</Badge>
              {product.promotion && <Badge className="bg-destructive text-destructive-foreground">Oferta</Badge>}
              {(product as any).is_on_request && (
                <Badge className="bg-orange-500 text-white">Por Pedido</Badge>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-700">
            {product.originalPrice && (
              <p className="text-xs md:text-sm text-gray-400 line-through mb-2">R$ {product.originalPrice.toLocaleString("pt-BR")}</p>
            )}
            <p className="text-4xl md:text-5xl font-extrabold text-yellow-400">R$ {product.price.toLocaleString("pt-BR")}</p>
          </div>

          {!sold ? (
            <>
              <Button
                size="lg"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm md:text-base py-5 md:py-6 font-semibold shadow-lg transition-all active:scale-95"
                onClick={() => {
                  handleWhatsAppClick();
                  window.open(getWhatsAppLink(product), "_blank");
                }}
              >
                <MessageCircle className="mr-2 h-4 md:h-5 w-4 md:w-5" /> Negociar pelo WhatsApp
              </Button>
              {(product as any).is_on_request && (
                <div className="rounded-lg border border-orange-600 bg-orange-900/30 p-3 md:p-4">
                  <p className="text-xs md:text-sm font-medium text-orange-300 mb-1">⏱️ Produto Por Pedido</p>
                  <p className="text-xs text-orange-200">
                    Este produto é vendido por pedido. O prazo de entrega é de até 3 dias úteis após confirmação do pagamento.
                  </p>
                </div>
              )}
            </>
          ) : (
            <Button size="lg" disabled className="w-full text-sm md:text-base py-5 md:py-6">Produto vendido</Button>
          )}

          <div className="flex flex-wrap gap-4 md:gap-6 text-xs md:text-sm text-gray-300 pt-2 border-t border-gray-700">
            <span className="flex items-center gap-2"><Shield className="h-3 md:h-4 w-3 md:w-4 text-yellow-400 flex-shrink-0" /> Garantia 90 dias</span>
            <span className="flex items-center gap-2"><CheckCircle className="h-3 md:h-4 w-3 md:w-4 text-yellow-400 flex-shrink-0" /> Testado</span>
            {product.battery !== undefined && (
              <span className="flex items-center gap-2"><BatteryFull className="h-3 md:h-4 w-3 md:w-4 text-yellow-400 flex-shrink-0" /> Bateria {product.battery}%</span>
            )}
          </div>

          {product.generalState && (
            <div className="rounded-lg border border-gray-700 bg-gray-900 p-3 md:p-4">
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Estado Geral</p>
              <p className="text-sm font-medium text-white">{product.generalState}</p>
            </div>
          )}

          <div>
            <h2 className="font-semibold text-white mb-2 md:mb-3 text-base md:text-lg">Descrição</h2>
            <p className="text-xs md:text-sm text-gray-300 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>

          {Object.keys(product.specs).length > 0 && (
            <div>
              <h2 className="font-semibold text-white mb-2 md:mb-3 text-base md:text-lg">Especificações</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="rounded-lg bg-gray-900 border border-gray-700 p-3 md:p-4">
                    <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">{key}</p>
                    <p className="text-xs md:text-sm font-medium text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

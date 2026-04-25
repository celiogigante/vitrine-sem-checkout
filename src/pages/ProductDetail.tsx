import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, MessageCircle, Shield, CheckCircle, BatteryFull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { conditionLabel, conditionColor, getWhatsAppLink, statusLabel, statusColor, type Product } from "@/lib/products";
import { supabase } from "@/lib/supabase";
import { recordProductClick, recordProductView } from "@/hooks/useProductClick";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | undefined>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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

  const loadProduct = async (productId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) throw error;

      if (data) {
        const product: Product & { is_on_request?: boolean } = {
          id: data.id,
          name: data.name,
          brand: data.brand,
          price: data.price,
          originalPrice: data.original_price,
          description: data.description,
          condition: data.condition,
          status: data.status || "disponivel",
          battery: data.battery_percentage,
          generalState: data.general_condition,
          slug: data.slug || data.id,
          images: data.images || [],
          videoUrl: data.video_url,
          specs: data.specs || {},
          featured: data.featured,
          promotion: data.promotion,
          views: data.views,
          createdAt: data.created_at,
          is_on_request: data.is_on_request || false,
        };
        setProduct(product);

        // Increment views
        const newViews = (data.views || 0) + 1;
        const { error: updateError } = await supabase
          .from("products")
          .update({ views: newViews })
          .eq("id", productId);

        if (updateError) {
          console.error("Erro ao atualizar views:", updateError);
        } else {
          console.log("Views incrementadas para:", newViews);
        }

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
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-lg text-gray-300">Carregando produto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-lg text-gray-300 mb-6">Produto não encontrado.</p>
        <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"><Link to="/produtos">Voltar aos produtos</Link></Button>
      </div>
    );
  }

  const sold = product.status === "vendido";

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/produtos" className="inline-flex items-center gap-1 text-sm text-gray-300 hover:text-yellow-400 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Voltar aos produtos
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          {product.images.length > 0 ? (
            <>
              <div className={`aspect-square overflow-hidden rounded-xl border bg-secondary ${sold ? "opacity-70" : ""}`}>
                <img src={product.images[selectedImage]} alt={product.name} className="h-full w-full object-cover" />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {product.images.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImage(i)} className={`h-16 w-16 rounded-lg border overflow-hidden ${i === selectedImage ? "ring-2 ring-primary" : ""}`}>
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : null}

          {product.videoUrl && (
            <div className="rounded-xl border overflow-hidden bg-black">
              <iframe
                src={product.videoUrl}
                title="Product video"
                className="w-full h-96"
                allowFullScreen
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold text-yellow-400 mb-2 uppercase tracking-wider">{product.brand}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{product.name}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge className={statusColor(product.status)}>{statusLabel(product.status)}</Badge>
              <Badge className={conditionColor(product.condition)}>{conditionLabel(product.condition)}</Badge>
              {product.promotion && <Badge className="bg-destructive text-destructive-foreground">Oferta</Badge>}
              {(product as any).is_on_request && (
                <Badge className="bg-orange-500 text-white">Por Pedido</Badge>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
            {product.originalPrice && (
              <p className="text-sm text-gray-400 line-through mb-2">R$ {product.originalPrice.toLocaleString("pt-BR")}</p>
            )}
            <p className="text-5xl font-extrabold text-yellow-400">R$ {product.price.toLocaleString("pt-BR")}</p>
          </div>

          {!sold ? (
            <>
              <Button
                size="lg"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-base py-6 font-semibold shadow-lg"
                onClick={() => {
                  handleWhatsAppClick();
                  window.open(getWhatsAppLink(product), "_blank");
                }}
              >
                <MessageCircle className="mr-2 h-5 w-5" /> Negociar pelo WhatsApp
              </Button>
              {(product as any).is_on_request && (
                <div className="rounded-lg border border-orange-600 bg-orange-900/30 p-4">
                  <p className="text-sm font-medium text-orange-300 mb-1">⏱️ Produto Por Pedido</p>
                  <p className="text-xs text-orange-200">
                    Este produto é vendido por pedido. O prazo de entrega é de até 3 dias úteis após confirmação do pagamento.
                  </p>
                </div>
              )}
            </>
          ) : (
            <Button size="lg" disabled className="w-full text-base py-6">Produto vendido</Button>
          )}

          <div className="flex flex-wrap gap-6 text-sm text-gray-300 pt-2 border-t border-gray-700">
            <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-yellow-400" /> Garantia 90 dias</span>
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-yellow-400" /> Testado</span>
            {product.battery !== undefined && (
              <span className="flex items-center gap-2"><BatteryFull className="h-4 w-4 text-yellow-400" /> Bateria {product.battery}%</span>
            )}
          </div>

          {product.generalState && (
            <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Estado Geral</p>
              <p className="text-sm font-medium text-white">{product.generalState}</p>
            </div>
          )}

          <div>
            <h2 className="font-semibold text-white mb-3 text-lg">Descrição</h2>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>

          {Object.keys(product.specs).length > 0 && (
            <div>
              <h2 className="font-semibold text-white mb-3 text-lg">Especificações</h2>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="rounded-lg bg-gray-900 border border-gray-700 p-4">
                    <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">{key}</p>
                    <p className="text-sm font-medium text-white">{value}</p>
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

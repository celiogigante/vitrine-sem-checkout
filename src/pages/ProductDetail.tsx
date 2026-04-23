import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, MessageCircle, Shield, CheckCircle, BatteryFull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { conditionLabel, conditionColor, getWhatsAppLink, statusLabel, statusColor, type Product } from "@/lib/products";
import { supabase } from "@/lib/supabase";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | undefined>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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
        const product: Product = {
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
          specs: data.specs || {},
          featured: data.featured,
          promotion: data.promotion,
          views: data.views,
          createdAt: data.created_at,
        };
        setProduct(product);

        // Increment views
        await supabase
          .from("products")
          .update({ views: (data.views || 0) + 1 })
          .eq("id", productId);
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
        <p className="text-lg text-muted-foreground">Carregando produto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-lg text-muted-foreground">Produto não encontrado.</p>
        <Button asChild variant="outline" className="mt-4"><Link to="/produtos">Voltar</Link></Button>
      </div>
    );
  }

  const sold = product.status === "vendido";

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/produtos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Voltar aos produtos
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
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
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
            <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className={statusColor(product.status)}>{statusLabel(product.status)}</Badge>
              <Badge className={conditionColor(product.condition)}>{conditionLabel(product.condition)}</Badge>
              {product.promotion && <Badge className="bg-destructive text-destructive-foreground">Oferta</Badge>}
            </div>
          </div>

          <div>
            {product.originalPrice && (
              <p className="text-sm text-muted-foreground line-through">R$ {product.originalPrice.toLocaleString("pt-BR")}</p>
            )}
            <p className="text-3xl font-extrabold">R$ {product.price.toLocaleString("pt-BR")}</p>
          </div>

          {!sold ? (
            <Button asChild size="lg" className="w-full bg-whatsapp hover:bg-whatsapp-hover text-whatsapp-foreground text-base py-6">
              <a href={getWhatsAppLink(product)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" /> Negociar pelo WhatsApp
              </a>
            </Button>
          ) : (
            <Button size="lg" disabled className="w-full text-base py-6">Produto vendido</Button>
          )}

          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Shield className="h-4 w-4 text-primary" /> Garantia 90 dias</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-primary" /> Testado</span>
            {product.battery !== undefined && (
              <span className="flex items-center gap-1"><BatteryFull className="h-4 w-4 text-primary" /> Bateria {product.battery}%</span>
            )}
          </div>

          {product.generalState && (
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Estado geral</p>
              <p className="text-sm font-medium">{product.generalState}</p>
            </div>
          )}

          <div>
            <h2 className="font-semibold mb-2">Descrição</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>

          {Object.keys(product.specs).length > 0 && (
            <div>
              <h2 className="font-semibold mb-3">Especificações</h2>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="rounded-lg bg-secondary p-3">
                    <p className="text-xs text-muted-foreground">{key}</p>
                    <p className="text-sm font-medium">{value}</p>
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

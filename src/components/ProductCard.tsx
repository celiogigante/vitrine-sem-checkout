import { Link } from "react-router-dom";
import {
  Product,
  conditionLabel,
  conditionColor,
  getWhatsAppLink,
  statusLabel,
  statusColor
} from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Eye } from "lucide-react";

const ProductCard = ({ product }: { product: Product }) => {
  const sold = product.status === "vendido";

  return (
    <div
      className={`group rounded-xl border bg-card overflow-hidden transition-shadow hover:shadow-lg flex flex-col h-full ${
        sold ? "opacity-60" : ""
      }`}
      style={{ boxShadow: "var(--card-shadow)" }}
    >
      <Link
        to={`/produto/${product.id}`}
        className="block relative aspect-video overflow-hidden bg-secondary flex-shrink-0"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge className={statusColor(product.status)}>
            {statusLabel(product.status)}
          </Badge>

          <Badge className={conditionColor(product.condition)}>
            {conditionLabel(product.condition)}
          </Badge>

          {product.promotion && product.status === "disponivel" && (
            <Badge className="bg-destructive text-destructive-foreground">
              Oferta
            </Badge>
          )}
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-card/80 backdrop-blur-sm px-2 py-1 text-xs text-muted-foreground">
          <Eye className="h-3 w-3" /> {product.views}
        </div>
      </Link>

      <div className="p-4 flex flex-col h-full">
        <div className="space-y-2 flex-1">
          <div>
            <p className="text-xs text-muted-foreground">{product.brand}</p>
            <h3 className="font-semibold text-sm leading-tight line-clamp-2">
              {product.name}
            </h3>
          </div>

          <div className="flex items-baseline gap-2">
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                R$ {product.originalPrice.toLocaleString("pt-BR")}
              </span>
            )}
            <span className="text-lg font-bold">
              R$ {product.price.toLocaleString("pt-BR")}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Button asChild size="sm" variant="outline" className="flex-1 h-9">
            <Link to={`/produto/${product.id}`}>Ver detalhes</Link>
          </Button>

          {!sold && (
            <Button
              asChild
              size="sm"
              className="bg-whatsapp hover:bg-whatsapp-hover text-whatsapp-foreground h-9 w-9"
            >
              <a
                href={getWhatsAppLink(product)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Negociar via WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

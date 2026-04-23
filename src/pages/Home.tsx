import { Link } from "react-router-dom";
import { Shield, CheckCircle, Headphones, ArrowRight, MessageCircle, Truck, Star, Award, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { getProducts, getSettings, BRANDS } from "@/lib/products";
import { useEffect, useMemo, useState } from "react";

const ICONS: Record<string, any> = { Shield, CheckCircle, Headphones, Truck, Star, Award, Zap };

const Home = () => {
  const [s, setS] = useState(getSettings());
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const products = getProducts();

  useEffect(() => {
    const h = () => setS(getSettings());
    window.addEventListener("settings-updated", h);
    return () => window.removeEventListener("settings-updated", h);
  }, []);

  const filtered = useMemo(
    () => brandFilter === "all" ? products : products.filter(p => p.brand === brandFilter),
    [products, brandFilter]
  );

  const featured = filtered.filter(p => p.featured).slice(0, 4);
  const list = filtered.slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(var(--accent)) 0%, transparent 50%)" }} />
        <div className="container mx-auto px-4 py-20 md:py-28 relative grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">{s.heroTitle}</h1>
            <p className="text-lg opacity-80 max-w-lg">{s.heroSubtitle}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:opacity-90">
                <Link to="/produtos">Ver catálogo <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-primary-foreground border-primary-foreground text-primary hover:bg-primary-foreground/90 hover:text-primary">
                <a href={`https://wa.me/${s.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" /> {s.heroCtaText}
                </a>
              </Button>
            </div>
          </div>
          {s.heroImage && (
            <div className="hidden md:block">
              <img src={s.heroImage} alt="Destaque" className="rounded-2xl shadow-2xl w-full object-cover aspect-square" />
            </div>
          )}
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b bg-card">
        <div className="container mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {s.trustItems.map((item, i) => {
            const Icon = ICONS[item.icon] || Shield;
            return (
              <div key={i} className="flex items-center gap-3 text-sm">
                <Icon className="h-5 w-5 text-primary shrink-0" />
                <span className="font-medium">{item.text}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Brand filter */}
      <section className="container mx-auto px-4 pt-12">
        <div className="flex flex-wrap gap-2 justify-center">
          <button onClick={() => setBrandFilter("all")} className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${brandFilter === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-secondary"}`}>Todas</button>
          {BRANDS.map(b => (
            <button key={b} onClick={() => setBrandFilter(b)} className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${brandFilter === b ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-secondary"}`}>{b}</button>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Em destaque</h2>
            <Link to="/produtos" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Vitrine */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-8">Vitrine</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {list.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* WhatsApp section */}
      <section className="bg-whatsapp/10 border-y">
        <div className="container mx-auto px-4 py-16 text-center space-y-4">
          <h2 className="text-3xl font-bold">{s.whatsappSectionTitle}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{s.whatsappSectionText}</p>
          <Button asChild size="lg" className="bg-whatsapp hover:bg-whatsapp-hover text-whatsapp-foreground">
            <a href={`https://wa.me/${s.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" /> {s.whatsappSectionCta}
            </a>
          </Button>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">Por que comprar com a gente</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {s.benefits.map((item, i) => {
            const Icon = ICONS[item.icon] || Shield;
            return (
              <div key={i} className="flex gap-4 rounded-xl border bg-card p-6" style={{ boxShadow: "var(--card-shadow)" }}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;

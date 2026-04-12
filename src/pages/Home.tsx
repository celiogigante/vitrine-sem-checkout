import { Link } from "react-router-dom";
import { Shield, CheckCircle, Headphones, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/products";

const Home = () => {
  const products = getProducts();
  const featured = products.filter(p => p.featured).slice(0, 4);
  const mostViewed = [...products].sort((a, b) => b.views - a.views).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(var(--accent)) 0%, transparent 50%)" }} />
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
              Celulares seminovos com <span className="text-accent">garantia</span> e qualidade
            </h1>
            <p className="text-lg opacity-80 max-w-lg">
              Aparelhos testados, revisados e prontos para uso. Economize até 50% comprando seminovos com segurança.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:opacity-90">
                <Link to="/produtos">Ver catálogo <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" /> Fale conosco
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: "Garantia de 90 dias", desc: "Todos os aparelhos possuem garantia contra defeitos." },
            { icon: CheckCircle, title: "100% Testados", desc: "Cada celular passa por mais de 30 testes de qualidade." },
            { icon: Headphones, title: "Suporte dedicado", desc: "Atendimento rápido e personalizado via WhatsApp." },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 rounded-xl border bg-card p-6" style={{ boxShadow: "var(--card-shadow)" }}>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <item.icon className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Em destaque</h2>
          <Link to="/produtos" className="text-sm text-accent font-medium hover:underline flex items-center gap-1">
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Most Viewed */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-8">Mais vistos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mostViewed.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
};

export default Home;

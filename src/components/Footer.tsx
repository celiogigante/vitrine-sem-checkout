import { Smartphone, Mail, Phone, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSettings } from "@/lib/products";

const Footer = () => {
  const [s, setS] = useState(getSettings());
  useEffect(() => {
    const h = () => setS(getSettings());
    window.addEventListener("settings-updated", h);
    return () => window.removeEventListener("settings-updated", h);
  }, []);

  return (
    <footer className="border-t bg-card mt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg mb-2">
              <Smartphone className="h-5 w-5 text-primary" />
              {s.footerName}
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">{s.footerDesc}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Navegação</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link to="/" className="block hover:text-foreground">Início</Link>
              <Link to="/produtos" className="block hover:text-foreground">Produtos</Link>
              <Link to="/admin" className="block hover:text-foreground">Admin</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Contato</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              {s.footerPhone && <a href={`https://wa.me/${s.whatsappNumber}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-foreground"><Phone className="h-4 w-4" />{s.footerPhone}</a>}
              {s.footerEmail && <a href={`mailto:${s.footerEmail}`} className="flex items-center gap-2 hover:text-foreground"><Mail className="h-4 w-4" />{s.footerEmail}</a>}
              {s.footerInstagram && <a href={`https://instagram.com/${s.footerInstagram.replace("@", "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-foreground"><Instagram className="h-4 w-4" />{s.footerInstagram}</a>}
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {s.footerName}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t bg-card mt-16">
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 font-bold text-lg mb-2">
            <Smartphone className="h-5 w-5 text-accent" />
            CellStore
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Celulares seminovos testados e com garantia. Qualidade e confiança para você.
          </p>
        </div>
        <div className="flex gap-12">
          <div>
            <h4 className="font-semibold text-sm mb-3">Navegação</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link to="/" className="block hover:text-foreground">Início</Link>
              <Link to="/produtos" className="block hover:text-foreground">Produtos</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Contato</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <a href="https://wa.me/5511999999999" target="_blank" className="block hover:text-foreground">WhatsApp</a>
              <Link to="/admin" className="block hover:text-foreground">Admin</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t mt-8 pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} CellStore. Todos os direitos reservados.
      </div>
    </div>
  </footer>
);

export default Footer;

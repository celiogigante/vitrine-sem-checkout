import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/authContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { getSettings } from "@/lib/products";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [s, setS] = useState(getSettings());
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const h = () => setS(getSettings());
    window.addEventListener("settings-updated", h);
    return () => window.removeEventListener("settings-updated", h);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    toast({ title: "Desconectado com sucesso" });
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="https://cdn.builder.io/api/v1/image/assets%2F0f424a25e73f4d24902cebe46635e6a9%2Fc4302bee56ed4913afb33a88f71c2891?format=webp&width=300&height=300" alt="Logo" className="h-20 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Início
          </Link>

          <Link
            to="/produtos"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/produtos") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Produtos
          </Link>

          {user && isAdmin && (
            <Link
              to="/admin"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/admin") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Painel
            </Link>
          )}

          <Button
            asChild
            size="sm"
            className="bg-whatsapp hover:bg-whatsapp-hover text-whatsapp-foreground"
          >
            <a
              href={`https://wa.me/${s.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </Button>

          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Sair</span>
            </Button>
          ) : (
            <Button asChild size="sm" variant="default">
              <Link to="/admin/login">Entrar</Link>
            </Button>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="md:hidden border-t bg-card px-4 pb-4 pt-2 space-y-2">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="block py-2 text-sm font-medium"
          >
            Início
          </Link>

          <Link
            to="/produtos"
            onClick={() => setOpen(false)}
            className="block py-2 text-sm font-medium"
          >
            Produtos
          </Link>

          {user && isAdmin && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium"
            >
              Painel Admin
            </Link>
          )}

          <Button
            asChild
            size="sm"
            className="w-full bg-whatsapp hover:bg-whatsapp-hover text-whatsapp-foreground"
          >
            <a
              href={`https://wa.me/${s.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </Button>

          {user ? (
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          ) : (
            <Button asChild size="sm" className="w-full" variant="default">
              <Link to="/admin/login" onClick={() => setOpen(false)}>
                Entrar
              </Link>
            </Button>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;

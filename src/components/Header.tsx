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
    <header className="sticky top-0 z-50 border-b bg-black backdrop-blur-lg">
      <div className="container mx-auto flex h-24 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="https://cdn.builder.io/api/v1/image/assets%2F2ab7f0f046f142c08bab1f7e136ba5b7%2F954eec5b35ac443eb63ae8a7ca82cabf?format=webp&width=800&height=1200" alt="Master Cell Logo" className="h-20 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Button asChild size="sm" className="border border-yellow-400 bg-transparent text-yellow-400 hover:bg-yellow-400/10">
            <Link to="/">Início</Link>
          </Button>

          <Button asChild size="sm" className="border border-yellow-400 bg-transparent text-yellow-400 hover:bg-yellow-400/10">
            <Link to="/produtos">Produtos</Link>
          </Button>

          {user && isAdmin && (
            <Button asChild size="sm" className="border border-yellow-400 bg-transparent text-yellow-400 hover:bg-yellow-400/10">
              <Link to="/admin">Painel</Link>
            </Button>
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
              size="sm"
              onClick={handleLogout}
              className="border border-yellow-400 bg-transparent text-yellow-400 hover:bg-yellow-400/10 flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Sair</span>
            </Button>
          ) : (
            <Button asChild size="sm" className="border border-yellow-400 bg-transparent text-yellow-400 hover:bg-yellow-400/10">
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
            <X className="h-6 w-6 text-yellow-400" />
          ) : (
            <Menu className="h-6 w-6 text-yellow-400" />
          )}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="md:hidden border-t bg-black px-4 pb-4 pt-2 space-y-2">
          <Button asChild size="sm" className="w-full border border-yellow-400 bg-transparent text-yellow-400 hover:bg-yellow-400/10">
            <Link to="/" onClick={() => setOpen(false)}>
              Início
            </Link>
          </Button>

          <Button asChild size="sm" className="w-full border border-yellow-400 bg-transparent text-yellow-400 hover:bg-yellow-400/10">
            <Link to="/produtos" onClick={() => setOpen(false)}>
              Produtos
            </Link>
          </Button>

          {user && isAdmin && (
            <Button asChild size="sm" className="w-full border border-yellow-400 bg-transparent text-yellow-400 hover:bg-yellow-400/10">
              <Link to="/admin" onClick={() => setOpen(false)}>
                Painel Admin
              </Link>
            </Button>
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
              size="sm"
              className="w-full border border-yellow-400 bg-transparent text-yellow-400 hover:bg-yellow-400/10 flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          ) : (
            <Button asChild size="sm" className="w-full border border-yellow-400 bg-transparent text-yellow-400 hover:bg-yellow-400/10">
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

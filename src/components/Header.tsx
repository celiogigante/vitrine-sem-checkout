import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/authContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { getSettings } from "@/lib/products";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  is_visible: boolean;
}

const Header = () => {
  const [open, setOpen] = useState(false);
  const [s, setS] = useState(getSettings());
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
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

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_visible", true)
        .isNull("parent_id")
        .order("order_index");

      if (error) throw error;
      setMenuItems((data || []) as MenuItem[]);
    } catch (err) {
      console.error("Error loading menu items:", err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    toast({ title: "Desconectado com sucesso" });
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-lg" style={{ backgroundColor: '#000000' }}>
      <div className="container mx-auto flex h-24 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F745a6a1096d546999a2f21f0471c7da5%2F79ed162aed044a158c0b43eac2527532?format=webp&width=800&height=1200"
            alt="Master Cell Logo"
            className="h-12 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              asChild
              size="sm"
              className="border border-white bg-transparent text-white hover:bg-white/10"
            >
              <Link to={item.href}>{item.label}</Link>
            </Button>
          ))}

          {user && isAdmin && (
            <Button asChild size="sm" className="border border-white bg-transparent text-white hover:bg-white/10">
              <Link to="/admin">Painel</Link>
            </Button>
          )}

          {user ? (
            <Button
              size="sm"
              onClick={handleLogout}
              className="border border-white bg-transparent text-white hover:bg-white/10 flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Sair</span>
            </Button>
          ) : null}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Menu className="h-6 w-6 text-white" />
          )}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="md:hidden border-t px-4 pb-4 pt-2 space-y-2" style={{ backgroundColor: '#000000' }}>
          {menuItems.map((item) => (
            <Button
              key={item.id}
              asChild
              size="sm"
              className="w-full border border-white bg-transparent text-white hover:bg-white/10"
            >
              <Link to={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            </Button>
          ))}

          {user && isAdmin && (
            <Button asChild size="sm" className="w-full border border-white bg-transparent text-white hover:bg-white/10">
              <Link to="/admin" onClick={() => setOpen(false)}>
                Painel Admin
              </Link>
            </Button>
          )}

          {user ? (
            <Button
              onClick={handleLogout}
              size="sm"
              className="w-full border border-white bg-transparent text-white hover:bg-white/10 flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          ) : null}
        </nav>
      )}
    </header>
  );
};

export default Header;

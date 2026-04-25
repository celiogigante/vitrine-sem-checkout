import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [s, setS] = useState(getSettings());
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/produtos?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

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
        .is("parent_id", null)
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
    <header className="sticky top-0 z-50 backdrop-blur-lg" style={{ backgroundColor: '#000000', borderBottom: '2px solid #fcd34d' }}>
      <div className="container mx-auto flex h-24 items-center justify-between px-4 gap-4">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F745a6a1096d546999a2f21f0471c7da5%2F79ed162aed044a158c0b43eac2527532?format=webp&width=800&height=1200"
            alt="Master Cell Logo"
            className="h-12 w-auto"
          />
        </Link>

        {/* Search bar - visible on all sizes */}
        <form onSubmit={handleSearch} className="flex flex-1 max-w-xs md:max-w-xs">
          <div className="relative w-full">
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-10 bg-white/10 border-yellow-300/30 text-white placeholder:text-white/50 focus:border-yellow-300 focus:bg-white/20 text-sm"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-300 hover:text-yellow-200"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-3 flex-shrink-0">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              asChild
              size="sm"
              className="border border-yellow-300 bg-transparent text-yellow-300 hover:bg-yellow-300/10"
            >
              <Link to={item.href}>{item.label}</Link>
            </Button>
          ))}

          {user && isAdmin && (
            <Button asChild size="sm" className="border border-yellow-300 bg-transparent text-yellow-300 hover:bg-yellow-300/10">
              <Link to="/admin">Painel</Link>
            </Button>
          )}

          {user ? (
            <Button
              size="sm"
              onClick={handleLogout}
              className="border border-yellow-300 bg-transparent text-yellow-300 hover:bg-yellow-300/10 flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Sair</span>
            </Button>
          ) : null}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex-shrink-0"
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
        <nav className="md:hidden border-t px-4 pb-4 pt-2 space-y-2" style={{ backgroundColor: '#000000', borderTopColor: '#FFF9E6' }}>
          {menuItems.map((item) => (
            <Button
              key={item.id}
              asChild
              size="sm"
              className="w-full border border-yellow-300 bg-transparent text-yellow-300 hover:bg-yellow-300/10"
            >
              <Link to={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            </Button>
          ))}

          {user && isAdmin && (
            <Button asChild size="sm" className="w-full border border-yellow-300 bg-transparent text-yellow-300 hover:bg-yellow-300/10">
              <Link to="/admin" onClick={() => setOpen(false)}>
                Painel Admin
              </Link>
            </Button>
          )}

          {user ? (
            <Button
              onClick={handleLogout}
              size="sm"
              className="w-full border border-yellow-300 bg-transparent text-yellow-300 hover:bg-yellow-300/10 flex items-center gap-2"
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

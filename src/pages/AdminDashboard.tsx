import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/authContext";
import { Product } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ImageUpload";
import { Insights } from "@/components/Insights";
import AdminMenuManager from "@/components/AdminMenuManager";
import AdminHeroConfig from "@/components/AdminHeroConfig";
import AdminProductHighlights from "@/components/AdminProductHighlights";
import AdminBrandsManager from "@/components/AdminBrandsManager";
import { Pencil, Trash2, Plus, LogOut, Loader2, BarChart3, Package, Menu, Image, Star, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CONDITIONS = ["novo", "seminovo", "excelente", "bom", "regular"];

const conditionLabel = (c: string) => {
  const map: Record<string, string> = {
    novo: "Novo",
    seminovo: "Seminovo",
    excelente: "Excelente",
    bom: "Bom",
    regular: "Regular",
  };
  return map[c] || c;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"insights" | "produtos" | "menu" | "marcas" | "hero" | "destaques">("insights");

  const [form, setForm] = useState({
    name: "",
    brand: "Apple",
    price: 0,
    original_price: undefined as number | undefined,
    description: "",
    condition: "seminovo",
    status: "disponivel" as "disponivel" | "vendido",
    battery_percentage: undefined as number | undefined,
    general_condition: "",
    images: [] as string[],
    video_url: "",
    specs: {} as Record<string, string>,
    featured: false,
    promotion: false,
    is_on_request: false,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("products").select("*");

      if (error) throw error;

      const productList = (data || []) as Product[];
      setProducts(productList);

      // Load brands from brands table
      const { data: brandsData, error: brandsError } = await supabase
        .from("brands")
        .select("name")
        .eq("is_visible", true)
        .order("order_index");

      if (brandsError) {
        console.warn("Brands table error, extracting from products:", brandsError);
        // Fallback: extract from products if brands table doesn't exist yet
        const uniqueBrands = Array.from(new Set(productList.map(p => p.brand)))
          .filter(Boolean)
          .sort();
        setBrands(uniqueBrands.length > 0 ? uniqueBrands : ["Apple", "Samsung", "Xiaomi", "LG", "Motorola"]);
      } else {
        const uniqueBrands = (brandsData || []).map(b => b.name);
        setBrands(uniqueBrands.length > 0 ? uniqueBrands : ["Apple", "Samsung", "Xiaomi", "LG", "Motorola"]);
      }
    } catch (err) {
      console.error("Error loading products:", err);
      toast({
        title: "Erro ao carregar produtos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast({
        title: "Preencha nome e preço",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const productData = {
        name: form.name,
        brand: form.brand,
        price: form.price,
        original_price: form.original_price || null,
        description: form.description,
        condition: form.condition,
        status: form.status,
        battery_percentage: form.battery_percentage || null,
        general_condition: form.general_condition || null,
        images: form.images.filter((i) => i.trim()),
        video_url: form.video_url || null,
        specs: form.specs,
        featured: form.featured,
        promotion: form.promotion,
        is_on_request: form.is_on_request,
      };

      if (editing) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editing);

        if (error) throw error;
        toast({ title: "Produto atualizado!" });
      } else {
        const { error } = await supabase.from("products").insert([productData]);

        if (error) throw error;
        toast({ title: "Produto adicionado!" });
      }

      loadProducts();
      resetForm();
    } catch (err) {
      console.error("Error saving product:", err);
      toast({
        title: "Erro ao salvar produto",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      brand: product.brand,
      price: product.price,
      original_price: product.original_price,
      description: product.description,
      condition: product.condition,
      status: (product as any).status || "disponivel",
      battery_percentage: (product as any).battery_percentage || undefined,
      general_condition: (product as any).general_condition || "",
      images: product.images && product.images.length ? product.images : [],
      video_url: product.video_url || "",
      specs: product.specs,
      featured: product.featured,
      promotion: product.promotion,
      is_on_request: (product as any).is_on_request || false,
    });
    setEditing(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este produto?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;

      setProducts(products.filter((p) => p.id !== id));
      toast({ title: "Produto removido" });
    } catch (err) {
      console.error("Error deleting product:", err);
      toast({
        title: "Erro ao deletar produto",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      brand: "Apple",
      price: 0,
      original_price: undefined,
      description: "",
      condition: "seminovo",
      status: "disponivel",
      battery_percentage: undefined,
      general_condition: "",
      images: [],
      video_url: "",
      specs: {},
      featured: false,
      promotion: false,
      is_on_request: false,
    });
    setEditing(null);
    setShowForm(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Painel Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bem-vindo, {user?.email}
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "produtos" && (
            <Button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              size="sm"
            >
              <Plus className="mr-1 h-4 w-4" /> Novo produto
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-1 h-4 w-4" /> Sair
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b overflow-x-auto pb-0">
        <button
          onClick={() => setActiveTab("insights")}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "insights"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Insights
        </button>
        <button
          onClick={() => setActiveTab("produtos")}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "produtos"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Package className="h-4 w-4" />
          Produtos
        </button>
        <button
          onClick={() => setActiveTab("menu")}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "menu"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Menu className="h-4 w-4" />
          Menu
        </button>
        <button
          onClick={() => setActiveTab("marcas")}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "marcas"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Tag className="h-4 w-4" />
          Marcas
        </button>
        <button
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "hero"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Image className="h-4 w-4" />
          Hero
        </button>
        <button
          onClick={() => setActiveTab("destaques")}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "destaques"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Star className="h-4 w-4" />
          Destaques
        </button>
      </div>

      {/* Insights Tab */}
      {activeTab === "insights" && (
        <div className="mb-8">
          <Insights />
        </div>
      )}

      {/* Menu Tab */}
      {activeTab === "menu" && (
        <div className="mb-8">
          <AdminMenuManager />
        </div>
      )}

      {/* Marcas Tab */}
      {activeTab === "marcas" && (
        <div className="mb-8">
          <AdminBrandsManager />
        </div>
      )}

      {/* Hero Tab */}
      {activeTab === "hero" && (
        <div className="mb-8">
          <AdminHeroConfig />
        </div>
      )}

      {/* Destaques Tab */}
      {activeTab === "destaques" && (
        <div className="mb-8">
          <AdminProductHighlights />
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "produtos" && (
        <>
          {showForm && (
        <div className="mb-8 rounded-xl border bg-card p-6 space-y-6">
          <h2 className="font-semibold text-lg">
            {editing ? "Editar produto" : "Novo produto"}
          </h2>

          {/* Básico */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Nome do produto"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Select value={form.brand} onValueChange={(v) => setForm({ ...form, brand: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione marca" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preços */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Preços</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Preço (R$)"
                value={form.price || ""}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
              <Input
                type="number"
                placeholder="Preço original (opcional)"
                value={form.original_price || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    original_price: Number(e.target.value) || undefined,
                  })
                }
              />
            </div>
          </div>

          {/* Status e Condição */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Status e Condição</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="vendido">Vendido</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Condição" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {conditionLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Bateria (%)"
                value={form.battery_percentage || ""}
                onChange={(e) => setForm({ ...form, battery_percentage: Number(e.target.value) || undefined })}
              />
            </div>
            <Textarea
              placeholder="Estado geral do produto (ex: Sem arranhões, Vidro levemente marcado)"
              value={form.general_condition}
              onChange={(e) => setForm({ ...form, general_condition: e.target.value })}
              className="min-h-16"
            />
          </div>

          {/* Mídia */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Imagens e Vídeo</h3>
            <ImageUpload
              onImagesUrls={(urls) => setForm({ ...form, images: urls })}
              onVideoUrl={(url) => setForm({ ...form, video_url: url })}
              currentImages={form.images}
              currentVideo={form.video_url}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Descrição</h3>
            <Textarea
              placeholder="Descrição detalhada do produto"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="min-h-24"
            />
          </div>

          {/* Especificações */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Especificações</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {["RAM", "CHIP", "TELA", "BATERIA", "CÂMERA", "ARMAZENAMENTO"].map((key) => (
                <Input
                  key={key}
                  placeholder={key}
                  value={form.specs[key] || ""}
                  onChange={(e) => setForm({ ...form, specs: { ...form.specs, [key]: e.target.value } })}
                />
              ))}
            </div>
          </div>

          {/* Flags */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Opções</h3>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                Destaque
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.promotion}
                  onChange={(e) => setForm({ ...form, promotion: e.target.checked })}
                />
                Promoção
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_on_request}
                  onChange={(e) => setForm({ ...form, is_on_request: e.target.checked })}
                />
                Por Pedido (até 3 dias úteis)
              </label>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : editing ? (
                "Salvar Alterações"
              ) : (
                "Adicionar Produto"
              )}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Product list */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-secondary">
              <tr>
                <th className="text-left p-3 font-medium">Produto</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">
                  Marca
                </th>
                <th className="text-left p-3 font-medium">Preço</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">
                  Condição
                </th>
                <th className="text-left p-3 font-medium hidden md:table-cell">
                  Views
                </th>
                <th className="text-right p-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Nenhum produto cadastrado
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b last:border-0 hover:bg-secondary/50"
                  >
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">
                      {p.brand}
                    </td>
                    <td className="p-3">
                      R$ {p.price.toLocaleString("pt-BR")}
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <Badge variant="outline">{conditionLabel(p.condition)}</Badge>
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">
                      {p.views}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(p)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

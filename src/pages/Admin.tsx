import { useState, useEffect } from "react";
import { isAdmin, login, logout } from "@/lib/auth";
import { getProducts, addProduct, updateProduct, deleteProduct, BRANDS, CONDITIONS, STATUSES, conditionLabel, statusLabel, getSettings, saveSettings, slugify, type Product, type SiteSettings } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2, Plus, LogOut, Lock, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const emptyForm = {
  name: "", brand: "Apple", price: 0, originalPrice: undefined as number | undefined,
  description: "", condition: "seminovo" as Product["condition"],
  status: "disponivel" as Product["status"],
  battery: undefined as number | undefined,
  generalState: "",
  slug: "",
  images: [""], specs: {} as Record<string, string>,
  featured: false, promotion: false,
};

const Admin = () => {
  const [authed, setAuthed] = useState(isAdmin());
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(getSettings());
  const { toast } = useToast();

  useEffect(() => { if (authed) { setProducts(getProducts()); setSettings(getSettings()); } }, [authed]);

  const handleLogin = () => {
    if (login(password)) setAuthed(true);
    else toast({ title: "Senha incorreta", variant: "destructive" });
  };

  const resetForm = () => { setForm(emptyForm); setEditing(null); setShowForm(false); };

  const handleSave = () => {
    if (!form.name || !form.price) {
      toast({ title: "Preencha nome e preço", variant: "destructive" });
      return;
    }
    const data = { ...form, slug: form.slug || slugify(form.name), images: form.images.filter(i => i.trim()) };
    if (editing) {
      updateProduct(editing, data);
      toast({ title: "Produto atualizado!" });
    } else {
      addProduct(data);
      toast({ title: "Produto adicionado!" });
    }
    setProducts(getProducts());
    resetForm();
  };

  const handleEdit = (p: Product) => {
    setForm({
      name: p.name, brand: p.brand, price: p.price, originalPrice: p.originalPrice,
      description: p.description, condition: p.condition, status: p.status,
      battery: p.battery, generalState: p.generalState || "", slug: p.slug,
      images: p.images.length ? p.images : [""], specs: p.specs,
      featured: p.featured, promotion: p.promotion,
    });
    setEditing(p.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Excluir este produto?")) return;
    deleteProduct(id);
    setProducts(getProducts());
    toast({ title: "Produto removido" });
  };

  const updateImage = (i: number, v: string) => {
    const imgs = [...form.images]; imgs[i] = v; setForm({ ...form, images: imgs });
  };
  const addImage = () => setForm({ ...form, images: [...form.images, ""] });
  const removeImage = (i: number) => setForm({ ...form, images: form.images.filter((_, j) => j !== i) });

  const saveSiteSettings = () => {
    saveSettings(settings);
    toast({ title: "Configurações salvas!" });
  };

  if (!authed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-full max-w-sm space-y-4 p-6 rounded-xl border bg-card" style={{ boxShadow: "var(--card-shadow)" }}>
          <div className="text-center">
            <Lock className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <h1 className="text-xl font-bold">Painel Admin</h1>
            <p className="text-sm text-muted-foreground">Digite a senha para acessar</p>
          </div>
          <Input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
          <Button onClick={handleLogin} className="w-full">Entrar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Painel Admin</h1>
        <Button variant="outline" size="sm" onClick={() => { logout(); setAuthed(false); }}>
          <LogOut className="mr-1 h-4 w-4" /> Sair
        </Button>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="mb-6">
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="settings">Configurações do site</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="flex justify-end mb-4">
            <Button onClick={() => { resetForm(); setShowForm(true); }} size="sm">
              <Plus className="mr-1 h-4 w-4" /> Novo produto
            </Button>
          </div>

          {showForm && (
            <div className="mb-8 rounded-xl border bg-card p-6 space-y-4">
              <h2 className="font-semibold">{editing ? "Editar produto" : "Novo produto"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Nome do produto" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <Select value={form.brand} onValueChange={v => setForm({ ...form, brand: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" placeholder="Preço" value={form.price || ""} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
                <Input type="number" placeholder="Preço original (opcional)" value={form.originalPrice || ""} onChange={e => setForm({ ...form, originalPrice: Number(e.target.value) || undefined })} />
                <Select value={form.condition} onValueChange={v => setForm({ ...form, condition: v as Product["condition"] })}>
                  <SelectTrigger><SelectValue placeholder="Condição" /></SelectTrigger>
                  <SelectContent>{CONDITIONS.map(c => <SelectItem key={c} value={c}>{conditionLabel(c)}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as Product["status"] })}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" placeholder="Bateria (%)" value={form.battery ?? ""} onChange={e => setForm({ ...form, battery: e.target.value ? Number(e.target.value) : undefined })} />
                <Input placeholder="Estado geral" value={form.generalState} onChange={e => setForm({ ...form, generalState: e.target.value })} />
                <Input placeholder="Slug (auto se vazio)" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Imagens (URLs)</label>
                <div className="space-y-2">
                  {form.images.map((img, i) => (
                    <div key={i} className="flex gap-2">
                      <Input placeholder="URL da imagem" value={img} onChange={e => updateImage(i, e.target.value)} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeImage(i)}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addImage}><Plus className="h-4 w-4 mr-1" /> Adicionar imagem</Button>
                </div>
              </div>

              <Textarea placeholder="Descrição" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} />

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> Destaque
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.promotion} onChange={e => setForm({ ...form, promotion: e.target.checked })} /> Oferta
                </label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave}>{editing ? "Salvar" : "Adicionar"}</Button>
                <Button variant="outline" onClick={resetForm}>Cancelar</Button>
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-secondary">
                  <tr>
                    <th className="text-left p-3 font-medium">Produto</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Marca</th>
                    <th className="text-left p-3 font-medium">Preço</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Views</th>
                    <th className="text-right p-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-secondary/50">
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">{p.brand}</td>
                      <td className="p-3">R$ {p.price.toLocaleString("pt-BR")}</td>
                      <td className="p-3"><Badge variant="outline">{statusLabel(p.status)}</Badge></td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">{p.views}</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(p)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-8 max-w-3xl">
            <section className="rounded-xl border bg-card p-6 space-y-4">
              <h2 className="font-semibold">WhatsApp</h2>
              <div>
                <label className="text-xs text-muted-foreground">Número (com DDI, ex: 5511999999999)</label>
                <Input value={settings.whatsappNumber} onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })} />
              </div>
            </section>

            <section className="rounded-xl border bg-card p-6 space-y-4">
              <h2 className="font-semibold">Hero (banner principal)</h2>
              <Input placeholder="Título" value={settings.heroTitle} onChange={e => setSettings({ ...settings, heroTitle: e.target.value })} />
              <Textarea placeholder="Subtítulo" value={settings.heroSubtitle} onChange={e => setSettings({ ...settings, heroSubtitle: e.target.value })} />
              <Input placeholder="URL da imagem (opcional)" value={settings.heroImage} onChange={e => setSettings({ ...settings, heroImage: e.target.value })} />
              <Input placeholder="Texto do botão WhatsApp" value={settings.heroCtaText} onChange={e => setSettings({ ...settings, heroCtaText: e.target.value })} />
            </section>

            <section className="rounded-xl border bg-card p-6 space-y-4">
              <h2 className="font-semibold">Barra de confiança</h2>
              {settings.trustItems.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <Input className="w-40" placeholder="Ícone (Shield, CheckCircle, Truck, Headphones, Star, Award, Zap)" value={item.icon} onChange={e => {
                    const arr = [...settings.trustItems]; arr[i] = { ...arr[i], icon: e.target.value }; setSettings({ ...settings, trustItems: arr });
                  }} />
                  <Input placeholder="Texto" value={item.text} onChange={e => {
                    const arr = [...settings.trustItems]; arr[i] = { ...arr[i], text: e.target.value }; setSettings({ ...settings, trustItems: arr });
                  }} />
                  <Button variant="ghost" size="icon" onClick={() => setSettings({ ...settings, trustItems: settings.trustItems.filter((_, j) => j !== i) })}><X className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setSettings({ ...settings, trustItems: [...settings.trustItems, { icon: "Shield", text: "" }] })}><Plus className="h-4 w-4 mr-1" /> Adicionar item</Button>
            </section>

            <section className="rounded-xl border bg-card p-6 space-y-4">
              <h2 className="font-semibold">Seção WhatsApp</h2>
              <Input placeholder="Título" value={settings.whatsappSectionTitle} onChange={e => setSettings({ ...settings, whatsappSectionTitle: e.target.value })} />
              <Textarea placeholder="Texto" value={settings.whatsappSectionText} onChange={e => setSettings({ ...settings, whatsappSectionText: e.target.value })} />
              <Input placeholder="Texto do botão" value={settings.whatsappSectionCta} onChange={e => setSettings({ ...settings, whatsappSectionCta: e.target.value })} />
            </section>

            <section className="rounded-xl border bg-card p-6 space-y-4">
              <h2 className="font-semibold">Benefícios</h2>
              {settings.benefits.map((item, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-[140px_1fr_1fr_auto] gap-2">
                  <Input placeholder="Ícone" value={item.icon} onChange={e => {
                    const arr = [...settings.benefits]; arr[i] = { ...arr[i], icon: e.target.value }; setSettings({ ...settings, benefits: arr });
                  }} />
                  <Input placeholder="Título" value={item.title} onChange={e => {
                    const arr = [...settings.benefits]; arr[i] = { ...arr[i], title: e.target.value }; setSettings({ ...settings, benefits: arr });
                  }} />
                  <Input placeholder="Descrição" value={item.desc} onChange={e => {
                    const arr = [...settings.benefits]; arr[i] = { ...arr[i], desc: e.target.value }; setSettings({ ...settings, benefits: arr });
                  }} />
                  <Button variant="ghost" size="icon" onClick={() => setSettings({ ...settings, benefits: settings.benefits.filter((_, j) => j !== i) })}><X className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setSettings({ ...settings, benefits: [...settings.benefits, { icon: "Shield", title: "", desc: "" }] })}><Plus className="h-4 w-4 mr-1" /> Adicionar benefício</Button>
            </section>

            <section className="rounded-xl border bg-card p-6 space-y-4">
              <h2 className="font-semibold">Rodapé</h2>
              <Input placeholder="Nome da loja" value={settings.footerName} onChange={e => setSettings({ ...settings, footerName: e.target.value })} />
              <Textarea placeholder="Descrição" value={settings.footerDesc} onChange={e => setSettings({ ...settings, footerDesc: e.target.value })} />
              <Input placeholder="Telefone" value={settings.footerPhone} onChange={e => setSettings({ ...settings, footerPhone: e.target.value })} />
              <Input placeholder="Email" value={settings.footerEmail} onChange={e => setSettings({ ...settings, footerEmail: e.target.value })} />
              <Input placeholder="Instagram (@usuario)" value={settings.footerInstagram} onChange={e => setSettings({ ...settings, footerInstagram: e.target.value })} />
            </section>

            <Button onClick={saveSiteSettings} size="lg">Salvar configurações</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;

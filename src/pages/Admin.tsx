import { useState, useEffect } from "react";
import { isAdmin, login, logout } from "@/lib/auth";
import { getProducts, addProduct, updateProduct, deleteProduct, BRANDS, CONDITIONS, conditionLabel, type Product } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, LogOut, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const emptyForm = {
  name: "", brand: "Apple", price: 0, originalPrice: undefined as number | undefined,
  description: "", condition: "seminovo" as Product["condition"],
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
  const { toast } = useToast();

  useEffect(() => { if (authed) setProducts(getProducts()); }, [authed]);

  const handleLogin = () => {
    if (login(password)) { setAuthed(true); }
    else { toast({ title: "Senha incorreta", variant: "destructive" }); }
  };

  const resetForm = () => { setForm(emptyForm); setEditing(null); setShowForm(false); };

  const handleSave = () => {
    if (!form.name || !form.price) {
      toast({ title: "Preencha nome e preço", variant: "destructive" });
      return;
    }
    if (editing) {
      updateProduct(editing, form);
      toast({ title: "Produto atualizado!" });
    } else {
      addProduct(form);
      toast({ title: "Produto adicionado!" });
    }
    setProducts(getProducts());
    resetForm();
  };

  const handleEdit = (p: Product) => {
    setForm({
      name: p.name, brand: p.brand, price: p.price, originalPrice: p.originalPrice,
      description: p.description, condition: p.condition,
      images: p.images.length ? p.images : [""], specs: p.specs,
      featured: p.featured, promotion: p.promotion,
    });
    setEditing(p.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setProducts(getProducts());
    toast({ title: "Produto removido" });
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
        <div className="flex gap-2">
          <Button onClick={() => { setShowForm(true); resetForm(); setShowForm(true); }} size="sm">
            <Plus className="mr-1 h-4 w-4" /> Novo produto
          </Button>
          <Button variant="outline" size="sm" onClick={() => { logout(); setAuthed(false); }}>
            <LogOut className="mr-1 h-4 w-4" /> Sair
          </Button>
        </div>
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
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CONDITIONS.map(c => <SelectItem key={c} value={c}>{conditionLabel(c)}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="URL da imagem" value={form.images[0]} onChange={e => setForm({ ...form, images: [e.target.value] })} />
          </div>
          <Textarea placeholder="Descrição" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> Destaque
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.promotion} onChange={e => setForm({ ...form, promotion: e.target.checked })} /> Promoção
            </label>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave}>{editing ? "Salvar" : "Adicionar"}</Button>
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
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
                <th className="text-left p-3 font-medium hidden md:table-cell">Marca</th>
                <th className="text-left p-3 font-medium">Preço</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Condição</th>
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
                  <td className="p-3 hidden md:table-cell"><Badge variant="outline">{conditionLabel(p.condition)}</Badge></td>
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
    </div>
  );
};

export default Admin;

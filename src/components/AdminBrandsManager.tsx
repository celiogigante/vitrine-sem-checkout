import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  order_index: number;
  is_visible: boolean;
}

export default function AdminBrandsManager() {
  const { toast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    logo_url: "",
    order_index: 0,
    is_visible: true,
  });

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("order_index");

      if (error) throw error;
      setBrands((data || []) as Brand[]);
    } catch (err) {
      console.error("Erro ao carregar marcas:", err);
      toast({
        title: "Erro ao carregar marcas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({
        title: "Nome da marca é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-");
      const brandData = {
        name: form.name.trim(),
        slug,
        logo_url: form.logo_url || null,
        order_index: form.order_index,
        is_visible: form.is_visible,
      };

      if (editing) {
        const { error } = await supabase
          .from("brands")
          .update(brandData)
          .eq("id", editing);

        if (error) throw error;
        toast({ title: "Marca atualizada!" });
      } else {
        const { error } = await supabase.from("brands").insert([brandData]);

        if (error) throw error;
        toast({ title: "Marca adicionada!" });
      }

      loadBrands();
      resetForm();
    } catch (err) {
      console.error("Erro ao salvar marca:", err);
      toast({
        title: "Erro ao salvar marca",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (brand: Brand) => {
    setForm({
      name: brand.name,
      slug: brand.slug || "",
      logo_url: brand.logo_url || "",
      order_index: brand.order_index,
      is_visible: brand.is_visible,
    });
    setEditing(brand.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta marca?")) return;

    try {
      const { error } = await supabase.from("brands").delete().eq("id", id);

      if (error) throw error;

      setBrands(brands.filter((b) => b.id !== id));
      toast({ title: "Marca removida" });
    } catch (err) {
      console.error("Erro ao deletar marca:", err);
      toast({
        title: "Erro ao deletar marca",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
      logo_url: "",
      order_index: 0,
      is_visible: true,
    });
    setEditing(null);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showForm && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-lg">
            {editing ? "Editar marca" : "Nova marca"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Nome da marca"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Slug (gerado automaticamente)"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
            <Input
              placeholder="URL do logo (opcional)"
              value={form.logo_url}
              onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Ordem de exibição"
              value={form.order_index}
              onChange={(e) =>
                setForm({ ...form, order_index: Number(e.target.value) })
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_visible}
              onChange={(e) => setForm({ ...form, is_visible: e.target.checked })}
            />
            Marca visível
          </label>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : editing ? (
                "Salvar"
              ) : (
                "Adicionar"
              )}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {!showForm && (
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="mr-1 h-4 w-4" /> Nova marca
        </Button>
      )}

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-secondary">
              <tr>
                <th className="text-left p-3 font-medium">Nome</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">
                  Slug
                </th>
                <th className="text-left p-3 font-medium hidden md:table-cell">
                  Ordem
                </th>
                <th className="text-left p-3 font-medium hidden md:table-cell">
                  Status
                </th>
                <th className="text-right p-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {brands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    Nenhuma marca cadastrada
                  </td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <tr
                    key={brand.id}
                    className="border-b last:border-0 hover:bg-secondary/50"
                  >
                    <td className="p-3 font-medium">{brand.name}</td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">
                      {brand.slug}
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">
                      {brand.order_index}
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <Badge variant={brand.is_visible ? "default" : "secondary"}>
                        {brand.is_visible ? "Ativa" : "Inativa"}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(brand)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(brand.id)}
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
    </div>
  );
}

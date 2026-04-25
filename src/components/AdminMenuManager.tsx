import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Eye, EyeOff, GripVertical, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  order_index: number;
  is_visible: boolean;
  parent_id: string | null;
}

export default function AdminMenuManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ label: "", href: "" });

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("order_index");

      if (error) throw error;
      setItems((data || []) as MenuItem[]);
    } catch (err) {
      console.error("Error loading menu items:", err);
      toast({
        title: "Erro ao carregar menu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateHref = (label: string): string => {
    // Se já tiver uma URL válida, retorna como está
    if (label.startsWith("/")) {
      return label;
    }
    // Gera automaticamente um link para filtro de marca
    return `/produtos?brand=${encodeURIComponent(label)}`;
  };

  const handleAddItem = async () => {
    if (!newItem.label) {
      toast({
        title: "Preencha o nome/label do item",
        variant: "destructive",
      });
      return;
    }

    // Gera href automaticamente se não foi preenchido
    const href = newItem.href || generateHref(newItem.label);

    try {
      const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.order_index)) : 0;

      const { error } = await supabase.from("menu_items").insert([
        {
          label: newItem.label,
          href: href,
          order_index: maxOrder + 1,
          is_visible: true,
        },
      ]);

      if (error) throw error;
      
      setNewItem({ label: "", href: "" });
      loadMenuItems();
      toast({ title: "Item adicionado!" });
    } catch (err) {
      console.error("Error adding menu item:", err);
      toast({
        title: "Erro ao adicionar item",
        variant: "destructive",
      });
    }
  };

  const handleToggleVisibility = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from("menu_items")
        .update({ is_visible: !current })
        .eq("id", id);

      if (error) throw error;
      
      setItems(
        items.map((item) =>
          item.id === id ? { ...item, is_visible: !current } : item
        )
      );
    } catch (err) {
      console.error("Error toggling visibility:", err);
      toast({
        title: "Erro ao atualizar visibilidade",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este item?")) return;

    try {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);

      if (error) throw error;
      
      setItems(items.filter((item) => item.id !== id));
      toast({ title: "Item removido" });
    } catch (err) {
      console.error("Error deleting menu item:", err);
      toast({
        title: "Erro ao deletar item",
        variant: "destructive",
      });
    }
  };

  const handleReorder = async (items: MenuItem[]) => {
    try {
      for (let i = 0; i < items.length; i++) {
        await supabase
          .from("menu_items")
          .update({ order_index: i + 1 })
          .eq("id", items[i].id);
      }
      setItems(items);
      toast({ title: "Ordem atualizada!" });
    } catch (err) {
      console.error("Error reordering:", err);
      toast({
        title: "Erro ao reordenar",
        variant: "destructive",
      });
    }
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newItems = [...items];
    if (direction === "up" && index > 0) {
      [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    } else if (direction === "down" && index < newItems.length - 1) {
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    }
    handleReorder(newItems);
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add new item */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Novo Item do Menu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Nome da marca (ex: Apple)"
            value={newItem.label}
            onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
          />
          <div className="space-y-1">
            <Input
              placeholder="URL (opcional - será gerada automaticamente)"
              value={newItem.href}
              onChange={(e) => setNewItem({ ...newItem, href: e.target.value })}
            />
            {newItem.label && !newItem.href && (
              <p className="text-xs text-muted-foreground">
                Link gerado: <code className="bg-secondary px-2 py-1 rounded">{generateHref(newItem.label)}</code>
              </p>
            )}
          </div>
        </div>
        <Button onClick={handleAddItem}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {/* Menu items list */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-secondary">
              <tr>
                <th className="text-left p-3 font-medium w-8"></th>
                <th className="text-left p-3 font-medium">Label</th>
                <th className="text-left p-3 font-medium">URL</th>
                <th className="text-center p-3 font-medium">Visível</th>
                <th className="text-right p-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    Nenhum item no menu
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-0 hover:bg-secondary/50"
                  >
                    <td className="p-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </td>
                    <td className="p-3 font-medium">{item.label}</td>
                    <td className="p-3 text-muted-foreground text-xs font-mono">
                      {item.href}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleVisibility(item.id, item.is_visible)}
                        className="inline-flex items-center justify-center hover:bg-secondary rounded p-1"
                      >
                        {item.is_visible ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveItem(index, "up")}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveItem(index, "down")}
                          disabled={index === items.length - 1}
                        >
                          ↓
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteItem(item.id)}
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

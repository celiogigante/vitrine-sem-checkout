import { useState, useEffect } from "react";
import { supabase, Product } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductHighlight {
  id: string;
  product_id: string;
  order_index: number;
}

export default function AdminProductHighlights() {
  const { toast } = useToast();
  const [highlights, setHighlights] = useState<ProductHighlight[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [highlightedProductIds, setHighlightedProductIds] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load highlights
      const { data: highlightsData, error: highlightsError } = await supabase
        .from("product_highlights")
        .select("*")
        .order("order_index");

      if (highlightsError) throw highlightsError;

      const highlightsList = (highlightsData || []) as ProductHighlight[];
      setHighlights(highlightsList);
      setHighlightedProductIds(
        new Set(highlightsList.map((h) => h.product_id))
      );

      // Load all products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;

      setProducts((productsData || []) as Product[]);
    } catch (err) {
      console.error("Error loading data:", err);
      toast({
        title: "Erro ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHighlight = async () => {
    if (!selectedProductId) {
      toast({
        title: "Selecione um produto",
        variant: "destructive",
      });
      return;
    }

    if (highlightedProductIds.has(selectedProductId)) {
      toast({
        title: "Este produto já é um destaque",
        variant: "destructive",
      });
      return;
    }

    try {
      const maxOrder = highlights.length > 0 ? Math.max(...highlights.map((h) => h.order_index)) : 0;

      const { error } = await supabase.from("product_highlights").insert([
        {
          product_id: selectedProductId,
          order_index: maxOrder + 1,
        },
      ]);

      if (error) throw error;

      setSelectedProductId("");
      loadData();
      toast({ title: "Produto adicionado aos destaques!" });
    } catch (err) {
      console.error("Error adding highlight:", err);
      toast({
        title: "Erro ao adicionar destaque",
        variant: "destructive",
      });
    }
  };

  const handleRemoveHighlight = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este destaque?")) return;

    try {
      const { error } = await supabase
        .from("product_highlights")
        .delete()
        .eq("id", id);

      if (error) throw error;

      loadData();
      toast({ title: "Destaque removido" });
    } catch (err) {
      console.error("Error removing highlight:", err);
      toast({
        title: "Erro ao remover destaque",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : "Produto não encontrado";
  };

  const availableProducts = products.filter(
    (p) => !highlightedProductIds.has(p.id)
  );

  return (
    <div className="space-y-6">
      {/* Add highlight */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Adicionar Destaque</h2>
        <p className="text-sm text-muted-foreground">
          Selecione um produto para adicionar ao carrossel de destaques do hero.
        </p>
        <div className="flex gap-2">
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Selecione um produto..." />
            </SelectTrigger>
            <SelectContent>
              {availableProducts.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">
                  Todos os produtos já são destaques
                </div>
              ) : (
                availableProducts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} - R$ {p.price.toLocaleString("pt-BR")}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button onClick={handleAddHighlight}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Highlights list */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-secondary">
              <tr>
                <th className="text-left p-3 font-medium">Produto</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">
                  Preço
                </th>
                <th className="text-left p-3 font-medium hidden md:table-cell">
                  Marca
                </th>
                <th className="text-right p-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {highlights.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    Nenhum produto em destaque
                  </td>
                </tr>
              ) : (
                highlights.map((highlight) => {
                  const product = products.find(
                    (p) => p.id === highlight.product_id
                  );
                  return (
                    <tr
                      key={highlight.id}
                      className="border-b last:border-0 hover:bg-secondary/50"
                    >
                      <td className="p-3 font-medium">
                        {product?.name || "Produto não encontrado"}
                      </td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">
                        R$ {product?.price.toLocaleString("pt-BR") || "—"}
                      </td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">
                        {product?.brand || "—"}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveHighlight(highlight.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

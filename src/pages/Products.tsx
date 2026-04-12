import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/ProductCard";
import { getProducts, BRANDS, CONDITIONS, conditionLabel } from "@/lib/products";

const Products = () => {
  const products = getProducts();
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("all");
  const [condition, setCondition] = useState("all");
  const [sort, setSort] = useState("recent");

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
      const matchBrand = brand === "all" || p.brand === brand;
      const matchCondition = condition === "all" || p.condition === condition;
      return matchSearch && matchBrand && matchCondition;
    });

    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "views") list.sort((a, b) => b.views - a.views);

    return list;
  }, [products, search, brand, condition, sort]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Nossos celulares</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar celular..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={brand} onValueChange={setBrand}>
          <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Marca" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as marcas</SelectItem>
            {BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={condition} onValueChange={setCondition}>
          <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Condição" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas condições</SelectItem>
            {CONDITIONS.map(c => <SelectItem key={c} value={c}>{conditionLabel(c)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full md:w-44"><SlidersHorizontal className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Mais recentes</SelectItem>
            <SelectItem value="price-asc">Menor preço</SelectItem>
            <SelectItem value="price-desc">Maior preço</SelectItem>
            <SelectItem value="views">Mais vistos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">Nenhum produto encontrado.</p>
          <p className="text-sm">Tente ajustar os filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default Products;

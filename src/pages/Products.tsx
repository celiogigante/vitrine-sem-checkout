import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/ProductCard";
import { conditionLabel } from "@/lib/productHelpers";
import { getProducts, type Product } from "@/lib/products";

const CONDITIONS = ["novo", "seminovo", "excelente", "bom", "regular"] as const;

const Products = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "all");
  const [condition, setCondition] = useState("all");
  const [sort, setSort] = useState("recent");
  const [mobileColumns, setMobileColumns] = useState<1 | 2>(1);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    try {
      const productList = getProducts() as Product[];
      setProducts(productList);

      // Extract brands from products
      const uniqueBrands = Array.from(new Set(productList.map(p => p.brand)))
        .filter(Boolean)
        .sort();
      setBrands(uniqueBrands);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    } finally {
      setIsLoading(false);
    }
  };

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

    // Vendidos sempre por último
    list.sort((a, b) => (a.status === "vendido" ? 1 : 0) - (b.status === "vendido" ? 1 : 0));

    return list;
  }, [products, search, brand, condition, sort]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Nossos celulares</h1>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar celular..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Marca" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as marcas</SelectItem>
              {brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
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

        {/* Mobile columns toggle - Only visible on mobile */}
        <div className="md:hidden flex gap-2">
          <button
            onClick={() => setMobileColumns(2)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1 ${
              mobileColumns === 2
                ? "bg-white text-black"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            2 colunas
          </button>
          <button
            onClick={() => setMobileColumns(1)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1 ${
              mobileColumns === 1
                ? "bg-white text-black"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            1 coluna
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">Nenhum produto encontrado.</p>
          <p className="text-sm">Tente ajustar os filtros.</p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {filtered.length} produto{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className={`grid ${mobileColumns === 1 ? "grid-cols-1" : "grid-cols-2"} md:grid-cols-3 lg:grid-cols-4 gap-4`}>
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;

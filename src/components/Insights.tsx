import { useEffect, useState } from "react";
import { supabase, Product, Order, Customer } from "@/lib/supabase";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Loader2, TrendingUp, ShoppingCart, Users, Eye, Package, DollarSign } from "lucide-react";

interface InsightsData {
  totalProducts: number;
  totalViews: number;
  featuredProducts: number;
  promotionProducts: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  topProducts: Product[];
  conditionDistribution: Array<{ name: string; value: number }>;
  brandDistribution: Array<{ name: string; value: number }>;
  orderStatus: Array<{ status: string; count: number }>;
  averageProductPrice: number;
}

export function Insights() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setIsLoading(true);

      // Load products
      const { data: products } = await supabase
        .from("products")
        .select("*");

      // Load customers
      const { data: customers } = await supabase
        .from("customers")
        .select("*");

      // Load orders
      const { data: orders } = await supabase
        .from("orders")
        .select("*");

      const productList = (products || []) as Product[];
      const customerList = (customers || []) as Customer[];
      const orderList = (orders || []) as Order[];

      // Calculate metrics
      const totalProducts = productList.length;
      const totalViews = productList.reduce((sum, p) => sum + (p.views || 0), 0);
      const featuredProducts = productList.filter((p) => p.featured).length;
      const promotionProducts = productList.filter((p) => p.promotion).length;
      const totalCustomers = customerList.length;
      const totalOrders = orderList.length;
      const totalRevenue = orderList.reduce((sum, o) => sum + o.total_price, 0);
      const averageProductPrice =
        totalProducts > 0
          ? productList.reduce((sum, p) => sum + p.price, 0) / totalProducts
          : 0;

      // Top products by views
      const topProducts = productList
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);

      // Condition distribution
      const conditionMap: Record<string, number> = {};
      productList.forEach((p) => {
        conditionMap[p.condition] = (conditionMap[p.condition] || 0) + 1;
      });
      const conditionDistribution = Object.entries(conditionMap).map(
        ([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        })
      );

      // Brand distribution
      const brandMap: Record<string, number> = {};
      productList.forEach((p) => {
        brandMap[p.brand] = (brandMap[p.brand] || 0) + 1;
      });
      const brandDistribution = Object.entries(brandMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

      // Order status distribution
      const statusMap: Record<string, number> = {};
      orderList.forEach((o) => {
        statusMap[o.status] = (statusMap[o.status] || 0) + 1;
      });
      const orderStatus = Object.entries(statusMap).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
      }));

      setData({
        totalProducts,
        totalViews,
        featuredProducts,
        promotionProducts,
        totalCustomers,
        totalOrders,
        totalRevenue,
        topProducts,
        conditionDistribution,
        brandDistribution,
        orderStatus,
        averageProductPrice,
      });
    } catch (err) {
      console.error("Error loading insights:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#6366f1",
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Produtos</p>
              <p className="text-2xl font-bold mt-1">{data.totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Visualizações</p>
              <p className="text-2xl font-bold mt-1">{data.totalViews.toLocaleString("pt-BR")}</p>
            </div>
            <Eye className="h-8 w-8 text-purple-500 opacity-20" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Clientes</p>
              <p className="text-2xl font-bold mt-1">{data.totalCustomers}</p>
            </div>
            <Users className="h-8 w-8 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Pedidos</p>
              <p className="text-2xl font-bold mt-1">{data.totalOrders}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-orange-500 opacity-20" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Faturamento Total</p>
              <p className="text-2xl font-bold mt-1">
                R$ {data.totalRevenue.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Preço Médio</p>
              <p className="text-2xl font-bold mt-1">
                R$ {data.averageProductPrice.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-red-500 opacity-20" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Em Destaque</p>
              <p className="text-2xl font-bold mt-1">{data.featuredProducts}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-indigo-500 opacity-20" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Em Promoção</p>
              <p className="text-2xl font-bold mt-1">{data.promotionProducts}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-pink-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold mb-4">Top 5 Produtos Mais Vistos</h3>
          <div className="space-y-3">
            {data.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-medium">#{index + 1}</span>
                  <span className="truncate">{product.name}</span>
                </div>
                <span className="font-bold">{product.views || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Condition Distribution */}
        {data.conditionDistribution.length > 0 && (
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-4">Distribuição por Condição</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.conditionDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.conditionDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Brand Distribution */}
        {data.brandDistribution.length > 0 && (
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-4">Top Marcas</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.brandDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Order Status */}
        {data.orderStatus.length > 0 && (
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-4">Status dos Pedidos</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.orderStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

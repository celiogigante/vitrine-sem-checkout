export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  description: string;
  condition: "novo" | "seminovo" | "excelente" | "bom" | "regular";
  images: string[];
  specs: Record<string, string>;
  featured: boolean;
  promotion: boolean;
  views: number;
  createdAt: string;
}

const STORAGE_KEY = "cellstore_products";

const defaultProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 14 Pro Max 256GB",
    brand: "Apple",
    price: 4499,
    originalPrice: 5299,
    description: "iPhone 14 Pro Max em excelente estado de conservação. Bateria com 92% de saúde. Acompanha carregador e caixa original.",
    condition: "excelente",
    images: ["https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600&h=600&fit=crop"],
    specs: { "Tela": "6.7\" Super Retina XDR", "Chip": "A16 Bionic", "Câmera": "48MP + 12MP + 12MP", "Bateria": "4323 mAh", "Armazenamento": "256GB", "RAM": "6GB" },
    featured: true, promotion: true, views: 245, createdAt: "2024-01-15"
  },
  {
    id: "2",
    name: "Samsung Galaxy S23 Ultra 256GB",
    brand: "Samsung",
    price: 3999,
    originalPrice: 4799,
    description: "Galaxy S23 Ultra seminovo com S Pen inclusa. Tela impecável, sem riscos. Todos os acessórios originais.",
    condition: "seminovo",
    images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop"],
    specs: { "Tela": "6.8\" Dynamic AMOLED 2X", "Chip": "Snapdragon 8 Gen 2", "Câmera": "200MP + 12MP + 10MP + 10MP", "Bateria": "5000 mAh", "Armazenamento": "256GB", "RAM": "12GB" },
    featured: true, promotion: false, views: 189, createdAt: "2024-01-20"
  },
  {
    id: "3",
    name: "iPhone 13 128GB",
    brand: "Apple",
    price: 2899,
    description: "iPhone 13 em bom estado. Pequenos sinais de uso na carcaça, tela perfeita. Bateria 87%.",
    condition: "bom",
    images: ["https://images.unsplash.com/photo-1632633173522-47456de71b68?w=600&h=600&fit=crop"],
    specs: { "Tela": "6.1\" Super Retina XDR", "Chip": "A15 Bionic", "Câmera": "12MP + 12MP", "Bateria": "3227 mAh", "Armazenamento": "128GB", "RAM": "4GB" },
    featured: true, promotion: false, views: 312, createdAt: "2024-02-01"
  },
  {
    id: "4",
    name: "Motorola Edge 40 Pro 256GB",
    brand: "Motorola",
    price: 2199,
    originalPrice: 2799,
    description: "Motorola Edge 40 Pro praticamente novo, com apenas 2 meses de uso. Na caixa com todos os acessórios.",
    condition: "excelente",
    images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&fit=crop"],
    specs: { "Tela": "6.67\" pOLED 165Hz", "Chip": "Snapdragon 8 Gen 2", "Câmera": "50MP + 50MP + 12MP", "Bateria": "4600 mAh", "Armazenamento": "256GB", "RAM": "12GB" },
    featured: false, promotion: true, views: 98, createdAt: "2024-02-10"
  },
  {
    id: "5",
    name: "Xiaomi Redmi Note 12 Pro 128GB",
    brand: "Xiaomi",
    price: 1299,
    description: "Redmi Note 12 Pro seminovo em ótimo estado. Excelente custo-benefício.",
    condition: "seminovo",
    images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop"],
    specs: { "Tela": "6.67\" AMOLED 120Hz", "Chip": "MediaTek Dimensity 1080", "Câmera": "50MP + 8MP + 2MP", "Bateria": "5000 mAh", "Armazenamento": "128GB", "RAM": "8GB" },
    featured: true, promotion: false, views: 156, createdAt: "2024-02-15"
  },
  {
    id: "6",
    name: "Samsung Galaxy A54 128GB",
    brand: "Samsung",
    price: 1599,
    description: "Galaxy A54 novo, lacrado na caixa. Garantia de 1 ano do fabricante.",
    condition: "novo",
    images: ["https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=600&fit=crop"],
    specs: { "Tela": "6.4\" Super AMOLED 120Hz", "Chip": "Exynos 1380", "Câmera": "50MP + 12MP + 5MP", "Bateria": "5000 mAh", "Armazenamento": "128GB", "RAM": "8GB" },
    featured: false, promotion: false, views: 210, createdAt: "2024-03-01"
  },
];

export function getProducts(): Product[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
    return defaultProducts;
  }
  return JSON.parse(stored);
}

export function getProduct(id: string): Product | undefined {
  return getProducts().find(p => p.id === id);
}

export function saveProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function addProduct(product: Omit<Product, "id" | "views" | "createdAt">): Product {
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    id: Date.now().toString(),
    views: 0,
    createdAt: new Date().toISOString().split("T")[0],
  };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

export function updateProduct(id: string, data: Partial<Product>): Product | undefined {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return undefined;
  products[idx] = { ...products[idx], ...data };
  saveProducts(products);
  return products[idx];
}

export function deleteProduct(id: string) {
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
}

export function incrementViews(id: string) {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx !== -1) {
    products[idx].views++;
    saveProducts(products);
  }
}

export const WHATSAPP_NUMBER = "5511999999999";

export function getWhatsAppLink(product: Product): string {
  const message = encodeURIComponent(
    `Olá! Tenho interesse no *${product.name}* anunciado por *R$ ${product.price.toLocaleString("pt-BR")}*. Podemos negociar?`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

export const BRANDS = ["Apple", "Samsung", "Motorola", "Xiaomi"];
export const CONDITIONS: Product["condition"][] = ["novo", "seminovo", "excelente", "bom", "regular"];

export function conditionLabel(c: Product["condition"]): string {
  const map: Record<string, string> = { novo: "Novo", seminovo: "Seminovo", excelente: "Excelente", bom: "Bom", regular: "Regular" };
  return map[c] || c;
}

export function conditionColor(c: Product["condition"]): string {
  const map: Record<string, string> = { novo: "bg-accent text-accent-foreground", seminovo: "bg-blue-500 text-white", excelente: "bg-emerald-500 text-white", bom: "bg-yellow-500 text-white", regular: "bg-orange-500 text-white" };
  return map[c] || "";
}

export type ProductStatus = "disponivel" | "vendido" | "reservado";

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  description: string;
  condition: "novo" | "seminovo" | "excelente" | "bom" | "regular";
  status: ProductStatus;
  battery?: number;
  generalState?: string;
  slug: string;
  images: string[];
  primaryImageIndex?: number;
  videoUrl?: string;
  specs: Record<string, string>;
  featured: boolean;
  promotion: boolean;
  views: number;
  createdAt: string;
}

const STORAGE_KEY = "cellstore_products";

export function slugify(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const defaultProducts: Product[] = [
  {
    id: "1", name: "iPhone 14 Pro Max 256GB", brand: "Apple", price: 4499, originalPrice: 5299,
    description: "iPhone 14 Pro Max em excelente estado de conservação. Bateria com 92% de saúde. Acompanha carregador e caixa original.",
    condition: "excelente", status: "disponivel", battery: 92, generalState: "Excelente, sem marcas de uso",
    slug: "iphone-14-pro-max-256gb",
    images: ["https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600&h=600&fit=crop"],
    specs: { "Tela": "6.7\" Super Retina XDR", "Chip": "A16 Bionic", "Câmera": "48MP + 12MP + 12MP", "Bateria": "4323 mAh", "Armazenamento": "256GB", "RAM": "6GB" },
    featured: true, promotion: true, views: 245, createdAt: "2024-01-15"
  },
  {
    id: "2", name: "Samsung Galaxy S23 Ultra 256GB", brand: "Samsung", price: 3999, originalPrice: 4799,
    description: "Galaxy S23 Ultra seminovo com S Pen inclusa. Tela impecável, sem riscos. Todos os acessórios originais.",
    condition: "seminovo", status: "disponivel", battery: 95, generalState: "Ótimo, leves marcas de uso",
    slug: "samsung-galaxy-s23-ultra-256gb",
    images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop"],
    specs: { "Tela": "6.8\" Dynamic AMOLED 2X", "Chip": "Snapdragon 8 Gen 2", "Câmera": "200MP + 12MP + 10MP + 10MP", "Bateria": "5000 mAh", "Armazenamento": "256GB", "RAM": "12GB" },
    featured: true, promotion: false, views: 189, createdAt: "2024-01-20"
  },
  {
    id: "3", name: "iPhone 13 128GB", brand: "Apple", price: 2899,
    description: "iPhone 13 em bom estado. Pequenos sinais de uso na carcaça, tela perfeita. Bateria 87%.",
    condition: "bom", status: "reservado", battery: 87, generalState: "Bom, com sinais de uso",
    slug: "iphone-13-128gb",
    images: ["https://images.unsplash.com/photo-1632633173522-47456de71b68?w=600&h=600&fit=crop"],
    specs: { "Tela": "6.1\" Super Retina XDR", "Chip": "A15 Bionic", "Câmera": "12MP + 12MP", "Bateria": "3227 mAh", "Armazenamento": "128GB", "RAM": "4GB" },
    featured: true, promotion: false, views: 312, createdAt: "2024-02-01"
  },
  {
    id: "4", name: "Motorola Edge 40 Pro 256GB", brand: "Motorola", price: 2199, originalPrice: 2799,
    description: "Motorola Edge 40 Pro praticamente novo, com apenas 2 meses de uso. Na caixa com todos os acessórios.",
    condition: "excelente", status: "disponivel", battery: 98, generalState: "Como novo",
    slug: "motorola-edge-40-pro-256gb",
    images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&fit=crop"],
    specs: { "Tela": "6.67\" pOLED 165Hz", "Chip": "Snapdragon 8 Gen 2", "Câmera": "50MP + 50MP + 12MP", "Bateria": "4600 mAh", "Armazenamento": "256GB", "RAM": "12GB" },
    featured: false, promotion: true, views: 98, createdAt: "2024-02-10"
  },
  {
    id: "5", name: "Xiaomi Redmi Note 12 Pro 128GB", brand: "Xiaomi", price: 1299,
    description: "Redmi Note 12 Pro seminovo em ótimo estado. Excelente custo-benefício.",
    condition: "seminovo", status: "vendido", battery: 90, generalState: "Ótimo",
    slug: "xiaomi-redmi-note-12-pro-128gb",
    images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop"],
    specs: { "Tela": "6.67\" AMOLED 120Hz", "Chip": "MediaTek Dimensity 1080", "Câmera": "50MP + 8MP + 2MP", "Bateria": "5000 mAh", "Armazenamento": "128GB", "RAM": "8GB" },
    featured: true, promotion: false, views: 156, createdAt: "2024-02-15"
  },
  {
    id: "6", name: "Samsung Galaxy A54 128GB", brand: "Samsung", price: 1599,
    description: "Galaxy A54 novo, lacrado na caixa. Garantia de 1 ano do fabricante.",
    condition: "novo", status: "disponivel", battery: 100, generalState: "Lacrado",
    slug: "samsung-galaxy-a54-128gb",
    images: ["https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=600&fit=crop"],
    specs: { "Tela": "6.4\" Super AMOLED 120Hz", "Chip": "Exynos 1380", "Câmera": "50MP + 12MP + 5MP", "Bateria": "5000 mAh", "Armazenamento": "128GB", "RAM": "8GB" },
    featured: false, promotion: false, views: 210, createdAt: "2024-03-01"
  },
];

function migrate(p: any): Product {
  return {
    status: "disponivel",
    slug: p.slug || slugify(p.name || p.id),
    ...p,
  };
}

export function getProducts(): Product[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
    return defaultProducts;
  }
  return (JSON.parse(stored) as any[]).map(migrate);
}

export function getProduct(id: string): Product | undefined {
  return getProducts().find(p => p.id === id || p.slug === id);
}

export function saveProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function addProduct(product: Omit<Product, "id" | "views" | "createdAt" | "slug"> & { slug?: string }): Product {
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    slug: product.slug || slugify(product.name),
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
  const idx = products.findIndex(p => p.id === id || p.slug === id);
  if (idx !== -1) {
    products[idx].views++;
    saveProducts(products);
  }
}

// ===== Site Settings =====
export interface BenefitItem { icon: string; title: string; desc: string; }
export interface TrustItem { icon: string; text: string; }
export interface SiteSettings {
  whatsappNumber: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroCtaText: string;
  trustItems: TrustItem[];
  whatsappSectionTitle: string;
  whatsappSectionText: string;
  whatsappSectionCta: string;
  benefits: BenefitItem[];
  footerName: string;
  footerDesc: string;
  footerEmail: string;
  footerPhone: string;
  footerInstagram: string;
}

const SETTINGS_KEY = "cellstore_settings";

const defaultSettings: SiteSettings = {
  whatsappNumber: "5566992473929",
  heroTitle: "Celulares seminovos com garantia e qualidade",
  heroSubtitle: "Aparelhos testados, revisados e prontos para uso. Economize até 50% comprando seminovos com segurança.",
  heroImage: "",
  heroCtaText: "Fale conosco",
  trustItems: [
    { icon: "Shield", text: "Garantia de 90 dias" },
    { icon: "CheckCircle", text: "100% Testados" },
    { icon: "Truck", text: "Entrega rápida" },
    { icon: "Headphones", text: "Suporte dedicado" },
  ],
  whatsappSectionTitle: "Encontrou o que procura?",
  whatsappSectionText: "Fale agora com nossa equipe pelo WhatsApp e tire todas as suas dúvidas.",
  whatsappSectionCta: "Falar no WhatsApp",
  benefits: [
    { icon: "Shield", title: "Garantia de 90 dias", desc: "Todos os aparelhos possuem garantia contra defeitos." },
    { icon: "CheckCircle", title: "100% Testados", desc: "Cada celular passa por mais de 30 testes de qualidade." },
    { icon: "Headphones", title: "Suporte dedicado", desc: "Atendimento rápido e personalizado via WhatsApp." },
  ],
  footerName: "Master Cell",
  footerDesc: "Celulares seminovos testados e com garantia. Qualidade e confiança para você.",
  footerEmail: "contato@mastercell.com.br",
  footerPhone: "(66) 99247-3929",
  footerInstagram: "@mastercellbg",
};

export function getSettings(): SiteSettings {
  const stored = localStorage.getItem(SETTINGS_KEY);
  const settings = stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;

  // Ensure critical contact info is always up to date
  const updatedSettings = {
    ...settings,
    whatsappNumber: defaultSettings.whatsappNumber,
    footerPhone: defaultSettings.footerPhone,
    footerInstagram: defaultSettings.footerInstagram,
  };

  return updatedSettings;
}

export function saveSettings(s: SiteSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("settings-updated"));
}

export function getWhatsAppLink(product?: Product): string {
  const s = getSettings();
  const message = product
    ? `Olá, tenho interesse no *${product.name}*, ainda está disponível?`
    : "Olá! Gostaria de mais informações.";
  return `https://wa.me/${s.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const BRANDS = ["Apple", "Samsung", "Motorola", "Xiaomi"];
export const CONDITIONS: Product["condition"][] = ["novo", "seminovo", "excelente", "bom", "regular"];
export const STATUSES: ProductStatus[] = ["disponivel", "vendido", "reservado"];

export function conditionLabel(c: Product["condition"]): string {
  const map: Record<string, string> = { novo: "Novo", seminovo: "Seminovo", excelente: "Excelente", bom: "Bom", regular: "Regular" };
  return map[c] || c;
}

export function conditionColor(c: Product["condition"]): string {
  const map: Record<string, string> = { novo: "bg-accent text-accent-foreground", seminovo: "bg-blue-500 text-white", excelente: "bg-emerald-500 text-white", bom: "bg-yellow-500 text-white", regular: "bg-orange-500 text-white" };
  return map[c] || "";
}

export function statusLabel(s: ProductStatus): string {
  return { disponivel: "Disponível", vendido: "Vendido", reservado: "Reservado" }[s];
}

export function statusColor(s: ProductStatus): string {
  return {
    disponivel: "bg-emerald-500 text-white",
    vendido: "bg-muted text-muted-foreground",
    reservado: "bg-amber-500 text-white",
  }[s];
}

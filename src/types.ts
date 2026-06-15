export interface Category {
  id: string;
  name: string;
  subcategories: string[];
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  subcategory: string;
  brand: string;
  sku: string;
  barcode: string;
  description: string;
  sizes: string[];
  colors: string[];
  price: number;
  promoPrice?: number;
  weight: number; // in grams
  images: string[];
  stock: number;
  createdAt: any;
  updatedAt: any;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerCpf?: string;
  cep: string;
  address: string;
  number: string;
  complement?: string;
  bairro: string;
  cidade: string;
  estado: string;
  items: {
    productId: string;
    name: string;
    sku: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
  }[];
  shippingType: 'PAC' | 'SEDEX' | 'Retirada';
  shippingCost: number;
  couponCode?: string;
  discountValue?: number;
  total: number;
  status: 'Novo' | 'Pago' | 'Separando' | 'Enviado' | 'Entregue' | 'Cancelado';
  createdAt: any;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentual' | 'valor fixo' | 'frete grátis';
  value: number;
  minPurchaseValue?: number;
  isActive: boolean;
}

export interface SocialConfig {
  instagram: string;
  facebook: string;
  tiktok: string;
  pinterest: string;
  whatsapp: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  linkTo?: string;
  title?: string;
  subtitle?: string;
  type: 'main' | 'promo';
}

export interface StoreConfig {
  id: string;
  socials: SocialConfig;
  banners: Banner[];
}

export type TransactionType = 'suprimento' | 'sangria' | 'venda_pdv';

export interface CashTransaction {
  id: string;
  timestamp: any;
  type: TransactionType;
  amount: number;
  description: string;
}

export interface CashControl {
  id: string;
  status: 'Aberto' | 'Fechado';
  openedAt: any;
  closedAt?: any;
  initialBalance: number;
  finalBalance?: number;
  transactions: CashTransaction[];
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  timestamp: any;
  type: 'entrada' | 'saida' | 'ajuste';
  quantity: number;
  reason: string;
  previousStock: number;
  newStock: number;
}

// Shared domain types used across admin pages

export interface CategorySummary {
  id: number;
  name: string;
  slug: string;
}

export interface Category extends CategorySummary {
  active: boolean;
}

export type ShippingClass = "FREE" | "STANDARD";

export interface Product {
  id: number;
  title: string;
  description: string | null;
  active: boolean;
  shippingClass: ShippingClass;
  category: CategorySummary;
}

export interface Variant {
  id: number;
  productId: number;
  sku: string;
  color: string | null;
  size: string | null;
  pricePaisa: number;
  stockQty: number;
  active: boolean;
}

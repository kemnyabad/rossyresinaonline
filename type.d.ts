export interface ProductProps {
  slug?: string;
  code?: string;
  barcode?: string;
  sku?: string;
  stock?: number;
  measure?: string;
  priceBulk12?: number;
  priceBulk3?: number;
  brand: string;
  category: string;
  description: string;
  image: string;
  images?: string[];
  isNew: boolean;
  oldPrice?: number;
  price: number;
  bundleQuantity?: number;
  bundlePrice?: number;
  title: string;
  _id: number | string;
  specs?: Array<{ label: string; value: string }>;
  variants?: Array<{
    id: string;
    label: string;
    price: number;
    oldPrice?: number | null;
    stock?: number;
  }>;
  optionGroups?: Array<{
    name: string;
    options: Array<{ label: string }>;
  }>;
}
export interface StoreProduct {
  cartKey?: string;
  productId?: number | string;
  variantId?: string;
  variantLabel?: string;
  selectedOptions?: Record<string, string>;
  slug?: string;
  code?: string;
  barcode?: string;
  sku?: string;
  stock?: number;
  measure?: string;
  priceBulk12?: number;
  priceBulk3?: number;
  brand: string;
  category: string;
  description: string;
  image: string;
  images?: string[];
  isNew: boolean;
  oldPrice?: number;
  price: number;
  bundleQuantity?: number;
  bundlePrice?: number;
  title: string;
  _id: number | string;
  quantity: number;
}

export interface StateProps {
  productData: StoreProduct[];
  favoriteData: StoreProduct[];
  userInfo: null | string;
  next: any;
}

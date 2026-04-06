export interface ProductProps {
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
  title: string;
  _id: number | string;
}
export interface StoreProduct {
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
  title: string;
  _id: number | string;
  quantity: number;
}

export interface StateProps {
  productData: [];
  favoriteData: [];
  userInfo: null | string;
  next: any;
}

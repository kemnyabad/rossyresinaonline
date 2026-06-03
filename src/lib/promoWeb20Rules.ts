type PromoProductLike = {
  title?: unknown;
  name?: unknown;
  category?: unknown;
  description?: unknown;
  brand?: unknown;
  code?: unknown;
  sku?: unknown;
};

const normalizeSearchText = (value: unknown) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const isPromoWeb20ExcludedProduct = (product: PromoProductLike) => {
  const text = normalizeSearchText([
    product.title,
    product.name,
    product.category,
    product.description,
    product.brand,
    product.code,
    product.sku,
  ].join(" "));
  return /\bresina\b/.test(text) && /\bepoxi(?:ca)?\b/.test(text);
};

export const hasPromoWeb20ExcludedProduct = (items: PromoProductLike[] = []) =>
  items.some(isPromoWeb20ExcludedProduct);

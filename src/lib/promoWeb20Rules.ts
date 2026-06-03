type PromoProductLike = {
  title?: unknown;
  name?: unknown;
  category?: unknown;
  description?: unknown;
  brand?: unknown;
  code?: unknown;
  sku?: unknown;
  price?: unknown;
  quantity?: unknown;
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

export const getPromoWeb20EligibleSubtotal = (items: PromoProductLike[] = []) =>
  items.reduce((sum, item) => {
    if (isPromoWeb20ExcludedProduct(item)) return sum;
    const price = Number(item.price || 0);
    const quantity = Math.max(1, Number(item.quantity || 1));
    if (!Number.isFinite(price) || !Number.isFinite(quantity)) return sum;
    return sum + price * quantity;
  }, 0);

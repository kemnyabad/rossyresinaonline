export type BundlePromoLike = {
  price?: unknown;
  quantity?: unknown;
  bundleQuantity?: unknown;
  bundlePrice?: unknown;
};

export const getBundlePromo = (item: BundlePromoLike) => {
  const quantity = Math.max(0, Math.floor(Number(item.bundleQuantity || 0)));
  const price = Number(item.bundlePrice || 0);
  if (!Number.isFinite(price) || quantity < 2 || price <= 0) return null;
  return { quantity, price };
};

export const getBundlePromoLabel = (item: BundlePromoLike) => {
  const promo = getBundlePromo(item);
  if (!promo) return "";
  const amount = Number.isInteger(promo.price) ? promo.price.toFixed(0) : promo.price.toFixed(2);
  return `${promo.quantity}X${amount} SOLES`;
};

export const getBundleLineTotal = (item: BundlePromoLike) => {
  const unitPrice = Number(item.price || 0);
  const quantity = Math.max(1, Math.floor(Number(item.quantity || 1)));
  const promo = getBundlePromo(item);
  if (!promo || !Number.isFinite(unitPrice)) return Number((unitPrice * quantity).toFixed(2));

  const bundleCount = Math.floor(quantity / promo.quantity);
  const remainder = quantity % promo.quantity;
  return Number((bundleCount * promo.price + remainder * unitPrice).toFixed(2));
};

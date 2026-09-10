export const getPresentationQuantity = (label: unknown) => {
  const source = String(label || "").toLowerCase();
  const match = source.match(/(\d+(?:[.,]\d+)?)\s*(?:kg|kilo|kilos)\b/);
  if (!match) return 1;
  const quantity = Number(match[1].replace(",", "."));
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
};

export const getPresentationTotalPrice = (pricePerUnit: unknown, label: unknown) => {
  const price = Number(pricePerUnit || 0);
  const multiplier = getPresentationQuantity(label);
  return Number.isFinite(price) ? Number((price * multiplier).toFixed(2)) : 0;
};

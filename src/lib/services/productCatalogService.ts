import type { ProductProps } from "../../../type";

export type ProductSort = "relevance" | "price_asc" | "price_desc" | "popular";

export type ProductFilterOptions = {
  query?: string;
  category?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  sort?: ProductSort;
};

function discountAmount(p: ProductProps): number {
  const oldPrice = Number(p.oldPrice || 0);
  const price = Number(p.price || 0);
  return oldPrice > price ? oldPrice - price : 0;
}

function popularityScore(p: ProductProps): number {
  // Sin historico real de ventas por producto en cat?logo base:
  // usamos una heuristica estable para priorizar productos atractivos.
  return discountAmount(p) * 10 + (p.isNew ? 5 : 0) + Number(p.price || 0) * 0.01;
}

export function getVisibleCategories(products: ProductProps[], limit = 10): string[] {
  return Array.from(
    new Set(
      (products || [])
        .map((p) => String(p.category || "").trim())
        .filter(Boolean)
    )
  ).slice(0, Math.max(1, limit));
}

export function getFeaturedProducts(products: ProductProps[], limit = 10): ProductProps[] {
  return [...(products || [])]
    .sort((a, b) => {
      const byPopularity = popularityScore(b) - popularityScore(a);
      if (byPopularity !== 0) return byPopularity;
      return Number(b.price || 0) - Number(a.price || 0);
    })
    .slice(0, Math.max(1, limit));
}

export function getOfferProducts(products: ProductProps[], limit = 10): ProductProps[] {
  return [...(products || [])]
    .filter((p) => discountAmount(p) > 0)
    .sort((a, b) => discountAmount(b) - discountAmount(a))
    .slice(0, Math.max(1, limit));
}

export function filterAndSortProducts(
  products: ProductProps[],
  opts: ProductFilterOptions = {}
): ProductProps[] {
  const query = String(opts.query || "").trim().toLowerCase();
  const category = String(opts.category || "").trim().toLowerCase();
  const minPrice = typeof opts.minPrice === "number" ? opts.minPrice : null;
  const maxPrice = typeof opts.maxPrice === "number" ? opts.maxPrice : null;
  const sort = opts.sort || "relevance";

  let out = [...(products || [])].filter((p) => {
    const price = Number(p.price || 0);
    const inCategory = !category || String(p.category || "").toLowerCase() === category;
    const inMin = minPrice === null || price >= minPrice;
    const inMax = maxPrice === null || price <= maxPrice;
    const inQuery =
      !query ||
      `${p.title || ""} ${p.category || ""} ${p.brand || ""} ${p.description || ""} ${p.code || ""}`
        .toLowerCase()
        .includes(query);
    return inCategory && inMin && inMax && inQuery;
  });

  if (sort === "price_asc") {
    out.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  } else if (sort === "price_desc") {
    out.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  } else if (sort === "popular") {
    out.sort((a, b) => popularityScore(b) - popularityScore(a));
  } else {
    out.sort((a, b) => {
      const qA = query && String(a.title || "").toLowerCase().includes(query) ? 1 : 0;
      const qB = query && String(b.title || "").toLowerCase().includes(query) ? 1 : 0;
      if (qA !== qB) return qB - qA;
      return popularityScore(b) - popularityScore(a);
    });
  }

  return out;
}

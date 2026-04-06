export async function trackProductCartAdd(productId: number | string, quantity = 1) {
  try {
    await fetch(`/api/products/${encodeURIComponent(String(productId))}/metrics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "cart_add",
        quantity: Math.max(1, Number(quantity || 1)),
      }),
    });
  } catch {
    // Silent on purpose: metrics must not block cart UX.
  }
}

export type ProductStat = { salesCount: number; avgRating: number; reviewCount: number };

export async function fetchProductStats(ids: string): Promise<Record<string, ProductStat>> {
  if (!ids) return {};
  try {
    const r = await fetch(`/api/products/stats?ids=${encodeURIComponent(ids)}`);
    if (!r.ok) return {};
    const data = await r.json();
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

export function normalizeImageUrl(s?: string): string {
  const t = String(s || "");
  if (!t) return "/favicon-96x96.png";
  let u = t.replace(/\\/g, "/");
  if (/^https?:\/\//i.test(u)) return u;
  if (!u.startsWith("/")) u = "/" + u;
  return u;
}

export function isPlaceholderImage(src?: string): boolean {
  const imgSrc = normalizeImageUrl(src).toLowerCase();
  return (
    !src ||
    String(src).trim() === "" ||
    imgSrc.includes("sliderimg_") ||
    imgSrc.includes("favicon-96x96.png") ||
    imgSrc.includes("favicon") ||
    imgSrc.includes("/logo.png") ||
    imgSrc.includes("/logo.jpg") ||
    imgSrc.endsWith("/logo")
  );
}

export function pickDisplayImage(image?: string, images?: unknown): string {
  const gallery = Array.isArray(images)
    ? images.map((x) => String(x || "").trim()).filter(Boolean)
    : [];
  const preferred = [String(image || "").trim(), ...gallery].find((img) => !isPlaceholderImage(img));
  return preferred || String(image || "").trim() || gallery[0] || "/favicon-96x96.png";
}

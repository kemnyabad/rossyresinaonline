import type { ProductProps } from "../../../type";
import prisma from "@/lib/prisma";
const productBaseSelect = {
  id: true,
  legacyId: true,
  code: true,
  slug: true,
  barcode: true,
  title: true,
  description: true,
  brand: true,
  category: true,
  image: true,
  specs: true,
  price: true,
  oldPrice: true,
  bundleQuantity: true,
  bundlePrice: true,
  isNew: true,
  stock: true,
  variants: {
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      label: true,
      price: true,
      oldPrice: true,
      stock: true,
    },
  },
};
const normalizeImages = (images: any): string[] => {
  if (Array.isArray(images)) return images.map((x) => String(x || "").trim()).filter(Boolean);
  if (typeof images === "string") {
    return images
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [];
};

const isPlaceholderImage = (value: any): boolean => {
  const src = String(value || "").trim().toLowerCase();
  if (!src) return true;
  return (
    src.includes("favicon") ||
    src.includes("sliderimg_") ||
    src.endsWith("/logo") ||
    src.includes("/logo.png") ||
    src.includes("/logo.jpg")
  );
};

const pickMainImage = (image: any, images: any): string => {
  const gallery = normalizeImages(images);
  const current = String(image || "").trim();
  const firstCloudinary = gallery.find((img) => /cloudinary\.com/i.test(String(img)));
  if (firstCloudinary && !/cloudinary\.com/i.test(current)) return firstCloudinary;
  if (current && !isPlaceholderImage(current)) return current;
  if (gallery.length > 0) return gallery[0];
  return "";
};

const normalizeSpecs = (specs: any): Array<{ label: string; value: string }> => {
  if (!Array.isArray(specs)) return [];
  return specs
    .map((s) => ({ label: String(s?.label || "").trim(), value: String(s?.value || "").trim() }))
    .filter((s) => s.label && s.value);
};

const toLegacyFromDb = (p: any): ProductProps => ({
  _id: p?.legacyId ?? p?.id,
  slug: p?.slug || "",
  code: p?.code || "",
  barcode: p?.barcode || "",
  stock: Number(p?.stock || 0),
  title: p?.title || "Producto",
  description: p?.description || "",
  brand: p?.brand || "",
  category: p?.category || "",
  image: pickMainImage(p?.image, p?.images),
  images: normalizeImages(p?.images),
  specs: normalizeSpecs(p?.specs),
  isNew: Boolean(p?.isNew),
  oldPrice: p?.oldPrice != null ? Number(p.oldPrice) : undefined,
  price: Number(p?.price || 0),
  bundleQuantity: p?.bundleQuantity != null ? Number(p.bundleQuantity) : undefined,
  bundlePrice: p?.bundlePrice != null ? Number(p.bundlePrice) : undefined,
  variants: Array.isArray(p?.variants)
    ? p.variants.map((v: any) => ({
        id: v.id,
        label: v.label,
        price: Number(v.price || 0),
        oldPrice: v.oldPrice != null ? Number(v.oldPrice) : null,
        stock: Number(v.stock || 0),
      }))
    : [],
});

const toSerializable = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const PRODUCT_CACHE_TTL_MS = 10000;
let productCache: { expiresAt: number; products: ProductProps[] } | null = null;

export async function getAllProducts(): Promise<ProductProps[]> {
  try {
    const now = Date.now();
    if (productCache && productCache.expiresAt > now) {
      return productCache.products;
    }

    const dbRows = await (prisma as any).product.findMany({
      orderBy: { createdAt: "desc" },
      select: { ...productBaseSelect, images: true },
    });
    const products = toSerializable((dbRows || []).map(toLegacyFromDb));
    productCache = { expiresAt: now + PRODUCT_CACHE_TTL_MS, products };
    return products;
  } catch {
    return [];
  }
}

import prisma from "@/lib/prisma";
import { readMarketplace, slugify, type MarketplaceProductStatus } from "@/lib/marketplaceStore";

export const DB_APPLICATION_PREFIX = "db_";
export const DB_PRODUCT_PREFIX = "dbprod_";

export const safeParseMarketplaceMessage = (value: unknown) => {
  try {
    return JSON.parse(String(value || "{}"));
  } catch {
    return {};
  }
};

const normalizeEmail = (value: unknown) => String(value || "").trim().toLowerCase();

export const dbShopIdForEmail = (email: unknown) => `dbshop_${normalizeEmail(email)}`;

const dbProductSlug = (row: any, name: string, metaSlug?: string) => {
  const base = slugify(String(metaSlug || name || row?.id || "producto"));
  const suffix = String(row?.id || "").slice(0, 6);
  return suffix && !base.endsWith(suffix) ? `${base}-${suffix}` : base;
};

export function mapDbApplication(row: any) {
  const meta = safeParseMarketplaceMessage(row?.mensaje);
  const estado = String(row?.estado || "PENDIENTE").toUpperCase();
  const status =
    estado === "APROBADO" || estado === "APPROVED"
      ? "APPROVED"
      : estado === "RECHAZADO" || estado === "REJECTED"
        ? "REJECTED"
        : "PENDING";

  return {
    id: `${DB_APPLICATION_PREFIX}${row.id}`,
    userEmail: normalizeEmail(row.email),
    fullName: String(row.nombre || ""),
    sellerDni: String(meta.dni || ""),
    businessName: String(meta.emprendimiento || row.nombre || ""),
    city: String(meta.ciudad || ""),
    whatsapp: String(meta.whatsapp || row.telefono || ""),
    productType: String(meta.productos || ""),
    description: String(meta.descripcion || ""),
    socialUrl: String(meta.redes || ""),
    logoUrl: String(meta.logo || ""),
    dniFrontUrl: String(meta.dniFrente || ""),
    dniBackUrl: String(meta.dniReverso || ""),
    businessPhotoUrl: String(meta.fotoEmprendimiento || ""),
    facebook: String(meta.facebook || ""),
    tiktok: String(meta.tiktok || ""),
    status,
    note: String(row.notaAdmin || ""),
    createdAt: row.createdAt?.toISOString?.() || String(row.createdAt || ""),
    updatedAt: row.updatedAt?.toISOString?.() || String(row.updatedAt || ""),
    storage: "database",
  };
}

export function mapDbShopFromApplication(application: any) {
  return {
    id: dbShopIdForEmail(application.userEmail),
    userEmail: normalizeEmail(application.userEmail),
    applicationId: application.id,
    slug: slugify(application.businessName || application.fullName || application.userEmail || "tienda"),
    logoUrl: application.logoUrl || "",
    commercialName: application.businessName || "Mi emprendimiento",
    city: application.city || "",
    description: application.description || "",
    whatsapp: application.whatsapp || "",
    facebook: application.facebook || "",
    instagram: application.socialUrl || "",
    tiktok: application.tiktok || "",
    status: "ACTIVE",
    featured: false,
    createdAt: application.createdAt || "",
    updatedAt: application.updatedAt || "",
    storage: "database",
  };
}

export function publicMarketplaceShop(shop: any) {
  if (!shop) return null;
  return {
    id: String(shop.id || ""),
    slug: String(shop.slug || ""),
    logoUrl: String(shop.logoUrl || ""),
    commercialName: String(shop.commercialName || ""),
    city: String(shop.city || ""),
    description: String(shop.description || ""),
    whatsapp: String(shop.whatsapp || ""),
    facebook: String(shop.facebook || ""),
    instagram: String(shop.instagram || ""),
    tiktok: String(shop.tiktok || ""),
    status: String(shop.status || ""),
    featured: Boolean(shop.featured),
  };
}

export function mapDbProduct(row: any) {
  const meta = safeParseMarketplaceMessage(row?.mensaje);
  const estado = String(row?.estado || "PENDIENTE").toUpperCase();
  const status: MarketplaceProductStatus =
    estado === "PUBLICADO" || estado === "PUBLISHED"
      ? "PUBLISHED"
      : estado === "PAUSADO" || estado === "PAUSED"
        ? "PAUSED"
        : estado === "RECHAZADO" || estado === "REJECTED"
          ? "REJECTED"
          : "PENDING";
  const name = String(meta.nombre || row.nombre || "");

  return {
    id: `${DB_PRODUCT_PREFIX}${row.id}`,
    sellerEmail: normalizeEmail(row.email),
    shopId: dbShopIdForEmail(row.email),
    slug: dbProductSlug(row, name, meta.slug),
    name,
    category: String(meta.categoria || ""),
    price: Number(meta.precio || 0),
    description: String(meta.descripcion || ""),
    images: Array.isArray(meta.imagenes) ? meta.imagenes.map(String).filter(Boolean) : [],
    status,
    featured: Boolean(meta.destacado),
    rejectionReason: String(row.notaAdmin || ""),
    createdAt: row.createdAt?.toISOString?.() || String(row.createdAt || ""),
    updatedAt: row.updatedAt?.toISOString?.() || String(row.updatedAt || ""),
    storage: "database",
  };
}

export function publicMarketplaceProduct(product: any) {
  if (!product) return null;
  return {
    id: String(product.id || ""),
    shopId: String(product.shopId || ""),
    slug: String(product.slug || ""),
    name: String(product.name || ""),
    category: String(product.category || ""),
    price: Number(product.price || 0),
    description: String(product.description || ""),
    images: Array.isArray(product.images) ? product.images.map(String).filter(Boolean) : [],
    status: String(product.status || ""),
    featured: Boolean(product.featured),
  };
}

export async function getDbMarketplaceData() {
  const [applicationRows, productRows] = await Promise.all([
    (prisma as any).capacitacionInscripcion.findMany({
      where: { curso: "VENDE_CON_NOSOTROS" },
      orderBy: { createdAt: "desc" },
    }),
    (prisma as any).capacitacionInscripcion.findMany({
      where: { curso: "MARKETPLACE_PRODUCT" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const applications = applicationRows.map(mapDbApplication);
  const shops = applications
    .filter((item: any) => item.status === "APPROVED")
    .map(mapDbShopFromApplication);
  const products = productRows.map(mapDbProduct);

  return { applications, shops, products };
}

export async function getPublishedMarketplaceProducts() {
  const local = readMarketplace();
  const dbData = await getDbMarketplaceData();
  const shops = [...dbData.shops, ...local.shops];
  const products = [...dbData.products, ...local.products]
    .filter((item: any) => item.status === "PUBLISHED")
    .map((product: any) => {
      const publicProduct = publicMarketplaceProduct(product);
      return {
        ...publicProduct,
        shop: publicMarketplaceShop(shops.find((shop: any) => shop.id === product.shopId) || null),
      };
    })
    .filter((product: any) => product.shop);

  return products;
}

export async function moderateDbProduct(id: string, decision: "PUBLISHED" | "REJECTED", note = "") {
  if (!id.startsWith(DB_PRODUCT_PREFIX)) return null;
  const dbId = id.slice(DB_PRODUCT_PREFIX.length);
  const updated = await (prisma as any).capacitacionInscripcion.update({
    where: { id: dbId },
    data: {
      estado: decision === "PUBLISHED" ? "PUBLICADO" : "RECHAZADO",
      notaAdmin: String(note || ""),
    },
  });
  return mapDbProduct(updated);
}

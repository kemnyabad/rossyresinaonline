import prisma from "@/lib/prisma";

export type MarketplaceRole = "CUSTOMER" | "SELLER" | "ADMIN";
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type MarketplaceProductStatus = "PENDING" | "PUBLISHED" | "PAUSED" | "REJECTED";
export type MarketplaceEventType = "SHOP_VIEW" | "PRODUCT_VIEW" | "WHATSAPP_CLICK";

export type SellerApplication = {
  id: string;
  userEmail: string;
  fullName: string;
  sellerDni?: string;
  businessName: string;
  city: string;
  whatsapp: string;
  productType: string;
  description: string;
  socialUrl: string;
  logoUrl: string;
  dniFrontUrl?: string;
  dniBackUrl?: string;
  businessPhotoUrl?: string;
  status: ApplicationStatus;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type SellerShop = {
  id: string;
  userEmail: string;
  applicationId: string;
  slug: string;
  logoUrl: string;
  commercialName: string;
  city: string;
  description: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  status: "ACTIVE" | "PAUSED";
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SellerProduct = {
  id: string;
  sellerEmail: string;
  shopId: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  description: string;
  images: string[];
  status: MarketplaceProductStatus;
  featured: boolean;
  rejectionReason: string;
  createdAt: string;
  updatedAt: string;
};

export type MarketplaceEvent = {
  id: string;
  type: MarketplaceEventType;
  shopId?: string;
  productId?: string;
  createdAt: string;
};

const db = prisma as any;

export const slugify = (value: string) =>
  String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "tienda";

const normalizeEmail = (value: unknown) => String(value || "").trim().toLowerCase();

const toIso = (value: unknown) => (value instanceof Date ? value.toISOString() : String(value || ""));

const mapApplication = (row: any): SellerApplication => ({
  id: row.id,
  userEmail: row.userEmail,
  fullName: row.fullName,
  sellerDni: row.sellerDni || "",
  businessName: row.businessName,
  city: row.city,
  whatsapp: row.whatsapp,
  productType: row.productType,
  description: row.description,
  socialUrl: row.socialUrl,
  logoUrl: row.logoUrl,
  dniFrontUrl: row.dniFrontUrl || "",
  dniBackUrl: row.dniBackUrl || "",
  businessPhotoUrl: row.businessPhotoUrl || "",
  status: row.status,
  note: row.note,
  createdAt: toIso(row.createdAt),
  updatedAt: toIso(row.updatedAt),
});

const mapShop = (row: any): SellerShop => ({
  id: row.id,
  userEmail: row.userEmail,
  applicationId: row.applicationId,
  slug: row.slug,
  logoUrl: row.logoUrl,
  commercialName: row.commercialName,
  city: row.city,
  description: row.description,
  whatsapp: row.whatsapp,
  facebook: row.facebook,
  instagram: row.instagram,
  tiktok: row.tiktok,
  status: row.status,
  featured: row.featured,
  createdAt: toIso(row.createdAt),
  updatedAt: toIso(row.updatedAt),
});

const mapProduct = (row: any): SellerProduct => ({
  id: row.id,
  sellerEmail: row.sellerEmail,
  shopId: row.shopId,
  slug: row.slug,
  name: row.name,
  category: row.category,
  price: Number(row.price),
  description: row.description,
  images: Array.isArray(row.images) ? row.images.map(String).filter(Boolean) : [],
  status: row.status,
  featured: row.featured,
  rejectionReason: row.rejectionReason,
  createdAt: toIso(row.createdAt),
  updatedAt: toIso(row.updatedAt),
});

const mapEvent = (row: any): MarketplaceEvent => ({
  id: row.id,
  type: row.type,
  shopId: row.shopId || undefined,
  productId: row.productId || undefined,
  createdAt: toIso(row.createdAt),
});

const uniqueSlug = async (base: string, checkTaken: (slug: string) => Promise<boolean>) => {
  const clean = slugify(base);
  if (!(await checkTaken(clean))) return clean;
  let i = 2;
  while (await checkTaken(`${clean}-${i}`)) i += 1;
  return `${clean}-${i}`;
};

export async function getSellerContext(
  email?: string | null
): Promise<{ role: MarketplaceRole; application: SellerApplication | null; shop: SellerShop | null }> {
  const userEmail = normalizeEmail(email);
  const [shopRow, applicationRow] = await Promise.all([
    db.sellerShop.findFirst({ where: { userEmail, status: "ACTIVE" } }),
    db.sellerApplication.findFirst({ where: { userEmail }, orderBy: { createdAt: "desc" } }),
  ]);
  const shop = shopRow ? mapShop(shopRow) : null;
  const application = applicationRow ? mapApplication(applicationRow) : null;
  const role: MarketplaceRole = shop ? "SELLER" : "CUSTOMER";
  return { role, application, shop };
}

export async function createSellerApplication(
  input: Partial<SellerApplication> & { userEmail: string }
): Promise<SellerApplication> {
  const email = normalizeEmail(input.userEmail);
  const existingPending = await db.sellerApplication.findFirst({ where: { userEmail: email, status: "PENDING" } });

  const fields = {
    fullName: String(input.fullName || "").trim(),
    sellerDni: String(input.sellerDni || "").trim(),
    businessName: String(input.businessName || "").trim(),
    city: String(input.city || "").trim(),
    whatsapp: String(input.whatsapp || "").trim(),
    productType: String(input.productType || "").trim(),
    description: String(input.description || "").trim(),
    socialUrl: String(input.socialUrl || "").trim(),
    logoUrl: String(input.logoUrl || "").trim(),
    dniFrontUrl: String(input.dniFrontUrl || "").trim(),
    dniBackUrl: String(input.dniBackUrl || "").trim(),
    businessPhotoUrl: String(input.businessPhotoUrl || "").trim(),
  };

  if (existingPending) {
    const updated = await db.sellerApplication.update({
      where: { id: existingPending.id },
      data: fields,
    });
    return mapApplication(updated);
  }

  const created = await db.sellerApplication.create({
    data: { userEmail: email, status: "PENDING", note: "", ...fields },
  });
  return mapApplication(created);
}

export async function decideSellerApplication(
  id: string,
  decision: "APPROVED" | "REJECTED",
  note = ""
): Promise<{ application: SellerApplication; shop: SellerShop | null } | null> {
  const application = await db.sellerApplication.findUnique({ where: { id } });
  if (!application) return null;

  const updatedApplication = await db.sellerApplication.update({
    where: { id },
    data: { status: decision, note: String(note || "") },
  });

  let shop = await db.sellerShop.findFirst({ where: { userEmail: application.userEmail } });
  if (decision === "APPROVED" && !shop) {
    const slug = await uniqueSlug(application.businessName, async (candidate) => {
      const existing = await db.sellerShop.findUnique({ where: { slug: candidate } });
      return Boolean(existing);
    });
    shop = await db.sellerShop.create({
      data: {
        userEmail: application.userEmail,
        applicationId: application.id,
        slug,
        logoUrl: application.logoUrl,
        commercialName: application.businessName,
        city: application.city,
        description: application.description,
        whatsapp: application.whatsapp,
        facebook: "",
        instagram: application.socialUrl,
        tiktok: "",
        status: "ACTIVE",
        featured: false,
      },
    });
  }

  return { application: mapApplication(updatedApplication), shop: shop ? mapShop(shop) : null };
}

export async function updateSellerShop(email: string, input: Partial<SellerShop>): Promise<SellerShop | null> {
  const shop = await db.sellerShop.findFirst({ where: { userEmail: normalizeEmail(email) } });
  if (!shop) return null;
  const updated = await db.sellerShop.update({
    where: { id: shop.id },
    data: {
      logoUrl: String(input.logoUrl ?? shop.logoUrl),
      commercialName: String(input.commercialName ?? shop.commercialName),
      city: String(input.city ?? shop.city),
      description: String(input.description ?? shop.description),
      whatsapp: String(input.whatsapp ?? shop.whatsapp),
      facebook: String(input.facebook ?? shop.facebook),
      instagram: String(input.instagram ?? shop.instagram),
      tiktok: String(input.tiktok ?? shop.tiktok),
    },
  });
  return mapShop(updated);
}

export async function setSellerShopStatus(id: string, status: "ACTIVE" | "PAUSED"): Promise<SellerShop | null> {
  const shop = await db.sellerShop.findUnique({ where: { id } });
  if (!shop) return null;
  const updated = await db.sellerShop.update({ where: { id }, data: { status } });
  return mapShop(updated);
}

export async function createSellerProduct(email: string, input: Partial<SellerProduct>): Promise<SellerProduct | null> {
  const shop = await db.sellerShop.findFirst({ where: { userEmail: normalizeEmail(email), status: "ACTIVE" } });
  if (!shop) return null;
  const images = Array.isArray(input.images) ? input.images.map(String).filter(Boolean) : [];
  const slug = await uniqueSlug(String(input.name || "producto"), async (candidate) => {
    const existing = await db.sellerProduct.findUnique({ where: { slug: candidate } });
    return Boolean(existing);
  });
  const created = await db.sellerProduct.create({
    data: {
      sellerEmail: shop.userEmail,
      shopId: shop.id,
      slug,
      name: String(input.name || "").trim(),
      category: String(input.category || "").trim(),
      price: Number(input.price || 0),
      description: String(input.description || "").trim(),
      images,
      status: "PENDING",
      featured: false,
      rejectionReason: "",
    },
  });
  return mapProduct(created);
}

export async function updateSellerProduct(
  email: string,
  id: string,
  input: Partial<SellerProduct>
): Promise<SellerProduct | null> {
  const product = await db.sellerProduct.findFirst({ where: { id, sellerEmail: normalizeEmail(email) } });
  if (!product) return null;
  const updated = await db.sellerProduct.update({
    where: { id },
    data: {
      name: String(input.name ?? product.name),
      category: String(input.category ?? product.category),
      price: Number(input.price ?? product.price),
      description: String(input.description ?? product.description),
      images: Array.isArray(input.images) ? input.images.map(String).filter(Boolean) : product.images,
      status: product.status === "PUBLISHED" ? "PENDING" : product.status,
    },
  });
  return mapProduct(updated);
}

export async function setSellerProductStatus(
  email: string,
  id: string,
  status: MarketplaceProductStatus
): Promise<SellerProduct | null> {
  const product = await db.sellerProduct.findFirst({ where: { id, sellerEmail: normalizeEmail(email) } });
  if (!product) return null;
  const updated = await db.sellerProduct.update({ where: { id }, data: { status } });
  return mapProduct(updated);
}

export async function deleteSellerProduct(email: string, id: string): Promise<boolean> {
  const product = await db.sellerProduct.findFirst({ where: { id, sellerEmail: normalizeEmail(email) } });
  if (!product) return false;
  await db.sellerProduct.delete({ where: { id } });
  return true;
}

export async function moderateProduct(
  id: string,
  status: "PUBLISHED" | "REJECTED",
  rejectionReason = ""
): Promise<SellerProduct | null> {
  const product = await db.sellerProduct.findUnique({ where: { id } });
  if (!product) return null;
  const updated = await db.sellerProduct.update({
    where: { id },
    data: { status, rejectionReason: status === "REJECTED" ? String(rejectionReason || "") : "" },
  });
  return mapProduct(updated);
}

export async function recordMarketplaceEvent(input: Omit<MarketplaceEvent, "id" | "createdAt">) {
  await db.marketplaceEvent.create({
    data: {
      type: input.type,
      shopId: input.shopId || null,
      productId: input.productId || null,
    },
  });
}

export async function getSellerStats(shopId?: string | null): Promise<{
  published: number;
  pending: number;
  shopViews: number;
  productViews: number;
  whatsappClicks: number;
}> {
  if (!shopId) {
    return { published: 0, pending: 0, shopViews: 0, productViews: 0, whatsappClicks: 0 };
  }
  const products = await db.sellerProduct.findMany({ where: { shopId }, select: { id: true, status: true } });
  const productIds = products.map((item: any) => item.id);
  const [published, pending, shopViews, productViews, whatsappClicks] = await Promise.all([
    Promise.resolve(products.filter((item: any) => item.status === "PUBLISHED").length),
    Promise.resolve(products.filter((item: any) => item.status === "PENDING").length),
    db.marketplaceEvent.count({ where: { type: "SHOP_VIEW", shopId } }),
    db.marketplaceEvent.count({ where: { type: "PRODUCT_VIEW", productId: { in: productIds.length ? productIds : ["__none__"] } } }),
    db.marketplaceEvent.count({
      where: {
        type: "WHATSAPP_CLICK",
        OR: [{ shopId }, { productId: { in: productIds.length ? productIds : ["__none__"] } }],
      },
    }),
  ]);
  return { published, pending, shopViews, productViews, whatsappClicks };
}

export async function getShopProducts(shopId?: string | null): Promise<SellerProduct[]> {
  if (!shopId) return [];
  const rows = await db.sellerProduct.findMany({ where: { shopId }, orderBy: { createdAt: "desc" } });
  return rows.map(mapProduct);
}

export async function getSellerProducts(email: string): Promise<SellerProduct[]> {
  const rows = await db.sellerProduct.findMany({
    where: { sellerEmail: normalizeEmail(email) },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapProduct);
}

export function toPublicShop(shop: SellerShop | null) {
  if (!shop) return null;
  return {
    id: shop.id,
    slug: shop.slug,
    logoUrl: shop.logoUrl,
    commercialName: shop.commercialName,
    city: shop.city,
    description: shop.description,
    whatsapp: shop.whatsapp,
    facebook: shop.facebook,
    instagram: shop.instagram,
    tiktok: shop.tiktok,
    status: shop.status,
    featured: shop.featured,
  };
}

export function toPublicProduct(product: SellerProduct | null) {
  if (!product) return null;
  return {
    id: product.id,
    shopId: product.shopId,
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: product.price,
    description: product.description,
    images: product.images,
    status: product.status,
    featured: product.featured,
  };
}

export async function getPublishedMarketplaceProducts(): Promise<Array<ReturnType<typeof toPublicProduct> & { shop: ReturnType<typeof toPublicShop> }>> {
  const [shopRows, productRows] = await Promise.all([
    db.sellerShop.findMany({ where: { status: "ACTIVE" } }),
    db.sellerProduct.findMany({ where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" } }),
  ]);
  const shops: SellerShop[] = shopRows.map(mapShop);
  const products: SellerProduct[] = productRows.map(mapProduct);
  const shopById = new Map(shops.map((shop) => [shop.id, shop]));
  return products
    .map((product) => ({
      ...toPublicProduct(product)!,
      shop: toPublicShop(shopById.get(product.shopId) || null),
    }))
    .filter((product) => product.shop);
}

export async function readMarketplace(): Promise<{
  applications: SellerApplication[];
  shops: SellerShop[];
  products: SellerProduct[];
  events: MarketplaceEvent[];
}> {
  const [applications, shops, products, events] = await Promise.all([
    db.sellerApplication.findMany({ orderBy: { createdAt: "desc" } }),
    db.sellerShop.findMany({ orderBy: { createdAt: "desc" } }),
    db.sellerProduct.findMany({ orderBy: { createdAt: "desc" } }),
    db.marketplaceEvent.findMany({ orderBy: { createdAt: "desc" }, take: 5000 }),
  ]);
  return {
    applications: applications.map(mapApplication),
    shops: shops.map(mapShop),
    products: products.map(mapProduct),
    events: events.map(mapEvent),
  };
}

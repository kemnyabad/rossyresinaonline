import fs from "fs";
import path from "path";

export type MarketplaceRole = "CUSTOMER" | "SELLER" | "ADMIN";
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type MarketplaceProductStatus = "PENDING" | "PUBLISHED" | "PAUSED" | "REJECTED";
export type MarketplaceEventType = "SHOP_VIEW" | "PRODUCT_VIEW" | "WHATSAPP_CLICK";

export type SellerApplication = {
  id: string;
  userEmail: string;
  fullName: string;
  businessName: string;
  city: string;
  whatsapp: string;
  productType: string;
  description: string;
  socialUrl: string;
  logoUrl: string;
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

type MarketplaceData = {
  applications: SellerApplication[];
  shops: SellerShop[];
  products: SellerProduct[];
  events: MarketplaceEvent[];
};

const filePath = path.join(process.cwd(), "data", "marketplace.json");

const now = () => new Date().toISOString();

export const slugify = (value: string) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "tienda";

const makeId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const emptyData = (): MarketplaceData => ({
  applications: [],
  shops: [],
  products: [],
  events: [],
});

const ensureFile = () => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify(emptyData(), null, 2));
};

export function readMarketplace(): MarketplaceData {
  ensureFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return { ...emptyData(), ...parsed };
  } catch {
    return emptyData();
  }
}

function writeMarketplace(data: MarketplaceData) {
  ensureFile();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

const uniqueSlug = (base: string, existing: string[]) => {
  const clean = slugify(base);
  if (!existing.includes(clean)) return clean;
  let i = 2;
  while (existing.includes(`${clean}-${i}`)) i += 1;
  return `${clean}-${i}`;
};

export function getSellerContext(email?: string | null) {
  const userEmail = String(email || "").trim().toLowerCase();
  const data = readMarketplace();
  const shop = data.shops.find((item) => item.userEmail === userEmail && item.status === "ACTIVE") || null;
  const application =
    data.applications
      .filter((item) => item.userEmail === userEmail)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] || null;
  const role: MarketplaceRole = shop ? "SELLER" : "CUSTOMER";
  return { role, application, shop };
}

export function createSellerApplication(input: Partial<SellerApplication> & { userEmail: string }) {
  const data = readMarketplace();
  const email = String(input.userEmail || "").trim().toLowerCase();
  const existingPending = data.applications.find((item) => item.userEmail === email && item.status === "PENDING");
  const timestamp = now();

  if (existingPending) {
    Object.assign(existingPending, {
      fullName: String(input.fullName || existingPending.fullName || "").trim(),
      businessName: String(input.businessName || existingPending.businessName || "").trim(),
      city: String(input.city || existingPending.city || "").trim(),
      whatsapp: String(input.whatsapp || existingPending.whatsapp || "").trim(),
      productType: String(input.productType || existingPending.productType || "").trim(),
      description: String(input.description || existingPending.description || "").trim(),
      socialUrl: String(input.socialUrl || existingPending.socialUrl || "").trim(),
      logoUrl: String(input.logoUrl || existingPending.logoUrl || "").trim(),
      updatedAt: timestamp,
    });
    writeMarketplace(data);
    return existingPending;
  }

  const application: SellerApplication = {
    id: makeId("app"),
    userEmail: email,
    fullName: String(input.fullName || "").trim(),
    businessName: String(input.businessName || "").trim(),
    city: String(input.city || "").trim(),
    whatsapp: String(input.whatsapp || "").trim(),
    productType: String(input.productType || "").trim(),
    description: String(input.description || "").trim(),
    socialUrl: String(input.socialUrl || "").trim(),
    logoUrl: String(input.logoUrl || "").trim(),
    status: "PENDING",
    note: "",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  data.applications.unshift(application);
  writeMarketplace(data);
  return application;
}

export function decideSellerApplication(id: string, decision: "APPROVED" | "REJECTED", note = "") {
  const data = readMarketplace();
  const application = data.applications.find((item) => item.id === id);
  if (!application) return null;
  application.status = decision;
  application.note = String(note || "");
  application.updatedAt = now();

  let shop = data.shops.find((item) => item.userEmail === application.userEmail) || null;
  if (decision === "APPROVED" && !shop) {
    const timestamp = now();
    shop = {
      id: makeId("shop"),
      userEmail: application.userEmail,
      applicationId: application.id,
      slug: uniqueSlug(application.businessName, data.shops.map((item) => item.slug)),
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
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    data.shops.unshift(shop);
  }

  writeMarketplace(data);
  return { application, shop };
}

export function updateSellerShop(email: string, input: Partial<SellerShop>) {
  const data = readMarketplace();
  const shop = data.shops.find((item) => item.userEmail === String(email || "").trim().toLowerCase());
  if (!shop) return null;
  Object.assign(shop, {
    logoUrl: String(input.logoUrl ?? shop.logoUrl),
    commercialName: String(input.commercialName ?? shop.commercialName),
    city: String(input.city ?? shop.city),
    description: String(input.description ?? shop.description),
    whatsapp: String(input.whatsapp ?? shop.whatsapp),
    facebook: String(input.facebook ?? shop.facebook),
    instagram: String(input.instagram ?? shop.instagram),
    tiktok: String(input.tiktok ?? shop.tiktok),
    updatedAt: now(),
  });
  writeMarketplace(data);
  return shop;
}

export function createSellerProduct(email: string, input: Partial<SellerProduct>) {
  const data = readMarketplace();
  const shop = data.shops.find((item) => item.userEmail === String(email || "").trim().toLowerCase() && item.status === "ACTIVE");
  if (!shop) return null;
  const timestamp = now();
  const product: SellerProduct = {
    id: makeId("prod"),
    sellerEmail: shop.userEmail,
    shopId: shop.id,
    slug: uniqueSlug(String(input.name || "producto"), data.products.map((item) => item.slug)),
    name: String(input.name || "").trim(),
    category: String(input.category || "").trim(),
    price: Number(input.price || 0),
    description: String(input.description || "").trim(),
    images: Array.isArray(input.images) ? input.images.map(String).filter(Boolean) : [],
    status: "PENDING",
    featured: false,
    rejectionReason: "",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  data.products.unshift(product);
  writeMarketplace(data);
  return product;
}

export function updateSellerProduct(email: string, id: string, input: Partial<SellerProduct>) {
  const data = readMarketplace();
  const product = data.products.find((item) => item.id === id && item.sellerEmail === String(email || "").trim().toLowerCase());
  if (!product) return null;
  Object.assign(product, {
    name: String(input.name ?? product.name),
    category: String(input.category ?? product.category),
    price: Number(input.price ?? product.price),
    description: String(input.description ?? product.description),
    images: Array.isArray(input.images) ? input.images.map(String).filter(Boolean) : product.images,
    status: product.status === "PUBLISHED" ? "PENDING" : product.status,
    updatedAt: now(),
  });
  writeMarketplace(data);
  return product;
}

export function setSellerProductStatus(email: string, id: string, status: MarketplaceProductStatus) {
  const data = readMarketplace();
  const product = data.products.find((item) => item.id === id && item.sellerEmail === String(email || "").trim().toLowerCase());
  if (!product) return null;
  product.status = status;
  product.updatedAt = now();
  writeMarketplace(data);
  return product;
}

export function deleteSellerProduct(email: string, id: string) {
  const data = readMarketplace();
  const initial = data.products.length;
  data.products = data.products.filter((item) => !(item.id === id && item.sellerEmail === String(email || "").trim().toLowerCase()));
  writeMarketplace(data);
  return data.products.length !== initial;
}

export function moderateProduct(id: string, status: "PUBLISHED" | "REJECTED", rejectionReason = "") {
  const data = readMarketplace();
  const product = data.products.find((item) => item.id === id);
  if (!product) return null;
  product.status = status;
  product.rejectionReason = status === "REJECTED" ? String(rejectionReason || "") : "";
  product.updatedAt = now();
  writeMarketplace(data);
  return product;
}

export function recordMarketplaceEvent(input: Omit<MarketplaceEvent, "id" | "createdAt">) {
  const data = readMarketplace();
  data.events.unshift({ id: makeId("evt"), createdAt: now(), ...input });
  data.events = data.events.slice(0, 5000);
  writeMarketplace(data);
}

export function getSellerStats(shopId?: string | null) {
  const data = readMarketplace();
  const products = data.products.filter((item) => item.shopId === shopId);
  const productIds = products.map((item) => item.id);
  return {
    published: products.filter((item) => item.status === "PUBLISHED").length,
    pending: products.filter((item) => item.status === "PENDING").length,
    shopViews: data.events.filter((item) => item.type === "SHOP_VIEW" && item.shopId === shopId).length,
    productViews: data.events.filter((item) => item.type === "PRODUCT_VIEW" && productIds.includes(String(item.productId || ""))).length,
    whatsappClicks: data.events.filter((item) => item.type === "WHATSAPP_CLICK" && (item.shopId === shopId || productIds.includes(String(item.productId || "")))).length,
  };
}

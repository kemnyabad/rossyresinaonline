import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { parseOrderMeta } from "@/lib/orderMeta";
import { getPromoWeb20EligibleSubtotal } from "@/lib/promoWeb20Rules";

export type PromoWeb20Config = {
  code: "WEB20";
  active: boolean;
  minimumSubtotal: number;
  discountValue: number;
  startsAt: string;
  endsAt: string;
  maxUses: number;
};

export type PromoWeb20Validation = {
  ok: boolean;
  code: "WEB20";
  discount: number;
  message: string;
  missingAmount?: number;
  config: PromoWeb20Config;
};

const DATA_FILE = path.join(process.cwd(), "data", "promo-web20.json");
const CONFIG_SLUG = "promo-web20-config";

const DEFAULT_CONFIG: PromoWeb20Config = {
  code: "WEB20",
  active: true,
  minimumSubtotal: 100,
  discountValue: 20,
  startsAt: "2026-06-01T00:00:00.000-05:00",
  endsAt: "2026-12-31T23:59:59.000-05:00",
  maxUses: 0,
};

export type PromoProductLike = {
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

const cleanMoney = (value: unknown) => {
  const next = Number(value);
  return Number.isFinite(next) && next > 0 ? Number(next.toFixed(2)) : 0;
};

const normalizeConfig = (raw: Partial<PromoWeb20Config> = {}): PromoWeb20Config => ({
  code: "WEB20",
  active: Boolean(raw.active),
  minimumSubtotal: cleanMoney(raw.minimumSubtotal) || DEFAULT_CONFIG.minimumSubtotal,
  discountValue: cleanMoney(raw.discountValue) || DEFAULT_CONFIG.discountValue,
  startsAt: String(raw.startsAt || DEFAULT_CONFIG.startsAt),
  endsAt: String(raw.endsAt || DEFAULT_CONFIG.endsAt),
  maxUses: Math.max(0, Math.floor(Number(raw.maxUses || 0))),
});

export const readPromoWeb20Config = (): PromoWeb20Config => {
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return normalizeConfig(parsed);
  } catch {
    return { ...DEFAULT_CONFIG };
  }
};

export const getPromoWeb20Config = async (): Promise<PromoWeb20Config> => {
  try {
    const db = prisma as any;
    const post = await db.blogPost.findUnique({
      where: { slug: CONFIG_SLUG },
      select: { content: true },
    });
    if (post?.content && typeof post.content === "object") {
      return normalizeConfig(post.content as Partial<PromoWeb20Config>);
    }
  } catch {
    // Fallback to the bundled default when the database is unavailable.
  }
  return readPromoWeb20Config();
};

export const writePromoWeb20Config = async (config: Partial<PromoWeb20Config>) => {
  const normalized = normalizeConfig(config);
  const db = prisma as any;
  await db.blogPost.upsert({
    where: { slug: CONFIG_SLUG },
    update: {
      title: "Configuracion promocion WEB20",
      excerpt: "Configuracion administrativa de la promocion WEB20",
      content: normalized,
    },
    create: {
      slug: CONFIG_SLUG,
      title: "Configuracion promocion WEB20",
      author: "Sistema",
      date: new Date().toISOString(),
      excerpt: "Configuracion administrativa de la promocion WEB20",
      content: normalized,
      image: "",
    },
  });
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(normalized, null, 2));
  } catch {
    // Vercel's runtime filesystem is not persistent; the database is the source of truth.
  }
  return normalized;
};

export const normalizePromoCode = (code: unknown) => String(code || "").trim().toUpperCase();

export const isPromoWeb20Available = (config = readPromoWeb20Config(), now = new Date()) => {
  if (!config.active) return false;
  const start = new Date(config.startsAt);
  const end = new Date(config.endsAt);
  if (Number.isFinite(+start) && now < start) return false;
  if (Number.isFinite(+end) && now > end) return false;
  return true;
};

export const countPromoWeb20Uses = async () => {
  const db = prisma as any;
  const orders = await db.order.findMany({
    where: { customerNotes: { contains: '"couponCode":"WEB20"' } },
    select: { id: true },
  });
  return orders.length;
};

export const hasCustomerUsedPromoWeb20 = async (email: string) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) return false;
  const db = prisma as any;
  const orders = await db.order.findMany({
    where: { customerEmail: normalizedEmail },
    select: { customerNotes: true },
  });
  return orders.some((order: any) => parseOrderMeta(order.customerNotes).couponCode === "WEB20");
};

export const validatePromoWeb20 = async ({
  code,
  subtotal,
  email,
  items = [],
}: {
  code: unknown;
  subtotal: number;
  email: string;
  items?: PromoProductLike[];
}): Promise<PromoWeb20Validation> => {
  const config = await getPromoWeb20Config();
  const normalizedCode = normalizePromoCode(code);
  const eligibleSubtotal = items.length > 0 ? getPromoWeb20EligibleSubtotal(items) : subtotal;
  const currentSubtotal = cleanMoney(eligibleSubtotal);

  if (normalizedCode !== "WEB20") {
    return { ok: false, code: "WEB20", discount: 0, message: "Cupón inválido.", config };
  }
  if (!isPromoWeb20Available(config)) {
    return { ok: false, code: "WEB20", discount: 0, message: "El cupón WEB20 ya no está disponible.", config };
  }
  if (currentSubtotal < config.minimumSubtotal) {
    const missingAmount = Number((config.minimumSubtotal - currentSubtotal).toFixed(2));
    return {
      ok: false,
      code: "WEB20",
      discount: 0,
      missingAmount,
      message: `Te faltan S/${missingAmount.toFixed(2)} para utilizar el cupón WEB20.`,
      config,
    };
  }
  if (config.maxUses > 0 && (await countPromoWeb20Uses()) >= config.maxUses) {
    return { ok: false, code: "WEB20", discount: 0, message: "El cupón WEB20 ya no está disponible.", config };
  }
  if (await hasCustomerUsedPromoWeb20(email)) {
    return { ok: false, code: "WEB20", discount: 0, message: "Este cupón ya fue utilizado anteriormente.", config };
  }

  const discount = Math.min(config.discountValue, currentSubtotal);
  return {
    ok: true,
    code: "WEB20",
    discount,
    message: `🎉 Cupón WEB20 aplicado correctamente. Ahorraste S/${discount.toFixed(0)}.`,
    config,
  };
};

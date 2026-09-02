import type { ProductProps } from "../../type";

export type CustomerIntent =
  | "starter"
  | "molds"
  | "pigments"
  | "resin"
  | "jewelry"
  | "business"
  | "problem-solving"
  | "offers"
  | "general";

export type CustomerNeed = {
  intent: CustomerIntent;
  budgetMax: number | null;
  level: "beginner" | "intermediate" | "advanced" | "unknown";
  keywords: string[];
};

export type SmartRecommendation = {
  product: ProductProps;
  score: number;
  reason: string;
};

const normalize = (value: any) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const wordsFrom = (value: string) =>
  normalize(value)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3);

const productText = (product: ProductProps) =>
  normalize(
    `${product.title || ""} ${product.category || ""} ${product.brand || ""} ${product.description || ""} ${product.code || ""}`
  );

const hasAny = (text: string, patterns: string[]) => patterns.some((pattern) => text.includes(pattern));

const extractBudget = (text: string): number | null => {
  const normalized = normalize(text).replace(/,/g, ".");
  const matches = Array.from(normalized.matchAll(/(?:s\/|\bsoles?\b|\bhasta\b|\bmenos de\b|\bmaximo\b|\bmax)\s*\.?\s*(\d+(?:\.\d{1,2})?)/g));
  const values = matches
    .map((match) => Number(match[1]))
    .filter((value) => Number.isFinite(value) && value > 0);
  if (values.length > 0) return Math.max(...values);

  const loose = normalized.match(/\b(\d+(?:\.\d{1,2})?)\s*(?:soles|s\/)\b/);
  if (!loose) return null;
  const value = Number(loose[1]);
  return Number.isFinite(value) && value > 0 ? value : null;
};

export function inferCustomerNeed(message: string): CustomerNeed {
  const text = normalize(message);
  let intent: CustomerIntent = "general";

  if (hasAny(text, ["principiante", "empezar", "inicio", "desde cero", "basico", "basica", "kit"])) {
    intent = "starter";
  } else if (hasAny(text, ["molde", "moldes", "silicona"])) {
    intent = "molds";
  } else if (hasAny(text, ["pigmento", "mica", "color", "glitter", "escarcha", "perlado"])) {
    intent = "pigments";
  } else if (hasAny(text, ["resina", "epoxi", "epoxica", "uv", "endurecedor", "catalizador"])) {
    intent = "resin";
  } else if (hasAny(text, ["arete", "dije", "joyeria", "bisuteria", "collar", "pulsera", "llavero", "lapicero"])) {
    intent = "jewelry";
  } else if (hasAny(text, ["emprender", "vender", "negocio", "mayorista", "distribuidora", "ganancia"])) {
    intent = "business";
  } else if (hasAny(text, ["burbuja", "pegajosa", "no cura", "opaca", "amarilla", "fallo", "problema", "error"])) {
    intent = "problem-solving";
  } else if (hasAny(text, ["oferta", "promocion", "promo", "descuento", "barato", "remate"])) {
    intent = "offers";
  }

  const level = hasAny(text, ["principiante", "desde cero", "empezar", "inicio"])
    ? "beginner"
    : hasAny(text, ["avanzado", "experta", "experto"])
    ? "advanced"
    : hasAny(text, ["ya se", "intermedio", "vendo"])
    ? "intermediate"
    : "unknown";

  return {
    intent,
    budgetMax: extractBudget(message),
    level,
    keywords: Array.from(new Set(wordsFrom(message))).slice(0, 12),
  };
}

const intentTerms: Record<CustomerIntent, string[]> = {
  starter: ["kit", "basico", "molde", "llavero", "dije", "resina", "pigmento", "vaso", "mezclador"],
  molds: ["molde", "silicona"],
  pigments: ["pigmento", "mica", "color", "perlado", "glitter", "escarcha"],
  resin: ["resina", "epoxi", "epoxica", "uv", "eco", "crystal", "endurecedor"],
  jewelry: ["dije", "arete", "pendiente", "joyeria", "bisuteria", "collar", "pulsera", "llavero", "lapicero"],
  business: ["lapicero", "llavero", "arete", "dije", "molde", "pack", "kit", "mayorista"],
  "problem-solving": ["vaso", "mezclador", "resina", "pigmento", "molde", "lija", "pulir", "barniz"],
  offers: ["oferta", "descuento", "promo", "remate"],
  general: ["resina", "molde", "pigmento", "accesorio", "kit"],
};

const reasonFor = (product: ProductProps, need: CustomerNeed, score: number): string => {
  const text = productText(product);
  const price = Number(product.price || 0);

  if (need.budgetMax && price <= need.budgetMax) return `encaja con tu presupuesto de hasta S/ ${need.budgetMax.toFixed(0)}`;
  if (need.intent === "starter") return "sirve para practicar sin complicar tu primera pieza";
  if (need.intent === "business") return "es un producto repetible y vendible para emprender";
  if (need.intent === "problem-solving") return "ayuda a corregir el proceso o mejorar el acabado";
  if (need.intent === "offers" || Number(product.oldPrice || 0) > price) return "tiene mejor oportunidad de ahorro";
  if (hasAny(text, ["molde"])) return "te da una forma clara para producir piezas consistentes";
  if (hasAny(text, ["pigmento", "mica", "perlado"])) return "aporta color y acabado a tus piezas";
  if (score > 12) return "coincide bien con lo que estás buscando";
  return "complementa proyectos de resina y artesanía";
};

export function getSmartProductRecommendations(
  products: ProductProps[],
  messageOrNeed: string | CustomerNeed = "",
  limit = 6,
  preferredKeys: string[] = []
): SmartRecommendation[] {
  const need = typeof messageOrNeed === "string" ? inferCustomerNeed(messageOrNeed) : messageOrNeed;
  const preferred = new Set(preferredKeys.map((key) => String(key || "").trim()).filter(Boolean));
  const terms = intentTerms[need.intent] || intentTerms.general;

  return (products || [])
    .map((product) => {
      const text = productText(product);
      const price = Number(product.price || 0);
      const oldPrice = Number(product.oldPrice || 0);
      const stock = Number(product.stock ?? 1);
      let score = 0;

      for (const term of terms) {
        if (text.includes(term)) score += 8;
      }
      for (const keyword of need.keywords) {
        if (text.includes(keyword)) score += keyword.length > 5 ? 4 : 2;
      }
      if (need.budgetMax) {
        if (price > 0 && price <= need.budgetMax) score += 12;
        if (price > need.budgetMax) score -= Math.min(18, (price - need.budgetMax) / 3);
      }
      if (need.level === "beginner" && price > 0 && price <= 25) score += 6;
      if (need.intent === "offers" && oldPrice > price && price > 0) score += 18;
      if (oldPrice > price && price > 0) score += 4;
      if (product.isNew) score += 2;
      if (preferred.has(String(product._id)) || preferred.has(String(product.code || ""))) score += 7;
      if (stock <= 0) score -= 25;
      if (!product.image) score -= 2;

      return { product, score, reason: reasonFor(product, need, score) };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return Number(a.product.price || 0) - Number(b.product.price || 0);
    })
    .slice(0, Math.max(1, limit));
}

export function buildSmartCatalogContext(products: ProductProps[], message: string, limit = 5): string {
  const need = inferCustomerNeed(message);
  const recommendations = getSmartProductRecommendations(products, need, limit);
  if (recommendations.length === 0) return "";

  const budget = need.budgetMax ? ` | presupuesto detectado: hasta S/ ${need.budgetMax.toFixed(0)}` : "";
  const lines = recommendations.map(({ product, reason }) => {
    const stock = Number(product.stock ?? 0);
    const stockText = stock > 0 ? `${stock} disponibles` : "stock por confirmar";
    return `- ${product.title} | ${product.category || "sin categoria"} | S/ ${Number(product.price || 0).toFixed(2)} | ${stockText} | Motivo: ${reason}`;
  });

  return `LECTURA INTELIGENTE DEL CATALOGO:
Intencion detectada: ${need.intent}${budget}. Nivel: ${need.level}.
Productos que Resiny puede recomendar si encajan con la conversacion:
${lines.join("\n")}`;
}

export type WheelPrize =
  | {
      id: string;
      type: "mold";
      icon: string;
      wonLabel: string;
      productId: string;
      productSlug: string;
      productTitle: string;
      productImage: string;
      productPrice: number;
      minSubtotal: number;
      weight: number;
    }
  | {
      id: string;
      type: "discount";
      icon: string;
      wonLabel: string;
      discountValue: number;
      minSubtotal: number;
      weight: number;
      themeImage?: string;
      themeLabel?: string;
    };

export const WHEEL_PRIZES: WheelPrize[] = [
  {
    id: "mold-arbol-vida",
    type: "mold",
    icon: "🎁",
    wonLabel: "¡Ganaste un molde Árbol de Vida de regalo!",
    productId: "cmoghmnzt0000nr4g459zwwea",
    productSlug: "dije-arbol-de-vida",
    productTitle: "Dije arbol de Vida",
    productImage: "https://res.cloudinary.com/dndj6lrqh/image/upload/v1777251191/products/molde_dije_arbol_de_vida_03_1777251191528_724ecf43.jpg",
    productPrice: 5,
    minSubtotal: 30,
    weight: 20,
  },
  {
    id: "mold-corazon-partido",
    type: "mold",
    icon: "💝",
    wonLabel: "¡Ganaste un molde Corazón Partido de regalo!",
    productId: "cmoghxc1n000010x89ij2yhcm",
    productSlug: "corazon-partido",
    productTitle: "Corazón Partido",
    productImage: "https://res.cloudinary.com/dndj6lrqh/image/upload/v1777251886/products/corazon_partido_02_1777251886152_2cf11004.avif",
    productPrice: 10,
    minSubtotal: 30,
    weight: 20,
  },
  {
    id: "mold-luna-estrella",
    type: "mold",
    icon: "🌟",
    wonLabel: "¡Ganaste un molde Luna y Estrella de regalo!",
    productId: "cmoghqdpe000012htr35qyx64",
    productSlug: "luna-y-estrella",
    productTitle: "Luna y Estrella",
    productImage: "https://res.cloudinary.com/dndj6lrqh/image/upload/v1777251576/products/molde_luna_y_estrella_03_1777251576482_021e04fd.avif",
    productPrice: 10,
    minSubtotal: 30,
    weight: 20,
  },
  {
    id: "discount-20",
    type: "discount",
    icon: "🎉",
    wonLabel: "¡Ganaste S/20 de descuento en tu próxima compra!",
    discountValue: 20,
    minSubtotal: 80,
    weight: 30,
  },
  {
    id: "discount-50",
    type: "discount",
    icon: "💎",
    wonLabel: "¡Ganaste S/50 para resina epóxica!",
    discountValue: 50,
    minSubtotal: 150,
    weight: 10,
    themeImage: "https://res.cloudinary.com/dndj6lrqh/image/upload/v1780040633/products/maa6a5w7i5oebmyzopjd.png",
    themeLabel: "Resina epóxica",
  },
];

export const pickWeightedPrize = (): WheelPrize => {
  const totalWeight = WHEEL_PRIZES.reduce((sum, p) => sum + p.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const prize of WHEEL_PRIZES) {
    roll -= prize.weight;
    if (roll <= 0) return prize;
  }
  return WHEEL_PRIZES[WHEEL_PRIZES.length - 1];
};

export const getWheelPrizeById = (id: string): WheelPrize | undefined =>
  WHEEL_PRIZES.find((p) => p.id === id);

export const buildMoldCartPayload = (prize: Extract<WheelPrize, { type: "mold" }>) => ({
  cartKey: `wheel-prize:${prize.productId}`,
  productId: prize.productId,
  _id: prize.productId,
  slug: prize.productSlug,
  brand: "Rossy Resina",
  category: "Moldes de silicona",
  description: "",
  image: prize.productImage,
  isNew: false,
  price: 0,
  oldPrice: prize.productPrice,
  title: prize.productTitle,
  quantity: 1,
});

const STORAGE_KEY = "rr_wheel_prize";
const PRIZE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type StoredWheelPrize = { id: string; wonAt: number };

export const storeWonPrize = (prizeId: string) => {
  if (typeof window === "undefined") return;
  try {
    const record: StoredWheelPrize = { id: prizeId, wonAt: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Almacenamiento no disponible; el premio simplemente no persiste.
  }
};

export const getActiveWonPrize = (): WheelPrize | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const record = JSON.parse(raw) as StoredWheelPrize;
    if (!record?.id || !record?.wonAt) return null;
    if (Date.now() - record.wonAt > PRIZE_TTL_MS) return null;
    return getWheelPrizeById(record.id) || null;
  } catch {
    return null;
  }
};

export const clearWonPrize = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nada que limpiar si el storage no esta disponible.
  }
};

export const computeWheelDiscount = (subtotal: number): number => {
  const prize = getActiveWonPrize();
  if (!prize || prize.type !== "discount") return 0;
  if (subtotal < prize.minSubtotal) return 0;
  return Math.min(prize.discountValue, subtotal);
};

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

type MoldPrize = Extract<WheelPrize, { type: "mold" }>;

/**
 * Pool of eligible mold/accessory prizes (all priced S/5-S/10, so they
 * all share the same S/30 minimum-purchase tier). Each visitor's wheel
 * shows a random 3 of these (see getSessionMoldPrizes), not this whole
 * list, so different people see different products.
 */
const MOLD_PRIZE_POOL: MoldPrize[] = [
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
    id: "mold-dije-trebol",
    type: "mold",
    icon: "🍀",
    wonLabel: "¡Ganaste un molde Dije Trébol de regalo!",
    productId: "cmp5qf8pb0000jj4ybei9380b",
    productSlug: "dije-trebol",
    productTitle: "Dije trebol",
    productImage: "https://res.cloudinary.com/dndj6lrqh/image/upload/v1778777859/products/ChatGPT_Image_May_14__2026__11_46_36_AM_1778777859774_aa6b2f26.png",
    productPrice: 5,
    minSubtotal: 30,
    weight: 20,
  },
  {
    id: "mold-vaso-mezclador",
    type: "mold",
    icon: "🥤",
    wonLabel: "¡Ganaste un Vaso Mezclador de regalo!",
    productId: "cmoi67j3b0000frfvrt8nt7gc",
    productSlug: "vaso-mezclador",
    productTitle: "Vaso mezclador",
    productImage: "https://res.cloudinary.com/dndj6lrqh/image/upload/v1777353098/products/vaso_mezclado_023_1777353098346_fda5e115.avif",
    productPrice: 5,
    minSubtotal: 30,
    weight: 20,
  },
  {
    id: "mold-patita-granulada",
    type: "mold",
    icon: "🐾",
    wonLabel: "¡Ganaste un molde Patita Granulada de regalo!",
    productId: "cmpohtogx0000axl24ifl56p2",
    productSlug: "patita-granulada",
    productTitle: "Patita granulada",
    productImage: "https://res.cloudinary.com/dndj6lrqh/image/upload/v1779911697/products/ChatGPT_Image_May_27__2026__02_53_05_PM_1779911697018_edd2e358.png",
    productPrice: 7,
    minSubtotal: 30,
    weight: 20,
  },
  {
    id: "mold-camiseta-medico",
    type: "mold",
    icon: "🩺",
    wonLabel: "¡Ganaste un molde Camiseta Médico de regalo!",
    productId: "cmnxqwx0g0004fvucq7smc8eh",
    productSlug: "camiseta-medico",
    productTitle: "Camiseta medico",
    productImage: "https://res.cloudinary.com/dndj6lrqh/image/upload/v1776118163/products/molde_camiseta_medico_005_1776118163298_3e701a4a.avif",
    productPrice: 8,
    minSubtotal: 30,
    weight: 20,
  },
  {
    id: "mold-zapato-quinceanos",
    type: "mold",
    icon: "👠",
    wonLabel: "¡Ganaste un molde Zapato de Quinceaños de regalo!",
    productId: "cmq3ee83p0003be6ne6i59ea6",
    productSlug: "zapato-de-quinceanos",
    productTitle: "Molde Zapato de Quinceaños para Resina",
    productImage: "https://res.cloudinary.com/dndj6lrqh/image/upload/v1780813468/products/yjdd2ibi3rk3jmubzjdn.png",
    productPrice: 8,
    minSubtotal: 30,
    weight: 20,
  },
  {
    id: "mold-corazon-labrado",
    type: "mold",
    icon: "❤️",
    wonLabel: "¡Ganaste un molde Corazón Labrado de regalo!",
    productId: "cmnyxln570006p64vp6zxytpb",
    productSlug: "corazon-labrado",
    productTitle: "Corazón Labrado",
    productImage: "https://res.cloudinary.com/dndj6lrqh/image/upload/v1776189806/products/molde_labrado_05_1776189806924_dfb45467.webp",
    productPrice: 10,
    minSubtotal: 30,
    weight: 20,
  },
  {
    id: "mold-dijes-gatito",
    type: "mold",
    icon: "🐱",
    wonLabel: "¡Ganaste un molde Dijes Gatito de regalo!",
    productId: "cmoim7nvp0000wggjmxwa002s",
    productSlug: "dijes-gatito",
    productTitle: "Dijes Gatito",
    productImage: "https://res.cloudinary.com/dndj6lrqh/image/upload/v1777380056/products/molde_gatito_07_1777380056858_26b2e773.avif",
    productPrice: 10,
    minSubtotal: 30,
    weight: 20,
  },
];

const DISCOUNT_PRIZES: WheelPrize[] = [
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

/** Every prize that could ever be won, across every visitor - used to resolve a won prize by id. */
export const WHEEL_PRIZES: WheelPrize[] = [...MOLD_PRIZE_POOL, ...DISCOUNT_PRIZES];

const MOLD_SELECTION_COUNT = 3;
const MOLD_SELECTION_KEY = "rr_wheel_mold_selection";

const shuffle = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/** The 3 mold prizes shown on THIS visitor's wheel, picked once per browser and kept stable. */
export const getSessionMoldPrizes = (): MoldPrize[] => {
  if (typeof window === "undefined") {
    return MOLD_PRIZE_POOL.slice(0, MOLD_SELECTION_COUNT);
  }
  try {
    const raw = window.localStorage.getItem(MOLD_SELECTION_KEY);
    if (raw) {
      const ids = JSON.parse(raw) as string[];
      const selected = ids
        .map((id) => MOLD_PRIZE_POOL.find((p) => p.id === id))
        .filter((p): p is MoldPrize => Boolean(p));
      if (selected.length === MOLD_SELECTION_COUNT) return selected;
    }
  } catch {
    // Almacenamiento invalido; se genera una nueva seleccion abajo.
  }
  const selected = shuffle(MOLD_PRIZE_POOL).slice(0, MOLD_SELECTION_COUNT);
  try {
    window.localStorage.setItem(MOLD_SELECTION_KEY, JSON.stringify(selected.map((p) => p.id)));
  } catch {
    // Si no se puede guardar, simplemente se re-sortea en la siguiente carga.
  }
  return selected;
};

/** The 5 prizes to render on THIS visitor's wheel: their 3 molds + the 2 fixed discounts. */
export const getSessionWheelPrizes = (): WheelPrize[] => [...getSessionMoldPrizes(), ...DISCOUNT_PRIZES];

export const pickWeightedPrize = (prizes: WheelPrize[]): WheelPrize => {
  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const prize of prizes) {
    roll -= prize.weight;
    if (roll <= 0) return prize;
  }
  return prizes[prizes.length - 1];
};

export const getWheelPrizeById = (id: string): WheelPrize | undefined =>
  WHEEL_PRIZES.find((p) => p.id === id);

export const buildMoldCartPayload = (prize: MoldPrize) => ({
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

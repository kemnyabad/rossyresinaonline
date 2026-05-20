import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { ProductProps } from "../../type";
import { getAllProducts } from "@/lib/repositories/productRepository";
import {
  normalizeImageUrl,
  isPlaceholderImage,
  pickDisplayImage,
} from "@/lib/productMetricsClient";

interface Props {
  products: ProductProps[];
}

type WholesaleUser = {
  id: string;
  name: string;
  business: string;
  phone: string;
  city: string;
  channel: string;
  volume: string;
  status?: string;
};

type WholesaleCartItem = {
  productId: string;
  quantity: number;
  addedAt: string;
};

const contactPhone = "51966357648";
const wholesaleSessionStorageKey = "rr_wholesale_session";
const wholesaleCartStoragePrefix = "rr_wholesale_cart";

const fmt = (value: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(value);

const normalizeText = (value: any) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const escapeHtml = (value: any) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const productSearchText = (product: ProductProps) =>
  normalizeText(`${product.title || ""} ${product.category || ""} ${product.brand || ""} ${product.code || ""}`);

const detectGroup = (product: ProductProps) => {
  const text = productSearchText(product);
  if (/resina|epoxi|epoxica|uv|pigmento|mica|colorante/.test(text)) return "Resina";
  if (/accesorio|dije|arete|pendiente|llavero|lapicero|gancho|anillo|porta/.test(text)) return "Accesorios";
  return "Moldes";
};

const wholesalePrice = (product: ProductProps, tier: "small" | "large") => {
  const explicit = tier === "small" ? Number(product.priceBulk3 || 0) : Number(product.priceBulk12 || 0);
  if (explicit > 0) return explicit;
  const base = Number(product.price || 0);
  const discount = tier === "small" ? 0.85 : 0.75;
  return Math.max(0, Math.round(base * discount * 100) / 100);
};

const whatsappHref = (product?: ProductProps) => {
  const text = product
    ? `Hola Rossy, quiero precio mayorista para: ${product.title}`
    : "Hola Rossy, quiero informacion para convertirme en distribuidora resinera y comprar productos a precio mayorista.";
  return `https://wa.me/${contactPhone}?text=${encodeURIComponent(text)}`;
};

const departments = [
  "Moldes",
  "Resina",
  "Pigmentos",
  "Accesorios",
  "Dijes",
  "Llaveros",
  "Lapiceros",
  "Ofertas",
  "Stock",
  "Pedidos",
];

function ProductRow({ product }: { product: ProductProps }) {
  const image = pickDisplayImage(product.image, product.images);
  const title = product.title || "Producto";
  const base = Number(product.price || 0);
  const small = wholesalePrice(product, "small");
  const large = wholesalePrice(product, "large");
  const stock = Number(product.stock || 0);

  return (
    <tr className="align-top odd:bg-white even:bg-[#f7fbff] hover:bg-[#fff7cc]">
      <td className="border border-[#9fb6d8] p-2">
        <div className="flex gap-2">
          <div className="relative h-[54px] w-[54px] shrink-0 border border-[#9fb6d8] bg-white">
            {isPlaceholderImage(image) ? (
              <span className="absolute inset-0 flex items-center justify-center text-center text-[9px] font-bold text-[#666]">
                Sin foto
              </span>
            ) : (
              <Image src={normalizeImageUrl(image)} alt={title} fill sizes="54px" className="object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[13px] font-bold leading-tight text-[#003f99] underline">
              {title}
            </span>
            <p className="mt-1 text-[11px] leading-tight text-[#333]">
              {product.category || detectGroup(product)}
              {product.code ? ` | Cod. ${product.code}` : ""}
            </p>
          </div>
        </div>
      </td>
      <td className="border border-[#9fb6d8] p-2 text-right text-[13px] font-bold text-[#222]">{fmt(base)}</td>
      <td className="border border-[#9fb6d8] bg-[#fffdf0] p-2 text-right text-[13px] font-bold text-[#c2188d]">{fmt(small)}</td>
      <td className="border border-[#9fb6d8] bg-[#fffdf0] p-2 text-right text-[13px] font-bold text-[#c2188d]">{fmt(large)}</td>
      <td className="border border-[#9fb6d8] p-2 text-center text-[12px] font-bold text-[#222]">
        {stock > 0 ? stock : "Cons."}
      </td>
      <td className="border border-[#9fb6d8] p-2 text-center">
        <a
          href={whatsappHref(product)}
          target="_blank"
          rel="noreferrer"
          className="inline-block border border-[#003f99] bg-[#0054c7] px-2 py-1 text-[11px] font-bold text-white hover:bg-[#003f99]"
        >
          Cotizar
        </a>
      </td>
    </tr>
  );
}

function RetroProductCard({
  product,
  onOpen,
}: {
  product: ProductProps;
  onOpen: (product: ProductProps) => void;
}) {
  const image = pickDisplayImage(product.image, product.images);
  const title = product.title || "Producto";
  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={() => onOpen(product)}
        className="relative mb-2 block h-[86px] w-full bg-white"
      >
        {isPlaceholderImage(image) ? (
          <span className="absolute inset-0 flex items-center justify-center text-center text-[10px] font-bold text-[#666]">
            Sin foto
          </span>
        ) : (
          <Image
            src={normalizeImageUrl(image)}
            alt={title}
            fill
            sizes="150px"
            className="object-contain"
          />
        )}
      </button>
      <button
        type="button"
        onClick={() => onOpen(product)}
        className="block text-left text-[13px] font-bold leading-[14px] text-[#003f99] underline"
      >
        {title}
      </button>
      <p className="mt-0.5 text-[12px] leading-[14px] text-[#222]">
        Mayorista desde
      </p>
      <p className="text-[15px] font-black leading-[16px] text-[#e00000]">
        {fmt(wholesalePrice(product, "large"))}
      </p>
    </div>
  );
}

function RetroProductSection({
  title,
  products,
  onOpen,
}: {
  title: string;
  products: ProductProps[];
  onOpen: (product: ProductProps) => void;
}) {
  if (products.length === 0) return null;
  return (
    <section className="mt-4">
      <h2 className="bg-[#003f99] px-2 py-1 text-[16px] font-bold leading-none text-white">{title}</h2>
      <div className="grid grid-cols-3 gap-x-5 gap-y-4 px-3 py-3">
        {products.slice(0, 3).map((product) => (
          <RetroProductCard key={product._id} product={product} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

export default function MayoristasPage({ products }: Props) {
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("Todos");
  const [showRegister, setShowRegister] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showWholesaleCart, setShowWholesaleCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductProps | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWholesaleLoggedIn, setIsWholesaleLoggedIn] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [authTransitionProgress, setAuthTransitionProgress] = useState(0);
  const [authTransitionDetail, setAuthTransitionDetail] = useState("");
  const [currentWholesaleUser, setCurrentWholesaleUser] = useState<WholesaleUser | null>(null);
  const [wholesaleToken, setWholesaleToken] = useState("");
  const [cartItems, setCartItems] = useState<WholesaleCartItem[]>([]);
  const [hasWholesaleRegistration, setHasWholesaleRegistration] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginForm, setLoginForm] = useState({
    user: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    business: "",
    phone: "",
    city: "",
    channel: "",
    volume: "Desde 3 unidades",
    password: "",
  });

  const groups = useMemo(() => ["Todos", "Moldes", "Resina", "Accesorios"], []);

  const filteredProducts = useMemo(() => {
    const q = normalizeText(query);
    return products
      .filter((product) => activeGroup === "Todos" || detectGroup(product) === activeGroup)
      .filter((product) => !q || productSearchText(product).includes(q))
      .slice(0, 120);
  }, [activeGroup, products, query]);

  const stats = useMemo(() => {
    const prices = products.map((p) => Number(p.price || 0)).filter((n) => n > 0);
    const avg = prices.length ? prices.reduce((sum, n) => sum + n, 0) / prices.length : 0;
    return {
      total: products.length,
      stock: products.reduce((sum, p) => sum + Number(p.stock || 0), 0),
      avg,
      moldes: products.filter((p) => detectGroup(p) === "Moldes").length,
    };
  }, [products]);
  const sectionProducts = useMemo(
    () => ({
      trends: filteredProducts.slice(0, 3),
      popular: filteredProducts.slice(3, 6),
      values: filteredProducts.slice(6, 9),
      stores: filteredProducts.slice(9, 12),
    }),
    [filteredProducts]
  );
  const productMap = useMemo(() => {
    const map = new Map<string, ProductProps>();
    products.forEach((product) => {
      map.set(String(product._id), product);
    });
    return map;
  }, [products]);

  const cartStorageKey = currentWholesaleUser
    ? `${wholesaleCartStoragePrefix}_${currentWholesaleUser.id}`
    : "";

  const pricedCartItems = useMemo(() => {
    return cartItems
      .map((item) => {
        const product = productMap.get(item.productId);
        if (!product) return null;
        const quantity = Math.max(1, Math.floor(Number(item.quantity || 1)));
        const tier = quantity >= 12 ? "large" : quantity >= 6 ? "small" : "normal";
        const unitPrice =
          tier === "large"
            ? wholesalePrice(product, "large")
            : tier === "small"
            ? wholesalePrice(product, "small")
            : Number(product.price || 0);
        const lineTotal = Math.round(unitPrice * quantity * 100) / 100;
        return { ...item, product, quantity, tier, unitPrice, lineTotal };
      })
      .filter(Boolean) as Array<
        WholesaleCartItem & {
          product: ProductProps;
          quantity: number;
          tier: "normal" | "small" | "large";
          unitPrice: number;
          lineTotal: number;
        }
      >;
  }, [cartItems, productMap]);

  const cartSummary = useMemo(() => {
    const subtotal = pricedCartItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const units = pricedCartItems.reduce((sum, item) => sum + item.quantity, 0);
    const normalTotal = pricedCartItems.reduce(
      (sum, item) => sum + Number(item.product.price || 0) * item.quantity,
      0
    );
    const savings = Math.max(0, normalTotal - subtotal);
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      units,
      savings: Math.round(savings * 100) / 100,
      count: pricedCartItems.length,
    };
  }, [pricedCartItems]);

  const cartInsights = useMemo(() => {
    const insights: string[] = [];
    pricedCartItems.forEach((item) => {
      if (item.quantity < 6) {
        insights.push(`${item.product.title}: sube a media docena para activar precio mayorista inicial.`);
      } else if (item.quantity >= 6 && item.quantity < 12) {
        insights.push(`${item.product.title}: con ${12 - item.quantity} unidad(es) mas llegas al nivel distribuidora.`);
      }
      const stock = Number(item.product.stock || 0);
      if (stock > 0 && item.quantity > stock) {
        insights.push(`${item.product.title}: estas solicitando mas que el stock registrado (${stock}).`);
      }
    });
    const hasMold = pricedCartItems.some((item) => detectGroup(item.product) === "Moldes");
    const hasResin = pricedCartItems.some((item) => detectGroup(item.product) === "Resina");
    const hasAccessories = pricedCartItems.some((item) => detectGroup(item.product) === "Accesorios");
    if (hasMold && !hasResin) insights.push("Tu pedido tiene moldes. Considera agregar resina para vender kits completos.");
    if ((hasMold || hasResin) && !hasAccessories) insights.push("Agrega accesorios para aumentar el ticket promedio de reventa.");
    if (cartSummary.units >= 12) insights.push("Tu pedido ya califica para analizar paquetes de docena en productos seleccionados.");
    if (insights.length === 0 && pricedCartItems.length > 0) insights.push("Tu carrito esta equilibrado para preparar una cotizacion mayorista.");
    return insights.slice(0, 5);
  }, [cartSummary.units, pricedCartItems]);

  const openCartDetailWindow = () => {
    const rows = pricedCartItems
      .map((item) => {
        const tier =
          item.tier === "large"
            ? "Nivel docena"
            : item.tier === "small"
            ? "Nivel media docena"
            : "Precio publico sugerido";
        return `
          <tr>
            <td><strong>${escapeHtml(item.product.title)}</strong><br><span>${escapeHtml(tier)}</span></td>
            <td class="center">${item.quantity}</td>
            <td class="right">${escapeHtml(fmt(item.unitPrice))}</td>
            <td class="right strong">${escapeHtml(fmt(item.lineTotal))}</td>
          </tr>
        `;
      })
      .join("");
    const insights = cartInsights.map((insight) => `<li>${escapeHtml(insight)}</li>`).join("");
    const userName = currentWholesaleUser?.name || "Cuenta mayorista";
    const business = currentWholesaleUser?.business ? ` | ${currentWholesaleUser.business}` : "";
    const detailWindow = window.open("", "rossyMayoristaDetalle", "width=780,height=680,left=120,top=80,resizable=yes,scrollbars=yes");
    if (!detailWindow) return;
    detailWindow.document.open();
    detailWindow.document.write(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Detalle pedido mayorista</title>
          <style>
            body { margin: 0; background: #fff; color: #111; font-family: Roboto, Arial, Helvetica, sans-serif; font-size: 13px; }
            button { cursor: pointer; }
            .toolbar { align-items: center; background: #f1f3f4; border-bottom: 1px solid #c7c7c7; display: flex; justify-content: flex-end; padding: 6px 8px; position: sticky; top: 0; z-index: 2; }
            .header { align-items: center; background: #003f99; color: white; display: flex; justify-content: space-between; padding: 10px 14px; }
            .header h1 { margin: 0; font-size: 20px; }
            .print-button { align-items: center; background: #fff; border: 1px solid #777; color: #003f99; display: inline-flex; height: 30px; justify-content: center; width: 34px; }
            .print-button:hover { background: #dbe9ff; border-color: #003f99; }
            .print-button svg { display: block; height: 19px; width: 19px; }
            .content { padding: 14px; }
            .grid { display: grid; grid-template-columns: 1fr 230px; gap: 14px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #9fb6d8; padding: 8px; vertical-align: top; }
            th { background: #dbe9ff; color: #003f99; text-align: left; }
            .center { text-align: center; } .right { text-align: right; } .strong { font-weight: 700; }
            .box { border: 1px solid #9fb6d8; background: #eef6ff; }
            .box h2 { margin: 0; background: #dbe9ff; color: #003f99; font-size: 16px; text-align: center; padding: 7px; }
            .box div { padding: 10px; }
            .insights { margin-top: 14px; border: 1px solid #ff9d00; background: #fff8e6; }
            .insights h2 { margin: 0; background: #ffcc66; font-size: 14px; padding: 7px; }
            .insights ul { margin: 0; padding: 10px 12px 10px 28px; }
            @media print {
              .toolbar { display: none; }
              .grid { display: block; }
              .box { margin-top: 14px; }
            }
          </style>
        </head>
        <body>
          <div class="toolbar">
            <button class="print-button" onclick="window.print()" aria-label="Imprimir pedido" title="Imprimir pedido">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 9V3h12v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 14h12v7H6z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                <path d="M17 12h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="header">
            <h1>Detalle inteligente del pedido mayorista</h1>
          </div>
          <div class="content">
            <div class="grid">
              <main>
                <p><strong>Mayorista:</strong> ${escapeHtml(userName + business)}</p>
                <table>
                  <thead>
                    <tr><th>Producto</th><th class="center">Unid.</th><th class="right">Precio</th><th class="right">Total</th></tr>
                  </thead>
                  <tbody>${rows}</tbody>
                </table>
                <section class="insights">
                  <h2>Lectura del sistema</h2>
                  <ul>${insights}</ul>
                </section>
              </main>
              <aside class="box">
                <h2>Resumen</h2>
                <div>
                  <p>Productos: <strong>${cartSummary.count}</strong></p>
                  <p>Unidades: <strong>${cartSummary.units}</strong></p>
                  <p>Precio total: <strong>${escapeHtml(fmt(cartSummary.subtotal))}</strong></p>
                  <p>Ahorro estimado: <strong>${escapeHtml(fmt(cartSummary.savings))}</strong></p>
                </div>
              </aside>
            </div>
          </div>
        </body>
      </html>`);
    detailWindow.document.close();
    detailWindow.focus();
  };

  useEffect(() => {
    const token = String(localStorage.getItem(wholesaleSessionStorageKey) || "");
    if (!token) return;
    fetch("/api/wholesale/session", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Sesion invalida");
        return res.json();
      })
      .then((data) => {
        setWholesaleToken(String(data.token || token));
        setCurrentWholesaleUser(data.user as WholesaleUser);
        setIsWholesaleLoggedIn(true);
        setHasWholesaleRegistration(true);
      })
      .catch(() => {
        localStorage.removeItem(wholesaleSessionStorageKey);
      });
  }, []);

  useEffect(() => {
    if (!cartStorageKey) {
      setCartItems([]);
      return;
    }
    try {
      const stored = JSON.parse(localStorage.getItem(cartStorageKey) || "[]");
      setCartItems(
        Array.isArray(stored)
          ? stored
              .map((item) => ({
                productId: String(item?.productId || ""),
                quantity: Math.max(1, Math.floor(Number(item?.quantity || 1))),
                addedAt: String(item?.addedAt || new Date().toISOString()),
              }))
              .filter((item) => item.productId)
          : []
      );
    } catch {
      setCartItems([]);
    }
  }, [cartStorageKey]);

  useEffect(() => {
    if (!cartStorageKey) return;
    try {
      localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
    } catch {}
  }, [cartItems, cartStorageKey]);

  const submitRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRegisterError("");
    const phoneKey = registerForm.phone.replace(/\D/g, "");
    if (!registerForm.name.trim() || !phoneKey || !registerForm.password.trim()) {
      setRegisterError("Completa nombre, WhatsApp y clave mayorista.");
      return;
    }
    setIsLoggingIn(true);
    setAuthTransitionProgress(8);
    setAuthTransitionDetail("Creando tu usuario mayorista...");
    try {
      const res = await fetch("/api/wholesale/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });
      setAuthTransitionProgress(45);
      setAuthTransitionDetail("Guardando tu perfil de distribuidora...");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(String(data?.error || "No se pudo registrar"));
      setAuthTransitionProgress(76);
      setAuthTransitionDetail("Activando tu tienda mayorista...");
      localStorage.setItem(wholesaleSessionStorageKey, String(data.token || ""));
      await new Promise((resolve) => window.setTimeout(resolve, 550));
      setAuthTransitionProgress(100);
      setAuthTransitionDetail("Cuenta mayorista creada correctamente.");
      await new Promise((resolve) => window.setTimeout(resolve, 550));
      setWholesaleToken(String(data.token || ""));
      setCurrentWholesaleUser(data.user as WholesaleUser);
      setIsWholesaleLoggedIn(true);
      setHasWholesaleRegistration(true);
      setShowRegister(false);
      setShowWholesaleCart(false);
      setShowAccount(false);
      setSelectedProduct(null);
    } catch (error: any) {
      setRegisterError(String(error?.message || "No se pudo registrar"));
    } finally {
      setIsLoggingIn(false);
      setAuthTransitionProgress(0);
      setAuthTransitionDetail("");
    }
  };

  const submitWholesaleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");
    if (!loginForm.user.trim() || !loginForm.password.trim()) {
      setLoginError("Ingresa tu WhatsApp/correo y clave mayorista.");
      return;
    }
    setIsLoggingIn(true);
    setAuthTransitionProgress(8);
    setAuthTransitionDetail("Buscando tu cuenta mayorista...");
    try {
      const res = await fetch("/api/wholesale/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      setAuthTransitionProgress(42);
      setAuthTransitionDetail("Validando tu acceso mayorista...");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(String(data?.error || "Acceso mayorista invalido"));
      localStorage.setItem(wholesaleSessionStorageKey, String(data.token || ""));
      await fetch("/api/wholesale/session", {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      setAuthTransitionProgress(78);
      setAuthTransitionDetail("Preparando tu tienda mayorista...");
      await new Promise((resolve) => window.setTimeout(resolve, 650));
      setAuthTransitionProgress(100);
      setAuthTransitionDetail("Listo. Bienvenida a tu cuenta mayorista.");
      await new Promise((resolve) => window.setTimeout(resolve, 650));
      setWholesaleToken(String(data.token || ""));
      setCurrentWholesaleUser(data.user as WholesaleUser);
      setHasWholesaleRegistration(true);
      setIsWholesaleLoggedIn(true);
      setShowAccount(false);
      setShowWholesaleCart(false);
      setSelectedProduct(null);
    } catch (error: any) {
      setLoginError(String(error?.message || "No se pudo validar el acceso mayorista."));
    } finally {
      setIsLoggingIn(false);
      setAuthTransitionProgress(0);
      setAuthTransitionDetail("");
    }
  };
  const canUseWholesaleCart = isWholesaleLoggedIn && !!currentWholesaleUser;
  const wholesaleDisplayName = useMemo(() => {
    const parts = String(currentWholesaleUser?.name || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    const first = parts[0];
    const initial = parts[1] ? `${parts[1][0].toUpperCase()}.` : "";
    return [first, initial].filter(Boolean).join(" ");
  }, [currentWholesaleUser?.name]);
  const closeWholesaleSession = () => {
    setIsLoggingOut(true);
    setAuthTransitionProgress(10);
    setAuthTransitionDetail("Guardando el estado de tu tienda mayorista...");
    window.setTimeout(() => {
      setAuthTransitionProgress(45);
      setAuthTransitionDetail("Cerrando acceso privado...");
    }, 550);
    window.setTimeout(() => {
      setAuthTransitionProgress(82);
      setAuthTransitionDetail("Limpiando tu sesion de este navegador...");
    }, 1250);
    window.setTimeout(() => {
      setAuthTransitionProgress(100);
      setAuthTransitionDetail("Sesion cerrada correctamente.");
    }, 1900);
    window.setTimeout(() => {
      fetch("/api/wholesale/session", {
        method: "DELETE",
        headers: wholesaleToken ? { Authorization: `Bearer ${wholesaleToken}` } : undefined,
      }).catch(() => {});
      try {
        localStorage.removeItem(wholesaleSessionStorageKey);
      } catch {}
      setIsWholesaleLoggedIn(false);
      setCurrentWholesaleUser(null);
      setWholesaleToken("");
      setHasWholesaleRegistration(false);
      setShowWholesaleCart(false);
      setShowAccount(false);
      setShowRegister(false);
      setSelectedProduct(null);
      setIsLoggingOut(false);
      setAuthTransitionProgress(0);
      setAuthTransitionDetail("");
    }, 2500);
  };
  const openWholesaleProduct = (product: ProductProps) => {
    setSelectedProduct(product);
    setSelectedImageIndex(0);
    setShowRegister(false);
    setShowAccount(false);
    setShowWholesaleCart(false);
  };
  const addToWholesaleCart = (product: ProductProps, quantity = 6) => {
    if (!canUseWholesaleCart) {
      setShowAccount(true);
      setSelectedProduct(null);
      return;
    }
    const productId = String(product._id);
    const safeQuantity = Math.max(1, Math.floor(Number(quantity || 1)));
    setCartItems((items) => {
      const existing = items.find((item) => item.productId === productId);
      if (existing) {
        return items.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + safeQuantity }
            : item
        );
      }
      return [...items, { productId, quantity: safeQuantity, addedAt: new Date().toISOString() }];
    });
    setShowWholesaleCart(true);
    setSelectedProduct(null);
  };
  const updateCartQuantity = (productId: string, quantity: number) => {
    const safeQuantity = Math.max(1, Math.floor(Number(quantity || 1)));
    setCartItems((items) =>
      items.map((item) => (item.productId === productId ? { ...item, quantity: safeQuantity } : item))
    );
  };
  const removeCartItem = (productId: string) => {
    setCartItems((items) => items.filter((item) => item.productId !== productId));
  };
  const selectedGallery = useMemo(() => {
    if (!selectedProduct) return [];
    const main = pickDisplayImage(selectedProduct.image, selectedProduct.images);
    const gallery = Array.isArray(selectedProduct.images)
      ? selectedProduct.images.map((item) => String(item || "").trim()).filter(Boolean)
      : [];
    return Array.from(new Set([main, ...gallery].filter(Boolean)));
  }, [selectedProduct]);
  const selectedImage = selectedGallery[selectedImageIndex] || selectedGallery[0] || "";
  const moveSelectedImage = (direction: -1 | 1) => {
    if (selectedGallery.length <= 1) return;
    setSelectedImageIndex((current) => (current + direction + selectedGallery.length) % selectedGallery.length);
  };
  const selectedPackageOptions = useMemo(() => {
    if (!selectedProduct) return [];
    return [
      {
        key: "half-dozen",
        label: "Media docena",
        units: 6,
      },
      {
        key: "dozen",
        label: "Docena",
        units: 12,
      },
    ].map((option) => ({
      ...option,
      disabled: false,
    }));
  }, [selectedProduct]);

  return (
    <>
      <Head>
        <title>Rossy Resina Mayorista | Lista de precios</title>
        <meta name="description" content="Lista mayorista de moldes, resina y accesorios para distribuidoras resineras." />
      </Head>

      {(isLoggingIn || isLoggingOut) && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white text-center [font-family:Arial,Helvetica,sans-serif]">
          <div>
            <p className="text-[24px] font-black uppercase text-[#003f99]">
              {isLoggingIn ? "Ingresando a tu usuario mayorista" : "Saliendo de tu usuario mayorista"}
            </p>
            <p className="mt-2 text-[13px] font-bold text-[#c2188d]">
              {authTransitionDetail}
            </p>
            <div className="mx-auto mt-4 h-4 w-[320px] overflow-hidden border border-[#003f99] bg-white">
              <div
                className="h-full bg-[#0054c7] transition-all duration-700 ease-out"
                style={{ width: `${authTransitionProgress}%` }}
              />
            </div>
            <p className="mt-2 text-[12px] font-bold text-[#003f99]">{authTransitionProgress}%</p>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-white text-[#202124] [font-family:Roboto,Arial,Helvetica,sans-serif]">
        <div className="mx-auto w-[960px] max-w-full bg-white px-2 py-3">
          <header className="mb-2">
            <div className="flex items-start justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowRegister(false);
                  setShowAccount(false);
                  setShowWholesaleCart(false);
                  setSelectedProduct(null);
                  setActiveGroup("Todos");
                  setQuery("");
                }}
                className="flex items-center gap-3 text-left"
              >
                <div className="relative h-[62px] w-[62px] shrink-0 overflow-hidden rounded-full border border-[#d9b6d1] bg-white">
                  <Image
                    src="/favicon-96x96.png"
                    alt="Rossy Resina"
                    fill
                    sizes="62px"
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className="text-[32px] font-black leading-none tracking-tight text-[#003f99]">
                    ROSSY<span className="text-[#c2188d]">RESINA</span>
                  </div>
                  <div className="mt-0.5 text-[11px] font-bold uppercase text-[#003f99]">
                    Bienvenida a nuestra tienda mayorista
                  </div>
                </div>
              </button>
              <div className="pt-2 text-right text-[11px] leading-5">
                {canUseWholesaleCart ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowWholesaleCart(true);
                        setShowRegister(false);
                        setShowAccount(false);
                        setSelectedProduct(null);
                      }}
                      className="text-[#003f99] underline"
                    >
                      Mi carrito
                      {cartSummary.count > 0 ? ` (${cartSummary.count})` : ""}
                    </button>
                    <span className="mx-2 text-[#777]">|</span>
                    <button
                      type="button"
                      onClick={closeWholesaleSession}
                      className="text-[#003f99] underline"
                    >
                      Cerrar sesion
                    </button>
                    {wholesaleDisplayName && (
                      <p className="mt-1 text-[12px] font-bold text-[#003f99]">
                        {`Bienvenido mayorista ${wholesaleDisplayName}`.toUpperCase()}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRegister(true);
                        setShowAccount(false);
                        setShowWholesaleCart(false);
                        setSelectedProduct(null);
                      }}
                      className="text-[#003f99] underline"
                    >
                      Registrate
                    </button>
                    <span className="mx-2 text-[#777]">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAccount(true);
                        setShowRegister(false);
                        setShowWholesaleCart(false);
                        setSelectedProduct(null);
                      }}
                      className="text-[#003f99] underline"
                    >
                      Mi cuenta
                    </button>
                  </>
                )}
              </div>
            </div>

            <nav className="mt-3 flex flex-wrap border-b-2 border-[#003f99]">
              {departments.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveGroup(["Moldes", "Resina", "Accesorios"].includes(item) ? item : "Todos")}
                  className="mr-[1px] rounded-t border border-[#003f99] bg-[#0054c7] px-3 py-1 text-[12px] font-bold text-white hover:bg-[#003f99]"
                >
                  {item}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2 border-b border-[#9fb6d8] bg-[#e8eef6] px-2 py-1 text-[13px]">
              <span className="font-bold">Buscar</span>
              <select
                value={activeGroup}
                onChange={(event) => setActiveGroup(event.target.value)}
                className="h-6 border border-[#777] bg-white text-[12px]"
              >
                {groups.map((group) => (
                  <option key={group} value={group}>{group === "Todos" ? "Entire Site" : group}</option>
                ))}
              </select>
              <span>por:</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-6 w-[260px] border border-[#777] px-1 text-[12px]"
              />
              <button className="h-6 border border-[#003f99] bg-white px-2 text-[12px] font-bold text-[#003f99]">
                Buscar
              </button>
            </div>
          </header>

          {showRegister && (
            <section className="border border-[#003f99] bg-[#ffffcc] text-[12px]">
              <div className="flex items-center justify-between bg-[#003f99] px-3 py-2 text-white">
                <h1 className="text-[18px] font-bold leading-none text-white">Registro Mayorista Rossy Resina</h1>
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className="border border-white bg-white px-2 py-0.5 text-[11px] font-bold text-[#003f99]"
                >
                  Volver al catalogo
                </button>
              </div>

              <div className="grid gap-4 p-4 md:grid-cols-[1fr_280px]">
                <form onSubmit={submitRegister} className="p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="grid gap-1">
                      <span className="font-bold text-[#003f99]">Nombre completo</span>
                      <input
                        value={registerForm.name}
                        onChange={(event) => setRegisterForm({ ...registerForm, name: event.target.value })}
                        className="h-8 border border-[#777] bg-white px-2"
                        required
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="font-bold text-[#003f99]">Negocio o marca</span>
                      <input
                        value={registerForm.business}
                        onChange={(event) => setRegisterForm({ ...registerForm, business: event.target.value })}
                        className="h-8 border border-[#777] bg-white px-2"
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="font-bold text-[#003f99]">WhatsApp</span>
                      <input
                        value={registerForm.phone}
                        onChange={(event) => setRegisterForm({ ...registerForm, phone: event.target.value })}
                        className="h-8 border border-[#777] bg-white px-2"
                        required
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="font-bold text-[#003f99]">Clave mayorista</span>
                      <input
                        type="password"
                        value={registerForm.password}
                        onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
                        className="h-8 border border-[#777] bg-white px-2"
                        required
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="font-bold text-[#003f99]">Ciudad / distrito</span>
                      <input
                        value={registerForm.city}
                        onChange={(event) => setRegisterForm({ ...registerForm, city: event.target.value })}
                        className="h-8 border border-[#777] bg-white px-2"
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="font-bold text-[#003f99]">Donde venderas?</span>
                      <select
                        value={registerForm.channel}
                        onChange={(event) => setRegisterForm({ ...registerForm, channel: event.target.value })}
                        className="h-8 border border-[#777] bg-white px-2"
                      >
                        <option value="">Seleccionar</option>
                        <option value="Tienda fisica">Tienda fisica</option>
                        <option value="Redes sociales">Redes sociales</option>
                        <option value="Ferias / talleres">Ferias / talleres</option>
                        <option value="Pedidos por WhatsApp">Pedidos por WhatsApp</option>
                      </select>
                    </label>
                    <label className="grid gap-1">
                      <span className="font-bold text-[#003f99]">Volumen inicial</span>
                      <select
                        value={registerForm.volume}
                        onChange={(event) => setRegisterForm({ ...registerForm, volume: event.target.value })}
                        className="h-8 border border-[#777] bg-white px-2"
                      >
                        <option>Desde 3 unidades</option>
                        <option>Desde 12 unidades</option>
                        <option>Pedido mixto mayorista</option>
                        <option>Deseo asesoria</option>
                      </select>
                    </label>
                  </div>

                  <div className="mt-4 border-t border-dotted border-[#777] pt-3">
                    {registerError ? <p className="mb-2 font-bold text-[#c2188d]">{registerError}</p> : null}
                    <button
                      type="submit"
                      className="border border-[#003f99] bg-[#0054c7] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#003f99]"
                    >
                      Crear usuario mayorista
                    </button>
                    <p className="mt-2 text-[#555]">Registro exclusivo de la tienda mayorista.</p>
                  </div>
                </form>

                <aside className="space-y-3">
                  <div className="border border-[#9fb6d8] bg-[#eef6ff]">
                    <div className="bg-[#dbe9ff] px-2 py-1 text-center text-[18px] font-bold text-[#003f99]">
                      Bienvenida
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-[#003f99]">Nueva distribuidora?</p>
                      <p className="mt-2">Este registro nos ayuda a validar tu acceso y recomendarte productos para comenzar.</p>
                    </div>
                  </div>
                  <div className="border border-[#9fb6d8] bg-white">
                    <div className="bg-[#003f99] px-2 py-1 text-[14px] font-bold text-white">Que recibiras</div>
                    <ul className="ml-5 list-disc p-3">
                      <li>Lista de precios mayoristas</li>
                      <li>Confirmacion de stock</li>
                      <li>Asesoria para pedido inicial</li>
                      <li>Coordinacion de envio</li>
                    </ul>
                  </div>
                  <div className="border border-[#ff9d00] bg-[#fff8e6] p-3">
                    <p className="font-bold">Pedido sugerido</p>
                    <p className="mt-1">Empieza con moldes, resina y accesorios mixtos para probar rotacion.</p>
                  </div>
                </aside>
              </div>
            </section>
          )}

          {showAccount && (
            <section className="border border-[#003f99] bg-[#fffdf0] text-[12px]">
              <div className="flex items-center justify-between bg-[#003f99] px-3 py-2 text-white">
                <h1 className="text-[18px] font-bold leading-none text-white">Mi Cuenta Mayorista</h1>
                <button
                  type="button"
                  onClick={() => setShowAccount(false)}
                  className="border border-white bg-white px-2 py-0.5 text-[11px] font-bold text-[#003f99]"
                >
                  Volver al catalogo
                </button>
              </div>
              {!isWholesaleLoggedIn ? (
                <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_300px]">
                  <form onSubmit={submitWholesaleLogin} className="border border-[#9fb6d8] bg-white p-4">
                    <h2 className="mb-3 text-[20px] font-black leading-tight text-[#003f99]">
                      Login mayorista
                    </h2>
                    <div className="grid gap-3">
                      <label className="grid gap-1">
                        <span className="font-bold text-[#003f99]">WhatsApp o correo</span>
                        <input
                          value={loginForm.user}
                          onChange={(event) => setLoginForm({ ...loginForm, user: event.target.value })}
                          className="h-8 border border-[#777] bg-white px-2"
                          autoComplete="username"
                        />
                      </label>
                      <label className="grid gap-1">
                        <span className="font-bold text-[#003f99]">Clave mayorista</span>
                        <input
                          type="password"
                          value={loginForm.password}
                          onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                          className="h-8 border border-[#777] bg-white px-2"
                          autoComplete="current-password"
                        />
                      </label>
                      {loginError ? <p className="font-bold text-[#c2188d]">{loginError}</p> : null}
                      <div className="flex items-center gap-2 border-t border-dotted border-[#777] pt-3">
                        <button
                          type="submit"
                          className="border border-[#003f99] bg-[#0054c7] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#003f99]"
                        >
                          Ingresar a mi cuenta
                        </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegister(true);
                      setShowAccount(false);
                      setShowWholesaleCart(false);
                    }}
                          className="font-bold text-[#003f99] underline"
                        >
                          Crear acceso
                        </button>
                      </div>
                    </div>
                  </form>

                  <aside className="space-y-3">
                    <div className="border border-[#9fb6d8] bg-[#eef6ff]">
                      <div className="bg-[#dbe9ff] px-2 py-1 text-center text-[18px] font-bold text-[#003f99]">
                        Acceso privado
                      </div>
                      <div className="p-3">
                        <p className="font-bold text-[#003f99]">Ya eres distribuidora?</p>
                        <p className="mt-2">Ingresa con el WhatsApp o correo registrado y tu clave mayorista.</p>
                      </div>
                    </div>
                    <div className="border border-[#ff9d00] bg-[#fff8e6] p-3">
                      <p className="font-bold">No tienes clave?</p>
                      <button
                        type="button"
                      onClick={() => {
                        setShowRegister(true);
                        setShowAccount(false);
                        setShowWholesaleCart(false);
                      }}
                        className="mt-1 font-bold text-[#003f99] underline"
                      >
                        Registrate como distribuidora
                      </button>
                    </div>
                  </aside>
                </div>
              ) : (
              <div className="grid gap-4 p-4 md:grid-cols-[1fr_1fr_1fr]">
                <div className="border border-[#9fb6d8] bg-white p-2">
                  <p className="font-bold text-[#003f99]">Estado de acceso</p>
                  <p className="mt-1">Sesion mayorista iniciada.</p>
                  <button
                    type="button"
                    onClick={() => setIsWholesaleLoggedIn(false)}
                    className="mt-2 font-bold text-[#003f99] underline"
                  >
                    Cerrar sesion mayorista
                  </button>
                </div>
                <div className="border border-[#9fb6d8] bg-white p-2">
                  <p className="font-bold text-[#003f99]">Pedidos mayoristas</p>
                  <p className="mt-1">Coordina tus pedidos y confirmacion de stock por WhatsApp.</p>
                  <a href={whatsappHref()} target="_blank" rel="noreferrer" className="mt-2 block font-bold text-[#003f99] underline">
                    Consultar mis pedidos
                  </a>
                </div>
                <div className="border border-[#9fb6d8] bg-white p-2">
                  <p className="font-bold text-[#003f99]">Lista de precios</p>
                  <p className="mt-1">Revisa la matriz de precios por volumen en esta pagina.</p>
                  <button
                    type="button"
                    onClick={() => setShowAccount(false)}
                    className="mt-2 font-bold text-[#003f99] underline"
                  >
                    Volver a la lista
                  </button>
                </div>
              </div>
              )}
            </section>
          )}

          {showWholesaleCart && (
            <section className="border border-[#003f99] bg-[#fffdf0] text-[12px]">
              <div className="flex items-center justify-between bg-[#003f99] px-3 py-2 text-white">
                <h1 className="text-[18px] font-bold leading-none text-white">Carrito Mayorista</h1>
                <button
                  type="button"
                  onClick={() => setShowWholesaleCart(false)}
                  className="border border-white bg-white px-2 py-0.5 text-[11px] font-bold text-[#003f99]"
                >
                  Volver al catalogo
                </button>
              </div>
              <div className="grid gap-4 p-4 md:grid-cols-[1fr_280px]">
                <div className="border border-[#9fb6d8] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-[#003f99]">Pedido mayorista en preparacion</p>
                    {pricedCartItems.length > 0 ? (
                      <button
                        type="button"
                        onClick={openCartDetailWindow}
                        className="border border-[#003f99] bg-[#eef6ff] px-3 py-1 text-[12px] font-bold text-[#003f99] hover:bg-[#dbe9ff]"
                      >
                        Ver detalle
                      </button>
                    ) : null}
                  </div>
                  {currentWholesaleUser ? (
                    <p className="mt-1">
                      Mayorista: <b>{currentWholesaleUser.name}</b>
                      {currentWholesaleUser.business ? ` | ${currentWholesaleUser.business}` : ""}
                    </p>
                  ) : null}
                  {pricedCartItems.length === 0 ? (
                    <>
                      <p className="mt-2">Aun no tienes productos en tu carrito mayorista.</p>
                      <p className="mt-3 text-[#c2188d]">
                        Vuelve al catalogo y elige los productos que deseas preparar para tu pedido.
                      </p>
                    </>
                  ) : (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full border-collapse text-[12px]">
                        <thead>
                          <tr className="bg-[#dbe9ff] text-[#003f99]">
                            <th className="border border-[#9fb6d8] p-2 text-left">Producto</th>
                            <th className="border border-[#9fb6d8] p-2 text-center">Cantidad</th>
                            <th className="border border-[#9fb6d8] p-2 text-right">Precio</th>
                            <th className="border border-[#9fb6d8] p-2 text-right">Total</th>
                            <th className="border border-[#9fb6d8] p-2 text-center">Accion</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pricedCartItems.map((item) => (
                            <tr key={item.productId} className="odd:bg-white even:bg-[#f7fbff]">
                              <td className="border border-[#9fb6d8] p-2">
                                <button
                                  type="button"
                                  onClick={() => openWholesaleProduct(item.product)}
                                  className="font-bold text-[#003f99] underline"
                                >
                                  {item.product.title}
                                </button>
                                <p className="text-[11px] text-[#555]">
                                  Nivel: {item.tier === "large" ? "docena distribuidora" : item.tier === "small" ? "media docena mayorista" : "normal"}
                                </p>
                              </td>
                              <td className="border border-[#9fb6d8] p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                                  className="border border-[#777] bg-white px-2 font-bold"
                                >
                                  -
                                </button>
                                <input
                                  value={item.quantity}
                                  onChange={(event) => updateCartQuantity(item.productId, Number(event.target.value))}
                                  className="mx-1 h-7 w-14 border border-[#777] text-center"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                                  className="border border-[#777] bg-white px-2 font-bold"
                                >
                                  +
                                </button>
                              </td>
                              <td className="border border-[#9fb6d8] p-2 text-right font-bold text-[#c2188d]">
                                {fmt(item.unitPrice)}
                              </td>
                              <td className="border border-[#9fb6d8] p-2 text-right font-bold">
                                {fmt(item.lineTotal)}
                              </td>
                              <td className="border border-[#9fb6d8] p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeCartItem(item.productId)}
                                  className="font-bold text-[#003f99] underline"
                                >
                                  Quitar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <aside className="space-y-3">
                  <div className="border border-[#9fb6d8] bg-[#eef6ff]">
                    <div className="bg-[#dbe9ff] px-2 py-1 text-center text-[18px] font-bold text-[#003f99]">
                      Analisis del pedido
                    </div>
                    <div className="p-3">
                      <p>Productos: <b>{cartSummary.count}</b></p>
                      <p>Unidades: <b>{cartSummary.units}</b></p>
                      <p>Subtotal: <b>{fmt(cartSummary.subtotal)}</b></p>
                      <p>Ahorro estimado: <b className="text-[#c2188d]">{fmt(cartSummary.savings)}</b></p>
                    </div>
                  </div>
                  {pricedCartItems.length > 0 && (
                    <button
                      type="button"
                      className="w-full border border-[#003f99] bg-[#0054c7] px-3 py-2 font-bold text-white"
                    >
                      Guardar pedido mayorista
                    </button>
                  )}
                </aside>
              </div>
            </section>
          )}

          {selectedProduct && (
            <section className="border border-[#003f99] bg-[#fffdf0] text-[12px]">
              <div className="flex items-center justify-between bg-[#003f99] px-3 py-2 text-white">
                <h1 className="text-[18px] font-bold leading-none text-white">Detalle Mayorista</h1>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="border border-white bg-white px-2 py-0.5 text-[11px] font-bold text-[#003f99]"
                >
                  Volver al catalogo
                </button>
              </div>
              <div className="grid gap-4 p-4 md:grid-cols-[300px_1fr]">
                <div className="bg-white p-3">
                  <div className="relative h-[260px] w-full bg-white">
                    {isPlaceholderImage(selectedImage) ? (
                      <span className="absolute inset-0 flex items-center justify-center text-center text-[12px] font-bold text-[#777]">
                        Producto sin imagen
                      </span>
                    ) : (
                      <Image
                        src={normalizeImageUrl(selectedImage)}
                        alt={selectedProduct.title || "Producto"}
                        fill
                        sizes="300px"
                        className="object-contain"
                      />
                    )}
                    {selectedGallery.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => moveSelectedImage(-1)}
                          className="absolute left-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center border border-[#003f99] bg-white text-[20px] font-black leading-none text-[#003f99] shadow"
                          aria-label="Foto anterior"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSelectedImage(1)}
                          className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center border border-[#003f99] bg-white text-[20px] font-black leading-none text-[#003f99] shadow"
                          aria-label="Foto siguiente"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>
                  {selectedGallery.length > 1 && (
                    <p className="mt-2 text-center text-[11px] font-bold text-[#003f99]">
                      Foto {selectedImageIndex + 1} de {selectedGallery.length}
                    </p>
                  )}
                </div>
                <div className="bg-white p-4">
                  <p className="text-[11px] font-bold uppercase text-[#c2188d]">Producto mayorista</p>
                  <h2 className="mt-1 text-[26px] font-black leading-tight text-[#003f99]">
                    {selectedProduct.title || "Producto"}
                  </h2>
                  <p className="mt-2 text-[13px] leading-5">
                    {selectedProduct.description || "Producto disponible para cotizacion mayorista."}
                  </p>
                  <div className="mt-4 grid grid-cols-3 border border-[#9fb6d8] text-center">
                    <div className="border-r border-[#9fb6d8] bg-[#eef6ff] p-2">
                      <p className="font-bold text-[#003f99]">Precio sugerido venta publico</p>
                      <p className="mt-1 font-black">{fmt(Number(selectedProduct.price || 0))}</p>
                    </div>
                    <div className="border-r border-[#9fb6d8] bg-[#fffdf0] p-2">
                      <p className="font-bold text-[#003f99]">Media docena</p>
                      <p className="mt-1 font-black text-[#c2188d]">{fmt(wholesalePrice(selectedProduct, "small"))}</p>
                    </div>
                    <div className="bg-[#fffdf0] p-2">
                      <p className="font-bold text-[#003f99]">Docena</p>
                      <p className="mt-1 font-black text-[#c2188d]">{fmt(wholesalePrice(selectedProduct, "large"))}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-[12px]">
                    <p><b>Categoria:</b> {selectedProduct.category || detectGroup(selectedProduct)}</p>
                    {selectedProduct.code ? <p><b>Codigo:</b> {selectedProduct.code}</p> : null}
                    <p><b>Stock:</b> {Number(selectedProduct.stock || 0) > 0 ? `${selectedProduct.stock} und.` : "Consultar"}</p>
                  </div>
                  <div className="mt-4 border-t border-dotted border-[#777] pt-3">
                    <div className="mt-2 flex flex-wrap gap-3">
                      {selectedPackageOptions.map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          disabled={option.disabled}
                          onClick={() => addToWholesaleCart(selectedProduct, option.units)}
                          className={
                            "border px-5 py-2 text-[13px] font-bold " +
                            (option.disabled
                              ? "border-[#999] bg-[#ddd] text-[#777]"
                              : "border-[#003f99] bg-[#0054c7] text-white hover:bg-[#003f99]")
                          }
                        >
                          Agrega {option.label.toLowerCase()}
                        </button>
                      ))}
                    </div>
                    {!canUseWholesaleCart && (
                      <p className="mt-2 text-[#c2188d]">Inicia sesion o registrate para usar el carrito mayorista.</p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {!showRegister && !showAccount && !showWholesaleCart && !selectedProduct && (
          <div className="grid grid-cols-[190px_minmax(0,1fr)_230px] gap-3">
            <aside className="border border-[#003f99] bg-[#ffffcc] text-[12px] leading-4">
              <div className="bg-[#003f99] px-2 py-1 text-[13px] font-bold text-white">Departamentos</div>
              <div className="p-2">
                <p className="mb-1 font-bold text-[#003f99]">Catalogo mayorista</p>
                {groups.slice(1).map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setActiveGroup(group)}
                    className="block text-left font-bold text-[#003f99] underline"
                  >
                    {group}
                  </button>
                ))}

                <hr className="my-3 border-[#c7c78f]" />
                <p className="font-bold text-[#003f99]">Condiciones</p>
                <ul className="ml-4 list-disc">
                  <li>Precios por volumen</li>
                  <li>Stock sujeto a confirmacion</li>
                  <li>Pedidos por WhatsApp</li>
                  <li>Envios coordinados</li>
                </ul>

                <hr className="my-3 border-[#c7c78f]" />
                <p className="font-bold text-[#003f99]">Acceso rapido</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowRegister(false);
                    setShowAccount(false);
                    setShowWholesaleCart(false);
                    setSelectedProduct(null);
                    setActiveGroup("Todos");
                  }}
                  className="block text-left text-[#003f99] underline"
                >
                  Inicio mayorista
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGroup("Todos")}
                  className="block text-left text-[#003f99] underline"
                >
                  Catalogo mayorista
                </button>
                <button
                  type="button"
                  onClick={() => setShowWholesaleCart(true)}
                  className="block text-left text-[#003f99] underline"
                >
                  Pedido mayorista
                </button>
              </div>
            </aside>

            <section className="min-w-0">
              <div className="mb-3 border border-[#ff9d00] bg-[#fff3d2] p-3">
                <h1 className="text-[24px] font-black leading-tight text-[#003f99]">
                  Conviertete en distribuidora resinera
                </h1>
                <p className="mt-1 text-[13px] leading-5">
                  Trabaja y emprende con nosotros vendiendo moldes, resina y accesorios para abastecer a mas resineras como tu.
                </p>
                <p className="mt-2 text-[12px] font-bold text-[#c2188d]">
                  Precios preferenciales para pedidos desde 3 y 12 unidades.
                </p>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="border border-[#9fb6d8] bg-white p-4 text-center text-[13px]">
                  No se encontraron productos.
                </div>
              ) : (
                <>
                  <RetroProductSection title="Hot Mayorista Trends" products={sectionProducts.trends} onOpen={openWholesaleProduct} />
                  <RetroProductSection title="Popular Moldes y Resina" products={sectionProducts.popular} onOpen={openWholesaleProduct} />
                  <RetroProductSection title="Values for Every Resinera" products={sectionProducts.values} onOpen={openWholesaleProduct} />
                  <RetroProductSection title="In Stores This Month" products={sectionProducts.stores} onOpen={openWholesaleProduct} />
                </>
              )}
            </section>

            <aside className="space-y-3 text-[12px] leading-4">
              <div className="border border-[#9fb6d8] bg-[#eef6ff]">
                <div className="bg-[#dbe9ff] px-2 py-1 text-center text-[18px] font-bold text-[#003f99]">
                  Mayorista
                </div>
                <div className="p-2">
                  <p className="font-bold text-[#003f99]">Nueva distribuidora?</p>
                  <button
                    type="button"
                    onClick={() => setShowRegister(true)}
                    className="font-bold text-[#003f99] underline"
                  >
                    Click para empezar.
                  </button>
                  <hr className="my-2 border-dotted border-[#777]" />
                  <p>Solicita tu lista, confirma stock y coordina despacho por WhatsApp.</p>
                </div>
              </div>

              <div className="border border-[#9fb6d8] bg-white">
                <div className="bg-[#003f99] px-2 py-1 text-[14px] font-bold text-white">Niveles de precio</div>
                <div className="p-2">
                  <p><b>Normal:</b> precio publico</p>
                  <p><b>3+ und.:</b> inicio mayorista</p>
                  <p><b>12+ und.:</b> distribuidora</p>
                  <hr className="my-2 border-dotted border-[#777]" />
                  <p className="text-[#c2188d]"><b>Importante:</b> los precios se confirman segun stock disponible.</p>
                </div>
              </div>

              <div className="border border-[#9fb6d8] bg-[#fff8e6]">
                <div className="bg-[#ffcc66] px-2 py-1 text-[14px] font-bold text-[#111]">Pedido rapido</div>
                <div className="p-2">
                  <p>1. Elige productos</p>
                  <p>2. Cotiza por WhatsApp</p>
                  <p>3. Confirma cantidades</p>
                  <p>4. Coordina envio</p>
                  <a href={whatsappHref()} target="_blank" rel="noreferrer" className="mt-2 block border border-[#003f99] bg-[#0054c7] px-2 py-1 text-center font-bold text-white">
                    Contactar ahora
                  </a>
                </div>
              </div>
            </aside>
          </div>
          )}

          <footer className="mt-10 border-t border-dotted border-[#777] pt-3 text-center text-[11px] leading-5 text-[#003f99]">
            <button
              type="button"
              onClick={() => {
                setShowRegister(false);
                setShowAccount(false);
                setShowWholesaleCart(false);
                setSelectedProduct(null);
              }}
              className="underline"
            >
              Rossy Resina Mayorista
            </button>
            <span className="mx-2">|</span>
            <button type="button" onClick={() => setActiveGroup("Todos")} className="underline">Catalogo</button>
            <span className="mx-2">|</span>
            <span>Privacidad mayorista</span>
            <span className="mx-2">|</span>
            <span>Terminos mayoristas</span>
          </footer>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps() {
  const products = await getAllProducts();
  return { props: { products } };
}

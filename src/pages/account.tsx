import { useSelector } from "react-redux";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StateProps, StoreProduct } from "../../type";
import { useDispatch } from "react-redux";
import { removeUser } from "@/store/nextSlice";
import FormattedPrice from "@/components/FormattedPrice";
import {
  ArrowRightIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  UserCircleIcon,
  AcademicCapIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ClockIcon,
  GiftIcon,
  MapPinIcon,
  StarIcon,
  TagIcon,
  TruckIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const { userInfo, productData } = useSelector((state: StateProps) => state.next);
  const dispatch = useDispatch();
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [sellerContext, setSellerContext] = useState<any>(null);
  const isAdminSession = (session?.user as any)?.role === "ADMIN";
  const storeUser = isAdminSession ? null : (userInfo as any);
  const sessionUser = !isAdminSession ? session?.user : null;
  const isAuthenticated = Boolean(sessionUser?.email || storeUser?.email);
  const name = storeUser?.name || sessionUser?.name || storeUser?.email || sessionUser?.email || "Usuario";
  const avatar = storeUser?.image || sessionUser?.image || "";
  const cartItems = useMemo(
    () => (Array.isArray(productData) ? (productData as StoreProduct[]) : []),
    [productData]
  );
  const cartPreview = cartItems.slice(0, 3);
  const cartUnits = cartItems.reduce((sum: number, item: StoreProduct) => sum + Number(item.quantity || 0), 0);
  const handleSignOut = () => {
    signOut();
    dispatch(removeUser());
  };
  const normalizeImage = (src?: string) => {
    const raw = String(src || "").replace(/\\/g, "/");
    if (!raw) return "/favicon-96x96.png";
    if (/^https?:\/\//i.test(raw)) return raw;
    return raw.startsWith("/") ? raw : `/${raw}`;
  };

  useEffect(() => {
    let alive = true;
    fetch(`/api/products?_=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((rows) => {
        if (!alive) return;
        setRecommendedProducts(Array.isArray(rows) ? rows.slice(0, 12) : []);
      })
      .catch(() => {
        if (!alive) return;
        setRecommendedProducts([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    let alive = true;
    fetch("/api/marketplace/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (alive) setSellerContext(data);
      })
      .catch(() => {
        if (alive) setSellerContext(null);
      });
    return () => {
      alive = false;
    };
  }, [isAuthenticated]);

  const isSeller = sellerContext?.role === "SELLER";
  const sellerApplicationStatus = String(sellerContext?.application?.status || "");
  const marketplaceAction = isSeller
    ? {
        href: "/mi-tienda",
        title: "Mi Tienda",
        description: "Gestiona tu perfil, productos y estadísticas de vendedora.",
        mobileLabel: "Mi Tienda",
      }
    : sellerApplicationStatus === "PENDING"
      ? {
          href: "/vende-con-nosotros",
          title: "Solicitud pendiente",
          description: "Tu solicitud para vender está en revisión por el equipo Rossy Resina.",
          mobileLabel: "Solicitud pendiente",
        }
      : {
          href: "/vende-con-nosotros",
          title: "Vende con nosotros",
          description: "Crea tu tienda dentro de Rossy Resina y muestra tus productos.",
          mobileLabel: "Vende con nosotros",
        };

  const mobileProducts = useMemo(() => {
    if (recommendedProducts.length > 0) return recommendedProducts;
    return cartItems.slice(0, 8);
  }, [recommendedProducts, cartItems]);

  if (status === "loading") {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 py-6 md:py-10">
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-600">
          Cargando cuenta...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 py-6 md:py-10">
        <div className="bg-white rounded-xl p-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Inicia sesión para ver tu cuenta</h1>
          <p className="mt-2 text-sm text-gray-600">
            Accede o regístrate para ver tus pedidos, dirección de envío y mensajes.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/sign-in?callbackUrl=/account" className="rounded-full bg-amazon_blue px-5 py-2 text-sm font-semibold text-white hover:brightness-95">
              Iniciar sesión
            </Link>
            <Link href="/register?callbackUrl=/account" className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Registrarme
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="md:hidden">
        <section className="bg-white px-4 pb-3 pt-5">
          <div className="flex items-center gap-3">
            {avatar ? (
              <Image src={avatar} alt="Avatar" width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-lg font-black text-gray-700">
                {String(name).slice(0, 1)}
              </div>
            )}
            <h1 className="min-w-0 flex-1 truncate text-[26px] font-black leading-tight text-gray-950">{name}</h1>
            <Link href="/messages" className="flex h-9 w-9 items-center justify-center rounded-full text-gray-950" aria-label="Mensajes">
              <ChatBubbleOvalLeftEllipsisIcon className="h-7 w-7 stroke-[2.2]" />
            </Link>
            <Link href="/shipping-address" className="flex h-9 w-9 items-center justify-center rounded-full text-gray-950" aria-label="Configurar dirección">
              <MapPinIcon className="h-7 w-7 stroke-[2.2]" />
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-2 divide-x divide-gray-200 text-center">
            <div>
              <p className="text-2xl font-black text-gray-950">S/ 0.00</p>
              <p className="text-sm text-gray-700">Saldo de crédito</p>
            </div>
            <div>
              <p className="text-2xl font-black text-gray-950">0</p>
              <p className="text-sm text-gray-700">Cupones y ofertas</p>
            </div>
          </div>

          <Link href="/productos?ofertas=1" className="mt-3 flex items-center gap-3 rounded border border-gray-200 bg-white px-2 py-2 shadow-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded bg-amazon_blue/10 text-amazon_blue">
              <GiftIcon className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-gray-950">Regalos y ofertas Rossy Resina</span>
              <span className="block truncate text-xs text-gray-500">Descubre promociones listas para ti</span>
            </span>
            <span className="rounded-full bg-amazon_blue px-3 py-1 text-xs font-black text-white">Ver</span>
          </Link>
        </section>

        <section className="mt-2 divide-y divide-gray-100 bg-white">
          <MobileAccountRow href="/track-orders" icon={<ClipboardDocumentListIcon className="h-6 w-6" />} label="Tus pedidos" />
          <MobileAccountRow href="/shipping-address" icon={<HomeIcon className="h-6 w-6" />} label="Mis datos" />
          <MobileAccountRow href={marketplaceAction.href} icon={<ShoppingBagIcon className="h-6 w-6" />} label={marketplaceAction.mobileLabel} />
          <MobileAccountRow href="/messages" icon={<ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6" />} label="Mensajes" />
          <MobileAccountRow href="/reviews" icon={<StarIcon className="h-6 w-6" />} label="Reseñas" />
        </section>

        <section className="mt-2 grid grid-cols-4 bg-white px-2 py-4 text-center">
          <MobileQuickLink href="/track-orders" icon={<ClockIcon className="h-7 w-7" />} label="Historial" />
          <MobileQuickLink href="/productos?ofertas=1" icon={<GiftIcon className="h-7 w-7" />} label="Ofertas" />
          <MobileQuickLink href="/shipping-address" icon={<MapPinIcon className="h-7 w-7" />} label="Direcciones" />
          <MobileQuickLink href="/favorite" icon={<TagIcon className="h-7 w-7" />} label="Favoritos" />
        </section>

        {cartPreview.length > 0 && (
          <Link href="/cart" className="mt-2 block bg-white px-4 py-3">
            <div className="flex items-center gap-1 text-sm">
              <span className="font-black uppercase text-amazon_blue">En tu carrito</span>
              <span className="text-gray-950">- {cartUnits} artículo{cartUnits !== 1 ? "s" : ""} en el carrito</span>
              <ArrowRightIcon className="h-4 w-4" />
            </div>
            <div className="mt-2 flex gap-1">
              {cartPreview.map((item: StoreProduct) => (
                <div key={item._id} className="relative h-20 w-20 overflow-hidden bg-gray-100">
                  <Image src={normalizeImage(item.image)} alt={item.title || "Producto"} fill className="object-cover" />
                  <span className="absolute bottom-0 left-0 right-0 bg-black/55 px-1 py-0.5 text-[10px] font-semibold text-white">
                    En carrito
                  </span>
                </div>
              ))}
            </div>
          </Link>
        )}

        <div className="mt-2 flex items-center gap-3 bg-[#fff1e5] px-4 py-3 text-sm font-black text-green-700">
          <TruckIcon className="h-5 w-5" />
          <span>Envío gratis</span>
          <span className="h-6 w-px bg-green-700/30" />
          <span>S/ 4.00 de crédito por retraso</span>
        </div>

        <section className="grid grid-cols-2 gap-1 bg-white pt-2">
          {mobileProducts.slice(0, 12).map((product: any) => (
            <Link key={product._id} href={`/${product.code || product._id}`} className="min-w-0 bg-white">
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <Image src={normalizeImage(product.image)} alt={product.title || "Producto"} fill className="object-cover" />
              </div>
              <div className="px-1.5 py-2">
                <p className="line-clamp-1 text-xs text-gray-700">{product.title || "Producto"}</p>
                <p className="mt-1 text-sm font-black text-amazon_blue">
                  <FormattedPrice amount={Number(product.price || 0)} />
                </p>
              </div>
            </Link>
          ))}
        </section>
      </div>

      <div className="mx-auto hidden max-w-6xl px-4 py-6 md:block md:py-10">
        <div className="mb-4 text-sm text-gray-500">Inicio / Cuenta</div>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 p-5 md:p-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                {avatar ? (
                  <Image src={avatar} alt="Avatar" width={64} height={64} className="rounded-full object-cover" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xl font-semibold">
                    {String(name).slice(0, 1)}
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Bienvenida/o</p>
                  <h1 className="text-2xl font-semibold text-gray-900">{name}</h1>
                  <p className="mt-1 text-sm text-gray-500">{storeUser?.email || sessionUser?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          <div className="grid gap-0 md:grid-cols-5">
            <AccountAction
              href="/track-orders"
              icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
              title="Mis pedidos"
              description="Consulta el estado de tus compras y datos de envío."
            />
            <AccountAction
              href="/shipping-address"
              icon={<HomeIcon className="h-6 w-6" />}
              title="Mis datos"
              description="Mantén actualizados tus datos personales y dirección."
            />
            <AccountAction
              href={marketplaceAction.href}
              icon={<ShoppingBagIcon className="h-6 w-6" />}
              title={marketplaceAction.title}
              description={marketplaceAction.description}
            />
            <AccountAction
              href="/messages"
              icon={<UserCircleIcon className="h-6 w-6" />}
              title="Centro de mensajes"
              description="Revisa comunicaciones importantes de tu cuenta."
            />
            <AccountAction
              href="/estudiante"
              icon={<AcademicCapIcon className="h-6 w-6" />}
              title="Perfil estudiante"
              description="Consulta tus cursos, avances y datos de alumno."
            />
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 md:p-7">
          <h2 className="text-lg font-semibold text-gray-900">Resumen</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Desde aquí puedes revisar tus pedidos y mantener actualizada tu dirección. Más adelante se pueden activar
            cupones, créditos, valoraciones y otras opciones cuando ya estén listas para usarse.
          </p>
          <div className="mt-5">
            <Link
              href="/productos"
              className="inline-flex h-10 items-center justify-center rounded-md bg-amazon_blue px-4 text-sm font-semibold text-white hover:brightness-95"
            >
              Seguir comprando
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function AccountAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[150px] flex-col justify-between border-b border-gray-100 p-5 transition-colors hover:bg-gray-50 md:border-b-0 md:border-r md:last:border-r-0"
    >
      <div>
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-amazon_blue">
          {icon}
        </div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm leading-5 text-gray-600">{description}</p>
      </div>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amazon_blue">
        Abrir
        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function MobileAccountRow({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex h-[62px] items-center gap-4 px-4 text-gray-950">
      <span className="flex h-8 w-8 items-center justify-center text-gray-950">{icon}</span>
      <span className="flex-1 text-lg font-medium">{label}</span>
      <ArrowRightIcon className="h-5 w-5 text-gray-500" />
    </Link>
  );
}

function MobileQuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex min-w-0 flex-col items-center gap-2 px-1 text-gray-950">
      <span className="relative flex h-8 items-center justify-center">{icon}</span>
      <span className="w-full truncate text-sm font-medium">{label}</span>
    </Link>
  );
}

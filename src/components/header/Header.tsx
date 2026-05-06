import Image from "next/image";
import logo from "../../images/logo.jpg";
import {
  MagnifyingGlassIcon,
  UserIcon,
  ShoppingCartIcon,
  Bars3Icon,
  XMarkIcon,
  TagIcon,
  SparklesIcon,
  GiftIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { StateProps, StoreProduct } from "../../../type";
import { useSession, signOut } from "next-auth/react";
import { signIn } from "next-auth/react";
import { useEffect, useState, useRef, useMemo, useDeferredValue } from "react";
import { addUser, removeUser } from "@/store/nextSlice";
import SearchProducts from "../SearchProducts";
import FormattedPrice from "@/components/FormattedPrice";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineEmail } from "react-icons/md";

const Header = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [allData, setAllData] = useState<StoreProduct[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const { productData, userInfo, allProducts } = useSelector(
    (state: StateProps) => state.next
  );
  const dispatch = useDispatch();
  const sessionRole = (session?.user as any)?.role;
  const isAdminSession = sessionRole === "ADMIN";
  const storeUser = isAdminSession ? null : (userInfo as any);
  const sessionUser = !isAdminSession ? session?.user : null;
  const handleSignOut = async () => {
    dispatch(removeUser());
    setProfileOpen(false);
    await signOut({ callbackUrl: "/" });
  };
  useEffect(() => {
    const list = Array.isArray(allProducts) ? allProducts : [];
    if (list.length > 0) setAllData(list);
    let mounted = true;
    fetch(`/api/products?_=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((rows) => {
        if (!mounted) return;
        setAllData(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!mounted) return;
        setAllData([]);
      });
    return () => {
      mounted = false;
    };
  }, [allProducts]);
  useEffect(() => {
    if (isAdminSession) {
      dispatch(removeUser());
      return;
    }
    if (session?.user) {
      dispatch(
        addUser({
          name: session?.user?.name,
          email: session?.user?.email,
          image: session?.user?.image,
        })
      );
    }
  }, [session, isAdminSession, dispatch]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Search area
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const deferredQuery = useDeferredValue(searchQuery);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const handleLogoClick = (e: React.MouseEvent) => {
    const currentPath = (router.asPath || "").split("?")[0];
    if (currentPath === "/") {
      e.preventDefault();
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }
    router.push("/");
  };
  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    setMobileSearchOpen(false);
  };

  const mobileMenuItems = [
    { href: "/categoria/moldes-de-silicona", label: "Moldes", icon: SparklesIcon },
    { href: "/categoria/pigmentos", label: "Pigmentos", icon: SparklesIcon },
    { href: "/categoria/accesorios", label: "Accesorios", icon: TagIcon },
    { href: "/categoria/resina", label: "Resina", icon: SparklesIcon },
    { href: "/categoria/creaciones", label: "Creaciones", icon: SparklesIcon },
    { href: "/productos?ofertas=1", label: "Ofertas", icon: GiftIcon },
    { href: "/rifas", label: "Rifas", icon: GiftIcon },
    { href: "/blog", label: "Blog", icon: BookOpenIcon },
  ];

  const filteredProducts = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return [];
    return allData
      .filter((item: StoreProduct) => {
        const hay = [item.title, item.category, item.brand, item.code, item.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 12);
  }, [deferredQuery, allData]);

  useEffect(() => {
    if (!profileOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileOpen]);

  useEffect(() => {
    if (!mobileSearchOpen) return;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => {
      mobileSearchInputRef.current?.focus();
    }, 20);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [mobileSearchOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.asPath]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileSearchOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileSearchOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileSearchOpen]);

  const cartSubtotal = isHydrated
    ? productData.reduce((s: number, p: any) => s + p.price * p.quantity, 0)
    : 0;
  const cartCount = isHydrated && productData ? productData.length : 0;
  const isAuthenticated = Boolean(sessionUser?.email || storeUser?.email);

  return (
    <div className="w-full bg-white text-black sticky top-0 z-50">
      <div className="md:hidden px-3 pt-2 pb-3 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <Link href={"/"} onClick={handleLogoClick} className="flex items-center gap-2 group">
            <div className="bg-white rounded-full p-1 shadow ring-1 ring-amazon_blue/20 group-hover:shadow-md transition-shadow duration-300">
              <Image className="h-9 w-9 object-contain rounded-full" src={logo} alt="Logo Rossy Resina" priority />
            </div>
            <div className="leading-tight">
              <span className="text-sm font-semibold text-amazon_blue block">Rossy Resina</span>
              <span className="text-[11px] text-gray-500">Tienda artesana</span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
              mobileMenuOpen
                ? "border-[#c21885] bg-pink-50 text-[#c21885]"
                : "border-gray-200 bg-white text-slate-700"
            }`}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-store-menu"
          >
            {mobileMenuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </button>
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={() => setMobileSearchOpen(true)}
            className="relative w-full h-11 rounded-xl pl-11 pr-4 text-left text-sm text-gray-500 border border-gray-200 bg-gray-50 hover:border-amazon_blue hover:bg-white transition-colors duration-300"
            aria-label="Abrir buscador"
          >
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <span>{searchQuery || "Buscar moldes, resina, pigmentos..."}</span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[58]" role="dialog" aria-modal="true" aria-label="Menú de tienda">
          <button
            type="button"
            className="absolute inset-0 h-full w-full bg-slate-950/35"
            aria-label="Cerrar menú"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div id="mobile-store-menu" className="absolute left-3 right-3 top-[76px] mx-auto max-w-md overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-slate-900">Menú de tienda</p>
                <p className="text-xs text-slate-500">Categorías y accesos rápidos</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-slate-500"
                aria-label="Cerrar menú"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 p-3">
              {mobileMenuItems.map((item) => {
                const Icon = item.icon;
                const active = router.asPath.split("?")[0] === item.href.split("?")[0];
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex min-h-[52px] items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                      active
                        ? "border-[#c21885] bg-pink-50 text-[#c21885]"
                        : "border-gray-100 bg-white text-slate-700 hover:border-pink-200 hover:bg-pink-50"
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-50 text-[#c21885]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-semibold leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="hidden md:flex max-w-screen-2xl mx-auto min-h-[72px] px-3 py-2 sm:px-4 md:px-6 items-center gap-2 sm:gap-4">
        {/* logo */}
        <Link
          href={"/"}
          onClick={handleLogoClick}
          className="px-2 cursor-pointer duration-300 flex items-center justify-center"
        >
          <div className="flex flex-col items-center md:flex-row md:items-center gap-1 md:gap-2">
            <div className="bg-white rounded-full p-1.5 shadow-md ring-2 ring-amazon_blue/20 group-hover:shadow-lg transition-shadow duration-300">
              <Image className="h-12 w-12 md:h-14 md:w-14 object-contain rounded-full" src={logo} alt="Logo Rossy Resina" priority />
            </div>
            <span className="md:hidden text-sm leading-tight text-amazon_blue font-semibold">
              Rossy Resina
            </span>
            <div className="hidden md:flex flex-col leading-tight">
              <span className="text-amazon_blue font-semibold text-base md:text-lg">Rossy Resina</span>
              <span className="text-xs text-gray-500 hidden md:block">Resina, moldes y pigmentos</span>
            </div>
          </div>
        </Link>

        {/* mobile search */}
        <div className="md:hidden flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setMobileSearchOpen(true)}
            className="relative w-full h-10 rounded-full pl-10 pr-4 text-left text-sm text-gray-500 border border-gray-300 bg-white"
            aria-label="Abrir buscador"
          >
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <span>{searchQuery || "Buscar producto..."}</span>
          </button>
        </div>

        {/* searchbar */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <form onSubmit={submitSearch} className="w-full max-w-2xl h-11 inline-flex items-center justify-between relative">
            <input
              onChange={handleSearch}
              value={searchQuery}
              className="w-full h-full rounded-full pl-4 pr-28 placeholder:text-xs text-sm text-black border border-gray-300 outline-none focus-visible:border-amazon_blue focus:shadow-sm transition-all duration-300"
              type="text"
              placeholder="Buscar productos..."
            />
            <button type="submit" className="absolute right-0 top-0 h-full px-5 rounded-full bg-amazon_blue text-white text-sm font-semibold hover:brightness-95 transition-all duration-300 hover:shadow-md">Buscar</button>
            {/* ========== Searchfield ========== */}
            {searchQuery && (
              <div className="absolute left-0 top-12 w-full mx-auto max-h-96 bg-gray-100 rounded-lg overflow-y-scroll cursor-pointer text-black border border-gray-200">
                {filteredProducts.length > 0 ? (
                  <>
                    {searchQuery &&
                      filteredProducts.map((item: StoreProduct) => (
                        <Link
                          key={`${item._id}-${item.code || item.title}`}
                          className="w-full border-b-[1px] border-b-gray-200 flex items-center gap-4"
                          href={{
                            pathname: `/${item.code || item._id}`,
                            query: {
                              _id: item._id,
                              brand: item.brand,
                              category: item.category,
                              description: item.description,
                              image: item.image,
                              isNew: item.isNew,
                              oldPrice: item.oldPrice,
                              price: item.price,
                              title: item.title,
                            },
                          }}
                          onClick={() => setSearchQuery("")}
                        >
                          <SearchProducts item={item} />
                        </Link>
                      ))}
                  </>
                ) : (
                  <div className="bg-white flex items-center justify-center py-10 rounded-lg">
                    <p className="text-sm font-semibold">
                      No hay coincidencias con tu bsqueda. Intntalo de nuevo.
                    </p>
                  </div>
                )}
              </div>
            )}
            {/* ========== Searchfield ========== */}
          </form>
        </div>

        {/* actions */}
        <div className="ml-auto md:ml-0 flex items-center gap-2 sm:gap-4">
          <Link
            href={isAuthenticated ? "/account" : "/sign-in?callbackUrl=/account"}
            className="md:hidden p-2 rounded-full border border-gray-200 text-gray-700 hover:text-amazon_blue hover:border-amazon_blue"
            aria-label={isAuthenticated ? "Ir a mi perfil" : "Iniciar sesión"}
          >
            <UserIcon className="w-5 h-5" />
          </Link>

          <div className="relative hidden md:block" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-amazon_blue"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
            >
              <UserIcon className="w-5 h-5" />
              <div className="leading-tight text-left">
                <div className="text-xs text-gray-500">Cuenta</div>
                <div className="font-semibold">Mi perfil</div>
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] w-72 rounded-xl border border-gray-200 bg-white shadow-lg z-50">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    {storeUser?.image ? (
                      <Image
                        src={storeUser.image}
                        alt="Avatar"
                        width={44}
                        height={44}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-11 w-11 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-semibold">
                        {(storeUser?.name || storeUser?.email || "U").slice(0, 1)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Bienvenido de nuevo</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {storeUser?.name || storeUser?.email || "Invitado"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    {isAuthenticated ? (
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="text-sm text-amazon_blue hover:underline"
                      >
                        Cerrar sesión
                      </button>
                    ) : (
                      <Link href="/sign-in" className="text-sm text-amazon_blue hover:underline">
                        Iniciar sesión
                      </Link>
                    )}
                  </div>
                </div>
                {!isAuthenticated && (
                  <div className="grid gap-2 border-b border-gray-100 p-4">
                    <Link
                      href="/register"
                      className="flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      <MdOutlineEmail className="h-5 w-5 text-amazon_blue" />
                      Registrarme con correo
                    </Link>
                    <button
                      type="button"
                      onClick={() => signIn("google", { callbackUrl: "/" })}
                      className="flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      <FcGoogle className="h-5 w-5" />
                      Continuar con Google
                    </button>
                  </div>
                )}
                <div className="py-2">
                  <Link href={isAuthenticated ? "/account" : "/sign-in?callbackUrl=/account"} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                    Mi Cuenta
                  </Link>
                  <Link href={isAuthenticated ? "/track-orders" : "/sign-in?callbackUrl=/track-orders"} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                    Mis pedidos
                  </Link>
                  <Link href={isAuthenticated ? "/messages" : "/sign-in?callbackUrl=/messages"} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                    Centro de mensajes
                  </Link>
                </div>
              </div>
            )}
          </div>
          {/* cart */}
          <Link
            href="/cart"
            className="px-1 sm:px-2 cursor-pointer duration-300 relative flex items-center"
            aria-label="Abrir carrito"
          >
            <span className="flex items-center gap-2 relative">
              <div className="relative">
                <ShoppingCartIcon className="w-8 h-8 text-gray-700" />
                <span className="absolute -top-2 -right-2 bg-amazon_blue text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <div className="hidden md:block leading-tight text-left">
                <div className="text-xs text-gray-500">Tu carrito</div>
                <div className="text-sm font-semibold text-amazon_blue"><FormattedPrice amount={cartSubtotal} /></div>
              </div>
            </span>
          </Link>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-white">
          <div className="h-full flex flex-col">
            <div className="px-3 py-3 border-b border-gray-200 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="h-10 px-3 rounded-full border border-gray-300 text-sm text-gray-700"
              >
                Cerrar
              </button>
              <div className="relative flex-1">
                <input
                  ref={mobileSearchInputRef}
                  onChange={handleSearch}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitSearch();
                  }}
                  value={searchQuery}
                  className="w-full h-11 rounded-full pl-10 pr-4 text-sm text-black border border-gray-300 outline-none focus-visible:border-amazon_blue"
                  type="text"
                  placeholder="Buscar producto..."
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {searchQuery ? (
                filteredProducts.length > 0 ? (
                  filteredProducts.map((item: StoreProduct) => (
                    <Link
                      key={`${item._id}-${item.code || item.title}`}
                      className="w-full border-b border-gray-200 flex items-center gap-4 px-3 py-2"
                      href={{
                        pathname: `/${item.code || item._id}`,
                        query: {
                          _id: item._id,
                          brand: item.brand,
                          category: item.category,
                          description: item.description,
                          image: item.image,
                          isNew: item.isNew,
                          oldPrice: item.oldPrice,
                          price: item.price,
                          title: item.title,
                        },
                      }}
                      onClick={() => {
                        setSearchQuery("");
                        setMobileSearchOpen(false);
                      }}
                    >
                      <SearchProducts item={item} />
                    </Link>
                  ))
                ) : (
                  <div className="bg-gray-50 flex items-center justify-center py-8">
                    <p className="text-sm font-semibold">No hay coincidencias.</p>
                  </div>
                )
              ) : (
                <div className="px-4 py-6 text-sm text-gray-500">
                  Escribe para buscar productos.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;

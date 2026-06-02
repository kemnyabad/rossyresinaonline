import Image from "next/image";
import logo from "../../images/logo.jpg";
import {
  MagnifyingGlassIcon,
  CameraIcon,
  UserIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
  TagIcon,
  SparklesIcon,
  GiftIcon,
  BookOpenIcon,
  ChevronDownIcon,
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

const RESINY_IMAGE = "/resiny.png";

const Header = () => {
  const router = useRouter();
  const isHomePage = router.pathname === "/";
  const isResinyPage = router.pathname === "/resiny" || router.pathname.startsWith("/resiny/");
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
  const [selectedSearchCategory, setSelectedSearchCategory] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchCategoryOpen, setSearchCategoryOpen] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null);
  const searchCategoryRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sellerContext, setSellerContext] = useState<any>(null);
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
    }
  };
  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    const category = searchCategories.find((item) => item.value === selectedSearchCategory);
    if (!q && category?.value) {
      router.push(category.href);
    } else {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (category?.value) params.set("category", category.value);
      const query = params.toString();
      router.push(query ? `/search?${query}` : "/search");
    }
    setMobileSearchOpen(false);
  };

  const mobileMenuItems = [
    { href: "/categoria/moldes-de-silicona", label: "Moldes", icon: SparklesIcon },
    { href: "/categoria/pigmentos", label: "Pigmentos", icon: SparklesIcon },
    { href: "/categoria/accesorios", label: "Accesorios", icon: TagIcon },
    { href: "/categoria/resina", label: "Resina", icon: SparklesIcon },
    { href: "/categoria/creaciones", label: "Creaciones", icon: SparklesIcon },
    { href: "/mercado-creativo", label: "Mercado Creativo", icon: ShoppingBagIcon },
    { href: "/escuela", label: "Escuela", icon: BookOpenIcon },
    { href: "/productos?ofertas=1", label: "Ofertas", icon: GiftIcon },
    { href: "/rifas", label: "Rifas", icon: GiftIcon },
    { href: "/track-orders", label: "Mis pedidos", icon: ShoppingCartIcon },
  ];
  const searchCategories = useMemo(() => [
    { label: "Categorías", value: "", href: "/search", terms: [] as string[] },
    { label: "Moldes", value: "moldes", href: "/categoria/moldes-de-silicona", terms: ["molde", "silicona"] },
    { label: "Resina", value: "resina", href: "/categoria/resina", terms: ["resina", "epoxi", "epoxica", "uv"] },
    { label: "Pigmentos", value: "pigmentos", href: "/categoria/pigmentos", terms: ["pigmento", "mica", "tinte", "colorante"] },
    { label: "Accesorios", value: "accesorios", href: "/categoria/accesorios", terms: ["accesorio", "dije", "llavero", "arete", "collar", "gancho"] },
    { label: "Creaciones", value: "creaciones", href: "/categoria/creaciones", terms: ["creacion", "creaciones"] },
  ], []);
  const currentSearchCategory =
    searchCategories.find((category) => category.value === selectedSearchCategory) || searchCategories[0];

  const filteredProducts = useMemo(() => {
    const normalizeSearchText = (value: string) =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    const q = normalizeSearchText(deferredQuery.trim());
    const category = searchCategories.find((item) => item.value === selectedSearchCategory);
    if (!q && !category?.value) return [];
    const terms = q.split(/\s+/).filter(Boolean);
    return allData.filter((item: StoreProduct) => {
      const hay = [item.title, item.category, item.brand, item.code, item.description]
        .filter(Boolean)
        .join(" ")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      const matchesQuery = terms.every((term) => hay.includes(term));
      const matchesCategory = !category?.terms.length || category.terms.some((term) => hay.includes(term));
      return matchesQuery && matchesCategory;
    });
  }, [deferredQuery, allData, selectedSearchCategory, searchCategories]);

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
    if (!searchCategoryOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (!searchCategoryRef.current) return;
      if (!searchCategoryRef.current.contains(e.target as Node)) {
        setSearchCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [searchCategoryOpen]);

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
  const isSeller = sellerContext?.role === "SELLER";

  useEffect(() => {
    if (!isAuthenticated) {
      setSellerContext(null);
      return;
    }
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

  return (
    <div className="w-full bg-[#86b817] text-white sticky top-0 z-50 border-b border-[#749f14] shadow-sm">
      <div className="lg:hidden border-b border-white/20 bg-[#86b817] px-3 pb-3 pt-2">
        {isHomePage && !isResinyPage ? (
          <div className="flex h-12 items-center overflow-hidden rounded-full border-2 border-white bg-white shadow-sm">
            <label htmlFor="home-mobile-search-category" className="sr-only">Categoría</label>
            <select
              id="home-mobile-search-category"
              value={selectedSearchCategory}
              onChange={(e) => setSelectedSearchCategory(e.target.value)}
              className="h-full w-[112px] shrink-0 border-r border-gray-200 bg-gray-50 pl-4 pr-2 text-xs font-semibold text-gray-700 outline-none"
              aria-label="Filtrar por categoría"
            >
              {searchCategories.map((category) => (
                <option key={category.value || "all"} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setMobileSearchOpen(true)}
              className="relative h-full min-w-0 flex-1 pl-4 pr-20 text-left text-base text-gray-500"
              aria-label="Abrir buscador"
            >
              <span className="block truncate">{searchQuery || "Buscar productos"}</span>
              <span className="absolute right-12 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-700">
                <CameraIcon className="h-5 w-5" />
              </span>
              <span className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-amazon_blue text-white">
                <MagnifyingGlassIcon className="h-6 w-6 stroke-[2.5]" />
              </span>
            </button>
          </div>
        ) : (
        <>
        {!isResinyPage && <div>
          <div className="flex h-11 overflow-hidden rounded-xl border border-white bg-white shadow-sm">
            <label htmlFor="mobile-header-search-category" className="sr-only">Categoría</label>
            <select
              id="mobile-header-search-category"
              value={selectedSearchCategory}
              onChange={(e) => setSelectedSearchCategory(e.target.value)}
              className="w-[112px] shrink-0 border-r border-gray-200 bg-gray-50 px-3 text-xs font-semibold text-gray-700 outline-none"
              aria-label="Filtrar por categoría"
            >
              {searchCategories.map((category) => (
                <option key={category.value || "all"} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setMobileSearchOpen(true)}
              className="relative min-w-0 flex-1 pl-10 pr-3 text-left text-sm text-gray-500 transition-colors"
              aria-label="Abrir buscador"
            >
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <span className="block truncate">{searchQuery || "Buscar productos..."}</span>
            </button>
          </div>
        </div>}
        </>
        )}
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[58]" role="dialog" aria-modal="true" aria-label="Menú de tienda">
          <button
            type="button"
            className="absolute inset-0 h-full w-full bg-slate-950/35"
            aria-label="Cerrar menú"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div id="mobile-store-menu" className="absolute left-3 right-3 top-[76px] mx-auto max-w-md overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0_14px_34px_rgba(17,24,39,0.14)]">
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
            <div className="grid gap-2 border-b border-gray-100 bg-[#fff7fb] p-3">
              <p className="px-1 text-xs font-bold uppercase tracking-wide text-slate-500">Usuario</p>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={isAuthenticated ? "/account" : "/sign-in?callbackUrl=/account"}
                  className="flex min-h-[50px] items-center gap-3 rounded-xl border border-pink-100 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-800"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff0f7] text-[#e4147f]">
                    <UserIcon className="h-5 w-5" />
                  </span>
                  Mi cuenta
                </Link>
                <Link
                  href="/vende-con-nosotros"
                  className="flex min-h-[50px] items-center gap-3 rounded-xl border border-pink-100 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-800"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff0f7] text-[#e4147f]">
                    <ShoppingBagIcon className="h-5 w-5" />
                  </span>
                  <span className="leading-tight">
                    <span className="block">Vende con nosotros</span>
                    <span className="block text-xs font-semibold text-slate-500">Modo beta</span>
                  </span>
                </Link>
              </div>
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
                        ? "border-amazon_blue bg-white text-amazon_blue"
                        : "border-gray-100 bg-white text-slate-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amazon_blue text-amazon_blue">
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

      <div className="hidden lg:flex max-w-screen-2xl mx-auto min-h-[76px] px-3 py-2 sm:px-4 md:px-6 xl:px-8 items-center gap-3 lg:gap-5">
        {/* logo */}
        <Link
          href={"/"}
          onClick={handleLogoClick}
          className="group flex cursor-pointer items-center justify-center rounded-md py-1.5 pr-3 transition-colors duration-200"
        >
          <div className="flex min-w-[250px] items-center gap-3.5">
            <div className="relative shrink-0 overflow-hidden rounded-full bg-white shadow-[0_6px_18px_rgba(17,24,39,0.16)] ring-2 ring-white transition-all duration-200 group-hover:-translate-y-0.5 group-hover:ring-[#e4147f]">
              <Image className="h-[58px] w-[58px] object-contain" src={logo} alt="Logo Rossy Resina" priority />
            </div>
            <div className="h-12 w-[3px] shrink-0 rounded-full bg-[#e4147f] shadow-[0_0_0_1px_rgba(255,255,255,0.18)] transition-all duration-200 group-hover:h-14" />
            <div className="flex min-w-0 flex-col justify-center">
              <span className="truncate text-[24px] font-bold leading-7 text-[#e4147f] [text-shadow:1.5px_0_0_#fff,-1.5px_0_0_#fff,0_1.5px_0_#fff,0_-1.5px_0_#fff,1px_1px_0_#fff,-1px_1px_0_#fff,1px_-1px_0_#fff,-1px_-1px_0_#fff]">
                Rossy Resina
              </span>
              <span className="mt-0.5 truncate text-[13px] font-medium leading-5 text-white/85">
                Tienda de Artesania
              </span>
            </div>
          </div>
        </Link>

        {isResinyPage && (
          <div className="flex min-w-0 items-center gap-2 border-l border-white/30 pl-4">
            <span className="relative h-16 w-16 shrink-0">
              <Image src={RESINY_IMAGE} alt="Resiny" fill className="object-contain" priority />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-lg font-bold text-white">Resiny</p>
              <p className="truncate text-xs font-medium text-white/80">Asistente de Rossy Resina</p>
            </div>
          </div>
        )}

        {/* mobile search */}
        {!isResinyPage && <div className="lg:hidden flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setMobileSearchOpen(true)}
            className="relative w-full h-10 rounded-full pl-10 pr-4 text-left text-sm text-gray-500 border border-gray-300 bg-white"
            aria-label="Abrir buscador"
          >
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <span>{searchQuery || "Buscar producto..."}</span>
          </button>
        </div>}

        {/* searchbar */}
        {!isResinyPage && <div className="hidden lg:flex flex-1 min-w-[220px] items-center justify-center">
          <form onSubmit={submitSearch} className="w-full max-w-3xl h-11 inline-flex items-center justify-between relative rounded-full border border-white bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#e4147f]/35">
            <div ref={searchCategoryRef} className="relative h-full w-[168px] shrink-0">
              <button
                type="button"
                onClick={() => setSearchCategoryOpen((open) => !open)}
                className="flex h-full w-full items-center justify-between gap-2 rounded-l-full border-r border-gray-200 bg-[#f8fafc] pl-5 pr-3 text-left text-sm font-bold text-slate-800 transition-colors hover:bg-white"
                aria-haspopup="listbox"
                aria-expanded={searchCategoryOpen}
                aria-label="Filtrar por categoría"
              >
                <span className="truncate">{currentSearchCategory.label}</span>
                <ChevronDownIcon className={`h-4 w-4 shrink-0 text-slate-600 transition-transform ${searchCategoryOpen ? "rotate-180" : ""}`} />
              </button>
              {searchCategoryOpen && (
                <div
                  className="absolute left-0 top-[calc(100%+8px)] z-40 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 text-sm text-slate-800 shadow-[0_18px_40px_rgba(15,23,42,0.18)]"
                  role="listbox"
                >
                  {searchCategories.map((category) => {
                    const active = category.value === selectedSearchCategory;
                    return (
                      <button
                        key={category.value || "all"}
                        type="button"
                        onClick={() => {
                          setSelectedSearchCategory(category.value);
                          setSearchCategoryOpen(false);
                          if (category.value) {
                            router.push(category.href);
                          }
                        }}
                        className={`flex h-10 w-full items-center justify-between px-4 text-left font-semibold transition-colors ${
                          active
                            ? "bg-[#fff4f9] text-[#e4147f]"
                            : "text-slate-700 hover:bg-[#f5fbfc] hover:text-[#10aebb]"
                        }`}
                        role="option"
                        aria-selected={active}
                      >
                        <span>{category.label}</span>
                        {active ? <span className="h-2 w-2 rounded-full bg-[#e4147f]" /> : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <input
              onChange={handleSearch}
              value={searchQuery}
              className="h-full min-w-0 flex-1 bg-transparent pl-4 pr-28 text-sm text-black outline-none placeholder:text-xs placeholder:text-gray-400"
              type="text"
              placeholder="Buscar productos..."
            />
            <button type="submit" className="absolute right-0 top-0 h-full px-5 rounded-full bg-amazon_blue text-white text-sm font-semibold hover:brightness-95 transition-all duration-300 hover:shadow-md">Buscar</button>
            {/* ========== Searchfield ========== */}
            {searchQuery && (
              <div className="absolute left-0 top-12 z-20 w-full mx-auto max-h-96 bg-gray-100 rounded-lg overflow-y-scroll cursor-pointer text-black border border-gray-200">
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
        </div>}

        {/* actions */}
        <div className={`ml-auto flex flex-none items-center justify-end gap-3 lg:gap-4 ${isResinyPage ? "min-w-0" : "min-w-[360px] lgl:min-w-[500px] lgl:max-w-[560px]"}`}>
          <Link
            href={isAuthenticated ? "/account" : "/sign-in?callbackUrl=/account"}
              className="lg:hidden p-2 rounded-full border border-white/35 text-white hover:border-white"
            aria-label={isAuthenticated ? "Ir a mi perfil" : "Iniciar sesión"}
          >
            <UserIcon className="w-5 h-5" />
          </Link>

          <Link
            href="/vende-con-nosotros"
            className="group hidden min-h-[48px] items-center gap-3 rounded-lg border border-transparent px-2 py-2 text-sm text-white transition-colors hover:border-white hover:bg-white hover:text-[#e4147f] md:flex lgl:px-3"
            aria-label="Vende con nosotros"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 text-slate-700 ring-1 ring-gray-200 transition-colors group-hover:bg-white group-hover:text-[#e4147f] group-hover:ring-[#e4147f]">
              <ShoppingBagIcon className="h-5 w-5" />
            </span>
            <div className="hidden min-w-0 leading-tight text-left lgl:block">
              <div className="whitespace-nowrap text-[15px] font-semibold text-white transition-colors group-hover:text-[#e4147f]">Vende con nosotros</div>
              <div className="mt-0.5 text-xs font-semibold text-white/75 transition-colors group-hover:text-[#e4147f]/75">Modo beta</div>
            </div>
          </Link>

          <div className="relative hidden md:block" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="group flex min-h-[48px] items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm text-white transition-colors hover:border-white hover:bg-white hover:text-[#e4147f]"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
            >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 text-slate-700 ring-1 ring-gray-200 transition-colors group-hover:bg-white group-hover:text-[#e4147f] group-hover:ring-[#e4147f]">
                <UserIcon className="w-5 h-5" />
              </span>
              <div className="min-w-0 leading-tight text-left">
                <div className="text-xs font-semibold text-white/80 transition-colors group-hover:!text-[#e4147f]">Cuenta</div>
                <div className="whitespace-nowrap text-[15px] font-semibold text-white transition-colors group-hover:text-[#e4147f]">Mi perfil</div>
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
                      href="/track-orders"
                      className="flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      Mis pedidos
                    </Link>
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
                {isAuthenticated && (
                  <div className="grid gap-1 p-2 text-slate-800">
                    <Link href="/account" className="flex min-h-[42px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-[#fff4f9] hover:text-[#e4147f]">
                      <UserIcon className="h-4 w-4 text-[#e4147f]" />
                      Mi Cuenta
                    </Link>
                    {isSeller && (
                      <Link href="/mi-tienda" className="flex min-h-[42px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-[#fff4f9] hover:text-[#e4147f]">
                        <ShoppingBagIcon className="h-4 w-4 text-[#e4147f]" />
                        Mi Tienda
                      </Link>
                    )}
                    <Link href="/vende-con-nosotros" className="flex min-h-[42px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-[#fff4f9] hover:text-[#e4147f]">
                      <ShoppingBagIcon className="h-4 w-4 text-[#e4147f]" />
                      <span className="leading-tight">
                        <span className="block">Vende con nosotros</span>
                        <span className="block text-xs font-semibold text-slate-500">Modo beta</span>
                      </span>
                    </Link>
                    <Link href="/track-orders" className="flex min-h-[42px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-[#fff4f9] hover:text-[#e4147f]">
                      <ShoppingCartIcon className="h-4 w-4 text-[#e4147f]" />
                      Mis pedidos
                    </Link>
                    <Link href="/messages" className="flex min-h-[42px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-[#fff4f9] hover:text-[#e4147f]">
                      <MdOutlineEmail className="h-4 w-4 text-[#e4147f]" />
                      Centro de mensajes
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* cart */}
          {!isResinyPage && (
            <Link
              href="/cart"
              className="group relative flex min-h-[48px] cursor-pointer items-center rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-white hover:bg-white"
              aria-label="Abrir carrito"
            >
              <span className="flex items-center gap-3 relative">
                <div className="relative">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-slate-700 ring-1 ring-gray-200 transition-colors group-hover:bg-white group-hover:text-[#e4147f] group-hover:ring-[#e4147f]">
                    <ShoppingCartIcon className="w-6 h-6" />
                  </span>
                  <span className="absolute -top-1 -right-1 bg-amazon_blue text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-white">
                    {cartCount}
                  </span>
                </div>
                <div className="hidden md:block min-w-[78px] leading-tight text-left">
                  <div className="text-xs font-semibold text-white/80 transition-colors group-hover:!text-[#e4147f]">Tu carrito</div>
                  <div className="text-[15px] font-semibold text-white transition-colors group-hover:text-[#e4147f]"><FormattedPrice amount={cartSubtotal} /></div>
                </div>
              </span>
            </Link>
          )}
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-white">
          <div className="h-full flex flex-col">
            <div className="px-3 py-3 border-b border-gray-200 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="h-10 px-3 rounded-full border border-gray-300 text-sm text-gray-700"
              >
                Cerrar
              </button>
              <label htmlFor="mobile-search-category" className="sr-only">Categoría</label>
              <select
                id="mobile-search-category"
                value={selectedSearchCategory}
                onChange={(e) => setSelectedSearchCategory(e.target.value)}
                className="h-11 w-[108px] shrink-0 rounded-full border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-700 outline-none"
                aria-label="Filtrar por categoría"
              >
                {searchCategories.map((category) => (
                  <option key={category.value || "all"} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
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

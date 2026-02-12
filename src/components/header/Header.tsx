import Image from "next/image";
import logo from "../../images/logo.jpg";
import cartIcon from "@/images/cartlcon.png";
import { BiCaretDown } from "react-icons/bi";
import { HiOutlineSearch, HiOutlineUser } from "react-icons/hi";
import { FaHeart } from "react-icons/fa";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { StateProps, StoreProduct } from "../../../type";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { addUser, deleteProduct } from "@/store/nextSlice";
import SearchProducts from "../SearchProducts";
import { IoMdClose } from "react-icons/io";
import FormattedPrice from "@/components/FormattedPrice";

const Header = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [allData, setAllData] = useState([]);

  const { productData, favoriteData, userInfo, allProducts } = useSelector(
    (state: StateProps) => state.next
  );
  const dispatch = useDispatch();
  useEffect(() => {
    setAllData(allProducts.allProducts);
  }, [allProducts]);
  useEffect(() => {
    if (session) {
      dispatch(
        addUser({
          name: session?.user?.name,
          email: session?.user?.email,
          image: session?.user?.image,
        })
      );
    }
  }, [session, dispatch]);

  // Search area
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [openCategories, setOpenCategories] = useState(false);
  const [openCartDropdown, setOpenCartDropdown] = useState(false);
  const [openCartDrawer, setOpenCartDrawer] = useState(false);
  const catRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchRef = useRef<HTMLDivElement | null>(null);
  const catLinks = [
    { slug: "moldes-de-silicona", label: "Moldes de silicona" },
    { slug: "pigmentos", label: "Pigmentos" },
    { slug: "accesorios", label: "Accesorios" },
    { slug: "resina", label: "Resina" },
    { slug: "creaciones", label: "Creaciones" },
    { slug: "talleres", label: "Talleres" },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const filtered = allData.filter((item: StoreProduct) =>
      item.title.toLocaleLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, allData]);

  useEffect(() => {
    const handleRouteChange = () => setOpenCartDropdown(false);
    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    const onDown = (e: MouseEvent | TouchEvent) => {
      const el = catRef.current;
      if (openCategories && el && !el.contains(e.target as Node)) {
        setOpenCategories(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (openCategories && e.key === "Escape") setOpenCategories(false);
    };
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("touchstart", onDown, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("touchstart", onDown, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [openCategories]);

  const cartSubtotal = productData.reduce((s: number, p: any) => s + p.price * p.quantity, 0);
  const favoriteCount = favoriteData ? favoriteData.length : 0;

  return (
    <div className="w-full bg-white text-black sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-screen-2xl mx-auto h-20 px-4 md:px-6 flex items-center gap-4">
        {/* logo */}
        <Link
          href={"/"}
          className="px-2 cursor-pointer duration-300 flex items-center justify-center"
        >
          <div className="flex items-center gap-2">
            <div className="bg-white rounded-full p-1.5 shadow-md ring-2 ring-amazon_blue/20">
              <Image className="h-12 w-12 md:h-14 md:w-14 object-contain rounded-full" src={logo} alt="Logo Rossy Resina" priority />
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-amazon_blue font-semibold text-base md:text-lg">Rossy Resina</span>
              <span className="text-xs text-gray-500 hidden md:block">Resina, moldes y pigmentos</span>
            </div>
          </div>
        </Link>

        {/* searchbar */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div ref={catRef} className="w-full max-w-2xl h-11 inline-flex items-center justify-between relative">
            <input
              onChange={handleSearch}
              value={searchQuery}
              className="w-full h-full rounded-full pl-28 pr-28 placeholder:text-xs text-sm text-black border border-gray-300 outline-none focus-visible:border-amazon_blue"
              type="text"
              placeholder="Buscar productos..."
            />
            <button
              onClick={() => setOpenCategories((v) => !v)}
              className="absolute left-0 top-0 h-full w-24 bg-gray-100 text-black text-xs rounded-full flex items-center justify-center gap-1 px-2 hover:bg-gray-200"
            >
              Categorías <BiCaretDown />
            </button>
            <button className="absolute right-0 top-0 h-full px-5 rounded-full bg-amazon_blue text-white text-sm font-semibold hover:brightness-95">Buscar</button>
            {openCategories && (
              <div className="absolute left-0 top-12 bg-white text-black rounded-md shadow-lg grid grid-cols-1 md:grid-cols-2 gap-2 p-3 z-50 border border-gray-200">
                {catLinks.map((c) => (
                  <Link key={c.slug} href={`/categoria/${c.slug}`} className="px-3 py-2 rounded hover:bg-gray-100" onClick={() => setOpenCategories(false)}>
                    {c.label}
                  </Link>
                ))}
              </div>
            )}
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
                      No hay coincidencias con tu búsqueda. Inténtalo de nuevo.
                    </p>
                  </div>
                )}
              </div>
            )}
            {/* ========== Searchfield ========== */}
          </div>
        </div>

        {/* actions */}
        <div className="ml-auto md:ml-0 flex items-center gap-4">
          <Link
            href={userInfo ? "/account" : "/sign-in"}
            className="hidden md:flex items-center gap-2 text-sm text-gray-700 hover:text-amazon_blue"
          >
            <HiOutlineUser className="text-xl" />
            <div className="leading-tight">
              <div className="text-xs text-gray-500">Cuenta</div>
              <div className="font-semibold">Mi perfil</div>
            </div>
          </Link>
          <Link
            href="/favorite"
            className="hidden md:flex items-center gap-2 text-sm text-gray-700 hover:text-amazon_blue relative"
          >
            <FaHeart className="text-xl" />
            {favoriteCount > 0 && (
              <span className="absolute -top-2 left-3 bg-amazon_blue text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                {favoriteCount}
              </span>
            )}
            <div className="leading-tight">
              <div className="text-xs text-gray-500">Favoritos</div>
              <div className="font-semibold">Guardados</div>
            </div>
          </Link>

          {/* cart with dropdown */}
          <div
            className="px-2 cursor-pointer duration-300 h-[70%] relative flex items-center"
            onMouseEnter={() => {
              if (productData.length && !openCartDrawer) {
                setOpenCategories(false);
                setOpenCartDropdown(true);
              }
            }}
            onMouseLeave={() => setOpenCartDropdown(false)}
          >
            <button
              type="button"
              onClick={() => {
                setOpenCartDrawer(true);
                setOpenCartDropdown(false);
              }}
              className="flex items-center gap-2 relative"
              aria-label="Abrir carrito"
            >
              <div className="relative">
                <Image
                  className="h-10 w-10 object-contain"
                  src={cartIcon}
                  alt="carrito"
                />
                <span className="absolute -top-2 -right-2 bg-amazon_blue text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                  {productData ? productData.length : 0}
                </span>
              </div>
              <div className="hidden sm:block leading-tight text-left">
                <div className="text-xs text-gray-500">Tu carrito</div>
                <div className="text-sm font-semibold text-amazon_blue"><FormattedPrice amount={cartSubtotal} /></div>
              </div>
            </button>
            {productData.length > 0 && openCartDropdown && (
              <div className="absolute right-0 top-12 bg-white text-black rounded-md shadow-lg w-80 z-50 border border-gray-200">
                <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-semibold">Resumen del carrito</span>
                  <Link href="/cart" className="text-xs text-amazon_blue hover:underline" onClick={() => setOpenCartDropdown(false)}>Ver todo</Link>
                </div>
                <div className="max-h-64 overflow-y-auto p-3 grid gap-3">
                  {productData.slice(0, 4).map((item: StoreProduct) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <Image src={((): string => { const s = String(item.image || ""); let u = s.replace(/\\/g, "/"); if (/^https?:\/\//i.test(u)) return u; return u ? (u.startsWith("/") ? u : "/" + u) : "/favicon-96x96.png"; })()} alt={item.title} width={48} height={48} className="rounded object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                        <p className="text-xs text-gray-600">x{item.quantity} · <span className="text-amazon_blue font-semibold"><FormattedPrice amount={item.price * item.quantity} /></span></p>
                      </div>
                      <button
                        onClick={() => dispatch(deleteProduct(item._id))}
                        className="text-gray-400 hover:text-red-600"
                        aria-label="Eliminar"
                      >
                        <IoMdClose />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-sm">Subtotal</span>
                  <span className="text-sm font-semibold text-amazon_blue">
                    <FormattedPrice amount={cartSubtotal} />
                  </span>
                </div>
                <div className="p-3">
                  <Link href="/checkout" className="block w-full text-center px-3 py-2 rounded-md bg-amazon_blue text-white hover:brightness-95" onClick={() => setOpenCartDropdown(false)}>Checkout</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* cart drawer */}
      {openCartDrawer && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenCartDrawer(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white text-black shadow-xl flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <span className="text-lg font-semibold">Tu carrito</span>
              <button onClick={() => setOpenCartDrawer(false)} className="text-gray-500 hover:text-gray-800" aria-label="Cerrar">
                <IoMdClose />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid gap-4">
              {productData.length > 0 ? (
                productData.map((item: StoreProduct) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <Image src={((): string => { const s = String(item.image || ""); let u = s.replace(/\\/g, "/"); if (/^https?:\/\//i.test(u)) return u; return u ? (u.startsWith("/") ? u : "/" + u) : "/favicon-96x96.png"; })()} alt={item.title} width={56} height={56} className="rounded object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                      <p className="text-xs text-gray-600">x{item.quantity} · <span className="text-amazon_blue font-semibold"><FormattedPrice amount={item.price * item.quantity} /></span></p>
                    </div>
                    <button onClick={() => dispatch(deleteProduct(item._id))} className="text-gray-400 hover:text-red-600" aria-label="Eliminar">
                      <IoMdClose />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-600">Tu carrito está vacío.</div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-semibold text-amazon_blue"><FormattedPrice amount={cartSubtotal} /></span>
              </div>
              <Link href="/cart" className="block w-full text-center px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50" onClick={() => setOpenCartDrawer(false)}>Ver carrito</Link>
              <Link href="/checkout" className="block w-full text-center px-3 py-2 rounded-md bg-amazon_blue text-white hover:brightness-95" onClick={() => setOpenCartDrawer(false)}>Checkout</Link>
            </div>
          </div>
        </div>
      )}

      {/* mobile search */}
      <div className="md:hidden px-4 pb-3">
        <div ref={mobileSearchRef} className="relative">
          <input
            onChange={handleSearch}
            value={searchQuery}
            className="w-full h-10 rounded-full pl-10 pr-4 placeholder:text-xs text-sm text-black border border-gray-300 outline-none focus-visible:border-amazon_blue"
            type="text"
            placeholder="Buscar producto..."
          />
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          {searchQuery && (
            <div className="absolute left-0 top-12 w-full max-h-72 bg-white rounded-lg overflow-y-auto shadow-lg text-black z-50 border border-gray-200">
              {filteredProducts.length > 0 ? (
                <>
                  {filteredProducts.map((item: StoreProduct) => (
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
                      onClick={() => setSearchQuery("")}
                    >
                      <SearchProducts item={item} />
                    </Link>
                  ))}
                </>
              ) : (
                <div className="bg-gray-50 flex items-center justify-center py-6 rounded-lg">
                  <p className="text-sm font-semibold">No hay coincidencias.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;

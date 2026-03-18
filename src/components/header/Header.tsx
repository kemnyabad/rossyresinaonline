import Image from "next/image";
import logo from "../../images/logo.jpg";
import cartIcon from "@/images/cartlcon.png";
import { HiOutlineSearch, HiOutlineUser } from "react-icons/hi";
import { FaHeart } from "react-icons/fa";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { StateProps, StoreProduct } from "../../../type";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { addUser } from "@/store/nextSlice";
import SearchProducts from "../SearchProducts";
import FormattedPrice from "@/components/FormattedPrice";

const Header = () => {
  const { data: session } = useSession();
  const [allData, setAllData] = useState<StoreProduct[]>([]);

  const { productData, favoriteData, userInfo, allProducts } = useSelector(
    (state: StateProps) => state.next
  );
  const dispatch = useDispatch();
  useEffect(() => {
    const list = Array.isArray(allProducts?.allProducts) ? allProducts.allProducts : [];
    if (list.length > 0) {
      setAllData(list);
      return;
    }

    let mounted = true;
    fetch("/api/products")
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
  const [filteredProducts, setFilteredProducts] = useState<StoreProduct[]>([]);
  const mobileSearchRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setFilteredProducts([]);
      return;
    }
    const filtered = allData.filter((item: StoreProduct) => {
      const hay = [
        item.title,
        item.category,
        item.brand,
        item.code,
        item.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
    setFilteredProducts(filtered);
  }, [searchQuery, allData]);

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
          <div className="w-full max-w-2xl h-11 inline-flex items-center justify-between relative">
            <input
              onChange={handleSearch}
              value={searchQuery}
              className="w-full h-full rounded-full pl-4 pr-28 placeholder:text-xs text-sm text-black border border-gray-300 outline-none focus-visible:border-amazon_blue"
              type="text"
              placeholder="Buscar productos..."
            />
            <button className="absolute right-0 top-0 h-full px-5 rounded-full bg-amazon_blue text-white text-sm font-semibold hover:brightness-95">Buscar</button>
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
          <div className="relative hidden md:block" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-amazon_blue"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
            >
              <HiOutlineUser className="text-xl" />
              <div className="leading-tight text-left">
                <div className="text-xs text-gray-500">Cuenta</div>
                <div className="font-semibold">Mi perfil</div>
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] w-72 rounded-xl border border-gray-200 bg-white shadow-lg z-50">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    {userInfo?.image ? (
                      <Image
                        src={userInfo.image}
                        alt="Avatar"
                        width={44}
                        height={44}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-11 w-11 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-semibold">
                        {(userInfo?.name || userInfo?.email || "U").slice(0, 1)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Bienvenido de nuevo</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {userInfo?.name || userInfo?.email || "Invitado"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    {userInfo ? (
                      <button
                        type="button"
                        onClick={() => signOut()}
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
                <div className="py-2">
                  <Link href="/account" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                    Mi Cuenta
                  </Link>
                  <Link href="/track-orders" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                    Mis pedidos
                  </Link>
                  <Link href="/favorite" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                    Lista de deseos
                  </Link>
                  <Link href="/messages" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                    Centro de mensajes
                  </Link>
                </div>
              </div>
            )}
          </div>
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

          {/* cart */}
          <Link
            href="/cart"
            className="px-2 cursor-pointer duration-300 h-[70%] relative flex items-center"
            aria-label="Abrir carrito"
          >
            <span className="flex items-center gap-2 relative">
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
            </span>
          </Link>
        </div>
      </div>

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

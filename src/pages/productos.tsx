import Head from "next/head";
import Products from "@/components/Products";
import MarketplaceProductGrid from "@/components/MarketplaceProductGrid";
import StoreWithAdsLayout from "@/components/store/StoreWithAdsLayout";
import type { ProductProps } from "../../type";
import { useMemo } from "react";
import { useRouter } from "next/router";
import { filterAndSortProducts } from "@/lib/services/productCatalogService";
import { getAllProducts } from "@/lib/repositories/productRepository";
import { getPublishedMarketplaceProducts } from "@/lib/marketplaceStore";
import { absoluteImageUrl, absoluteUrl, truncateMeta } from "@/lib/seo";
import { useLiveProducts } from "@/lib/useLiveProducts";

interface Props {
  allProducts: ProductProps[];
  marketplaceProducts: any[];
}

type AttributeFilterOption = {
  id: string;
  label: string;
  all?: string[];
  any: string[];
};

const attributeFilterGroups: Array<{
  id: string;
  label: string;
  options: AttributeFilterOption[];
}> = [
  {
    id: "tipo",
    label: "Tipo de producto",
    options: [
      { id: "moldes", label: "Moldes", any: ["molde", "moldes", "silicona"] },
      {
        id: "moldes-resina-epoxica",
        label: "Moldes para resina epóxica",
        all: ["molde"],
        any: ["resina epoxica", "resina epóxica", "epoxi", "epoxy", "silicona"],
      },
      { id: "eco-resina", label: "Eco resina", all: ["resina"], any: ["eco resina", "ecoresina", "ecologica", "ecológica", "al agua"] },
      { id: "pigmentos", label: "Pigmentos", any: ["pigmento", "pigmentos", "mica", "tinte", "colorante", "perlado", "metalico", "metálico"] },
      { id: "accesorios", label: "Accesorios", any: ["accesorio", "accesorios", "vaso", "taladro", "herramienta", "glitter", "escarcha", "dije", "arete", "pendiente", "llavero"] },
    ],
  },
  {
    id: "forma",
    label: "Forma",
    options: [
      { id: "circular", label: "Circular", any: ["circular", "circulo", "círculo", "redondo", "redonda", "esfera", "aro"] },
      { id: "corazon", label: "Corazón", any: ["corazon", "corazón", "heart"] },
      { id: "dijes", label: "Dijes", any: ["dije", "dijes", "pendiente", "arete", "aretes", "collar"] },
      { id: "lapicero", label: "Lapicero", any: ["lapicero", "boligrafo", "bolígrafo", "pluma", "shaker"] },
      { id: "figuras", label: "Figuras", any: ["oso", "osito", "paloma", "lazo", "flor", "estrella", "zapato", "motocicleta", "figura"] },
    ],
  },
  {
    id: "ocasion",
    label: "Ocasión",
    options: [
      { id: "madre", label: "Madre", any: ["madre", "mama", "mamá", "dia de la madre", "día de la madre"] },
      { id: "padre", label: "Padre", any: ["padre", "papa", "papá", "dia del padre", "día del padre"] },
      { id: "navidad", label: "Navidad", any: ["navidad", "navideña", "navideno", "navideño", "esfera"] },
      { id: "quinceanera", label: "Quinceañera", any: ["quinceañera", "quinceanera", "15 años", "zapato"] },
      { id: "religioso", label: "Religioso", any: ["virgen", "guadalupe", "cruz", "rosario", "religioso"] },
    ],
  },
];

const priceRanges = [
  { id: "0-10", label: "Hasta S/ 10", min: 0, max: 10 },
  { id: "10-20", label: "S/ 10 a S/ 20", min: 10, max: 20 },
  { id: "20-50", label: "S/ 20 a S/ 50", min: 20, max: 50 },
  { id: "50-plus", label: "Más de S/ 50", min: 50, max: null },
];

function normalizeFilterText(value: unknown) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getSelectedValues(value: unknown) {
  const raw = Array.isArray(value) ? value.join(",") : String(value || "");
  return raw.split(",").map((item) => item.trim()).filter(Boolean);
}

function buildProductFilterText(product: ProductProps) {
  const variantText = Array.isArray(product.variants)
    ? product.variants.map((variant) => variant?.label || "").join(" ")
    : "";
  return normalizeFilterText(
    [
      product.title,
      product.category,
      product.description,
      product.code,
      product.brand,
      product.sku,
      product.barcode,
      variantText,
    ].join(" ")
  );
}

function includesFilterTerm(productText: string, term: string) {
  return productText.includes(normalizeFilterText(term));
}

function matchesAttributeOption(productText: string, optionId: string) {
  const option = attributeFilterGroups.flatMap((group) => group.options).find((item) => item.id === optionId);
  if (!option) return true;
  const matchesAll = (option.all || []).every((term) => includesFilterTerm(productText, term));
  const matchesAny = option.any.some((term) => includesFilterTerm(productText, term));
  return matchesAll && matchesAny;
}

function matchesAttributeFilters(product: ProductProps, selectedFilters: string[], selectedPrice: string) {
  const text = buildProductFilterText(product);
  const matchesAttributes = attributeFilterGroups.every((group) => {
    const selectedInGroup = group.options.filter((option) => selectedFilters.includes(option.id));
    if (selectedInGroup.length === 0) return true;
    return selectedInGroup.some((option) => matchesAttributeOption(text, option.id));
  });
  const range = priceRanges.find((item) => item.id === selectedPrice);
  const price = Number(product.price || 0);
  const matchesPrice = !range || (price >= range.min && (range.max === null || price <= range.max));
  return matchesAttributes && matchesPrice;
}

export default function ProductosPage({ allProducts, marketplaceProducts }: Props) {
  const router = useRouter();
  const { products: liveProducts } = useLiveProducts(allProducts);
  const categoryFromQuery = String(router.query?.categoria || "").trim();
  const selectedAttributeFilters = useMemo(() => getSelectedValues(router.query?.atributos), [router.query?.atributos]);
  const selectedPriceRange = String(router.query?.precio || "").trim();
  const onlyOffers = String(router.query?.ofertas || "").trim() === "1";
  const pageTitle = onlyOffers ? "Ofertas en resina y moldes | Rossy Resina" : "Productos de resina, moldes y pigmentos | Rossy Resina";
  const pageDescription = truncateMeta(
    onlyOffers
      ? "Encuentra ofertas en resina epóxica, moldes de silicona, pigmentos y accesorios para manualidades en Rossy Resina."
      : "Catálogo de productos Rossy Resina: resina epóxica, moldes de silicona, pigmentos, accesorios y creaciones con envío a todo Perú."
  );
  const canonical = absoluteUrl(onlyOffers ? "/productos?ofertas=1" : "/productos");

  const filteredProducts = useMemo(() => {
    const base = filterAndSortProducts(liveProducts, {
      category: categoryFromQuery,
      sort: "relevance",
    });
    const byFilter =
      selectedAttributeFilters.length > 0 || selectedPriceRange
        ? base.filter((p) => matchesAttributeFilters(p, selectedAttributeFilters, selectedPriceRange))
        : base;
    if (!onlyOffers) return byFilter;
    return byFilter.filter((p) => Number(p.oldPrice || 0) > Number(p.price || 0));
  }, [liveProducts, categoryFromQuery, selectedAttributeFilters, selectedPriceRange, onlyOffers]);

  const setAttributeFilter = (filterId: string) => {
    const nextQuery = { ...router.query };
    const nextFilters = selectedAttributeFilters.includes(filterId)
      ? selectedAttributeFilters.filter((item) => item !== filterId)
      : [...selectedAttributeFilters, filterId];
    if (nextFilters.length > 0) nextQuery.atributos = nextFilters.join(",");
    else delete nextQuery.atributos;
    delete nextQuery.page;
    delete nextQuery.pagina;
    router.push({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
  };

  const setPriceRange = (rangeId: string) => {
    const nextQuery = { ...router.query };
    if (rangeId && selectedPriceRange !== rangeId) nextQuery.precio = rangeId;
    else delete nextQuery.precio;
    delete nextQuery.page;
    delete nextQuery.pagina;
    router.push({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
  };

  const clearAttributeFilters = () => {
    const nextQuery = { ...router.query };
    delete nextQuery.atributos;
    delete nextQuery.precio;
    delete nextQuery.page;
    delete nextQuery.pagina;
    router.push({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
  };

  const activeFilterCount = selectedAttributeFilters.length + (selectedPriceRange ? 1 : 0);
  const filteredMarketplaceProducts = useMemo(() => {
    if (onlyOffers) return [];
    const target = categoryFromQuery.toLowerCase();
    return (marketplaceProducts || []).filter((product: any) => {
      if (!target) return true;
      return String(product.category || "").toLowerCase() === target || target === "creaciones";
    });
  }, [marketplaceProducts, categoryFromQuery, onlyOffers]);

  return (
    <StoreWithAdsLayout className="py-8">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} key="description" />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={absoluteImageUrl("/web-app-manifest-512x512.png")} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Head>

      <div className="min-w-0">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {onlyOffers ? "Productos en oferta" : "Todos los productos"}
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit rounded-lg border border-gray-200 bg-white p-4 shadow-[0_1px_3px_rgba(17,24,39,0.06)] lg:sticky lg:top-28">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wide text-gray-950">Filtros</h2>
                <p className="text-xs font-medium text-gray-500">{filteredProducts.length} productos</p>
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAttributeFilters}
                  className="text-xs font-bold text-amazon_blue hover:underline"
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className="divide-y divide-gray-100">
              {attributeFilterGroups.map((group) => (
                <fieldset key={group.id} className="py-4">
                  <legend className="mb-2 text-sm font-bold text-gray-900">{group.label}</legend>
                  <div className="grid gap-2">
                    {group.options.map((option) => {
                      const checked = selectedAttributeFilters.includes(option.id);
                      return (
                        <label key={option.id} className="flex cursor-pointer items-start gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => setAttributeFilter(option.id)}
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-amazon_blue focus:ring-amazon_blue"
                          />
                          <span className={checked ? "font-semibold text-gray-950" : ""}>{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}

              <fieldset className="py-4">
                <legend className="mb-2 text-sm font-bold text-gray-900">Precio</legend>
                <div className="grid gap-2">
                  {priceRanges.map((range) => {
                    const checked = selectedPriceRange === range.id;
                    return (
                      <label key={range.id} className="flex cursor-pointer items-start gap-2 text-sm text-gray-700">
                        <input
                          type="radio"
                          name="price-range"
                          checked={checked}
                          onChange={() => setPriceRange(range.id)}
                          className="mt-0.5 h-4 w-4 border-gray-300 text-amazon_blue focus:ring-amazon_blue"
                        />
                        <span className={checked ? "font-semibold text-gray-950" : ""}>{range.label}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </div>
          </aside>

          <div className="space-y-8">
          {filteredProducts.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
              No se encontraron productos.
            </div>
          ) : (
            <Products
              productData={filteredProducts}
              gridClass="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5"
            />
          )}
          {!onlyOffers && (
            <MarketplaceProductGrid
              products={filteredMarketplaceProducts}
              title={categoryFromQuery ? "Productos publicados" : "Productos del marketplace"}
              emptyText="Aun no hay productos publicados en el marketplace."
            />
          )}
          </div>
        </div>
      </div>
    </StoreWithAdsLayout>
  );
}

export async function getServerSideProps() {
  const [allProducts, marketplaceProducts] = await Promise.all([
    getAllProducts(),
    getPublishedMarketplaceProducts(),
  ]);
  return { props: { allProducts, marketplaceProducts: JSON.parse(JSON.stringify(marketplaceProducts)) } };
}

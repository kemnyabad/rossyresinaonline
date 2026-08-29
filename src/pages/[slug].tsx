import FormattedPrice from "@/components/FormattedPrice";
import { addToCart } from "@/store/nextSlice";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { FaStar, FaWhatsapp } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import type { ProductProps } from "../../type";
import Head from "next/head";
import { useRouter } from "next/router";
import Products from "@/components/Products";
import { getAllProducts } from "@/lib/repositories/productRepository";
import { useSession, signIn } from "next-auth/react";
import { formatProductTitle, formatDescriptionBullets, buildExtendedProductTitle } from "@/lib/textFormat";
import { trackViewContent } from "@/lib/metaPixel";
import { filterAndSortProducts } from "@/lib/services/productCatalogService";
import { absoluteImageUrl, absoluteUrl, breadcrumbJsonLd, truncateMeta } from "@/lib/seo";
import { getPresentationTotalPrice } from "@/lib/productPricing";
import { getBundlePromoLabel } from "@/lib/bundlePromo";
import WonPrizeBanner from "@/components/WonPrizeBanner";
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PlusIcon,
  ShareIcon,
  ShoppingCartIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { BoltIcon } from "@heroicons/react/24/solid";

interface Props {
  product: ProductProps | null;
  recs: ProductProps[];
  allProducts: ProductProps[];
}

type Review = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

const DynamicPage = ({ product, recs, allProducts }: Props) => {
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [justAdded, setJustAdded] = useState(false);
  const addNoticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackedViewContentId = useRef("");
  const mobileImageTouchStart = useRef<{ x: number; y: number } | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [mobileBuyBarReady, setMobileBuyBarReady] = useState(false);
  const [salesCount, setSalesCount] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [viewerReady, setViewerReady] = useState(false);
  const [mobileProductSearchOpen, setMobileProductSearchOpen] = useState(false);
  const [mobileProductSearchQuery, setMobileProductSearchQuery] = useState("");
  const [offerCtaText, setOfferCtaText] = useState("!PRODUCTOS EN OFERTA! APROVÉCHALO AHORA!");
  const [offerCtaVisible, setOfferCtaVisible] = useState(true);
  const [showShippingProcess, setShowShippingProcess] = useState(false);
  const [mobileTitleExpanded, setMobileTitleExpanded] = useState(false);
  const [mobileVariantsExpanded, setMobileVariantsExpanded] = useState(false);
  const [mobileShippingExpanded, setMobileShippingExpanded] = useState(false);
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const cartCount = useSelector((state: any) =>
    Array.isArray(state?.next?.productData)
      ? state.next.productData.reduce((sum: number, item: any) => sum + Number(item?.quantity || 1), 0)
      : 0
  );
  const router = useRouter();

  const getOptionalPrice = (value: unknown) => {
    const raw = String(value ?? "").trim();
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const normalizeImage = (img?: string) => {
    const s = String(img || "");
    const u = s.replace(/\\/g, "/");
    if (/^https?:\/\//i.test(u)) return u;
    const fixed = u.trim();
    return fixed ? (fixed.startsWith("/") ? fixed : "/" + fixed) : "/favicon-96x96.png";
  };

  const isProcessImage = (img?: string) => {
    const src = normalizeImage(img).toLowerCase();
    return (
      !img ||
      String(img).trim() === "" ||
      src.includes("sliderimg_") ||
      src.includes("favicon-96x96.png") ||
      src.includes("favicon") ||
      src.includes("/logo.png") ||
      src.includes("/logo.jpg") ||
      src.endsWith("/logo")
    );
  };

  const waHref = useMemo(() => {
    const title = product?.title || product?.code || "Producto";
    const price = Number(product?.price) || 0;
    const text = `Mira este producto: ${title} - S/ ${price.toFixed(2)}\n${product?.description || ""}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [product]);

  const productImages = useMemo(() => {
    const rawImages = (product as any)?.images;
    const list = Array.isArray(rawImages)
      ? rawImages
      : typeof rawImages === "string"
      ? rawImages
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
    const base = product?.image ? [product.image] : [];
    const combined = [...base, ...(list ?? [])]
      .map((img) => normalizeImage(img))
      .filter(Boolean);
    return combined.length > 0 ? Array.from(new Set(combined)) : ["/favicon-96x96.png"];
  }, [product]);

  const preferredMainImage =
    productImages.find((img) => !isProcessImage(img)) || productImages[0] || "/favicon-96x96.png";
  const mainImage = activeImage || preferredMainImage;
  const mainImageIsProcess = isProcessImage(mainImage);
  const activeViewerImage =
    viewerIndex !== null && viewerIndex >= 0 && viewerIndex < productImages.length
      ? productImages[viewerIndex]
      : null;
  const activeViewerIsProcess = isProcessImage(activeViewerImage || undefined);
  const hasOffer = typeof product?.oldPrice === "number" && Number(product.oldPrice) > Number(product?.price || 0);
  const showMobileMegaOffer = String(router.query?.oferta || "").trim() === "mega" && hasOffer;
  const productVariants: any[] = (product as any)?.variants || [];
  const activePrice = selectedVariant
    ? getPresentationTotalPrice(selectedVariant.price, selectedVariant.label)
    : Number(product?.price || 0);
  const activeOldPriceValue = selectedVariant
    ? getOptionalPrice(getPresentationTotalPrice(selectedVariant.oldPrice, selectedVariant.label))
    : getOptionalPrice(product?.oldPrice);
  const hasActiveDiscount = activeOldPriceValue !== null && activeOldPriceValue > activePrice;
  const activeDiscountPercent = hasActiveDiscount
    ? Math.max(1, Math.round((((activeOldPriceValue || 0) - activePrice) / (activeOldPriceValue || 1)) * 100))
    : 0;
  const displayProductTitle = formatProductTitle(product?.title || product?.code || "Producto");
  const productSpecs = useMemo(() => (product as any)?.specs || [], [product]);
  const extendedProductTitle = useMemo(
    () =>
      buildExtendedProductTitle({
        title: product?.title,
        category: product?.category,
        measure: (product as any)?.measure,
        specs: productSpecs,
      }),
    [product, productSpecs]
  );
  const descriptionBullets = useMemo(() => formatDescriptionBullets(product?.description), [product?.description]);
  const bundlePromoLabel = !selectedVariant ? getBundlePromoLabel(product || {}) : "";

  useEffect(() => {
    const productId = String(product?._id || "").trim();
    if (!productId || trackedViewContentId.current === productId) return;
    trackedViewContentId.current = productId;
    trackViewContent({
      contentName: product?.title || displayProductTitle,
      contentId: productId,
      value: activePrice,
    });
  }, [activePrice, displayProductTitle, product?._id, product?.title]);

  const openImageViewer = (img: string) => {
    const idx = productImages.findIndex((item) => item === img);
    setViewerIndex(idx >= 0 ? idx : 0);
  };

  const closeImageViewer = () => {
    setViewerIndex(null);
  };

  const goPrevImage = () => {
    if (viewerIndex === null || productImages.length === 0) return;
    setViewerIndex((viewerIndex - 1 + productImages.length) % productImages.length);
  };

  const goNextImage = () => {
    if (viewerIndex === null || productImages.length === 0) return;
    setViewerIndex((viewerIndex + 1) % productImages.length);
  };

  const mobileProductSearchResults = useMemo(() => {
    const q = mobileProductSearchQuery.trim();
    if (q.length < 2) return [];
    return filterAndSortProducts(allProducts || [], {
      query: q,
      sort: "relevance",
    })
      .filter((item) => String(item._id) !== String(product?._id))
      .slice(0, 6);
  }, [allProducts, mobileProductSearchQuery, product?._id]);

  const submitMobileProductSearch = (event?: React.FormEvent) => {
    event?.preventDefault();
    const q = mobileProductSearchQuery.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  const showPrevProductImage = () => {
    if (productImages.length <= 1) return;
    const currentIndex = productImages.findIndex((item) => item === mainImage);
    const nextIndex = (Math.max(0, currentIndex) - 1 + productImages.length) % productImages.length;
    setActiveImage(productImages[nextIndex]);
  };

  const showNextProductImage = () => {
    if (productImages.length <= 1) return;
    const currentIndex = productImages.findIndex((item) => item === mainImage);
    const nextIndex = (Math.max(0, currentIndex) + 1) % productImages.length;
    setActiveImage(productImages[nextIndex]);
  };

  const handleMobileImageTouchStart = (event: React.TouchEvent<HTMLButtonElement>) => {
    const touch = event.touches[0];
    mobileImageTouchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleMobileImageTouchEnd = (event: React.TouchEvent<HTMLButtonElement>) => {
    const start = mobileImageTouchStart.current;
    mobileImageTouchStart.current = null;
    if (!start || productImages.length <= 1) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const horizontalSwipe = Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.35;
    if (!horizontalSwipe) return;

    if (dx < 0) showNextProductImage();
    else showPrevProductImage();
  };

  const shareProduct = async () => {
    const title = product?.title || product?.code || "Producto Rossy Resina";
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: product?.description || title, url });
        return;
      } catch {
        // Fall back to WhatsApp when native sharing is cancelled or unavailable.
      }
    }
    if (typeof window !== "undefined") {
      window.open(waHref, "_blank", "noopener,noreferrer");
    }
  };

  const addProductToCart = (quantity: number) => {
    if (!product) return;
    const variantId = selectedVariant?.id ? String(selectedVariant.id) : "";
    const variantLabel = selectedVariant?.label ? String(selectedVariant.label) : "";
    const cartKey = variantId ? `${product._id}:${variantId}` : String(product._id);
    dispatch(
      addToCart({
        cartKey,
        _id: product._id,
        productId: product._id,
        variantId: variantId || undefined,
        variantLabel: variantLabel || undefined,
        brand: product.brand,
        category: product.category,
        description: product.description,
        image: mainImage,
        isNew: product.isNew,
        oldPrice: activeOldPriceValue ?? undefined,
        price: activePrice,
        bundleQuantity: !selectedVariant ? product.bundleQuantity : undefined,
        bundlePrice: !selectedVariant ? product.bundlePrice : undefined,
        title: variantLabel ? `${product.title} - ${variantLabel}` : product.title,
        quantity,
      })
    );
    setJustAdded(true);
    if (addNoticeTimer.current) clearTimeout(addNoticeTimer.current);
    addNoticeTimer.current = setTimeout(() => setJustAdded(false), 1700);
  };

  useEffect(() => {
    return () => {
      if (addNoticeTimer.current) clearTimeout(addNoticeTimer.current);
    };
  }, []);

  useEffect(() => {
    setActiveImage(preferredMainImage);
  }, [preferredMainImage, product?._id]);

  useEffect(() => {
    setViewerReady(true);
    setMobileBuyBarReady(true);
    return () => {
      setViewerReady(false);
      setMobileBuyBarReady(false);
    };
  }, []);

  useEffect(() => {
    if (!hasOffer) {
      setOfferCtaVisible(false);
      return;
    }

    let showingPrimary = true;
    let swapTimer: ReturnType<typeof setTimeout> | null = null;

    setOfferCtaText("!PRODUCTOS EN OFERTA! APROVÉCHALO AHORA!");
    setOfferCtaVisible(true);

    const rotate = () => {
      setOfferCtaVisible(false);
      swapTimer = setTimeout(() => {
        showingPrimary = !showingPrimary;
        setOfferCtaText(
          showingPrimary
            ? "!PRODUCTOS EN OFERTA! APROVÉCHALO AHORA!"
            : "!APROVECHA LA OFERTA! COMPRA HOY!"
        );
        setOfferCtaVisible(true);
      }, 600);
    };

    const interval = setInterval(rotate, 10000);

    return () => {
      clearInterval(interval);
      if (swapTimer) clearTimeout(swapTimer);
    };
  }, [hasOffer, product?._id]);

  useEffect(() => {
    setShowShippingProcess(false);
  }, [product?._id]);

  useEffect(() => {
    const id = String(product?._id || "").trim();
    if (!id) {
      setSalesCount(0);
      return;
    }
    let active = true;
    fetch(`/api/products/${encodeURIComponent(id)}/metrics`)
      .then((r) => (r.ok ? r.json() : { cartAdds: 0, paidUnits: 0 }))
      .then((data) => {
        if (!active) return;
        setSalesCount(Math.max(0, Number(data?.salesCount || 0)));
      })
      .catch(() => {
        if (!active) return;
        setSalesCount(0);
      });
    return () => {
      active = false;
    };
  }, [product?._id]);

  useEffect(() => {
    const id = String(product?._id || "").trim();
    if (!id) {
      setReviews([]);
      return;
    }
    let active = true;
    const loadReviews = (showLoading = false) => {
      if (showLoading) setLoadingReviews(true);
      fetch(`/api/reviews?productId=${encodeURIComponent(id)}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((rows) => {
          if (!active) return;
          setReviews(Array.isArray(rows) ? rows : []);
        })
        .catch(() => {
          if (!active) return;
          setReviews([]);
        })
        .finally(() => {
          if (!active) return;
          setLoadingReviews(false);
        });
    };

    loadReviews(true);
    const refreshTimer = window.setInterval(() => loadReviews(false), 15000);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, [product?._id]);

  const reviewCount = reviews.length;
  const reviewAverage = useMemo(() => {
    if (!reviewCount) return 0;
    return (
      reviews.reduce((sum, r) => sum + Math.max(1, Math.min(5, Number(r.rating || 0))), 0) /
      reviewCount
    );
  }, [reviews, reviewCount]);


  const pageTitle = product?.title ? `${formatProductTitle(product.title)} | Rossy Resina` : "Producto | Rossy Resina";
  const pageDesc = truncateMeta(
    product?.description ||
      `${displayProductTitle} en Rossy Resina. Compra resina, moldes, pigmentos y accesorios con atención por WhatsApp.`
  );
  const pageImage = (() => {
    const raw = String(preferredMainImage || product?.image || "").trim();
    if (!raw) return "/favicon-96x96.png";
    if (/^https?:\/\//i.test(raw)) return raw;
    return raw.startsWith("/") ? raw : `/${raw}`;
  })();
  const productPath = product ? `/${encodeURIComponent(String(product.slug || product.code || product._id))}` : "/";
  const canonicalUrl = absoluteUrl(productPath);
  const absolutePageImage = absoluteImageUrl(pageImage);
  const productJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title || product.code || "Producto",
        image: [absolutePageImage],
        description: product.description || "",
        sku: String(product.code || product._id || ""),
        category: product.category || "",
        brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
        offers: {
          "@type": "Offer",
          priceCurrency: "PEN",
          price: Number(product.price || 0).toFixed(2),
          availability: "https://schema.org/InStock",
          url: canonicalUrl,
        },
        aggregateRating:
          reviewCount > 0
            ? {
                "@type": "AggregateRating",
                ratingValue: Number(reviewAverage || 0).toFixed(1),
                reviewCount,
              }
            : undefined,
      }
    : null;
  const breadcrumbJson = product
    ? breadcrumbJsonLd([
        { name: "Inicio", url: "/" },
        { name: product.category || "Productos", url: product.category ? `/productos?categoria=${encodeURIComponent(product.category)}` : "/productos" },
        { name: displayProductTitle, url: productPath },
      ])
    : null;

  const fmtReviewDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(+d)) return "";
    return d.toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });
  };

  const submitReview = async () => {
    if (!product) return;
    setReviewError("");
    const comment = reviewComment.trim();
    if (comment.length < 3) {
      setReviewError("Escribe un comentario de al menos 3 caracteres.");
      return;
    }
    try {
      setSubmittingReview(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: String(product._id),
          rating: reviewRating,
          comment,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "No se pudo guardar la reseña");
      }
      const saved = await res.json();
      setReviews((prev) => {
        const idx = prev.findIndex((r) => r.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      setReviewComment("");
    } catch (e: any) {
      setReviewError(e?.message || "No se pudo guardar la reseña");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-4 md:py-8">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} key="description" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={absolutePageImage} />
        <meta property="product:price:amount" content={Number(product?.price || 0).toFixed(2)} />
        <meta property="product:price:currency" content="PEN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image" content={absolutePageImage} />
        {productJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
          />
        )}
        {breadcrumbJson && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }}
          />
        )}
      </Head>

      {!product ? (
        <div className="w-full flex flex-col gap-4 items-center justify-center py-20">
          <p className="text-lg font-medium">Producto no encontrado.</p>
          <Link href="/" className="px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black">
            Volver al inicio
          </Link>
        </div>
      ) : (
        <>
          <WonPrizeBanner />

          <div className="md:hidden -mx-4 -mt-4 mb-4 bg-white pb-4">
            <div className="relative bg-white">
              <button
                type="button"
                onClick={() => openImageViewer(mainImage)}
                onTouchStart={handleMobileImageTouchStart}
                onTouchEnd={handleMobileImageTouchEnd}
                className="relative block w-full overflow-hidden bg-white pb-[100%]"
                aria-label="Ver imágenes del producto"
              >
                {mainImageIsProcess ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 px-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Producto en Proceso
                  </div>
                ) : (
                  <Image
                    src={mainImage}
                    alt={displayProductTitle}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="absolute left-3 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-black shadow-[0_4px_16px_rgba(15,23,42,0.28)] backdrop-blur"
                aria-label="Volver"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div className="absolute right-3 top-4 flex gap-2">
                <div className="relative h-11 w-11">
                  {mobileProductSearchOpen ? (
                    <>
                      <form
                        onSubmit={submitMobileProductSearch}
                        className="animated fadeIn animate-fast absolute right-0 top-0 z-20 flex h-11 w-[min(calc(100vw-112px),270px)] items-center overflow-hidden rounded-full border border-amazon_blue bg-white shadow-[0_8px_22px_rgba(17,24,39,0.16)]"
                      >
                        <input
                          value={mobileProductSearchQuery}
                          onChange={(event) => setMobileProductSearchQuery(event.target.value)}
                          autoFocus
                          className="h-full min-w-0 flex-1 bg-white px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                          placeholder="Buscar producto..."
                        />
                        <button
                          type="submit"
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amazon_blue text-white"
                          aria-label="Buscar"
                        >
                          <MagnifyingGlassIcon className="h-6 w-6" />
                        </button>
                      </form>
                      {mobileProductSearchQuery.trim().length >= 2 ? (
                        <div className="animated fadeIn animate-fast absolute right-0 top-12 z-20 w-[min(calc(100vw-112px),270px)] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0_10px_26px_rgba(17,24,39,0.18)]">
                          {mobileProductSearchResults.length > 0 ? (
                            mobileProductSearchResults.map((item) => (
                              <Link
                                key={`mobile-search-${item._id}`}
                                href={`/${item.slug || item.code || item._id}`}
                                className="grid grid-cols-[46px_minmax(0,1fr)] gap-2 border-b border-gray-100 p-2 last:border-b-0"
                                onClick={() => {
                                  setMobileProductSearchOpen(false);
                                  setMobileProductSearchQuery("");
                                }}
                              >
                                <div className="relative h-11 w-11 overflow-hidden rounded bg-gray-100">
                                  <Image
                                    src={normalizeImage(item.image)}
                                    alt={item.title || "Producto"}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-semibold text-gray-900">{item.title || "Producto"}</p>
                                  <p className="mt-0.5 text-xs font-bold text-red-600">
                                    <FormattedPrice amount={Number(item.price || 0)} />
                                  </p>
                                </div>
                              </Link>
                            ))
                          ) : (
                            <div className="p-3 text-xs font-semibold text-gray-600">
                              No hay coincidencias.
                            </div>
                          )}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setMobileProductSearchOpen(true)}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-black shadow-[0_4px_16px_rgba(15,23,42,0.28)] backdrop-blur"
                      aria-label="Buscar productos"
                    >
                      <MagnifyingGlassIcon className="h-6 w-6" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={shareProduct}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-black shadow-[0_4px_16px_rgba(15,23,42,0.28)] backdrop-blur"
                  aria-label="Compartir producto"
                >
                  <ShareIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="absolute bottom-12 right-3 z-20 rounded-full bg-slate-900/70 px-3 py-1 text-xs font-semibold text-white">
                {Math.max(1, productImages.findIndex((img) => img === mainImage) + 1)}/{productImages.length}
              </div>
              {(showMobileMegaOffer || hasActiveDiscount) ? (
                <div className="absolute inset-x-0 bottom-0 z-10 flex overflow-hidden text-[13px] font-black leading-4 text-white shadow-[0_-2px_10px_rgba(17,24,39,0.18)]">
                  <span className="relative z-10 flex h-12 w-[104px] shrink-0 items-center justify-center rounded-tr-xl bg-yellow-300 px-1 text-center leading-[15px] text-white">
                    Oferta<br />Relámpago
                  </span>
                  <span className="-ml-4 flex h-12 min-w-0 flex-1 items-center justify-center truncate bg-amazon_blue pl-6 pr-2 text-lg font-black italic tracking-wide">
                    ¡Aprovechalo YA!
                  </span>
                </div>
              ) : null}
            </div>

            <div className="bg-white px-4 py-3">
              <button
                type="button"
                onClick={() => setMobileTitleExpanded((v) => !v)}
                className="flex w-full items-start gap-1 text-left"
                aria-expanded={mobileTitleExpanded}
              >
                <h1
                  className={`flex-1 text-[22px] font-medium leading-7 text-gray-950 ${
                    mobileTitleExpanded ? "" : "line-clamp-2"
                  }`}
                >
                  {extendedProductTitle}
                </h1>
                <ChevronDownIcon
                  className={`mt-1.5 h-5 w-5 shrink-0 text-gray-400 transition-transform ${
                    mobileTitleExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-sm text-gray-600">
                <span>De</span>
                <span className="flex items-center gap-1 font-semibold text-gray-900">
                  <span className="flex h-4 w-4 items-center justify-center rounded bg-amazon_blue/10 text-[10px]">🏪</span>
                  Rossy Resina
                </span>
                {reviewCount > 0 && (
                  <span className="flex items-center gap-1 font-semibold text-amber-500">
                    <FaStar className="h-3.5 w-3.5" />
                    {reviewAverage.toFixed(1)}
                  </span>
                )}
                {salesCount > 0 && <span className="text-gray-500">| {salesCount}+ vendido(s)</span>}
                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              </div>

              <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-[28px] font-black leading-none text-red-600">S/ {activePrice.toFixed(2)}</span>
                {hasActiveDiscount && (
                  <>
                    <span className="text-sm font-black italic text-orange-500">-{activeDiscountPercent}% dto.</span>
                    <span className="text-sm text-gray-400 line-through">
                      <FormattedPrice amount={activeOldPriceValue} />
                    </span>
                  </>
                )}
                <span className="ml-auto min-w-[170px] max-w-[260px] flex-1 md:hidden">
                  <WonPrizeBanner variant="inline" />
                </span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">Precio por unidad</p>

              {typeof product.stock === "number" && product.stock > 0 && product.stock <= 5 && (
                <p className="mt-2 text-sm font-semibold text-red-500">
                  ¡Últimas unidades! Solo quedan {product.stock}
                </p>
              )}

              {bundlePromoLabel ? (
                <div className="mt-2 inline-flex rounded-md border border-lime-300 bg-[#f01891] px-3 py-1 text-base font-black italic text-white shadow-sm">
                  {bundlePromoLabel}
                </div>
              ) : null}

              {productVariants.length > 0 && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setMobileVariantsExpanded((v) => !v)}
                    className="flex w-full items-center justify-between text-sm"
                    aria-expanded={mobileVariantsExpanded}
                  >
                    <span className="text-gray-600">
                      Presentación:{" "}
                      <span className="font-semibold text-gray-900">
                        {selectedVariant ? selectedVariant.label : "Elegir opción"}
                      </span>
                    </span>
                    <ChevronRightIcon
                      className={`h-4 w-4 text-gray-400 transition-transform ${
                        mobileVariantsExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                  {mobileVariantsExpanded && (
                    <div className="animated fadeIn animate-fast mt-2 flex flex-wrap gap-2">
                      {productVariants.map((v: any) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            setSelectedVariant(selectedVariant?.id === v.id ? null : v);
                            setMobileVariantsExpanded(false);
                          }}
                          className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                            selectedVariant?.id === v.id
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-gray-300 text-gray-700 hover:border-slate-900"
                          }`}
                        >
                          {v.label} — S/ {Number(v.price).toFixed(2)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {(productSpecs.length > 0 || descriptionBullets.length > 0) && (
              <div className="px-4 py-4 space-y-4">
                {productSpecs.length > 0 && (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <h3 className="bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800 border-b border-gray-200">
                      Detalles
                    </h3>
                    <div className="divide-y divide-gray-100">
                      {productSpecs.map((s: { label: string; value: string }, i: number) => (
                        <div key={`${s.label}-${i}`} className="grid grid-cols-[130px_minmax(0,1fr)] gap-3 px-3 py-2 text-sm">
                          <span className="text-gray-600">{s.label}</span>
                          <span className="font-semibold text-gray-900">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {descriptionBullets.length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Sobre este producto</h3>
                    <ul className="list-disc space-y-2 pl-5 text-base leading-7 text-gray-700">
                      {descriptionBullets.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="px-4 pb-4">
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-3 border-b border-gray-200">
                  <span className="rounded bg-amber-300 px-1.5 py-0.5 text-[10px] font-black uppercase text-gray-900">
                    Rossy Resina
                  </span>
                  <span className="text-base font-bold text-emerald-600">Compromiso de compra</span>
                </div>
                <div className="divide-y divide-gray-100">
                  <button
                    type="button"
                    onClick={() => setMobileShippingExpanded((v) => !v)}
                    className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
                    aria-expanded={mobileShippingExpanded}
                  >
                    <div className="flex items-start gap-3">
                      <TruckIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Envío a todo el Perú</p>
                        <p className="mt-0.5 text-sm text-gray-600">Envíos 2 a 3 días</p>
                        {mobileShippingExpanded && (
                          <div className="animated fadeIn animate-fast mt-2 flex items-center gap-4">
                            <span className="text-sm text-gray-600">Envíos por</span>
                            <div className="flex items-center gap-4">
                              <Image src="/logos/shalom.png" alt="Shalom" width={120} height={24} className="h-6 w-auto object-contain" />
                              <Image src="/logos/olva.png" alt="Olva Courier" width={28} height={28} className="h-7 w-auto object-contain" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRightIcon
                      className={`mt-1 h-4 w-4 shrink-0 text-gray-400 transition-transform ${
                        mobileShippingExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  <Link href="/checkout" className="flex items-start justify-between gap-3 px-4 py-3">
                    <div className="flex items-start gap-3">
                      <CreditCardIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Pago seguro y flexible</p>
                        <div className="mt-1 space-y-0.5 text-sm text-gray-600">
                          <p className="flex items-center gap-1">
                            <CheckIcon className="h-3.5 w-3.5 shrink-0 text-emerald-600" /> Yape y transferencia bancaria
                          </p>
                          <p className="flex items-center gap-1">
                            <CheckIcon className="h-3.5 w-3.5 shrink-0 text-emerald-600" /> Contra entrega en zonas habilitadas
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <a
                    href={`https://wa.me/51966357648?text=${encodeURIComponent(`Hola, tengo una consulta sobre: ${displayProductTitle}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <FaWhatsapp className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Soporte al cliente</p>
                        <p className="mt-0.5 text-sm text-gray-600">Escríbenos por WhatsApp</p>
                      </div>
                    </div>
                    <ChevronRightIcon className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
                  </a>
                </div>
              </div>
            </div>

            {mobileBuyBarReady
              ? createPortal(
                  <div
                    className="fixed bottom-0 left-0 right-0 z-[1000] flex items-center gap-3 border-t border-gray-200 bg-white px-4 py-2 shadow-[0_-6px_20px_rgba(17,24,39,0.10)] md:hidden"
                    style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
                  >
                    <div className="min-w-[82px] leading-tight">
                      {hasActiveDiscount && (
                        <p className="text-sm text-gray-700 line-through">
                          <FormattedPrice amount={activeOldPriceValue} />
                        </p>
                      )}
                      <p className="text-2xl font-black leading-none text-red-600">
                        S/ {activePrice.toFixed(2)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addProductToCart(qty)}
                      className={`group rr-shine flex h-12 flex-1 items-center justify-center rounded-full px-4 text-base font-black leading-tight text-white transition-transform active:scale-[0.98] ${
                        hasActiveDiscount
                          ? "bg-[#056b35] text-yellow-300 shadow-[0_8px_18px_rgba(5,107,53,0.28)]"
                          : "bg-amazon_blue shadow-[0_8px_18px_rgba(203,41,158,0.24)]"
                      } ${
                        justAdded ? "rr-add-to-cart-hit" : ""
                      }`}
                    >
                      {!hasActiveDiscount ? <ShoppingCartIcon className="rr-cart-wiggle mr-2 h-5 w-5 shrink-0" /> : null}
                      {justAdded ? (
                        <span>Producto añadido</span>
                      ) : hasActiveDiscount ? (
                        <span className="flex flex-col items-center leading-tight">
                          <span>¡LOS ÚLTIMOS!</span>
                          <span>¡AGREGA AHORA!</span>
                        </span>
                      ) : (
                        <span>¡Agregar al carrito!</span>
                      )}
                    </button>
                  </div>,
                  document.body
                )
              : null}
          </div>

          <div className="hidden md:flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
            <div className="w-full lg:flex-1 lg:max-w-[760px]">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {productImages.map((img) => (
                    <button
                      key={img}
                      onClick={() => setActiveImage(img)}
                      className={`h-14 w-14 shrink-0 rounded ${mainImage === img ? "ring-2 ring-amazon_blue" : "ring-1 ring-gray-200"} bg-white overflow-hidden`}
                    >
                      {isProcessImage(img) ? (
                        <div className="flex h-full w-full items-center justify-center bg-gray-50 text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                          Proceso
                        </div>
                      ) : (
                        <Image src={img} alt="Miniatura" width={80} height={80} className="object-cover" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="relative bg-transparent rounded-xl p-0 w-full">
                  <button
                    type="button"
                    onClick={() => openImageViewer(mainImage)}
                    className="relative w-full h-[360px] md:h-[520px] bg-white rounded-xl overflow-hidden"
                    aria-label="Ver imagen grande"
                  >
                    {mainImageIsProcess ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-50 px-4 text-center text-sm font-semibold uppercase tracking-wide text-gray-400">
                        Producto en Proceso
                      </div>
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${mainImage})`,
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "contain",
                          backgroundPosition: "50% 50%",
                          backgroundColor: "transparent",
                          transition: "none",
                        }}
                      />
                    )}
                  </button>
                  {productImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={showPrevProductImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md ring-1 ring-gray-200 hover:bg-white"
                        aria-label="Imagen anterior"
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={showNextProductImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md ring-1 ring-gray-200 hover:bg-white"
                        aria-label="Imagen siguiente"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-lg font-semibold">Reseñas</h2>
                  {reviewCount > 0 && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <FaStar key={i} className={`h-4 w-4 ${i < Math.round(reviewAverage) ? "text-amber-500" : "text-gray-300"}`} />
                      ))}
                      <span className="text-gray-700 text-sm ml-2">{reviewAverage.toFixed(1)}</span>
                    </div>
                  )}
                  <span className="text-sm text-gray-500">{reviewCount > 0 ? `${reviewCount} reseñas` : "Sin reseñas"}</span>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Tu reseña</p>
                  {session?.user ? (
                    <>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={`rate-${n}`}
                            type="button"
                            onClick={() => setReviewRating(n)}
                            className="p-0.5"
                            aria-label={`Calificar ${n} estrellas`}
                          >
                            <FaStar className={`h-5 w-5 ${n <= reviewRating ? "text-amber-500" : "text-gray-300"}`} />
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full min-h-[92px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amazon_blue"
                        placeholder="Escribe tu comentario sobre este producto"
                        maxLength={500}
                      />
                      {reviewError && <p className="mt-2 text-xs text-red-600">{reviewError}</p>}
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={submitReview}
                          disabled={submittingReview}
                          className="px-4 py-2 rounded-full bg-amazon_blue text-white text-sm font-semibold hover:brightness-95 disabled:opacity-60"
                        >
                          {submittingReview ? "Guardando..." : "Publicar reseña"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-600">
                      Inicia sesión para comentar y calificar este producto.
                      <button
                        type="button"
                        onClick={() => signIn(undefined, { callbackUrl: router.asPath })}
                        className="ml-2 text-amazon_blue font-semibold hover:underline"
                      >
                        Iniciar sesión
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid gap-4">
                  {loadingReviews && (
                    <div className="text-sm text-gray-600">Cargando reseñas...</div>
                  )}
                  {!loadingReviews && reviews.length === 0 && (
                    <div className="text-sm text-gray-600">Aún no hay reseñas para este producto.</div>
                  )}
                  {!loadingReviews && reviews.map((r) => (
                    <div key={r.id} className="rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
                          {String(r.userName || "U").slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{r.userName || "Usuario"}</p>
                          <p className="text-xs text-gray-500">{fmtReviewDate(r.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500 mt-2">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <FaStar key={i} className={`h-4 w-4 ${i < Number(r.rating || 0) ? "text-amber-500" : "text-gray-300"}`} />
                        ))}
                        <span className="text-sm text-amazon_blue ml-1">
                          {Number(r.rating || 0) >= 4 ? "Excelente" : Number(r.rating || 0) >= 3 ? "Bueno" : "Regular"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-4 pt-6 lg:w-[640px] lg:shrink lg:grow-0">
              <div className="relative rounded-xl p-5">
                {productSpecs.length > 0 && (
                  <div className="float-right ml-5 mb-4 hidden w-[220px] rounded-lg border border-gray-200 overflow-hidden lg:block">
                    <h3 className="bg-gray-50 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-gray-600 border-b border-gray-200">
                      Detalles
                    </h3>
                    <div className="divide-y divide-gray-100">
                      {productSpecs.map((s: { label: string; value: string }, i: number) => (
                        <div key={`${s.label}-${i}`} className="px-3 py-2 text-sm">
                          <p className="text-gray-500">{s.label}</p>
                          <p className="font-semibold text-gray-900">{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {hasOffer ? (
                  <div className="mb-2 flex h-7 items-center justify-center">
                    <Link
                      href="/productos?ofertas=1"
                      className={`block w-full text-center text-sm font-extrabold uppercase tracking-wide text-amazon_blue transition-all duration-700 hover:scale-[1.02] hover:text-amazon_light animate-pulse ${
                        offerCtaVisible ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {offerCtaText}
                    </Link>
                  </div>
                ) : null}
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold">{displayProductTitle}</h1>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    {salesCount > 0 && (
                      <>
                        <span>{salesCount} ventas</span>
                        <span className="text-gray-300">|</span>
                      </>
                    )}
                    <span>Distribuidor Rossy Resina</span>
                    {reviewCount > 0 && (
                      <div className="flex items-center gap-1 text-yellow-500 ml-auto">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <FaStar key={i} className={`h-4 w-4 ${i < Math.round(reviewAverage) ? "text-amber-500" : "text-gray-300"}`} />
                        ))}
                        <span className="text-gray-700 text-sm ml-1">{reviewAverage.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {productSpecs.length > 0 && (
                  <div className="mt-4 rounded-lg border border-gray-200 overflow-hidden lg:hidden">
                    <h3 className="bg-gray-50 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-gray-600 border-b border-gray-200">
                      Detalles
                    </h3>
                    <div className="divide-y divide-gray-100">
                      {productSpecs.map((s: { label: string; value: string }, i: number) => (
                        <div key={`${s.label}-${i}`} className="grid grid-cols-[130px_minmax(0,1fr)] gap-3 px-3 py-2 text-sm">
                          <span className="text-gray-600">{s.label}</span>
                          <span className="font-semibold text-gray-900">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-4xl font-semibold text-red-600">
                      <FormattedPrice amount={activePrice} />
                    </span>
                    <span className="text-sm font-normal text-gray-500">c/unidad</span>
                    {hasActiveDiscount && (
                      <span className="text-sm line-through text-gray-400">
                        <FormattedPrice amount={activeOldPriceValue} />
                      </span>
                    )}
                    {hasActiveDiscount && (
                      <span className="text-xs px-2 py-1 rounded-full border border-amazon_blue text-amazon_blue">Descuento</span>
                    )}
                  </div>
                  {productVariants.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Presentación:</p>
                      <div className="flex flex-wrap gap-2">
                        {productVariants.map((v: any) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                            className={`px-3 py-1.5 rounded-full border text-sm font-semibold transition ${
                              selectedVariant?.id === v.id
                                ? "bg-slate-900 text-white border-slate-900"
                                : "border-gray-300 text-gray-700 hover:border-slate-900"
                            }`}
                          >
                            {v.label} — S/ {Number(v.price).toFixed(2)} por kg
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-3 text-lg font-bold text-emerald-700 md:text-xl">
                  {"Sin mínimo ni máximo de pedidos enviados"}
                </div>
                <div className="mt-3 text-base text-amazon_blue">
                  {"Ideal para emprender: crea piezas para vender y recuperar tu inversión rápido."}
                </div>

                {descriptionBullets.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Sobre este producto</h3>
                    <ul className="list-disc space-y-2 pl-5 text-base leading-7 text-gray-700">
                      {descriptionBullets.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 flex flex-col gap-4 clear-both md:flex-row md:items-start">
                  <div className="p-3 bg-gray-50 rounded-lg md:flex-1">
                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-2">Información del producto</h4>
                    <div className="space-y-1.5 text-sm">
                      {product.sku && (
                        <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-3">
                          <span className="text-gray-600">SKU:</span>
                          <span className="font-mono font-semibold text-gray-900">{product.sku}</span>
                        </div>
                      )}
                      {product.barcode && (
                        <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-3">
                          <span className="text-gray-600">Código de barras:</span>
                          <span className="font-mono font-semibold text-gray-900">{product.barcode}</span>
                        </div>
                      )}
                      {product.code && (
                        <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-3">
                          <span className="text-gray-600">Código:</span>
                          <span className="font-mono font-semibold text-gray-900">{product.code}</span>
                        </div>
                      )}
                      {product.stock !== undefined && (
                        <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-3">
                          <span className="text-gray-600">Stock disponible:</span>
                          <span className={`font-semibold ${product.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {product.stock > 0 ? `${product.stock} unidades` : 'Agotado'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:flex-1">
                    <p className="text-sm text-gray-600">Cantidad:</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center justify-between border border-gray-300 px-3 py-1 rounded-md w-28">
                        <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="text-lg">-</button>
                        <span className="font-semibold">{qty}</span>
                        <button onClick={() => setQty((q) => q + 1)} className="text-lg">+</button>
                      </div>
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noreferrer"
                        className="rr-wa-pulse group flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-white transition-transform hover:brightness-95 active:translate-y-[1px]"
                      >
                        <FaWhatsapp className="rr-icon-pop h-5 w-5 shrink-0 group-hover:animate-none" />
                        Compartir por WhatsApp
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-2">
                  <button
                    onClick={() => addProductToCart(qty)}
                    className={`group rr-shine flex h-12 w-full items-center justify-center gap-2 rounded-full bg-amazon_blue text-base font-semibold text-white transition-transform hover:brightness-95 active:scale-[0.98] ${
                      justAdded ? "rr-add-to-cart-hit" : ""
                    }`}
                  >
                    <ShoppingCartIcon className="rr-cart-wiggle h-5 w-5 shrink-0" />
                    Agregar al carrito
                  </button>
                  {justAdded && (
                    <p className="text-sm font-semibold text-emerald-700">{"Producto añadido"}</p>
                  )}
                </div>


                <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                  <p>Envíos por</p>
                  <div className="flex items-center gap-4">
                    <Image src="/logos/shalom.png" alt="Shalom" width={120} height={24} className="h-6 w-auto object-contain" />
                    <Image src="/logos/olva.png" alt="Olva Courier" width={28} height={28} className="h-7 w-auto object-contain" />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {activeViewerImage && viewerReady
            ? createPortal(
                <div
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5 md:p-8"
                  onClick={closeImageViewer}
                >
                  <div
                    className="relative flex max-h-[86vh] w-full max-w-4xl flex-col rounded-xl bg-white p-3"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={closeImageViewer}
                      className="absolute right-2 top-2 z-10 h-9 w-9 rounded-full bg-black/70 text-lg font-bold text-white"
                      aria-label="Cerrar visor"
                    >
                      x
                    </button>
                    <div className="relative h-[48vh] w-full shrink-0 overflow-hidden rounded-lg bg-white sm:h-[56vh]">
                      {activeViewerIsProcess ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 px-4 text-center text-sm font-semibold uppercase tracking-wide text-gray-400">
                          Producto en Proceso
                        </div>
                      ) : (
                        <Image
                          src={activeViewerImage}
                          alt="Imagen referencial"
                          fill
                          sizes="100vw"
                          className="object-contain"
                          priority
                        />
                      )}
                      {productImages.length > 1 ? (
                        <>
                          <button
                            type="button"
                            onClick={goPrevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 px-3 py-2 text-white"
                            aria-label="Imagen anterior"
                          >
                            {"<"}
                          </button>
                          <button
                            type="button"
                            onClick={goNextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 px-3 py-2 text-white"
                            aria-label="Imagen siguiente"
                          >
                            {">"}
                          </button>
                        </>
                      ) : null}
                    </div>
                    {productImages.length > 1 ? (
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {productImages.map((img, idx) => (
                          <button
                            key={`viewer-thumb-${img}`}
                            type="button"
                            onClick={() => setViewerIndex(idx)}
                            className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-md ${
                              activeViewerImage === img ? "ring-2 ring-amazon_blue" : "ring-1 ring-gray-200"
                            }`}
                            aria-label="Ver miniatura"
                          >
                            {isProcessImage(img) ? (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                                Proceso
                              </div>
                            ) : (
                              <Image src={img} alt="Miniatura" fill className="object-cover" />
                            )}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>,
                document.body
              )
            : null}

          <div className="mt-4 pb-28 md:mt-10 md:pb-0">
            <h2 className="text-xl font-semibold mb-3">Explora más productos</h2>
            {recs.length > 0 ? (
              <Products
                productData={recs}
                gridClass="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5"
              />
            ) : (
              <div className="text-sm text-gray-600">No hay productos relacionados.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DynamicPage;

export const getServerSideProps = async (ctx: any) => {
  const key = String(ctx?.params?.slug || "").trim();
  const all: ProductProps[] = await getAllProducts();

  const bySlug = all.find((p) => String(p.slug || "").toLowerCase() === key.toLowerCase()) || null;
  const product =
    bySlug ||
    all.find((p) => String(p._id) === key) ||
    all.find((p) => String(p.code || "").toLowerCase() === key.toLowerCase()) ||
    null;

  // Los productos ya tienen slug: cualquier acceso por ID/código crudo redirige
  // permanentemente a la URL canónica para consolidar el SEO en una sola URL.
  if (product && !bySlug && product.slug) {
    return {
      redirect: {
        destination: `/${encodeURIComponent(product.slug)}`,
        permanent: true,
      },
    };
  }

  const recs = product
    ? (() => {
        const withoutCurrent = all.filter((p) => String(p._id) !== String(product._id));
        const sameCategory = withoutCurrent.filter(
          (p) => String(p.category) === String(product.category)
        );
        const fallback = withoutCurrent.filter(
          (p) => String(p.category) !== String(product.category)
        );
        return [...sameCategory, ...fallback].slice(0, 25);
      })()
    : [];
  return { props: { product, recs, allProducts: all } };
};


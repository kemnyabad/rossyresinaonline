export type MetaPixelCurrency = "PEN";

type MetaPixelEvent = "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";
type MetaPixelCustomEvent = "PromoWEB20Viewed" | "PromoWEB20Applied" | "PromoWEB20Purchase";

type MetaPixelPayload = Record<string, string | number | boolean | Array<string | number> | Array<Record<string, unknown>> | undefined>;

declare global {
  interface Window {
    fbq?: (
      method: "track" | "trackCustom",
      event: MetaPixelEvent | MetaPixelCustomEvent,
      payload?: MetaPixelPayload
    ) => void;
  }
}

const CURRENCY: MetaPixelCurrency = "PEN";

const cleanNumber = (value: unknown) => {
  const next = Number(value);
  return Number.isFinite(next) && next >= 0 ? Number(next.toFixed(2)) : 0;
};

const cleanString = (value: unknown) => String(value ?? "").trim();

const cleanIds = (ids: Array<string | number | undefined | null>) =>
  ids.map((id) => cleanString(id)).filter(Boolean);

const canTrack = () => typeof window !== "undefined" && typeof window.fbq === "function";

const track = (event: MetaPixelEvent, payload?: MetaPixelPayload) => {
  if (!canTrack()) return false;
  window.fbq!("track", event, payload);
  return true;
};

const trackCustom = (event: MetaPixelCustomEvent, payload?: MetaPixelPayload) => {
  if (!canTrack()) return false;
  window.fbq!("trackCustom", event, payload);
  return true;
};

export const trackPageView = () => track("PageView");

export const trackViewContent = (params: {
  contentName: string;
  contentId: string | number;
  value: number;
  contentType?: "product";
}) => {
  const contentIds = cleanIds([params.contentId]);
  if (!contentIds.length) return false;

  return track("ViewContent", {
    content_name: cleanString(params.contentName),
    content_ids: contentIds,
    content_type: params.contentType || "product",
    value: cleanNumber(params.value),
    currency: CURRENCY,
    contents: contentIds.map((id) => ({ id, quantity: 1 })),
  });
};

export const trackAddToCart = (params: {
  contentName: string;
  contentId: string | number;
  value: number;
  quantity?: number;
}) => {
  const contentIds = cleanIds([params.contentId]);
  if (!contentIds.length) return false;
  const quantity = Math.max(1, Math.floor(Number(params.quantity || 1)));

  return track("AddToCart", {
    content_name: cleanString(params.contentName),
    content_ids: contentIds,
    content_type: "product",
    value: cleanNumber(params.value),
    currency: CURRENCY,
    contents: contentIds.map((id) => ({ id, quantity })),
  });
};

export const trackInitiateCheckout = (params: {
  numItems: number;
  value: number;
  contentIds?: Array<string | number>;
}) => {
  const contentIds = cleanIds(params.contentIds || []);

  return track("InitiateCheckout", {
    num_items: Math.max(0, Math.floor(Number(params.numItems || 0))),
    value: cleanNumber(params.value),
    currency: CURRENCY,
    content_ids: contentIds,
  });
};

export const trackPurchase = (params: {
  transactionId: string | number;
  value: number;
  contentIds: Array<string | number>;
}) => {
  const transactionId = cleanString(params.transactionId);
  const contentIds = cleanIds(params.contentIds);
  if (!transactionId || !contentIds.length) return false;

  return track("Purchase", {
    transaction_id: transactionId,
    value: cleanNumber(params.value),
    currency: CURRENCY,
    content_ids: contentIds,
  });
};

export const trackPromoWEB20Viewed = () =>
  trackCustom("PromoWEB20Viewed", {
    promotion_name: "WEB20",
    currency: CURRENCY,
    value: 20,
  });

export const trackPromoWEB20Applied = (params: { discount: number; subtotal: number }) =>
  trackCustom("PromoWEB20Applied", {
    promotion_name: "WEB20",
    currency: CURRENCY,
    discount: cleanNumber(params.discount),
    value: cleanNumber(params.subtotal),
  });

export const trackPromoWEB20Purchase = (params: { transactionId: string | number; discount: number; value: number }) =>
  trackCustom("PromoWEB20Purchase", {
    promotion_name: "WEB20",
    transaction_id: cleanString(params.transactionId),
    currency: CURRENCY,
    discount: cleanNumber(params.discount),
    value: cleanNumber(params.value),
  });

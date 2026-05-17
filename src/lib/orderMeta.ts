export type PaymentMethod = "YAPE" | "TRANSFER";
export type ShippingCarrier = "SHALOM" | "OLVA";

export type OrderMeta = {
  version: 2;
  orderCode: string;
  workflowStatus: string;
  paymentMethod: PaymentMethod;
  shippingCarrier: ShippingCarrier;
  dni: string;
  locationLine: string;
  department: string;
  province: string;
  district: string;
  shalomAgency: string;
  olvaAddress: string;
  olvaReference: string;
  shalomVoucherImage: string;
  shalomPickupCode: string;
  olvaTrackingImage: string;
  notes: string;
};

const PREFIX = "__ORDER_META__:";

const DEFAULT_META: OrderMeta = {
  version: 2,
  orderCode: "",
  workflowStatus: "Pendiente por confirmar",
  paymentMethod: "YAPE",
  shippingCarrier: "SHALOM",
  dni: "",
  locationLine: "",
  department: "",
  province: "",
  district: "",
  shalomAgency: "",
  olvaAddress: "",
  olvaReference: "",
  shalomVoucherImage: "",
  shalomPickupCode: "",
  olvaTrackingImage: "",
  notes: "",
};

export const paymentMethodLabel = (method: PaymentMethod): string =>
  method === "TRANSFER" ? "Transferencia" : "Yape";

export const shippingCarrierLabel = (carrier: ShippingCarrier): string =>
  carrier === "OLVA" ? "Olva Courier" : "Shalom";

export const normalizePaymentMethod = (raw: unknown): PaymentMethod => {
  const v = String(raw || "").trim().toUpperCase();
  if (v === "TRANSFER" || v === "TRANSFERENCIA") return "TRANSFER";
  return "YAPE";
};

export const normalizeShippingCarrier = (raw: unknown): ShippingCarrier => {
  const v = String(raw || "").trim().toUpperCase();
  if (v === "OLVA" || v === "OLVA_COURIER") return "OLVA";
  return "SHALOM";
};

type RawOrderMeta = Omit<Partial<OrderMeta>, "paymentMethod" | "shippingCarrier"> & {
  paymentMethod?: string;
  shippingCarrier?: string;
};

const normalizeMeta = (partial: RawOrderMeta): OrderMeta => ({
  version: 2,
  orderCode: String(partial.orderCode || "").trim(),
  workflowStatus: String(partial.workflowStatus || "").trim() || "Pendiente por confirmar",
  paymentMethod: normalizePaymentMethod(partial.paymentMethod),
  shippingCarrier: normalizeShippingCarrier(partial.shippingCarrier),
  dni: String(partial.dni || "").trim(),
  locationLine: String(partial.locationLine || "").trim(),
  department: String(partial.department || "").trim(),
  province: String(partial.province || "").trim(),
  district: String(partial.district || "").trim(),
  shalomAgency: String(partial.shalomAgency || "").trim(),
  olvaAddress: String(partial.olvaAddress || "").trim(),
  olvaReference: String(partial.olvaReference || "").trim(),
  shalomVoucherImage: String(partial.shalomVoucherImage || "").trim(),
  shalomPickupCode: String(partial.shalomPickupCode || "").trim(),
  olvaTrackingImage: String(partial.olvaTrackingImage || "").trim(),
  notes: String(partial.notes || "").trim(),
});

export const encodeOrderMeta = (meta: Partial<OrderMeta>): string => {
  const normalized = normalizeMeta(meta);
  return `${PREFIX}${JSON.stringify(normalized)}`;
};

export const parseOrderMeta = (raw: unknown): OrderMeta => {
  const text = String(raw || "").trim();
  if (!text) return { ...DEFAULT_META };

  if (text.startsWith(PREFIX)) {
    try {
      const parsed = JSON.parse(text.slice(PREFIX.length));
      return normalizeMeta(parsed || {});
    } catch {
      return { ...DEFAULT_META };
    }
  }

  if (text.startsWith("[payment_method=")) {
    const close = text.indexOf("]");
    const methodRaw = close > 0 ? text.slice("[payment_method=".length, close) : "YAPE";
    const notes = close > 0 ? text.slice(close + 1).replace(/^\n/, "").trim() : text;
    return normalizeMeta({ notes, paymentMethod: methodRaw });
  }

  return normalizeMeta({ notes: text });
};

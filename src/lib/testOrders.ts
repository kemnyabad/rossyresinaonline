import { parseOrderMeta } from "@/lib/orderMeta";

const INTERNAL_TEST_PHONES = new Set(["952108738", "9953029776"]);
const INTERNAL_TEST_NAMES = ["kemeny y rojas a", "kemeny y. rojas a", "kemeny yahir rojas"];

const digitsOnly = (value: unknown) => String(value || "").replace(/\D/g, "");

const normalizeText = (value: unknown) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

export const isInternalTestOrder = (order: {
  customerName?: unknown;
  customerPhone?: unknown;
  customerEmail?: unknown;
  customerNotes?: unknown;
}) => {
  const meta = parseOrderMeta(order.customerNotes);
  if ((meta as any).testOrder === true || normalizeText((meta as any).orderType) === "test") return true;

  const phone = digitsOnly(order.customerPhone);
  if (phone && INTERNAL_TEST_PHONES.has(phone)) return true;

  const name = normalizeText(order.customerName);
  return INTERNAL_TEST_NAMES.some((testName) => name.includes(testName));
};


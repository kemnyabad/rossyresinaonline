const VISITOR_KEY = "rr_visitor_id";

const safeEmail = (email?: string | null) => String(email || "").trim().toLowerCase();

export const ensureResinyVisitorId = () => {
  if (typeof window === "undefined") return "";
  let visitorId = String(window.localStorage.getItem(VISITOR_KEY) || "").trim();
  if (!visitorId) {
    const rnd = Math.random().toString(36).slice(2, 10);
    visitorId = `v-${Date.now()}-${rnd}`;
    window.localStorage.setItem(VISITOR_KEY, visitorId);
  }
  return visitorId;
};

export const getResinyOwnerKey = (email?: string | null) => {
  const normalizedEmail = safeEmail(email);
  if (normalizedEmail) return `user:${normalizedEmail}`;
  return `visitor:${ensureResinyVisitorId()}`;
};

const currentConversationKey = (ownerKey: string) => `rr_resiny_current_conversation:${ownerKey}`;
const conversationListKey = (ownerKey: string) => `rr_resiny_conversations:${ownerKey}`;

const readConversationIds = (ownerKey: string): string[] => {
  if (typeof window === "undefined" || !ownerKey) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(conversationListKey(ownerKey)) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map((id) => String(id || "").trim()).filter(Boolean);
  } catch {
    return [];
  }
};

const writeConversationIds = (ownerKey: string, ids: string[]) => {
  if (typeof window === "undefined" || !ownerKey) return;
  window.localStorage.setItem(conversationListKey(ownerKey), JSON.stringify(Array.from(new Set(ids)).slice(-30)));
};

export const rememberResinyConversation = (ownerKey: string, conversationId: string) => {
  if (typeof window === "undefined" || !ownerKey || !conversationId) return;
  const ids = readConversationIds(ownerKey);
  writeConversationIds(ownerKey, [...ids, conversationId]);
  window.localStorage.setItem(currentConversationKey(ownerKey), conversationId);
};

export const isKnownResinyConversation = (ownerKey: string, conversationId: string) => {
  if (!ownerKey || !conversationId) return false;
  return readConversationIds(ownerKey).includes(conversationId);
};

export const createResinyConversationId = () => {
  const rnd = Math.random().toString(36).slice(2, 12);
  return `c-${Date.now()}-${rnd}`;
};

export const getOrCreateResinyConversationId = (ownerKey: string) => {
  if (typeof window === "undefined" || !ownerKey) return "";
  const existing = String(window.localStorage.getItem(currentConversationKey(ownerKey)) || "").trim();
  if (existing && isKnownResinyConversation(ownerKey, existing)) return existing;
  const id = createResinyConversationId();
  rememberResinyConversation(ownerKey, id);
  return id;
};

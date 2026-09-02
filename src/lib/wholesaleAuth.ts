import crypto from "crypto";

const SESSION_TTL_SECONDS = 90 * 24 * 60 * 60;

const base64UrlEncode = (value: string | Buffer) => Buffer.from(value).toString("base64url");
const base64UrlDecode = (value: string) => Buffer.from(value, "base64url").toString("utf8");

const getSecret = () => String(process.env.ADMIN_SESSION_SECRET || process.env.NEXTAUTH_SECRET || "");

const sign = (payload: string) => crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");

const safeEqual = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

export const createWholesaleSessionToken = (userId: string) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(
    JSON.stringify({ scope: "wholesale", userId, iat: now, exp: now + SESSION_TTL_SECONDS })
  );
  return `${payload}.${sign(payload)}`;
};

export const readWholesaleUserIdFromToken = (token: string): string | null => {
  const secret = getSecret();
  if (!secret || !token || !token.includes(".")) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(sign(payload), signature)) return null;

  try {
    const parsed = JSON.parse(base64UrlDecode(payload));
    const userId = String(parsed?.userId || "");
    const exp = Number(parsed?.exp || 0);
    if (parsed?.scope !== "wholesale" || !userId || exp < Math.floor(Date.now() / 1000)) return null;
    return userId;
  } catch {
    return null;
  }
};

import crypto from "crypto";
import type { GetServerSidePropsContext, NextApiRequest } from "next";
import { verifyUser } from "@/lib/users";

export type AdminSession = {
  email: string;
  role: "ADMIN";
};

const ADMIN_PAGE_COOKIE_NAME = "rr_admin_session";
const ADMIN_API_COOKIE_NAME = "rr_admin_api_session";
const SESSION_TTL_SECONDS = 8 * 60 * 60;

const base64UrlEncode = (value: string | Buffer) =>
  Buffer.from(value).toString("base64url");

const base64UrlDecode = (value: string) =>
  Buffer.from(value, "base64url").toString("utf8");

const getSecret = () =>
  String(process.env.ADMIN_SESSION_SECRET || process.env.NEXTAUTH_SECRET || process.env.ADMIN_PASSWORD || "");

const sign = (payload: string) =>
  crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");

const safeEqual = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

const parseCookies = (cookieHeader?: string) => {
  const cookies: Record<string, string> = {};
  String(cookieHeader || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const eq = part.indexOf("=");
      if (eq === -1) return;
      const key = part.slice(0, eq).trim();
      const value = part.slice(eq + 1).trim();
      if (key) cookies[key] = decodeURIComponent(value);
    });
  return cookies;
};

export const isAllowedAdminEmail = (email: string) => {
  const normalized = String(email || "").trim().toLowerCase();
  const allowed = String(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(normalized) && (allowed.length === 0 || allowed.includes(normalized));
};

export const verifyAdminCredentials = async (email: string, password: string) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const adminPassword = String(process.env.ADMIN_PASSWORD || "");
  if (Boolean(adminPassword) && password === adminPassword && isAllowedAdminEmail(normalizedEmail)) {
    return true;
  }

  const user = await verifyUser(normalizedEmail, password);
  return user?.role === "ADMIN";
};

export const createAdminSessionToken = (email: string) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(
    JSON.stringify({
      email: String(email || "").trim().toLowerCase(),
      role: "ADMIN",
      iat: now,
      exp: now + SESSION_TTL_SECONDS,
    })
  );
  return `${payload}.${sign(payload)}`;
};

export const readAdminSessionFromReq = (req: Pick<NextApiRequest, "headers">): AdminSession | null => {
  const secret = getSecret();
  if (!secret) return null;

  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[ADMIN_API_COOKIE_NAME] || cookies[ADMIN_PAGE_COOKIE_NAME];
  if (!token || !token.includes(".")) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(sign(payload), signature)) return null;

  try {
    const parsed = JSON.parse(base64UrlDecode(payload));
    const email = String(parsed?.email || "").trim().toLowerCase();
    const exp = Number(parsed?.exp || 0);
    if (parsed?.role !== "ADMIN" || !email || exp < Math.floor(Date.now() / 1000)) return null;
    return { email, role: "ADMIN" };
  } catch {
    return null;
  }
};

export const isAdminApiRequest = (req: NextApiRequest) => Boolean(readAdminSessionFromReq(req));

export const getAdminCookieHeader = (token: string) => {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const encoded = encodeURIComponent(token);
  return [
    `${ADMIN_PAGE_COOKIE_NAME}=${encoded}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SECONDS}${secure}`,
    `${ADMIN_PAGE_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/admin; Max-Age=0${secure}`,
    `${ADMIN_API_COOKIE_NAME}=${encoded}; HttpOnly; SameSite=Lax; Path=/api/admin; Max-Age=${SESSION_TTL_SECONDS}${secure}`,
  ];
};

export const getAdminClearCookieHeader = () => {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return [
    `${ADMIN_PAGE_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/admin; Max-Age=0${secure}`,
    `${ADMIN_API_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/api/admin; Max-Age=0${secure}`,
    `${ADMIN_PAGE_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`,
  ];
};

export const requireAdminPage = (ctx: GetServerSidePropsContext, callbackUrl?: string) => {
  const admin = readAdminSessionFromReq(ctx.req);
  if (admin) return null;
  const destination = `/admin/sign-in?callbackUrl=${encodeURIComponent(callbackUrl || ctx.resolvedUrl || "/admin")}`;
  return { redirect: { destination, permanent: false } };
};

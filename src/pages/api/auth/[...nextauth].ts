import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import AppleProvider from "next-auth/providers/apple";
import FacebookProvider from "next-auth/providers/facebook";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyUser, ensureAdminFromEnv, isAdminEmail, ensureOAuthUser } from "@/lib/users";

const oauthProviders = [
  process.env.GITHUB_ID && process.env.GITHUB_SECRET
    ? GithubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      })
    : null,
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: "select_account",
            access_type: "online",
            response_type: "code",
          },
        },
      })
    : null,
  process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
    ? FacebookProvider({
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        authorization: {
          params: {
            scope: "email,public_profile",
          },
        },
      })
    : null,
  process.env.APPLE_ID && process.env.APPLE_SECRET
    ? AppleProvider({
        clientId: process.env.APPLE_ID,
        clientSecret: process.env.APPLE_SECRET,
      })
    : null,
].filter(Boolean) as NextAuthOptions["providers"];

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await ensureAdminFromEnv();
          const allowed = (process.env.ADMIN_EMAILS || "")
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
          const email = String(credentials?.email || "").trim().toLowerCase();
          const pass = String(credentials?.password || "");
          const okPass = !!process.env.ADMIN_PASSWORD && pass === process.env.ADMIN_PASSWORD;
          if (okPass && (allowed.length === 0 || allowed.includes(email))) {
            return { id: email, email, role: "ADMIN" } as any;
          }
          const user = await verifyUser(email, pass);
          if (user) {
            const role = isAdminEmail(user.email) ? "ADMIN" : user.role;
            return { id: user.id, email: user.email, name: user.name, role } as any;
          }
          return null;
        } catch {
          return null;
        }
      },
    }),
    ...oauthProviders,
  ],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        const provider = String(account?.provider || "");
        const email = String(user?.email || "").trim().toLowerCase();
        if (provider && provider !== "credentials" && email) {
          await ensureOAuthUser({
            name: user?.name || email.split("@")[0],
            email,
            role: "CUSTOMER",
          });
        }
        return true;
      } catch {
        return false;
      }
    },
    async jwt({ token, user }) {
      try {
        if (user && (user as any).role) {
          token.role = (user as any).role;
        }
        if (!token.role && isAdminEmail(String(token.email || ""))) {
          token.role = "ADMIN";
        }
        return token;
      } catch {
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (session.user) {
          const roleFromToken = (token as any).role;
          (session.user as any).role = roleFromToken || (isAdminEmail(session.user.email || "") ? "ADMIN" : "CUSTOMER");
          if (!session.user.name && (token as any).name) {
            session.user.name = String((token as any).name);
          }
        }
        return session;
      } catch {
        return session;
      }
    },
  },
};

export default NextAuth(authOptions);

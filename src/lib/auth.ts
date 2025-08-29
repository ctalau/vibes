import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { PREVIEW_HOST_PATTERN } from "./config";

const allowedEmails = (process.env.ALLOWED_EMAILS || "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

const nextAuth = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  // When `NEXTAUTH_URL` is set, NextAuth rebuilds the request via
  // `new NextRequest()` which isn't available in some runtimes and
  // causes "on is not a constructor" errors. Trust the incoming host
  // header instead to avoid this rewrite.
  trustHost: true,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      if (allowedEmails.length === 0) return false;
      return allowedEmails.includes(user.email);
    },
  },
});

export const { handlers, signIn, signOut } = nextAuth;

const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);

export async function auth(req?: NextRequest) {
  const host = req?.nextUrl.host || headers().get("host") || "";
  if (PREVIEW_HOST_PATTERN.test(host)) {
    const token = req?.cookies.get("token")?.value || cookies().get("token")?.value;
    if (!token) return null;
    try {
      const { payload } = await jwtVerify(token, secret);
      const email = payload.email as string | undefined;
      if (!email) return null;
      return { user: { email } };
    } catch {
      return null;
    }
  }
  return nextAuth.auth(req as any);
}

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { encode as encodeJwt } from "next-auth/jwt";

const allowedEmails = (process.env.ALLOWED_EMAILS || "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      if (allowedEmails.length === 0) return false;
      return allowedEmails.includes(user.email);
    },
    async jwt({ token, account }) {
      if (account?.state) {
        try {
          const { from } = JSON.parse(
            Buffer.from(account.state as string, "base64url").toString()
          );
          (token as any).from = from;
        } catch {}
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).jwt = await encodeJwt({
        token,
        secret: process.env.AUTH_SECRET!,
        salt: "authjs.session-token",
      });
      return session;
    },
    async redirect({ url }) {
      return url;
    },
  },
});

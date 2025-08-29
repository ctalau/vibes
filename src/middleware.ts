import { auth } from "./lib/auth";
import { NextResponse } from "next/server";
import { decode as decodeJwt } from "next-auth/jwt";
import { PREVIEW_HOST_PATTERN, PRODUCTION_ORIGIN } from "./lib/config";

export default auth(async (req) => {
  const url = req.nextUrl;
  if (PREVIEW_HOST_PATTERN.test(url.host)) {
    const token = req.cookies.get("session")?.value;
    if (token) {
      try {
        await decodeJwt({
          token,
          secret: process.env.AUTH_SECRET!,
          salt: "authjs.session-token",
        });
        return NextResponse.next();
      } catch {}
    }
    const signInUrl = new URL(`${PRODUCTION_ORIGIN}/api/auth/signin`);
    signInUrl.searchParams.set("from", url.href);
    return NextResponse.redirect(signInUrl);
  }

  if (!(req as any).auth) {
    const signInUrl = new URL("/api/auth/signin", url);
    signInUrl.searchParams.set("callbackUrl", url.href);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

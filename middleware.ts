import { auth } from "./src/lib/auth";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { PREVIEW_HOST_PATTERN, PRODUCTION_ORIGIN } from "./src/lib/config";

export default auth(async (req) => {
  const url = req.nextUrl;
  if (PREVIEW_HOST_PATTERN.test(url.host)) {
    const token = req.cookies.get("session")?.value;
    if (token) {
      try {
        await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET!));
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

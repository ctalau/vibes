import { NextResponse, type NextRequest } from "next/server";
import { auth } from "./lib/auth";
import { PREVIEW_HOST_PATTERN, PRODUCTION_HOST } from "./lib/config";

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = url.host;
  const isPreview = PREVIEW_HOST_PATTERN.test(host);

  // Skip auth routes
  if (url.pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  if (isPreview) {
    // Handle incoming token param
    const tokenParam = url.searchParams.get("token");
    if (tokenParam) {
      const redirectUrl = url.clone();
      redirectUrl.searchParams.delete("token");
      const res = NextResponse.redirect(redirectUrl);
      res.cookies.set("token", tokenParam, {
        httpOnly: true,
        secure: true,
        path: "/",
      });
      return res;
    }

    const session = await auth(req);
    if (!session?.user) {
      const redirectUrl = new URL(`https://${PRODUCTION_HOST}/me/token`);
      redirectUrl.searchParams.set("callbackUrl", url.href);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  const session = await auth(req);
  if (!session?.user) {
    const signInUrl = new URL("/api/auth/signin", url);
    signInUrl.searchParams.set("callbackUrl", url.href);
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

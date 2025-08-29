import { NextResponse, type NextRequest } from "next/server";
import { auth } from "./lib/auth";
import { PREVIEW_HOST_PATTERN } from "./lib/config";

const withAuth = auth((req) => {
  const url = req.nextUrl;
  if (!req.auth) {
    const signInUrl = new URL("/api/auth/signin", url);
    signInUrl.searchParams.set("callbackUrl", url.href);
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
});

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;

  if (
    !PREVIEW_HOST_PATTERN.test(url.host) &&
    url.pathname.startsWith("/api/auth/callback")
  ) {
    const stateParam = url.searchParams.get("state");
    if (stateParam) {
      try {
        const { host } = JSON.parse(
          Buffer.from(stateParam, "base64url").toString()
        );
        if (host) {
          const redirectUrl = new URL(url.href);
          redirectUrl.host = host;
          return NextResponse.redirect(redirectUrl);
        }
      } catch {}
    }
  }

  return withAuth(req, { params: {} } as any);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};


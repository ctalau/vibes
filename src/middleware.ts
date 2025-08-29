import { auth } from "./lib/auth";
import { NextResponse } from "next/server";
import { decode as decodeJwt } from "next-auth/jwt";
import { PREVIEW_HOST_PATTERN, PRODUCTION_ORIGIN } from "./lib/config";

export default auth(async (req) => {
  const url = req.nextUrl;
  if (PREVIEW_HOST_PATTERN.test(url.host)) {
    const urlToken = url.searchParams.get("token");
    if (urlToken) {
      try {
        await decodeJwt({
          token: urlToken,
          secret: process.env.AUTH_SECRET!,
          salt: "authjs.session-token",
        });
        const newUrl = new URL(url.href);
        newUrl.searchParams.delete("token");
        const res = NextResponse.redirect(newUrl);
        res.cookies.set("session", urlToken, {
          path: "/",
          sameSite: "lax",
          secure: true,
        });
        return res;
      } catch (error) {
        console.error("Failed to decode session token", error);
        const lines = [
          "Failed to decode session token.",
          `Host: ${url.host}`,
          `Path: ${url.pathname}`,
          `Token: ${urlToken}`,
        ];
        if (error instanceof Error) {
          lines.push(`Error: ${error.message}`);
          if (error.stack) lines.push(error.stack);
        } else {
          lines.push(`Error: ${String(error)}`);
        }
        return new NextResponse(lines.join("\n"), {
          status: 401,
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }
    }
    const token = req.cookies.get("session")?.value;
    if (token) {
      try {
        await decodeJwt({
          token,
          secret: process.env.AUTH_SECRET!,
          salt: "authjs.session-token",
        });
        return NextResponse.next();
      } catch (error) {
        console.error("Failed to decode session token", error);
        const signInUrl = new URL(`${PRODUCTION_ORIGIN}/api/auth/signin`);
        signInUrl.searchParams.set("from", url.href);
        const lines = [
          "Failed to decode session token.",
          `Host: ${url.host}`,
          `Path: ${url.pathname}`,
          `Sign-in URL: ${signInUrl.href}`,
          `Token: ${token}`,
        ];
        if (error instanceof Error) {
          lines.push(`Error: ${error.message}`);
          if (error.stack) lines.push(error.stack);
        } else {
          lines.push(`Error: ${String(error)}`);
        }
        return new NextResponse(lines.join("\n"), {
          status: 401,
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }
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

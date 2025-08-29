import { NextRequest, NextResponse } from "next/server";
import { signIn } from "../../../../lib/auth";
import { PREVIEW_HOST_PATTERN } from "../../../../lib/config";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const callbackUrl = url.searchParams.get("callbackUrl") ?? url.origin;

  // For preview deployments, don't pass the preview host as redirectTo
  // This ensures NextAuth uses NEXTAUTH_URL for the OAuth callback
  const redirectTo = !PREVIEW_HOST_PATTERN.test(url.host) 
    ? callbackUrl 
    : undefined;

  const location = await signIn("google", {
    redirect: false,
    redirectTo,
  });

  if (!location)
    return NextResponse.json({ error: "Sign in failed" }, { status: 500 });

  if (!PREVIEW_HOST_PATTERN.test(url.host)) {
    return NextResponse.redirect(location);
  }

  // For preview hosts, encode both the callback URL and CSRF token in state
  const redirectUrl = new URL(location);
  const csrfState = redirectUrl.searchParams.get("state") ?? "";
  const state = Buffer.from(
    JSON.stringify({ 
      csrfToken: csrfState, 
      callbackUrl: callbackUrl,  // Store the original callback URL
      host: url.host 
    })
  ).toString("base64url");
  redirectUrl.searchParams.set("state", state);

  return NextResponse.redirect(redirectUrl);
}

import { NextRequest, NextResponse } from "next/server";
import { signIn } from "../../../../lib/auth";
import { PREVIEW_HOST_PATTERN } from "../../../../lib/config";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const callbackUrl = url.searchParams.get("callbackUrl") ?? url.origin;

  const location = await signIn("google", {
    redirect: false,
    redirectTo: callbackUrl,
  });

  if (!location)
    return NextResponse.json({ error: "Sign in failed" }, { status: 500 });

  if (!PREVIEW_HOST_PATTERN.test(url.host)) {
    return NextResponse.redirect(location);
  }

  const redirectUrl = new URL(location);
  const csrfState = redirectUrl.searchParams.get("state") ?? "";
  const state = Buffer.from(
    JSON.stringify({ csrfToken: csrfState, host: url.host })
  ).toString("base64url");
  redirectUrl.searchParams.set("state", state);

  return NextResponse.redirect(redirectUrl);
}

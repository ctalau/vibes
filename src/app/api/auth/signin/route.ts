import { NextRequest, NextResponse } from "next/server";
import { signIn } from "../../../../lib/auth";
import { PREVIEW_HOST_PATTERN } from "../../../../lib/config";

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from");
  if (from) {
    try {
      const fromUrl = new URL(from);
      if (!PREVIEW_HOST_PATTERN.test(fromUrl.host)) {
        return NextResponse.json({ error: "Invalid from" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid from" }, { status: 400 });
    }
  }
  const callbackUrl = from
    ? `${req.nextUrl.origin}/auth/relay?from=${encodeURIComponent(from)}`
    : req.nextUrl.origin;
  const location = await signIn("google", {
    redirect: false,
    redirectTo: callbackUrl,
  });
  if (!location)
    return NextResponse.json({ error: "Sign in failed" }, { status: 500 });
  const url = new URL(location);
  const csrfState = url.searchParams.get("state") ?? "";
  const state = Buffer.from(
    JSON.stringify({ csrfToken: csrfState, from })
  ).toString("base64url");
  url.searchParams.set("state", state);
  return NextResponse.redirect(url);
}

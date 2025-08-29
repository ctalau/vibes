import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { auth } from "../../../lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth(req);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
  if (!callbackUrl) {
    return NextResponse.json({ error: "callbackUrl required" }, { status: 400 });
  }
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(process.env.AUTH_SECRET!));
  const url = new URL(callbackUrl);
  url.searchParams.set("token", token);
  return NextResponse.redirect(url);
}

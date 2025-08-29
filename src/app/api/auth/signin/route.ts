import { NextRequest, NextResponse } from "next/server";
import { signIn } from "../../../../lib/auth";
import { PREVIEW_HOST_PATTERN,PRODUCTION_HOST } from "../../../../lib/config";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const callbackUrl = url.searchParams.get("callbackUrl") ?? url.origin;
  const isPreviewDeployment = PREVIEW_HOST_PATTERN.test(url.host);

  if (isPreviewDeployment) {
    return handlePreviewDeployment(callbackUrl);
  } else {
    return handleProductionDeployment(callbackUrl);
  }
}

async function handleProductionDeployment(callbackUrl: string) {
  const location = await signIn("google", {
    redirect: false,
    redirectTo: callbackUrl,
  });

  if (!location) {
    return NextResponse.json({ error: "Sign in failed" }, { status: 500 });
  }

  return NextResponse.redirect(location);
}

async function handlePreviewDeployment(callbackUrl: string) {
  // For preview deployments, don't pass redirectTo to ensure
  // NextAuth uses NEXTAUTH_URL for the OAuth callback
  const location = await signIn("google", {
    redirect: false,
    redirectTo: 'https://' + PRODUCTION_HOST + '/api/auth/callback',
  });

  if (!location) {
    return NextResponse.json({ error: "Sign in failed" }, { status: 500 });
  }

  // Encode both the callback URL and CSRF token in state for preview hosts
  const redirectUrl = new URL(location);
  const csrfState = redirectUrl.searchParams.get("state") ?? "";
  
  const encodedState = Buffer.from(
    JSON.stringify({ 
      csrfToken: csrfState, 
      callbackUrl: callbackUrl
    })
  ).toString("base64url");
  
  redirectUrl.searchParams.set("state", encodedState);

  return NextResponse.redirect(redirectUrl);
}

import { PREVIEW_HOST_PATTERN, PRODUCTION_ORIGIN } from "./config";

export function redirectToLogin() {
  if (typeof window === "undefined") return;
  const from = window.location.href;
  if (!PREVIEW_HOST_PATTERN.test(window.location.host)) return;
  const target = `${PRODUCTION_ORIGIN}/api/auth/signin?from=${encodeURIComponent(from)}`;
  window.location.href = target;
}

export function redirectToLogout() {
  if (typeof window === "undefined") return;
  const from = window.location.href;
  if (!PREVIEW_HOST_PATTERN.test(window.location.host)) return;
  const target = `${PRODUCTION_ORIGIN}/api/auth/signout?from=${encodeURIComponent(from)}`;
  window.location.href = target;
}

# Authentication Preview Branch Implementation Plan

## Background
Preview deployments use dynamic subdomains like `https://vibes-<hash>-ctalaus-projects.vercel.app` that cannot be whitelisted in Google OAuth redirect URIs. Google only accepts static redirect URLs configured ahead of time.

To enable Google sign-in on preview deployments, all OAuth exchanges must occur on the production domain `https://ctalau-vibe-coding.vercel.app`. After completing login, the user must be returned to the originating preview URL with a valid session.

## Goals
- Reuse a single Google OAuth client configured for the production domain.
- Allow preview branches to initiate login and receive a session without direct Google redirects.
- Maintain CSRF protection and allowlist enforcement as defined in the PRD.
- Keep the flow frugal: no extra third-party services or heavy dependencies.

## Architecture Overview
1. **Preview login redirect** – Preview branch routes `/api/auth/signin` simply redirect to the production domain with a `from` query param containing the full preview URL.
2. **Centralized Auth.js** – Production domain runs the full Auth.js configuration with Google provider and allowlist checks. The `from` value is preserved in the OAuth `state` parameter.
3. **Session handoff** – After successful login, production domain issues a signed JWT session and returns the user to the preview URL with the token in the URL hash (`#token=`). The preview script writes this token into its own cookie for subsequent requests.
4. **Preview middleware** – Preview middleware verifies the cookie JWT locally (shared `AUTH_SECRET`). If missing or invalid, it performs Step 1 again.
5. **Logout** – Preview branches redirect sign‑outs to the production `/api/auth/signout?from=<previewURL>` so production clears its cookie then forwards back to the preview page.

## Detailed Steps
### 1. Preview Branch Redirect Helper
- Create a client helper `redirectToLogin()` used by sign-in buttons.
- Implementation: `window.location.href = “https://ctalau-vibe-coding.vercel.app/api/auth/signin?from=” + encodeURIComponent(window.location.href)`.
- Validate `from` before redirecting to ensure it matches `/^https:\/\/vibes-[a-z0-9-]+-ctalaus-projects.vercel.app/`.

### 2. Auth.js Sign-In Handler on Production
- In `src/lib/auth.ts` configure Google provider and JWT sessions as usual.
- Extend sign-in endpoint (`/api/auth/signin`) to read the `from` parameter and include it in the `state` sent to Google.
- The `state` should be JSON `{ csrfToken, from }` base64-encoded.

### 3. Callback Processing and Session Creation
- Auth.js callback receives the `state` and verifies `csrfToken`.
- After allowlist check passes, generate JWT session using `AUTH_SECRET`.
- Redirect user to `/auth/relay?from=<encodedFrom>#token=<jwt>`.

### 4. Relay Endpoint
- Implement `/auth/relay` page on production domain.
- Purpose: perform final redirect to the preview URL with the session token in the URL hash to avoid leaking in logs.
- The page executes a small script:
  ```html
  <script>
    const url = new URL(window.location.href);
    const token = url.hash.slice(7); // after '#token='
    const from = url.searchParams.get('from');
    if (from && token) {
      window.location.replace(`${from}#token=${token}`);
    }
  </script>
  ```

### 5. Preview Token Writer
- On preview deployments, add a script that runs before protected routes load:
  ```js
  const url = new URL(window.location.href);
  const token = url.hash.slice(7);
  if (token) {
    document.cookie = `session=${token}; Path=/; SameSite=Lax; Secure`;
    url.hash = '';
    history.replaceState(null, '', url);
  }
  ```
- Middleware (`middleware.ts`) reads `session` cookie and verifies JWT locally with `AUTH_SECRET`.

### 6. Logout Flow
- Sign-out button redirects to `https://ctalau-vibe-coding.vercel.app/api/auth/signout?from=<previewURL>`.
- Production domain clears its session cookie and redirects back to the `from` URL.
- Preview script deletes its own `session` cookie.

### 7. Environment & Config
- `NEXTAUTH_URL` remains `https://ctalau-vibe-coding.vercel.app` for all builds.
- Share `AUTH_SECRET` between production and preview.
- Optionally expose `PREVIEW_LOGIN_URL` for helper script.

## Tasks
- [x] Add preview login redirect helper and token writer script.
- [x] Extend Auth.js sign-in and callback handlers with `from`/`state` logic.
- [x] Implement `/auth/relay` page.
- [x] Verify middleware JWT validation on preview domains.
- [x] Document logout and environment variable requirements.

## Acceptance Criteria
- Preview deployments trigger Google OAuth on the production domain and return to the original preview URL after login.
- Valid session cookie exists on preview domain enabling access to protected routes.
- CSRF and domain validation prevent open redirects or token leakage.
- Logout clears sessions on both production and preview deployments.

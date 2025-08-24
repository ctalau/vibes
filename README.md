Vibe coding projects
====================

## Google Cloud OAuth

Manage OAuth client credentials for this project via the [Google Cloud Console](https://console.cloud.google.com/auth/clients?project=ctalau-vibe-coding). Configure authorized redirect URIs for both local development and your deployed domain, and supply the resulting `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` values in your environment.

## Testing authentication

1. Populate the auth-related variables in `.env`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `AUTH_SECRET`
   - `ALLOWED_EMAILS` (comma-separated list)
2. Start the app with `pnpm dev` and visit `http://localhost:3000`.
3. When signed out, you should be redirected to Google and only allowlisted emails can proceed.
4. To confirm the gate, repeat in a private window or remove your email from `ALLOWED_EMAILS` and restart.

## Preview deployments

For Vercel preview branches, set the same variables in the "Preview" environment. Register each preview domain as an authorized OAuth redirect in Google Cloud so that sign-ins succeed, and keep `ALLOWED_EMAILS` limited to trusted testers.


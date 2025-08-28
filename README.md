Vibe coding projects
====================

## Google Cloud OAuth

Manage OAuth client credentials for this project via the [Google Cloud Console](https://console.cloud.google.com/auth/clients?project=ctalau-vibe-coding). Configure authorized redirect URIs for both local development and your deployed domain, and supply the resulting `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` values in your environment.

## Database

This project uses MongoDB.

1. Create a MongoDB instance.
2. Set the connection string as `MONGODB_URI` in your `.env` file.
3. Collections are created on demand; no additional setup is required.

## Preview Authentication

Preview deployments cannot be registered as Google OAuth redirect URLs. All
sign-ins and sign-outs on preview branches are redirected to the production
domain (`https://ctalau-vibe-coding.vercel.app`) with a `from` parameter
containing the originating preview URL. After a successful login, production
redirects to the preview with a short-lived JWT which the preview branch stores
in a `session` cookie.

To log out, preview branches send users to
`https://ctalau-vibe-coding.vercel.app/api/auth/signout?from=<previewURL>` so
the production cookie is cleared before returning to the preview, where the
client script deletes its own `session` cookie.

### Required Environment

- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `AUTH_SECRET` shared by production and preview builds
- `NEXTAUTH_URL` set to `https://ctalau-vibe-coding.vercel.app`

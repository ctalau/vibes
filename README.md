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

Preview deployments cannot be registered as Google OAuth redirect URLs. Preview
requests without a session are sent through the normal sign-in route, which
starts Google OAuth using the production domain as the callback and encodes the
preview host in the `state`. When Google redirects back to production, middleware
there forwards the callback to the preview deployment to complete the login and
set the session cookie locally.

### Required Environment

- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `AUTH_SECRET` shared by production and preview builds
- `NEXTAUTH_URL` set to `https://ctalau-vibe-coding.vercel.app`

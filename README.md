Vibe coding projects
====================

## Google Cloud OAuth

Manage OAuth client credentials for this project via the [Google Cloud Console](https://console.cloud.google.com/auth/clients?project=ctalau-vibe-coding). Configure authorized redirect URIs for both local development and your deployed domain, and supply the resulting `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` values in your environment.

## Database

This project uses [Neon](https://neon.tech) for Postgres and [Drizzle ORM](https://orm.drizzle.team).

1. Create a Neon project and database.
2. Copy the connection string and set it as `DATABASE_URL` in your `.env` file.
3. Apply migrations with:

   ```bash
   pnpm db:migrate
   ```

Generate new migrations after schema changes with:

```bash
pnpm db:generate
```

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

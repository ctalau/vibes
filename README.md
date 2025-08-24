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
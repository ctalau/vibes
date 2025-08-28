Vibe coding projects
====================

## Google Cloud OAuth

Manage OAuth client credentials for this project via the [Google Cloud Console](https://console.cloud.google.com/auth/clients?project=ctalau-vibe-coding). Configure authorized redirect URIs for both local development and your deployed domain, and supply the resulting `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` values in your environment.

## Database

This project uses MongoDB.

1. Create a MongoDB instance.
2. Set the connection string as `MONGODB_URI` in your `.env` file.
3. Collections are created on demand; no additional setup is required.

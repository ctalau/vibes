# Product Requirements Document

## Overview
This document defines the core platform for browsing and launching small applications.

## Authentication
- Sign in using Google OAuth.
- Access is limited to an allowlist of approved accounts.

## App Directory
- Directory lists all available apps with names and descriptions.
- Users can search the directory.
- Apps can be favorited for quick access.

## Shared UI System
- A common component library ensures visual consistency.
- Tokens and themes are shared across all apps.

## Data Schema
- Backend uses a Neon-hosted Postgres database.
- Schema tracks users, apps and favorite relationships.

## API Surface
- Endpoints expose authentication, directory search and favorites management.

## Performance and Cost Guardrails
- Requests target p95 latency under 200 ms.
- Cloud usage is monitored to stay within budget.

## Templates
- Each app maintains its own PRD, plan and AGENTS documents derived from provided templates.


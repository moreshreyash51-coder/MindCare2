---
name: MindCare deployment persistence
description: Why production Postgres stores the existing document-shaped feature records.
---

MindCare's production database adapter should preserve the existing Mongo-shaped route contracts by storing each feature collection as JSON documents in Postgres rather than forcing a frontend or API response rewrite.

**Why:** The imported app already has many feature-specific routes and nested records. A document-compatible relational adapter allows Vercel/Neon persistence without changing the existing UI behavior.

**How to apply:** Keep the adapter behind the existing database interface and require a persistent Postgres/Neon connection for production; retain the seeded in-memory path only for local development.

For this monorepo, Vercel must build the repository root with the root Vercel configuration, which explicitly targets the MindCare artifact; selecting the separate API-server artifact produces unrelated build failures.

**Why:** Multiple Replit artifacts share the repository, and Vercel can otherwise auto-detect the wrong package as the application.

**How to apply:** Keep the Vercel Root Directory at the repository root, or deliberately select `artifacts/mindcare` and use its nested configuration; never select `artifacts/api-server` for the MindCare deployment.
---
name: MindCare deployment persistence
description: Why production Postgres stores the existing document-shaped feature records.
---

MindCare's production database adapter should preserve the existing Mongo-shaped route contracts by storing each feature collection as JSON documents in Postgres rather than forcing a frontend or API response rewrite.

**Why:** The imported app already has many feature-specific routes and nested records. A document-compatible relational adapter allows Vercel/Neon persistence without changing the existing UI behavior.

**How to apply:** Keep the adapter behind the existing database interface and require a persistent Postgres/Neon connection for production; retain the seeded in-memory path only for local development.
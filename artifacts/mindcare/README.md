# MindCare

MindCare is a senior-friendly cognitive support and memory assistance application for patients and family caregivers. The imported interface and feature behavior are preserved, including memory books, reminders, cognitive games, caregiver monitoring, music therapy, accessibility controls, location support, notifications, and AI assistance.

## Local development

The app runs with Express and Vite through one process. With no database configuration, it uses the built-in seeded in-memory datastore. If a local Postgres connection is available, it uses that connection instead.

```bash
pnpm install
pnpm --filter @workspace/mindcare run dev
```

Open `http://localhost:3000` when running the package directly, or use the Replit preview when running the configured workflow.

Useful endpoints:

- `GET /api/health` — direct local server health
- `GET /api/db/status` — database engine and record counts
- `POST /api/auth/login` — authentication endpoint

The Replit workspace preview reserves `/api` for another existing artifact, so the MindCare preview injects `VITE_API_BASE_URL=/mindcare-api` and uses the equivalent `/mindcare-api/*` endpoints. This is only a preview routing detail; Vercel uses `/api/*`.

## Local production build

```bash
pnpm --filter @workspace/mindcare run build
pnpm --filter @workspace/mindcare run start
```

The server reads `PORT` and binds to `0.0.0.0`. A persistent database is required when `NODE_ENV=production` unless `ALLOW_EPHEMERAL_DB=true` is explicitly set for a non-production test.

## Demo accounts

The initial records are seeded automatically:

| Role | Email | Password |
| --- | --- | --- |
| Patient | `eleanor@example.com` | `password123` |
| Caregiver | `sarah@example.com` | `password123` |
| Patient | `arthur@example.com` | `password123` |

Change the demo passwords before using a public deployment.

## Deploying the full app to Vercel

MindCare is configured as one Vercel project. The repository root has a Vercel configuration that explicitly builds `@workspace/mindcare`, emits the frontend to `artifacts/mindcare/dist/public`, and exposes the existing Express routes through the root `api/index.ts` serverless function. A second configuration exists inside `artifacts/mindcare` for deployments where that directory is selected as the Vercel Root Directory.

1. Import the repository into Vercel. The safest setting is to leave the Vercel Root Directory at the repository root. Do not select `artifacts/api-server`; that is a separate API artifact.
2. Use the detected `pnpm` package manager.
3. Set the build command to:

   ```bash
   pnpm --filter @workspace/mindcare run build:vercel && rm -rf dist/public && mkdir -p dist && cp -a artifacts/mindcare/dist/public dist/public
   ```

4. Set the output directory to:

   ```text
   dist/public
   ```

5. If you intentionally set the Vercel Root Directory to `artifacts/mindcare`, use the nested configuration instead:

   ```text
   Build command: npm run build:vercel
   Output directory: dist/public
   ```

6. Add a Neon Postgres database through the Vercel Marketplace and expose its connection string as `POSTGRES_URL` (or `DATABASE_URL`).
7. Add the following environment variables in Vercel:

   ```text
   POSTGRES_URL=<Neon connection string>
   JWT_SECRET=<long random signing secret>
   GEMINI_API_KEY=<optional, for AI features>
   ```

   Do not commit these values or put them in the frontend.
8. Deploy. Vercel rewrites `/api/*` to the MindCare Express function and all non-API routes to the SPA entrypoint.

On the first request, MindCare creates the `mindcare_documents` table and seeds the same demo records used by local development. The Postgres adapter keeps the existing route response shapes and stores each feature collection as JSON documents, so the frontend behavior remains unchanged.

## Environment variables

```env
# Persistent production database. Prefer Neon through the Vercel Marketplace.
POSTGRES_URL=""
DATABASE_URL=""

# Required for production authentication.
JWT_SECRET=""

# Optional AI features.
GEMINI_API_KEY=""

# Legacy compatibility option for existing MongoDB deployments.
MONGODB_URI=""

# Optional local server port.
PORT=3000
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm --filter @workspace/mindcare run dev` | Starts the local Express/Vite development server |
| `pnpm --filter @workspace/mindcare run typecheck` | Runs the TypeScript check |
| `pnpm --filter @workspace/mindcare run build` | Builds the frontend and local production server |
| `pnpm --filter @workspace/mindcare run build:vercel` | Builds the Vercel frontend output |
| `pnpm --filter @workspace/mindcare run start` | Starts the compiled local production server |
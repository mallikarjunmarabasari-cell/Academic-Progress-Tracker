# Dept Intelligence — Platform (scaffold)

This folder contains a minimal Next.js + TypeScript + Tailwind scaffold for the Dept Intelligence platform. Run:

```bash
cd platform
pnpm install
pnpm dev
```

## Production Deployment

### Frontend (Vercel)

1. Connect your GitHub repo to Vercel.
2. Set the project root to `platform`.
3. Use the build command:
   ```bash
   pnpm build
   ```
4. Use the install command:
   ```bash
   pnpm install
   ```
5. Set environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (optional)
   - `SUPABASE_PUBLISHABLE_KEY`

### Frontend (Netlify)

Netlify can also deploy the app, but Vercel is recommended for Next.js. If you use Netlify, set the base directory to `platform` and use the same install/build commands.

### Backend (Render)

This repository includes an optional backend service at `artifacts/api-server`.
Render can deploy it separately as a Node web service.

- Root directory: `artifacts/api-server`
- Build command: `pnpm install`
- Start command: `pnpm --filter ./artifacts/api-server run start`
- Set any required environment variables on Render (e.g. `NODE_ENV=production`).

A sample Render service definition has been added at the repository root in `render.yaml`.

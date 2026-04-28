// Sanity env. We avoid throwing at module load so that `next build` doesn't
// crash when env vars aren't present (e.g. on a fresh Vercel deploy where the
// build runs before all env vars are wired up). Missing values still surface
// at runtime through the Sanity client itself.

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-08-21'

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
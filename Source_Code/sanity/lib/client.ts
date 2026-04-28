import { createClient, type SanityClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

// Lazy proxy so `createClient` doesn't run (and throw) at module-load time
// when NEXT_PUBLIC_SANITY_PROJECT_ID isn't set during `next build`.
// Real network calls still fail later if the env vars aren't actually set.

let _client: SanityClient | null = null;

function getClient(): SanityClient {
  if (_client) return _client;
  if (!projectId) {
    throw new Error(
      "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID"
    );
  }
  _client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true,
  });
  return _client;
}

export const client: SanityClient = new Proxy({} as SanityClient, {
  get(_target, prop, receiver) {
    const c = getClient();
    const value = Reflect.get(c, prop, receiver);
    return typeof value === "function" ? value.bind(c) : value;
  },
});

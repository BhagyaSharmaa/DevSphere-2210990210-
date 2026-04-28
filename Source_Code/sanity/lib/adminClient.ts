import { createClient, type SanityClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

// The admin client needs a write token. We build it lazily so that
// `next build` (and any module that *imports* this file) doesn't crash
// when SANITY_API_TOKEN isn't present at build time. The check happens
// the first time someone actually calls `adminClient.<method>()`.

let _client: SanityClient | null = null;

function getClient(): SanityClient {
  if (_client) return _client;

  const token = process.env.SANITY_API_TOKEN;
  if (!token) {
    throw new Error(
      "Missing environment variable: SANITY_API_TOKEN. Set it to perform write operations."
    );
  }

  _client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
  });

  return _client;
}

// Proxy that defers client creation to first use.
export const adminClient: SanityClient = new Proxy({} as SanityClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

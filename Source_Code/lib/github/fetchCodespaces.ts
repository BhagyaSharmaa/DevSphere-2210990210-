/**
 * Fetch the authenticated user's GitHub Codespaces and produce a
 * map of `repo full_name` → most recently updated codespace's `web_url`.
 *
 * Codespaces are private to each user, so this only works with the user's
 * own OAuth access token (with the `codespace` scope). We use it on sign-in
 * to cache an "Open in Codespace" URL alongside each repo, and we also
 * expose a fresh-fetch helper for owner-only on-demand UIs.
 *
 * Endpoint: GET /user/codespaces
 * Docs:    https://docs.github.com/en/rest/codespaces/codespaces
 */

export type GithubCodespaceLite = {
  name: string;
  state: string;
  web_url: string;
  repository_full_name: string;
  updated_at: string;
};

type RawCodespace = {
  name: string;
  state: string;
  web_url: string;
  updated_at: string;
  repository: { full_name: string };
};

export async function fetchUserCodespaces(
  accessToken: string
): Promise<GithubCodespaceLite[]> {
  const out: GithubCodespaceLite[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = new URL("https://api.github.com/user/codespaces");
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("page", String(page));

    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (res.status === 404) {
      // Codespaces unavailable for this account / token scope missing.
      return [];
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `GitHub /user/codespaces failed (${res.status}): ${text}`
      );
    }

    const json = (await res.json()) as {
      total_count?: number;
      codespaces?: RawCodespace[];
    };
    const chunk = json.codespaces ?? [];
    if (chunk.length === 0) break;

    for (const c of chunk) {
      out.push({
        name: c.name,
        state: c.state,
        web_url: c.web_url,
        repository_full_name: c.repository?.full_name,
        updated_at: c.updated_at,
      });
    }

    if (chunk.length < perPage) break;
    page += 1;
  }

  return out;
}

/**
 * Reduce a list of codespaces into a `repo full_name -> web_url` map.
 * If a repo has multiple codespaces, the most recently updated one wins.
 */
export function indexCodespacesByRepo(
  codespaces: GithubCodespaceLite[]
): Record<string, string> {
  const sorted = [...codespaces].sort((a, b) =>
    a.updated_at < b.updated_at ? 1 : -1
  );
  const map: Record<string, string> = {};
  for (const c of sorted) {
    if (!c.repository_full_name) continue;
    if (!map[c.repository_full_name]) {
      map[c.repository_full_name] = c.web_url;
    }
  }
  return map;
}

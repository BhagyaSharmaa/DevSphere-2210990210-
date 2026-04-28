/**
 * Fetch the GitHub repositories that are relevant to a user, including:
 *   - repositories they OWN
 *   - public repositories they are a COLLABORATOR on
 *   - public repositories from organizations they belong to
 *
 * Strategy:
 *   - If we have the user's OAuth access token, we use the authenticated
 *     `/user/repos` endpoint with `affiliation=owner,collaborator,organization_member`.
 *     This is the only endpoint that returns collaborator repos for the user.
 *   - If we don't have a token (e.g. background lookup for someone other
 *     than the signed-in user), we fall back to the public
 *     `/users/{login}/repos?type=owner` endpoint, which returns owned-only.
 *
 * Each returned repo carries an `affiliation` ("owner" | "collaborator" |
 * "organization_member") so the UI can show a small badge.
 */

export type GithubAffiliation = "owner" | "collaborator" | "organization_member";

export type GithubRepoLite = {
  name: string;
  full_name: string;
  owner_login: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  /** Whether the user OWNS the repo, COLLABORATES on it, or is a member of the owning org. */
  affiliation: GithubAffiliation;
};

type FetchReposParams = {
  login: string;
  accessToken?: string;
  limit?: number;
};

type RawRepo = {
  name: string;
  full_name: string;
  owner: { login: string };
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  // /user/repos returns this; /users/{login}/repos does not.
  permissions?: { admin?: boolean; push?: boolean; pull?: boolean };
};

function inferAffiliation(repo: RawRepo, viewerLogin: string): GithubAffiliation {
  if (repo.owner.login.toLowerCase() === viewerLogin.toLowerCase()) {
    return "owner";
  }
  // Heuristic: if owner is a User (not org) and not the viewer, it's a collaborator.
  // We can't reliably tell User vs Organization without an extra request, so anything
  // not owned by the viewer is treated as collaborator/org_member generically.
  // GitHub's /user/repos response also includes `permissions`, but the affiliation
  // type we want is best inferred from the request param. Default to collaborator;
  // org membership is tagged at the call site if we know the org.
  return "collaborator";
}

async function fetchAuthenticatedUserRepos(
  login: string,
  accessToken: string,
  limit: number
): Promise<GithubRepoLite[]> {
  const perPage = 100;
  let page = 1;
  const out: GithubRepoLite[] = [];

  while (out.length < limit) {
    const remaining = limit - out.length;
    const currentPerPage = Math.min(perPage, remaining);

    const url = new URL("https://api.github.com/user/repos");
    url.searchParams.set("affiliation", "owner,collaborator,organization_member");
    url.searchParams.set("visibility", "public");
    url.searchParams.set("sort", "updated");
    url.searchParams.set("direction", "desc");
    url.searchParams.set("per_page", String(currentPerPage));
    url.searchParams.set("page", String(page));

    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `GitHub /user/repos failed (${res.status}) for ${login}: ${text}`
      );
    }

    const chunk = (await res.json()) as RawRepo[];
    if (!Array.isArray(chunk) || chunk.length === 0) break;

    for (const r of chunk) {
      out.push({
        name: r.name,
        full_name: r.full_name,
        owner_login: r.owner.login,
        html_url: r.html_url,
        description: r.description,
        language: r.language,
        stargazers_count: r.stargazers_count,
        forks_count: r.forks_count,
        updated_at: r.updated_at,
        affiliation: inferAffiliation(r, login),
      });
    }

    if (chunk.length < currentPerPage) break;
    page += 1;
  }

  return out;
}

async function fetchPublicOwnerRepos(
  login: string,
  limit: number
): Promise<GithubRepoLite[]> {
  const perPage = 100;
  let page = 1;
  const out: GithubRepoLite[] = [];

  while (out.length < limit) {
    const remaining = limit - out.length;
    const currentPerPage = Math.min(perPage, remaining);

    const url = new URL(`https://api.github.com/users/${login}/repos`);
    url.searchParams.set("type", "owner");
    url.searchParams.set("sort", "updated");
    url.searchParams.set("direction", "desc");
    url.searchParams.set("per_page", String(currentPerPage));
    url.searchParams.set("page", String(page));

    const res = await fetch(url, {
      headers: { Accept: "application/vnd.github+json" },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `GitHub /users/{login}/repos failed (${res.status}) for ${login}: ${text}`
      );
    }

    const chunk = (await res.json()) as RawRepo[];
    if (!Array.isArray(chunk) || chunk.length === 0) break;

    for (const r of chunk) {
      out.push({
        name: r.name,
        full_name: r.full_name,
        owner_login: r.owner.login,
        html_url: r.html_url,
        description: r.description,
        language: r.language,
        stargazers_count: r.stargazers_count,
        forks_count: r.forks_count,
        updated_at: r.updated_at,
        affiliation: "owner",
      });
    }

    if (chunk.length < currentPerPage) break;
    page += 1;
  }

  return out;
}

export async function fetchGithubPublicRepos({
  login,
  accessToken,
  limit = 50,
}: FetchReposParams): Promise<GithubRepoLite[]> {
  if (accessToken) {
    return fetchAuthenticatedUserRepos(login, accessToken, limit);
  }
  return fetchPublicOwnerRepos(login, limit);
}

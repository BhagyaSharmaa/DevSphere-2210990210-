import { adminClient } from "@/sanity/lib/adminClient";
import { fetchGithubPublicRepos } from "./fetchPublicRepos";
import { fetchUserCodespaces, indexCodespacesByRepo } from "./fetchCodespaces";

type EnsureGithubAuthorProfileParams = {
  githubLogin: string;
  githubId?: number | string;
  name: string;
  avatarUrl?: string;
  accessToken?: string;
};

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

type GithubRepositoryItem = {
  _type: "githubRepository";
  name: string;
  fullName: string;
  url: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  updatedAt: string;
  ownerLogin?: string;
  affiliation?: "owner" | "collaborator" | "organization_member";
  codespaceUrl?: string;
};

/**
 * Re-syncs the author document on every sign-in so we pick up:
 *   - newly-owned repositories
 *   - repositories the user is now a collaborator on
 *   - the user's most recently-updated Codespace per repo
 *
 * This is intentionally not gated on "already synced" anymore — codespaces
 * and collaborator membership change frequently and the cost is one GitHub
 * call per login, which is fine.
 */
export async function ensureGithubAuthorProfile(
  params: EnsureGithubAuthorProfileParams
) {
  const {
    githubLogin,
    githubId,
    name,
    // avatarUrl is currently not stored in Sanity (your schema uses `image` type).
    accessToken,
  } = params;

  const authorId = `author-${githubLogin}`;

  const existing = await adminClient.fetch<{ _id: string } | null>(
    `*[_type == "author" && githubLogin == $login][0]{_id}`,
    { login: githubLogin }
  );

  const maxReposFromEnv = process.env.GITHUB_REPOS_SYNC_LIMIT;
  const limit = Math.max(
    1,
    Number.isFinite(Number(maxReposFromEnv))
      ? Number(maxReposFromEnv)
      : 50
  );

  // 1. Fetch repos (owner + collaborator + org_member when token is present).
  const repos = await fetchGithubPublicRepos({
    login: githubLogin,
    accessToken,
    limit,
  });

  // 2. Fetch the user's codespaces in parallel and index by repo full_name.
  //    Failures here are non-fatal — we still want repos to sync.
  let codespaceByRepo: Record<string, string> = {};
  if (accessToken) {
    try {
      const codespaces = await fetchUserCodespaces(accessToken);
      codespaceByRepo = indexCodespacesByRepo(codespaces);
    } catch (err) {
      console.warn("Codespaces fetch failed; continuing without them:", err);
    }
  }

  const nowIso = new Date().toISOString();

  const repoItems: GithubRepositoryItem[] = repos.map((r) => {
    const codespaceUrl = codespaceByRepo[r.full_name];
    return {
      _type: "githubRepository",
      name: r.name,
      fullName: r.full_name,
      url: r.html_url,
      description: r.description ?? "",
      language: r.language ?? "",
      stars: r.stargazers_count,
      forks: r.forks_count,
      updatedAt: r.updated_at,
      ownerLogin: r.owner_login,
      affiliation: r.affiliation,
      ...(codespaceUrl ? { codespaceUrl } : {}),
    };
  });

  const slugCurrent = toSlug(name || githubLogin) || githubLogin;

  type AuthorDoc = {
    _id: string;
    _type: "author";
    githubLogin: string;
    githubId?: string;
    name: string;
    slug: { _type: "slug"; current: string };
    bio: unknown[];
    reposSyncedAt: string;
    repositories: GithubRepositoryItem[];
  };

  const nextAuthorDoc: AuthorDoc = {
    _id: authorId,
    _type: "author",
    githubLogin,
    ...(githubId !== undefined ? { githubId: String(githubId) } : {}),
    name,
    slug: { _type: "slug", current: slugCurrent },
    bio: [],
    reposSyncedAt: nowIso,
    repositories: repoItems,
  };

  if (!existing?._id) {
    await adminClient.createIfNotExists(nextAuthorDoc);
    return;
  }

  await adminClient
    .patch(existing._id)
    .set({
      githubLogin,
      ...(githubId !== undefined ? { githubId: String(githubId) } : {}),
      name,
      slug: { _type: "slug", current: slugCurrent },
      repositories: repoItems,
      reposSyncedAt: nowIso,
    })
    .commit();
}

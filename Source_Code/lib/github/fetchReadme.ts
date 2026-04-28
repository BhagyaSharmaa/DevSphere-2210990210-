/**
 * Fetch and render a repo's README using GitHub's public REST API.
 *
 * The endpoint `GET /repos/{owner}/{repo}/readme` with
 * `Accept: application/vnd.github.html` returns the README as a rendered,
 * sanitized HTML string — perfect for `dangerouslySetInnerHTML` in a
 * `prose` container. No auth is required for public repos.
 */

export type ParsedRepo = { owner: string; repo: string };

export function parseGithubRepoUrl(url: string | null | undefined): ParsedRepo | null {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (!parsed.hostname.endsWith("github.com")) return null;

  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;

  const owner = segments[0];
  // Strip a trailing `.git` if it's there.
  const repo = segments[1].replace(/\.git$/i, "");
  if (!owner || !repo) return null;

  return { owner, repo };
}

export type ReadmeResult =
  | { ok: true; html: string; defaultBranch?: string }
  | { ok: false; status: number; reason: string };

export async function fetchRepoReadmeHtml(
  url: string | null | undefined,
  options?: { revalidate?: number }
): Promise<ReadmeResult> {
  const parsed = parseGithubRepoUrl(url);
  if (!parsed) {
    return { ok: false, status: 0, reason: "Not a github.com URL" };
  }

  const { owner, repo } = parsed;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
  const accessToken = process.env.GITHUB_TOKEN;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        Accept: "application/vnd.github.html",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      next: { revalidate: options?.revalidate ?? 300 },
    });

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        reason: `GitHub returned ${res.status}`,
      };
    }

    const html = await res.text();
    return { ok: true, html };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      reason: err instanceof Error ? err.message : "Unknown fetch error",
    };
  }
}

/**
 * Rewrite README HTML so relative image/link references resolve against the
 * source repository on GitHub, and external links open in a new tab.
 */
export function normalizeReadmeHtml(html: string, repo: ParsedRepo): string {
  const rawBase = `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/HEAD/`;
  const blobBase = `https://github.com/${repo.owner}/${repo.repo}/blob/HEAD/`;

  return html
    // Make all <img> with relative src absolute against raw.githubusercontent.com
    .replace(/<img\s+([^>]*?)src="(?!https?:|data:|\/\/)([^"]+)"/gi, (_m, attrs, src) => {
      const cleaned = src.startsWith("/") ? src.slice(1) : src;
      return `<img ${attrs}src="${rawBase}${cleaned}"`;
    })
    // Make relative links absolute against github.com/owner/repo/blob/HEAD/
    .replace(/<a\s+([^>]*?)href="(?!https?:|mailto:|#|\/\/)([^"]+)"/gi, (_m, attrs, href) => {
      const cleaned = href.startsWith("/") ? href.slice(1) : href;
      return `<a ${attrs}href="${blobBase}${cleaned}" target="_blank" rel="noreferrer"`;
    })
    // Force external links to open in a new tab
    .replace(/<a\s+([^>]*?)href="(https?:[^"]+)"(?![^>]*target=)/gi, (_m, attrs, href) => {
      return `<a ${attrs}href="${href}" target="_blank" rel="noreferrer"`;
    });
}

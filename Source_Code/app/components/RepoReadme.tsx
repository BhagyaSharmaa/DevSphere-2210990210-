import {
  fetchRepoReadmeHtml,
  normalizeReadmeHtml,
  parseGithubRepoUrl,
} from "@/lib/github/fetchReadme";
import { AlertCircle, Github } from "lucide-react";

type Props = {
  repoUrl?: string | null;
};

/**
 * Server component that renders a repository's README inline.
 * Uses GitHub's public REST API only — no auth required for public repos.
 */
export default async function RepoReadme({ repoUrl }: Props) {
  const parsed = parseGithubRepoUrl(repoUrl);

  if (!parsed) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="w-4 h-4" />
          No GitHub repository linked
        </div>
        <p className="text-sm mt-1">
          Add a GitHub repo URL to this post to see its README rendered here.
        </p>
      </div>
    );
  }

  const result = await fetchRepoReadmeHtml(repoUrl);

  if (!result.ok) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="w-4 h-4" />
          Couldn&apos;t load README
        </div>
        <p className="text-sm mt-1">
          {result.status === 404
            ? "This repository doesn't have a README, or it isn't public."
            : `GitHub responded with status ${result.status || "—"}.`}
        </p>
        <a
          href={`https://github.com/${parsed.owner}/${parsed.repo}`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium underline"
        >
          <Github className="w-4 h-4" />
          View on GitHub
        </a>
      </div>
    );
  }

  const html = normalizeReadmeHtml(result.html, parsed);

  return (
    <article
      className="prose prose-indigo max-w-none prose-headings:scroll-mt-24 prose-img:rounded-lg prose-pre:bg-gray-900"
      // GitHub returns sanitized HTML, so this is safe.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

import Link from "next/link";
import Image from "next/image";
import { Github, ExternalLink, Eye } from "lucide-react";

import { formatDate } from "@/lib/utils";
import RepoReadme from "./RepoReadme";
import VercelPreview from "./VercelPreview";
import PostActions from "./PostActions";

export type PostDetailData = {
  _id: string | number;
  _createdAt: string | Date;
  title: string;
  description: string;
  category: string;
  views?: number;
  image?: string;
  projectLink?: string | null;
  repoUrl?: string | null;
  liveUrl?: string | null;
  author?: {
    _id?: string | number;
    name?: string;
    githubLogin?: string;
    image?: string;
  } | null;
};

type Props = {
  post: PostDetailData;
  /** GitHub login of the currently signed-in viewer, or null if signed-out */
  currentGithubLogin?: string | null;
};

function pickRepoUrl(post: PostDetailData): string | null {
  if (post.repoUrl) return post.repoUrl;
  // Fall back to the legacy projectLink if it looks like a GitHub URL.
  const legacy = post.projectLink ?? "";
  try {
    const u = new URL(legacy);
    if (u.hostname.endsWith("github.com")) return legacy;
  } catch {
    /* ignore */
  }
  return null;
}

function pickLiveUrl(post: PostDetailData): string | null {
  if (post.liveUrl) return post.liveUrl;
  const legacy = post.projectLink ?? "";
  try {
    const u = new URL(legacy);
    if (!u.hostname.endsWith("github.com")) return legacy;
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Reusable post detail layout.
 * - Header: title, author, category, dates
 * - Optional live preview iframe (when liveUrl is set)
 * - Body: rendered README from the linked GitHub repo
 */
export default function PostDetail({ post, currentGithubLogin = null }: Props) {
  const repoUrl = pickRepoUrl(post);
  const liveUrl = pickLiveUrl(post);

  const author = post.author ?? {};
  const avatarUrl = author.githubLogin
    ? `https://avatars.githubusercontent.com/${author.githubLogin}?s=96`
    : author.image ?? "https://placehold.co/48x48";

  return (
    <article className="max-w-4xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-400">
          &larr; Back to all posts
        </Link>
      </div>

      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link
            href={`/?query=${encodeURIComponent(post.category.toLowerCase())}`}
            className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200 transition-colors"
          >
            {post.category}
          </Link>
          <span>&middot;</span>
          <span>{formatDate(post._createdAt)}</span>
          <span>&middot;</span>
          <span className="inline-flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {post.views ?? 0}
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
          {post.title}
        </h1>

        <p className="text-lg text-gray-300 max-w-3xl">{post.description}</p>

        {/* Author + links row */}
        <div className="flex flex-wrap items-center gap-4 mt-2">
          <Link
            href={`/user/${author.githubLogin ?? author._id ?? ""}`}
            className="inline-flex items-center gap-3 group"
          >
            <Image
              src={avatarUrl}
              alt={author.name ?? "author"}
              width={40}
              height={40}
              className="rounded-full border-2 border-gray-200"
            />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                {author.name ?? "Unknown"}
              </p>
              {author.githubLogin && (
                <p className="text-xs text-gray-400">@{author.githubLogin}</p>
              )}
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {repoUrl && (
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors border border-white/20"
              >
                <Github className="w-4 h-4" />
                Repo
              </a>
            )}
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Live
              </a>
            )}
          </div>
        </div>

        {/* Share / edit / delete actions */}
        <div className="mt-2">
          <PostActions
            postId={String(post._id)}
            postTitle={post.title}
            postDescription={post.description}
            authorGithubLogin={author.githubLogin ?? null}
            currentGithubLogin={currentGithubLogin ?? null}
          />
        </div>
      </header>

      {/* Live preview */}
      {liveUrl && (
        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Live preview
          </h2>
          <VercelPreview url={liveUrl} />
        </section>
      )}

      {/* README body */}
      <section className="mt-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          README
        </h2>
        <div className="rounded-2xl border-[3px] border-black bg-white p-6 sm:p-10 text-black">
          <RepoReadme repoUrl={repoUrl} />
        </div>
      </section>
    </article>
  );
}

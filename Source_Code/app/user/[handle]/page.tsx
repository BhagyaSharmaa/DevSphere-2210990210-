import Link from "next/link";
import Image from "next/image";

import Navbar from "../../components/navbar";
import PostCard from "../../components/PostCard";
import { client } from "@/sanity/lib/client";
import {
  AUTHOR_BY_HANDLE_QUERY,
  POSTS_BY_AUTHOR_QUERY,
} from "@/lib/sanity/queries";

type RouteParams = { handle: string };

type Author = {
  _id: string;
  name?: string;
  githubLogin?: string;
  image?: { asset?: unknown };
  bio?: unknown[];
  reposSyncedAt?: string;
  repoCount?: number;
};

type AuthoredPost = {
  _id: string;
  _createdAt: string;
  title: string;
  description: string;
  category: string;
  image: string;
  views: number;
  projectLink?: string;
  repoUrl?: string;
  liveUrl?: string;
  author: { _id: string; name: string; githubLogin?: string; image?: string };
};

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { handle } = await params;
  return {
    title: `@${handle} - DevSphere`,
  };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { handle } = await params;

  const author = await client
    .fetch<Author | null>(
      AUTHOR_BY_HANDLE_QUERY,
      { handle },
      { next: { revalidate: 60 } }
    )
    .catch(() => null);

  if (!author) {
    return (
      <main className="font-work-sans min-h-screen">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-bold text-white">User not found</h1>
          <p className="text-gray-400 mt-2">
            We couldn&apos;t find a profile for{" "}
            <span className="font-semibold">@{handle}</span>.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 px-5 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Back to all posts
          </Link>
        </div>
      </main>
    );
  }

  const posts = await client
    .fetch<AuthoredPost[]>(
      POSTS_BY_AUTHOR_QUERY,
      { authorId: author._id },
      { next: { revalidate: 30 } }
    )
    .catch(() => [] as AuthoredPost[]);

  const avatarUrl = author.githubLogin
    ? `https://avatars.githubusercontent.com/${author.githubLogin}?s=200`
    : "https://placehold.co/200x200";

  return (
    <main className="font-work-sans min-h-screen">
      <Navbar />

      <section className="max-w-5xl mx-auto px-6 py-10">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-white rounded-2xl border-[3px] border-black p-6 sm:p-8 text-black">
          <Image
            src={avatarUrl}
            alt={author.name ?? "user"}
            width={96}
            height={96}
            className="rounded-full border-2 border-gray-200 shrink-0"
            unoptimized
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-extrabold tracking-tight">
              {author.name ?? "Unknown"}
            </h1>
            {author.githubLogin && (
              <a
                href={`https://github.com/${author.githubLogin}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-sm text-indigo-600 hover:text-indigo-800 mt-1"
              >
                @{author.githubLogin}
              </a>
            )}
            <p className="text-sm text-gray-500 mt-3">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
              {typeof author.repoCount === "number"
                ? ` - ${author.repoCount} synced repos`
                : ""}
            </p>
          </div>
        </div>

        {/* Posts grid */}
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-10 mb-3">
          Posts by {author.name ?? handle}
        </h2>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-white/20 bg-white/5 p-8 text-center text-gray-300">
            No posts yet from this user.
          </div>
        ) : (
          <ul className="grid md:grid-cols-3 sm:grid-cols-2 gap-5">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

import Link from "next/link";

import Navbar from "../../components/navbar";
import PostDetail, { PostDetailData } from "../../components/PostDetail";
import { client } from "@/sanity/lib/client";
import { POST_BY_ID_QUERY } from "@/lib/sanity/queries";
import { auth } from "@/auth";

type RouteParams = { id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { id } = await params;
  const post = await client
    .fetch<PostDetailData | null>(
      POST_BY_ID_QUERY,
      { id },
      { next: { revalidate: 60 } }
    )
    .catch(() => null);

  if (!post) {
    return { title: "Post not found - DevSphere" };
  }
  return {
    title: `${post.title} - DevSphere`,
    description: post.description,
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { id } = await params;

  let post: PostDetailData | null = null;
  try {
    post = await client.fetch<PostDetailData | null>(
      POST_BY_ID_QUERY,
      { id },
      { next: { revalidate: 60 } }
    );
  } catch (err) {
    console.error("Failed to load post", err);
  }

  const session = await auth().catch(() => null);
  const currentGithubLogin = session?.user?.githubLogin ?? null;

  if (!post) {
    return (
      <main className="font-work-sans min-h-screen">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-bold text-white">Post not found</h1>
          <p className="text-gray-400 mt-2">
            The post you&apos;re looking for doesn&apos;t exist or was removed.
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

  return (
    <main className="font-work-sans min-h-screen">
      <Navbar />
      <PostDetail post={post} currentGithubLogin={currentGithubLogin} />
    </main>
  );
}

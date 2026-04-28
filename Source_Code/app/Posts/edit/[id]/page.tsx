import { redirect, notFound } from "next/navigation";

import Navbar from "../../../components/navbar";
import EditPostForm, { EditPostInitial } from "./EditPostForm";
import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { POST_BY_ID_QUERY } from "@/lib/sanity/queries";
import { getGithubAuthorRepositories } from "@/lib/sanity/getGithubAuthorRepositories";
import { updatePostAction } from "../../create/actions";

type RouteParams = { id: string };

type PostDoc = {
  _id: string;
  title?: string;
  description?: string;
  category?: string;
  repoUrl?: string;
  liveUrl?: string;
  projectLink?: string;
  author?: { githubLogin?: string };
};

export default async function EditPostPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { id } = await params;

  const session = await auth();
  const githubLogin = session?.user?.githubLogin;
  if (!githubLogin) redirect("/");

  const post = await client
    .fetch<PostDoc | null>(POST_BY_ID_QUERY, { id }, { next: { revalidate: 0 } })
    .catch(() => null);

  if (!post) notFound();

  if (post.author?.githubLogin !== githubLogin) {
    // Not the owner - bounce to the post page.
    redirect(`/post/${id}`);
  }

  const repos = await getGithubAuthorRepositories(githubLogin).catch(() => []);

  // Pre-fill liveUrl using legacy projectLink if it isn't a github URL.
  let initialLive = post.liveUrl ?? "";
  if (!initialLive && post.projectLink) {
    try {
      const u = new URL(post.projectLink);
      if (!u.hostname.endsWith("github.com")) initialLive = post.projectLink;
    } catch {
      /* ignore */
    }
  }

  // Pre-fill repoUrl using legacy projectLink if it IS a github URL.
  let initialRepo = post.repoUrl ?? "";
  if (!initialRepo && post.projectLink) {
    try {
      const u = new URL(post.projectLink);
      if (u.hostname.endsWith("github.com")) initialRepo = post.projectLink;
    } catch {
      /* ignore */
    }
  }

  const initial: EditPostInitial = {
    id: post._id,
    title: post.title ?? "",
    description: post.description ?? "",
    category: post.category ?? "Projects",
    repoUrl: initialRepo,
    liveUrl: initialLive,
  };

  return (
    <main className="font-work-sans min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <EditPostForm
          initial={initial}
          repos={repos}
          updatePost={updatePostAction}
        />
      </div>
    </main>
  );
}

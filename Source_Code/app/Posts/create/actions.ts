"use server";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { adminClient } from "@/sanity/lib/adminClient";
import { client } from "@/sanity/lib/client";
import { POST_OWNER_QUERY } from "@/lib/sanity/queries";

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function ensureValidUrl(value: string, label: string) {
  try {
    new URL(value);
  } catch {
    throw new Error(`Invalid ${label} URL: ${value}`);
  }
}

async function getCurrentGithubLogin() {
  const session = await auth();
  const githubLogin = session?.user?.githubLogin;
  if (!githubLogin) throw new Error("Not authenticated");
  return githubLogin;
}

async function assertOwnsPost(postId: string, githubLogin: string) {
  const owner = await client.fetch<{ githubLogin?: string } | null>(
    POST_OWNER_QUERY,
    { id: postId },
    { next: { revalidate: 0 } }
  );
  if (!owner?.githubLogin) {
    throw new Error("Post not found");
  }
  if (owner.githubLogin !== githubLogin) {
    throw new Error("You do not own this post");
  }
}

export async function createPostAction(formData: FormData) {
  const githubLogin = await getCurrentGithubLogin();

  const title = (formData.get("title")?.toString() ?? "").trim();
  const description = (formData.get("description")?.toString() ?? "").trim();
  const repoUrl = (formData.get("repoUrl")?.toString() ?? "").trim();
  const liveUrl = (formData.get("liveUrl")?.toString() ?? "").trim();
  const category =
    (formData.get("category")?.toString() ?? "Projects").trim().slice(0, 20) ||
    "Projects";

  if (!title || !description || !repoUrl) {
    throw new Error("Missing required fields");
  }

  ensureValidUrl(repoUrl, "repository");
  if (liveUrl) ensureValidUrl(liveUrl, "live");

  const authorId = `author-${githubLogin}`;
  const slugCurrent = toSlug(title) || githubLogin;

  const placeholderImage = `https://placehold.co/1200x630/6366f1/ffffff/png?text=${encodeURIComponent(
    title.slice(0, 40)
  )}`;

  type PostDoc = {
    _type: "posts";
    title: string;
    slug: { _type: "slug"; current: string };
    author: { _type: "reference"; _ref: string };
    views: number;
    description: string;
    category: string;
    image: string;
    projectLink: string;
    repoUrl: string;
    liveUrl?: string;
  };

  const nextPostDoc: PostDoc = {
    _type: "posts",
    title,
    slug: { _type: "slug", current: slugCurrent },
    author: { _type: "reference", _ref: authorId },
    views: 0,
    description,
    category,
    image: placeholderImage,
    projectLink: liveUrl || repoUrl,
    repoUrl,
    ...(liveUrl ? { liveUrl } : {}),
  };

  await adminClient.create(nextPostDoc);

  redirect("/");
}

export async function updatePostAction(formData: FormData) {
  const githubLogin = await getCurrentGithubLogin();

  const id = (formData.get("id")?.toString() ?? "").trim();
  if (!id) throw new Error("Missing post id");

  await assertOwnsPost(id, githubLogin);

  const title = (formData.get("title")?.toString() ?? "").trim();
  const description = (formData.get("description")?.toString() ?? "").trim();
  const repoUrl = (formData.get("repoUrl")?.toString() ?? "").trim();
  const liveUrl = (formData.get("liveUrl")?.toString() ?? "").trim();
  const category =
    (formData.get("category")?.toString() ?? "Projects").trim().slice(0, 20) ||
    "Projects";

  if (!title || !description || !repoUrl) {
    throw new Error("Missing required fields");
  }

  ensureValidUrl(repoUrl, "repository");
  if (liveUrl) ensureValidUrl(liveUrl, "live");

  const patch = adminClient
    .patch(id)
    .set({
      title,
      description,
      category,
      repoUrl,
      // keep legacy projectLink in sync so existing UI keeps working
      projectLink: liveUrl || repoUrl,
      ...(liveUrl ? { liveUrl } : { liveUrl: undefined }),
    });

  // unset liveUrl explicitly if user cleared it
  if (!liveUrl) {
    patch.unset(["liveUrl"]);
  }

  await patch.commit();

  redirect(`/post/${id}`);
}

export async function deletePostAction(formData: FormData) {
  const githubLogin = await getCurrentGithubLogin();

  const id = (formData.get("id")?.toString() ?? "").trim();
  if (!id) throw new Error("Missing post id");

  await assertOwnsPost(id, githubLogin);

  await adminClient.delete(id);

  redirect("/");
}

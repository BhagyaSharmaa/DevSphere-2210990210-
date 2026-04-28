import React from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getGithubAuthorRepositories } from "@/lib/sanity/getGithubAuthorRepositories";

import NewPostForm from "./NewPostForm";
import { createPostAction } from "./actions";

export default async function CreatePostPage() {
  const session = await auth();
  if (!session?.user?.githubLogin) redirect("/");

  const repos = await getGithubAuthorRepositories(session.user.githubLogin);

  return <NewPostForm repos={repos} createPost={createPostAction} />;
}


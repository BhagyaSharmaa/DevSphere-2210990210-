import PostCard from "../components/PostCard";
import SearchForm from "../components/SearchForm";
import Link from "next/link";
import { auth } from "@/auth";
import { getGithubAuthorRepositories } from "@/lib/sanity/getGithubAuthorRepositories";
import NewPostForm from "../Posts/create/NewPostForm";
import { createPostAction } from "../Posts/create/actions";
import { client } from "@/sanity/lib/client";
import { POSTS_QUERY } from "@/lib/sanity/queries";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; createPost?: string }>;
}) {
  const params = await searchParams;
  const query = params.query?.trim() ?? "";
  const createPost = params.createPost === "1";

  const session = createPost ? await auth() : null;
  const repos =
    createPost && session?.user?.githubLogin
      ? await getGithubAuthorRepositories(session.user.githubLogin).catch(() => [])
      : [];

  const searchTerm = query ? `*${query}*` : "";

  const posts = await client.fetch(
    POSTS_QUERY,
    { search: searchTerm },
    { next: { revalidate: 30 } }
  );

  return (
    <>
      <section className="w-full bg-primary min-h-[530px] pattern flex justify-center items-center flex-col py-10 px-6 bg-indigo-800">
        <h1 className="uppercase bg-black px-6 py-3 font-worksans font-extrabold text-white sm:text-[54px] sm:leading-[64px] text-[36px] leading-[46px] max-w-5xl text-center">
          Create-Connect-Grow <br />
          <p className="text-7xl bg-amber-600">Together</p>
        </h1>
        <p className="font-medium text-[20px] text-white max-w-3xl text-center break-words">
          Submit your projects, Connect with each other, UpSkill Yourself
        </p>
        <SearchForm query={query} />
      </section>

      <section className="px-6 py-10 max-w-7xl mx-auto">
        <p className="text-30-semibold text-3xl">
          {query ? `Search results for "${query}"` : "All Posts"}
        </p>
        <ul className="mt-7 grid md:grid-cols-3 sm:grid-cols-2 gap-5">
          {posts.length > 0 ? (
            posts.map((post: {
              _id: string;
              _createdAt: string;
              title: string;
              description: string;
              category: string;
              image: string;
              projectLink?: string;
              repoUrl?: string;
              liveUrl?: string;
              views: number;
              author: { _id: string; name: string; githubLogin?: string; image?: string };
            }) => <PostCard key={post._id} post={post} />)
          ) : (
            <li className="text-black-100 text-sm font-normal col-span-full">
              {query
                ? `No posts found for "${query}". Try a different search term.`
                : "No posts yet. Be the first to create one!"}
            </li>
          )}
        </ul>
      </section>

      {createPost ? (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <div className="relative z-[101] w-full max-w-lg mx-auto my-10 px-4">
            <div className="flex justify-end mb-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white/90 hover:bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-md transition-all hover:shadow-lg"
              >
                <span>X</span>
                <span>Close</span>
              </Link>
            </div>

            {session?.user?.githubLogin ? (
              <NewPostForm repos={repos} createPost={createPostAction} />
            ) : (
              <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                <p className="text-lg font-bold text-gray-800">
                  Please log in to create a post.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Sign in with GitHub to share your projects.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

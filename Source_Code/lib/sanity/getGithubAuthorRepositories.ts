import { client } from "@/sanity/lib/client";

export type GithubRepository = {
  name: string;
  fullName: string;
  url: string;
  description?: string;
  language?: string;
  stars?: number;
  forks?: number;
  updatedAt?: string;
};

export async function getGithubAuthorRepositories(
  githubLogin: string
): Promise<GithubRepository[]> {
  const result = await client.fetch<{
    repositories?: GithubRepository[];
  }>(
    `*[_type == "author" && githubLogin == $login][0]{
      repositories[]{name, fullName, url, description, language, stars, forks, updatedAt}
    }`,
    { login: githubLogin }
  );

  return result?.repositories ?? [];
}


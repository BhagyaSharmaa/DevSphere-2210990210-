import { groq } from "next-sanity";

/**
 * Fetch all posts, or filter by a search term across title, description, and category.
 *
 * Pass $search as an empty string ("") to get all posts.
 * Pass a wildcard pattern like "*react*" to filter.
 */
export const POSTS_QUERY = groq`
  *[
    _type == "posts"
    && defined(slug.current)
    && (
      $search == ""
      || title match $search
      || description match $search
      || category match $search
    )
  ] | order(_createdAt desc) {
    _id,
    _createdAt,
    title,
    description,
    category,
    image,
    projectLink,
    repoUrl,
    liveUrl,
    views,
    "slug": slug.current,
    author-> {
      _id,
      name,
      githubLogin,
      image
    }
  }
`;

/**
 * Fetch a single post by its slug.
 */
export const POST_BY_SLUG_QUERY = groq`
  *[_type == "posts" && slug.current == $slug][0] {
    _id,
    _createdAt,
    title,
    description,
    category,
    image,
    projectLink,
    repoUrl,
    liveUrl,
    body,
    views,
    "slug": slug.current,
    author-> {
      _id,
      name,
      githubLogin,
      image
    }
  }
`;

/**
 * Fetch a single post by its Sanity _id.
 */
export const POST_BY_ID_QUERY = groq`
  *[_type == "posts" && _id == $id][0] {
    _id,
    _createdAt,
    title,
    description,
    category,
    image,
    projectLink,
    repoUrl,
    liveUrl,
    body,
    views,
    "slug": slug.current,
    author-> {
      _id,
      name,
      githubLogin,
      image
    }
  }
`;

/**
 * Lightweight ownership query — fetches just the author's githubLogin so we
 * can verify the current session can mutate the post.
 */
export const POST_OWNER_QUERY = groq`
  *[_type == "posts" && _id == $id][0]{
    "githubLogin": author->githubLogin
  }
`;

/**
 * Look up an author by their GitHub login OR their Sanity _id.
 * Used for the /user/[handle] profile page so both kinds of links work.
 */
export const AUTHOR_BY_HANDLE_QUERY = groq`
  *[_type == "author" && (githubLogin == $handle || _id == $handle)][0]{
    _id,
    name,
    githubLogin,
    image,
    bio,
    reposSyncedAt,
    "repoCount": count(repositories)
  }
`;

/**
 * All posts by a given author (referenced by author._id).
 */
export const POSTS_BY_AUTHOR_QUERY = groq`
  *[_type == "posts" && author._ref == $authorId] | order(_createdAt desc) {
    _id,
    _createdAt,
    title,
    description,
    category,
    image,
    projectLink,
    repoUrl,
    liveUrl,
    views,
    "slug": slug.current,
    author-> {
      _id,
      name,
      githubLogin,
      image
    }
  }
`;

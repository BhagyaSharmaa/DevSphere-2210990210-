import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink } from "lucide-react";

type PostTypeCard = {
  _createdAt: string | Date;
  views: number;
  author: {
    id?: string;
    _id?: string | number;
    name?: string;
    githubLogin?: string;
    image?: string;
  };
  title: string;
  category: string;
  _id: string | number;
  image: string;
  description: string;
  projectLink?: string | null;
  liveUrl?: string | null;
  repoUrl?: string | null;
};

const PostCard = ({ post }: { post: PostTypeCard }) => {
  const {
    _createdAt,
    views,
    author: { id: authorId, _id: authorIdAlt, name, githubLogin, image: authorImage },
    title,
    category,
    _id,
    image,
    description,
    projectLink,
    liveUrl,
    repoUrl,
  } = post;

  const resolvedAuthorId = authorId ?? authorIdAlt;
  const externalLink = liveUrl ?? repoUrl ?? projectLink ?? null;

  const avatarUrl = githubLogin
    ? `https://avatars.githubusercontent.com/${githubLogin}?s=96`
    : authorImage ?? "https://placehold.co/48x48";

  return (
    <li className="bg-white border-[5px] border-black py-6 px-5 rounded-[22px] shadow-200 hover:border-indigo-500 transition-all duration-300 hover:shadow-lg group text-black flex flex-col">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500 font-medium">{formatDate(_createdAt)}</p>
        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <Eye className="w-4 h-4" />
          <span>{views ?? 0}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 gap-4">
        <div className="flex-1 min-w-0">
          <Link href={`/user/${resolvedAuthorId}`}>
            <p className="text-sm text-gray-600 font-medium line-clamp-1 hover:text-indigo-600 transition-colors">
              {name ?? "Unknown"}
            </p>
          </Link>
          <Link href={`/post/${_id}`}>
            <h3 className="text-lg font-bold line-clamp-1 mt-0.5 hover:text-indigo-600 transition-colors">
              {title}
            </h3>
          </Link>
        </div>
        <Link href={`/user/${resolvedAuthorId}`} className="shrink-0">
          <Image
            src={avatarUrl}
            alt={name ?? "author"}
            width={48}
            height={48}
            className="rounded-full border-2 border-gray-200 object-cover"
          />
        </Link>
      </div>

      <Link href={`/post/${_id}`} className="block mt-4 flex-1">
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{description}</p>
        <div className="relative w-full h-[164px] rounded-xl overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
            unoptimized
          />
        </div>
      </Link>

      {externalLink ? (
        <a
          href={externalLink}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 mt-4 text-sm text-indigo-600 hover:text-indigo-800 transition-colors font-medium truncate"
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{externalLink}</span>
        </a>
      ) : null}

      <div className="flex justify-between items-center gap-3 mt-4">
        <Link href={`/?query=${encodeURIComponent(category.toLowerCase())}`}>
          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors">
            {category}
          </span>
        </Link>
        <Button
          className="rounded-full bg-black text-white text-sm font-medium px-5 py-2 hover:bg-indigo-700 transition-colors"
          asChild
        >
          <Link href={`/post/${_id}`}>Details</Link>
        </Button>
      </div>
    </li>
  );
};

export default PostCard;

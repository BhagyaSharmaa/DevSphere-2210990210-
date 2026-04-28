"use client";

import React, { useMemo, useState } from "react";
import { Github, Link2, FileText, Type, ExternalLink, Save } from "lucide-react";

type GithubRepository = {
  name: string;
  fullName: string;
  url: string;
  description?: string;
  language?: string;
};

export type EditPostInitial = {
  id: string;
  title: string;
  description: string;
  category: string;
  repoUrl: string;
  liveUrl: string;
};

type Props = {
  initial: EditPostInitial;
  repos: GithubRepository[];
  updatePost: (formData: FormData) => Promise<void>;
};

export default function EditPostForm({ initial, repos, updatePost }: Props) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [category, setCategory] = useState(initial.category);
  const [repoUrl, setRepoUrl] = useState(initial.repoUrl);
  const [liveUrl, setLiveUrl] = useState(initial.liveUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRepo = useMemo(() => {
    const url = repoUrl.trim();
    if (!url) return null;
    return repos.find((r) => r.url === url) ?? null;
  }, [repoUrl, repos]);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await updatePost(formData);
    } finally {
      setIsSubmitting(false);
    }
  }

  // If the saved repoUrl isn't in the list (older post), prepend it as an option.
  const repoOptions = useMemo(() => {
    if (!repoUrl) return repos;
    if (repos.some((r) => r.url === repoUrl)) return repos;
    return [
      { name: repoUrl, fullName: repoUrl, url: repoUrl } as GithubRepository,
      ...repos,
    ];
  }, [repos, repoUrl]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Save className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Edit Post</h2>
              <p className="text-indigo-200 text-sm">
                Update your project details
              </p>
            </div>
          </div>
        </div>

        <form action={handleSubmit} className="px-8 py-7 space-y-5">
          <input type="hidden" name="id" value={initial.id} />

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Type className="w-4 h-4 text-indigo-500" />
              Title
            </label>
            <input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FileText className="w-4 h-4 text-indigo-500" />
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all text-sm resize-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-4 h-4 text-indigo-500 text-xs font-bold">#</span>
              Category
            </label>
            <input
              name="category"
              maxLength={20}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Github className="w-4 h-4 text-indigo-500" />
              GitHub Repository
              <span className="text-red-500">*</span>
            </label>
            {repoOptions.length > 0 ? (
              <select
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all text-sm cursor-pointer"
                required
              >
                <option value="" disabled>
                  Select a repository&hellip;
                </option>
                {repoOptions.map((r) => (
                  <option key={r.url} value={r.url}>
                    {r.fullName}
                    {r.language ? ` - ${r.language}` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all text-sm"
                required
              />
            )}
            <input type="hidden" name="repoUrl" value={repoUrl} />
            {selectedRepo && (
              <div className="flex items-center justify-between px-4 py-3 mt-2 rounded-xl bg-indigo-50 border border-indigo-200">
                <div className="flex items-center gap-2 min-w-0">
                  <Github className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="text-sm font-medium text-indigo-800 truncate">
                    {selectedRepo.fullName}
                  </span>
                </div>
                <a
                  href={selectedRepo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-3 shrink-0 text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Link2 className="w-4 h-4 text-indigo-500" />
              Live URL <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              name="liveUrl"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://your-app.vercel.app"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm tracking-wide shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useMemo, useState } from "react";
import { Github, Link2, FileText, Type, ExternalLink } from "lucide-react";

type GithubRepository = {
  name: string;
  fullName: string;
  url: string;
  description?: string;
  language?: string;
};

type NewPostFormProps = {
  repos: GithubRepository[];
  createPost: (formData: FormData) => Promise<void>;
};

export default function NewPostForm({ repos, createPost }: NewPostFormProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRepo = useMemo(() => {
    const url = repoUrl.trim();
    if (!url) return null;
    return repos.find((r) => r.url === url) ?? null;
  }, [repoUrl, repos]);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await createPost(formData);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Header band */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create a Post</h2>
              <p className="text-indigo-200 text-sm">
                Share your project with the community
              </p>
            </div>
          </div>
        </div>

        {/* Form body */}
        <form action={handleSubmit} className="px-8 py-7 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Type className="w-4 h-4 text-indigo-500" />
              Title
            </label>
            <input
              name="title"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all text-sm"
              placeholder="e.g. My Awesome Project"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FileText className="w-4 h-4 text-indigo-500" />
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all text-sm resize-none"
              placeholder="A short description of your project…"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-4 h-4 text-indigo-500 text-xs font-bold">#</span>
              Category
            </label>
            <input
              name="category"
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all text-sm"
              placeholder="e.g. Web App, AI, Mobile, Open Source"
            />
            <p className="text-xs text-gray-400">
              Max 20 characters. Defaults to &quot;Projects&quot;.
            </p>
          </div>

          {/* Repo picker */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Github className="w-4 h-4 text-indigo-500" />
              GitHub Repository
              <span className="text-red-500">*</span>
            </label>
            {repos.length > 0 ? (
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all text-sm cursor-pointer"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select a repository…
                </option>
                {repos.map((r) => (
                  <option key={r.url} value={r.url}>
                    {r.fullName}
                    {r.language ? ` · ${r.language}` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name="repoUrlFallback"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all text-sm"
                required
              />
            )}
            <input type="hidden" name="repoUrl" value={repoUrl} />
            {selectedRepo ? (
              <div className="flex items-center justify-between px-4 py-3 mt-2 rounded-xl bg-indigo-50 border border-indigo-200">
                <div className="flex items-center gap-2 min-w-0">
                  <Github className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="text-sm font-medium text-indigo-800 truncate">
                    {selectedRepo.fullName}
                  </span>
                  {selectedRepo.language && (
                    <span className="text-xs text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded-full shrink-0">
                      {selectedRepo.language}
                    </span>
                  )}
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
            ) : null}
            <p className="text-xs text-gray-400">
              The README from this repo becomes the post content.
            </p>
          </div>

          {/* Live / Vercel URL */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Link2 className="w-4 h-4 text-indigo-500" />
              Live URL <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              name="liveUrl"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all text-sm"
              placeholder="https://your-app.vercel.app"
            />
            <p className="text-xs text-gray-400">
              If you provide a deployed URL, the post page shows a live preview iframe.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm tracking-wide shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                  />
                </svg>
                Publishing…
              </>
            ) : (
              "Publish Post"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

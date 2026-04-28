"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Share2, Check, Loader2 } from "lucide-react";

import { deletePostAction } from "../Posts/create/actions";

type Props = {
  postId: string;
  postTitle: string;
  postDescription?: string;
  /** GitHub login of the post's author */
  authorGithubLogin?: string | null;
  /** GitHub login of the currently signed-in viewer (or null) */
  currentGithubLogin?: string | null;
};

/**
 * Action bar shown on a post detail page.
 * - Share: always shown
 * - Edit / Delete: only shown when the viewer owns the post
 */
export default function PostActions({
  postId,
  postTitle,
  postDescription,
  authorGithubLogin,
  currentGithubLogin,
}: Props) {
  const isOwner =
    !!currentGithubLogin &&
    !!authorGithubLogin &&
    currentGithubLogin === authorGithubLogin;

  const [shared, setShared] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleShare() {
    const url =
      typeof window !== "undefined" ? window.location.href : `/post/${postId}`;

    // Prefer the native share sheet on mobile, fall back to clipboard.
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share({
          title: postTitle,
          text: postDescription ?? postTitle,
          url,
        });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      window.setTimeout(() => setShared(false), 2000);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/20 transition-colors"
      >
        {shared ? (
          <>
            <Check className="w-4 h-4" />
            Copied
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            Share
          </>
        )}
      </button>

      {isOwner && (
        <>
          <Link
            href={`/Posts/edit/${postId}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Link>

          <form
            action={async (formData: FormData) => {
              setDeleting(true);
              try {
                await deletePostAction(formData);
              } finally {
                setDeleting(false);
                setConfirming(false);
              }
            }}
            onSubmit={(e) => {
              if (!confirming) {
                e.preventDefault();
                setConfirming(true);
                window.setTimeout(() => setConfirming(false), 4000);
              }
            }}
          >
            <input type="hidden" name="id" value={postId} />
            <button
              type="submit"
              disabled={deleting}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-60 ${
                confirming
                  ? "bg-rose-700 hover:bg-rose-800 text-white"
                  : "bg-rose-600/90 hover:bg-rose-700 text-white"
              }`}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting…
                </>
              ) : confirming ? (
                <>
                  <Trash2 className="w-4 h-4" />
                  Click again to confirm
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

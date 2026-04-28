"use client";

import React, { useEffect, useRef, useState } from "react";
import { ExternalLink, Globe, Loader2, AlertTriangle } from "lucide-react";

type Props = {
  url: string;
  /** Optional human label, e.g. "my-app.vercel.app" */
  label?: string;
};

/**
 * Live preview of a deployed app rendered as a sandboxed iframe.
 *
 * We intentionally only use what's allowed by the public web — pointing an
 * iframe at the deployed URL — because Vercel doesn't expose a public
 * screenshot or preview-image API for arbitrary deployments (the screenshot
 * APIs that exist on vercel.com require authentication / project ownership).
 *
 * If the target sets `X-Frame-Options: DENY` or a restrictive CSP
 * `frame-ancestors`, the iframe load event won't fire — we time out and show
 * a friendly fallback link.
 */
export default function VercelPreview({ url, label }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [status, setStatus] = useState<"loading" | "loaded" | "blocked">(
    "loading"
  );

  let host = label;
  if (!host) {
    try {
      host = new URL(url).host;
    } catch {
      host = url;
    }
  }

  useEffect(() => {
    setStatus("loading");
    // If we don't get a `load` event within ~6s, assume the target blocked the
    // frame (most CSP/X-Frame-Options blocks fail silently).
    const timeoutId = window.setTimeout(() => {
      setStatus((prev) => (prev === "loaded" ? prev : "blocked"));
    }, 6000);
    return () => window.clearTimeout(timeoutId);
  }, [url]);

  return (
    <div className="rounded-2xl border-[3px] border-black overflow-hidden bg-white shadow-lg">
      {/* Browser-style chrome */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-gray-100 border-b-2 border-black">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-400" />
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs text-gray-600 truncate">
          <Globe className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
          <span className="truncate">{host}</span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          Open
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="relative w-full bg-gray-50" style={{ aspectRatio: "16 / 10" }}>
        {status === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 text-sm gap-2 z-10 pointer-events-none">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading preview…
          </div>
        )}

        {status !== "blocked" && (
          <iframe
            ref={iframeRef}
            src={url}
            title={`Preview of ${host}`}
            className="absolute inset-0 w-full h-full"
            // Sandbox: allow scripts and same-origin to itself so the app can
            // render, but disallow top-navigation, popups-to-escape, etc.
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            referrerPolicy="no-referrer-when-downgrade"
            loading="lazy"
            onLoad={() => setStatus("loaded")}
          />
        )}

        {status === "blocked" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <p className="text-sm text-gray-700 max-w-sm">
              This site doesn&apos;t allow embedding (it sets{" "}
              <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                X-Frame-Options
              </code>{" "}
              or a CSP frame-ancestors header).
            </p>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Open {host}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

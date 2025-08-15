// components/no-grammarly.tsx
"use client";

import { useEffect } from "react";

/**
 * Disables Grammarly on inputs/areas to avoid SSR/CSR DOM diffs.
 * Safe to include once in the app shell.
 */
export default function NoGrammarly() {
  useEffect(() => {
    // Mark existing and future inputs/areas as “no grammarly”
    const mark = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>("input, textarea, [contenteditable]")
        .forEach((el) => el.setAttribute("data-gramm", "false"));
    };

    mark(document);

    // If dialogs/portals mount later, mark their nodes too
    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((n) => {
          if (n instanceof HTMLElement) mark(n);
        });
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  return null;
}

"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordCell({ value }: { value?: string | null }) {
  if (!value) return <>—</>;

  const [show, setShow] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setShow((s) => !s)}
      className="inline-flex items-center gap-2 text-sm"
      aria-label={show ? "Hide password" : "Show password"}
    >
      <span className="font-mono">{show ? value : "••••••••"}</span>
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

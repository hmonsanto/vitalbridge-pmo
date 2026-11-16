"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";

/** Shows freshly generated recovery codes. This is the only time they are visible. */
export function RecoveryCodesPanel({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  const text = codes.join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard can be blocked; the codes are still on screen and downloadable.
    }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([`VitalBridge RX PMO recovery codes\n\n${text}\n`], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "vitalbridge-recovery-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm">
        Each code works <strong>once</strong>. If you lose your authenticator app, a code lets you sign in and set up a new
        one. Store them somewhere safe, like your password manager. <strong>They will not be shown again.</strong>
      </p>
      <ul
        aria-label="Recovery codes"
        className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--border)] bg-white/60 p-3 font-mono text-sm tracking-wider text-slate-900"
      >
        {codes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={copy}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          type="button"
          onClick={download}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium"
        >
          <Download size={15} />
          Download
        </button>
      </div>
      <button
        type="button"
        onClick={onDone}
        className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 font-semibold text-white"
      >
        I have saved my codes
      </button>
    </div>
  );
}

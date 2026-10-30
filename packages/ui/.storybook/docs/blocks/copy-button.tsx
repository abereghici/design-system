import { useState } from "react";
import type { ReactNode } from "react";

import { Button } from "@abereghici/ui/button";
import { CheckIcon } from "@abereghici/ui/icons/check";
import { CopyIcon } from "@abereghici/ui/icons/copy";

/** Copies `text` to the clipboard, and says so in its label until the pointer or focus leaves. */
export function CopyButton({ text, children }: { text: string; children: ReactNode }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
  };

  return (
    <Button
      onClick={() => {
        void copy();
      }}
      onBlur={() => {
        setCopied(false);
      }}
      onPointerLeave={() => {
        setCopied(false);
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? "Copied" : children}
    </Button>
  );
}

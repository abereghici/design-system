"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const CommandMenu = dynamic(
  () => import("./command-menu.tsx").then((module) => module.CommandMenu),
  { ssr: false },
);

export function CommandLauncher() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
        }}
      >
        Search
      </button>
      {open && <CommandMenu />}
    </>
  );
}

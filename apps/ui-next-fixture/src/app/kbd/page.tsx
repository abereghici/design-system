import { Kbd } from "@platform/ui/kbd";

export default function Page() {
  return (
    <main>
      <p>
        Press <Kbd keys="mod+k" /> to search, <Kbd keys="enter" platform="other" /> to open.
      </p>
    </main>
  );
}

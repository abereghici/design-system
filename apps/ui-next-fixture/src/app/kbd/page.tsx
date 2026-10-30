import { Kbd } from "@abereghici/ui/kbd";

export default function Page() {
  return (
    <main>
      <p>
        Press <Kbd keys="mod+k" /> to search,{" "}
        <Kbd keys="enter" platform="other" keyLabels={{ enter: "Enter" }} /> to open.
      </p>
    </main>
  );
}

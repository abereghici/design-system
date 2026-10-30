import { Tree } from "@abereghici/ui/tree";

export default function Page() {
  return (
    <main>
      <Tree.Root aria-label="Files" defaultExpandedKeys={["src"]}>
        <Tree.Item id="src" label="src">
          <Tree.Item id="index" label="index.ts" />
        </Tree.Item>
        <Tree.Item id="readme" label="README.md" />
      </Tree.Root>
    </main>
  );
}

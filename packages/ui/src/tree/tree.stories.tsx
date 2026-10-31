import { useState } from "react";
import { expect, fn, within } from "storybook/test";

import preview, { partsOf } from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";
import { turns } from "#.storybook/test/motion.ts";
import { trusted } from "#.storybook/test/trusted.ts";

import { Tree } from "./index.ts";

const cancel = (_keys: string[], details: { cancel: () => void }) => {
  details.cancel();
};

const mounted = fn<(item: HTMLDivElement | null) => void>();
const folder = (
  <Tree.Item id="src" label="src">
    <Tree.Item id="index" label="index.ts" ref={mounted} />
  </Tree.Item>
);

const meta = preview.meta({
  title: "Components/Tree",
  component: Tree.Root,
  subcomponents: partsOf(Tree),
  args: {
    "aria-label": "Files",
    selectionMode: "single" as const,
    defaultExpandedKeys: ["src"],
    children: (
      <>
        <Tree.Item id="src" label="src">
          <Tree.Item id="components" label="components">
            <Tree.Item id="button" label="button.tsx" />
            <Tree.Item id="tree" label="tree.tsx" />
          </Tree.Item>
          <Tree.Item id="index" label="index.ts" />
        </Tree.Item>
        <Tree.Item id="package" label="package.json" />
        <Tree.Item id="readme" label="README.md" />
      </>
    ),
    onExpandedChange: fn<(keys: string[], details: Tree.ExpandedChangeEventDetails) => void>(),
    onSelectionChange: fn<(keys: string[], details: Tree.SelectionChangeEventDetails) => void>(),
  },
});

export const Default = meta.story({});

Default.test("moves through the shown items with Up, Down, Home and End", async ({ canvas }) => {
  const user = await trusted();
  const named = (name: string) => canvas.getByRole("treeitem", { name });

  await user.keyboard("{Tab}");
  await expect(named("src")).toHaveFocus();
  await user.keyboard("{ArrowDown}{ArrowDown}");
  await expect(named("index.ts")).toHaveFocus();
  await user.keyboard("{End}");
  await expect(named("README.md")).toHaveFocus();
  await user.keyboard("{ArrowUp}");
  await expect(named("package.json")).toHaveFocus();
  await user.keyboard("{Home}{ArrowUp}");
  await expect(named("src")).toHaveFocus();
});

Default.test(
  "expands with Right without turning the chevron, enters with Right and goes up with Left",
  async ({ canvas, canvasElement, args }) => {
    const user = await trusted();
    const toggles = listen("ab-toggle");

    await user.keyboard("{Tab}{ArrowDown}{ArrowRight}");
    toggles.stop();
    await expect(turns(canvasElement)).toBe(false);

    const components = canvas.getByRole("treeitem", { name: "components", expanded: true });

    await expect(args.onExpandedChange).toHaveBeenCalledWith(
      ["src", "components"],
      expect.objectContaining({ reason: "arrow-key" }),
    );
    await expect(toggles.events.map(({ target, detail }) => ({ target, detail }))).toEqual([
      { target: components, detail: { component: "Tree", reason: "user" } },
    ]);
    await user.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("treeitem", { name: "button.tsx" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    await expect(components).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("treeitem", { name: "components", expanded: false })).toBe(
      components,
    );
    await user.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("treeitem", { name: "src" })).toHaveFocus();
  },
);

Default.test(
  "selects the focused item with Enter or a click, and reports item-press",
  async ({ canvas, args }) => {
    const user = await trusted();
    const toggles = listen("ab-toggle");

    await user.keyboard("{Tab}{Enter}");
    await expect(canvas.getByRole("treeitem", { name: "src", selected: true })).toHaveFocus();
    await user.click(canvas.getByRole("treeitem", { name: "README.md" }));
    toggles.stop();
    await expect(canvas.getByRole("treeitem", { name: "README.md", selected: true })).toHaveFocus();
    await expect(canvas.getByRole("treeitem", { name: "src", selected: false })).toBeVisible();
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(
      ["readme"],
      expect.objectContaining({ reason: "item-press" }),
    );
    await expect(toggles.events.map(({ detail }) => detail)).toEqual([
      { component: "Tree", reason: "user" },
      { component: "Tree", reason: "user" },
    ]);
  },
);

Default.test(
  "toggles several items with Space when multiple can be selected",
  { args: { selectionMode: "multiple" } },
  async ({ canvas, args }) => {
    const user = await trusted();

    await expect(canvas.getByRole("tree")).toHaveAttribute("aria-multiselectable", "true");
    await user.keyboard("{Tab}[Space]{ArrowDown}{ArrowDown}[Space]{ArrowDown}[Space][Space]");
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(
      ["src", "index"],
      expect.anything(),
    );
    await expect(canvas.getAllByRole("treeitem", { selected: true })).toEqual([
      canvas.getByRole("treeitem", { name: "src" }),
      canvas.getByRole("treeitem", { name: "index.ts" }),
    ]);
  },
);

Default.test(
  "expands with a click on the chevron, which turns when motion is allowed, leaving the selection",
  async ({ canvas, canvasElement, args }) => {
    const user = await trusted();
    const components = canvas.getByRole("treeitem", { name: "components" });
    const row = components.getBoundingClientRect();
    const { left } = within(components).getByText("components").getBoundingClientRect();

    // The chevron has no role or name: it is pressed where it is drawn, before the label.
    await user.click(components, { position: { x: (left - row.left) / 2, y: row.height / 2 } });
    await expect(turns(canvasElement)).toBe(
      !matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    await expect(
      canvas.getByRole("treeitem", { name: "components", expanded: true, selected: false }),
    ).toBe(components);
    await expect(args.onExpandedChange).toHaveBeenCalledWith(
      ["src", "components"],
      expect.objectContaining({ reason: "item-press" }),
    );
  },
);

Default.test(
  "toggles a parent with Enter or a click on its row when nothing can be selected",
  { args: { selectionMode: undefined } },
  async ({ canvas }) => {
    const user = await trusted();

    await user.click(canvas.getByRole("treeitem", { name: "components" }));
    await expect(canvas.getByRole("treeitem", { name: "button.tsx" })).toBeVisible();
    await user.keyboard("{ArrowUp}{Enter}");
    await expect(canvas.getByRole("treeitem", { name: "src", expanded: false })).toHaveFocus();
  },
);

Default.test(
  "keeps the items and the selection when the changes are cancelled",
  { args: { onExpandedChange: cancel, onSelectionChange: cancel } },
  async ({ canvas }) => {
    const user = await trusted();
    const toggles = listen("ab-toggle");

    await user.keyboard("{Tab}{ArrowLeft}{Enter}");
    toggles.stop();
    await expect(
      canvas.getByRole("treeitem", { name: "src", expanded: true, selected: false }),
    ).toHaveFocus();
    await expect(toggles.events).toEqual([]);
  },
);

Default.test(
  "renders an item's children only while it is expanded",
  { args: { defaultExpandedKeys: [], children: folder } },
  async ({ canvas }) => {
    const user = await trusted();

    await expect(mounted).not.toHaveBeenCalled();
    await user.keyboard("{Tab}{ArrowRight}");
    await expect(mounted).toHaveBeenCalledWith(canvas.getByRole("treeitem", { name: "index.ts" }));
    await user.keyboard("{ArrowLeft}");
    await expect(mounted.mock.lastCall?.[0]).toBeNull();
  },
);

Default.test("moves to the next item starting with a typed letter", async ({ canvas }) => {
  const user = await trusted();

  await user.keyboard("{Tab}r");
  await expect(canvas.getByRole("treeitem", { name: "README.md" })).toHaveFocus();
});

Default.test(
  "takes one Tab stop, which lands on the selected item",
  { args: { defaultSelectedKeys: ["package"] } },
  async ({ canvas }) => {
    const user = await trusted();

    await user.keyboard("{Tab}");
    await expect(canvas.getByRole("treeitem", { name: "package.json" })).toHaveFocus();
    await user.keyboard("{Tab}");
    await expect(canvas.getByRole("tree", { name: "Files" })).not.toContainElement(
      document.activeElement instanceof HTMLElement ? document.activeElement : null,
    );
  },
);

Default.test(
  "swaps Right and Left in a right-to-left page",
  { globals: { dir: "rtl" } },
  async ({ canvas }) => {
    const user = await trusted();

    await user.keyboard("{Tab}{ArrowLeft}");
    await expect(canvas.getByRole("treeitem", { name: "components" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("treeitem", { name: "src" })).toHaveFocus();
  },
);

function ControlledTree({
  defaultExpandedKeys = [],
  defaultSelectedKeys = [],
  ...args
}: Tree.RootProps) {
  const [expandedKeys, setExpandedKeys] = useState(defaultExpandedKeys);
  const [selectedKeys, setSelectedKeys] = useState(defaultSelectedKeys);

  return (
    <Tree.Root
      {...args}
      expandedKeys={expandedKeys}
      onExpandedChange={(keys, details) => {
        setExpandedKeys(keys);
        args.onExpandedChange?.(keys, details);
      }}
      selectedKeys={selectedKeys}
      onSelectionChange={(keys, details) => {
        setSelectedKeys(keys);
        args.onSelectionChange?.(keys, details);
      }}
    />
  );
}

export const Controlled = meta.story({
  args: { defaultSelectedKeys: ["index"] },
  render: ControlledTree,
  parameters: {
    docs: {
      description: { story: "The app holds the expanded and selected Items in state." },
    },
  },
});

Controlled.test("follows the keys the app holds", async ({ canvas, args }) => {
  const user = await trusted();

  await user.keyboard("{Tab}{Home}{ArrowLeft}{Enter}");
  await expect(
    canvas.getByRole("treeitem", { name: "src", expanded: false, selected: true }),
  ).toHaveFocus();
  await expect(args.onExpandedChange).toHaveBeenCalledWith([], expect.anything());
  await expect(args.onSelectionChange).toHaveBeenCalledWith(["src"], expect.anything());
});

function LazyTree(args: Tree.RootProps) {
  const [branches, setBranches] = useState<string[]>();
  const [loading, setLoading] = useState(false);

  return (
    <Tree.Root
      {...args}
      onExpandedChange={(keys, details) => {
        args.onExpandedChange?.(keys, details);

        if (keys.includes("origin") && branches === undefined) {
          setLoading(true);
          setTimeout(() => {
            setBranches(["main", "release"]);
            setLoading(false);
          }, 300);
        }
      }}
    >
      <Tree.Item id="origin" label="origin" hasChildItems loading={loading}>
        {branches?.map((branch) => (
          <Tree.Item key={branch} id={branch} label={branch} />
        ))}
      </Tree.Item>
    </Tree.Root>
  );
}

export const LazyChildren = meta.story({
  args: { "aria-label": "Remotes", defaultExpandedKeys: [] },
  render: LazyTree,
  parameters: {
    docs: {
      description: {
        story:
          "The app renders an Item's children once it expands, and marks it `loading` until they arrive.",
      },
    },
  },
});

LazyChildren.test(
  "announces an item as busy while its children load, then shows them",
  async ({ canvas }) => {
    const user = await trusted();

    await user.keyboard("{Tab}{ArrowRight}");

    const origin = canvas.getByRole("treeitem", { name: "origin", expanded: true });

    await expect(origin).toHaveAttribute("aria-busy", "true");
    await expect(await canvas.findByRole("treeitem", { name: "main" })).toBeVisible();
    await expect(origin).not.toHaveAttribute("aria-busy");
  },
);

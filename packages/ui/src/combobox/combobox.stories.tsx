import { useState } from "react";
import { expect, fn, screen, waitFor } from "storybook/test";

import { Dialog } from "@platform/ui/dialog";
import { UserIcon } from "@platform/ui/icons/user";

import preview, { partsOf } from "#.storybook/preview.tsx";
import { confirmComposition, trusted } from "#.storybook/test/trusted.ts";

import * as Combobox from "./combobox.tsx";

// @ts-expect-error -- the empty list is announced, so it needs its text
({ label: "Assignee" }) satisfies Combobox.RootProps;
// @ts-expect-error -- while loading, the list announces its loading text
({ label: "Assignee", noOptionsText: "No results", loading: true }) satisfies Combobox.RootProps;

const onValueChange = fn<NonNullable<Combobox.RootProps["onValueChange"]>>();
const onInputValueChange = fn<NonNullable<Combobox.RootProps["onInputValueChange"]>>();
const onOpenChange = fn<NonNullable<Combobox.RootProps["onOpenChange"]>>();
const reasons = (callback: { mock: { calls: [unknown, { reason: string }][] } }) =>
  callback.mock.calls.map(([value, { reason }]) => [value, reason]);
const field = (name = "Assignee") => screen.getByRole<HTMLInputElement>("combobox", { name });
const highlighted = () => document.querySelector('[role="option"][aria-selected="true"]');
const names = () => screen.queryAllByRole("option").map((option) => option.textContent);
const submitted = () => new FormData(screen.getByRole<HTMLFormElement>("form")).get("assignee");
const type = async (keys: string, name?: string) => {
  field(name).focus();
  await (await trusted()).keyboard(keys);
};

const cancel = (_value: unknown, details: { cancel: () => void }) => {
  details.cancel();
};
const person = (value: string, name: string, keywords?: string[]) => (
  <Combobox.Item value={value} {...(keywords && { keywords })}>
    <UserIcon />
    {name}
  </Combobox.Item>
);

const meta = preview.meta({
  title: "Components/Combobox",
  component: Combobox.Root,
  subcomponents: partsOf(Combobox),
  args: {
    label: "Assignee",
    name: "assignee",
    placeholder: "Search people",
    noOptionsText: "No results",
    onValueChange,
    onInputValueChange,
    onOpenChange,
    children: (
      <>
        {person("ab", "Alexandru Bereghici", ["sasha"])}
        {person("im", "Ioana Munteanu")}
        {person("mi", "Mugur Ionescu")}
        <Combobox.Group label="Former members">
          <Combobox.Item value="eh" disabled>
            Erik Halvorsen
          </Combobox.Item>
          <Combobox.Item value="st">Ștefan Țurcanu</Combobox.Item>
        </Combobox.Group>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <form
        aria-label="Task"
        style={{ maxInlineSize: "20rem", paddingBlockEnd: "16rem" }}
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Story />
        <button type="submit">Save</button>
      </form>
    ),
  ],
});

export const Default = meta.story({});

Default.test("opens on a press, first option highlighted", async ({ canvas, userEvent }) => {
  await expect(field()).toHaveAttribute("aria-expanded", "false");
  await userEvent.click(field());
  await waitFor(() => expect(canvas.getByRole("listbox", { name: "Assignee" })).toBeVisible());
  await expect(field()).toHaveFocus();
  await expect(field()).toHaveAttribute("aria-expanded", "true");
  await expect(names().join()).toBe(
    "Alexandru Bereghici,Ioana Munteanu,Mugur Ionescu,Erik Halvorsen,Ștefan Țurcanu",
  );
  await expect(highlighted()).toHaveAccessibleName("Alexandru Bereghici");
  await expect(field()).toHaveAttribute("aria-activedescendant", highlighted()?.id);
  await expect(canvas.getByRole("group", { name: "Former members" })).toContainElement(
    canvas.getByRole("option", { name: "Erik Halvorsen" }),
  );
  await expect(reasons(onOpenChange)).toEqual([[true, "input-press"]]);
});

Default.test("ranks prefix, word start, then subsequence", async ({ canvas, userEvent }) => {
  await type("mu");
  await expect(highlighted()).toHaveAccessibleName("Mugur Ionescu");
  const ioana = canvas.getByRole("option", { name: "Ioana Munteanu" });
  await expect(ioana).toHaveAttribute("aria-posinset", "2");
  await expect(canvas.queryByRole("option", { name: "Alexandru Bereghici" })).toBeNull();
  await expect(canvas.queryByRole("group")).toBeNull();
  await userEvent.keyboard("{ArrowDown}");
  await expect(highlighted()).toBe(ioana);
  await userEvent.keyboard("{Backspace}{Backspace}hv");
  await expect(names()).toEqual(["Erik Halvorsen"]);
  await expect(reasons(onOpenChange)).toEqual([[true, "input-change"]]);
  await userEvent.clear(field());
  await userEvent.keyboard("SASHA");
  await expect(highlighted()).toHaveAccessibleName("Alexandru Bereghici");
  await userEvent.clear(field());
  await userEvent.keyboard("stefan t");
  await expect(highlighted()).toHaveAccessibleName("Ștefan Țurcanu");
});

Default.test("shows and announces No results", async ({ canvas, userEvent }) => {
  await type("zzz{Enter}");
  await expect(names()).toEqual([]);
  await expect(canvas.getByRole("status")).toHaveTextContent("No results");
  await expect(canvas.getByText("No results", { ignore: "output" })).toBeVisible();
  await expect(field()).toHaveValue("zzz");
  await userEvent.click(document.body);
  await expect(field()).toHaveAttribute("aria-expanded", "false");
  await expect(reasons(onOpenChange).at(-1)).toEqual([false, "outside-press"]);
});

Default.test("chooses by Enter but not IME's, or click", async ({ canvas, userEvent }) => {
  await type("io");
  confirmComposition(field());
  await expect(field()).toHaveValue("io");
  await type("{Enter}");
  await expect(field()).toHaveValue("Ioana Munteanu");
  await expect(field()).toHaveAttribute("aria-expanded", "false");
  await expect(submitted()).toBe("im");
  await expect(reasons(onValueChange)).toEqual([["im", "item-press"]]);
  await expect(reasons(onInputValueChange).at(-1)).toEqual(["Ioana Munteanu", "item-press"]);
  await expect(reasons(onOpenChange).at(-1)).toEqual([false, "item-press"]);
  await userEvent.click(field());
  await userEvent.hover(canvas.getByRole("option", { name: "Alexandru Bereghici" }));
  await expect(highlighted()).toHaveAccessibleName("Alexandru Bereghici");
  await userEvent.click(canvas.getByRole("option", { name: "Mugur Ionescu" }));
  await expect(field()).toHaveValue("Mugur Ionescu");
  await expect(field()).toHaveFocus();
  await userEvent.keyboard("{ArrowDown}");
  await expect(highlighted()).toHaveAccessibleName("Mugur Ionescu");
});

Default.test("moves past disabled, wrapping, with Home and End", async ({ canvas, userEvent }) => {
  await type("{ArrowUp}");
  await expect(highlighted()).toHaveAccessibleName("Ștefan Țurcanu");
  await userEvent.keyboard("{ArrowUp}");
  await expect(highlighted()).toHaveAccessibleName("Mugur Ionescu");
  await userEvent.keyboard("{End}{ArrowDown}");
  await expect(highlighted()).toHaveAccessibleName("Alexandru Bereghici");
  await userEvent.keyboard("{ArrowDown}{Home}");
  await expect(highlighted()).toHaveAccessibleName("Alexandru Bereghici");
  await userEvent.click(canvas.getByRole("option", { name: "Erik Halvorsen" }));
  await expect(onValueChange).not.toHaveBeenCalled();
  await expect(reasons(onOpenChange)).toEqual([[true, "list-navigation"]]);
});

const inADialog = (Story: () => React.ReactNode) => (
  <Dialog.Root defaultOpen>
    <Dialog.Content aria-label="Assign task">{Story()}</Dialog.Content>
  </Dialog.Root>
);

Default.test(
  "restores on Escape, then clears, keeping its Dialog open",
  { args: { defaultValue: "ab" }, decorators: [inADialog] },
  async ({ canvas }) => {
    const dialog = canvas.getByRole("dialog", { name: "Assign task" });
    await waitFor(() => expect(dialog).toBeVisible());
    await expect(field()).toHaveValue("Alexandru Bereghici");
    await type("x{Escape}");
    await expect(field()).toHaveValue("Alexandru Bereghici");
    await expect(field()).toHaveAttribute("aria-expanded", "false");
    await type("{Escape}");
    await expect(field()).toHaveValue("");
    await expect(submitted()).toBe("");
    await expect(reasons(onValueChange)).toEqual([[null, "escape-key"]]);
    await expect(dialog).toBeVisible();
  },
);

Default.test(
  "leaves on Tab without choosing, showing the error",
  { args: { required: true, errorMessage: "Choose an assignee." } },
  async ({ canvas }) => {
    await type("io{Tab}");
    await expect(canvas.getByRole("button", { name: "Save" })).toHaveFocus();
    await expect(field()).toHaveValue("");
    await expect(field()).toHaveAttribute("aria-expanded", "false");
    await expect(field()).toHaveAccessibleDescription("Choose an assignee.");
    await expect(onValueChange).not.toHaveBeenCalled();
    await type("mu{Enter}");
    await expect(field()).not.toHaveAttribute("aria-invalid");
  },
);

Default.test("keeps text and list on cancel", { args: { onValueChange: cancel } }, async () => {
  await type("mu{Enter}");
  await expect(field()).toHaveValue("mu");
  await expect(field()).toHaveAttribute("aria-expanded", "true");
});

Default.test(
  "validates the chosen value and resets to the default",
  {
    args: {
      defaultValue: "im",
      validate: (value) => (value === "mi" ? "Mugur is on leave." : null),
    },
  },
  async ({ canvas, userEvent }) => {
    await userEvent.clear(field());
    await expect(reasons(onValueChange)).toEqual([[null, "input-clear"]]);
    await userEvent.keyboard("mu{Enter}");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(field()).toHaveAccessibleDescription("Mugur is on leave.");
    canvas.getByRole<HTMLFormElement>("form").reset();
    await waitFor(() => expect(field()).toHaveValue("Ioana Munteanu"));
    await waitFor(() => expect(submitted()).toBe("im"));
  },
);

Default.test(
  "stays focusable, closed and unchanged when disabled",
  { args: { disabled: true, defaultValue: "ab", description: "Locked by an admin." } },
  async ({ userEvent }) => {
    await userEvent.click(field());
    await expect(field()).toHaveFocus();
    await expect(field()).toHaveAccessibleDescription("Locked by an admin.");
    await userEvent.keyboard("{ArrowDown}x{Escape}");
    await expect(field()).toHaveAttribute("aria-expanded", "false");
    await expect(field()).toHaveValue("Alexandru Bereghici");
    await expect(submitted()).toBe("ab");
    await expect(onOpenChange).not.toHaveBeenCalled();
  },
);

function ServerSearch(args: Combobox.RootProps) {
  const [query, setQuery] = useState("");
  return (
    <Combobox.Root
      {...args}
      filter={null}
      inputValue={query}
      onInputValueChange={(next, details) => {
        setQuery(next);
        args.onInputValueChange?.(next, details);
      }}
    >
      {["platform/ui", "platform/tokens", "platform/web"]
        .filter((name) => name.endsWith(query.trim()))
        .map((name) => (
          <Combobox.Item key={name} value={name}>
            {name}
          </Combobox.Item>
        ))}
    </Combobox.Root>
  );
}

export const Open = meta.story({
  parameters: { docs: { description: { story: "Open, with the first option highlighted." } } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("combobox", { name: "Assignee" }));
  },
});

export const ServerSearchResults = meta.story({
  args: { label: "Repository", name: "repo", noOptionsText: "No repositories" },
  render: ServerSearch,
  parameters: { docs: { description: { story: "With `filter={null}` the app filters." } } },
});

ServerSearchResults.test("shows the Items the app renders", async ({ canvas, userEvent }) => {
  await type("eb", "Repository");
  await expect(names()).toEqual(["platform/web"]);
  await userEvent.keyboard("x");
  await expect(canvas.getByRole("status")).toHaveTextContent("No repositories");
  await userEvent.keyboard("{Backspace}{Enter}");
  await expect(field("Repository")).toHaveValue("platform/web");
});

Default.test(
  "announces its loading text in place of No results",
  { args: { loading: true, loadingText: "Loading…" } },
  async () => {
    await type("zzz");
    await expect(screen.getByRole("status")).toHaveTextContent("Loading…");
  },
);

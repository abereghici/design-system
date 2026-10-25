import { useState } from "react";
import type { ReactNode } from "react";
import { expect, fn, screen, waitFor } from "storybook/test";

import { Dialog } from "@platform/ui/dialog";
import { UserIcon } from "@platform/ui/icons/user";
import { roRO } from "@platform/ui/locales/ro-RO";
import { Provider } from "@platform/ui/provider";

import preview from "#.storybook/preview.tsx";
import { trusted } from "#.storybook/test/trusted.ts";

import type { Locale } from "../provider/locale.tsx";

import * as Combobox from "./combobox.tsx";

const onValueChange = fn<NonNullable<Combobox.RootProps["onValueChange"]>>();
const onInputValueChange = fn<NonNullable<Combobox.RootProps["onInputValueChange"]>>();
const onOpenChange = fn<NonNullable<Combobox.RootProps["onOpenChange"]>>();

const reasons = (callback: { mock: { calls: [unknown, { reason: string }][] } }) =>
  callback.mock.calls.map(([value, { reason }]) => [value, reason]);
const field = () => screen.getByRole<HTMLInputElement>("combobox", { name: "Assignee" });
const highlighted = () => document.querySelector('[role="option"][aria-selected="true"]');
const names = () => screen.queryAllByRole("option").map((option) => option.textContent);
const submitted = () => new FormData(screen.getByRole<HTMLFormElement>("form")).get("assignee");
const type = async (keys: string) => {
  field().focus();
  await (await trusted()).keyboard(keys);
};

const cancel = (_value: unknown, details: { cancel: () => void }) => {
  details.cancel();
};
const person = (value: string, name: string, keywords?: string[]) => (
  <Combobox.Item value={value} {...(keywords && { keywords })}>
    <UserIcon data-icon="inline-start" />
    {name}
  </Combobox.Item>
);

const meta = preview.meta({
  title: "Components/Forms/Combobox",
  component: Combobox.Root,
  args: {
    label: "Assignee",
    name: "assignee",
    placeholder: "Search people",
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

Default.test("chooses by Enter or click, keeping focus", async ({ canvas, userEvent }) => {
  await type("io{Enter}");
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

const inADialog = (Story: () => ReactNode) => (
  <Dialog.Root defaultOpen>
    <Dialog.Content aria-label="Assign task">{Story()}</Dialog.Content>
  </Dialog.Root>
);

Default.test(
  "restores on Escape, then clears, keeping its Dialog open",
  { args: { defaultValue: "ab" }, decorators: [inADialog] },
  async ({ canvas }) => {
    const dialog = await canvas.findByRole("dialog", { name: "Assign task" });
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

Default.test(
  "matches Romanian accents and speaks the Provider's locale",
  { decorators: [(Story) => <Provider locale={roRO}>{Story()}</Provider>] },
  async ({ canvas }) => {
    await type("țur");
    await expect(highlighted()).toHaveAccessibleName("Ștefan Țurcanu");
    await type("q");
    await expect(canvas.getByRole("status")).toHaveTextContent("Niciun rezultat");
    // @ts-expect-error -- a locale must carry the Combobox labels
    void ({ tag: "fr-FR", labels: { ...roRO.labels, combobox: {} } } satisfies Locale);
  },
);

const repositories = ["platform/ui", "platform/tokens", "platform/web"];

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
      {repositories
        .filter((name) => name.endsWith(query.trim()))
        .map((name) => (
          <Combobox.Item key={name} value={name}>
            {name}
          </Combobox.Item>
        ))}
    </Combobox.Root>
  );
}

export const ServerSearchResults = meta.story({
  args: { label: "Repository", name: "repo", labels: { noResults: "No repositories" } },
  render: ServerSearch,
  parameters: {
    docs: { description: { story: "With `filter={null}` the app filters the Items." } },
  },
});

ServerSearchResults.test("shows the Items the app renders", async ({ canvas, userEvent }) => {
  const input = canvas.getByRole("combobox", { name: "Repository" });
  input.focus();
  await userEvent.keyboard("eb");
  await expect(names()).toEqual(["platform/web"]);
  await userEvent.keyboard("x");
  await expect(canvas.getByRole("status")).toHaveTextContent("No repositories");
  await userEvent.keyboard("{Backspace}{Enter}");
  await expect(input).toHaveValue("platform/web");
});

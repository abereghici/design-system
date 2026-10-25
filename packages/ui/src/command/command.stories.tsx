import { useRef, useState } from "react";
import { expect, fn, waitFor } from "storybook/test";

import { PlusIcon } from "@platform/ui/icons/plus";
import { Kbd } from "@platform/ui/kbd";
import { roRO } from "@platform/ui/locales/ro-RO";
import { Provider } from "@platform/ui/provider";

import preview, { partsOf } from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";
import { trusted } from "#.storybook/test/trusted.ts";

import * as Command from "./index.parts.ts";

const palette = (
  <>
    <Command.Input />
    <Command.Empty />
    <Command.List>
      <Command.Group heading="Suggestions">
        <Command.Item aria-keyshortcuts="Meta+N Control+N">
          <PlusIcon data-icon="inline-start" />
          New document
          <Kbd keys="mod+n" aria-hidden />
        </Command.Item>
        <Command.Item keywords={["find"]}>Search files</Command.Item>
        <Command.Item disabled>Copy link</Command.Item>
      </Command.Group>
      <Command.Group heading="Navigation">
        <Command.Item>Go to Home</Command.Item>
        <Command.Item>Go to Release notes</Command.Item>
        <Command.Item>Open settings</Command.Item>
      </Command.Group>
    </Command.List>
    <Command.Footer />
  </>
);

const highlighted = (input: HTMLElement) =>
  document.querySelector(`[id="${input.getAttribute("aria-activedescendant") ?? ""}"]`);
const shown = (canvas: { getAllByRole: (role: "option") => HTMLElement[] }) =>
  canvas.getAllByRole("option").map((option) => option.textContent);

const reason = (value: string): unknown => expect.objectContaining({ reason: value });

const meta = preview.meta({
  title: "Components/Command",
  component: Command.Root,
  subcomponents: partsOf(Command),
  args: { children: palette, onInputValueChange: fn() },
});

export const Default = meta.story({});

Default.test(
  "ranks prefix over word start over subsequence within groups, hiding empty groups, and announces no results",
  async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("combobox");
    await userEvent.type(input, "se");
    await expect(args.onInputValueChange).toHaveBeenLastCalledWith("se", reason("input-change"));
    await waitFor(() =>
      expect(shown(canvas)).toEqual(["Search files", "Go to Release notes", "Open settings"]),
    );
    await expect(canvas.getByRole("option", { name: "Open settings" })).toHaveAttribute(
      "aria-posinset",
      "1",
    );
    const order = [];
    for (const key of ["{ArrowDown}", "{ArrowDown}", "{ArrowDown}"]) {
      order.push(highlighted(input)?.textContent);
      await userEvent.keyboard(key);
    }
    await expect(order).toEqual(["Search files", "Open settings", "Go to Release notes"]);
    await expect(highlighted(input)).toHaveTextContent("Search files");
    await userEvent.clear(input);
    await userEvent.type(input, "home");
    await waitFor(() => expect(canvas.queryByRole("group", { name: "Suggestions" })).toBeNull());
    await userEvent.clear(input);
    await userEvent.type(input, "find");
    await waitFor(() => expect(shown(canvas)).toEqual(["Search files"]));
    await expect(canvas.getByRole("status")).toHaveTextContent("");
    await userEvent.type(input, "zzz");
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("No results"));
    await expect(canvas.queryByRole("option")).toBeNull();
    await expect(input).not.toHaveAttribute("aria-activedescendant");
  },
);

Default.test(
  "matches case- and accent-insensitively, named by visible text through aria-labelledby over its built-in name",
  {
    args: {
      children: (
        <>
          <span id="command-search">Find a page</span>
          <Command.Input aria-labelledby="command-search" />
          <Command.List>
            <Command.Item>Șablon nou</Command.Item>
            <Command.Item>Größe ändern</Command.Item>
          </Command.List>
        </>
      ),
    },
  },
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "Find a page" });
    for (const [query, match] of [
      ["sab", "Șablon nou"],
      ["AND", "Größe ändern"],
      ["șa", "Șablon nou"],
    ]) {
      await userEvent.clear(input);
      await userEvent.type(input, query ?? "");
      await waitFor(() => expect(shown(canvas)).toEqual([match]));
    }
  },
);

Default.test(
  "is a combobox that highlights the first command and moves with the arrows, wrapping past disabled commands, and with Home and End while empty",
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "Search commands" });
    await expect(input).toHaveAttribute("aria-expanded", "true");
    await expect(input).toHaveAttribute("aria-controls", canvas.getByRole("listbox").id);
    await waitFor(() => expect(highlighted(input)).toHaveAttribute("aria-selected", "true"));
    await expect(highlighted(input)).toBe(canvas.getByRole("option", { name: "New document" }));
    await userEvent.type(input, "{ArrowUp}");
    await expect(highlighted(input)).toHaveTextContent("Open settings");
    await userEvent.keyboard("{Home}{ArrowDown}{ArrowDown}");
    await expect(highlighted(input)).toHaveTextContent("Go to Home");
    await userEvent.keyboard("{End}");
    await expect(highlighted(input)).toHaveTextContent("Open settings");
    await userEvent.type(input, "o");
    await userEvent.keyboard("{End}");
    await expect(highlighted(input)).toHaveTextContent("New document");
  },
);

Default.test(
  "runs the highlighted command on Enter and a pressed one, keeping focus in the input",
  async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("combobox");
    const confirmations = listen("ab-confirm");
    await userEvent.type(input, "{ArrowDown}{Enter}");
    const home = canvas.getByRole("option", { name: "Go to Home" });
    await userEvent.hover(home);
    await expect(highlighted(input)).toBe(home);
    await userEvent.click(home);
    await userEvent.click(canvas.getByRole("option", { name: "Copy link" }));
    confirmations.stop();
    await expect(input).toHaveFocus();
    await expect(confirmations.events.map(({ target, detail }) => ({ target, detail }))).toEqual(
      [canvas.getByRole("option", { name: "Search files" }), home].map((target) => ({
        target,
        detail: { component: "Command", reason: "user" },
      })),
    );
  },
);

Default.test(
  "shows every command with filter={null}",
  { args: { filter: null } },
  async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("combobox"), "zzz");
    await expect(canvas.getAllByRole("option")).toHaveLength(6);
    await expect(canvas.getByRole("status")).toHaveTextContent("");
  },
);

Default.test(
  "speaks the Provider's locale",
  { decorators: [(Story) => <Provider locale={roRO}>{Story()}</Provider>] },
  async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("combobox", { name: "Caută comenzi" }), "zzz");
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("Niciun rezultat"));
    // @ts-expect-error -- a locale must carry the Command labels
    void ({ tag: "fr-FR", labels: { ...roRO.labels, command: {} } } satisfies typeof roRO);
  },
);

const onOpenChange = fn();

function Palette(props: Command.RootProps) {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        type="button"
        ref={opener}
        aria-keyshortcuts="Meta+K Control+K"
        onClick={() => {
          setOpen(true);
        }}
      >
        Search <Kbd keys="mod+k" aria-hidden />
      </button>
      <Command.Dialog
        open={open}
        onOpenChange={(next, details) => {
          onOpenChange(next, details);
          setOpen(next);
        }}
        finalFocus={opener}
        onInputValueChange={props.onInputValueChange}
      >
        {props.children}
      </Command.Dialog>
    </>
  );
}

const outside = { keys: "[MouseLeft]", coords: { clientX: 1, clientY: 1 } };

export const InADialog = meta.story({
  render: Palette,
  parameters: { docs: { description: { story: "The ⌘K palette; the app holds `open`." } } },
});

InADialog.test(
  "opens as a modal named Command palette, focusing the input, and closes on Escape",
  async ({ canvas, userEvent }) => {
    const opener = canvas.getByRole("button", { name: "Search" });
    await userEvent.click(opener);
    await waitFor(() =>
      expect(canvas.getByRole("dialog", { name: "Command palette" })).toBeVisible(),
    );
    const input = canvas.getByRole("combobox", { name: "Search commands" });
    await waitFor(() => expect(input).toHaveFocus());
    await expect(highlighted(input)).toHaveTextContent("New document");
    await (await trusted()).keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(onOpenChange).toHaveBeenLastCalledWith(false, reason("escape-key"));
    await expect(opener).toHaveFocus();
  },
);

InADialog.test(
  "closes before a command runs, returning focus to the opener",
  async ({ canvas, userEvent }) => {
    const opener = canvas.getByRole("button", { name: "Search" });
    await userEvent.click(opener);
    const focused: (Element | null)[] = [];
    const record = () => {
      focused.push(document.activeElement);
    };
    document.addEventListener("ab-confirm", record);
    await userEvent.type(canvas.getByRole("combobox"), "home{Enter}");
    document.removeEventListener("ab-confirm", record);
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(onOpenChange).toHaveBeenCalledWith(false, reason("item-press"));
    await expect(focused).toEqual([opener]);
  },
);

InADialog.test(
  "stays open, without ab-dismiss, when onOpenChange cancels",
  {
    render: (args) => (
      <Command.Dialog
        defaultOpen
        onOpenChange={(_open, details) => {
          details.cancel();
        }}
      >
        {args.children}
      </Command.Dialog>
    ),
  },
  async ({ canvas, userEvent }) => {
    const dismissals = listen("ab-dismiss");
    await userEvent.type(canvas.getByRole("combobox"), "{Enter}");
    await userEvent.pointer({ ...outside, target: canvas.getByRole("dialog") });
    await waitFor(() => expect(canvas.getByRole("dialog")).toBeVisible());
    await expect(dismissals.events).toEqual([]);
  },
);

InADialog.test(
  "closes on an outside press, dispatching ab-dismiss, and clears the query",
  async ({ args, canvas, userEvent }) => {
    const opener = canvas.getByRole("button", { name: "Search" });
    await userEvent.click(opener);
    await userEvent.type(canvas.getByRole("combobox"), "set");
    const dismissals = listen("ab-dismiss");
    await userEvent.pointer({ ...outside, target: canvas.getByRole("dialog") });
    dismissals.stop();
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(onOpenChange).toHaveBeenLastCalledWith(false, reason("outside-press"));
    await expect(dismissals.events.map(({ detail }) => detail)).toEqual([
      { component: "Dialog", reason: "user" },
    ]);
    await expect(args.onInputValueChange).toHaveBeenLastCalledWith("", reason("input-clear"));
    await userEvent.click(opener);
    const input = canvas.getByRole("combobox");
    await expect(input).toHaveValue("");
    await waitFor(() => expect(highlighted(input)).toHaveTextContent("New document"));
  },
);

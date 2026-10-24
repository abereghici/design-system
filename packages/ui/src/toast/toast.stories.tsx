import { expect, fn, waitFor, within } from "storybook/test";

import type { Decorator } from "@storybook/react-vite";

import { Toaster } from "@platform/ui/toaster";

import preview from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";

import { remove, snapshot, toast } from "./toast.ts";
import type { ToastOptions } from "./toast.ts";

const undo = fn<() => void>();
const mod = /^(?:Mac|iPhone|iPad)/v.test(navigator.platform) ? "Meta" : "Control";

const clear = () => {
  for (const { id } of snapshot()) remove(id);
};

const showing =
  (...toasts: ToastOptions[]) =>
  () => {
    for (const options of toasts) toast({ duration: Infinity, ...options });
    return clear;
  };

const archived: ToastOptions = {
  title: "Moved to Archive",
  action: { label: "Undo", shortcut: "mod+z", onClick: undo },
};

const region = () => within(document.body).findByRole("region", { name: "Notifications" });

const gone = (text: string) =>
  waitFor(() => expect(within(document.body).queryAllByText(text)).toEqual([]), {
    timeout: 3000,
  });

const withTextField: Decorator = (Story) => (
  <>
    <label>
      Note <input type="text" />
    </label>
    <Story />
  </>
);

const meta = preview.meta({
  title: "Components/Feedback/Toast",
  component: Toaster,
  beforeEach: () => clear,
});

export const Default = meta.story({ beforeEach: showing(archived) });

Default.test("shows the title, the action with its shortcut and a Dismiss button", async () => {
  const toasts = within(await region());
  await waitFor(() => expect(toasts.getByText("Moved to Archive")).toBeVisible());
  await expect(toasts.getByRole("button", { name: "Undo" })).toHaveAttribute(
    "aria-keyshortcuts",
    `${mod}+Z`,
  );
  await expect(toasts.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
});

Default.test("announces the toast politely, once", async () => {
  const status = within(document.body).getByRole("status");
  await waitFor(() => expect(status).toHaveTextContent("Moved to Archive"));
  await expect(status.textContent).toBe("Moved to Archive");
  await expect(within(document.body).getByRole("alert")).toHaveTextContent("");
});

for (const variant of ["success", "warning"] as const) {
  Default.test(
    `shows a ${variant} toast with its description`,
    {
      beforeEach: showing({ variant, title: "Published", description: "Live at bereghici.dev" }),
    },
    async () => {
      const toasts = within(await region());
      await waitFor(() => expect(toasts.getByText("Live at bereghici.dev")).toBeVisible());
    },
  );
}

Default.test(
  "announces a danger toast assertively",
  {
    beforeEach: showing({
      variant: "danger",
      title: "Couldn't sync",
      description: "Retrying in 30 seconds.",
    }),
  },
  async () => {
    const alert = within(document.body).getByRole("alert");
    await waitFor(() => expect(alert).toHaveTextContent("Couldn't sync Retrying in 30 seconds."));
  },
);

Default.test("runs the action, dispatches ab-confirm and closes", async ({ userEvent }) => {
  undo.mockClear();
  const button = within(await region()).getByRole("button", { name: "Undo" });
  const confirms = listen("ab-confirm");
  await userEvent.click(button);
  confirms.stop();
  await expect(undo).toHaveBeenCalledOnce();
  await expect(confirms.events.map(({ detail }) => detail)).toEqual([
    { component: "Toast", reason: "user" },
  ]);
  await gone("Moved to Archive");
});

Default.test("closes on Dismiss with ab-dismiss", async ({ userEvent }) => {
  const dismisses = listen("ab-dismiss");
  await userEvent.click(within(await region()).getByRole("button", { name: "Dismiss" }));
  dismisses.stop();
  await expect(dismisses.events.map(({ detail }) => detail)).toEqual([
    { component: "Toast", reason: "user" },
  ]);
  await gone("Moved to Archive");
});

Default.test("closes on Escape while focus is inside it", async ({ userEvent }) => {
  within(await region())
    .getByRole("button", { name: "Undo" })
    .focus();
  const dismisses = listen("ab-dismiss");
  await userEvent.keyboard("{Escape}");
  dismisses.stop();
  await expect(dismisses.events).toHaveLength(1);
  await gone("Moved to Archive");
});

Default.test("runs the newest toast's action from its shortcut", async ({ userEvent }) => {
  undo.mockClear();
  await region();
  await userEvent.keyboard(`{${mod}>}z{/${mod}}`);
  await expect(undo).toHaveBeenCalledOnce();
  await gone("Moved to Archive");
});

Default.test(
  "leaves the shortcut to a focused text field",
  { decorators: [withTextField] },
  async ({ canvas, userEvent }) => {
    undo.mockClear();
    await region();
    await userEvent.click(canvas.getByRole("textbox", { name: "Note" }));
    await userEvent.keyboard(`{${mod}>}z{/${mod}}`);
    await expect(undo).not.toHaveBeenCalled();
    await waitFor(async () =>
      expect(within(await region()).getByText("Moved to Archive")).toBeVisible(),
    );
  },
);

Default.test("dispatches ab-appear when a toast shows, and never takes focus", async () => {
  clear();
  const appears = listen("ab-appear");
  const before = document.activeElement;
  toast({ title: "Link copied", duration: Infinity });
  await region();
  await waitFor(() => expect(appears.events).toHaveLength(1));
  appears.stop();
  await expect(appears.events[0]?.detail).toEqual({ component: "Toast", reason: "programmatic" });
  await expect(document.activeElement).toBe(before);
});

Default.test(
  "closes a toast after its duration, with toast.dismiss or a swipe",
  async ({ userEvent }) => {
    clear();
    toast({ title: "Saved", duration: 1000 });
    await expect(await within(await region()).findByText("Saved")).toBeInTheDocument();
    await gone("Saved");

    const id = toast({ title: "Copied", duration: Infinity });
    await within(document.body).findByText("Copied");
    toast.dismiss(id);
    await gone("Copied");

    toast({ title: "Swiped", duration: Infinity });
    const title = await within(document.body).findByText("Swiped");
    const dismisses = listen("ab-dismiss");
    await userEvent.pointer([
      { keys: "[MouseLeft>]", target: title, coords: { clientX: 200, clientY: 200 } },
      { target: title, coords: { clientX: 200, clientY: 260 } },
      { keys: "[/MouseLeft]", target: title, coords: { clientX: 200, clientY: 260 } },
    ]);
    dismisses.stop();
    await expect(dismisses.events).toHaveLength(1);
    await gone("Swiped");
  },
);

Default.test("keeps a danger toast for its longer default duration", async () => {
  clear();
  toast({ variant: "danger", title: "Couldn't sync" });
  const title = await within(document.body).findByText("Couldn't sync");
  await new Promise((resolve) => {
    setTimeout(resolve, 4500);
  });
  await expect(title).toBeVisible();
  await gone("Couldn't sync");
});

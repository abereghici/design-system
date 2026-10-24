import { expect } from "storybook/test";

import preview from "#.storybook/preview.tsx";

import { StatusDot } from "./status-dot.tsx";

const meta = preview.meta({
  title: "Components/StatusDot",
  component: StatusDot,
  args: { variant: "success" },
  decorators: [
    (Story) => (
      <table>
        <tbody>
          <tr>
            <td>
              <Story /> Operational
            </td>
          </tr>
        </tbody>
      </table>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'A 6 px state marker for dense lists and tables, always beside a text label ("● Operational"): the label carries the state, and the dot is hidden from assistive technology. Neutral is a hollow ring, so "unknown" differs by shape too. For a labelled status pill, use a Tag; for a count, a Badge.',
      },
    },
  },
});

export const Default = meta.story({});

for (const variant of ["neutral", "warning", "danger"] as const) {
  Default.test(
    `stays beside its label as ${variant}`,
    { args: { variant } },
    async ({ canvas }) => {
      await expect(canvas.getByRole("cell", { name: "Operational" })).toBeVisible();
    },
  );
}

Default.test("leaves the label beside it as the only announced state", async ({ canvas }) => {
  const cell = canvas.getByRole("cell", { name: "Operational" });
  await expect(cell.firstElementChild).toHaveAttribute("aria-hidden", "true");
});

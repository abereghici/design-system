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

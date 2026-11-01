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

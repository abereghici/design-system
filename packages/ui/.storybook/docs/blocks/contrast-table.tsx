import { CONTRAST_REQUIREMENTS, contrastRatio } from "@abereghici/tokens/contrast-matrix";
import tokens from "@abereghici/tokens/tokens.json";

const colors = new Map(tokens.color.tokens.map(({ name, value }) => [name, value]));
const schemes = ["light", "dark"] as const;

function hex(name: string, scheme: (typeof schemes)[number]): string {
  const value = colors.get(`ab-color-${name}`);

  if (value === undefined) throw new Error(`No color token ab-color-${name}`);

  return typeof value === "string" ? value : value[scheme];
}

const rows = Object.entries(
  Object.groupBy(CONTRAST_REQUIREMENTS, ({ foreground, minimum }) => `${foreground} ${minimum}`),
).map(([key, pairs = []]) => {
  const [foreground = "", minimum = ""] = key.split(" ");
  const lowest = schemes.map((scheme) =>
    Math.min(
      ...pairs.map((pair) =>
        contrastRatio(hex(pair.foreground, scheme), hex(pair.background, scheme)),
      ),
    ).toFixed(2),
  );

  return { foreground, minimum, backgrounds: pairs.length, lowest };
});

/** The lowest contrast of each foreground over every background it may sit on, per Theme. */
export function ContrastTable() {
  return (
    <table>
      <thead>
        <tr>
          <th scope="col">Foreground</th>
          <th scope="col">Needs</th>
          <th scope="col">Backgrounds</th>
          <th scope="col">Lowest, light</th>
          <th scope="col">Lowest, dark</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ foreground, minimum, backgrounds, lowest: [light, dark] }) => (
          <tr key={`${foreground} ${minimum}`}>
            <th scope="row">
              <code>--ab-color-{foreground}</code>
            </th>
            <td>{minimum}:1</td>
            <td>{backgrounds}</td>
            <td>{light}:1</td>
            <td>{dark}:1</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

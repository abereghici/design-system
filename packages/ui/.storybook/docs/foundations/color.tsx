import { Chip, Rules, Section, Swatch, TokenTable } from "./docs.tsx";
import { tokens } from "./tokens.ts";
import type { Token } from "./tokens.ts";

const swatch = (row: Token) => <Swatch name={row.name} />;

const PROPERTIES = [
  ["Surface", "surface", "A page layer that content sits on."],
  ["Background", "background", "The fill of an element."],
  ["Text", "text", "Foreground text."],
  ["Icon", "icon", "A glyph."],
  ["Border", "border", "A line."],
  ["Brand", "brand", "A fixed identity hue for the Logo, imagery and print only."],
] as const;

export function ColorRoles() {
  return (
    <>
      <Section
        title="Color"
        lead="The palette is Moss and Lichen. The light and dark themes are designed independently; neither is an inversion of the other."
      >
        <Rules
          items={[
            [
              "Rationed color",
              "Surfaces are neutral. Color signals action, state and one highlight per page.",
            ],
            ["Accent", "The single brand action color."],
            ["Highlight", "Marks one phrase per page."],
            ["Brand colors", "Fixed identity hues for the Logo, imagery and print only."],
            [
              "Themes",
              "Follow the system color scheme until the user picks one; the app remembers the choice.",
            ],
          ]}
        />
      </Section>
      {PROPERTIES.map(([caption, property, lead]) => (
        <Section key={property} title={caption} lead={lead}>
          <TokenTable
            caption={caption}
            rows={tokens("semantic", new RegExp(`^color-${property}-`, "v"))}
            preview={swatch}
          />
        </Section>
      ))}
    </>
  );
}

const HUES = [
  ["Sage", "Light-theme neutrals"],
  ["Night", "Dark-theme neutrals"],
  ["Moss", "Brand green; accent in light"],
  ["Lichen", "Accent in dark; subtle accent fill"],
  ["Fern", "Success. Generated so success reads distinctly from the accent."],
  ["Ember", "Highlight, warning"],
  ["Clay", "Danger"],
] as const;

const step = (row: Token) => <Chip name={row.name} />;

export function Palettes() {
  return (
    <>
      {HUES.map(([hue, use]) => (
        <Section key={hue} title={hue} lead={use}>
          <TokenTable
            caption={hue}
            rows={tokens("primitive", new RegExp(`^palette-${hue.toLowerCase()}-`, "v"))}
            preview={step}
          />
        </Section>
      ))}
    </>
  );
}

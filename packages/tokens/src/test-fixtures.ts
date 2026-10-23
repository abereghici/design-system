/** A DTCG 2025.10 sRGB color with its hex fallback. */
export const srgb = (hex: string) => ({
  colorSpace: "srgb",
  components: [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255),
  hex,
});

/** A themed semantic color: `$value` is the light Theme, the extension holds the dark Theme. */
export const themed = (light: string, dark: string) => ({
  $type: "color",
  $value: `{primitive.${light}}`,
  $extensions: { "com.bereghici.theme": { dark: `{primitive.${dark}}` } },
});

/** A small, valid token set using real source values (#ffffff, #12150f, #263316…). */
export const validTokens = () => ({
  primitive: {
    "palette-sage-0": { $type: "color", $value: srgb("#ffffff") },
    "palette-sage-950": { $type: "color", $value: srgb("#171914") },
    "palette-night-50": { $type: "color", $value: srgb("#eeefe9") },
    "palette-night-950": { $type: "color", $value: srgb("#12150f") },
    "palette-moss-900": { $type: "color", $value: srgb("#263316") },
    "dimension-8": { $type: "dimension", $value: { value: 8, unit: "px" } },
  } as Record<string, object>,
  semantic: {
    "color-surface-default": themed("palette-sage-0", "palette-night-950"),
    "color-text-default": themed("palette-sage-950", "palette-night-50"),
    "color-brand-moss": {
      $type: "color",
      $description: "Identity hue Moss, fixed in both themes.",
      $value: "{primitive.palette-moss-900}",
    },
    "radius-sm": { $type: "dimension", $value: "{primitive.dimension-8}" },
  } as Record<string, object>,
  component: {
    "card-background-color": { $type: "color", $value: "{semantic.color-surface-default}" },
    "button-border-radius": { $type: "dimension", $value: "{semantic.radius-sm}" },
  } as Record<string, object>,
});

import { Rules, Section, TokenTable } from "./docs.tsx";
import { resolve, tokens } from "./tokens.ts";
import type { Token } from "./tokens.ts";
import styles from "./motion.module.css";

type Point = readonly [x: number, y: number];

const SAMPLES = 32;

const bezier = ([x1, y1, x2, y2]: readonly number[]): Point[] =>
  Array.from({ length: SAMPLES + 1 }, (_, index) => {
    const t = index / SAMPLES;
    const at = (a = 0, b = 0) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
    return [at(x1, x2), at(y1, y2)];
  });

const linear = (text: string): Point[] =>
  text
    .slice("linear(".length, -1)
    .split(",")
    .map((entry, index, entries) => {
      const [output = "0", input] = entry.trim().split(/\s+/v);
      const fallback = index === 0 ? 0 : index === entries.length - 1 ? 100 : Number.NaN;
      return [
        (input === undefined ? fallback : Number(input.replace("%", ""))) / 100,
        Number(output),
      ];
    });

const points = (value: unknown): Point[] => {
  if (Array.isArray(value) && value.every((item) => typeof item === "number")) return bezier(value);
  if (value === "ease") return bezier([0.25, 0.1, 0.25, 1]);
  if (value === "linear")
    return [
      [0, 0],
      [1, 1],
    ];
  if (typeof value === "string" && value.startsWith("linear(")) return linear(value);
  throw new Error(`Unknown easing ${JSON.stringify(value)}`);
};

// The plot spans y −0.2…1.2 so springs can overshoot.
const toPath = (curve: readonly Point[]) =>
  curve
    .map(
      ([x, y], index) =>
        `${index === 0 ? "M" : "L"}${(x * 100).toFixed(2)},${((1.2 - y) * 100).toFixed(2)}`,
    )
    .join(" ");

const curve = (row: Token) => (
  <svg viewBox="-4 -4 108 148" className={styles["curve"]}>
    <title>{`${row.name} curve`}</title>
    <path d="M0,20 H100 M0,120 H100" className={styles["guide"]} />
    <path d={toPath(points(resolve(row.value, "light")))} className={styles["line"]} />
  </svg>
);

const MOTION_RULES = [
  ["Easing", "Enter and exit ease out. Never ease-in."],
  ["Exits", "Exits are faster than entrances."],
  [
    "Origin",
    "Popovers and tooltips grow from their trigger, never from nothing. Modals stay centred.",
  ],
  ["Press", "Pressable elements give slightly under the pointer."],
  ["Hover", "Hover effects appear only where a precise pointer can hover."],
  ["Swaps", "Swaps add a small lift and blur to mask the crossfade."],
  ["The intro", "The one slow moment, once per visit."],
  ["Stagger", "At most four items, and never block input."],
  ["Interruptible", "Anything that can be triggered repeatedly can be interrupted."],
  [
    "When not to animate",
    "No motion on keyboard-initiated or high-frequency (100+ per day) actions.",
  ],
  [
    "Reduced motion",
    "Removes movement, scaling, blur and stagger. Opacity and color fades remain.",
  ],
  [
    "Springs",
    "Only where the user directly causes the movement: switch thumbs, segmented and tab indicators, the radio diamond, toast entrance. Everything the system initiates eases out.",
  ],
] as const;

export function Motion() {
  return (
    <>
      <Section title="Motion" lead="Fast, eased out, interruptible and optional.">
        <Rules items={MOTION_RULES} />
      </Section>
      <Section title="Easing">
        <TokenTable
          caption="Easing"
          rows={tokens("semantic", /^motion-easing-/v)}
          preview={curve}
        />
      </Section>
      <Section title="Duration and delay">
        <TokenTable
          caption="Duration and delay"
          rows={tokens("semantic", /^motion-(?:duration|delay)-/v)}
        />
      </Section>
      <Section
        title="Scale, distance and blur"
        lead="Reduced motion zeroes distance, blur and scale; fades stay."
      >
        <TokenTable
          caption="Scale, distance and blur"
          rows={tokens("semantic", /^motion-(?:scale|distance|blur)-/v)}
        />
      </Section>
    </>
  );
}

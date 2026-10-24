import { expect } from "storybook/test";

const SAMPLES = 64;
// In user units (the 24- or 32-unit grid). Engines measure equivalent path data with float noise
// (largest seen: 1.1e-5, in Firefox), while the source coordinates are written to 0.01, so a
// real change moves some sample by far more than this.
const TOLERANCE = 0.001;

// What a path draws, in its own user units: its length and points sampled along it, whether it is
// filled and stroked, and how its strokes end and join. SVGO rewrites the path data (relative
// commands, shorthand), so the strings are not compared; the drawing is.
function drawing(svg: SVGSVGElement) {
  const { x, y, width, height } = svg.viewBox.baseVal;
  const paths = [...svg.querySelectorAll("path")].map((path) => {
    const length = path.getTotalLength();
    const style = getComputedStyle(path);
    const points = Array.from({ length: SAMPLES + 1 }, (_, index) => {
      const point = path.getPointAtLength((length * index) / SAMPLES);
      return [point.x, point.y];
    });
    return {
      shape: [length, ...points.flat()],
      filled: style.fill !== "none",
      stroked: style.stroke !== "none",
      linecap: style.strokeLinecap,
      linejoin: style.strokeLinejoin,
    };
  });
  return { viewBox: [x, y, width, height], paths };
}

/** Asserts that a rendered glyph draws the same shapes as a source SVG file's text. */
export async function expectSameDrawing(rendered: SVGSVGElement, sourceText: string) {
  const source = new DOMParser().parseFromString(sourceText, "image/svg+xml").documentElement;
  if (!(source instanceof SVGSVGElement)) throw new Error("The source is not an SVG document");
  // Geometry and computed style need the source in the document. It is never painted.
  const holder = document.createElement("div");
  holder.style.cssText = "position: fixed; inline-size: 0; block-size: 0; overflow: hidden";
  holder.append(document.importNode(source, true));
  document.body.append(holder);
  try {
    const expected = drawing(holder.querySelector("svg")!);
    const actual = drawing(rendered);
    // Each shape becomes its largest distance from the source's, at the same sample.
    const compared = actual.paths.map(({ shape, ...rest }, index) => {
      const target = expected.paths[index]?.shape ?? [];
      const deviation = Math.max(
        ...shape.map((value, at) => Math.abs(value - (target[at] ?? NaN))),
      );
      return { ...rest, shape: deviation <= TOLERANCE ? "same" : `off by ${deviation}` };
    });
    await expect({ viewBox: actual.viewBox, paths: compared }).toEqual({
      viewBox: expected.viewBox,
      paths: expected.paths.map(({ shape: _shape, ...rest }) => ({ ...rest, shape: "same" })),
    });
  } finally {
    holder.remove();
  }
}

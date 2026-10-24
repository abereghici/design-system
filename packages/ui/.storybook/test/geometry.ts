import { expect } from "storybook/test";

const SAMPLES = 64;
// Engines report float noise up to 1.1e-5 (Firefox); source coordinates are written to 0.01.
const TOLERANCE = 0.001;

// SVGO rewrites path data, so drawings are compared, not path strings.
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

export async function expectSameDrawing(rendered: SVGSVGElement, sourceText: string) {
  const source = new DOMParser().parseFromString(sourceText, "image/svg+xml").documentElement;
  if (!(source instanceof SVGSVGElement)) throw new Error("The source is not an SVG document");
  const holder = document.createElement("div");
  holder.style.cssText = "position: fixed; inline-size: 0; block-size: 0; overflow: hidden";
  holder.append(document.importNode(source, true));
  document.body.append(holder);
  try {
    const expected = drawing(holder.querySelector("svg")!);
    const actual = drawing(rendered);
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

// Spike fixture for ticket #4. Markup only uses the platform: `popover`, invoker
// commands (`commandfor` + `command`) and CSS anchor positioning in ./fixture.css.
import css from "./fixture.css?inline";

/** Which edges of a popover line up with its trigger (within 1px). */
export interface Placement {
  below: boolean;
  above: boolean;
  leftEdgesAligned: boolean;
  rightEdgesAligned: boolean;
}

export type Pair = "explicit" | "implicit" | "rtl";

export interface Fixture {
  root: HTMLElement;
  outside: HTMLElement;
  /** Explicit anchor: `anchor-name` on the trigger, `position-anchor` on the popover. */
  trigger: HTMLButtonElement;
  popover: HTMLElement;
  inside: HTMLElement;
  closeButton: HTMLButtonElement;
  /** Implicit anchor: no `anchor-name`/`position-anchor`, only the invoker relationship. */
  implicitTrigger: HTMLButtonElement;
  implicitPopover: HTMLElement;
  /** Implicit anchor inside a `dir="rtl"` subtree. */
  rtlTrigger: HTMLButtonElement;
  rtlPopover: HTMLElement;
  placement: (pair: Pair) => Placement;
  /** Properties of the explicit popover's CSS transitions that are running now. */
  runningTransitions: () => string[];
  destroy: () => void;
}

const markup = `
  <p class="outside">Outside the popover</p>

  <button type="button" class="trigger" commandfor="spike-popover" command="toggle-popover">Open</button>
  <div id="spike-popover" class="popover" popover>
    <p class="inside">Popover content</p>
    <button type="button" class="close" commandfor="spike-popover" command="hide-popover">Close</button>
  </div>

  <button type="button" class="implicit-trigger" commandfor="spike-implicit" command="toggle-popover">Implicit</button>
  <div id="spike-implicit" class="implicit-popover" popover>Implicitly anchored</div>

  <div dir="rtl" class="rtl">
    <button type="button" class="rtl-trigger" commandfor="spike-rtl" command="toggle-popover">افتح</button>
    <div id="spike-rtl" class="rtl-popover" popover>محتوى النافذة</div>
  </div>
`;

const pairSelectors = {
  explicit: [".trigger", ".popover"],
  implicit: [".implicit-trigger", ".implicit-popover"],
  rtl: [".rtl-trigger", ".rtl-popover"],
} as const;

const near = (a: number, b: number): boolean => Math.abs(a - b) < 1;

export function mountFixture(): Fixture {
  const root = document.createElement("div");
  root.className = "spike";
  root.innerHTML = `<style>${css}</style>${markup}`;
  document.body.append(root);

  const pick = <T extends Element>(selector: string, type: abstract new () => T): T => {
    const el = root.querySelector(selector);
    if (!(el instanceof type)) throw new Error(`fixture: missing ${selector}`);
    return el;
  };

  const els = {
    outside: pick(".outside", HTMLElement),
    trigger: pick(".trigger", HTMLButtonElement),
    popover: pick(".popover", HTMLElement),
    inside: pick(".inside", HTMLElement),
    closeButton: pick(".close", HTMLButtonElement),
    implicitTrigger: pick(".implicit-trigger", HTMLButtonElement),
    implicitPopover: pick(".implicit-popover", HTMLElement),
    rtlTrigger: pick(".rtl-trigger", HTMLButtonElement),
    rtlPopover: pick(".rtl-popover", HTMLElement),
  };
  return {
    root,
    ...els,
    placement: (pair) => {
      const [trigger, popover] = pairSelectors[pair];
      const t = pick(trigger, HTMLElement).getBoundingClientRect();
      const p = pick(popover, HTMLElement).getBoundingClientRect();
      return {
        below: near(p.top, t.bottom),
        above: near(p.bottom, t.top),
        leftEdgesAligned: near(p.left, t.left),
        rightEdgesAligned: near(p.right, t.right),
      };
    },
    runningTransitions: () => {
      const properties: string[] = [];
      for (const a of els.popover.getAnimations()) {
        if (a instanceof CSSTransition && a.playState === "running")
          properties.push(a.transitionProperty);
      }
      return properties.toSorted();
    },
    destroy: () => {
      root.remove();
    },
  };
}

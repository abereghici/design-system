// Spike #4: what popover + invoker commands + CSS anchor positioning do in each engine.
// Where engines differ, the expected value is a per-engine literal observed in this
// spike, so a test fails as soon as an engine's behaviour changes.
// Findings and sources: docs/research/floating-platform.md.
import { beforeEach, describe, expect, test } from "vitest";
import { server, userEvent } from "vitest/browser";

import { mountFixture, type Fixture, type Placement } from "./fixture.ts";

const perEngine = <T>(values: Readonly<{ chromium: T; firefox: T; webkit: T }>): T | undefined =>
  (values as Readonly<Record<string, T>>)[server.browser];

let fx: Fixture;

beforeEach(() => {
  fx = mountFixture();
  return () => {
    fx.destroy();
  };
});

describe("invoker commands", () => {
  test("toggle-popover on a commandfor button opens, hide-popover closes", async () => {
    await userEvent.click(fx.trigger);
    expect(fx.popover.matches(":popover-open")).toBe(true);

    await userEvent.click(fx.closeButton);
    expect(fx.popover.matches(":popover-open")).toBe(false);
  });
});

describe("popover=auto: Escape and focus return", () => {
  test("Escape closes it and returns focus to a keyboard-activated invoker", async () => {
    fx.trigger.focus();
    await userEvent.keyboard("{Enter}");
    expect(fx.popover.matches(":popover-open")).toBe(true);
    fx.closeButton.focus();

    await userEvent.keyboard("{Escape}");

    expect(fx.popover.matches(":popover-open")).toBe(false);
    expect(document.activeElement).toBe(fx.trigger);
  });

  test("after a mouse-activated open, Escape restores only the focus that existed before opening", async () => {
    await userEvent.click(fx.trigger);
    // WebKit does not focus a <button> on click, so <body> had focus before opening.
    expect(document.activeElement === fx.trigger).toBe(
      perEngine({ chromium: true, firefox: true, webkit: false }),
    );
    fx.closeButton.focus();

    await userEvent.keyboard("{Escape}");

    expect(fx.popover.matches(":popover-open")).toBe(false);
    // WebKit has nothing to restore, so focus stays on the now-hidden close button.
    expect({
      trigger: document.activeElement === fx.trigger,
      close: document.activeElement === fx.closeButton,
    }).toEqual(
      perEngine({
        chromium: { trigger: true, close: false },
        firefox: { trigger: true, close: false },
        webkit: { trigger: false, close: true },
      }),
    );
  });
});

describe("popover=auto: light dismiss", () => {
  test("clicking outside light-dismisses it", async () => {
    await userEvent.click(fx.trigger);

    await userEvent.click(fx.outside);

    expect(fx.popover.matches(":popover-open")).toBe(false);
  });

  test("clicking inside does not dismiss it", async () => {
    await userEvent.click(fx.trigger);

    await userEvent.click(fx.inside);

    expect(fx.popover.matches(":popover-open")).toBe(true);
  });
});

const belowStart: Placement = {
  below: true,
  above: false,
  leftEdgesAligned: true,
  rightEdgesAligned: false,
};
const aboveStart: Placement = {
  below: false,
  above: true,
  leftEdgesAligned: true,
  rightEdgesAligned: false,
};
const belowEndRtl: Placement = {
  below: true,
  above: false,
  leftEdgesAligned: false,
  rightEdgesAligned: true,
};
const aboveEndRtl: Placement = {
  below: false,
  above: true,
  leftEdgesAligned: false,
  rightEdgesAligned: true,
};
// Firefox puts the popover below the anchor but outside the position-area cell inline-wise.
const firefoxRtlArea: Placement = {
  below: true,
  above: false,
  leftEdgesAligned: false,
  rightEdgesAligned: false,
};

describe("CSS anchor positioning", () => {
  test("position-anchor + position-area place the popover below the trigger, start-aligned", async () => {
    await userEvent.click(fx.trigger);

    expect(fx.placement("explicit")).toEqual(belowStart);
  });

  test("position-try-fallbacks: flip-block moves it above a trigger at the bottom of the viewport", async () => {
    fx.root.classList.add("at-bottom");
    await userEvent.click(fx.trigger);

    expect(fx.placement("explicit")).toEqual(aboveStart);
  });

  test("a popover opened by a commandfor invoker anchors to it implicitly, with no anchor-name", async () => {
    await userEvent.click(fx.implicitTrigger);

    expect(fx.placement("implicit")).toEqual(belowStart);
  });
});

describe("dir=rtl on <html>", () => {
  beforeEach(() => {
    document.documentElement.dir = "rtl";
    return () => {
      document.documentElement.removeAttribute("dir");
    };
  });

  test("plain logical position-area keywords mirror when the whole document is rtl", async () => {
    await userEvent.click(fx.implicitTrigger);

    expect(fx.placement("implicit")).toEqual(belowEndRtl);
  });
});

describe("dir in the top layer: inheritance and position-area", () => {
  test("a popover inside a dir=rtl subtree inherits rtl from its DOM parent", async () => {
    await userEvent.click(fx.rtlTrigger);

    expect(fx.rtlPopover.matches(":dir(rtl)")).toBe(true);
    expect(getComputedStyle(fx.rtlPopover).direction).toBe("rtl");
  });

  test("plain logical position-area keywords follow the containing block (the LTR viewport)", async () => {
    await userEvent.click(fx.rtlTrigger);

    // span-inline-end spans physically rightwards, as in LTR: start (left) edges align.
    expect(fx.placement("rtl")).toEqual(
      perEngine({ chromium: belowStart, firefox: firefoxRtlArea, webkit: belowStart }),
    );
  });

  test("self-* position-area keywords follow the popover's own (rtl) direction", async () => {
    fx.rtlPopover.classList.add("self");
    await userEvent.click(fx.rtlTrigger);

    // span-self-inline-end spans leftwards: right edges align.
    expect(fx.placement("rtl")).toEqual(
      perEngine({ chromium: belowEndRtl, firefox: firefoxRtlArea, webkit: belowEndRtl }),
    );
  });
});

describe("anchor() recipe", () => {
  test("anchor() on logical insets with self-* sides places it below, start-aligned, in LTR", async () => {
    fx.implicitPopover.classList.add("anchor-fn");
    await userEvent.click(fx.implicitTrigger);

    expect(fx.placement("implicit")).toEqual(belowStart);
  });

  test("anchor() on logical insets with self-* sides mirrors in an rtl subtree", async () => {
    fx.rtlPopover.classList.add("anchor-fn");
    await userEvent.click(fx.rtlTrigger);

    expect(fx.placement("rtl")).toEqual(belowEndRtl);
  });

  test("anchor() insets flip with position-try-fallbacks: flip-block", async () => {
    fx.rtlPopover.classList.add("anchor-fn");
    fx.root.classList.add("at-bottom");
    await userEvent.click(fx.rtlTrigger);

    expect(fx.placement("rtl")).toEqual(aboveEndRtl);
  });
});

describe("motion", () => {
  test("@starting-style gives the popover an entry transition", async () => {
    fx.popover.classList.add("animated");
    await userEvent.click(fx.trigger);

    expect(fx.runningTransitions()).toContain("opacity");
  });

  test("exit: what is still running and rendered right after hidePopover()", async () => {
    fx.popover.classList.add("animated");
    await userEvent.click(fx.trigger);
    await expect.poll(() => fx.runningTransitions()).toEqual([]);

    fx.popover.hidePopover();

    const style: CSSStyleDeclaration & { overlay?: string } = getComputedStyle(fx.popover);
    // Only Chromium keeps the popover rendered and in the top layer (`overlay: auto`) while
    // it fades out. Firefox and WebKit have no `overlay` property and compute
    // `display: none` at once, so no exit transition runs: the exit is instant.
    expect({
      fading: fx.runningTransitions().includes("opacity"),
      rendered: style.display !== "none",
      overlay: style.overlay,
    }).toEqual(
      perEngine({
        chromium: { fading: true, rendered: true, overlay: "auto" },
        firefox: { fading: false, rendered: false, overlay: undefined },
        webkit: { fading: false, rendered: false, overlay: undefined },
      }),
    );
  });
});

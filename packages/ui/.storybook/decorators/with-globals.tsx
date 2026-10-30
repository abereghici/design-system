import { StrictMode } from "react";
import { useEffect } from "storybook/preview-api";

import type { Decorator } from "@storybook/react-vite";

import { UIProvider } from "@abereghici/ui/ui-provider";

import { applyGlobals, localeOf } from "../globals.tsx";

/** Applies the toolbar's Theme, Direction and Locale, and renders the story as an app would. */
export const withGlobals: Decorator = function WithGlobals(Story, { globals }) {
  useEffect(() => {
    applyGlobals(globals);
  }, [globals]);

  // The framework's `strictMode` option reaches only Storybook's iframe HTML, never the Vitest
  // addon's runs, so the decorator applies it to both:
  // https://github.com/storybookjs/storybook/blob/v10.6.3/code/builders/builder-vite/src/transform-iframe-html.ts
  return (
    <StrictMode>
      <UIProvider locale={localeOf(globals)}>
        <Story />
      </UIProvider>
    </StrictMode>
  );
};

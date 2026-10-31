import { Button } from "@abereghici/ui/button";

import preview from "#.storybook/preview.tsx";

import { Inline } from "./inline.tsx";

const meta = preview.meta({
  title: "Components/Inline",
  component: Inline,
  args: {
    children: (
      <>
        <Button variant="primary">Publish</Button>
        <Button>Save draft</Button>
        <Button variant="tertiary">Discard</Button>
      </>
    ),
  },
});

export const Default = meta.story({});

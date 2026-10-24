import preview from "#.storybook/preview.tsx";

import { Personality } from "./brand.tsx";

const meta = preview.meta({ title: "Foundations/Personality", tags: ["!autodocs"] });

export const Motifs = meta.story({ render: () => <Personality /> });

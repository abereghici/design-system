import { mountFixture } from "./fixture.ts";

// Manual test page: the explicit-anchor popover animates, the RTL one uses the portable anchor() recipe.
const fx = mountFixture();
fx.popover.classList.add("animated");
fx.rtlPopover.classList.add("anchor-fn");

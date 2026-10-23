import { Button } from "@platform/spike-ui-pkg/button";
import { CheckIcon } from "@platform/spike-ui-pkg/icons/check";

// Uses Button and CheckIcon only. Card, Dialog, CloseIcon and StarIcon must not ship.
export default function Page() {
  return (
    <main>
      <Button>
        <CheckIcon /> Count
      </Button>
    </main>
  );
}

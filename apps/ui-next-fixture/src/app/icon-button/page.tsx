import { IconButton } from "@platform/ui/icon-button";
import { PinIcon } from "@platform/ui/icons/pin";

export default function Page() {
  return (
    <main>
      <IconButton aria-label="Pin" defaultPressed={false}>
        <PinIcon />
      </IconButton>
    </main>
  );
}

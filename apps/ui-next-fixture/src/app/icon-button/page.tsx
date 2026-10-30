import { IconButton } from "@abereghici/ui/icon-button";
import { PinIcon } from "@abereghici/ui/icons/pin";

export default function Page() {
  return (
    <main>
      <IconButton aria-label="Pin" defaultPressed={false}>
        <PinIcon />
      </IconButton>
    </main>
  );
}

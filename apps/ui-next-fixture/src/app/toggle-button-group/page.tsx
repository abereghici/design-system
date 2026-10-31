import { ToggleButton } from "@abereghici/ui/toggle-button";
import { ToggleButtonGroup } from "@abereghici/ui/toggle-button-group";

export default function Page() {
  return (
    <main>
      <ToggleButtonGroup aria-label="Text style" selectionMode="multiple" defaultValue={["bold"]}>
        <ToggleButton value="bold">Bold</ToggleButton>
        <ToggleButton value="italic">Italic</ToggleButton>
      </ToggleButtonGroup>
    </main>
  );
}

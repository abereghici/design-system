import { Meter } from "@platform/ui/meter";

export default function Page() {
  return (
    <main>
      <Meter value={42} label="Storage" />
    </main>
  );
}

import { NumberField } from "@platform/ui/number-field";

export default function Page() {
  return (
    <main>
      <NumberField
        label="Seats"
        name="seats"
        defaultValue={5}
        min={1}
        max={50}
        incrementLabel="Increase"
        decrementLabel="Decrease"
      />
    </main>
  );
}

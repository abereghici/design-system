import { NumberField } from "@abereghici/ui/number-field";

export default function Page() {
  return (
    <main>
      <form>
        <NumberField
          label="Seats"
          name="seats"
          defaultValue={5}
          min={1}
          max={50}
          incrementLabel="Increase"
          decrementLabel="Decrease"
        />
        <button>Submit</button>
      </form>
    </main>
  );
}

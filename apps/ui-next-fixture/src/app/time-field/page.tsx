import { TimeField } from "@abereghici/ui/time-field";

export default function Page() {
  return (
    <main>
      <form>
        <TimeField
          label="Start time"
          name="start"
          required
          incompleteMessage="Enter a complete time"
        />
        <button>Submit</button>
      </form>
    </main>
  );
}

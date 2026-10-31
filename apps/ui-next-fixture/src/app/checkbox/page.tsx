import { Checkbox } from "@abereghici/ui/checkbox";

export default function Page() {
  return (
    <main>
      <form>
        <Checkbox name="updates">Email me updates</Checkbox>
        <button>Submit</button>
      </form>
    </main>
  );
}

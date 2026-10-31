import { Switch } from "@abereghici/ui/switch";

export default function Page() {
  return (
    <main>
      <form>
        <Switch name="sound">Sound</Switch>
        <button>Submit</button>
      </form>
    </main>
  );
}

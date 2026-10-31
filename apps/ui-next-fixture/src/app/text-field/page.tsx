import { TextField } from "@abereghici/ui/text-field";

export default function Page() {
  return (
    <main>
      <form>
        <TextField label="Email" name="email" type="email" description="We reply within a day." />
        <button>Submit</button>
      </form>
    </main>
  );
}

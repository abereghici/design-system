import { PasswordField } from "@abereghici/ui/password-field";

export default function Page() {
  return (
    <main>
      <form>
        <PasswordField label="Password" name="password" required toggleLabel="Show password" />
        <button>Submit</button>
      </form>
    </main>
  );
}

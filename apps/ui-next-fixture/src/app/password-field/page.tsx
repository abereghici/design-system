import { PasswordField } from "@abereghici/ui/password-field";

export default function Page() {
  return (
    <main>
      <PasswordField label="Password" name="password" required toggleLabel="Show password" />
    </main>
  );
}

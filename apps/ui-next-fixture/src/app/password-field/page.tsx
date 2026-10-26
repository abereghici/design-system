import { PasswordField } from "@platform/ui/password-field";

export default function Page() {
  return (
    <main>
      <PasswordField label="Password" name="password" required />
    </main>
  );
}

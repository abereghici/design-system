import { OTPField } from "@abereghici/ui/otp-field";

export default function Page() {
  return (
    <main>
      <form>
        <OTPField label="Verification code" name="code" description="Sent to your phone." />
        <button>Submit</button>
      </form>
    </main>
  );
}

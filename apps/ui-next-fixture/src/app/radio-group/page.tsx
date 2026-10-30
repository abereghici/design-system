import { RadioGroup } from "@abereghici/ui/radio-group";

export default function Page() {
  return (
    <main>
      <RadioGroup.Root name="plan" defaultValue="yearly">
        <RadioGroup.Label>Plan</RadioGroup.Label>
        <RadioGroup.Item value="monthly">Monthly</RadioGroup.Item>
        <RadioGroup.Item value="yearly">Yearly</RadioGroup.Item>
      </RadioGroup.Root>
    </main>
  );
}

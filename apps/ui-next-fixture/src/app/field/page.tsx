import { Field } from "@platform/ui/field";

export default function Page() {
  return (
    <main>
      <Field.Root name="handle">
        <Field.Label>Handle</Field.Label>
        <Field.Control required />
        <Field.Description>Letters and digits.</Field.Description>
        <Field.Error />
      </Field.Root>
    </main>
  );
}

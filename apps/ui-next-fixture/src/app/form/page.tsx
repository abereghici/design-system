import { Form } from "@abereghici/ui/form";

export default function Page() {
  return (
    <main>
      <Form aria-label="Search" action="/search">
        <input name="q" aria-label="Query" required />
      </Form>
    </main>
  );
}

import { TextArea } from "@abereghici/ui/text-area";

export default function Page() {
  return (
    <main>
      <form>
        <TextArea label="Message" name="message" description="Grows with your text." />
        <button>Submit</button>
      </form>
    </main>
  );
}

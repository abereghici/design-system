import { Avatar } from "@abereghici/ui/avatar";

export default function Page() {
  return (
    <main>
      <Avatar.Root>
        <Avatar.Image src="/missing.jpg" alt="Ana Popescu" />
        <Avatar.Fallback name="Ana Popescu" />
      </Avatar.Root>
    </main>
  );
}

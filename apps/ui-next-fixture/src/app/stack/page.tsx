import { Stack } from "@abereghici/ui/stack";

export default function Page() {
  return (
    <main>
      <Stack gap="stack-lg" asChild>
        <ul>
          <li>Profile</li>
          <li>Security</li>
        </ul>
      </Stack>
    </main>
  );
}

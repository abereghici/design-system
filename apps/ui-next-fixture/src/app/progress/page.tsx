import { Progress } from "@platform/ui/progress";

export default function Page() {
  return (
    <main>
      <Progress value={40} label="Se încarcă" />
    </main>
  );
}

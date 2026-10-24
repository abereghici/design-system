import { Card } from "@platform/ui/card";

export default function Page() {
  return (
    <main>
      <Card.Root layout="row">
        <Card.Header>
          <Card.Title asChild>
            <h1>API keys</h1>
          </Card.Title>
          <Card.Description>2 active</Card.Description>
        </Card.Header>
      </Card.Root>
    </main>
  );
}

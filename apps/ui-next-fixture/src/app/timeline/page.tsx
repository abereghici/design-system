import { Timeline } from "@abereghici/ui/timeline";

export default function Page() {
  return (
    <main>
      <Timeline.Root aria-label="Work history" active={0}>
        <Timeline.Item>Front-end engineer, 2016 – 2021</Timeline.Item>
        <Timeline.Item>Design system lead, 2021 – now</Timeline.Item>
      </Timeline.Root>
    </main>
  );
}

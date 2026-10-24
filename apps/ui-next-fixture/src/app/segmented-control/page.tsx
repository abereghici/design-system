import { SegmentedControl } from "@platform/ui/segmented-control";

export default function Page() {
  return (
    <main>
      <SegmentedControl.Root aria-label="View" defaultValue="list">
        <SegmentedControl.Item value="list">List</SegmentedControl.Item>
        <SegmentedControl.Item value="board">Board</SegmentedControl.Item>
      </SegmentedControl.Root>
    </main>
  );
}

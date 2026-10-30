import { SegmentedControl } from "@abereghici/ui/segmented-control";

export default function Page() {
  return (
    <main>
      <form>
        <SegmentedControl.Root aria-label="View" name="view" defaultValue="list">
          <SegmentedControl.Item value="list">List</SegmentedControl.Item>
          <SegmentedControl.Item value="board">Board</SegmentedControl.Item>
        </SegmentedControl.Root>
        <button>Submit</button>
      </form>
    </main>
  );
}

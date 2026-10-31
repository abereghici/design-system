import { TagGroup } from "@abereghici/ui/tag-group";

export default function Page() {
  return (
    <main>
      <TagGroup.Root aria-label="Filters" removeLabel="Remove" defaultValue={["draft", "live"]}>
        <TagGroup.Tag value="draft">Draft</TagGroup.Tag>
        <TagGroup.Tag value="live" variant="success">
          Live
        </TagGroup.Tag>
      </TagGroup.Root>
    </main>
  );
}

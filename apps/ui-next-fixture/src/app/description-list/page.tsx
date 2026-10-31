import { DescriptionList } from "@abereghici/ui/description-list";

export default function Page() {
  return (
    <main>
      <DescriptionList.Root>
        <DescriptionList.Item>
          <DescriptionList.Term>Order</DescriptionList.Term>
          <DescriptionList.Details>#4821</DescriptionList.Details>
        </DescriptionList.Item>
        <DescriptionList.Item>
          <DescriptionList.Term>Placed</DescriptionList.Term>
          <DescriptionList.Details>12 March 2026</DescriptionList.Details>
        </DescriptionList.Item>
      </DescriptionList.Root>
    </main>
  );
}

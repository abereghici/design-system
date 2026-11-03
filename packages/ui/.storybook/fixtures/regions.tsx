import { Select } from "@abereghici/ui/select";

/** A region name too long for its Select, and a list as long as a region list gets. */
export const longRegions = (
  <>
    <Select.Item value="ba">
      Bosnia and Herzegovina — Federation of Bosnia and Herzegovina (Sarajevo data centre)
    </Select.Item>
    <Select.Item value="eu">Europe</Select.Item>
  </>
);

export const manyRegions = Array.from({ length: 250 }, (_, index) => (
  <Select.Item key={index} value={`region-${index}`}>
    {`Region ${index + 1}`}
  </Select.Item>
));

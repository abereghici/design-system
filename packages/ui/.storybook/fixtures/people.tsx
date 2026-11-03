import { Combobox } from "@abereghici/ui/combobox";
import { UserIcon } from "@abereghici/ui/icons/user";

/** A Combobox option for a person, matched by name and by any `keywords`. */
export const person = (value: string, name: string, keywords?: string[]) => (
  <Combobox.Item key={value} value={value} {...(keywords && { keywords })}>
    <UserIcon />
    {name}
  </Combobox.Item>
);

/** Realistic worst-case names: long, unbreakable, one-letter and accented. */
export const longPeople = [
  person("ab", "Alexandru Bereghici"),
  person("aw", "Aleksandra Wiśniewska-Kowalczyk"),
  person("bf", "bartholomew.fitzgerald@northwind-industries-holdings.example.com"),
  person("jo", "Jo"),
  person("nt", "Nguyễn Thị Ánh"),
];

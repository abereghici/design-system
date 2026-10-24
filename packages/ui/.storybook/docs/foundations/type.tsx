import { cssVar, Rules, Section, TokenTable } from "./docs.tsx";
import { describe, tokens, type Token } from "./tokens.ts";
import styles from "./type.module.css";

const SPECIMEN_TEXT = "Stâlpul cerului ține cerul: 1 234,50 lei";

const roles = () => tokens("semantic", /^type-[a-z]+-[a-z0-9]+$/v);

// `font` can't set letter spacing, text transform or numeric figures, so each is its own `type-*-<property>` token.
const subToken = (role: string, property: string) =>
  tokens("semantic", new RegExp(`^${role}-${property}$`, "v")).length > 0
    ? cssVar(`${role}-${property}`)
    : undefined;

const roleStyle = (role: string) => ({
  font: cssVar(role),
  letterSpacing: cssVar(`${role}-letter-spacing`),
  textTransform: subToken(role, "text-transform"),
  fontVariantNumeric: subToken(role, "font-variant-numeric"),
});

function Members({ role }: { role: Token }) {
  const members = Object.entries(
    typeof role.value === "object" && role.value !== null ? role.value : {},
  );
  return (
    <ul className={styles["members"]}>
      {members.map(([property, value]) => (
        <li key={property}>
          {property} <code>{describe(value)}</code>
        </li>
      ))}
    </ul>
  );
}

export function TypeRoles() {
  return (
    <Section
      title="Type roles"
      lead="Set text by its role (heading, body, label, data, code) so size, weight and line height stay in sync. Two weights: regular for reading, medium for headings, labels and emphasis."
    >
      <table className={styles["specimens"]}>
        <caption>Type roles</caption>
        <thead>
          <tr>
            <th scope="col">Role</th>
            <th scope="col">Specimen</th>
            <th scope="col">Members</th>
          </tr>
        </thead>
        <tbody>
          {roles().map((role) => (
            <tr key={role.name}>
              <th scope="row">
                <code>--ab-{role.name}</code>
              </th>
              <td>
                <span lang="ro" className={styles["specimen"]} style={roleStyle(role.name)}>
                  {SPECIMEN_TEXT}
                </span>
                <span className={styles["usage"]}>{role.description}</span>
              </td>
              <td>
                <Members role={role} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

const familyPreview = (row: Token) => (
  <span lang="ro" style={{ fontFamily: cssVar(row.name) }} className={styles["family"]}>
    Ăă Ââ Îî Șș Țț
  </span>
);

export function Families() {
  return (
    <Section title="Families">
      <Rules
        items={[
          ["Noto Serif", "Headings and display statements."],
          ["Figtree", "Body, labels, data and overlines."],
          ["System monospace", "Code (no webfont)."],
          [
            "Follow the reader",
            "Text follows the user's default size. Larger steps scale fluidly with the screen, never by viewport alone.",
          ],
        ]}
      />
      <TokenTable
        caption="Font families"
        rows={tokens("primitive", /^font-family-/v)}
        preview={familyPreview}
      />
    </Section>
  );
}

const sizePreview = (row: Token) => (
  <span style={{ fontSize: cssVar(row.name) }} className={styles["family"]}>
    Ag
  </span>
);

export function FontSizes() {
  return (
    <Section
      title="Font size scale"
      lead="Name = px value; a range is fluid between 360px and 1280px viewports. rem follows the user's default size; max ÷ min ≤ 1.14, so 200% zoom always works."
    >
      <TokenTable
        caption="Font sizes"
        rows={tokens("primitive", /^font-size-/v)}
        preview={sizePreview}
      />
    </Section>
  );
}

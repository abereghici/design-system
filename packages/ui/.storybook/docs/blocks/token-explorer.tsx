import { useDeferredValue, useState } from "react";

import { Select } from "@abereghici/ui/select";
import { Sheet } from "@abereghici/ui/sheet";
import { Table } from "@abereghici/ui/table";

import { Count, explorer, Search } from "./explorer.tsx";
import { Inspector } from "./token-inspector.tsx";
import { Previews, TokenLink, Values } from "./token-values.tsx";
import type { Inspect } from "./token-values.tsx";
import { tiers, tokens } from "./tokens.ts";
import type { Tier, Token } from "./tokens.ts";
import styles from "./token-explorer.module.css";

const groupsOf = (tier: Tier) => [
  ...new Set(tokens.filter((token) => token.tier === tier).map(({ group }) => group)),
];

function TokenTable({ rows, onInspect }: { rows: readonly Token[]; onInspect: Inspect }) {
  return (
    <Table.Root className={styles["table"]}>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Token</Table.ColumnHeader>
          <Table.ColumnHeader>Value</Table.ColumnHeader>
          <Table.ColumnHeader>Preview</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {rows.map((token) => (
          <Table.Row key={token.name}>
            <Table.RowHeader>
              <TokenLink token={token} onInspect={onInspect} />
              {token.description !== "" && (
                <span className={styles["description"]}>{token.description}</span>
              )}
            </Table.RowHeader>
            <Table.Cell>
              <Values token={token} />
            </Table.Cell>
            <Table.Cell>
              <Previews token={token} />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

interface FiltersProps {
  readonly query: string;
  readonly tier: Tier;
  readonly group: string;
  readonly onQueryChange: (query: string) => void;
  readonly onTierChange: (tier: Tier) => void;
  readonly onGroupChange: (group: string) => void;
}

function Filters({ query, tier, group, onQueryChange, onTierChange, onGroupChange }: FiltersProps) {
  return (
    <div className={explorer["filters"]}>
      <Search
        label="Search tokens"
        placeholder="Search by name, value or usage"
        value={query}
        onValueChange={onQueryChange}
      />
      <Select.Root
        label="Tier"
        value={tier}
        onValueChange={(value) => {
          onTierChange(tiers.find(([key]) => key === value)?.[0] ?? "semantic");
        }}
      >
        {tiers.map(([key, label]) => (
          <Select.Item key={key} value={key}>
            {label}
          </Select.Item>
        ))}
      </Select.Root>
      <Select.Root
        label={tier === "component" ? "Component" : "Family"}
        value={group}
        onValueChange={onGroupChange}
      >
        <Select.Item value="">All</Select.Item>
        {groupsOf(tier).map((key) => (
          <Select.Item key={key} value={key}>
            {key}
          </Select.Item>
        ))}
      </Select.Root>
    </div>
  );
}

/** Searches, filters and inspects every token the packages ship. */
export function TokenExplorer() {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<Tier>("semantic");
  const [group, setGroup] = useState("");
  const [inspected, setInspected] = useState<Token>();
  const search = useDeferredValue(query.trim().toLowerCase());
  const rows = tokens.filter(
    (token) =>
      token.tier === tier &&
      (group === "" || token.group === group) &&
      token.search.includes(search),
  );

  return (
    <div className={`sb-unstyled ${explorer["root"]}`}>
      <Filters
        query={query}
        tier={tier}
        group={group}
        onQueryChange={setQuery}
        onTierChange={(value) => {
          setTier(value);
          setGroup("");
        }}
        onGroupChange={setGroup}
      />
      <Count count={rows.length} noun="token" />
      <TokenTable rows={rows} onInspect={setInspected} />
      <Sheet.Root
        open={inspected !== undefined}
        onOpenChange={(open) => {
          if (!open) setInspected(undefined);
        }}
      >
        <Sheet.Content>
          {inspected && (
            <Inspector key={inspected.name} token={inspected} onInspect={setInspected} />
          )}
        </Sheet.Content>
      </Sheet.Root>
    </div>
  );
}

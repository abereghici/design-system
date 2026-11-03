import { Tree } from "@abereghici/ui/tree";

/** Folders nested four deep, holding file names longer than the Tree is wide. */
export const deepFolders = {
  defaultExpandedKeys: ["a", "b", "c", "d"],
  children: (
    <Tree.Item id="a" label="northwind-industries-holdings">
      <Tree.Item id="b" label="workspaces">
        <Tree.Item id="c" label="1284">
          <Tree.Item id="d" label="documents">
            <Tree.Item id="e" label="q3-2026-board-pack-final-revised-v12-with-appendices.pdf" />
            <Tree.Item id="f" label="Datenschutzgrundverordnungsbeauftragte.docx" />
          </Tree.Item>
        </Tree.Item>
      </Tree.Item>
    </Tree.Item>
  ),
};

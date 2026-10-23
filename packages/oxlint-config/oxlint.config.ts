import { defineConfig } from "oxlint";

import base from "./src/base.ts";
import node from "./src/node.ts";

export default defineConfig({
  extends: [base, node],
});

import base from "@platform/oxlint-config/base";
import node from "@platform/oxlint-config/node";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base, node],
});

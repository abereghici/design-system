import base from "@platform/oxlint-config/base";
import react from "@platform/oxlint-config/react";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base, react],
});

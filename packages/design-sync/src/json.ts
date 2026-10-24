import { readFile } from "node:fs/promises";

/** A JSON object, checked only for being one. */
export type JsonObject = Readonly<Record<string, unknown>>;

export const isObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Reads a JSON file that must hold an object. */
export async function readJsonObject(file: string): Promise<JsonObject> {
  const value: unknown = JSON.parse(await readFile(file, "utf8"));
  if (!isObject(value)) throw new Error(`${file} does not hold a JSON object`);
  return value;
}

/** A string member of a JSON object, or a thrown error naming it. */
export function stringIn(object: JsonObject, key: string, where: string): string {
  const value = object[key];
  if (typeof value !== "string") throw new Error(`${where} has no string "${key}"`);
  return value;
}

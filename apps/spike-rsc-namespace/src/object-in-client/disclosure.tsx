"use client";

// SPIKE (expected to fail): the Parts are properties of one object exported from a
// `'use client'` module, so the server only sees one client reference, `Disclosure`.
import { Content, Root, Trigger } from "../disclosure/parts";

export const Disclosure = { Root, Trigger, Content };

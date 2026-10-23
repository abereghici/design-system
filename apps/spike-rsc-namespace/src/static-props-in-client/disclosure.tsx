"use client";

// SPIKE (expected to fail): Parts attached as static properties of the Root component
// (`Menu.Button` style), exported from a `'use client'` module.
import { Content, Root, Trigger } from "../disclosure/parts";

export const Disclosure = Object.assign(Root, { Root, Trigger, Content });

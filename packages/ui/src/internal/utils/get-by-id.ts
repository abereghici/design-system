/**
 * The element with this id, as Zag's `getById` finds it. The id may be the consumer's, so it is
 * escaped as a selector.
 */
export const getById = (id: string) => document.querySelector<HTMLElement>(`#${CSS.escape(id)}`);

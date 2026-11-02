/** Marks pointer-initiated changes with `data-pointer`, so keyboard changes skip the motion. */
export const pointerMarker = {
  onPointerDown: (event: { readonly currentTarget: HTMLElement }) => {
    event.currentTarget.dataset["pointer"] = "";
  },
  onKeyDown: (event: { readonly currentTarget: HTMLElement }) => {
    delete event.currentTarget.dataset["pointer"];
  },
};

/**
 * Records every `type` event that reaches `document`, the way an app-level feedback listener
 * would hear it. Story tests only; not exported from the package.
 */
export function listen<Type extends keyof DocumentEventMap>(type: Type) {
  const events: DocumentEventMap[Type][] = [];
  const record = (event: DocumentEventMap[Type]) => {
    events.push(event);
  };
  document.addEventListener(type, record);
  return {
    events,
    stop: () => {
      document.removeEventListener(type, record);
    },
  };
}

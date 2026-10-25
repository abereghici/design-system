/**
 * A component's Built-in labels: the consumer's `labels` over the locale's over the en-US
 * `defaults` the component imports itself, so each component ships only its own namespace. Not a
 * client module, so a Server Component, which can't read the Provider, passes its `locale` prop.
 */
export function labelsOf<Namespace extends object>(
  defaults: Namespace,
  locale: Partial<Namespace> | undefined,
  labels: Partial<Namespace> | undefined,
): Namespace {
  return { ...defaults, ...locale, ...labels };
}

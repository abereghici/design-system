const typeMatches = (token: string, type: string) =>
  token.endsWith("/*") ? type.startsWith(token.slice(0, -1)) : type === token;

/**
 * Whether files match an `accept` list of MIME types, `type/*` wildcards and `.ext` extensions.
 * During a drag only MIME types are known, so an extension token can't reject anything yet.
 */
export function acceptMatcher(accept: string | undefined) {
  const tokens = accept?.split(",").flatMap((token) => token.trim().toLowerCase() || []) ?? [];

  return {
    couldAccept: (items: DataTransferItemList) =>
      tokens.length === 0 ||
      [...items].some(
        ({ type }) =>
          type === "" || tokens.some((token) => token.startsWith(".") || typeMatches(token, type)),
      ),
    accepts: (file: File) =>
      tokens.length === 0 ||
      tokens.some((token) =>
        token.startsWith(".")
          ? file.name.toLowerCase().endsWith(token)
          : typeMatches(token, file.type.toLowerCase()),
      ),
  };
}

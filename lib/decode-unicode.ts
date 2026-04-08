/**
 * Decodes Unicode escape sequences (\uXXXX) in a string.
 * Useful for rendering legal text that contains escaped Unicode characters.
 *
 * Example: "R\\u00e8glement" -> "Reglement"
 */
export function decodeUnicodeEscapes(str: string): string {
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
}

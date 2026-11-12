/** Development-only fallback. Refused in production so sessions can never be signed with a key that is public in the source. */
const DEV_SECRET = "dev-only-secret-7f3c9a1e4b6d8f2a5c7e9b1d3f5a7c9e";
const PLACEHOLDER = "change-me-to-a-long-random-string";

/** Key that signs admin sessions. Safe to import from the proxy (no Node-only APIs). */
export function authSecretKey(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 32 && s !== PLACEHOLDER) return new TextEncoder().encode(s);
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is missing, too short (min 32 characters) or still the example value. Set a long random AUTH_SECRET on the server.");
  }
  return new TextEncoder().encode(s || DEV_SECRET);
}

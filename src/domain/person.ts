/** How a person is named on screen. They set a full name; until then the start of their email stands in. */
export function displayName(fullName: string | null | undefined, email: string | null | undefined): string {
  const name = fullName?.trim();
  if (name) return name;
  const local = email?.split("@")[0]?.trim();
  return local || "there";
}

/** First word of a display name, for greetings ("Welcome, Henry"). */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

/** Up to two uppercase letters for an avatar: the first letters of the first two words. */
export function initials(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase());
  return letters.join("") || "?";
}

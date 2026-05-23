export type MentionableUser = {
  id: string;
  name: string;
  email: string;
};

export function mentionSlug(user: MentionableUser): string {
  return user.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9.]/g, "");
}

const MENTION_REGEX = /@([\w.\u00C0-\u024F]+)/gi;

export function parseMentionIds(body: string, users: MentionableUser[]): string[] {
  const ids = new Set<string>();
  let match: RegExpExecArray | null;
  const re = new RegExp(MENTION_REGEX.source, MENTION_REGEX.flags);
  while ((match = re.exec(body)) !== null) {
    const q = match[1].toLowerCase();
    const found = users.find((u) => {
      const slug = mentionSlug(u);
      const emailUser = u.email.split("@")[0]?.toLowerCase() ?? "";
      return slug === q || slug.startsWith(q) || emailUser === q || emailUser.startsWith(q);
    });
    if (found) ids.add(found.id);
  }
  return [...ids];
}

export type MentionSegment = { type: "text"; value: string } | { type: "mention"; value: string };

export function splitMentionSegments(body: string): MentionSegment[] {
  const segments: MentionSegment[] = [];
  let last = 0;
  const re = new RegExp(MENTION_REGEX.source, MENTION_REGEX.flags);
  let match: RegExpExecArray | null;
  while ((match = re.exec(body)) !== null) {
    if (match.index > last) {
      segments.push({ type: "text", value: body.slice(last, match.index) });
    }
    segments.push({ type: "mention", value: match[1] });
    last = match.index + match[0].length;
  }
  if (last < body.length) segments.push({ type: "text", value: body.slice(last) });
  return segments.length > 0 ? segments : [{ type: "text", value: body }];
}

import fs from "fs";
import path from "path";

export type NewsletterSubscriber = {
  email: string;
  createdAt: string;
};

const dataPath = path.join(process.cwd(), "src", "data", "newsletter.json");

function readAll(): NewsletterSubscriber[] {
  try {
    const raw = fs.readFileSync(dataPath, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeAll(items: NewsletterSubscriber[]) {
  fs.writeFileSync(dataPath, JSON.stringify(items, null, 2), "utf-8");
}

export function addNewsletterSubscriber(emailRaw: string) {
  const email = String(emailRaw || "").trim().toLowerCase();
  if (!email) {
    return { ok: false as const, reason: "EMAIL_REQUIRED" as const };
  }

  const list = readAll();
  const existing = list.find((item) => item.email === email);
  if (existing) {
    return { ok: true as const, status: "exists" as const, subscriber: existing };
  }

  const subscriber: NewsletterSubscriber = {
    email,
    createdAt: new Date().toISOString(),
  };
  list.unshift(subscriber);
  writeAll(list);

  return { ok: true as const, status: "created" as const, subscriber };
}

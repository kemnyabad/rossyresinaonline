import fs from "fs";
import path from "path";

const runtimePath = path.join(process.cwd(), "data", "reviews.json");

export type ProductReview = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

function ensureReviewsFile() {
  const dir = path.dirname(runtimePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(runtimePath)) fs.writeFileSync(runtimePath, "[]", "utf-8");
}

export function readReviewsStore(): ProductReview[] {
  ensureReviewsFile();
  try {
    const raw = fs.readFileSync(runtimePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ProductReview[]) : [];
  } catch {
    return [];
  }
}

export function writeReviewsStore(data: ProductReview[]) {
  ensureReviewsFile();
  fs.writeFileSync(runtimePath, JSON.stringify(data, null, 2), "utf-8");
}

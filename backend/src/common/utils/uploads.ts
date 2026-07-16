import { mkdir, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_ROOT = join(process.cwd(), "uploads");

export function getUploadsRoot(): string {
  return UPLOAD_ROOT;
}

export function toPublicUploadPath(relativePath: string): string {
  return `/uploads/${relativePath.replace(/\\/g, "/")}`;
}

export async function saveUploadedFile(
  file: Express.Multer.File,
  segments: string[],
): Promise<string> {
  const safeExt = extname(file.originalname).toLowerCase() || ".bin";
  const fileName = `${randomUUID()}${safeExt}`;
  const relativeDir = join(...segments);
  const absoluteDir = join(UPLOAD_ROOT, relativeDir);
  await mkdir(absoluteDir, { recursive: true });
  const relativePath = join(relativeDir, fileName);
  await writeFile(join(UPLOAD_ROOT, relativePath), file.buffer);
  return relativePath.replace(/\\/g, "/");
}

export function parseJsonArrayField(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed.map(String) : value.split(",").map((item) => item.trim()).filter(Boolean);
    } catch {
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
  }

  return [];
}

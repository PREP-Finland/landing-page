import matter from "gray-matter";
import { readFileSync } from "fs";
import { join } from "path";

export function loadMarkdownConfig<T>(relativePath: string): T {
  const filePath = join(process.cwd(), relativePath);
  const content = readFileSync(filePath, "utf-8");
  const { data } = matter(content);
  return data as T;
}

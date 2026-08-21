#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "..");
const pages = [
  ["トップ", "index.html", ""],
  ["札幌", "sapporo/index.html", "札幌"],
  ["千歳", "chitose/index.html", "千歳"],
  ["小樽", "otaru/index.html", "小樽"],
  ["北広島", "kitahiroshima/index.html", "北広島"],
  ["恵庭", "eniwa/index.html", "恵庭"],
];

let failures = 0;
const seenCanonicals = new Set();
const seenOgImages = new Set();

function match(html, pattern) {
  return html.match(pattern)?.[1]?.trim() || "";
}

function visibleText(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function check(condition, message) {
  if (!condition) {
    failures += 1;
    console.error(`  ERROR: ${message}`);
  }
}

for (const [label, file, area] of pages) {
  const fullPath = join(rootDir, file);
  const html = readFileSync(fullPath, "utf8");
  const title = match(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = match(html, /<meta\s+name="description"\s+content="([^"]+)"/i);
  const canonical = match(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i);
  const ogImage = match(html, /<meta\s+property="og:image"\s+content="([^"]+)"/i);
  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h1 = visibleText(h1Matches[0]?.[1] || "");
  const faqCount = [...html.matchAll(/<details\s+class="faq-item"/gi)].length;

  console.log(`${label}: title=${title.length}字, description=${description.length}字, H1="${h1}", FAQ=${faqCount}`);
  check(Boolean(title), "titleがありません");
  check(Boolean(description), "meta descriptionがありません");
  check(h1Matches.length === 1, `H1が${h1Matches.length}個あります`);
  check(!area || h1.includes(area), `H1に地域名「${area}」がありません`);
  check(canonical.startsWith("https://windwoods-stayble.com/"), "canonicalが正規URLではありません");
  check(!seenCanonicals.has(canonical), `canonicalが重複しています: ${canonical}`);
  check(ogImage.startsWith("https://windwoods-stayble.com/assets/og/"), "ページ固有OG画像ではありません");
  check(!seenOgImages.has(ogImage), `OG画像が重複しています: ${ogImage}`);
  check(html.includes('property="og:image:alt"'), "og:image:altがありません");
  check(html.includes('name="twitter:image:alt"'), "twitter:image:altがありません");
  check(faqCount >= 4, "可視FAQが4件未満です");

  seenCanonicals.add(canonical);
  seenOgImages.add(ogImage);

  for (const script of html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(script[1]);
    } catch (error) {
      check(false, `JSON-LDを解析できません: ${error.message}`);
    }
  }

  for (const resource of html.matchAll(/(?:href|src)="(\/[^"?#]+)(?:[?#][^"]*)?"/gi)) {
    const urlPath = resource[1];
    if (urlPath === "/") continue;
    const localPath = urlPath.endsWith("/")
      ? join(rootDir, urlPath.slice(1), "index.html")
      : join(rootDir, urlPath.slice(1));
    check(existsSync(localPath), `参照先がありません: ${urlPath}`);
  }
}

if (failures > 0) {
  console.error(`\nSEO audit failed: ${failures} issue(s).`);
  process.exitCode = 1;
} else {
  console.log("\nSEO audit passed for all 6 pages.");
}

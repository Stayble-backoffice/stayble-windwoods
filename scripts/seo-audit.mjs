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
const organizationId = "https://windwoods-stayble.com/#organization";
const expectedAreaNames = ["札幌市", "千歳市", "小樽市", "北広島市", "恵庭市"];
const expectedPageUrls = pages.map(([, file]) => (
  file === "index.html"
    ? "https://windwoods-stayble.com/"
    : `https://windwoods-stayble.com/${file.replace("index.html", "")}`
));

let failures = 0;
const seenCanonicals = new Set();
const seenOgImages = new Set();
const localBusinessFingerprints = new Set();

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
  const googleTagCount = [...html.matchAll(/googletagmanager\.com\/gtag\/js\?id=AW-18418113981/gi)].length;
  const googleAdsConfigCount = [...html.matchAll(/gtag\('config', 'AW-18418113981'\)/gi)].length;

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
  check(googleTagCount === 1, `Googleタグの読込数が${googleTagCount}件です`);
  check(googleAdsConfigCount === 1, `Google広告configの設定数が${googleAdsConfigCount}件です`);
  check(!html.includes('"@type": "FAQPage"'), "廃止済みのFAQPage構造化データがあります");

  seenCanonicals.add(canonical);
  seenOgImages.add(ogImage);

  const structuredNodes = [];
  for (const script of html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(script[1]);
      if (Array.isArray(data["@graph"])) {
        structuredNodes.push(...data["@graph"]);
      } else {
        structuredNodes.push(data);
      }
    } catch (error) {
      check(false, `JSON-LDを解析できません: ${error.message}`);
    }
  }

  const localBusinesses = structuredNodes.filter((node) => node["@type"] === "LocalBusiness");
  check(localBusinesses.length === 1, `LocalBusinessが${localBusinesses.length}件あります`);
  const localBusiness = localBusinesses[0];
  if (localBusiness) {
    check(localBusiness["@id"] === organizationId, "LocalBusinessの共通@idが不正です");
    check(localBusiness.name === "WindWoods", "LocalBusinessのnameが不正です");
    check(localBusiness.legalName === "株式会社Stayble", "LocalBusinessのlegalNameが不正です");
    check(localBusiness.url === "https://windwoods-stayble.com/", "LocalBusinessのurlが不正です");
    check(localBusiness.telephone === "090-9433-4441", "LocalBusinessの電話番号が不正です");
    check(localBusiness.address?.addressLocality === "札幌市中央区", "LocalBusinessの市区町村が不正です");
    check(localBusiness.address?.streetAddress === "南5条西15丁目2-3-503", "LocalBusinessの住所が不正です");
    check(localBusiness.openingHours === "Mo-Su 10:00-19:00", "LocalBusinessの営業時間が不正です");
    check(localBusiness.priceRange === "¥4,200〜（税込）", "LocalBusinessのpriceRangeが不正です");

    const servedAreas = (localBusiness.areaServed || []).map((entry) => entry.name).sort();
    check(JSON.stringify(servedAreas) === JSON.stringify([...expectedAreaNames].sort()), "LocalBusinessのareaServedが不正です");

    const credential = localBusiness.hasCredential || {};
    check(credential["@type"] === "EducationalOccupationalCredential", "登録資格の@typeが不正です");
    check(credential.credentialCategory === "住宅宿泊管理業者登録", "credentialCategoryが不正です");
    check(credential.name === "国土交通大臣（01）第F06325号", "登録番号が不正です");
    check(credential.recognizedBy?.["@type"] === "GovernmentOrganization", "recognizedByの@typeが不正です");
    check(credential.recognizedBy?.name === "国土交通省", "recognizedByのnameが不正です");
    check(credential.validFrom === "2026-09-01", "登録のvalidFromが不正です");
    check(credential.validUntil === "2031-08-31", "登録のvalidUntilが不正です");

    const hours = localBusiness.openingHoursSpecification || {};
    check(hours["@type"] === "OpeningHoursSpecification", "営業時間詳細の@typeが不正です");
    check(hours.opens === "10:00" && hours.closes === "19:00", "営業時間詳細の時刻が不正です");
    check(Array.isArray(hours.dayOfWeek) && hours.dayOfWeek.length === 7, "営業時間詳細の曜日が不正です");

    localBusinessFingerprints.add(JSON.stringify(localBusiness));
  }

  const service = structuredNodes.find((node) => node["@type"] === "Service");
  check(Boolean(service), "Service構造化データがありません");
  check(service?.provider?.["@id"] === organizationId, "Serviceのprovider参照が不正です");

  const webPage = structuredNodes.find((node) => node["@type"] === "WebPage");
  check(Boolean(webPage), "WebPage構造化データがありません");
  check(webPage?.url === canonical, "WebPageのurlとcanonicalが一致しません");

  if (area) {
    check(service?.areaServed?.name === `${area}市`, "ServiceのareaServedが対象地域と一致しません");
    check(webPage?.mainEntity?.["@id"] === service?.["@id"], "WebPageのmainEntity参照が不正です");
    check(structuredNodes.some((node) => node["@type"] === "BreadcrumbList"), "BreadcrumbListがありません");
  } else {
    check(structuredNodes.some((node) => node["@type"] === "WebSite" && node.name === "WindWoods"), "トップにWebSite構造化データがありません");
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

check(localBusinessFingerprints.size === 1, "全ページのLocalBusiness構造化データが一致していません");

const robots = readFileSync(join(rootDir, "robots.txt"), "utf8");
check(robots.includes("Sitemap: https://windwoods-stayble.com/sitemap.xml"), "robots.txtのsitemap指定が不正です");

const sitemap = readFileSync(join(rootDir, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
check(sitemapUrls.length === expectedPageUrls.length, `sitemapのURL数が${sitemapUrls.length}件です`);
check(JSON.stringify([...sitemapUrls].sort()) === JSON.stringify([...expectedPageUrls].sort()), "sitemapの公開URLが不正です");
check([...sitemap.matchAll(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g)].length === expectedPageUrls.length, "sitemapのlastmodが不足しています");
check(!existsSync(join(rootDir, "llms.txt")), "不要なllms.txtがあります");

const businessFacts = readFileSync(join(rootDir, "BUSINESS.md"), "utf8");
check(businessFacts.includes("| 営業時間 | 毎日 10:00〜19:00 |"), "BUSINESS.mdの営業時間と構造化データが一致しません");
check(businessFacts.includes("| 登録番号 | 国土交通大臣（01）第F06325号 |"), "BUSINESS.mdの登録番号と構造化データが一致しません");

if (failures > 0) {
  console.error(`\nSEO audit failed: ${failures} issue(s).`);
  process.exitCode = 1;
} else {
  console.log("\nSEO audit passed for all 6 pages.");
}

#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "..");
const outputDir = join(rootDir, "assets", "og");
const workDir = mkdtempSync(join(tmpdir(), "windwoods-og-"));
const browserCandidates = [
  process.env.OG_BROWSER,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/microsoft-edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const browserPath = browserCandidates.find((candidate) => existsSync(candidate));

if (!browserPath) {
  throw new Error("Edge/Chrome/Chromium was not found. Set OG_BROWSER to its executable path.");
}

mkdirSync(outputDir, { recursive: true });

const pages = {
  home: ["北海道の民泊清掃代行", "札幌・千歳・小樽・北広島・恵庭"],
  sapporo: ["札幌の民泊清掃代行", "市内全10区 / リネンサプライ付き"],
  chitose: ["千歳の民泊清掃代行", "新千歳空港周辺 / リネンサプライ付き"],
  otaru: ["小樽の民泊清掃代行", "小樽支店 / リネンサプライ付き"],
  kitahiroshima: ["北広島の民泊清掃代行", "Fビレッジ周辺 / リネンサプライ付き"],
  eniwa: ["恵庭の民泊清掃代行", "西島松・恵み野・島松 / リネンサプライ付き"],
};

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function html(title, subtitle) {
  return `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><style>
*{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#050505;color:#fff;font-family:"Noto Sans JP","Yu Gothic",Meiryo,sans-serif}.canvas{position:relative;width:1200px;height:630px;padding:60px 72px;background:radial-gradient(circle at 85% 18%,rgba(201,164,92,.2),transparent 31%),linear-gradient(128deg,#050505 0 72%,#12100b 100%)}.canvas:before,.canvas:after{content:"";position:absolute;pointer-events:none}.canvas:before{inset:24px;border:1px solid rgba(201,164,92,.32)}.canvas:after{right:104px;top:-120px;width:2px;height:890px;background:linear-gradient(transparent,#c9a45c,transparent);transform:rotate(28deg);opacity:.45}.brand{display:flex;align-items:center;gap:24px;color:#d3b965;font:700 25px Georgia,serif;letter-spacing:.23em}.mark{width:78px;height:78px}.copy{position:absolute;left:72px;top:196px;z-index:1}.eyebrow{margin:0 0 20px;color:#c9a45c;font-size:23px;font-weight:700;letter-spacing:.13em}.copy h1{margin:0;font-size:64px;line-height:1.22;letter-spacing:.01em}.copy p{margin:22px 0 0;color:#eee5cf;font-size:29px;font-weight:700}.proof{position:absolute;left:72px;bottom:58px;display:flex;gap:25px;margin:0;color:#c4c4c4;font-size:20px;letter-spacing:.04em}.proof strong{color:#d3b965}.url{position:absolute;right:70px;bottom:58px;margin:0;color:#aaa;font:700 18px Georgia,serif;letter-spacing:.08em}
</style></head><body><main class="canvas"><div class="brand"><svg class="mark" viewBox="0 0 1024 1024" aria-hidden="true"><path fill="#d3b965" d="M112 222h162l112 402 66-224h120l66 224 112-402h162L704 802H578l-66-194-66 194H320L112 222Z"/></svg><span>WINDWOODS</span></div><div class="copy"><p class="eyebrow">PRIVATE LODGING CLEANING</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle)}</p></div><p class="proof">会社全体の実績 <strong>約240室</strong><strong>年間約15,000件</strong><strong>清掃員約50名</strong></p><p class="url">windwoods-stayble.com</p></main></body></html>`;
}

try {
  for (const [slug, [title, subtitle]] of Object.entries(pages)) {
    const htmlPath = join(workDir, `${slug}.html`);
    const outputPath = join(outputDir, `${slug}.png`);
    const profilePath = join(workDir, `profile-${slug}`);
    writeFileSync(htmlPath, html(title, subtitle));

    const result = spawnSync(browserPath, [
      "--headless=new",
      "--disable-gpu",
      "--disable-extensions",
      "--disable-background-networking",
      "--hide-scrollbars",
      "--no-first-run",
      "--force-device-scale-factor=1",
      "--run-all-compositor-stages-before-draw",
      `--user-data-dir=${profilePath}`,
      "--window-size=1200,630",
      `--screenshot=${outputPath}`,
      pathToFileURL(htmlPath).href,
    ], { encoding: "utf8" });

    if (result.status !== 0 || !existsSync(outputPath)) {
      throw new Error(`Failed to render ${slug}.\n${result.stderr || result.stdout}`);
    }

    console.log(`Generated assets/og/${slug}.png`);
  }
} finally {
  rmSync(workDir, { recursive: true, force: true });
}

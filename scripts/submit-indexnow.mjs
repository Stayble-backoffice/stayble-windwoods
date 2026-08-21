#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "..");
const host = "windwoods-stayble.com";
const key = "f07bd43d3ae0b91c2878f09dadbaa269";
const keyFile = join(rootDir, `${key}.txt`);
const keyLocation = `https://${host}/${key}.txt`;
const defaultUrls = [
  `https://${host}/`,
  `https://${host}/sapporo/`,
  `https://${host}/chitose/`,
  `https://${host}/otaru/`,
  `https://${host}/kitahiroshima/`,
  `https://${host}/eniwa/`,
];
const urlList = process.argv.slice(2).length ? process.argv.slice(2) : defaultUrls;

if (readFileSync(keyFile, "utf8").trim() !== key) {
  throw new Error("IndexNow key file does not match the configured key.");
}

for (const url of urlList) {
  if (new URL(url).host !== host) {
    throw new Error(`URL must use ${host}: ${url}`);
  }
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation, urlList }),
});

console.log(`IndexNow response: ${response.status} ${response.statusText}`);
if (![200, 202].includes(response.status)) {
  console.error(await response.text());
  process.exitCode = 1;
} else {
  urlList.forEach((url) => console.log(`- ${url}`));
}

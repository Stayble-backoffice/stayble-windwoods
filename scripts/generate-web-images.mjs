#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "..");
const assetsDir = join(rootDir, "assets");
const outputDir = join(assetsDir, "web");
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

mkdirSync(outputDir, { recursive: true });

const jobs = [
  ["toppage.png", "toppage-960.webp", 960, 540, 78],
  ["toppage.png", "toppage-1600.webp", 1600, 900, 78],
  ["linen-folded-towels.jpg", "linen-folded-towels-1280.webp", 1280, 720, 76],
  ...["sapporo", "chitose", "otaru", "kitahiroshima", "eniwa"].flatMap((area) => [
    [`hero-${area}-room.jpg`, `hero-${area}-960.webp`, 960, 540, 76],
    [`hero-${area}-room.jpg`, `hero-${area}-1600.webp`, 1600, 900, 76],
  ]),
];

for (const [inputName, outputName, width, height, quality] of jobs) {
  const inputPath = join(assetsDir, inputName);
  const outputPath = join(outputDir, outputName);

  if (!existsSync(inputPath)) {
    throw new Error(`Source image not found: ${inputPath}`);
  }

  const result = spawnSync(
    npx,
    [
      "--yes",
      "sharp-cli",
      "-i",
      inputPath,
      "-o",
      outputPath,
      "-f",
      "webp",
      "-q",
      String(quality),
      "resize",
      String(width),
      String(height),
    ],
    { cwd: rootDir, encoding: "utf8", shell: process.platform === "win32" },
  );

  if (result.status !== 0 || !existsSync(outputPath)) {
    throw new Error(`Failed to generate ${outputName}.\n${result.error || result.stderr || result.stdout}`);
  }

  console.log(`Generated assets/web/${outputName}`);
}

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const src = join(root, "src");
const contexts = ["identity", "clinic", "catalog", "plan", "media", "output", "share", "ai"];

const importRe = /from\s+["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;

const errors = [];

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path, acc);
      continue;
    }
    if (path.endsWith(".ts") || path.endsWith(".tsx")) acc.push(path);
  }
  return acc;
}

function importsOf(file) {
  const text = readFileSync(file, "utf8");
  const out = [];
  for (const match of text.matchAll(importRe)) {
    out.push(match[1] ?? match[2]);
  }
  return out;
}

function fail(file, msg) {
  errors.push(`${relative(root, file)}: ${msg}`);
}

function layerFiles(layer) {
  const files = [];
  for (const ctx of contexts) {
    const dir = join(src, "modules", ctx, layer);
    try {
      walk(dir, files);
    } catch {
      fail(dir, "missing");
    }
  }
  return files;
}

const domainForbidden = [
  "next/",
  "next/font",
  "react",
  "react-dom",
  "server-only",
  "@/app",
  "@/bootstrap",
  "@/platform",
  "@/ui",
  "/adapters/",
];

for (const file of layerFiles("domain")) {
  for (const imp of importsOf(file)) {
    if (domainForbidden.some((bad) => imp === bad || imp.startsWith(bad))) {
      fail(file, `domain imports ${imp}`);
    }
    if (imp.includes("/adapters/")) fail(file, `domain imports adapter ${imp}`);
  }
}

const appForbidden = [
  "next/headers",
  "next/server",
  "next/cache",
  "server-only",
  "@/platform/http/client",
  "@/bootstrap",
  "@/app",
];

for (const file of layerFiles("application")) {
  for (const imp of importsOf(file)) {
    if (appForbidden.some((bad) => imp === bad || imp.startsWith(bad))) {
      fail(file, `application imports ${imp}`);
    }
    if (imp.includes("/adapters/")) fail(file, `application imports adapter ${imp}`);
  }
}

for (const self of contexts) {
  const files = [];
  try {
    walk(join(src, "modules", self, "adapters"), files);
  } catch {
    continue;
  }
  for (const file of files) {
    for (const imp of importsOf(file)) {
      for (const other of contexts) {
        if (other === self) continue;
        if (imp.includes(`/modules/${other}/adapters`)) {
          fail(file, `imports other adapter ${imp}`);
        }
      }
    }
  }
}

const sharedFiles = walk(join(src, "shared"));
for (const file of sharedFiles) {
  for (const imp of importsOf(file)) {
    if (
      imp.startsWith("@/modules") ||
      imp.startsWith("@/platform") ||
      imp.startsWith("@/app") ||
      imp.startsWith("@/bootstrap") ||
      imp.startsWith("@/ui")
    ) {
      fail(file, `shared imports ${imp}`);
    }
  }
}

if (errors.length) {
  console.error("arch-lint failed\n" + errors.map((e) => `  ${e}`).join("\n"));
  process.exit(1);
}

console.log("arch-lint ok");

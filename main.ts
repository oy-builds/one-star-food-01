import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const raw = readFileSync(join(here, "entry.txt"), "utf8");
const text = raw.endsWith("\n") ? raw.slice(0, -1) : raw;

if (text.length === 0) throw new Error("entry is empty");
if (text.trim().length === 0) throw new Error("entry is only whitespace");
if (text.includes("\n") || text.includes("\r")) throw new Error("entry must be a single line");
if ([...text].length > 200) throw new Error("entry exceeds 200 characters");

if (!text.endsWith(".")) throw new Error("entry must end with a period (one sentence)");

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
const expected = Buffer.from(text, "utf8");
writeFileSync(outPath, expected);

// Byte-exact round-trip verification: re-read what was written and compare.
const written = readFileSync(outPath);
if (!written.equals(expected)) {
  throw new Error(`round-trip mismatch: wrote ${expected.length} bytes, read back ${written.length}`);
}
const roundTripped = written.toString("utf8");
if (roundTripped !== text || [...roundTripped].length !== [...text].length) {
  throw new Error("round-trip text does not match entry.txt");
}
console.log(`wrote ${[...text].length} chars (${expected.length} bytes) to ${outPath}; round-trip verified byte-exact`);

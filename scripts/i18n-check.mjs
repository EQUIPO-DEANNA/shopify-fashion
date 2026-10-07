// Every string the source asks `t()` for, checked against the English dictionary.
//
// The site is Spanish and an unknown key falls back to itself, so a gap here
// never breaks the Spanish view — it shows up only when somebody clicks EN, and
// then as one Spanish sentence stranded in an English page. That is exactly the
// kind of fault nobody notices until it is in front of an investor, so it is
// checked rather than hoped for.
//
//   node scripts/i18n-check.mjs
import fs from "node:fs";
import path from "node:path";

const SRC = "src";
const DICTIONARY = "src/lib/i18n-en.ts";

/**
 * Pull the first argument out of every `t("...")`.
 *
 * Scanned rather than matched with a regular expression: the strings contain
 * quotes, accents and escapes, and a pattern that handles all three is harder
 * to read than the loop.
 */
function keysIn(text) {
  const found = [];
  let i = 0;
  while (true) {
    i = text.indexOf("t(", i);
    if (i < 0) break;
    const before = i > 0 ? text[i - 1] : " ";
    // `t(` preceded by a word character is some other function: `useT(`, `.at(`.
    if (/[\w$.]/.test(before)) {
      i += 2;
      continue;
    }
    let j = i + 2;
    while (j < text.length && /\s/.test(text[j])) j++;
    if (text[j] !== '"') {
      i += 2;
      continue;
    }
    j++;
    let key = "";
    while (j < text.length) {
      const ch = text[j];
      if (ch === "\\") {
        key += text[j + 1];
        j += 2;
        continue;
      }
      if (ch === '"') break;
      key += ch;
      j++;
    }
    if (key) found.push(key);
    i = j;
  }
  return found;
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry.name) && !entry.name.includes(".test.")) out.push(full);
  }
  return out;
}

const dictionary = fs.readFileSync(DICTIONARY, "utf8");
const used = new Set();
for (const file of walk(SRC)) {
  if (path.resolve(file) === path.resolve(DICTIONARY)) continue;
  for (const key of keysIn(fs.readFileSync(file, "utf8"))) used.add(key);
}

// Membership is tested against the dictionary's source text rather than by
// importing it, so this stays a plain node script with no build step.
const missing = [...used].filter((key) => {
  const quoted = JSON.stringify(key);
  return !dictionary.includes(quoted) && !dictionary.includes(`\n  ${key}:`);
});

console.log(`${used.size} keys used, ${used.size - missing.length} translated.`);
if (missing.length) {
  console.log(`\n${missing.length} with no English:\n`);
  for (const key of missing.sort()) console.log(`  ${JSON.stringify(key)}: "",`);
  process.exit(1);
}
console.log("Nothing missing.");

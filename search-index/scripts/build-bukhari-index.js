const fs = require("fs");
const path = require("path");

const RAW_DIR = path.join(__dirname, "..", "raw");
const OUTPUT_DIR = path.join(__dirname, "..", "generated");

const files = [
  { file: "arb.bukhari.json", language: "ar" },
  { file: "eng.bukhari.json", language: "en" },
  { file: "urd.bukhari.json", language: "ur" },
];

function normalizeText(text, language) {
  if (!text) return "";

  let normalized = text.normalize("NFC");

  if (language === "ar" || language === "ur") {
    normalized = normalized.replace(
      /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g,
      ""
    );

    normalized = normalized
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ى/g, "ي");
  }

  return normalized.toLowerCase();
}

function tokenize(text) {
  return text.match(/[\p{L}\p{M}]+/gu) || [];
}

// term -> language -> flat array:
// [hadithId, frequency, hadithId, frequency, ...]
const index = {};

for (const { file, language } of files) {
  console.log(`Processing ${language}: ${file}`);

  const filePath = path.join(RAW_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  for (const hadith of data.hadiths) {
    if (!hadith.text) continue;

    const normalized = normalizeText(hadith.text, language);
    const tokens = tokenize(normalized);

    const frequencies = new Map();

    for (const token of tokens) {
      frequencies.set(
        token,
        (frequencies.get(token) || 0) + 1
      );
    }

    for (const [term, frequency] of frequencies) {
      if (!index[term]) {
        index[term] = {};
      }

      if (!index[term][language]) {
        index[term][language] = [];
      }

      index[term][language].push(hadith.hadithnumber);
      index[term][language].push(frequency);
    }
  }
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const outputPath = path.join(
  OUTPUT_DIR,
  "bukhari-search-index-compact.json"
);

fs.writeFileSync(
  outputPath,
  JSON.stringify(index)
);

const sizeBytes = fs.statSync(outputPath).size;
const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2);

console.log("\nCompact index created.");
console.log(`Terms: ${Object.keys(index).length}`);
console.log(`Size: ${sizeMB} MB`);
console.log(`Output: ${outputPath}`);
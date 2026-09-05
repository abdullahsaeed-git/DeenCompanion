const fs = require("fs");
const path = require("path");

const INDEX_PATH = path.join(
  __dirname,
  "..",
  "generated",
  "bukhari-search-index.bin"
);

const buffer = fs.readFileSync(INDEX_PATH);

let offset = 0;

function decodeVarint() {
  let value = 0;
  let shift = 0;

  while (true) {
    const byte = buffer[offset++];

    value += (byte & 0x7f) * 2 ** shift;

    if ((byte & 0x80) === 0) {
      return value;
    }

    shift += 7;
  }
}

function readString(length) {
  const value = buffer
    .subarray(offset, offset + length)
    .toString("utf8");

  offset += length;

  return value;
}

function loadIndex() {
  const index = new Map();

  while (offset < buffer.length) {
    const termLength = decodeVarint();
    const term = readString(termLength);

    const languages = {};

    for (const language of ["ar", "en", "ur"]) {
      const integerCount = decodeVarint();
      const postings = [];

      let previousId = 0;

      for (let i = 0; i < integerCount; i += 2) {
        const delta = decodeVarint();
        const frequency = decodeVarint();

        const hadithId = previousId + delta;
        previousId = hadithId;

        postings.push({
          id: hadithId,
          frequency,
        });
      }

      languages[language] = postings;
    }

    index.set(term, languages);
  }

  return index;
}

function normalizeSearchTerm(term, language) {
  let normalized = term.normalize("NFC");

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

const index = loadIndex();

console.log(`Loaded ${index.size} search terms.`);
console.log(`Index size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

function search(term, language) {
  const normalizedTerm = normalizeSearchTerm(term, language);
  const result = index.get(normalizedTerm);

  if (!result) {
    console.log(`\nNo results for "${term}"`);
    return;
  }

  const postings = result[language];

  console.log(`\nSearch: "${term}"`);
  console.log(`Language: ${language}`);
  console.log(`Matches: ${postings.length}`);

  console.log(
    postings
      .slice(0, 20)
      .map(
        (item) =>
          `Hadith ${item.id} (frequency: ${item.frequency})`
      )
      .join("\n")
  );
}

// Test searches
search("water", "en");
search("prayer", "en");
search("Allah", "en");
search("پانی", "ur");
search("الله", "ar");
search("this-term-does-not-exist", "en");
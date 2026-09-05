const fs = require("fs");
const path = require("path");
const readline = require("readline");

const SEARCH_INDEX_PATH = path.join(
  __dirname,
  "..",
  "generated",
  "bukhari-search-index.bin"
);

const RAW_DIR = path.join(__dirname, "..", "raw");

const FILES = {
  ar: "arb.bukhari.json",
  en: "eng.bukhari.json",
  ur: "urd.bukhari.json",
};

// --------------------------------------------------
// Load Hadith data
// --------------------------------------------------

function loadHadithFile(language) {
  const filePath = path.join(RAW_DIR, FILES[language]);

  const data = JSON.parse(
    fs.readFileSync(filePath, "utf8")
  );

  const map = new Map();

  for (const hadith of data.hadiths) {
    map.set(hadith.hadithnumber, hadith);
  }

  return map;
}

// --------------------------------------------------
// Binary index reader
// --------------------------------------------------

const buffer = fs.readFileSync(SEARCH_INDEX_PATH);
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

// --------------------------------------------------
// Search normalization
// --------------------------------------------------

function detectLanguage(query) {
  // Urdu-specific characters
  if (/[ٹڈڑںھہۃےژچپگ]/u.test(query)) {
    return "ur";
  }

  // Arabic-script query
  if (/[\u0600-\u06FF]/u.test(query)) {
    return "ar";
  }

  // Default to English
  return "en";
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

// --------------------------------------------------
// Search
// --------------------------------------------------

function search(index, query, language) {
  const normalizedQuery = normalizeSearchTerm(
    query,
    language
  );

  const result = index.get(normalizedQuery);

  if (!result) {
    return [];
  }

  return [...result[language]]
    .sort((a, b) => {
      // Higher frequency = more relevant
      if (b.frequency !== a.frequency) {
        return b.frequency - a.frequency;
      }

      // If frequency is equal, lower Hadith number first
      return a.id - b.id;
    });
}

// --------------------------------------------------
// Display
// --------------------------------------------------

function printHadith(number, data) {
  console.log("\n" + "=".repeat(80));
  console.log(`HADITH ${number}`);
  console.log("=".repeat(80));

  console.log("\n[ARABIC]");
  console.log(data.ar?.text || "[No Arabic text]");

  console.log("\n[ENGLISH]");
  console.log(data.en?.text || "[No English text]");

  console.log("\n[URDU]");
  console.log(data.ur?.text || "[No Urdu text]");

  console.log("");
}

// --------------------------------------------------
// Main
// --------------------------------------------------

async function main() {
  console.log("Loading search index...");

  const index = loadIndex();

  console.log(
    `Loaded ${index.size.toLocaleString()} search terms.`
  );

  console.log("Loading Hadith data...");

  const arabic = loadHadithFile("ar");
  const english = loadHadithFile("en");
  const urdu = loadHadithFile("ur");

  console.log("Hadith data loaded.\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (question) =>
    new Promise((resolve) => {
      rl.question(question, resolve);
    });

  while (true) {
    const query = (
      await ask(
        '\nSearch Bukhari (English / اردو / العربية), or type "exit": '
      )
    ).trim();

    if (!query) {
      continue;
    }

    if (query.toLowerCase() === "exit") {
      break;
    }

    const language = detectLanguage(query);

    console.log(`Detected language: ${language}`);

    const results = search(
      index,
      query,
      language
    );

    if (results.length === 0) {
      console.log(
        `\nNo exact matches found for "${query}".`
      );
      continue;
    }

    console.log(
      `Found ${results.length.toLocaleString()} matching Hadiths.`
    );

    let position = 0;

    while (position < results.length) {
      const page = results.slice(
        position,
        position + 10
      );

      console.log(
        `\nShowing ${position + 1}-${Math.min(
          position + 10,
          results.length
        )} of ${results.length}`
      );

      for (const result of page) {
        const number = result.id;

        printHadith(number, {
          ar: arabic.get(number),
          en: english.get(number),
          ur: urdu.get(number),
        });
      }

      position += page.length;

      if (position >= results.length) {
        console.log("\nNo more results.");
        break;
      }

      const more = (
        await ask("Show next 10? (y/n): ")
      )
        .trim()
        .toLowerCase();

      if (more !== "y" && more !== "yes") {
        console.log("Search stopped.");
        break;
      }
    }
  }

  rl.close();
}

main().catch((error) => {
  console.error("\nSearch failed:");
  console.error(error);
  process.exit(1);
});
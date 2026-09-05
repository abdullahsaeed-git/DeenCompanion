const fs = require("fs");
const path = require("path");

const INPUT = path.join(
  __dirname,
  "..",
  "generated",
  "bukhari-search-index-compact.json"
);

const OUTPUT = path.join(
  __dirname,
  "..",
  "generated",
  "bukhari-search-index.bin"
);

function encodeVarint(value) {
  const bytes = [];

  while (value >= 128) {
    bytes.push((value & 127) | 128);
    value >>>= 7;
  }

  bytes.push(value);

  return bytes;
}

const index = JSON.parse(
  fs.readFileSync(INPUT, "utf8")
);

const chunks = [];

for (const [term, languages] of Object.entries(index)) {
  const termBytes = Buffer.from(term, "utf8");

  // Term length
  chunks.push(...encodeVarint(termBytes.length));

  // Term
  chunks.push(...termBytes);

  for (const language of ["ar", "en", "ur"]) {
    const postings = languages[language] || [];

    // Number of integers in this language's posting list
    chunks.push(...encodeVarint(postings.length));

    let previousId = 0;

    for (let i = 0; i < postings.length; i += 2) {
      const hadithId = postings[i];
      const frequency = postings[i + 1];

      // Delta encode Hadith IDs
      const delta = hadithId - previousId;
      previousId = hadithId;

      chunks.push(...encodeVarint(delta));
      chunks.push(...encodeVarint(frequency));
    }
  }
}

const buffer = Buffer.from(chunks);

fs.writeFileSync(OUTPUT, buffer);

const sizeMB = (
  buffer.length /
  1024 /
  1024
).toFixed(2);

console.log("Binary index created.");
console.log(`Size: ${sizeMB} MB`);
console.log(`Output: ${OUTPUT}`);
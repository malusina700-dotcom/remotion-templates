import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { applyNarrationTiming } from "../src/narration-timing";
import { VideoSpecSchema } from "../src/schema";

function option(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const specPath = process.argv[2];
const audioPath = option("--audio");
const manifestPath = option("--manifest");
if (!specPath || !audioPath || !manifestPath) {
  throw new Error(
    "Usage: npm run video:timing -- video.video.json --audio public/narration.wav --manifest narration.timing.json",
  );
}

const absoluteSpec = path.resolve(specPath);
const absoluteAudio = path.resolve(audioPath);
const absoluteManifest = path.resolve(manifestPath);
const [specRaw, manifestRaw, audio] = await Promise.all([
  readFile(absoluteSpec, "utf8"),
  readFile(absoluteManifest, "utf8"),
  readFile(absoluteAudio),
]);
if (audio.length < 44 || audio.toString("ascii", 0, 4) !== "RIFF") {
  throw new Error("The narration audio must be a valid WAV file.");
}

const spec = VideoSpecSchema.parse(JSON.parse(specRaw));
const narrationSrc = path
  .relative(process.cwd(), absoluteAudio)
  .split(path.sep)
  .join("/");
const updated = applyNarrationTiming(
  spec,
  JSON.parse(manifestRaw),
  narrationSrc,
);

await writeFile(absoluteSpec, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
console.log(
  `Applied ${updated.audio.narrationTiming?.segments.length ?? 0} narration beats.`,
);
console.log(
  `Narration duration: ${updated.audio.narrationTiming?.durationMs ?? 0} ms`,
);
console.log(`Updated: ${absoluteSpec}`);

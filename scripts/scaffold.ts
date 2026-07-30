import { writeFile } from "node:fs/promises";

import { templateIds } from "../src/schema";

const template = process.argv[2] ?? "proof-walkthrough";
if (!templateIds.includes(template as (typeof templateIds)[number])) {
  throw new Error(`Unknown template. Choose: ${templateIds.join(", ")}`);
}
const title = process.argv[3] ?? "My new video";
const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "new-video";
const scenes: Record<string, unknown>[] = [
  { id: "hero", kind: "hero", content: { title, subtitle: "Replace with a concise promise" } },
];
if (template === "proof-walkthrough") {
  scenes.push({ id: "working", kind: "equation", content: { title: "Work through the idea", latexBlocks: ["a^2 + b^2 = c^2"] } });
} else {
  scenes.push({ id: "key-points", kind: "points", content: { title: "Key points", points: ["First point", "Second point", "Takeaway"] } });
}
if (template === "qa-ad" || template === "social-remix") {
  scenes.splice(1, 0, { id: "source-video", kind: "video-window", content: { src: "public/replace-with-your-video.mp4" } });
}
scenes.push({ id: "cta", kind: "cta", content: { line1: "Replace with the next action" } });
const spec = {
  schemaVersion: "1.0",
  id,
  templateFamily: template,
  meta: { title, tags: [] },
  target: { aspect: "9:16", fps: 30, durationMode: "auto" },
  style: { theme: "default", variant: "default", safeAreaProfile: "metaSafe" },
  audio: { ducking: true },
  assets: {},
  scenes,
};
const filename = `${id}.video.json`;
await writeFile(filename, `${JSON.stringify(spec, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
console.log(`Created ${filename}`);

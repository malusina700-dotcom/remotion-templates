import { writeFile } from "node:fs/promises";

import { templateIds } from "../src/schema";

const template = process.argv[2] ?? "proof-walkthrough";
if (!templateIds.includes(template as (typeof templateIds)[number])) {
  throw new Error(`Unknown template. Choose: ${templateIds.join(", ")}`);
}
const title = process.argv[3] ?? "My new video";
const id =
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "new-video";

const scenes: Record<string, unknown>[] = [
  {
    id: "hero",
    kind: "hero",
    content: { title, subtitle: "Replace with a concise promise" },
    timing: { durationMs: 4000 },
  },
];
if (template === "announcement-brief") {
  scenes.push(
    {
      id: "context",
      kind: "statement",
      content: {
        title: "Name the change",
        subtitle: "Explain why it matters in one sentence",
      },
      timing: { durationMs: 6000 },
    },
    {
      id: "mechanism",
      kind: "mechanism",
      content: {
        title: "Show how the change happens",
        before: "Before",
        after: "After",
      },
      timing: { durationMs: 7000 },
    },
    {
      id: "outcomes",
      kind: "points",
      content: {
        title: "What changes",
        points: ["First outcome", "Second outcome", "Third outcome"],
      },
      timing: { durationMs: 7000 },
    },
  );
} else if (template === "proof-walkthrough") {
  scenes.push({
    id: "working",
    kind: "equation",
    content: {
      title: "Work through the idea",
      latexBlocks: ["a^2 + b^2 = c^2"],
    },
    timing: { durationMs: 8000 },
  });
} else {
  scenes.push({
    id: "key-points",
    kind: "points",
    content: {
      title: "Key points",
      points: ["First point", "Second point", "Takeaway"],
    },
    timing: { durationMs: 8000 },
  });
}
if (template === "qa-ad" || template === "social-remix") {
  scenes.splice(1, 0, {
    id: "source-video",
    kind: "video-window",
    content: {
      title: "See it in context",
      src: "public/replace-with-your-video.mp4",
    },
    timing: { durationMs: 7000 },
  });
}
scenes.push({
  id: "cta",
  kind: "cta",
  content: { line1: "Replace with the next action" },
  timing: { durationMs: template === "announcement-brief" ? 6000 : 5000 },
});
const spec = {
  schemaVersion: "1.0",
  id,
  templateFamily: template,
  meta: { title, tags: [] },
  target: { aspect: "9:16", fps: 30, durationMode: "auto" },
  style: {
    theme: template === "announcement-brief" ? "editorial-light" : "default",
    variant: "default",
    safeAreaProfile: "metaSafe",
    showSceneLabels: false,
  },
  audio: {
    mode: "silent",
    narrationText: "",
    narrationVolume: 1,
    musicVolume: 0.16,
    ducking: true,
  },
  assets: {},
  scenes,
};
const filename = `${id}.video.json`;
await writeFile(filename, `${JSON.stringify(spec, null, 2)}\n`, {
  encoding: "utf8",
  flag: "wx",
});
console.log(`Created ${filename}`);
console.log(
  "Audio is explicitly silent. Add narrationText and run video:narrate to create local speech.",
);

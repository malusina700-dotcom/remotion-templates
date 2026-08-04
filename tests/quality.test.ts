import { describe, expect, it } from "vitest";

import { evaluateSpec } from "../src/quality";
import { VideoSpecSchema } from "../src/schema";

const base = VideoSpecSchema.parse({
  schemaVersion: "1.0",
  id: "quality-test-video",
  templateFamily: "announcement-brief",
  meta: { title: "A quality test", tags: [] },
  target: { aspect: "9:16", fps: 30, durationMode: "auto" },
  style: {
    theme: "editorial-light",
    variant: "default",
    safeAreaProfile: "metaSafe",
    showSceneLabels: false,
  },
  audio: { mode: "silent", ducking: true },
  assets: {},
  scenes: [
    { id: "hero", kind: "hero", content: { title: "A useful headline" } },
    {
      id: "mechanism",
      kind: "mechanism",
      content: { title: "Show the change", before: "Before", after: "After" },
    },
    {
      id: "outcomes",
      kind: "points",
      content: { title: "What improves", points: ["One", "Two"] },
    },
    { id: "cta", kind: "cta", content: { line1: "Take the next step" } },
  ],
});

describe("quality safeguards", () => {
  it("accepts intentional silence without a blocking error", () => {
    const issues = evaluateSpec(base);
    expect(issues.some((issue) => issue.level === "error")).toBe(false);
    expect(issues.some((issue) => issue.code === "intentional-silence")).toBe(
      true,
    );
  });

  it("blocks narration that has no audio source", () => {
    const spec = VideoSpecSchema.parse({
      ...base,
      audio: {
        mode: "narration",
        narrationText: "This should be audible.",
        ducking: true,
      },
    });
    expect(evaluateSpec(spec)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          level: "error",
          code: "narration-source-missing",
        }),
      ]),
    );
  });

  it("rejects implementation labels and warns on all-caps headlines", () => {
    const spec = VideoSpecSchema.parse({
      ...base,
      scenes: [
        {
          id: "hero",
          kind: "hero",
          content: { title: "THIS IS AN ALL CAPS TITLE", label: "CUSTOM" },
        },
      ],
    });
    const issues = evaluateSpec(spec);
    expect(issues.map((issue) => issue.code)).toContain("all-caps-headline");
    expect(issues.map((issue) => issue.code)).toContain("implementation-label");
  });

  it("blocks a timing manifest that does not map one beat to every scene", () => {
    const spec = VideoSpecSchema.parse({
      ...base,
      audio: {
        mode: "narration",
        narrationSrc: "public/generated/narration.wav",
        narrationTiming: {
          schemaVersion: "1.0",
          source: "segmented-synthesis",
          durationMs: 2000,
          segments: [
            { sceneId: "hero", startMs: 0, endMs: 2000, durationMs: 2000 },
          ],
        },
      },
    });
    expect(evaluateSpec(spec)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          level: "error",
          code: "narration-timing-scene-mismatch",
        }),
      ]),
    );
  });
});

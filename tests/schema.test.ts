import example from "../examples/proof-walkthrough.video.json";
import announcement from "../examples/announcement-brief.video.json";
import { describe, expect, it } from "vitest";
import {
  compositionId,
  durationInFrames,
  VideoSpecSchema,
} from "../src/schema";

describe("VideoSpec", () => {
  it("parses the included example", () => {
    const spec = VideoSpecSchema.parse(example);
    expect(compositionId(spec)).toBe("InstavarTemplateVertical");
    expect(durationInFrames(spec)).toBe(360);
  });

  it("parses the editorial announcement example", () => {
    const spec = VideoSpecSchema.parse(announcement);
    expect(spec.style.showSceneLabels).toBe(false);
    expect(spec.audio.mode).toBe("silent");
    expect(durationInFrames(spec)).toBe(900);
  });

  it("uses measured segmented narration durations", () => {
    const spec = VideoSpecSchema.parse({
      ...example,
      audio: {
        mode: "narration",
        narrationSrc: "public/generated/narration.wav",
        narrationTiming: {
          schemaVersion: "1.0",
          source: "segmented-synthesis",
          durationMs: 8000,
          segments: [
            { sceneId: "hero", startMs: 0, endMs: 2000, durationMs: 2000 },
            {
              sceneId: "equation",
              startMs: 2000,
              endMs: 4000,
              durationMs: 2000,
            },
            {
              sceneId: "takeaway",
              startMs: 4000,
              endMs: 6000,
              durationMs: 2000,
            },
            { sceneId: "cta", startMs: 6000, endMs: 8000, durationMs: 2000 },
          ],
        },
      },
    });
    expect(durationInFrames(spec)).toBe(240);
  });

  it("rejects gaps in segmented narration timing", () => {
    expect(() =>
      VideoSpecSchema.parse({
        ...example,
        audio: {
          narrationTiming: {
            schemaVersion: "1.0",
            source: "segmented-synthesis",
            durationMs: 4000,
            segments: [
              { sceneId: "hook", startMs: 100, endMs: 4000, durationMs: 3900 },
            ],
          },
        },
      }),
    ).toThrow();
  });
});

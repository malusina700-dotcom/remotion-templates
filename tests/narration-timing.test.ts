import example from "../examples/proof-walkthrough.video.json";
import { describe, expect, it } from "vitest";

import { applyNarrationTiming } from "../src/narration-timing";
import { durationInFrames, VideoSpecSchema } from "../src/schema";

const spec = VideoSpecSchema.parse(example);
const beats = [2000, 2500, 1500, 2000];
const manifest = {
  schemaVersion: "1.0",
  source: "segmented-synthesis",
  durationMs: 8000,
  segments: beats.map((durationMs, index) => ({
    id: `beat-${index + 1}`,
    startMs: beats.slice(0, index).reduce((sum, value) => sum + value, 0),
    endMs: beats.slice(0, index + 1).reduce((sum, value) => sum + value, 0),
    durationMs,
  })),
};

describe("applyNarrationTiming", () => {
  it("maps browser beats to scenes in order", () => {
    const updated = applyNarrationTiming(
      spec,
      manifest,
      "public/generated/narration.wav",
    );
    expect(
      updated.audio.narrationTiming?.segments.map((item) => item.sceneId),
    ).toEqual(spec.scenes.map((scene) => scene.id));
    expect(updated.scenes.map((scene) => scene.timing?.durationMs)).toEqual(
      beats,
    );
    expect(durationInFrames(updated)).toBe(240);
  });

  it("rejects a beat count that cannot map to every scene", () => {
    expect(() =>
      applyNarrationTiming(
        spec,
        { ...manifest, segments: manifest.segments.slice(0, 3) },
        "public/generated/narration.wav",
      ),
    ).toThrow("3 beats");
  });
});

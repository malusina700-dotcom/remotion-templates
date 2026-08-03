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
});

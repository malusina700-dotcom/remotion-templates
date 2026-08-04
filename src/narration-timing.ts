import {
  NarrationTimingManifestSchema,
  type VideoSpec,
  VideoSpecSchema,
} from "./schema";

export function applyNarrationTiming(
  spec: VideoSpec,
  rawManifest: unknown,
  narrationSrc: string,
): VideoSpec {
  if (!rawManifest || typeof rawManifest !== "object") {
    throw new Error("The narration timing manifest is invalid.");
  }
  const rawSegments = (rawManifest as { segments?: unknown }).segments;
  if (!Array.isArray(rawSegments)) {
    throw new Error("The narration timing manifest has no segments.");
  }
  if (rawSegments.length !== spec.scenes.length) {
    throw new Error(
      `Timing manifest has ${rawSegments.length} beats, but the VideoSpec has ${spec.scenes.length} scenes. Use one narration paragraph per scene.`,
    );
  }
  const timing = NarrationTimingManifestSchema.parse({
    ...rawManifest,
    segments: rawSegments.map((segment, index) => ({
      ...(segment as Record<string, unknown>),
      sceneId: spec.scenes[index].id,
    })),
  });

  return VideoSpecSchema.parse({
    ...spec,
    target: { ...spec.target, durationMode: "auto" },
    audio: {
      ...spec.audio,
      mode: "narration",
      narrationSrc,
      narrationTiming: timing,
    },
    scenes: spec.scenes.map((scene, index) => ({
      ...scene,
      timing: {
        ...scene.timing,
        durationMs: timing.segments[index].durationMs,
      },
    })),
  });
}

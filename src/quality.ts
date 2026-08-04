import type { VideoSpec } from "./schema";
import { expectsAudibleAudio } from "./schema";

export type QualityIssue = {
  level: "error" | "warning" | "info";
  code: string;
  message: string;
};

function value(scene: VideoSpec["scenes"][number], key: string): string {
  const candidate = scene.content[key];
  return typeof candidate === "string" ? candidate.trim() : "";
}

function list(scene: VideoSpec["scenes"][number], key: string): string[] {
  const candidate = scene.content[key];
  return Array.isArray(candidate)
    ? candidate.filter((item): item is string => typeof item === "string")
    : [];
}

export function evaluateSpec(spec: VideoSpec): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const audioExpected = expectsAudibleAudio(spec);

  if (spec.audio.mode === "narration" && !spec.audio.narrationSrc) {
    issues.push({
      level: "error",
      code: "narration-source-missing",
      message:
        "audio.mode is narration, but audio.narrationSrc is missing. Run video:narrate or add an existing audio file.",
    });
  }
  if (spec.audio.mode === "music" && !spec.audio.musicSrc) {
    issues.push({
      level: "error",
      code: "music-source-missing",
      message: "audio.mode is music, but audio.musicSrc is missing.",
    });
  }
  if (spec.audio.narrationText && !spec.audio.narrationSrc) {
    issues.push({
      level: spec.audio.mode === "silent" ? "warning" : "error",
      code: "narration-text-not-rendered",
      message:
        "Narration text exists without narrationSrc. Written narration is not audible until audio is generated or attached.",
    });
  }
  if (spec.audio.narrationTiming) {
    const sceneIds = spec.scenes.map((scene) => scene.id);
    const timingIds = spec.audio.narrationTiming.segments.map(
      (segment) => segment.sceneId,
    );
    if (
      sceneIds.length !== timingIds.length ||
      sceneIds.some((sceneId, index) => timingIds[index] !== sceneId)
    ) {
      issues.push({
        level: "error",
        code: "narration-timing-scene-mismatch",
        message:
          "Narration timing must contain exactly one ordered segment for every scene. Re-run video:timing with one narration paragraph per scene.",
      });
    }
  }
  if (!audioExpected) {
    issues.push({
      level: "info",
      code: "intentional-silence",
      message:
        "No audible audio is configured. Set audio.mode to silent only when this is intentional.",
    });
  }
  if (spec.style.showSceneLabels) {
    issues.push({
      level: "warning",
      code: "debug-labels-visible",
      message:
        "Scene-kind labels are visible. Keep showSceneLabels false for audience-facing renders.",
    });
  }

  for (const [index, scene] of spec.scenes.entries()) {
    const title = value(scene, "title") || value(scene, "line1");
    const label = value(scene, "label");
    if (!title) {
      issues.push({
        level: "error",
        code: "scene-title-missing",
        message: `Scene ${index + 1} (${scene.id}) has no title or line1.`,
      });
    }
    if (title.length > 82) {
      issues.push({
        level: "warning",
        code: "headline-too-long",
        message: `Scene ${index + 1} headline has ${title.length} characters. Prefer 82 or fewer.`,
      });
    }
    if (title.length >= 12 && title === title.toUpperCase()) {
      issues.push({
        level: "warning",
        code: "all-caps-headline",
        message: `Scene ${index + 1} uses an all-caps headline. Use sentence case for editorial hierarchy.`,
      });
    }
    if (label && label === label.toUpperCase()) {
      issues.push({
        level: "warning",
        code: "all-caps-label",
        message: `Scene ${index + 1} uses an all-caps label. Remove it or use sentence case only when it adds meaning.`,
      });
    }
    if (
      label &&
      ["hero", "custom", "points", "cta"].includes(label.toLowerCase())
    ) {
      issues.push({
        level: "error",
        code: "implementation-label",
        message: `Scene ${index + 1} exposes the implementation label “${label}”. Remove it from audience-facing copy.`,
      });
    }
    const points = list(scene, "points");
    if (points.length > 4) {
      issues.push({
        level: "warning",
        code: "too-many-points",
        message: `Scene ${index + 1} has ${points.length} points. Prefer four or fewer.`,
      });
    }
    for (const point of points) {
      if (point.length > 58) {
        issues.push({
          level: "warning",
          code: "point-too-long",
          message: `Scene ${index + 1} contains a point longer than 58 characters.`,
        });
      }
    }
  }

  const kinds = new Set(spec.scenes.map((scene) => scene.kind));
  if (spec.scenes.length >= 4 && kinds.size < 3) {
    issues.push({
      level: "warning",
      code: "weak-scene-differentiation",
      message:
        "Four or more scenes use fewer than three layout kinds. Add visual structure instead of repeating text slides.",
    });
  }
  return issues;
}

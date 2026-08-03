import { z } from "zod";

export const templateIds = [
  "qa-ad",
  "proof-walkthrough",
  "announcement-brief",
  "social-remix",
  "finance-brief",
] as const;

export const sceneKinds = [
  "hero",
  "statement",
  "mechanism",
  "points",
  "equation",
  "video-window",
  "cta",
  "custom",
] as const;

const scene = z.object({
  id: z.string().min(1),
  kind: z.enum(sceneKinds),
  content: z.record(z.string(), z.unknown()),
  timing: z
    .object({ durationMs: z.number().int().positive().optional() })
    .optional(),
});

export const VideoSpecSchema = z.object({
  schemaVersion: z.literal("1.0"),
  id: z.string().regex(/^[a-z0-9][a-z0-9-]{2,80}$/),
  templateFamily: z.enum(templateIds),
  meta: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
  target: z.object({
    aspect: z.enum(["9:16", "4:5", "1:1"]),
    fps: z.number().int().positive().default(30),
    durationMode: z.enum(["auto", "fixed"]).default("auto"),
    fixedDurationSec: z.number().positive().optional(),
  }),
  style: z
    .object({
      theme: z
        .enum(["default", "editorial-light", "editorial-dark", "clinical"])
        .default("default"),
      variant: z.string().default("default"),
      safeAreaProfile: z.enum(["baseline", "metaSafe"]).default("baseline"),
      showSceneLabels: z.boolean().default(false),
    })
    .default({
      theme: "default",
      variant: "default",
      safeAreaProfile: "baseline",
      showSceneLabels: false,
    }),
  audio: z
    .object({
      mode: z.enum(["auto", "narration", "music", "silent"]).default("auto"),
      narrationText: z.string().optional(),
      narrationSrc: z.string().optional(),
      narrationVolume: z.number().min(0).max(1).default(1),
      musicSrc: z.string().optional(),
      musicVolume: z.number().min(0).max(1).default(0.16),
      ducking: z.boolean().default(true),
    })
    .default({
      mode: "auto",
      narrationVolume: 1,
      musicVolume: 0.16,
      ducking: true,
    }),
  assets: z
    .object({
      logoSrc: z.string().optional(),
      posterSrc: z.string().optional(),
    })
    .default({}),
  scenes: z.array(scene).min(1),
});

export type VideoSpec = z.infer<typeof VideoSpecSchema>;

export function dimensions(aspect: VideoSpec["target"]["aspect"]) {
  if (aspect === "9:16") return { width: 1080, height: 1920 };
  if (aspect === "4:5") return { width: 1080, height: 1350 };
  return { width: 1080, height: 1080 };
}

export function compositionId(spec: VideoSpec): string {
  const suffix =
    spec.target.aspect === "9:16"
      ? "Vertical"
      : spec.target.aspect === "4:5"
        ? "Portrait"
        : "Square";
  return `InstavarTemplate${suffix}`;
}

export function durationInFrames(spec: VideoSpec): number {
  if (spec.target.durationMode === "fixed" && spec.target.fixedDurationSec) {
    return Math.max(
      1,
      Math.round(spec.target.fixedDurationSec * spec.target.fps),
    );
  }
  const milliseconds = spec.scenes.reduce(
    (sum, item) => sum + (item.timing?.durationMs ?? 3000),
    0,
  );
  return Math.max(1, Math.round((milliseconds / 1000) * spec.target.fps));
}

export function expectsAudibleAudio(spec: VideoSpec): boolean {
  if (spec.audio.mode === "silent") return false;
  if (spec.audio.mode === "narration") return true;
  if (spec.audio.mode === "music") return true;
  return Boolean(spec.audio.narrationSrc || spec.audio.musicSrc);
}

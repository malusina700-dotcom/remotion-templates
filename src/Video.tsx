import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";

import type { VideoSpec } from "./schema";

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function Scene({ scene, accent }: { scene: VideoSpec["scenes"][number]; accent: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, fps * 0.35], [0, 1], { extrapolateRight: "clamp" });
  const title = stringValue(scene.content.title, stringValue(scene.content.line1, scene.kind));
  const subtitle = stringValue(scene.content.subtitle, stringValue(scene.content.line2));
  const points = Array.isArray(scene.content.points) ? scene.content.points.filter((point): point is string => typeof point === "string") : [];
  const equations = Array.isArray(scene.content.latexBlocks) ? scene.content.latexBlocks.filter((item): item is string => typeof item === "string") : [];
  return (
    <AbsoluteFill style={{ background: "#071526", color: "#f8fafc", padding: "9%", justifyContent: "center", fontFamily: "Arial, sans-serif", opacity }}>
      <div style={{ color: accent, fontSize: 28, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", marginBottom: 28 }}>{scene.kind}</div>
      <div style={{ fontSize: 76, lineHeight: 1.04, fontWeight: 800, maxWidth: 900 }}>{title}</div>
      {subtitle ? <div style={{ fontSize: 38, lineHeight: 1.3, color: "#cbd5e1", marginTop: 28 }}>{subtitle}</div> : null}
      {points.length ? <div style={{ display: "grid", gap: 20, marginTop: 48 }}>{points.map((point) => <div key={point} style={{ fontSize: 38, paddingLeft: 30, borderLeft: `8px solid ${accent}` }}>{point}</div>)}</div> : null}
      {equations.length ? <div style={{ display: "grid", gap: 24, marginTop: 48 }}>{equations.map((equation) => <code key={equation} style={{ fontSize: 40, background: "#0f2742", padding: 24, borderRadius: 18 }}>{equation}</code>)}</div> : null}
      {scene.kind === "video-window" ? <div style={{ marginTop: 48, border: `3px dashed ${accent}`, borderRadius: 24, padding: 50, fontSize: 28, color: "#cbd5e1" }}>Add or replace source media: {stringValue(scene.content.src, "not set")}</div> : null}
    </AbsoluteFill>
  );
}

export function TemplateVideo({ spec }: { spec: VideoSpec }) {
  const accent = spec.templateFamily === "finance-brief" ? "#f59e0b" : spec.templateFamily === "proof-walkthrough" ? "#a78bfa" : "#38bdf8";
  const { fps } = useVideoConfig();
  let cursor = 0;
  return (
    <AbsoluteFill>
      {spec.scenes.map((scene) => {
        const frames = Math.max(1, Math.round(((scene.timing?.durationMs ?? 3000) / 1000) * fps));
        const from = cursor;
        cursor += frames;
        return <Sequence key={scene.id} from={from} durationInFrames={frames}><Scene scene={scene} accent={accent} /></Sequence>;
      })}
    </AbsoluteFill>
  );
}

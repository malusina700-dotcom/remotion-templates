import { spawnSync } from "node:child_process";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { VideoSpecSchema } from "../src/schema";

function option(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const input = process.argv[2];
if (!input) throw new Error("Pass a VideoSpec path.");
const absolute = path.resolve(input);
const spec = VideoSpecSchema.parse(
  JSON.parse(await readFile(absolute, "utf8")),
);
const text = spec.audio.narrationText?.trim();
if (!text) {
  throw new Error("Add audio.narrationText before running video:narrate.");
}

const provider = option("--provider") ?? "system";
const force = process.argv.includes("--force");
const outputRelative = `public/generated/${spec.id}-narration.wav`;
const output = path.resolve(outputRelative);
await mkdir(path.dirname(output), { recursive: true });
if (!force) {
  try {
    await writeFile(output, "", { flag: "wx" });
    await unlink(output);
  } catch {
    throw new Error(
      `${outputRelative} already exists. Pass --force to replace it.`,
    );
  }
}

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${command} exited with status ${result.status ?? "unknown"}.`,
    );
  }
}

function audioDurationMs(filename: string): number {
  const result = spawnSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filename,
    ],
    { encoding: "utf8" },
  );
  if (result.error || result.status !== 0) {
    throw new Error("ffprobe is required to bind scene timing to narration.");
  }
  const seconds = Number(result.stdout.trim());
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error("Could not measure generated narration duration.");
  }
  return Math.ceil(seconds * 1000 + 500);
}

if (provider === "system") {
  if (process.platform === "darwin") {
    const intermediate = `${output}.aiff`;
    run("say", ["-o", intermediate, text]);
    run("ffmpeg", [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      intermediate,
      "-ar",
      "48000",
      "-ac",
      "1",
      output,
    ]);
    await unlink(intermediate);
  } else if (process.platform === "linux") {
    run("espeak-ng", ["-w", output, text]);
  } else {
    throw new Error(
      "The built-in system provider supports macOS and Linux. Use --provider custom on this platform.",
    );
  }
} else if (provider === "custom") {
  const encoded = process.env.INSTAVAR_TTS_COMMAND_JSON;
  if (!encoded) {
    throw new Error(
      "Set INSTAVAR_TTS_COMMAND_JSON to a JSON array containing an executable and arguments. Use {text} and {output} placeholders.",
    );
  }
  const command = JSON.parse(encoded) as unknown;
  if (
    !Array.isArray(command) ||
    !command.every((item) => typeof item === "string") ||
    command.length === 0
  ) {
    throw new Error(
      "INSTAVAR_TTS_COMMAND_JSON must be a non-empty JSON string array.",
    );
  }
  const expanded = command.map((item) =>
    item.replaceAll("{text}", text).replaceAll("{output}", output),
  );
  run(expanded[0], expanded.slice(1));
} else {
  throw new Error(
    `Unknown TTS provider: ${provider}. Choose system or custom.`,
  );
}

const measuredDurationMs = audioDurationMs(output);
const currentDurationMs = spec.scenes.reduce(
  (sum, scene) => sum + (scene.timing?.durationMs ?? 3000),
  0,
);
const shouldBindTiming = spec.target.durationMode === "auto";
const timedScenes = shouldBindTiming
  ? spec.scenes.map((scene) => ({
      ...scene,
      timing: {
        ...scene.timing,
        durationMs: Math.max(
          800,
          Math.round(
            ((scene.timing?.durationMs ?? 3000) / currentDurationMs) *
              measuredDurationMs,
          ),
        ),
      },
    }))
  : spec.scenes;
const updated = {
  ...spec,
  audio: {
    ...spec.audio,
    mode: "narration" as const,
    narrationSrc: outputRelative,
  },
  scenes: timedScenes,
};
await writeFile(absolute, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
console.log(`Narration: ${output}`);
console.log(`Measured narration with tail: ${measuredDurationMs} ms`);
if (shouldBindTiming)
  console.log("Scene timings scaled to narration duration.");
console.log(`Updated: ${absolute}`);

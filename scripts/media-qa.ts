import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

import type { VideoSpec } from "../src/schema";
import { expectsAudibleAudio } from "../src/schema";

export type MediaQaResult = {
  audioExpected: boolean;
  audioStream: boolean;
  maxVolumeDb: number | null;
  passed: boolean;
  summary: string;
};

function commandExists(command: string): boolean {
  const result = spawnSync(command, ["-version"], { encoding: "utf8" });
  return !result.error && result.status === 0;
}

export function inspectRenderedMedia(
  output: string,
  spec: VideoSpec,
): MediaQaResult {
  if (!existsSync(output)) {
    return {
      audioExpected: expectsAudibleAudio(spec),
      audioStream: false,
      maxVolumeDb: null,
      passed: false,
      summary: `Rendered file does not exist: ${output}`,
    };
  }
  if (!commandExists("ffprobe") || !commandExists("ffmpeg")) {
    return {
      audioExpected: expectsAudibleAudio(spec),
      audioStream: false,
      maxVolumeDb: null,
      passed: !expectsAudibleAudio(spec),
      summary:
        "ffmpeg and ffprobe are required for post-render audio verification.",
    };
  }

  const probe = spawnSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-select_streams",
      "a",
      "-show_entries",
      "stream=index",
      "-of",
      "csv=p=0",
      output,
    ],
    { encoding: "utf8" },
  );
  const audioStream = Boolean(probe.stdout.trim());
  const expected = expectsAudibleAudio(spec);
  if (!audioStream) {
    return {
      audioExpected: expected,
      audioStream,
      maxVolumeDb: null,
      passed: !expected,
      summary: expected
        ? "Audio was expected, but the MP4 has no audio stream."
        : "Intentional silent render has no audio stream.",
    };
  }

  const volume = spawnSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-i",
      output,
      "-map",
      "0:a:0",
      "-af",
      "volumedetect",
      "-f",
      "null",
      "-",
    ],
    { encoding: "utf8" },
  );
  const diagnostic = `${volume.stdout}\n${volume.stderr}`;
  const match = diagnostic.match(
    /max_volume:\s*(-?(?:\d+(?:\.\d+)?|inf))\s*dB/i,
  );
  const maxVolumeDb = match
    ? match[1].toLowerCase() === "-inf"
      ? Number.NEGATIVE_INFINITY
      : Number(match[1])
    : null;
  const audible = maxVolumeDb !== null && maxVolumeDb > -60;
  return {
    audioExpected: expected,
    audioStream,
    maxVolumeDb,
    passed: expected ? audible : true,
    summary: expected
      ? audible
        ? `Audible audio verified at ${maxVolumeDb?.toFixed(1)} dB peak.`
        : `Audio stream is effectively silent at ${maxVolumeDb ?? "unknown"} dB peak.`
      : `Audio stream present at ${maxVolumeDb ?? "unknown"} dB peak; silence was not required.`,
  };
}

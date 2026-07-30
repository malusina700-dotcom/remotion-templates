import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { compositionId, VideoSpecSchema } from "../src/schema";

export async function loadSpec(input?: string) {
  if (!input) throw new Error("Pass a VideoSpec path, for example examples/proof-walkthrough.video.json");
  const absolute = path.resolve(input);
  const spec = VideoSpecSchema.parse(JSON.parse(await readFile(absolute, "utf8")));
  return { absolute, spec };
}

export async function writeProps(spec: unknown): Promise<string> {
  const directory = path.resolve("out", ".render");
  await mkdir(directory, { recursive: true });
  const propsPath = path.join(directory, "props.json");
  await writeFile(propsPath, `${JSON.stringify({ spec }, null, 2)}\n`, "utf8");
  return propsPath;
}

export function runRemotion(args: string[]): void {
  const executable = process.platform === "win32" ? "npx.cmd" : "npx";
  const child = spawnSync(executable, ["remotion", ...args], { stdio: "inherit" });
  if (child.error) throw child.error;
  if (child.status !== 0) process.exit(child.status ?? 1);
}

export { compositionId };

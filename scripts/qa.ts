import path from "node:path";

import { inspectRenderedMedia } from "./media-qa";
import { loadSpec } from "./shared";

const outputArg = process.argv[3];
const { spec } = await loadSpec(process.argv[2]);
const output = path.resolve(outputArg ?? path.join("out", `${spec.id}.mp4`));
const result = inspectRenderedMedia(output, spec);
console.log(result.summary);
if (!result.passed) process.exit(1);

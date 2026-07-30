import path from "node:path";

import { compositionId, loadSpec, runRemotion, writeProps } from "./shared";

const { spec } = await loadSpec(process.argv[2]);
const propsPath = await writeProps(spec);
const output = path.resolve(
  process.argv[3] ?? path.join("out", `${spec.id}.mp4`),
);
runRemotion([
  "render",
  "src/index.ts",
  compositionId(spec),
  output,
  "--props",
  propsPath,
]);
console.log(`Rendered: ${output}`);

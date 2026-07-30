import { loadSpec, runRemotion, writeProps } from "./shared";

const { spec } = await loadSpec(process.argv[2]);
const propsPath = await writeProps(spec);
runRemotion(["studio", "src/index.ts", "--props", propsPath]);

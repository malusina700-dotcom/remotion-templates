import { loadSpec } from "./shared";
import { evaluateSpec } from "../src/quality";

try {
  const { absolute, spec } = await loadSpec(process.argv[2]);
  console.log(`Valid VideoSpec: ${spec.id}`);
  console.log(`Template: ${spec.templateFamily}`);
  console.log(`Aspect: ${spec.target.aspect}`);
  console.log(`File: ${absolute}`);
  const issues = evaluateSpec(spec);
  for (const issue of issues) {
    console.log(
      `${issue.level.toUpperCase()} [${issue.code}] ${issue.message}`,
    );
  }
  if (issues.some((issue) => issue.level === "error")) process.exit(1);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

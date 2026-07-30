import { loadSpec } from "./shared";

try {
  const { absolute, spec } = await loadSpec(process.argv[2]);
  console.log(`Valid VideoSpec: ${spec.id}`);
  console.log(`Template: ${spec.templateFamily}`);
  console.log(`Aspect: ${spec.target.aspect}`);
  console.log(`File: ${absolute}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

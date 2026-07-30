---
name: make-video
description: Create, validate, preview, and render a local video with the Eclat Remotion templates and VideoSpec.
---

# Make a video

1. If the `eclat-remotion` MCP server is connected, call `get_capabilities`, `list_templates`, and `get_template`. Otherwise use the template list in the README.
2. Ask for any missing brief details that materially affect the result: audience, goal, platform, aspect ratio, duration, source media, and call to action.
3. Create or scaffold a `*.video.json` VideoSpec. Use only published template and scene identifiers. Write the creative copy from the user's brief. Do not treat placeholder copy as finished content.
4. Run `npm run video:validate -- <spec>` and fix every blocking error.
5. Run `npm run video:preview -- <spec>`. Check the opening, a dense middle scene, and the ending at the target aspect ratio. Correct clipping, weak hierarchy, unreadable copy, or timing problems.
6. Run `npm run video:render -- <spec>` only after validation and preview are satisfactory.
7. Report the exact spec and MP4 paths plus any unresolved warnings. Do not claim a render succeeded unless the output exists.

Keep all creative assets local unless the user explicitly approves an upload. Ask before using paid services or publishing to an external platform.

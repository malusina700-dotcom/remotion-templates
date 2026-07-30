# Eclat Remotion Templates

Open-source, agent-friendly Remotion templates for turning a brief into a validated local video. The creative work happens in your Codex or Claude Code conversation. The Eclat MCP server supplies public template contracts, examples, and troubleshooting without requiring an Eclat API key.

[Open in Codex](codex://new?prompt=Clone%20https%3A%2F%2Fgithub.com%2Fcheeweijie%2Feclat-remotion-templates.git%20into%20a%20new%20local%20folder.%20Read%20AGENTS.md%20and%20.agents%2Fskills%2Fmake-video%2FSKILL.md.%20Add%20the%20public%20MCP%20server%20with%20codex%20mcp%20add%20eclat-remotion%20--url%20https%3A%2F%2Fmcp.eclatinstitute.sg%2Fvideo.%20Then%20ask%20me%20for%20my%20video%20brief%2C%20choose%20a%20template%2C%20create%20a%20VideoSpec%2C%20validate%20it%2C%20preview%20it%2C%20and%20render%20the%20MP4%20locally.)

If your browser blocks the app link, run:

```bash
git clone https://github.com/cheeweijie/eclat-remotion-templates.git
cd eclat-remotion-templates
npm install
codex mcp add eclat-remotion --url https://mcp.eclatinstitute.sg/video
codex
```

Then ask Codex to read `AGENTS.md` and make a video.

## Claude Code

```bash
git clone https://github.com/cheeweijie/eclat-remotion-templates.git
cd eclat-remotion-templates
npm install
claude mcp add --transport http eclat-remotion https://mcp.eclatinstitute.sg/video
claude
```

The repository also includes the same server in `.mcp.json`, so Claude Code can
offer to enable it when the project is trusted. Then ask Claude Code to read
`CLAUDE.md` and make a video. A direct custom connector does not require
publication in Anthropic's connector directory.

## Manual workflow

```bash
npm run video:validate -- examples/proof-walkthrough.video.json
npm run video:preview -- examples/proof-walkthrough.video.json
npm run video:render -- examples/proof-walkthrough.video.json
```

Rendered videos go to `out/` by default.

Create a starter spec:

```bash
npm run video:scaffold -- proof-walkthrough "Why this equation works"
```

## Templates

- `qa-ad`: hook, source-video placeholder, explanation, and call to action
- `proof-walkthrough`: equations, worked reasoning, and takeaway
- `announcement-brief`: headline, supporting points, and next action
- `social-remix`: caption-forward framing for an existing clip
- `finance-brief`: comparisons, numeric highlights, caveats, and recommendation

All five support `9:16`, `4:5`, and `1:1` output. The first public release intentionally uses a restrained shared visual system so the VideoSpec and agent workflow remain stable while more extracted template implementations are added.

## Privacy and keys

No Eclat account or API key is needed. The public MCP tools are read-only and deterministic. Your brief and local assets remain in your own agent conversation and workspace. Rendering runs on your machine.

## Licensing

Eclat-authored code in this repository is MIT licensed. Remotion has its own license and terms. Review the [current Remotion license](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) for your use case. See [TRADEMARKS.md](./TRADEMARKS.md) before using Eclat names or marks.

## Contributing and security

See [CONTRIBUTING.md](./CONTRIBUTING.md), [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md), and [SECURITY.md](./SECURITY.md).

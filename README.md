# Instavar Remotion Templates

Open-source, agent-friendly Remotion templates for turning a brief into a validated local video. The creative work happens in your Codex or Claude Code conversation. The Instavar MCP server supplies public template contracts, examples, and troubleshooting without requiring an Instavar account or API key.

[Open in Codex](codex://new?prompt=Clone%20https%3A%2F%2Fgithub.com%2Finstavar%2Fremotion-templates.git%20into%20a%20new%20local%20folder.%20Read%20AGENTS.md%20and%20.agents%2Fskills%2Fmake-video%2FSKILL.md.%20Add%20the%20public%20MCP%20server%20with%20codex%20mcp%20add%20instavar-remotion%20--url%20https%3A%2F%2Finstavar.com%2Fapi%2Fmcp%2Ftemplates.%20Then%20ask%20me%20for%20my%20video%20brief%2C%20choose%20a%20template%2C%20create%20a%20VideoSpec%2C%20validate%20it%2C%20preview%20it%2C%20and%20render%20the%20MP4%20locally.)

If your browser blocks the app link, run:

```bash
git clone https://github.com/instavar/remotion-templates.git
cd remotion-templates
npm install
codex mcp add instavar-remotion --url https://instavar.com/api/mcp/templates
codex
```

Then ask Codex to read `AGENTS.md` and make a video.

## Claude Code

```bash
git clone https://github.com/instavar/remotion-templates.git
cd remotion-templates
npm install
claude mcp add --transport http instavar-remotion https://instavar.com/api/mcp/templates
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

`video:preview` renders one midpoint frame for every scene into
`out/previews/<video-id>/`. This makes visual review possible in headless agent
environments. Add `--studio` to open Remotion Studio instead.

Create a starter spec:

```bash
npm run video:scaffold -- proof-walkthrough "Why this equation works"
```

## Audio without an API key

Audio intent is explicit. Set `audio.mode` to `narration`, `music`, or `silent`.
Do not rely on the presence of an MP4 audio stream because a stream can contain
only silence.

To generate narration with the operating system voice on macOS or Linux:

```bash
# First add the approved script to audio.narrationText.
npm run video:narrate -- my-video.video.json
```

The command writes a local WAV under `public/generated/`, updates
`audio.narrationSrc`, and scales automatic scene timings to the measured
narration duration. The generated directory is ignored by Git.

For private Supertonic narration with exact scene boundaries, open
`https://instavar.com/voice` and write one paragraph per scene. Download the
WAV and timing manifest, place the WAV under `public/generated/`, then run:

```bash
npm run video:timing -- my-video.video.json \
  --audio public/generated/narration.wav \
  --manifest ~/Downloads/instavar-supertonic-f1.timing.json
```

The command maps narration beats to scenes in order, rejects a beat-count
mismatch, records the measured timing in VideoSpec, and updates automatic scene
durations. The script and generation stay on the user's device. No API key,
hosted aligner, upload, or account is required. This provides scene-level sync,
not word-level caption timing.

To use another local engine, set a command array without invoking a shell. The
placeholders are replaced before the process starts:

```bash
export INSTAVAR_TTS_COMMAND_JSON='["/absolute/path/to/tts-wrapper","--text","{text}","--output","{output}"]'
npm run video:narrate -- my-video.video.json --provider custom
```

This adapter can wrap Supertonic, Kokoro, Audio8, NeuTTS, or another local
engine. Keep model weights and virtual environments outside this repository.

The default recommendation is deliberately small:

- Use the operating system voice for the fastest zero-download trial.
- Use Supertonic when a compact CPU-first model matters. Our bounded local test
  measured about 562 MB peak resident memory.
- Consider Kokoro when its voice set fits the brief. Our bounded local test
  measured about 1.69 GB peak resident memory.
- Treat Audio8 as an optional quality experiment, not the default download. Its
  checkpoint is about 2.4 GB, and short M2 runs used roughly 5.5 to 7 GB.
- Treat NeuTTS as a legacy advanced adapter. Our prior environment and model
  footprint was roughly 11 GB and required Python, model, codec, phonemizer,
  and reference-voice setup.

These measurements come from different prompts and runtimes. They establish
local feasibility, not a quality ranking.

After rendering, audio QA runs automatically. If the spec expects audio, the
command fails when no audio stream exists or the measured peak is at or below
-60 dB. Run the same check independently with:

```bash
npm run video:qa -- my-video.video.json out/my-video.mp4
```

## Templates

- `qa-ad`: hook, source-video placeholder, explanation, and call to action
- `proof-walkthrough`: equations, worked reasoning, and takeaway
- `announcement-brief`: headline, supporting points, and next action
- `social-remix`: caption-forward framing for an existing clip
- `finance-brief`: comparisons, numeric highlights, caveats, and recommendation

All five support `9:16`, `4:5`, and `1:1` output. The renderer now uses
scene-specific editorial layouts instead of printing internal scene identifiers
above a generic text block. `announcement-brief` supports hero, statement,
mechanism, outcome, and guidance scenes with light, dark, and clinical palettes.

The visual safeguards are defaults, not prompt suggestions:

- internal scene kinds stay hidden
- decorative eyebrow labels are omitted unless explicitly authored
- all-caps and implementation labels produce diagnostics
- long headlines and dense point lists produce diagnostics
- four-scene videos with weak layout variety produce diagnostics
- Fraunces carries display hierarchy and Inter carries body copy
- every scene receives a preview frame before the final render
- expected audio is checked for audible signal after rendering

## Privacy and keys

No Instavar account or API key is needed. The public MCP tools are read-only and deterministic. Your brief and local assets remain in your own agent conversation and workspace. Rendering runs on your machine.

An Instavar API key unlocks the hosted Studio workflow, including managed rendering, storage, review, publishing, and metrics through [`@instavar/mcp-server`](https://github.com/instavar/mcp-server). The free local path remains available without a key.

## Licensing

Instavar-authored code in this repository is MIT licensed. Remotion has its own license and terms. Review the [current Remotion license](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) for your use case. See [TRADEMARKS.md](./TRADEMARKS.md) before using Instavar names or marks.

## Contributing and security

See [CONTRIBUTING.md](./CONTRIBUTING.md), [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md), and [SECURITY.md](./SECURITY.md).

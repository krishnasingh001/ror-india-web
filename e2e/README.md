# Product demos (Playwright video)

Records product walkthroughs against local Vite + Rails.

## Prerequisites

1. Rails API on `http://localhost:3000`
2. Vite app on `http://localhost:5173`
3. Seeded accounts (`password123`):
   - Candidate: `avinash@rorindia.team`
   - Recruiter: `krishna+1@gmail.com`

## Investor demo (recommended — human flow + Kokoro voice)

Open-source [Kokoro](https://github.com/hexgrad/Kokoro-82M) narration (ChatGPT/Gemini-class quality, local). Screen is paced to each spoken beat.

```bash
# 1) Generate narration (once, or after editing investor-flow.json)
npm run demo:pitch:narrate

# 2) Record + collect + mux
DEMO_SLOW_MO=280 npm run demo:pitch
npm run demo:pitch:collect
./scripts/mux-investor-flow.sh \
  demo-videos/client-investor-demo-XXXX.webm \
  demo-videos/client-investor-demo-XXXX.timeline.json
```

Stable share file: `demo-videos/investor-demo-flow.mp4`

Edit spoken copy in `demo-videos/narration/investor-flow.json`, then re-run `demo:pitch:narrate`.

If you later add an OpenAI key, you can swap the engine to `gpt-4o-mini-tts` for [NaturalReaders](https://www.naturalreaders.com/online/)-style ChatGPT voices — Kokoro is the offline equivalent.


### Pitch outline

1. Brand landing + About
2. Public companies
3. Candidate sign-in + dashboard
4. Job search, apply/save
5. Saved jobs + profile
6. Track Applications board
7. Recruiter sign-in + hiring dashboard
8. Recruiter profile, company, post job
9. My jobs
10. Applications Kanban + applicant modal (status + comment)
11. Talent marketplace + saved profiles
12. Close on hiring dashboard

## Recruiter-only flow

```bash
npm run demo:recruiter
npm run demo:recruiter:collect
```

## Add AI voiceover (synced — recommended)

Demos write a step timeline. Narration is generated **per scene** (Neerja by default) and placed after the UI settles, so audio matches the screen.

```bash
npm run demo:pitch && npm run demo:pitch:collect
./scripts/add-synced-voiceover.sh \
  demo-videos/client-investor-demo-XXXX.webm \
  demo-videos/client-investor-demo-XXXX.timeline.json \
  demo-videos/narration/client-investor-timed.json

npm run demo:recruiter && npm run demo:recruiter:collect
./scripts/add-synced-voiceover.sh \
  demo-videos/recruiter-flow-XXXX.webm \
  demo-videos/recruiter-flow-XXXX.timeline.json \
  demo-videos/narration/recruiter-timed.json
```

Tune sync if the screen still feels late (increase lag/offset):

```bash
AUDIO_LAG=0.9 VIDEO_OFFSET=0.5 \
  VOICE=en-US-AvaMultilingualNeural RATE=-2% \
  ./scripts/add-synced-voiceover.sh <video> <timeline.json> <timed-lines.json>
```

Default voice is **Ava Multilingual** (natural Copilot-style). Alternatives:

```bash
VOICE=en-US-AndrewMultilingualNeural   # warm male
VOICE=en-IN-NeerjaExpressiveNeural     # India English, more expressive
VOICE=en-US-EmmaMultilingualNeural     # cheerful conversational
```

Edit per-step lines in `demo-videos/narration/*-timed.json`.

### Legacy continuous voiceover

One long script stretched to the full video (can drift from on-screen actions):

```bash
./scripts/add-voiceover.sh <video> demo-videos/narration/client-investor-script.txt
```

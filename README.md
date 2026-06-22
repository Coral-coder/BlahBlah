# BlahBlah 🗣️

An immersion-first language-learning app — like Duolingo, but the lessons are
generated on the fly by Claude and tailored to *you*. Lead languages are
**German** and **Mandarin Chinese**, but you can learn **any** language.

Built with **Expo / React Native + TypeScript** and the **Claude API**
(`claude-opus-4-8` by default).

## What it does

- **Pick any language & level.** German and Chinese are featured; a dozen more
  are one tap away; or type any language at all. Set your CEFR level (A1–C1).
- **AI-generated immersion lessons.** Give a topic ("ordering coffee") and Claude
  writes an immersion passage in the target language, 8 vocabulary cards (with
  pronunciation aids — pinyin for Chinese, romaji for Japanese, etc.), and 4
  exercises. Lessons are cached on-device so you can revisit them.
- **Conversation tutor.** Chat in your target language. Claude replies at your
  level, gently corrects you, keeps the conversation going, and offers a
  tap-to-reveal English translation of every reply.
- **Listen.** Tap 🔊 on any phrase to hear it via on-device text-to-speech.

## Getting started

```bash
npm install
npm start
```

Then press `i` (iOS simulator), `a` (Android), or `w` (web), or scan the QR code
with the **Expo Go** app on your phone.

### Add your Claude API key

1. Open the app → **Settings**.
2. Paste a key from the [Anthropic Console](https://console.anthropic.com/settings/keys).
3. (Optional) Choose a model — Opus 4.8 (best), Sonnet 4.6 (balanced), or
   Haiku 4.5 (fastest/cheapest).

The key is stored only on your device (AsyncStorage).

## Project structure

```
app/                 Screens (expo-router, file-based)
  _layout.tsx        Navigation stack + providers
  index.tsx          Home: language/level selection
  lesson.tsx         AI-generated immersion lessons
  immersion.tsx      Conversation tutor
  settings.tsx       API key + model
src/
  lib/claude.ts      Claude API calls (lesson gen + chat)
  lib/languages.ts   Featured languages, CEFR levels
  lib/storage.ts     AsyncStorage persistence
  lib/types.ts       Shared types
  state/AppContext.tsx  Global app state
  components/ui.tsx  Buttons, cards, chips
  theme.ts           Colors / spacing
```

## How the AI works

- **Lessons** use Claude's **structured outputs** (`output_config.format` with a
  JSON schema) so every lesson parses reliably into vocabulary + exercises.
- **Conversation** sends the running history to Claude with a level- and
  language-aware system prompt; the reply carries an inline `[[EN: …]]` gloss
  that the app splits out for the translate toggle.

## ⚠️ Security note (read before shipping publicly)

This prototype calls the Claude API **directly from the device** using a key the
user supplies, which is great for personal use and demos. An embedded API key
can be extracted from network traffic, so for a **public release** you should:

1. Stand up a small backend that holds the Anthropic key server-side.
2. Add per-user authentication and rate limiting.
3. Point the app's `src/lib/claude.ts` calls at your backend instead of the
   Anthropic API.

## Roadmap ideas

- Spaced-repetition review of saved vocabulary
- Streaks & daily goals
- Speech *input* (speak your answers) via on-device speech recognition
- Grammar deep-dives generated on demand

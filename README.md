# BlahBlah 🗣️

An immersion-first language-learning app — like Duolingo, but the lessons are
generated on the fly by Claude and tailored to *you*. Lead languages are
**German** and **Mandarin Chinese**, but you can learn **any** language.

Built with **bare React Native + TypeScript** (no Expo) and the **Claude API**
(`claude-opus-4-8` by default). CI compiles with Xcode and ships straight to
**TestFlight** via Fastlane using only your Apple Developer account.

## What it does

- **Pick any language & level.** German and Chinese are featured; more are one
  tap away; or type any language at all. Set your CEFR level (A1–C1).
- **AI-generated immersion lessons.** Give a topic ("ordering coffee") and Claude
  writes an immersion passage in the target language, vocabulary cards (with
  pronunciation aids — pinyin for Chinese, romaji for Japanese, etc.), and
  exercises. Lessons are cached on-device.
- **Conversation tutor.** Chat in your target language. Claude replies at your
  level, gently corrects you, and offers a tap-to-reveal English translation.
- **Listen.** Tap 🔊 on any phrase to hear it (device text-to-speech).

## Run it locally

Requires Xcode + CocoaPods (macOS) for iOS.

```bash
npm install
bundle install
bundle exec pod install --project-directory=ios
npm run ios        # or: open ios/BlahBlah.xcworkspace in Xcode
# Android: npm run android
```

Then open **Settings** in the app and paste a Claude API key from the
[Anthropic Console](https://console.anthropic.com/settings/keys). The key is
stored only on the device.

## Ship to TestFlight

Push a `v*` tag (or run the **iOS → TestFlight** GitHub Action manually) and it
builds with Xcode and uploads to TestFlight — your Apple account only, no Expo /
EAS / second account. Auth is an App Store Connect API key with **Xcode cloud
signing**, so there are no cert/profile files to manage — just three GitHub
secrets (`APPSTORE_API_KEY_ID`, `APPSTORE_API_PRIVATE_KEY`, `APPSTORE_ISSUER_ID`;
Team ID lives in `fastlane/Appfile`). Full setup in
**[docs/TESTFLIGHT.md](docs/TESTFLIGHT.md)**.

```bash
git tag v0.1.0 && git push origin v0.1.0
```

## Project structure

```
ios/                 Native iOS project (Xcode) — bundle id com.lightwave.blahblah
android/             Native Android project
App.tsx              Root: providers + lightweight stack navigator + header
index.js             React Native entry point
src/
  screens/           HomeScreen, LessonScreen, ImmersionScreen, SettingsScreen
  navigation.tsx     Minimal stack navigator (no extra native deps)
  state/AppContext   Global app state (settings, language, level)
  lib/claude.ts      Claude API calls (lesson generation + chat)
  lib/speech.ts      Text-to-speech wrapper (react-native-tts)
  lib/languages.ts   Featured languages + CEFR levels
  lib/storage.ts     AsyncStorage persistence
  lib/types.ts       Shared types
  components/ui.tsx  Buttons, cards, chips
  theme.ts           Colors / spacing
fastlane/            Fastfile (lane :beta) + Appfile
.github/workflows/   testflight.yml (Xcode build → TestFlight)
```

## How the AI works

- **Lessons** ask Claude for a strict JSON object and parse it (tolerant of code
  fences) into vocabulary + exercises.
- **Conversation** sends the running history with a level- and language-aware
  system prompt; the reply carries an inline `[[EN: …]]` gloss that the app
  splits out for the translate toggle.

## ⚠️ Security note

The app calls the Claude API **directly from the device** with a user-supplied
key — fine for personal use and demos, but an embedded key can be extracted from
traffic. For a public release, proxy these calls through a backend that holds the
Anthropic key server-side and add per-user auth + rate limiting, then point
`src/lib/claude.ts` at your backend.

## Roadmap ideas

- Spaced-repetition review of saved vocabulary
- Streaks & daily goals
- Speech *input* (speak your answers)
- Grammar deep-dives on demand

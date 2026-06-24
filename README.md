# BlahBlah 🗣️ — *better than Duolingo*

A structured, guided language-learning app. You follow a path of bite-sized
lessons made of interactive exercises, and the app always shows you exactly what
to do next. Built with **bare React Native + TypeScript** (no Expo). Course
content is hand-authored and expanded by a generator — no AI writing lessons at
runtime. Ships to TestFlight via `.github/workflows/testflight.yml`.

> This branch (`claude/blahblah-next`) is the **dreaming branch**: new features
> are built and documented here continuously, then cherry-picked to ship. See the
> **[Dream Log](#dream-log)** at the bottom for the running changelog.

## Languages

German 🇩🇪 (to C2), Chinese 🇨🇳 (with pinyin), Spanish 🇪🇸, Thai 🇹🇭 (intensive),
Icelandic 🇮🇸. Vocabulary builds gradually — one new word at a time with heavy
spaced review between introductions.

## Core learning

- **Guided path.** Sections → units → lessons. The current lesson pulses with a
  **START** badge; finished lessons show **crowns**; completed units auto-collapse;
  the path auto-scrolls to where you are.
- **Placement test** to skip ahead if you already know some.
- **Interactive exercises:**
  - **Card** — picture (emoji) intro for a new word
  - **Word bank** — tap tiles to build the translation
  - **Fill in the blank** — choose the missing word
  - **Match** — pair words with meanings (tap either side)
  - **Multiple choice** — pick the right translation
  - **Listen** — hear it and rebuild it
  - **Speak** — say the whole sentence; pronunciation is scored
  - **Type** — write the translation from memory (forgiving of accents/typos)
- **Tap-to-translate.** Tap any dotted word (or hold a tile/option) in a lesson to
  see its meaning and hear it — built from a per-course glossary.
- **Mastery-gated.** Wrong answers come back around; hearts add light stakes.

## Natural voices (on-device) ✨

Free neural TTS that runs **entirely on the phone** — including **Icelandic**,
which iOS doesn't offer. Voices (Piper / MMS via sherpa-onnx) are hosted in this
repo's Releases and downloaded on demand from **Settings → Natural voices**. Fully
offline once downloaded; falls back to the system voice otherwise.

## Motivation & gamification

- **Streaks** with a **Streak Freeze** power-up (buy with gems; auto-protects a
  missed day).
- **Gems** currency, earned per lesson and from quests.
- **Daily Quests** — 3 rotating challenges/day with gem rewards.
- **Crowns / mastery levels** — replay finished lessons to level them up (1–5).
- **Achievements** — milestone badges across lessons, words, streaks, XP, languages.
- **Daily goal**, weekly XP chart, animated mascot, and daily reminder notifications.

## Practice & immersion

- **Review (SRS)** — spaced-repetition recall of your weak words; due scheduling.
- **Practice mistakes**, **Dictation**, **Grammar tips**.
- **Stories** (auto-scrolling, read aloud), **Role-play** (act a scene aloud),
  **Watch**, **News**, and **AI Story** generation.
- **Words you know** list, **Match Blitz** game, **character tracing** practice
  (fading stencil guides for non-Latin scripts).

## Polish

Juicy 3D buttons, animated progress bars, pulsing path nodes, screen transitions,
animated tab bar and splash.

## Run it locally

Requires Xcode + CocoaPods (macOS) for iOS.

```bash
npm install
bundle install
bundle exec pod install --project-directory=ios
npm run ios        # or open ios/BlahBlah.xcworkspace in Xcode
```

## Ship to TestFlight

Push to the delivery branch (or run the **iOS → TestFlight** Action). Each ship
carries tester notes from `fastlane/testflight_notes.txt`. The neural voice packs
are (re)published by the **Publish voice models** workflow. Setup + secrets:
**[docs/TESTFLIGHT.md](docs/TESTFLIGHT.md)**.

## Project structure

```
App.tsx                  Providers + bottom-tab shell (Learn / Profile) + router + transitions
src/
  curriculum/
    types.ts             Course → Section → Unit → Lesson → Exercise model
    generate.ts          Blueprint → many spaced-repetition lessons
    blueprints/          Per-language vocab + sentences (de, zh, es, th, is, + themes)
    index.ts             COURSES registry + getCourse()
  lesson/engine.ts       Answer checking (incl. forgiving typed grading), XP
  state/ProgressContext  Persisted store: XP, gems, streak+freezes, quests, crowns, …
  navigation.tsx         Small stack navigator (useNav / useRoute)
  components/            Exercise.tsx (all exercise renderers), ui.tsx, Mascot, Confetti
  screens/               Path, Lesson, Review, Stories, Settings, Achievements, …
  lib/
    speech.ts            TTS routing (neural ↔ system)
    neuralTts.ts         Bridge to the on-device sherpa-onnx engine
    voiceModels.ts       Downloadable voice catalog + cache manager
    glossary.ts          Per-course word→meaning lookup (tap-to-translate)
    srs.ts, learned.ts, sfx.ts, reminders.ts, achievements.ts, ai.ts
  theme.ts               Colors / spacing / shadow
modules/blah-neural-tts  Native ObjC++ module wrapping sherpa-onnx (TTS)
fastlane/                Fastfile (lane :beta) + tester notes
.github/workflows/       testflight.yml, voice-models.yml
```

## Dream Log

Running changelog of features dreamed up on this branch (newest first).

- **What's-new card** in Settings; version bumped to 0.3.0.
- **Sound-effects toggle** — mute the UI sounds from Settings.
- **Unit progress bars** — each unit header on the path shows a white progress
  bar of lessons completed.
- **Streak milestones** — a one-time confetti toast at 3/7/14/30/60/100/180/365-day streaks.
- **Daily-goal celebration** — confetti + a toast the first time you hit your
  daily XP goal each day.
- **Share progress** — a one-tap native share sheet posting your streak + XP.
- **Flashcards** — a classic self-test deck over your learned words: tap to flip
  (with audio), mark "Got it"/"Again"; missed cards loop until the deck clears.

- **Feedback pass** — audio exercises now swap to a written equivalent instead of a
  free skip; the path re-scrolls so the next lesson sits in "second place"; richer
  sound effects; supercharged lesson-complete (emoji pop, XP count-up, PERFECT
  badge, more confetti); colorful tile menu; a first-run prompt to download a
  natural voice ("pronunciation is key").

- **Combo meter** — consecutive correct answers build a 🔥 combo in-lesson, with
  bonus XP for long perfect runs.
- **Tricky words** — a Profile card surfacing your lowest-accuracy words (from
  recall stats), tap to hear.
- **Word of the Day** — a rotating vocabulary card on the path (tap to hear),
  refreshed daily from the course vocab.
- **Double or Nothing** — wager 💎50 that you'll practice every day for 7 days to
  win 💎100. Tracked by completion days; miss one and it's lost.
- **Weekly League** — a Duolingo-style XP leaderboard with simulated rivals,
  promotion/demotion zones, and tiers (Bronze→Diamond). Fully local & deterministic
  per week; your XP is real.
- **Challenge mode** — a Settings toggle that turns word-bank exercises into
  typed answers everywhere, for harder recall.
- **Slow replay** — long-press any 🔊 (or the listen replay) to hear it slowly;
  works with both neural and system voices.
- **Practice calendar** — a 5-week heatmap of your active days on the Profile tab,
  built from XP history (GitHub-contributions style).
- **Accent bar** — a tap row of language-specific special characters
  (ä ö ü ß · ñ ¿ ¡ · ð þ æ …) above the typing exercise, so you can enter them
  without the system keyboard.
- **Type-the-translation exercise** — typed production drill with forgiving
  grading (ignores case/spacing/accents, tolerates minor typos). Added to review
  lessons.
- **On-device neural voices** — sherpa-onnx engine + downloadable Piper/MMS voice
  packs (incl. Icelandic), Settings UI, system-voice fallback.
- **Crowns / mastery levels** — replay lessons to level them up 1–5; crown pips on
  the path; total crowns in the header.
- **Achievements** — 17 milestone badges with progress.
- **Gamification** — gems, daily quests, streak freezes.
- **Tap-to-translate** — tap/hold any word in a lesson for its meaning.
- **Visual polish** — 3D buttons, animated progress, pulsing nodes, transitions.

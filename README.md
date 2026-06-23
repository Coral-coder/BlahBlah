# BlahBlah 🗣️

A structured, guided language-learning app — Duolingo-style. You follow a path of
bite-sized lessons made of interactive exercises, and the app always shows you
exactly what to do next. Lead languages are **German** (full course) and
**Spanish**, with a content model built to add more.

Built with **bare React Native + TypeScript** (no Expo). Course content is
hand-authored data — there is no AI generating lessons at runtime. Ships to
TestFlight via the Fastlane pipeline in `.github/workflows/testflight.yml`.

## What it does

- **Guided learning path.** Sections → units → lessons laid out as a path. The
  next lesson is highlighted with **START**; finished lessons are gold; later
  lessons stay locked until you reach them. You never have to wonder what's next.
- **Placement test.** New to a language or not? A quick adaptive check gauges what
  you already know and starts you at the right unit (or start from zero).
- **Interactive exercises** that make you produce the language, not just read it:
  - **Word bank** — tap tiles to build the translation
  - **Fill in the blank** — choose the missing word
  - **Match** — pair words with their meanings
  - **Multiple choice** — pick the right translation
  - **Listen** — hear a sentence (device TTS) and rebuild it
- **Mastery-gated progress.** Wrong answers come back around later in the lesson;
  you finish only once you've gotten everything right. Hearts add light stakes.
- **Goals & motivation.** Daily XP goal, streaks, total XP, and per-course
  completion — all on the Profile tab.

## Run it locally

Requires Xcode + CocoaPods (macOS) for iOS.

```bash
npm install
bundle install
bundle exec pod install --project-directory=ios
npm run ios        # or open ios/BlahBlah.xcworkspace in Xcode
# Android: npm run android
```

No API keys or accounts needed — all content is bundled.

## Ship to TestFlight

Push a `v*` tag or a commit to the working branch (or run the **iOS → TestFlight**
Action) and it builds with Xcode 26 and uploads to TestFlight. Setup details and
the App Store Connect secrets are in **[docs/TESTFLIGHT.md](docs/TESTFLIGHT.md)**.

## Project structure

```
App.tsx                  Root: providers + bottom-tab shell (Learn / Profile) + router
src/
  curriculum/
    types.ts             Course → Section → Unit → Lesson → Exercise model + flattenCourse
    courses/de.ts        German course (5 units, 15 lessons, 90 exercises)
    courses/es.ts        Spanish course (2 units, 6 lessons, 36 exercises)
    index.ts             COURSES registry + getCourse()
  lesson/engine.ts       Answer checking, shuffling, XP
  state/ProgressContext  Persisted progress: XP, streak, daily goal, completion, placement
  navigation.tsx         Small stack navigator with params (useNav / useRoute)
  components/
    Exercise.tsx         Renderers for every exercise type (the interactive core)
    ui.tsx               Button, Card, Chip, ProgressBar, Hearts
  screens/
    CourseSelectScreen   Pick a language
    PlacementScreen      Placement test
    PathScreen           The guided learning path (Learn tab)
    LessonScreen         The exercise player
    LessonCompleteScreen End-of-lesson stats (XP, accuracy, streak)
    ProfileScreen        Goals, streak, progress (Profile tab)
    SettingsScreen       Reset progress, about
  lib/speech.ts          Text-to-speech (react-native-tts)
  theme.ts               Colors / spacing
fastlane/                Fastfile (lane :beta) + Appfile
.github/workflows/       testflight.yml (Xcode build → TestFlight)
```

## Adding content

A course is plain data conforming to `src/curriculum/types.ts`. Add a file under
`src/curriculum/courses/`, export a `Course`, and register it in
`src/curriculum/index.ts`. The path, placement test, and exercise player all work
automatically from the data — no UI changes needed.

## Roadmap ideas

- More languages and deeper units
- Spaced-repetition review of completed lessons
- Per-lesson "legendary"/crown levels and harder review sessions
- Optional AI conversation practice as a bonus mode

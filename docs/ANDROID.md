# Android build & shipping

The `Android → release build` workflow (`.github/workflows/android.yml`) builds a
signed Android release on every push to the delivery branch (and on `v*` tags or
manual dispatch), mirroring the iOS → TestFlight pipeline.

## What it does

1. `npm ci` + `npm run validate:content` (same content gate as iOS).
2. Sets up JDK 17 + Gradle.
3. Builds `bundleRelease` (AAB) and `assembleRelease` (APK).
4. Uploads both as a workflow artifact: `blahblah-android-<run#>`.
5. *(Optional)* uploads the AAB to the Google Play **internal** track if a Play
   service-account key is configured.

The app id is **`com.lightwave.blahblah`** (matches the iOS bundle id). The
`versionCode` is the CI run number, so it always increases; `versionName` comes
from `package.json`.

## Signing

Without any secret the release artifacts are **debug-signed** — still installable
for testing, but not acceptable for the Play Store. To produce upload-key-signed
builds, generate an upload keystore and add these repo secrets:

```bash
keytool -genkeypair -v -keystore upload-keystore.jks -alias blahblah \
  -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 upload-keystore.jks   # value for ANDROID_KEYSTORE_BASE64
```

| Secret | Meaning |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | base64 of `upload-keystore.jks` |
| `ANDROID_KEYSTORE_PASSWORD` | keystore (store) password |
| `ANDROID_KEY_ALIAS` | key alias (e.g. `blahblah`) |
| `ANDROID_KEY_PASSWORD` | key password |

These are read by `android/app/build.gradle` via env vars the workflow exports.

## Google Play upload (optional)

Add a Play **service-account JSON** as the secret `PLAY_JSON_KEY` and the workflow
will run `fastlane android beta`, which uploads the AAB to the **internal** testing
track as a draft release (notes come from `fastlane/testflight_notes.txt`).
Prerequisites: a Play Console account, the app created there once under the
`com.lightwave.blahblah` package, and the service account granted release access.

Until that secret exists, the pipeline is in **"signed artifact in CI"** mode: it
just attaches the AAB/APK to the run for you to download and distribute.

## Notes

- The on-device neural TTS engine (sherpa-onnx) is iOS-only today; on Android the
  app uses the system text-to-speech voice. Everything else is cross-platform.
- New Architecture is disabled and Hermes is enabled, matching iOS.

# Shipping BlahBlah to TestFlight

This is a **bare React Native** iOS app. CI compiles it with Xcode and uploads
straight to **TestFlight** via **Fastlane**, authenticating with an **App Store
Connect API key**. Xcode **cloud signing** handles the certificate and
provisioning profile automatically — no `.p12`, no `.mobileprovision`, no
keychain juggling. Only your Apple Developer account is involved (no Expo/EAS).

Pipeline: `.github/workflows/testflight.yml` → `fastlane/Fastfile` (lane `beta`).
Trigger by pushing a `v*` tag or running the workflow manually.

---

## Secrets (GitHub → Settings → Secrets and variables → Actions)

You already have the first two. Add the last two.

| Secret | Status | What it is / where to get it |
|---|---|---|
| `APPSTORE_API_KEY_ID` | ✅ you have it | The API key's **Key ID** |
| `APPSTORE_API_PRIVATE_KEY` | ✅ you have it | Contents of the `.p8` file (raw PEM or base64 — the workflow handles both) |
| `APPSTORE_ISSUER_ID` | ➕ add this | **Issuer ID** at the top of the App Store Connect → Keys page |
| `APPLE_TEAM_ID` | ➕ add this | 10-char **Team ID** from developer.apple.com → Membership |

That's the entire secret set.

### Where each value lives
- **Issuer ID**: App Store Connect → **Users and Access → Integrations → App
  Store Connect API** — it's the `Issuer ID` shown above the keys list (a UUID).
- **Team ID**: https://developer.apple.com/account → **Membership details** →
  *Team ID* (10 characters, e.g. `A1B2C3D4E5`).

Add them with the CLI if you prefer:
```bash
gh secret set APPSTORE_ISSUER_ID --body "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
gh secret set APPLE_TEAM_ID      --body "A1B2C3D4E5"
```

> The API key's role must allow creating signing assets — **Admin** is safest
> for the first run (it lets Xcode create the cloud-managed distribution
> certificate). **App Manager** works once that certificate already exists.

---

## One Apple-side prerequisite

Create the **app record** once, so the upload has somewhere to land:
**App Store Connect → Apps → +** with bundle id **`com.lightwave.blahblah`**.

(The App ID / identifier itself and all signing assets are created automatically
by Xcode cloud signing on the first build — you don't need to make a cert or
profile by hand.)

---

## Ship it

```bash
git tag v0.1.0
git push origin v0.1.0      # triggers the workflow
```

…or run **iOS → TestFlight** from the repo's **Actions** tab. The job:
`npm ci` → `pod install` → write the API key → Fastlane builds the signed `.ipa`
(cloud signing) → uploads to TestFlight. After Apple processes the build
(minutes to ~1hr) it appears under **App Store Connect → TestFlight**; add it to
a test group to invite testers.

The build number comes from the CI run number, so re-runs never collide.

---

## Build & run locally (optional, needs a Mac)

```bash
npm install
bundle install
bundle exec pod install --project-directory=ios
npm run ios          # or open ios/BlahBlah.xcworkspace in Xcode
```

---

## Troubleshooting

- **`Authentication credentials are missing/invalid`** → check
  `APPSTORE_API_KEY_ID`, `APPSTORE_ISSUER_ID`, and that `APPSTORE_API_PRIVATE_KEY`
  is the full `.p8` contents.
- **`No signing certificate / unable to create`** → the API key role can't create
  a distribution certificate; use an **Admin** key for the first build.
- **`No Accounts / DEVELOPMENT_TEAM` error** → `APPLE_TEAM_ID` missing or wrong.
- **`There is no app with bundle identifier …`** on upload → create the app
  record (above) with bundle id `com.lightwave.blahblah`.
- **Pod install fails** → `bundle exec pod repo update` then retry.

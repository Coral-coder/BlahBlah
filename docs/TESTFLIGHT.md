# Shipping BlahBlah to TestFlight

This is a **bare React Native** iOS app. CI compiles it with Xcode and uploads
straight to **TestFlight** via **Fastlane** — using **only your Apple Developer
account**. No Expo, no EAS, no second account. Every secret lives in GitHub
Actions secrets.

Pipeline: `.github/workflows/testflight.yml` → `fastlane/Fastfile` (lane `beta`).
Trigger it by pushing a `v*` tag or running the workflow manually.

---

## The secrets you need to import

Add all of these under **Repo → Settings → Secrets and variables → Actions →
New repository secret** (or with `gh secret set NAME`).

| Secret | What it is | How to get it |
|---|---|---|
| `ASC_API_KEY_P8` | App Store Connect API key (.p8), **base64** | See §1 |
| `ASC_KEY_ID` | The key's Key ID | Shown next to the key in §1 |
| `ASC_ISSUER_ID` | Your team's Issuer ID | Top of the Keys page in §1 |
| `APPLE_TEAM_ID` | 10-char Apple Developer Team ID | developer.apple.com → Membership |
| `BUILD_CERTIFICATE_BASE64` | Apple **Distribution** cert (.p12), **base64** | See §2 |
| `P12_PASSWORD` | Password you set when exporting the .p12 | You choose it in §2 |
| `BUILD_PROVISION_PROFILE_BASE64` | App Store provisioning profile, **base64** | See §3 |
| `PROVISIONING_PROFILE_NAME` | The profile's exact name | Shown in §3 |
| `KEYCHAIN_PASSWORD` | Any random string (temp CI keychain) | Make one up |

> `base64` a file on macOS with: `base64 -i FILE | pbcopy` (copies to clipboard).

---

## 1. App Store Connect API key (for upload)

1. **App Store Connect → Users and Access → Integrations → App Store Connect API**
   (https://appstoreconnect.apple.com/access/integrations/api).
2. **+** → name it, role **App Manager**, **Generate**.
3. Download the `.p8` (one-time download). Note the **Key ID** and the **Issuer
   ID** (top of the page).
4. Secrets:
   - `ASC_KEY_ID` = the Key ID
   - `ASC_ISSUER_ID` = the Issuer ID
   - `ASC_API_KEY_P8` = `base64 -i AuthKey_XXXX.p8`

## 2. Distribution certificate (for signing)

Easiest with Xcode on any Mac (one time):

1. Xcode → **Settings → Accounts**, add your Apple ID, select your team →
   **Manage Certificates → + → Apple Distribution**.
2. **Keychain Access** → **My Certificates** → right-click the *Apple
   Distribution* cert → **Export** → save as `.p12`, set a password.
3. Secrets:
   - `BUILD_CERTIFICATE_BASE64` = `base64 -i certificate.p12`
   - `P12_PASSWORD` = the password you just set

   *(No Mac handy? You can generate the cert via the Developer portal → Certificates,
   but exporting the private key as `.p12` requires the machine that created the CSR.)*

## 3. App ID + provisioning profile

1. **Developer portal → Identifiers** → register an App ID with bundle id
   **`com.lightwave.blahblah`** (if not already there).
2. **Profiles → + → App Store Connect** (distribution) → pick that App ID and
   your distribution cert → name it (e.g. `BlahBlah App Store`) → **Download**.
3. Secrets:
   - `BUILD_PROVISION_PROFILE_BASE64` = `base64 -i BlahBlah_App_Store.mobileprovision`
   - `PROVISIONING_PROFILE_NAME` = the exact profile name (e.g. `BlahBlah App Store`)

## 4. Create the app record

In **App Store Connect → Apps → +** create the app with bundle id
`com.lightwave.blahblah`. The first TestFlight upload needs this to exist.

---

## Ship it

```bash
git tag v0.1.0
git push origin v0.1.0      # triggers the workflow
```

…or run **iOS → TestFlight** from the repo's **Actions** tab. The job:
`npm ci` → `pod install` → import signing assets → Fastlane builds the `.ipa`
and uploads it. After Apple processes the build (minutes to ~1hr) it appears in
**App Store Connect → TestFlight**; add it to a test group to invite testers.

Fastlane auto-bumps the build number above whatever is already on TestFlight, so
re-running never collides.

---

## Build & run locally (optional)

```bash
npm install
bundle install
bundle exec pod install --project-directory=ios
npm run ios          # or open ios/BlahBlah.xcworkspace in Xcode
```

---

## Troubleshooting

- **`No profiles for 'com.lightwave.blahblah'`** → `PROVISIONING_PROFILE_NAME`
  doesn't match the profile, or the profile/cert/App ID don't all line up.
- **`Authentication credentials are missing`** on upload → check the three
  `ASC_*` secrets; the `.p8` must be base64 and the key role must allow uploads.
- **Code signing error in Xcode build** → the `.p12` cert and the provisioning
  profile must be the *same* distribution identity; re-export both from §2/§3.
- **`latest_testflight_build_number` fails** → the app record (§4) doesn't exist
  yet, or the bundle id differs.
- **Pod install fails** → run `bundle exec pod repo update` then retry.

# Shipping BlahBlah to TestFlight

This is a native iOS app (Expo / React Native). You build and ship it with
**EAS** — Expo's cloud build service — so you don't need a Mac, Xcode, or to
wrangle provisioning profiles by hand. CI lives in
`.github/workflows/testflight.yml`.

There are only **two secrets** in the whole pipeline:

| Secret | Where it lives | What it's for |
|---|---|---|
| **Expo access token** | GitHub Actions secret `EXPO_TOKEN` | Lets CI run EAS builds on your Expo account |
| **App Store Connect API key** | Stored **in EAS** (one-time) | Lets EAS upload the build to TestFlight |

The App Store Connect key is stored inside EAS, not GitHub — so GitHub only ever
holds `EXPO_TOKEN`.

---

## Prerequisites (one time)

1. **Apple Developer Program** membership ($99/yr) — https://developer.apple.com/programs/
2. **Expo account** — https://expo.dev (free)
3. Locally: `npm install -g eas-cli` then `eas login`

---

## Step 1 — Link the project to EAS

From the repo root:

```bash
eas init          # creates the EAS project, writes extra.eas.projectId into app.json
eas build:configure   # confirms iOS build config (eas.json is already in the repo)
```

Commit the `app.json` change that `eas init` makes.

---

## Step 2 — Create an App Store Connect API key

1. Go to **App Store Connect → Users and Access → Integrations → App Store Connect API**
   (https://appstoreconnect.apple.com/access/integrations/api).
2. Click **+**, give it a name, role **App Manager**, **Generate**.
3. **Download the `.p8` file** (you can only download it once) and note:
   - **Key ID** (e.g. `ABC123XYZ`)
   - **Issuer ID** (a UUID at the top of the page)

---

## Step 3 — Hand the App Store Connect key to EAS (one time)

Run an interactive submit once. EAS will ask for the `.p8`, Key ID, and Issuer
ID, then **store them encrypted on your Expo account** so CI never needs them:

```bash
# Build once and submit interactively to register credentials with EAS
eas build --platform ios --profile production --auto-submit
```

When prompted:
- Let EAS **generate/manage your iOS signing credentials** (say yes).
- Choose **App Store Connect API Key** and point it at the `.p8` from Step 2.

After this completes once, EAS remembers everything. You'll also need to
**create the app record** in App Store Connect (EAS offers to do this, or create
it manually with bundle id `com.lightwave.blahblah`).

---

## Step 4 — Add the one GitHub secret

Create an Expo access token: https://expo.dev/settings/access-tokens → **Create token**.

Then add it to the repo (pick one):

**With the GitHub CLI:**
```bash
gh secret set EXPO_TOKEN --body "exp_xxxxxxxxxxxxxxxx"
```

**Or in the UI:** Repo → **Settings → Secrets and variables → Actions → New
repository secret** → name `EXPO_TOKEN`, value = your token.

---

## Step 5 — Ship it

Either push a version tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

…or run the **iOS → TestFlight** workflow manually from the repo's **Actions**
tab. EAS builds the `.ipa` in the cloud and uploads it to TestFlight. After
Apple finishes processing (a few minutes to ~1hr), it appears in **App Store
Connect → TestFlight**; add it to a test group to invite testers.

---

## "I'd rather keep ALL secrets in GitHub"

If you don't want EAS to hold the App Store Connect key, you can instead store it
as GitHub secrets and write the `.p8` at build time. Add secrets
`ASC_API_KEY_BASE64`, `ASC_KEY_ID`, `ASC_ISSUER_ID`, then in the workflow before
the build step:

```yaml
      - name: Restore App Store Connect API key
        run: echo "${{ secrets.ASC_API_KEY_BASE64 }}" | base64 -d > asc-api-key.p8
```

and point `eas.json` → `submit.production.ios` at it:

```json
"ios": {
  "ascApiKeyPath": "./asc-api-key.p8",
  "ascApiKeyId": "ABC123XYZ",
  "ascApiKeyIssuerId": "your-issuer-uuid"
}
```

(Base64-encode the key with `base64 -i AuthKey_XXXX.p8 | pbcopy`.) The
EAS-managed path in Steps 3–4 is simpler and recommended; this is the escape
hatch if your org requires GitHub to be the single source of truth.

---

## Troubleshooting

- **`eas build` says not logged in** in CI → `EXPO_TOKEN` missing or wrong.
- **Submit fails with auth error** → re-run Step 3; the App Store Connect key
  may have been revoked or the app record doesn't exist yet.
- **Build fails on native deps** → run `npx expo-doctor` locally to catch
  version mismatches before pushing.
- **Bundle id mismatch** → it must match the app record in App Store Connect
  (`com.lightwave.blahblah`, set in `app.json`).

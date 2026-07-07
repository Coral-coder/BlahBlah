# iOS signing: set up the permanent distribution certificate

One-time, ~10 minutes, needs a Mac. After this, every CI build signs with the
SAME certificate — no more cert churn, and old TestFlight builds can never be
invalidated by a new build again (the ITMS-90035 problem).

## 1. Create the certificate (on your Mac)

1. Open **Keychain Access** (⌘-space, type "Keychain Access").
2. Menu bar → **Keychain Access → Certificate Assistant → Request a Certificate
   From a Certificate Authority…**
3. Enter your Apple ID email, leave CA Email empty, choose **"Saved to disk"**.
   Save `CertificateSigningRequest.certSigningRequest` somewhere.
4. Go to [developer.apple.com/account/resources/certificates](https://developer.apple.com/account/resources/certificates)
   → click **+** → choose **Apple Distribution** → Continue.
5. Upload the `.certSigningRequest` file → Continue → **Download** the
   `distribution.cer` file.
6. **Double-click** the downloaded `distribution.cer` — it installs into
   Keychain Access, paired with the private key created in step 2.

> If the portal says you're at the certificate limit (max 3 Apple Distribution),
> revoke ONLY certificates you know are dead (e.g. the CI-minted ones — but note
> revoking a cert invalidates any TestFlight build it signed, so do this at a
> moment when you don't care about existing test builds, then upload fresh).

## 2. Export the .p12

1. In **Keychain Access** → *login* keychain → **My Certificates**, find
   **Apple Distribution: <your name/team>**.
2. Expand the arrow — you should see a private key under it. Right-click the
   **certificate** → **Export…**
3. Format: **Personal Information Exchange (.p12)** → save as `distribution.p12`.
4. It asks for a password — set one and remember it (this becomes a secret).

## 3. Add the two GitHub secrets

In the repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
| --- | --- |
| `APPLE_DISTRIBUTION_CERT_P12` | base64 of the file: run `base64 -i distribution.p12 | pbcopy` in Terminal, then paste |
| `APPLE_DISTRIBUTION_CERT_PASSWORD` | the password you set in step 2.4 |

## 4. Done

The next TestFlight build will log
`Imported persistent distribution certificate from APPLE_DISTRIBUTION_CERT_P12`
and sign with it. Delete `distribution.p12` from Downloads when finished, and
keep a copy somewhere safe (password manager) — if you ever lose it you just
repeat these steps.

## Why this matters

App Store Connect ties every uploaded build to the certificate that signed it.
If that certificate is later revoked, the build flips to **Invalid Binary**
(ITMS-90035) — which is what was happening when CI revoked+reminted certs every
run. A persistent certificate means uploads stay valid forever.

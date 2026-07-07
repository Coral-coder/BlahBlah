# iOS signing: permanent distribution certificate

One-time setup so every CI build signs with the SAME certificate — no cert
churn, and old TestFlight builds can never be invalidated by a new build again
(the ITMS-90035 problem).

## 📱 From your phone (no Mac needed) — recommended

Everything happens in CI; your phone only taps buttons. ~3 minutes.

1. **Add one secret.** In a mobile browser, open
   `github.com/Coral-coder/BlahBlah` → **Settings** → **Secrets and variables**
   → **Actions** → **New repository secret**:
   - Name: `CERT_VAULT_PASSWORD`
   - Value: any strong password you invent. Save it in your password manager —
     it protects the certificate vault.
2. **Run the bootstrap.** Repo → **Actions** tab → **Bootstrap iOS signing**
   (left sidebar) → **Run workflow** → green **Run workflow** button.
3. **Wait ~2 min.** The workflow:
   - mints ONE Apple Distribution certificate via the App Store Connect API,
   - exports the certificate + private key as a `.p12`,
   - encrypts it with your password (AES-256) and commits the encrypted vault
     to the repo as `fastlane/cert-vault.p12.enc`.
4. **Done.** Every future TestFlight build decrypts the vault with your secret
   and signs with that same certificate, forever. The build log will say
   `Imported persistent distribution certificate from the vault`.

Safety notes:
- What's committed is AES-256-encrypted; the password lives only in your
  GitHub secret. The plaintext key never leaves the CI runner.
- The workflow refuses to run if a vault already exists (so it can't
  accidentally mint duplicates). To rotate: delete
  `fastlane/cert-vault.p12.enc`, revoke the old cert in the developer portal
  (this invalidates builds it signed — upload fresh ones after), and re-run.
- If the Apple Distribution certificate limit (3) is hit, the bootstrap will
  fail — revoke a dead certificate at
  developer.apple.com/account/resources/certificates first.

## 💻 From a Mac (alternative)

<details>
<summary>Manual .p12 export via Keychain Access</summary>

1. Keychain Access → Certificate Assistant → **Request a Certificate From a
   Certificate Authority…** → your Apple ID email, CA email empty, **Saved to
   disk**.
2. developer.apple.com → Certificates → **+** → **Apple Distribution** →
   upload the `.certSigningRequest` → download `distribution.cer` →
   double-click to install.
3. Keychain Access → My Certificates → right-click **Apple Distribution: …**
   → **Export…** → format **.p12**, set a password.
4. Add repo secrets:
   - `APPLE_DISTRIBUTION_CERT_P12` = `base64 -i distribution.p12 | pbcopy`
   - `APPLE_DISTRIBUTION_CERT_PASSWORD` = the export password

The build prefers the vault (above) if both are configured.
</details>

## Why this matters

App Store Connect ties every uploaded build to the certificate that signed it.
If that certificate is later revoked, the build flips to **Invalid Binary**
(ITMS-90035). CI used to revoke+remint certs every run, invalidating every
prior binary; with a persistent certificate, uploads stay valid forever.

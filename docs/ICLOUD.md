# Surviving delete / reinstall (progress + settings)

Learning progress and settings persist across an app delete/reinstall.

## Android — done

`android:allowBackup="true"` plus backup rules (`res/xml/backup_rules.xml`,
`res/xml/data_extraction_rules.xml`) enable Android Auto Backup. AsyncStorage
(progress/settings) is backed up to the user's Google account and restored on
reinstall. The large, re-downloadable voice models and cached content bundle are
excluded so the backup stays under quota.

## iOS — iCloud key-value storage

On iOS, data is mirrored to iCloud key-value storage
(`NSUbiquitousKeyValueStore`) via the `blah-icloud-kv` native module and the
`durableSet`/`durableGet` layer (`src/lib/durableStore.ts`). This both survives
uninstall **and** syncs across the user's devices. iCloud KVS allows ~1 MB per
key; the progress blob is well under that.

The JS + native module are already in the app and degrade to local-only if the
entitlement isn't present (no crash). To actually turn iCloud on, two steps
remain — one is yours, one is ours:

### 1. Enable the capability on the App ID (you, one time)

In the Apple Developer portal → Certificates, Identifiers & Profiles →
Identifiers → `com.lightwave.blahblah`:

1. Edit the App ID, check **iCloud** (it enables key-value storage).
2. Save. (No iCloud *container* is needed for key-value storage — just the
   capability.)

This must be done before the entitlement is added, otherwise iOS code-signing
fails (the provisioning profile won't include iCloud).

### 2. Add the entitlement + ship (us, after step 1)

Once the capability is on the App ID, we add to `ios/BlahBlah/BlahBlah.entitlements`:

```xml
<key>com.apple.developer.ubiquity-kvstore-identifier</key>
<string>$(TeamIdentifierPrefix)$(CFBundleIdentifier)</string>
```

reference it from the target (`CODE_SIGN_ENTITLEMENTS`), and the TestFlight build
will sign with iCloud KVS enabled. From then on, progress survives uninstall and
syncs across devices.

Until step 1 + 2 are complete, iOS persists locally only (survives app updates,
but not a full delete) — Android already survives reinstall today.

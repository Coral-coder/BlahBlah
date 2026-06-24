#import "BlahICloudKv.h"

// Thin bridge over NSUbiquitousKeyValueStore (iCloud key-value storage). Used to
// mirror small, important data (learning progress + settings) so it survives an
// app delete/reinstall and syncs across the user's devices.
//
// NOTE: this only actually persists to iCloud when the app is signed with the
// iCloud key-value-store entitlement (capability enabled on the App ID). Without
// it, these calls are harmless no-ops and the app falls back to local storage.
@implementation BlahICloudKv

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup { return NO; }

- (NSUbiquitousKeyValueStore *)store {
  return [NSUbiquitousKeyValueStore defaultStore];
}

RCT_EXPORT_METHOD(setItem:(NSString *)key
                  value:(NSString *)value
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    [[self store] setString:value forKey:key];
    [[self store] synchronize];
    resolve(@(YES));
  } @catch (__unused NSException *e) {
    resolve(@(NO));
  }
}

RCT_EXPORT_METHOD(getItem:(NSString *)key
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  NSString *v = [[self store] stringForKey:key];
  resolve(v ?: (id)kCFNull);
}

RCT_EXPORT_METHOD(removeItem:(NSString *)key
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  [[self store] removeObjectForKey:key];
  [[self store] synchronize];
  resolve(@(YES));
}

RCT_EXPORT_METHOD(sync:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  BOOL ok = [[self store] synchronize];
  resolve(@(ok));
}

@end

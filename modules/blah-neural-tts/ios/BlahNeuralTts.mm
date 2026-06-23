#import "BlahNeuralTts.h"
#import <React/RCTLog.h>

// sherpa-onnx C API (from the vendored sherpa-onnx.xcframework). The header
// search path is set in the podspec.
#import "c-api.h"

@implementation BlahNeuralTts {
  const SherpaOnnxOfflineTts *_tts;
  NSString *_loadedDir;
}

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  // Inference is heavy — keep it off the JS/main thread on a serial queue.
  return dispatch_queue_create("blah.neuraltts", DISPATCH_QUEUE_SERIAL);
}

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (void)dealloc {
  if (_tts) {
    SherpaOnnxDestroyOfflineTts(_tts);
    _tts = NULL;
  }
}

RCT_EXPORT_METHOD(load:(NSDictionary *)opts
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  NSString *dir = opts[@"dir"];
  NSString *modelFile = opts[@"modelFile"] ?: @"model.onnx";
  NSString *tokensFile = opts[@"tokensFile"] ?: @"tokens.txt";
  NSString *dataDir = opts[@"dataDir"] ?: @"";
  int numThreads = opts[@"numThreads"] ? [opts[@"numThreads"] intValue] : 2;

  if ([_loadedDir isEqualToString:dir] && _tts) {
    resolve(@YES);
    return;
  }

  NSString *modelPath = [dir stringByAppendingPathComponent:modelFile];
  NSString *tokensPath = [dir stringByAppendingPathComponent:tokensFile];
  NSString *dataPath = dataDir.length ? [dir stringByAppendingPathComponent:dataDir] : @"";

  if (_tts) {
    SherpaOnnxDestroyOfflineTts(_tts);
    _tts = NULL;
    _loadedDir = nil;
  }

  SherpaOnnxOfflineTtsVitsModelConfig vits;
  memset(&vits, 0, sizeof(vits));
  vits.model = modelPath.UTF8String;
  vits.tokens = tokensPath.UTF8String;
  vits.data_dir = dataPath.UTF8String;
  vits.lexicon = "";
  vits.dict_dir = "";
  vits.noise_scale = 0.667f;
  vits.noise_scale_w = 0.8f;
  vits.length_scale = 1.0f;

  SherpaOnnxOfflineTtsModelConfig model;
  memset(&model, 0, sizeof(model));
  model.vits = vits;
  model.num_threads = numThreads;
  model.debug = 0;
  model.provider = "cpu";

  SherpaOnnxOfflineTtsConfig config;
  memset(&config, 0, sizeof(config));
  config.model = model;
  config.rule_fsts = "";
  config.rule_fars = "";
  config.max_num_sentences = 1;

  _tts = SherpaOnnxCreateOfflineTts(&config);
  if (_tts) {
    _loadedDir = dir;
    resolve(@YES);
  } else {
    reject(@"load_failed", @"SherpaOnnxCreateOfflineTts returned null", nil);
  }
}

RCT_EXPORT_METHOD(synthesize:(NSDictionary *)opts
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  if (!_tts) {
    reject(@"not_loaded", @"no model loaded", nil);
    return;
  }
  NSString *text = opts[@"text"] ?: @"";
  int sid = [opts[@"sid"] intValue];
  float speed = [opts[@"speed"] floatValue];
  if (speed <= 0) speed = 1.0f;

  const SherpaOnnxGeneratedAudio *audio =
      SherpaOnnxOfflineTtsGenerate(_tts, text.UTF8String, sid, speed);
  if (!audio || audio->n <= 0) {
    if (audio) SherpaOnnxDestroyOfflineTtsGeneratedAudio(audio);
    reject(@"gen_failed", @"synthesis produced no audio", nil);
    return;
  }

  NSString *name = [[NSUUID UUID].UUIDString stringByAppendingPathExtension:@"wav"];
  NSString *path = [NSTemporaryDirectory() stringByAppendingPathComponent:name];
  int ok = SherpaOnnxWriteWave(audio->samples, audio->n, audio->sample_rate, path.UTF8String);
  int sr = audio->sample_rate;
  SherpaOnnxDestroyOfflineTtsGeneratedAudio(audio);

  if (ok) {
    resolve(@{@"path" : path, @"sampleRate" : @(sr)});
  } else {
    reject(@"write_failed", @"could not write wav file", nil);
  }
}

@end

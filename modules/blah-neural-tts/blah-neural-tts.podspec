require "json"

# Prebuilt sherpa-onnx iOS release to vendor (xcframeworks + C API headers).
SHERPA_ONNX_VERSION = "1.10.32".freeze

Pod::Spec.new do |s|
  s.name         = "blah-neural-tts"
  s.version      = "0.1.0"
  s.summary      = "On-device neural TTS (sherpa-onnx) for BlahBlah"
  s.description  = "Native module exposing sherpa-onnx offline TTS to React Native."
  s.homepage     = "https://github.com/Coral-coder/BlahBlah"
  s.license      = { :type => "MIT" }
  s.author       = { "Coral Coder" => "Coral-coder@proton.me" }
  s.platform     = :ios, "13.0"
  s.source       = { :git => "https://github.com/Coral-coder/BlahBlah.git", :tag => s.version.to_s }
  s.source_files = "ios/**/*.{h,m,mm}"

  s.dependency "React-Core"

  # Fetch the prebuilt xcframeworks at pod-install time (CI has network access).
  s.prepare_command = <<-CMD
    set -e
    VER="#{SHERPA_ONNX_VERSION}"
    if [ ! -d "frameworks/sherpa-onnx.xcframework" ]; then
      mkdir -p frameworks
      URL="https://github.com/k2-fsa/sherpa-onnx/releases/download/v${VER}/sherpa-onnx-v${VER}-ios.tar.bz2"
      echo "Fetching $URL"
      curl -fL "$URL" -o sherpa-onnx-ios.tar.bz2
      tar -xjf sherpa-onnx-ios.tar.bz2
      # The archive contains a 'build-ios' (or similar) dir with the xcframeworks.
      find . -name "sherpa-onnx.xcframework" -maxdepth 4 -exec cp -R {} frameworks/ \\;
      find . -name "onnxruntime.xcframework" -maxdepth 4 -exec cp -R {} frameworks/ \\;
      rm -rf sherpa-onnx-ios.tar.bz2
    fi
  CMD

  s.vendored_frameworks = "frameworks/sherpa-onnx.xcframework", "frameworks/onnxruntime.xcframework"

  # Expose the sherpa-onnx C API header (c-api.h) to the module sources.
  s.pod_target_xcconfig = {
    "HEADER_SEARCH_PATHS" => [
      '"$(PODS_TARGET_SRCROOT)/frameworks/sherpa-onnx.xcframework/ios-arm64/sherpa-onnx.framework/Headers"',
      '"$(PODS_TARGET_SRCROOT)/frameworks/sherpa-onnx.xcframework/ios-arm64/Headers"',
    ].join(" "),
    "OTHER_LDFLAGS" => "-lc++",
  }
end

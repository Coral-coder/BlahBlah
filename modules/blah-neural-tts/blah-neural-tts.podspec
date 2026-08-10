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
  # Self-healing: try the pinned version, otherwise discover a valid iOS asset
  # from the GitHub Releases API so a stale pin can't break the build.
  s.prepare_command = <<-CMD
    set -e
    VER="#{SHERPA_ONNX_VERSION}"
    if [ ! -d "frameworks/sherpa-onnx.xcframework" ]; then
      mkdir -p frameworks
      URL="https://github.com/k2-fsa/sherpa-onnx/releases/download/v${VER}/sherpa-onnx-v${VER}-ios.tar.bz2"
      echo "Trying pinned: $URL"
      if ! curl -fL "$URL" -o sherpa-onnx-ios.tar.bz2; then
        echo "Pinned version failed; discovering a valid iOS asset from the API…"
        API="https://api.github.com/repos/k2-fsa/sherpa-onnx/releases?per_page=50"
        ASSET=$(curl -fsL "$API" | grep -oE 'https://[^"]*sherpa-onnx-v[0-9.]+-ios\\.tar\\.bz2' | head -n1)
        echo "Discovered: $ASSET"
        test -n "$ASSET"
        curl -fL "$ASSET" -o sherpa-onnx-ios.tar.bz2
      fi
      tar -xjf sherpa-onnx-ios.tar.bz2
      find . -name "sherpa-onnx.xcframework" -maxdepth 6 -exec cp -R {} frameworks/ \\;
      find . -name "onnxruntime.xcframework" -maxdepth 6 -exec cp -R {} frameworks/ \\;
      rm -rf sherpa-onnx-ios.tar.bz2
      echo "Vendored frameworks:"; ls -1 frameworks
    fi
  CMD

  s.vendored_frameworks = "frameworks/sherpa-onnx.xcframework", "frameworks/onnxruntime.xcframework"

  # Expose the sherpa-onnx C API header (c-api.h) to the module sources.
  s.pod_target_xcconfig = {
    "HEADER_SEARCH_PATHS" => [
      '"$(PODS_TARGET_SRCROOT)/frameworks/sherpa-onnx.xcframework/ios-arm64/sherpa-onnx.framework/Headers"',
      '"$(PODS_TARGET_SRCROOT)/frameworks/sherpa-onnx.xcframework/ios-arm64/Headers"',
      '"$(PODS_TARGET_SRCROOT)/frameworks/sherpa-onnx.xcframework/ios-arm64_x86_64-simulator/sherpa-onnx.framework/Headers"',
      '"$(PODS_TARGET_SRCROOT)/frameworks/sherpa-onnx.xcframework/ios-arm64_x86_64-simulator/Headers"',
    ].join(" "),
    "OTHER_LDFLAGS" => "-lc++",
  }
end

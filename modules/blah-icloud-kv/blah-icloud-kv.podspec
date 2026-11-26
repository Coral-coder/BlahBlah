Pod::Spec.new do |s|
  s.name         = "blah-icloud-kv"
  s.version      = "0.1.0"
  s.summary      = "iCloud key-value store bridge for BlahBlah"
  s.description  = "Mirrors small app data (progress/settings) to NSUbiquitousKeyValueStore so it survives uninstall and syncs across devices."
  s.homepage     = "https://github.com/Coral-coder/BlahBlah"
  s.license      = { :type => "MIT" }
  s.author       = { "Coral Coder" => "Coral-coder@proton.me" }
  s.platform     = :ios, "13.0"
  s.source       = { :git => "https://github.com/Coral-coder/BlahBlah.git", :tag => s.version.to_s }
  s.source_files = "ios/**/*.{h,m,mm}"
  s.dependency "React-Core"
end

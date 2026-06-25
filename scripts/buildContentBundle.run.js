/* eslint-disable no-console */
// Serializes the curriculum blueprints into the over-the-air content bundle that
// the app fetches from GitHub Releases. Reuses the same TS-on-Node loader as the
// content validator so it reads the exact blueprints the app would.
//
// Usage: node scripts/buildContentBundle.run.js [outPath] [version]
const fs = require("fs");
const path = require("path");
const Module = require("module");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const src = path.join(root, "src");

const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  const req = request.startsWith("@/") ? path.join(src, request.slice(2)) : request;
  return origResolve.call(this, req, parent, isMain, options);
};

for (const ext of [".ts", ".tsx"]) {
  require.extensions[ext] = function (module, filename) {
    const code = fs.readFileSync(filename, "utf8");
    const out = ts.transpileModule(code, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2019,
        esModuleInterop: true,
        jsx: ts.JsxEmit.React,
        resolveJsonModule: true,
      },
      fileName: filename,
    });
    module._compile(out.outputText, filename);
  };
}

const { BLUEPRINTS, CONTENT_SCHEMA } = require("@/curriculum");
const { courseLessonCount } = require("@/curriculum/generate");
// Pure-data voice catalog (no RN imports) so the bundle fully describes each
// language including where to fetch its natural voice and its settings.
const { VOICE_MODELS, VOICE_RELEASE_BASE } = require("@/lib/voiceCatalog");

// Output: a small manifest + one file per course ("chapter"). The app downloads
// the manifest on launch, then fetches a course only when it's opened (cached
// after), instead of pulling every language at once.
const outDir = process.argv[2] || path.join(root, "dist-content");
const version = process.argv[3] || String(Date.now());
fs.mkdirSync(outDir, { recursive: true });

const kb = (p) => (fs.statSync(p).size / 1024).toFixed(0);

// Per-course files.
for (const bp of BLUEPRINTS) {
  const p = path.join(outDir, `course-${bp.code}.json`);
  fs.writeFileSync(p, JSON.stringify({ schema: CONTENT_SCHEMA, version, course: bp }));
  console.log(`  course-${bp.code}.json (${kb(p)} KB)`);
}

// Small manifest: metadata + lesson counts for the picker, plus the voice catalog.
const manifest = {
  schema: CONTENT_SCHEMA,
  version,
  voices: VOICE_MODELS,
  voicesBaseUrl: VOICE_RELEASE_BASE,
  courses: BLUEPRINTS.map((bp) => ({
    code: bp.code,
    name: bp.name,
    endonym: bp.endonym,
    flag: bp.flag,
    speechLocale: bp.speechLocale,
    sections: bp.sections.length,
    lessons: courseLessonCount(bp),
  })),
};
const manifestPath = path.join(outDir, "content-manifest.json");
fs.writeFileSync(manifestPath, JSON.stringify(manifest));

// Also emit the legacy monolithic bundle so already-shipped apps keep updating.
const legacyPath = path.join(outDir, "content-bundle.json");
fs.writeFileSync(
  legacyPath,
  JSON.stringify({ schema: CONTENT_SCHEMA, version, courses: BLUEPRINTS, voices: VOICE_MODELS, voicesBaseUrl: VOICE_RELEASE_BASE }),
);

console.log(
  `Manifest: ${manifest.courses.length} courses (${kb(manifestPath)} KB), legacy bundle ${kb(legacyPath)} KB, version ${version}`,
);

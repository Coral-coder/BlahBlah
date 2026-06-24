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

const outPath = process.argv[2] || path.join(root, "content-bundle.json");
const version = process.argv[3] || String(Date.now());

const bundle = {
  schema: CONTENT_SCHEMA,
  version,
  courses: BLUEPRINTS,
};

fs.writeFileSync(outPath, JSON.stringify(bundle));
const kb = (fs.statSync(outPath).size / 1024).toFixed(0);
console.log(
  `Wrote ${outPath}: schema ${CONTENT_SCHEMA}, version ${version}, ${BLUEPRINTS.length} courses, ${kb} KB`,
);

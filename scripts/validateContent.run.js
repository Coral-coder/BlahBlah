/* eslint-disable no-console */
// Standalone content validator: transpiles the TS curriculum with the TypeScript
// compiler (reliable type-stripping) and validates every course. Runs in plain
// Node and in CI; exits non-zero on any content problem.
const fs = require("fs");
const path = require("path");
const Module = require("module");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const src = path.join(root, "src");

// Resolve the project's "@/..." alias to src/...
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

const { validateAllCourses, courseStats } = require("./validateContent.ts");

const stats = courseStats();
console.log("Course content:");
for (const s of stats) {
  console.log(
    `  ${s.code.padEnd(4)} ${s.name.padEnd(12)} ${String(s.lessons).padStart(4)} lessons  ${String(s.exercises).padStart(5)} exercises  ${String(s.vocab).padStart(4)} vocab`,
  );
}
const totalEx = stats.reduce((a, b) => a + b.exercises, 0);
const totalVocab = stats.reduce((a, b) => a + b.vocab, 0);
console.log(`  TOTAL: ${stats.length} courses, ${totalEx} exercises, ${totalVocab} vocab words`);

const problems = validateAllCourses();
if (problems.length) {
  console.error(`\n❌ ${problems.length} content problem(s):`);
  for (const p of problems.slice(0, 50)) console.error(`  [${p.course}] ${p.lesson}: ${p.detail}`);
  process.exit(1);
}
console.log("\n✅ All course content is structurally valid.");

// Usage: vp run new-demo <slug> [--name "Client Name"] [--dest <path>] [--skip-install]
import { execFileSync, spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

const repoRoot = path.resolve(import.meta.dirname, "..");
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Never carried into a demo, even when git lists them as untracked
const EXCLUDED = [
  /^\.claude\/state\//,
  /^\.claude\/settings[^/]*\.json$/,
  /^graphify-out\//,
  /^\.vite-hooks\//,
  /(^|\/)node_modules\//,
  /(^|\/)\.output\//,
  /(^|\/)\.tanstack\//,
  /(^|\/)\.cache\//
];

const USAGE =
  'usage: vp run new-demo <slug> [--name "Client Name"] [--dest <path>] [--skip-install]';

// What this run created, so a failure removes only that and never a pre-existing folder
let createdRoot: string | undefined;
let createdContentsOf: string | undefined;

function fail(message: string, showUsage = false): never {
  console.error(`\nnew-demo: ${message}`);
  if (showUsage) console.error(USAGE);
  try {
    if (createdRoot) rmSync(createdRoot, { recursive: true, force: true });
    else if (createdContentsOf) {
      for (const entry of readdirSync(createdContentsOf)) {
        rmSync(path.join(createdContentsOf, entry), { recursive: true, force: true });
      }
    }
    if (createdRoot || createdContentsOf) {
      console.error(
        `new-demo: removed the partial scaffold at ${createdRoot ?? createdContentsOf}`
      );
    }
  } catch {
    console.error(
      `new-demo: could not clean up; it is safe to delete ${createdRoot ?? createdContentsOf}`
    );
  }
  process.exit(1);
}

const parse = () =>
  parseArgs({
    allowPositionals: true,
    options: {
      name: { type: "string" },
      dest: { type: "string" },
      "skip-install": { type: "boolean", default: false }
    }
  });
let parsed: ReturnType<typeof parse>;
try {
  parsed = parse();
} catch (error) {
  fail(error instanceof Error ? error.message : String(error), true);
}
const { values, positionals } = parsed;

const slug = positionals[0];
if (!slug || positionals.length > 1) fail("expected exactly one <slug>", true);
if (!SLUG.test(slug)) fail(`invalid slug "${slug}": use lowercase letters, digits and hyphens`);

const name =
  values.name ??
  slug
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
const dest = path.resolve(values.dest ?? path.resolve(repoRoot, "../demos", `${slug}-DEMO`));

const passed: string[] = [];
const step = (label: string) => passed.push(label);

// Substituting names changes cell widths; pad table columns again so the output is already formatted
function realignTables(text: string) {
  const lines = text.split("\n");
  for (let i = 0; i < lines.length;) {
    if (!lines[i].startsWith("|")) {
      i++;
      continue;
    }
    let end = i;
    while (end < lines.length && lines[end].startsWith("|")) end++;
    const rows = lines.slice(i, end).map((line) =>
      line
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((cell) => cell.trim())
    );
    const widths = rows[0].map((_, col) =>
      Math.max(3, ...rows.map((row) => (/^:?-+:?$/.test(row[col]) ? 0 : row[col].length)))
    );
    rows.forEach((row, r) => {
      lines[i + r] =
        "| " +
        row
          .map((cell, col) =>
            /^:?-+:?$/.test(cell) ? "-".repeat(widths[col]) : cell.padEnd(widths[col])
          )
          .join(" | ") +
        " |";
    });
    i = end;
  }
  return lines.join("\n");
}

function git(cwd: string, ...args: string[]) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function run(label: string, command: string, args: string[]) {
  console.log(`\n> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, { cwd: dest, stdio: "inherit" });
  if (result.status !== 0) fail(`step "${label}" failed (exit ${result.status ?? "signal"})`);
  step(label);
}

// 1. Never overwrite a demo
if (existsSync(dest)) {
  if (!statSync(dest).isDirectory()) fail(`${dest} exists and is not a directory`);
  if (readdirSync(dest).length > 0) fail(`${dest} already exists and is not empty`);
}

try {
  // 2. Copy tracked + untracked-but-not-ignored files
  const shortSha = git(repoRoot, "rev-parse", "--short", "HEAD");
  const listed = execFileSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    { cwd: repoRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
  )
    .split("\0")
    .filter(Boolean);
  // CLAUDE.local.md is gitignored on purpose: it holds the machine-specific Iridel rules pointers
  const files = [...new Set([...listed, "CLAUDE.local.md"])].filter(
    (file) => existsSync(path.join(repoRoot, file)) && !EXCLUDED.some((re) => re.test(file))
  );
  if (existsSync(dest)) createdContentsOf = dest;
  else createdRoot = mkdirSync(dest, { recursive: true });
  for (const file of files) {
    const target = path.join(dest, file);
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(path.join(repoRoot, file), target);
  }
  step(`copied ${files.length} files`);

  // 3. package.json
  const pkgPath = path.join(dest, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.name = `${slug}-demo`;
  delete pkg.scripts?.["new-demo"];
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  step("package.json renamed");

  // 4. README
  writeFileSync(
    path.join(dest, "README.md"),
    `# ${name} — Iridel demo

Built from Iridel's demo-template (zo-stack) at \`${shortSha}\`.

| Command                   | Purpose                                                  |
| ------------------------- | -------------------------------------------------------- |
| \`vp run dev\`              | Dev server at http://localhost:3000                      |
| \`vp check --fix\`          | Format (Oxfmt), lint (Oxlint), and typecheck in one pass |
| \`vp run test:unit:run\`    | Unit tests across packages                               |
| \`vp run test:e2e:run\`     | Playwright smoke tests against a production build        |
| \`vp run test:breakpoints\` | Every prerendered page at 375, 768 and 1440 px           |
| \`vp run build\`            | Production build (Node preview output)                   |

Read PRD.md, then DESIGN.md, then .agents/iridel.md.
`
  );
  step("README written");

  // 5. PRD.md and DESIGN.md from the templates
  const documents: [string, string, [string, string][]][] = [
    [
      "PRD_TEMPLATE.md",
      "PRD.md",
      [
        ["[Client Name]", name],
        ["[client-slug]", slug]
      ]
    ],
    ["DESIGN_TEMPLATE.md", "DESIGN.md", [["[Client Name]", name]]]
  ];
  for (const [templateFile, outFile, replacements] of documents) {
    const templatePath = path.join(repoRoot, "docs/templates", templateFile);
    if (!existsSync(templatePath)) fail(`missing template docs/templates/${templateFile}`);
    let text = readFileSync(templatePath, "utf8");
    for (const [from, to] of replacements) text = text.replaceAll(from, to);
    text = realignTables(text);
    writeFileSync(path.join(dest, outFile), text);
  }
  step("PRD.md and DESIGN.md written");

  // 6. env
  const envExample = path.join(dest, "packages/env/.env.example");
  const envFile = path.join(dest, "packages/env/.env");
  if (existsSync(envExample) && !existsSync(envFile)) {
    copyFileSync(envExample, envFile);
    step("packages/env/.env created");
  }

  // 7. install, check, build
  if (values["skip-install"]) {
    console.log("\nSkipping install, check and build (--skip-install)");
  } else {
    run("vp install", "vp", ["install"]);
    run("vp check", "vp", ["check"]);
    run("vp run build", "vp", ["run", "build"]);
  }

  // 8. Fresh repo with no remotes: a demo must never point at the template or the CTO repo
  git(dest, "init", "-b", "main");
  git(dest, "add", "-A");
  let email = "";
  try {
    email = git(dest, "config", "user.email");
  } catch {
    // unset
  }
  if (email) {
    git(
      dest,
      "commit",
      "--no-verify",
      "-m",
      `chore: scaffold ${slug} from demo-template ${shortSha}`
    );
    step("git init + first commit");
  } else {
    console.log("\nNotice: git user.email is not set, skipping the first commit.");
    step("git init (no commit: user.email unset)");
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

// 9. Summary
console.log(`\nDemo ready: ${dest}`);
for (const label of passed) console.log(`  ok  ${label}`);
console.log("\nNext: hand to scaffolder/architect.");

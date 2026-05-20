/**
 * watch-design.mjs
 *
 * Watches src-design/ for .tsx/.ts changes, diffs them against HEAD,
 * summarises what changed, then offers to run the /feature pipeline.
 *
 * Usage:  npm run watch:design
 */

import { watch }            from 'node:fs';
import { execSync, spawn }  from 'node:child_process';
import { createInterface }  from 'node:readline';
import { resolve, relative, posix } from 'node:path';

const ROOT       = resolve('.');
const DESIGN_DIR = resolve('./src-design');
const DEBOUNCE   = 800; // ms — coalesce rapid saves

// ── helpers ───────────────────────────────────────────────────────────────────

/** Normalise to forward-slash path relative to ROOT (for git commands). */
function toGitPath(absPath) {
  return relative(ROOT, absPath).split('\\').join('/');
}

/** Return the raw git diff for a file, or null if nothing changed vs HEAD. */
function getDiff(absPath) {
  const rel = toGitPath(absPath);
  try {
    const diff = execSync(`git diff HEAD -- "${rel}"`, {
      cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    if (diff) return { type: 'modified', diff, rel };
  } catch { /* git not available or other error */ }
  return null;
}

/** Return true if the file is untracked (new file not yet committed). */
function isUntracked(absPath) {
  const rel = toGitPath(absPath);
  try {
    const status = execSync(`git status --porcelain "${rel}"`, {
      cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    return status.startsWith('?');
  } catch { return false; }
}

/**
 * Parse diff lines into a human-readable summary.
 * Returns { added, removed, hunks[] } where hunks are the @@ context lines.
 */
function parseDiff(diff) {
  const lines    = diff.split('\n');
  const added    = lines.filter(l => l.startsWith('+') && !l.startsWith('+++')).length;
  const removed  = lines.filter(l => l.startsWith('-') && !l.startsWith('---')).length;
  const hunks    = lines
    .filter(l => l.startsWith('@@'))
    .map(l => l.match(/@@[^@]+@@\s*(.*)/)?.[1]?.trim())
    .filter(Boolean)
    .slice(0, 5); // cap at 5 context lines
  return { added, removed, hunks };
}

/** Prompt the user with a yes/no question; resolves to boolean. */
function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(res => {
    rl.question(question, answer => {
      rl.close();
      res(answer.trim().toLowerCase() === 'y' || answer.trim().toLowerCase() === 'yes');
    });
  });
}

/** Spawn the Claude Code CLI with the /feature skill for the given design file. */
function runFeature(relPath) {
  const SEP = '─'.repeat(52);
  console.log(`\n⚡  Running /feature pipeline on ${relPath} ...\n${SEP}\n`);

  const proc = spawn('claude', ['--print', `/feature ${relPath}`], {
    cwd:   ROOT,
    stdio: 'inherit',
    shell: true,
  });

  proc.on('exit', code => {
    console.log(`\n${SEP}`);
    console.log(`✓  /feature finished (exit ${code ?? '?'})\n`);
    printWatchHeader();
  });

  proc.on('error', err => {
    console.error(`\n✗  Failed to start claude CLI: ${err.message}`);
    console.error('   Make sure "claude" is available on your PATH.\n');
    printWatchHeader();
  });
}

// ── change handler ────────────────────────────────────────────────────────────

/** Serialises prompts so two rapid changes don't interleave questions. */
let promptLock = Promise.resolve();

async function handleChange(absPath) {
  const rel = toGitPath(absPath);

  // Determine change type
  const diffResult = getDiff(absPath);
  const newFile    = !diffResult && isUntracked(absPath);

  if (!diffResult && !newFile) return; // no actual change vs HEAD

  const SEP = '─'.repeat(52);
  console.log(`\n${SEP}`);

  if (newFile) {
    console.log(`✨  New design file: ${rel}`);
  } else {
    const { added, removed, hunks } = parseDiff(diffResult.diff);
    const parts = [];
    if (added)   parts.push(`+${added} lines`);
    if (removed) parts.push(`-${removed} lines`);
    console.log(`📐  src-design changed: ${rel}`);
    console.log(`    ${parts.join('  ')}`);
    hunks.forEach(h => console.log(`    ~  ${h}`));
  }

  console.log(SEP);

  const ok = await confirm('Implement this change? [y/N]  ');
  if (ok) {
    runFeature(rel);
  } else {
    console.log('Skipped.\n');
    printWatchHeader();
  }
}

// ── debounce map ──────────────────────────────────────────────────────────────

const pending = new Map();

function scheduleChange(absPath) {
  if (pending.has(absPath)) clearTimeout(pending.get(absPath));

  pending.set(absPath, setTimeout(() => {
    pending.delete(absPath);
    // Serialise through promptLock so questions never interleave
    promptLock = promptLock.then(() => handleChange(absPath));
  }, DEBOUNCE));
}

// ── watcher ───────────────────────────────────────────────────────────────────

const WATCHED_EXTS = new Set(['.tsx', '.ts']);

watch(DESIGN_DIR, { recursive: true }, (_event, filename) => {
  if (!filename) return;
  const ext = filename.slice(filename.lastIndexOf('.'));
  if (!WATCHED_EXTS.has(ext)) return;
  scheduleChange(resolve(DESIGN_DIR, filename));
});

function printWatchHeader() {
  console.log('👁   Watching src-design/ for .tsx/.ts changes  (Ctrl+C to stop)\n');
}

printWatchHeader();

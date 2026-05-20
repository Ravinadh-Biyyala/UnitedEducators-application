#!/usr/bin/env node
/**
 * generate-index.mjs
 *
 * Walks src/ and produces INDEX.md — the catalog Claude reads before any task.
 * No external dependencies. Runs in <2s for projects up to ~500 files.
 *
 * Usage:
 *   node scripts/generate-index.mjs           → write INDEX.md
 *   node scripts/generate-index.mjs --check   → exit 1 if INDEX.md is stale
 */

import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const OUTPUT = join(ROOT, 'INDEX.md');
const CHECK_MODE = process.argv.includes('--check');

const SKIP_FILES = new Set(['index.ts', 'index.tsx']);
const SKIP_PATTERNS = [/\.test\.tsx?$/, /\.stories\.tsx?$/, /\.d\.ts$/];

// ─── File walk ────────────────────────────────────────────────────────────
function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, files);
    } else if (/\.(tsx?|ts)$/.test(entry)) {
      if (SKIP_FILES.has(entry)) continue;
      if (SKIP_PATTERNS.some((p) => p.test(entry))) continue;
      files.push(full);
    }
  }
  return files;
}

// ─── Extraction helpers ───────────────────────────────────────────────────
function readSafe(file) {
  try {
    return readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

function extractDocComment(content, exportLineIdx) {
  const lines = content.split('\n');
  let i = exportLineIdx - 1;
  while (i >= 0 && lines[i].trim() === '') i--;
  if (i < 0 || !lines[i].trim().endsWith('*/')) return null;
  const doc = [];
  while (i >= 0) {
    doc.unshift(lines[i]);
    if (lines[i].trim().startsWith('/**')) break;
    i--;
  }
  return doc
    .join(' ')
    .replace(/\/\*\*|\*\/|\*/g, '')
    .replace(/\s+/g, ' ')
    .trim() || null;
}

function findInterfaceProps(content, name = 'Props') {
  // Match `interface Props { ... }` or `interface ComponentProps { ... }`
  const re = new RegExp(`(?:export\\s+)?interface\\s+${name}[^{]*\\{([\\s\\S]*?)\\n\\}`, 'm');
  const m = content.match(re);
  return m ? m[1].trim() : null;
}

function findTypeProps(content, name = 'Props') {
  const re = new RegExp(`(?:export\\s+)?type\\s+${name}\\s*=\\s*\\{([\\s\\S]*?)\\n\\}`, 'm');
  const m = content.match(re);
  return m ? m[1].trim() : null;
}

function extractComponentProps(content, componentName) {
  // Try common patterns in order
  return (
    findInterfaceProps(content, 'Props') ||
    findInterfaceProps(content, `${componentName}Props`) ||
    findTypeProps(content, 'Props') ||
    findTypeProps(content, `${componentName}Props`) ||
    null
  );
}

function findExportedComponents(content) {
  const out = [];
  const lines = content.split('\n');
  const re = /^export\s+(?:default\s+)?function\s+([A-Z]\w*)/;
  const reConst = /^export\s+const\s+([A-Z]\w*)\s*[:=]/;
  lines.forEach((line, idx) => {
    let m = line.match(re) || line.match(reConst);
    if (m) {
      out.push({ name: m[1], lineIdx: idx, doc: extractDocComment(content, idx) });
    }
  });
  return out;
}

function findExportedHooks(content) {
  const out = [];
  const lines = content.split('\n');
  const re = /^export\s+(?:default\s+)?function\s+(use[A-Z]\w*)/;
  const reConst = /^export\s+const\s+(use[A-Z]\w*)\s*[:=]/;
  lines.forEach((line, idx) => {
    let m = line.match(re) || line.match(reConst);
    if (m) out.push({ name: m[1], doc: extractDocComment(content, idx) });
  });
  return out;
}

function findRtkQueryHooks(content) {
  // Matches: export const { useGetXQuery, useUpdateXMutation } = api;
  const out = { queries: [], mutations: [] };
  const m = content.match(/export\s+const\s*\{([^}]+)\}\s*=/);
  if (!m) return out;
  const names = m[1].split(',').map((s) => s.trim());
  for (const n of names) {
    if (/^use\w+Query$/.test(n)) out.queries.push(n);
    else if (/^use\w+Mutation$/.test(n)) out.mutations.push(n);
  }
  return out;
}

function findSliceInfo(content) {
  // slice name from createSlice({ name: 'X', ... })
  const nameMatch = content.match(/createSlice\s*\(\s*\{\s*name:\s*['"]([^'"]+)['"]/);
  // action names from `export const { a, b } = slice.actions`
  const actionsMatch = content.match(/export\s+const\s*\{([^}]+)\}\s*=\s*\w+\.actions/);
  const actions = actionsMatch
    ? actionsMatch[1].split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  return { name: nameMatch ? nameMatch[1] : null, actions };
}

function findExportedTypes(content) {
  const out = [];
  const lines = content.split('\n');
  const reType = /^export\s+(?:type|interface)\s+([A-Z]\w*)/;
  lines.forEach((line) => {
    const m = line.match(reType);
    if (m) out.push(m[1]);
  });
  return out;
}

function findExportedFunctions(content) {
  const out = [];
  const lines = content.split('\n');
  const re = /^export\s+(?:async\s+)?function\s+([a-z]\w*)/;
  const reConst = /^export\s+const\s+([a-z]\w*)\s*[:=]/;
  lines.forEach((line) => {
    const m = line.match(re) || line.match(reConst);
    if (m) out.push(m[1]);
  });
  return out;
}

function aliasFor(folderRel) {
  // src/components/common/Button → @/components/common
  // src/hooks/common → @/hooks/common
  return '@/' + folderRel.replace(/^src\//, '').split('/').slice(0, -1).join('/');
}

// ─── Section builders ─────────────────────────────────────────────────────
function buildComponentSection(label, dir) {
  const root = join(SRC, 'components', dir);
  if (!existsSync(root)) return '';
  const files = walk(root);
  if (!files.length) return '';

  const entries = [];
  for (const file of files) {
    const content = readSafe(file);
    const components = findExportedComponents(content);
    for (const c of components) {
      const props = extractComponentProps(content, c.name);
      entries.push({
        name: c.name,
        file: relative(ROOT, file).replace(/\\/g, '/'),
        importPath: `@/components/${dir}`,
        doc: c.doc,
        props,
      });
    }
  }
  if (!entries.length) return '';

  let out = `\n## components/${dir}/\n`;
  for (const e of entries) {
    out += `\n### ${e.name} \`${e.importPath}\`\n`;
    if (e.doc) out += `${e.doc}\n\n`;
    if (e.props) {
      out += '```ts\n{\n';
      out += e.props
        .split('\n')
        .map((l) => '  ' + l.trim().replace(/^[\s]+/, ''))
        .filter((l) => l.trim())
        .join('\n');
      out += '\n}\n```\n';
    } else {
      out += '_props: see source_\n';
    }
    out += `<sub>${e.file}</sub>\n`;
  }
  return out;
}

function buildContainerSection() {
  const root = join(SRC, 'containers');
  if (!existsSync(root)) return '';
  const features = readdirSync(root).filter((f) => statSync(join(root, f)).isDirectory());
  if (!features.length) return '';

  let out = `\n## containers/\n`;
  for (const f of features) {
    const files = walk(join(root, f));
    const containers = [];
    for (const file of files) {
      const content = readSafe(file);
      findExportedComponents(content).forEach((c) => {
        if (c.name.endsWith('Container')) {
          containers.push({ name: c.name, file: relative(ROOT, file).replace(/\\/g, '/') });
        }
      });
    }
    if (!containers.length) continue;
    out += `\n### ${f}\n`;
    for (const c of containers) {
      out += `- **${c.name}** — \`${c.file}\`\n`;
    }
  }
  return out;
}

function buildHooksSection() {
  const root = join(SRC, 'hooks');
  if (!existsSync(root)) return '';
  const groups = readdirSync(root).filter((f) => statSync(join(root, f)).isDirectory());
  if (!groups.length) return '';

  let out = `\n## hooks/\n`;
  for (const g of groups) {
    const files = walk(join(root, g));
    const hooks = [];
    for (const file of files) {
      findExportedHooks(readSafe(file)).forEach((h) =>
        hooks.push({ ...h, file: relative(ROOT, file).replace(/\\/g, '/') }),
      );
    }
    if (!hooks.length) continue;
    out += `\n### ${g}\n`;
    for (const h of hooks) {
      out += `- **${h.name}**${h.doc ? ` — ${h.doc}` : ''} \`@/hooks/${g}\`\n`;
    }
  }
  return out;
}

function buildServicesSection() {
  const root = join(SRC, 'services');
  if (!existsSync(root)) return '';
  const features = readdirSync(root).filter((f) =>
    statSync(join(root, f)).isDirectory(),
  );
  if (!features.length) return '';

  let out = `\n## services/\n`;
  for (const f of features) {
    const files = walk(join(root, f));
    for (const file of files) {
      const content = readSafe(file);
      const { queries, mutations } = findRtkQueryHooks(content);
      if (!queries.length && !mutations.length) continue;
      out += `\n### ${f} \`@/services/${f}\`\n`;
      if (queries.length) out += `- queries: ${queries.map((q) => `\`${q}\``).join(', ')}\n`;
      if (mutations.length)
        out += `- mutations: ${mutations.map((m) => `\`${m}\``).join(', ')}\n`;
      out += `<sub>${relative(ROOT, file).replace(/\\/g, '/')}</sub>\n`;
    }
  }
  return out;
}

function buildStoreSection() {
  const root = join(SRC, 'store', 'slices');
  if (!existsSync(root)) return '';
  const files = walk(root);
  const slices = [];
  for (const file of files) {
    const info = findSliceInfo(readSafe(file));
    if (info.name) {
      slices.push({ ...info, file: relative(ROOT, file).replace(/\\/g, '/') });
    }
  }
  if (!slices.length) return '';
  let out = `\n## store/slices/\n`;
  for (const s of slices) {
    out += `\n### ${s.name} \`@/store/slices\`\n`;
    if (s.actions.length) out += `- actions: ${s.actions.map((a) => `\`${a}\``).join(', ')}\n`;
    out += `<sub>${s.file}</sub>\n`;
  }
  return out;
}

function buildSharedSection() {
  let out = '';
  // Types
  const typesDir = join(SRC, 'shared', 'types');
  if (existsSync(typesDir)) {
    const files = walk(typesDir);
    const types = new Set();
    for (const file of files) {
      findExportedTypes(readSafe(file)).forEach((t) => types.add(t));
    }
    if (types.size) {
      out += `\n## shared/types \`@/shared/types\`\n`;
      out += `${[...types].map((t) => `\`${t}\``).join(', ')}\n`;
    }
  }
  // Utils
  const utilsDir = join(SRC, 'shared', 'utils');
  if (existsSync(utilsDir)) {
    const files = walk(utilsDir);
    const fns = new Set();
    for (const file of files) {
      findExportedFunctions(readSafe(file)).forEach((f) => fns.add(f));
    }
    if (fns.size) {
      out += `\n## shared/utils \`@/shared/utils\`\n`;
      out += `${[...fns].map((f) => `\`${f}\``).join(', ')}\n`;
    }
  }
  return out;
}

function buildFeaturesSection() {
  const root = join(SRC, 'features');
  if (!existsSync(root)) return '';
  const features = readdirSync(root).filter((f) => statSync(join(root, f)).isDirectory());
  if (!features.length) return '';

  let out = `\n## features/\n`;
  for (const f of features) {
    const pagesDir = join(root, f, 'pages');
    const pages = [];
    if (existsSync(pagesDir)) {
      walk(pagesDir).forEach((file) => {
        findExportedComponents(readSafe(file)).forEach((c) => {
          if (c.name.endsWith('Page')) pages.push(c.name);
        });
      });
    }
    out += `- **${f}**${pages.length ? ` — pages: ${pages.map((p) => `\`${p}\``).join(', ')}` : ' — _empty_'}\n`;
  }
  return out;
}

// ─── Main ─────────────────────────────────────────────────────────────────
function generate() {
  const header = `# Project Index

> **Auto-generated by \`npm run index\`. Do not edit by hand.**
> Last regenerated: ${new Date().toISOString()}
>
> Claude reads this file BEFORE searching the codebase. If something needed
> isn't listed here, it doesn't exist yet — create it per CLAUDE.md.
`;

  const sections = [
    buildComponentSection('common', 'common'),
    buildComponentSection('domain', 'domain'),
    buildComponentSection('layout', 'layout'),
    buildContainerSection(),
    buildFeaturesSection(),
    buildHooksSection(),
    buildServicesSection(),
    buildStoreSection(),
    buildSharedSection(),
  ];

  return header + sections.join('\n') + '\n';
}

// ─── Run ──────────────────────────────────────────────────────────────────
const generated = generate();

if (CHECK_MODE) {
  const existing = existsSync(OUTPUT) ? readFileSync(OUTPUT, 'utf8') : '';
  // Compare ignoring the timestamp line
  const norm = (s) => s.replace(/Last regenerated:.*\n/, '');
  if (norm(existing) === norm(generated)) {
    console.log('✓ INDEX.md is up to date');
    process.exit(0);
  } else {
    console.error('✗ INDEX.md is stale. Run: npm run index');
    process.exit(1);
  }
} else {
  writeFileSync(OUTPUT, generated, 'utf8');
  const lines = generated.split('\n').length;
  console.log(`✓ Wrote INDEX.md (${lines} lines)`);
}

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const checkOnly = process.argv.includes('--check');

const targets = [
  '.',
  'apps/api',
  'apps/mobile',
  'apps/web',
  'packages/config-eslint',
  'packages/config-typescript',
  'packages/contracts',
  'packages/design-tokens',
  'packages/domain',
  'packages/utils',
];

function getAiContextPath(targetDir) {
  return path.join(repoRoot, targetDir, 'AI_CONTEXT.md');
}

function getGeneratedHeader(filename, targetDir) {
  const sourcePath = path
    .relative(path.join(repoRoot, targetDir), getAiContextPath(targetDir))
    .replaceAll(path.sep, '/');

  return [
    `# ${filename}`,
    '',
    '> 생성 파일입니다. 같은 디렉터리의 `AI_CONTEXT.md`를 수정한 뒤 `pnpm sync:ai-context`를 실행하세요.',
    `> 원본: \`${sourcePath}\``,
    '',
  ].join('\n');
}

function buildAgentsContent(targetDir, source) {
  return `${getGeneratedHeader('AGENTS.md', targetDir)}${source.trimEnd()}\n`;
}

function buildClaudeContent(targetDir) {
  return [
    getGeneratedHeader('CLAUDE.md', targetDir).trimEnd(),
    '@./AI_CONTEXT.md',
    '',
  ].join('\n');
}

function ensureGeneratedFile(filePath, expectedContent) {
  const currentContent = existsSync(filePath)
    ? readFileSync(filePath, 'utf8')
    : null;

  if (currentContent === expectedContent) {
    return;
  }

  if (checkOnly) {
    throw new Error(`Out of date: ${path.relative(repoRoot, filePath)}`);
  }

  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, expectedContent, 'utf8');
}

function main() {
  for (const targetDir of targets) {
    const sourcePath = getAiContextPath(targetDir);

    if (!existsSync(sourcePath)) {
      throw new Error(`Missing AI_CONTEXT.md for ${targetDir}`);
    }

    const source = readFileSync(sourcePath, 'utf8');
    const agentsPath = path.join(repoRoot, targetDir, 'AGENTS.md');
    const claudePath = path.join(repoRoot, targetDir, 'CLAUDE.md');

    ensureGeneratedFile(agentsPath, buildAgentsContent(targetDir, source));
    ensureGeneratedFile(claudePath, buildClaudeContent(targetDir));
  }

  if (!checkOnly) {
    console.log(`Synced AI context for ${targets.length} directories.`);
  }
}

main();

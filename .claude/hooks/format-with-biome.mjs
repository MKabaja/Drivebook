import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const hookInput = JSON.parse(readFileSync(0, 'utf8'));
const editedFilePath = hookInput.tool_input?.file_path;
const projectDir = process.env.CLAUDE_PROJECT_DIR ?? hookInput.cwd;
const frontendDir = join(projectDir, 'frontend');
const biomeEntryPath = join(frontendDir, 'node_modules', '@biomejs', 'biome', 'bin', 'biome');

if (editedFilePath && isInsideFrontend(editedFilePath) && existsSync(biomeEntryPath)) {
	const biomeResult = spawnSync(
		process.execPath,
		[
			biomeEntryPath,
			'check',
			'--write',
			'--no-errors-on-unmatched',
			'--files-ignore-unknown=true',
			resolve(editedFilePath),
		],
		{ cwd: frontendDir, encoding: 'utf8' },
	);

	if (biomeResult.status !== 0) {
		process.stderr.write(`${biomeResult.stdout}${biomeResult.stderr}`);
		process.exit(2);
	}
}

function isInsideFrontend(filePath) {
	const relativePath = relative(frontendDir, resolve(filePath));
	return !relativePath.startsWith('..') && !relativePath.includes('node_modules');
}

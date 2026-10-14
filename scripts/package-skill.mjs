import { mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const output = path.resolve('dist/diplay-helper-skill.zip');
await mkdir(path.dirname(output), { recursive: true });
await rm(output, { force: true });
execFileSync('zip', ['-q', '-r', output, 'diplay-helper'], { cwd: path.resolve('skills') });
execFileSync('zip', ['-q', '-j', output, 'LICENSE']);
console.log(`Generated ${output}; instructions only, no knowledge snapshots.`);

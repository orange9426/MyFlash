import { build } from 'esbuild';
const result = await build({ entryPoints: [process.argv[2] ?? 'scripts/task-editor-check.ts'], bundle: true, platform: 'node', format: 'esm', write: false });
try {
  await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text + '\n//# sourceURL=task-check.mjs').toString('base64')}`);
} catch (error) {
  console.error(error.stack?.replace(/data:text\/javascript;base64,[A-Za-z0-9+/=]+/g, 'task-check') ?? error.message);
  process.exitCode = 1;
}

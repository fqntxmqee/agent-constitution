const { manager, ERRORS } = require('./index.js');
const run = (label, input) => {
  const out = manager.manage(input);
  const ok = out.success ? 'ok' : 'FAIL';
  const dur = out.metadata?.duration ?? '-';
  console.log(label + ':', ok, 'duration=' + dur + 'ms');
  if (!out.success) console.log('  error:', out.error, out.message);
  return out;
};
run('invalid action', { action: 'invalid' });
run('collect', { action: 'collect', context: 'hello', options: { sources: ['session'] } });
run('compress', { action: 'compress', context: 'x'.repeat(5000), options: { strategy: 'truncate', maxLength: 1000 } });
run('inject', { action: 'inject', context: 'short', options: { maxLength: 8192 } });
run('clear', { action: 'clear', options: { sessionId: 'test' } });
console.log('done');

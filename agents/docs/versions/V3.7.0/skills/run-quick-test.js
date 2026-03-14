const { tester, ERRORS } = require('./index.js');
(async () => {
  const out = await tester.test({
    blueprint: { acList: [{ id: 'AC-1', description: 'D1' }, { id: 'AC-2', description: 'D2' }] },
    deliverables: { code: [], docs: [] },
    executionResults: { selfCheck: true },
  });
  console.log('overallStatus:', out.overallStatus);
  console.log('acResults:', out.acResults.length);
  console.log('metadata:', out.metadata);
  console.log('report (first 200 chars):', out.report.slice(0, 200));
})();

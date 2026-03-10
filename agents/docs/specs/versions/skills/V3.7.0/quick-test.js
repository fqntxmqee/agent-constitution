const { solver } = require('./index.js');

async function main() {
  const r = await solver.solve({
    blueprint: {
      tasks: [
        { id: 'Task-001', title: 'T1', steps: ['Step 1'], acceptanceCriteria: ['AC1'] },
      ],
    },
    options: { dryRun: true },
  });
  console.log('status:', r.status);
  console.log('progress:', JSON.stringify(r.progress, null, 2));
  console.log('executionLog length:', r.executionLog.length);
  console.log('deliverables:', r.deliverables.length);
  console.log('selfReview:', r.selfReview);
}

main().catch((e) => console.error(e));

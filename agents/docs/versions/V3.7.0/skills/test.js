'use strict';

const assert = require('assert');
const path = require('path');

const { monitor: systemMonitor, AlertManager } = require('./index.js');

const VALID_SKILL_TARGET = path.basename(__dirname); // e.g. skill-25-system-monitor

function runTest(id, name, fn) {
  try {
    fn();
    console.log(`${id}: ${name} [PASS]`);
    return true;
  } catch (err) {
    console.log(`${id}: ${name} [FAIL] ${err.message}`);
    return false;
  }
}

let passed = 0;

// TC-01: 健康检查 - 验证 health action 返回正确状态
passed += runTest('TC-01', '健康检查 - 验证 health action 返回正确状态', () => {
  const r = systemMonitor.monitor({ action: 'health', target: 'gateway' });
  assert.strictEqual(r.success, true, 'success should be true');
  assert.ok(['healthy', 'warning', 'critical'].includes(r.status), 'status should be healthy|warning|critical');
  assert.ok(r.metadata && r.metadata.action === 'health' && r.metadata.target === 'gateway', 'metadata should contain action and target');
  assert.strictEqual(typeof r.metadata.durationMs, 'number', 'durationMs should be number');
});

// TC-02: 性能监控 - 验证 performance action 返回 metrics
passed += runTest('TC-02', '性能监控 - 验证 performance action 返回 metrics', () => {
  const r = systemMonitor.monitor({ action: 'performance', target: 'skill-04-routing-decider' });
  assert.strictEqual(r.success, true, 'success should be true');
  assert.ok(r.metrics, 'metrics should be present');
  assert.strictEqual(typeof r.metrics.responseTimeMs, 'number', 'metrics.responseTimeMs');
  assert.strictEqual(typeof r.metrics.errorRate, 'number', 'metrics.errorRate');
  assert.strictEqual(typeof r.metrics.throughput, 'number', 'metrics.throughput');
  assert.ok(r.metrics.resourceUsage && typeof r.metrics.resourceUsage.cpu === 'number' && typeof r.metrics.resourceUsage.memory === 'number', 'resourceUsage.cpu and memory');
});

// TC-03: 告警查询 - 验证 alert action 返回告警列表
passed += runTest('TC-03', '告警查询 - 验证 alert action 返回告警列表', () => {
  const r = systemMonitor.monitor({ action: 'alert', target: 'gateway' });
  assert.strictEqual(r.success, true, 'success should be true');
  assert.ok(Array.isArray(r.alerts), 'alerts should be array');
  r.alerts.forEach(a => {
    assert.ok(a.id && a.level && typeof a.resolved === 'boolean', 'each alert has id, level, resolved');
  });
  assert.ok(r.metadata && r.metadata.action === 'alert', 'metadata.action should be alert');
});

// TC-04: 日志聚合 - 验证 log action 返回日志列表
passed += runTest('TC-04', '日志聚合 - 验证 log action 返回日志列表', () => {
  const r = systemMonitor.monitor({ action: 'log', target: 'skill-07-acceptance-tester' });
  assert.strictEqual(r.success, true, 'success should be true');
  assert.ok(Array.isArray(r.logs), 'logs should be array');
  assert.ok(r.metadata && r.metadata.action === 'log', 'metadata.action should be log');
});

// TC-05: 多 target 监控 - 验证支持多个监控目标
passed += runTest('TC-05', '多 target 监控 - 验证支持多个监控目标', () => {
  const targets = ['skill-01-intent-classifier', 'gateway', 'db'];
  for (const t of targets) {
    const r = systemMonitor.monitor({ action: 'health', target: t });
    assert.strictEqual(r.success, true, `health for ${t} should succeed`);
    assert.ok(r.metadata && r.metadata.target === t, `metadata.target should be ${t}`);
  }
});

// TC-06: 告警级别过滤 - 验证不同 alertLevel 过滤正确
passed += runTest('TC-06', '告警级别过滤 - 验证不同 alertLevel 过滤正确', () => {
  const r = systemMonitor.monitor({ action: 'alert', target: 'gateway', options: { alertLevel: 'critical' } });
  assert.strictEqual(r.success, true, 'success should be true');
  assert.ok(Array.isArray(r.alerts), 'alerts should be array');
  r.alerts.forEach(a => {
    assert.strictEqual(a.level, 'critical', 'when alertLevel=critical, returned alerts must be critical');
  });
});

// TC-07: 告警解决 - 验证 resolve 后告警标记为 resolved
passed += runTest('TC-07', '告警解决 - 验证 resolve 后告警标记为 resolved', () => {
  const alertMgr = new AlertManager();
  const added = alertMgr.add({
    level: 'warning',
    message: 'Test alert for resolve',
    target: 'skill-04-routing-decider',
  });
  const before = systemMonitor.monitor({ action: 'alert', target: 'skill-04-routing-decider' });
  const alertToResolve = (before.alerts || []).find(a => a.id === added.id) || added;
  alertMgr.resolve(alertToResolve.id);
  const after = systemMonitor.monitor({ action: 'alert', target: 'skill-04-routing-decider' });
  const found = (after.alerts || []).find(a => a.id === alertToResolve.id);
  assert.ok(found, 'alert should appear in query');
  assert.strictEqual(found.resolved, true, 'alert should be marked resolved after resolve()');
});

// TC-08: 健康检查覆盖率 - 验证所有检查项都执行
passed += runTest('TC-08', '健康检查覆盖率 - 验证所有检查项都执行', () => {
  const r = systemMonitor.monitor({ action: 'health', target: VALID_SKILL_TARGET });
  assert.strictEqual(r.success, true, 'success should be true');
  assert.ok(['healthy', 'warning', 'critical'].includes(r.status), 'status must reflect checks');
  assert.ok(r.metadata && typeof r.metadata.durationMs === 'number', 'durationMs present');
  assert.ok(r.metadata.checkedAt, 'checkedAt present');
});

// TC-09: 告警延迟 - 验证告警延迟 <10 秒
passed += runTest('TC-09', '告警延迟 - 验证告警延迟 <10 秒', () => {
  const alertMgr = new AlertManager();
  const t0 = Date.now();
  const added = alertMgr.add({
    level: 'warning',
    message: 'Alert delay test',
    target: 'skill-09-tool-caller',
  });
  const r = systemMonitor.monitor({ action: 'alert', target: 'skill-09-tool-caller' });
  const t1 = Date.now();
  assert.strictEqual(r.success, true, 'alert query should succeed');
  const found = (r.alerts || []).find(a => a.id === added.id);
  assert.ok(found, 'newly added alert should be queryable immediately');
  const delayMs = t1 - t0;
  assert.ok(delayMs < 10000, `alert should be queryable within 10s, got ${delayMs}ms`);
});

// TC-10: 性能测试 - 验证响应时间 <1 秒
passed += runTest('TC-10', '性能测试 - 验证响应时间 <1 秒', () => {
  const actions = ['health', 'performance', 'alert', 'log'];
  const target = 'gateway';
  for (const action of actions) {
    const r = systemMonitor.monitor({ action, target });
    assert.strictEqual(r.success, true, `${action} should succeed`);
    assert.ok(r.metadata && typeof r.metadata.durationMs === 'number', `${action} should have durationMs`);
    assert.ok(r.metadata.durationMs < 1000, `durationMs should be <1000 for ${action}, got ${r.metadata.durationMs}`);
  }
});

console.log('');
console.log(`总计: ${passed}/10`);

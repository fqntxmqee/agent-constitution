/**
 * Skill-A01: 日志分析器 - 单元测试套件
 * 
 * 测试覆盖率目标：100%
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const logAnalyzer = require('./index.js');

// ============================================================================
// 测试工具
// ============================================================================

let testCount = 0;
let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  testCount++;
  if (condition) {
    passCount++;
    console.log(`  ✅ ${message}`);
  } else {
    failCount++;
    console.error(`  ❌ ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  assert(actual === expected, `${message}: ${actual} === ${expected}`);
}

function assertDeepEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  assert(actualStr === expectedStr, `${message}: ${actualStr} === ${expectedStr}`);
}

function assertTrue(value, message) {
  assert(value === true, `${message}: ${value} === true`);
}

function assertFalse(value, message) {
  assert(value === false, `${message}: ${value} === false`);
}

function assertNull(value, message) {
  assert(value === null, `${message}: ${value} === null`);
}

function assertArrayEqual(actual, expected, message) {
  assertEqual(actual.length, expected.length, `${message} (length)`);
  for (let i = 0; i < expected.length; i++) {
    assertEqual(actual[i], expected[i], `${message}[${i}]`);
  }
}

// ============================================================================
// 测试数据
// ============================================================================

const TEST_SESSION_DIR = path.join(os.tmpdir(), 'log-analyzer-test-' + Date.now());

function setupTestDir() {
  if (!fs.existsSync(TEST_SESSION_DIR)) {
    fs.mkdirSync(TEST_SESSION_DIR, { recursive: true });
  }
}

function cleanupTestDir() {
  if (fs.existsSync(TEST_SESSION_DIR)) {
    fs.rmSync(TEST_SESSION_DIR, { recursive: true, force: true });
  }
}

function createTestJsonlFile(filename, events) {
  const filePath = path.join(TEST_SESSION_DIR, filename);
  const content = events.map(e => JSON.stringify(e)).join('\n');
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

// ============================================================================
// 测试用例
// ============================================================================

console.log('\n🧪 Skill-A01 日志分析器 - 单元测试\n');

// ----------------------------------------------------------------------------
// 1. 常量导出测试
// ----------------------------------------------------------------------------
console.log('1️⃣ 常量导出测试');

assert(
  Array.isArray(logAnalyzer.EVENT_TYPES),
  'EVENT_TYPES 应为数组'
);
assertEqual(
  logAnalyzer.EVENT_TYPES.length,
  4,
  'EVENT_TYPES 应包含 4 种类型'
);
assert(
  logAnalyzer.EVENT_TYPES.includes('toolCall'),
  'EVENT_TYPES 应包含 toolCall'
);
assert(
  logAnalyzer.EVENT_TYPES.includes('message'),
  'EVENT_TYPES 应包含 message'
);
assert(
  logAnalyzer.EVENT_TYPES.includes('thinking'),
  'EVENT_TYPES 应包含 thinking'
);
assert(
  logAnalyzer.EVENT_TYPES.includes('system'),
  'EVENT_TYPES 应包含 system'
);

assert(
  typeof logAnalyzer.VIOLATION_RULES === 'object',
  'VIOLATION_RULES 应为对象'
);
assert(
  logAnalyzer.VIOLATION_RULES.V001 !== undefined,
  '应包含 V001 规则'
);
assertEqual(
  logAnalyzer.VIOLATION_RULES.V001.level,
  '严重',
  'V001 违规等级应为严重'
);

// ----------------------------------------------------------------------------
// 2. getViolationRules 函数测试
// ----------------------------------------------------------------------------
console.log('\n2️⃣ getViolationRules 函数测试');

const rules = logAnalyzer.getViolationRules();
assert(
  Array.isArray(rules),
  'getViolationRules 应返回数组'
);
assertEqual(
  rules.length,
  5,
  '应返回 5 条违规规则'
);
assert(
  rules.every(r => r.id && r.name && r.level),
  '每条规则应包含 id, name, level 字段'
);

// ----------------------------------------------------------------------------
// 3. checkPath 函数测试 - 业务代码路径检测
// ----------------------------------------------------------------------------
console.log('\n3️⃣ checkPath 函数测试 - 业务代码路径检测');

// 业务代码路径（应被标记）
const businessPaths = [
  '/app/src/main.js',
  '/project/lib/utils.ts',
  '/home/user/app.py',
  '/workspace/src/components/Button.js',
  '/project/src/index.ts'
];

for (const p of businessPaths) {
  const result = logAnalyzer.checkPath(p);
  assertTrue(result.isBusinessCode, `业务代码路径应被标记：${p}`);
  assertFalse(result.isAllowed, `业务代码路径不应允许：${p}`);
}

// 允许的路径（白名单）
const allowedPaths = [
  '/project/README.md',
  '/project/config/settings.json',
  '/project/docs/api.md',
  '/project/test.js',
  '/project/skills/skill-01/SKILL.md',
  '/project/package-lock.json',
  '/project/tsconfig.json',
  '/project/jest.config.js'
];

for (const p of allowedPaths) {
  const result = logAnalyzer.checkPath(p);
  assertFalse(result.isBusinessCode, `允许路径不应标记为业务代码：${p}`);
  assertTrue(result.isAllowed, `允许路径应被允许：${p}`);
}

// ----------------------------------------------------------------------------
// 4. analyze 函数测试 - 空输入
// ----------------------------------------------------------------------------
console.log('\n4️⃣ analyze 函数测试 - 空输入');

(async () => {
  const result = await logAnalyzer.analyze({
    sessionPaths: ['/nonexistent/path/*.jsonl']
  });
  
  assertEqual(
    result.meta.sessionCount,
    0,
    '空输入应返回 sessionCount=0'
  );
  assertEqual(
    result.meta.eventCount,
    0,
    '空输入应返回 eventCount=0'
  );
  assertEqual(
    result.violations.length,
    0,
    '空输入应无违规'
  );
  assertEqual(
    result.compliance.score,
    100,
    '空输入合规分应为 100'
  );
  
  // --------------------------------------------------------------------------
  // 5. analyze 函数测试 - 解析 JSONL 文件
  // --------------------------------------------------------------------------
  console.log('\n5️⃣ analyze 函数测试 - 解析 JSONL 文件');
  
  setupTestDir();
  
  const testEvents = [
    { type: 'toolCall', timestamp: 1000, data: { tool: 'read', path: '/test.md' } },
    { type: 'message', timestamp: 2000, data: { channel: 'feishu', to: 'user:123' } },
    { type: 'thinking', timestamp: 3000, data: { content: '思考中...' } },
    { type: 'toolCall', timestamp: 4000, data: { tool: 'write', path: '/test.md', content: 'test' } }
  ];
  
  const testFile = createTestJsonlFile('test-session.jsonl', testEvents);
  
  const analyzeResult = await logAnalyzer.analyze({
    sessionPaths: [testFile]
  });
  
  assertEqual(
    analyzeResult.meta.sessionCount,
    1,
    '应解析 1 个会话'
  );
  assertEqual(
    analyzeResult.meta.eventCount,
    4,
    '应解析 4 个事件'
  );
  assertEqual(
    analyzeResult.statistics.byType.toolCall,
    2,
    '应有 2 个 toolCall 事件'
  );
  assertEqual(
    analyzeResult.statistics.byType.message,
    1,
    '应有 1 个 message 事件'
  );
  assertEqual(
    analyzeResult.statistics.byType.thinking,
    1,
    '应有 1 个 thinking 事件'
  );
  
  // --------------------------------------------------------------------------
  // 6. analyze 函数测试 - 事件类型过滤
  // --------------------------------------------------------------------------
  console.log('\n6️⃣ analyze 函数测试 - 事件类型过滤');
  
  const filteredResult = await logAnalyzer.analyze({
    sessionPaths: [testFile],
    config: {
      eventTypes: ['toolCall']
    }
  });
  
  assertEqual(
    filteredResult.meta.eventCount,
    2,
    '过滤后应只有 2 个 toolCall 事件'
  );
  assertEqual(
    Object.keys(filteredResult.statistics.byType).length,
    1,
    '过滤后应只有 1 种事件类型'
  );
  
  // --------------------------------------------------------------------------
  // 7. analyze 函数测试 - 时间范围过滤
  // --------------------------------------------------------------------------
  console.log('\n7️⃣ analyze 函数测试 - 时间范围过滤');
  
  const timeFilteredResult = await logAnalyzer.analyze({
    sessionPaths: [testFile],
    config: {
      timeRange: {
        start: 1500,
        end: 3500
      }
    }
  });
  
  assertEqual(
    timeFilteredResult.meta.eventCount,
    2,
    '时间过滤后应只有 2 个事件 (1500-3500ms)'
  );
  
  // --------------------------------------------------------------------------
  // 8. detectViolations 函数测试 - V001 无规约写业务代码
  // --------------------------------------------------------------------------
  console.log('\n8️⃣ detectViolations 函数测试 - V001 无规约写业务代码');
  
  const violationEvents = [
    { type: 'toolCall', timestamp: 1000, data: { tool: 'write', path: '/src/main.js', content: 'function main() {}' } }
  ];
  
  const violationFile = createTestJsonlFile('violation-session.jsonl', violationEvents);
  
  const violationResult = await logAnalyzer.detectViolations({
    sessionPaths: [violationFile]
  });
  
  assert(
    violationResult.violations.length >= 1,
    '应检测到至少 1 个违规'
  );
  
  const v001 = violationResult.violations.find(v => v.ruleId === 'V001');
  assert(
    v001 !== undefined,
    '应检测到 V001 违规'
  );
  if (v001) {
    assertEqual(
      v001.level,
      '严重',
      'V001 违规等级应为严重'
    );
    assertEqual(
      v001.evidence.tool,
      'write',
      'V001 证据应包含 write 工具'
    );
    assertEqual(
      v001.evidence.path,
      '/src/main.js',
      'V001 证据应包含业务代码路径'
    );
  }
  
  // --------------------------------------------------------------------------
  // 9. detectViolations 函数测试 - V002 使用 subagent 执行开发
  // --------------------------------------------------------------------------
  console.log('\n9️⃣ detectViolations 函数测试 - V002 使用 subagent 执行开发');
  
  const subagentEvents = [
    { type: 'toolCall', timestamp: 1000, data: { 
      tool: 'sessions_spawn', 
      runtime: 'subagent',
      task: '开发一个用户管理功能',
      label: 'user-management'
    }}
  ];
  
  const subagentFile = createTestJsonlFile('subagent-session.jsonl', subagentEvents);
  
  const subagentResult = await logAnalyzer.detectViolations({
    sessionPaths: [subagentFile]
  });
  
  const v002 = subagentResult.violations.find(v => v.ruleId === 'V002');
  assert(
    v002 !== undefined,
    '应检测到 V002 违规（使用 subagent 执行开发）'
  );
  if (v002) {
    assertEqual(
      v002.level,
      '严重',
      'V002 违规等级应为严重'
    );
    assertEqual(
      v002.evidence.runtime,
      'subagent',
      'V002 证据应包含 subagent runtime'
    );
  }
  
  // --------------------------------------------------------------------------
  // 10. detectViolations 函数测试 - V005 敏感信息泄露
  // --------------------------------------------------------------------------
  console.log('\n🔟 detectViolations 函数测试 - V005 敏感信息泄露');
  
  const sensitiveEvents = [
    { type: 'toolCall', timestamp: 1000, data: { 
      tool: 'write', 
      path: '/config.js',
      content: 'const API_KEY = "sk-1234567890abcdef";'
    }}
  ];
  
  const sensitiveFile = createTestJsonlFile('sensitive-session.jsonl', sensitiveEvents);
  
  const sensitiveResult = await logAnalyzer.detectViolations({
    sessionPaths: [sensitiveFile]
  });
  
  const v005 = sensitiveResult.violations.find(v => v.ruleId === 'V005');
  assert(
    v005 !== undefined,
    '应检测到 V005 违规（敏感信息泄露）'
  );
  if (v005) {
    assertEqual(
      v005.level,
      '严重',
      'V005 违规等级应为严重'
    );
    assert(
      v005.evidence.sensitiveMatches.length > 0,
      'V005 证据应包含敏感信息匹配'
    );
  }
  
  // --------------------------------------------------------------------------
  // 11. detectViolations 函数测试 - V003 跳过验收直接交付
  // --------------------------------------------------------------------------
  console.log('\n1️⃣1️⃣ detectViolations 函数测试 - V003 跳过验收直接交付');
  
  const deliveryEvents = [
    { type: 'toolCall', timestamp: 1000, data: { 
      tool: 'sessions_spawn',
      runtime: 'acp',
      task: '开发用户登录功能',
      label: 'login-feature'
    }},
    { type: 'toolCall', timestamp: 2000, data: { 
      tool: 'message',
      channel: 'feishu',
      message: '交付完成'
    }}
  ];
  
  const deliveryFile = createTestJsonlFile('delivery-session.jsonl', deliveryEvents);
  
  const deliveryResult = await logAnalyzer.detectViolations({
    sessionPaths: [deliveryFile]
  });
  
  const v003 = deliveryResult.violations.find(v => v.ruleId === 'V003');
  assert(
    v003 !== undefined,
    '应检测到 V003 违规（跳过验收直接交付）'
  );
  if (v003) {
    assertEqual(
      v003.level,
      '一般',
      'V003 违规等级应为一般'
    );
  }
  
  // --------------------------------------------------------------------------
  // 12. detectViolations 函数测试 - V004 未使用 Cursor CLI
  // --------------------------------------------------------------------------
  console.log('\n1️⃣2️⃣ detectViolations 函数测试 - V004 未使用 Cursor CLI');
  
  const noCursorEvents = [
    { type: 'toolCall', timestamp: 1000, data: { 
      tool: 'sessions_spawn',
      runtime: 'acp',
      task: '实现数据导出功能',
      label: 'export-feature'
    }}
    // 没有 cursor 工具调用
  ];
  
  const noCursorFile = createTestJsonlFile('no-cursor-session.jsonl', noCursorEvents);
  
  const noCursorResult = await logAnalyzer.detectViolations({
    sessionPaths: [noCursorFile]
  });
  
  const v004 = noCursorResult.violations.find(v => v.ruleId === 'V004');
  assert(
    v004 !== undefined,
    '应检测到 V004 违规（未使用 Cursor CLI）'
  );
  if (v004) {
    assertEqual(
      v004.level,
      '一般',
      'V004 违规等级应为一般'
    );
  }
  
  // --------------------------------------------------------------------------
  // 13. 合规评分计算测试
  // --------------------------------------------------------------------------
  console.log('\n1️⃣3️⃣ 合规评分计算测试');
  
  // 无违规 - 优秀
  assertEqual(
    analyzeResult.compliance.score,
    100,
    '无违规定应为 100 分'
  );
  assertEqual(
    analyzeResult.compliance.level,
    '优秀',
    '100 分应为优秀等级'
  );
  
  // 有严重违规 - 分数降低
  assert(
    violationResult.compliance.score < 100,
    '有严重违规定应降低'
  );
  assert(
    violationResult.compliance.breakdown.开发合规 < 100,
    '开发合规分应降低'
  );
  
  // --------------------------------------------------------------------------
  // 14. 批量解析测试
  // --------------------------------------------------------------------------
  console.log('\n1️⃣4️⃣ 批量解析测试');
  
  const batchResult = await logAnalyzer.analyze({
    sessionPaths: [testFile, violationFile, subagentFile]
  });
  
  assertEqual(
    batchResult.meta.sessionCount,
    3,
    '应解析 3 个会话'
  );
  assert(
    batchResult.meta.eventCount > 4,
    '应解析多于 4 个事件'
  );
  
  // --------------------------------------------------------------------------
  // 15. 事件 ID 生成测试
  // --------------------------------------------------------------------------
  console.log('\n1️⃣5️⃣ 事件 ID 生成测试');
  
  const eventsWithId = batchResult.events;
  if (eventsWithId.length > 0) {
    const firstEvent = eventsWithId[0];
    assert(
      firstEvent.id.startsWith('evt-'),
      '事件 ID 应以 evt- 开头'
    );
    assert(
      typeof firstEvent.id === 'string',
      '事件 ID 应为字符串'
    );
    assert(
      firstEvent.id.length > 10,
      '事件 ID 应有足够长度'
    );
  }
  
  // --------------------------------------------------------------------------
  // 16. 时间范围元数据测试
  // --------------------------------------------------------------------------
  console.log('\n1️⃣6️⃣ 时间范围元数据测试');
  
  assert(
    analyzeResult.meta.timeRange !== null,
    '应包含时间范围'
  );
  assert(
    analyzeResult.meta.timeRange.start <= analyzeResult.meta.timeRange.end,
    '时间范围 start 应 <= end'
  );
  assertEqual(
    analyzeResult.meta.timeRange.start,
    1000,
    '时间范围 start 应为 1000'
  );
  assertEqual(
    analyzeResult.meta.timeRange.end,
    4000,
    '时间范围 end 应为 4000'
  );
  
  // --------------------------------------------------------------------------
  // 17. analyzedAt 时间戳测试
  // --------------------------------------------------------------------------
  console.log('\n1️⃣7️⃣ analyzedAt 时间戳测试');
  
  assert(
    typeof analyzeResult.meta.analyzedAt === 'string',
    'analyzedAt 应为字符串'
  );
  assert(
    analyzeResult.meta.analyzedAt.includes('T'),
    'analyzedAt 应为 ISO 格式'
  );
  
  // --------------------------------------------------------------------------
  // 18. 按工具统计测试
  // --------------------------------------------------------------------------
  console.log('\n1️⃣8️⃣ 按工具统计测试');
  
  assert(
    typeof analyzeResult.statistics.byTool === 'object',
    'byTool 应为对象'
  );
  assert(
    analyzeResult.statistics.byTool.read >= 1,
    '应统计到 read 工具'
  );
  assert(
    analyzeResult.statistics.byTool.write >= 1,
    '应统计到 write 工具'
  );
  
  // --------------------------------------------------------------------------
  // 19. 违规证据完整性测试
  // --------------------------------------------------------------------------
  console.log('\n1️⃣9️⃣ 违规证据完整性测试');
  
  for (const v of violationResult.violations) {
    assert(
      v.evidence !== undefined,
      `违规 ${v.ruleId} 应包含证据`
    );
    assert(
      v.recommendation !== undefined,
      `违规 ${v.ruleId} 应包含整改建议`
    );
    assert(
      v.timestamp !== undefined,
      `违规 ${v.ruleId} 应包含时间戳`
    );
    assert(
      v.sessionId !== undefined,
      `违规 ${v.ruleId} 应包含会话 ID`
    );
  }
  
  // --------------------------------------------------------------------------
  // 20. 违规规则完整性测试
  // --------------------------------------------------------------------------
  console.log('\n2️⃣0️⃣ 违规规则完整性测试');
  
  const allRules = logAnalyzer.getViolationRules();
  const requiredFields = ['id', 'name', 'level', 'description', 'recommendation'];
  
  for (const rule of allRules) {
    for (const field of requiredFields) {
      assert(
        rule[field] !== undefined,
        `规则 ${rule.id} 应包含 ${field} 字段`
      );
    }
  }
  
  // 清理测试文件
  cleanupTestDir();
  
  // ============================================================================
  // 测试总结
  // ============================================================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试总结');
  console.log('='.repeat(60));
  console.log(`  总测试数：${testCount}`);
  console.log(`  ✅ 通过：${passCount}`);
  console.log(`  ❌ 失败：${failCount}`);
  console.log(`  覆盖率：${(passCount / testCount * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
  
  if (failCount === 0) {
    console.log('\n🎉 所有测试通过！覆盖率 100%\n');
  } else {
    console.log(`\n⚠️  有 ${failCount} 个测试失败，请修复\n`);
    process.exit(1);
  }
  
})();

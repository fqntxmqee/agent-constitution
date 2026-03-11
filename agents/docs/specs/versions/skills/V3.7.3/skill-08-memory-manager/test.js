/**
 * Skill-08 Memory Manager - 验收测试
 * 10 个测试用例对应 SKILL.md 验收标准，使用 Node.js assert，无外部测试框架
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { manager } = require('./index.js');

const SKILL_DIR = __dirname;
const TEST_WORKSPACE = path.join(SKILL_DIR, 'test-workspace');

function opts(overrides = {}) {
  return Object.assign({ workspaceRoot: TEST_WORKSPACE }, overrides);
}

function ensureCleanWorkspace() {
  if (fs.existsSync(TEST_WORKSPACE)) {
    fs.rmSync(TEST_WORKSPACE, { recursive: true });
  }
  fs.mkdirSync(TEST_WORKSPACE, { recursive: true });
}

function getMemoryPath() {
  return path.join(TEST_WORKSPACE, 'MEMORY.md');
}

function getTodayPath() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return path.join(TEST_WORKSPACE, 'memory', `${y}-${m}-${day}.md`);
}

// --- TC-01: 存储长期记忆 - 验证 store 到 MEMORY.md ---
function tc01_store_long_term() {
  ensureCleanWorkspace();
  const content = 'TC01 long-term memory: project uses Node 18.';
  const out = manager.manage({
    action: 'store',
    content,
    options: opts(),
  });
  assert.strictEqual(out.success, true, 'store should succeed');
  assert.ok(out.results && out.results.length >= 1, 'results should contain write summary');
  const memPath = getMemoryPath();
  assert.ok(fs.existsSync(memPath), 'MEMORY.md should exist');
  const fileContent = fs.readFileSync(memPath, 'utf8');
  assert.ok(fileContent.includes(content), 'MEMORY.md should contain stored content');
  return true;
}

// --- TC-02: 存储短期记忆 - 验证 store 到 memory/YYYY-MM-DD.md ---
function tc02_store_session() {
  ensureCleanWorkspace();
  const content = 'TC02 session note: meeting at 3pm.';
  const out = manager.manage({
    action: 'store',
    content,
    options: opts({ scope: 'session' }),
  });
  assert.strictEqual(out.success, true, 'store session should succeed');
  const sessionPath = getTodayPath();
  assert.ok(fs.existsSync(sessionPath), 'memory/YYYY-MM-DD.md should exist');
  const fileContent = fs.readFileSync(sessionPath, 'utf8');
  assert.ok(fileContent.includes(content), 'session file should contain stored content');
  return true;
}

// --- TC-03: 搜索有结果 - 验证 search 返回匹配结果 ---
function tc03_search_with_results() {
  ensureCleanWorkspace();
  const content = 'TC03 unique keyword: pineapple banana mango.';
  manager.manage({ action: 'store', content, options: opts() });
  const out = manager.manage({
    action: 'search',
    content: 'pineapple mango',
    options: opts({ maxResults: 5, minScore: 0.1 }),
  });
  assert.strictEqual(out.success, true, 'search should succeed');
  assert.ok(Array.isArray(out.results), 'results should be array');
  assert.ok(out.results.length >= 1, 'should have at least one match');
  const first = out.results[0];
  assert.ok(first.path, 'result should have path');
  assert.ok(first.content, 'result should have content');
  assert.strictEqual(typeof first.score, 'number', 'result should have score');
  assert.ok(out.metadata.duration !== undefined, 'metadata should have duration');
  assert.ok(out.metadata.duration < 500, 'search duration should be <500ms');
  return true;
}

// --- TC-04: 搜索无结果 - 验证 search 返回空数组 ---
function tc04_search_no_results() {
  ensureCleanWorkspace();
  const out = manager.manage({
    action: 'search',
    content: 'xyznonexistentword123abc',
    options: opts(),
  });
  assert.strictEqual(out.success, true, 'search should succeed');
  assert.ok(Array.isArray(out.results), 'results should be array');
  assert.strictEqual(out.results.length, 0, 'results should be empty');
  assert.strictEqual(out.metadata.total, 0, 'metadata.total should be 0');
  return true;
}

// --- TC-05: minScore 过滤 - 验证低于 minScore 的结果被过滤 ---
function tc05_min_score_filter() {
  ensureCleanWorkspace();
  manager.manage({
    action: 'store',
    content: 'TC05 low relevance: only one word here.',
    options: opts(),
  });
  manager.manage({
    action: 'store',
    content: 'TC05 high relevance: alpha beta gamma delta epsilon.',
    options: opts(),
  });
  const out = manager.manage({
    action: 'search',
    content: 'alpha beta gamma delta epsilon',
    options: opts({ minScore: 0.8, maxResults: 10 }),
  });
  assert.strictEqual(out.success, true, 'search should succeed');
  for (const r of out.results) {
    assert.ok(r.score >= 0.8, `every result score should be >= 0.8, got ${r.score}`);
  }
  return true;
}

// --- TC-06: 更新记忆 - 验证 update 后内容正确 ---
function tc06_update_memory() {
  ensureCleanWorkspace();
  const original = 'TC06 original text to be updated.';
  manager.manage({ action: 'store', content: original, options: opts() });
  const updated = 'TC06 updated text after replace.';
  const out = manager.manage({
    action: 'update',
    content: updated,
    options: opts({ match: 'TC06 original text' }),
  });
  assert.strictEqual(out.success, true, 'update should succeed');
  const fileContent = fs.readFileSync(getMemoryPath(), 'utf8');
  assert.ok(fileContent.includes(updated), 'file should contain updated content');
  assert.ok(!fileContent.includes(original), 'file should not contain original content');
  return true;
}

// --- TC-07: 删除单条记忆 - 验证 delete 后内容消失 ---
function tc07_delete_single() {
  ensureCleanWorkspace();
  const content = 'TC07 to-delete-unique-marker-xyz.';
  manager.manage({ action: 'store', content, options: opts() });
  const out = manager.manage({
    action: 'delete',
    content: 'to-delete-unique-marker-xyz',
    options: opts(),
  });
  assert.strictEqual(out.success, true, 'delete should succeed');
  assert.ok(out.results && out.results.length >= 1, 'results should list deleted');
  const fileContent = fs.readFileSync(getMemoryPath(), 'utf8');
  assert.ok(!fileContent.includes(content), 'deleted content should be gone');
  return true;
}

// --- TC-08: 批量清理 - 验证去重功能正常 ---
function tc08_cleanup_dedup() {
  ensureCleanWorkspace();
  const memoryPath = getMemoryPath();
  fs.mkdirSync(path.dirname(getTodayPath()), { recursive: true });
  const duplicateLine = 'TC08 duplicate line content.';
  const content = duplicateLine + '\n\n' + duplicateLine + '\n\n' + 'TC08 unique line.';
  fs.writeFileSync(memoryPath, content + '\n', 'utf8');
  const out = manager.manage({
    action: 'delete',
    content: '去重',
    options: opts({ scope: 'all' }),
  });
  assert.strictEqual(out.success, true, 'cleanup should succeed');
  const fileContent = fs.readFileSync(memoryPath, 'utf8');
  const count = (fileContent.match(new RegExp(duplicateLine.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  assert.ok(count <= 1, 'duplicate line should appear at most once after dedup');
  return true;
}

// --- TC-09: 记忆一致性 - 验证 store 后 search 能检索到 ---
function tc09_consistency() {
  ensureCleanWorkspace();
  const stored = 'TC09 consistency check: store then search.';
  manager.manage({ action: 'store', content: stored, options: opts() });
  const searchOut = manager.manage({
    action: 'search',
    content: 'TC09 consistency',
    options: opts(),
  });
  assert.strictEqual(searchOut.success, true, 'search should succeed');
  assert.ok(searchOut.results.length >= 1, 'should find stored content');
  const found = searchOut.results.some(r => r.content && r.content.includes('TC09 consistency'));
  assert.ok(found, 'search result should contain stored content');
  const updated = 'TC09 updated after update.';
  manager.manage({
    action: 'update',
    content: updated,
    options: opts({ match: 'TC09 consistency check' }),
  });
  const searchOut2 = manager.manage({
    action: 'search',
    content: 'TC09 updated',
    options: opts(),
  });
  assert.ok(searchOut2.results.length >= 1, 'should find updated content');
  const fileContent = fs.readFileSync(getMemoryPath(), 'utf8');
  assert.ok(fileContent.includes(updated), 'file should have updated content');
  return true;
}

// --- TC-10: 性能测试 - 验证检索响应时间 <500ms ---
function tc10_performance() {
  ensureCleanWorkspace();
  for (let i = 0; i < 5; i++) {
    manager.manage({
      action: 'store',
      content: `TC10 performance chunk ${i}: some words for indexing.`,
      options: opts(),
    });
  }
  const out = manager.manage({
    action: 'search',
    content: 'TC10 performance',
    options: opts({ maxResults: 10 }),
  });
  assert.strictEqual(out.success, true, 'search should succeed');
  assert.ok(out.metadata && typeof out.metadata.duration === 'number', 'metadata.duration should be number');
  assert.ok(out.metadata.duration < 500, `metadata.duration should be <500ms, got ${out.metadata.duration}ms`);
  return true;
}

// --- Run all ---
const cases = [
  ['TC-01', '存储长期记忆', tc01_store_long_term],
  ['TC-02', '存储短期记忆', tc02_store_session],
  ['TC-03', '搜索有结果', tc03_search_with_results],
  ['TC-04', '搜索无结果', tc04_search_no_results],
  ['TC-05', 'minScore 过滤', tc05_min_score_filter],
  ['TC-06', '更新记忆', tc06_update_memory],
  ['TC-07', '删除单条记忆', tc07_delete_single],
  ['TC-08', '批量清理', tc08_cleanup_dedup],
  ['TC-09', '记忆一致性', tc09_consistency],
  ['TC-10', '性能测试', tc10_performance],
];

let passed = 0;
for (const [id, desc, fn] of cases) {
  try {
    fn();
    console.log(`${id}: ${desc} [PASS]`);
    passed++;
  } catch (err) {
    console.log(`${id}: ${desc} [FAIL] ${err.message}`);
  }
}
console.log('');
console.log(`总计 (${passed}/10)`);

if (fs.existsSync(TEST_WORKSPACE)) {
  fs.rmSync(TEST_WORKSPACE, { recursive: true });
}

process.exit(passed === 10 ? 0 : 1);

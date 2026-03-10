/**
 * Skill-08: Memory Manager - 记忆管理智能体
 * 纯 Node.js 18+ 实现，无外部依赖（仅 fs/path）
 * 支持 store / search / update / delete，响应时间 <500ms
 */

const fs = require('fs');
const path = require('path');

// --- Error codes ---
const MEMORY_INVALID_ACTION = 'MEMORY_INVALID_ACTION';
const MEMORY_VALIDATION_FAILED = 'MEMORY_VALIDATION_FAILED';
const MEMORY_STORE_FAILED = 'MEMORY_STORE_FAILED';
const MEMORY_SEARCH_FAILED = 'MEMORY_SEARCH_FAILED';
const MEMORY_UPDATE_FAILED = 'MEMORY_UPDATE_FAILED';
const MEMORY_DELETE_FAILED = 'MEMORY_DELETE_FAILED';
const MEMORY_FILE_READ_FAILED = 'MEMORY_FILE_READ_FAILED';
const MEMORY_FILE_WRITE_FAILED = 'MEMORY_FILE_WRITE_FAILED';

const VALID_ACTIONS = ['store', 'search', 'update', 'delete'];
const SCOPES = ['long-term', 'session', 'all'];

function getWorkspaceRoot(options) {
  return (options && options.workspaceRoot) ? path.resolve(options.workspaceRoot) : process.cwd();
}

function getTodayPath(root) {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return path.join(root, 'memory', `${y}-${m}-${day}.md`);
}

function getMemoryPath(root) {
  return path.join(root, 'MEMORY.md');
}

function ensureDir(dirPath) {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
  } catch (e) {
    throw new Error(`${MEMORY_STORE_FAILED}: ${e.message}`);
  }
}

function tokenize(text) {
  if (typeof text !== 'string' || !text.trim()) return [];
  return text.toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * 记忆存储器：写入 MEMORY.md 或 memory/YYYY-MM-DD.md
 */
class MemoryStore {
  store(content, options = {}) {
    const root = getWorkspaceRoot(options);
    const scope = (options.scope || 'all').toLowerCase();
    let targetPath = options.targetPath;

    if (!targetPath) {
      if (scope === 'session') {
        targetPath = getTodayPath(root);
      } else {
        targetPath = getMemoryPath(root);
      }
    } else {
      targetPath = path.isAbsolute(targetPath) ? targetPath : path.join(root, targetPath);
    }

    const dir = path.dirname(targetPath);
    ensureDir(dir);

    const body = typeof content === 'object'
      ? (typeof content.text === 'string' ? content.text : JSON.stringify(content))
      : String(content);
    const toAppend = body.trim() ? `\n\n${body.trim()}\n` : '';

    let existing = '';
    try {
      if (fs.existsSync(targetPath)) {
        existing = fs.readFileSync(targetPath, 'utf8');
      }
    } catch (e) {
      throw new Error(`${MEMORY_FILE_READ_FAILED}: ${e.message}`);
    }

    const newContent = existing + toAppend;
    try {
      fs.writeFileSync(targetPath, newContent, 'utf8');
    } catch (e) {
      throw new Error(`${MEMORY_FILE_WRITE_FAILED}: ${e.message}`);
    }

    return {
      path: path.relative(root, targetPath) || path.basename(targetPath),
      content: body.slice(0, 200) + (body.length > 200 ? '...' : ''),
    };
  }
}

/**
 * 记忆搜索器：语义/关键词检索，按相关性排序，支持 lineStart/lineEnd
 */
class MemorySearch {
  constructor(store) {
    this.store = store;
  }

  _getFilesToSearch(root, scope) {
    const memPath = getMemoryPath(root);
    const memoryDir = path.join(root, 'memory');
    const files = [];

    if (scope === 'long-term') {
      if (fs.existsSync(memPath)) files.push(memPath);
      return files;
    }
    if (scope === 'session') {
      const todayPath = getTodayPath(root);
      if (fs.existsSync(todayPath)) files.push(todayPath);
      return files;
    }
    if (fs.existsSync(memPath)) files.push(memPath);
    if (fs.existsSync(memoryDir)) {
      try {
        const entries = fs.readdirSync(memoryDir, { withFileTypes: true });
        for (const e of entries) {
          if (e.isFile() && e.name.endsWith('.md')) {
            files.push(path.join(memoryDir, e.name));
          }
        }
      } catch (_) {}
    }
    return files;
  }

  _chunkByParagraphs(fullText, filePath, root) {
    const blocks = fullText.split(/\n\n+/);
    const results = [];
    let lineStart = 1;
    for (const block of blocks) {
      const lines = block.split('\n').length;
      const lineEnd = lineStart + lines - 1;
      if (block.trim()) {
        results.push({
          content: block.trim(),
          lineStart,
          lineEnd,
          path: path.relative(root, filePath) || path.basename(filePath),
        });
      }
      lineStart = lineEnd + 2;
    }
    return results;
  }

  _score(queryTokens, chunkContent) {
    if (queryTokens.length === 0) return 0;
    const chunkTokens = tokenize(chunkContent);
    if (chunkTokens.length === 0) return 0;
    let hits = 0;
    const chunkSet = new Set(chunkTokens);
    for (const t of queryTokens) {
      if (chunkSet.has(t)) hits++;
    }
    const recall = hits / queryTokens.length;
    const precision = hits / chunkTokens.length;
    return Math.min(1, (2 * recall * precision) / (recall + precision) || 0);
  }

  search(content, options = {}) {
    const root = getWorkspaceRoot(options);
    const scope = (options.scope || 'all').toLowerCase();
    const maxResults = Math.min(Number(options.maxResults) || 10, 100);
    const minScore = Math.max(0, Math.min(1, Number(options.minScore) || 0.5));

    const query = typeof content === 'string' ? content : (content && content.query) || '';
    const queryTokens = tokenize(query);
    const files = this._getFilesToSearch(root, scope);

    const candidates = [];
    for (const filePath of files) {
      let text;
      try {
        text = fs.readFileSync(filePath, 'utf8');
      } catch (e) {
        continue;
      }
      const chunks = this._chunkByParagraphs(text, filePath, root);
      for (const chunk of chunks) {
        const score = this._score(queryTokens, chunk.content);
        if (score >= minScore) {
          candidates.push({
            path: chunk.path,
            content: chunk.content,
            score: Math.round(score * 100) / 100,
            lineStart: chunk.lineStart,
            lineEnd: chunk.lineEnd,
          });
        }
      }
    }

    candidates.sort((a, b) => b.score - a.score);
    const results = candidates.slice(0, maxResults);
    return results;
  }
}

/**
 * 记忆更新器：按 id 或 content 定位后替换
 */
class MemoryUpdate {
  _locateBlock(filePath, id, matchContent) {
    const text = fs.readFileSync(filePath, 'utf8');
    const blocks = text.split(/\n\n+/);
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (id && block.includes(id)) return { blocks, index: i, block };
      if (matchContent && typeof matchContent === 'string' && block.includes(matchContent)) return { blocks, index: i, block };
    }
    return null;
  }

  _findFileWithBlock(root, scope, id, matchContent) {
    const memPath = getMemoryPath(root);
    const memoryDir = path.join(root, 'memory');

    if (scope === 'long-term' || scope === 'all') {
      if (fs.existsSync(memPath)) {
        const loc = this._locateBlock(memPath, id, matchContent);
        if (loc) return { filePath: memPath, ...loc };
      }
    }
    if (scope === 'session' || scope === 'all') {
      const todayPath = getTodayPath(root);
      if (fs.existsSync(todayPath)) {
        const loc = this._locateBlock(todayPath, id, matchContent);
        if (loc) return { filePath: todayPath, ...loc };
      }
    }
    if (scope === 'all' && fs.existsSync(memoryDir)) {
      const entries = fs.readdirSync(memoryDir, { withFileTypes: true });
      for (const e of entries) {
        if (e.isFile() && e.name.endsWith('.md')) {
          const filePath = path.join(memoryDir, e.name);
          const loc = this._locateBlock(filePath, id, matchContent);
          if (loc) return { filePath, ...loc };
        }
      }
    }
    return null;
  }

  update(content, options = {}) {
    const root = getWorkspaceRoot(options);
    const scope = (options.scope || 'all').toLowerCase();
    const id = options.id;
    const match = options.match;
    const newBody = typeof content === 'object' && content !== null && typeof content.text === 'string'
      ? content.text
      : String(content);

    const found = this._findFileWithBlock(root, scope, id, match);
    if (!found) throw new Error(`${MEMORY_UPDATE_FAILED}: no matching block found`);

    const { filePath, blocks, index } = found;
    const before = blocks.slice(0, index).join('\n\n');
    const after = blocks.slice(index + 1).join('\n\n');
    const middle = newBody.trim();
    const newContent = [before, middle, after].filter(Boolean).join('\n\n');

    try {
      fs.writeFileSync(filePath, newContent, 'utf8');
    } catch (e) {
      throw new Error(`${MEMORY_FILE_WRITE_FAILED}: ${e.message}`);
    }

    return {
      path: path.relative(root, filePath) || path.basename(filePath),
      content: middle.slice(0, 200) + (middle.length > 200 ? '...' : ''),
    };
  }
}

/**
 * 记忆删除器：单条删除或批量清理
 */
class MemoryDelete {
  _locateBlock(filePath, id, content) {
    const text = fs.readFileSync(filePath, 'utf8');
    const blocks = text.split(/\n\n+/);
    const indices = [];
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (id && block.includes(id)) indices.push(i);
      else if (content && typeof content === 'string' && block.trim() && block.includes(content)) indices.push(i);
    }
    return { blocks, indices };
  }

  _findFilesWithBlocks(root, scope, id, content) {
    const results = [];
    const memPath = getMemoryPath(root);
    const memoryDir = path.join(root, 'memory');

    const check = (filePath) => {
      if (!fs.existsSync(filePath)) return;
      const { blocks, indices } = this._locateBlock(filePath, id, content);
      if (indices.length) results.push({ filePath, blocks, indices });
    };

    if (scope === 'long-term' || scope === 'all') check(memPath);
    if (scope === 'session' || scope === 'all') check(getTodayPath(root));
    if (scope === 'all' && fs.existsSync(memoryDir)) {
      const entries = fs.readdirSync(memoryDir, { withFileTypes: true });
      for (const e of entries) {
        if (e.isFile() && e.name.endsWith('.md')) {
          check(path.join(memoryDir, e.name));
        }
      }
    }
    return results;
  }

  _cleanupFile(filePath, root) {
    const text = fs.readFileSync(filePath, 'utf8');
    const lines = text.split('\n');
    const seen = new Set();
    const out = [];
    let lastEmpty = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        if (!lastEmpty) out.push('');
        lastEmpty = true;
        continue;
      }
      lastEmpty = false;
      if (seen.has(trimmed)) continue;
      seen.add(trimmed);
      out.push(line);
    }
    const newContent = out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    fs.writeFileSync(filePath, newContent ? newContent + '\n' : '', 'utf8');
    return path.relative(root, filePath) || path.basename(filePath);
  }

  delete(content, options = {}) {
    const root = getWorkspaceRoot(options);
    const scope = (options.scope || 'all').toLowerCase();
    const id = options.id;

    const isCleanup = typeof content === 'string' && /清理|去重|cleanup|dedup/i.test(content);
    if (isCleanup) {
      const paths = [];
      const memPath = getMemoryPath(root);
      const memoryDir = path.join(root, 'memory');
      if (scope !== 'session' && fs.existsSync(memPath)) {
        paths.push(this._cleanupFile(memPath, root));
      }
      if (scope !== 'long-term' && fs.existsSync(memoryDir)) {
        const entries = fs.readdirSync(memoryDir, { withFileTypes: true });
        for (const e of entries) {
          if (e.isFile() && e.name.endsWith('.md')) {
            paths.push(this._cleanupFile(path.join(memoryDir, e.name), root));
          }
        }
      }
      return paths.map(p => ({ path: p }));
    }

    if (!id && (content === undefined || content === null || content === '')) {
      throw new Error(`${MEMORY_VALIDATION_FAILED}: delete requires options.id or content`);
    }

    const foundList = this._findFilesWithBlocks(root, scope, id, content);
    const deleted = [];
    for (const { filePath, blocks, indices } of foundList) {
      const kept = blocks.filter((_, i) => !indices.includes(i));
      const newContent = kept.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
      try {
        fs.writeFileSync(filePath, newContent ? newContent + '\n' : '', 'utf8');
      } catch (e) {
        throw new Error(`${MEMORY_FILE_WRITE_FAILED}: ${e.message}`);
      }
      const rel = path.relative(root, filePath) || path.basename(filePath);
      for (let i = 0; i < indices.length; i++) {
        deleted.push({ path: rel, id: id || undefined });
      }
    }
    if (foundList.length === 0) throw new Error(`${MEMORY_DELETE_FAILED}: no matching block to delete`);
    return deleted;
  }
}

/**
 * MemoryManager：统一入口，manage() 主方法
 */
class MemoryManager {
  constructor() {
    this.store = new MemoryStore();
    this.search = new MemorySearch(this.store);
    this.update = new MemoryUpdate();
    this.delete = new MemoryDelete();
  }

  manage(input) {
    const start = Date.now();
    const out = { success: false };

    try {
      const action = input && input.action;
      if (!action || !VALID_ACTIONS.includes(action)) {
        out.error = MEMORY_INVALID_ACTION;
        out.message = `action must be one of: ${VALID_ACTIONS.join(', ')}`;
        out.metadata = { duration: Date.now() - start, action: action || 'unknown', scope: (input && input.options && input.options.scope) || 'all' };
        return out;
      }

      const content = input.content;
      const options = Object.assign(
        { maxResults: 10, minScore: 0.5, scope: 'all' },
        input.options || {}
      );

      if (action !== 'delete') {
        if (content === undefined || content === null) {
          out.error = MEMORY_VALIDATION_FAILED;
          out.message = 'content is required for store, search, update';
          out.metadata = { duration: Date.now() - start, action, scope: options.scope };
          return out;
        }
      }
      if (action === 'update' && !options.id && !options.match) {
        out.error = MEMORY_VALIDATION_FAILED;
        out.message = 'update requires options.id or options.match to locate the block';
        out.metadata = { duration: Date.now() - start, action, scope: options.scope };
        return out;
      }

      let results = [];
      let total = 0;

      switch (action) {
        case 'store': {
          const r = this.store.store(content, options);
          results = [r];
          total = 1;
          break;
        }
        case 'search': {
          results = this.search.search(content, options);
          total = results.length;
          break;
        }
        case 'update': {
          const r = this.update.update(content, options);
          results = [r];
          total = 1;
          break;
        }
        case 'delete': {
          const list = this.delete.delete(content, options);
          results = list;
          total = list.length;
          break;
        }
        default:
          out.error = MEMORY_INVALID_ACTION;
          out.metadata = { duration: Date.now() - start, action, scope: options.scope };
          return out;
      }

      const duration = Date.now() - start;
      out.success = true;
      out.results = results;
      out.metadata = { total, duration, action, scope: options.scope };
      return out;
    } catch (err) {
      const duration = Date.now() - start;
      out.success = false;
      const codeFromMsg = err.message && err.message.startsWith('MEMORY_') ? err.message.split(':')[0].trim() : null;
      out.error = codeFromMsg || (action === 'store' ? MEMORY_STORE_FAILED : action === 'search' ? MEMORY_SEARCH_FAILED : action === 'update' ? MEMORY_UPDATE_FAILED : MEMORY_DELETE_FAILED);
      out.message = err.message || err.toString();
      out.metadata = { total: 0, duration, action: input && input.action, scope: (input && input.options && input.options.scope) || 'all' };
      return out;
    }
  }
}

const manager = new MemoryManager();

module.exports = {
  MemoryManager,
  MemoryStore,
  MemorySearch,
  MemoryUpdate,
  MemoryDelete,
  manager,
  MEMORY_INVALID_ACTION,
  MEMORY_VALIDATION_FAILED,
  MEMORY_STORE_FAILED,
  MEMORY_SEARCH_FAILED,
  MEMORY_UPDATE_FAILED,
  MEMORY_DELETE_FAILED,
  MEMORY_FILE_READ_FAILED,
  MEMORY_FILE_WRITE_FAILED,
};

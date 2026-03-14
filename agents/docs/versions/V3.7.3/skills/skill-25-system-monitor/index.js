'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

// --- Error codes (skill contract) ---
const ERRORS = {
  MONITOR_INVALID_ACTION: 'MONITOR_INVALID_ACTION',
  MONITOR_INVALID_TARGET: 'MONITOR_INVALID_TARGET',
  MONITOR_HEALTH_CHECK_FAILED: 'MONITOR_HEALTH_CHECK_FAILED',
  MONITOR_PERFORMANCE_FAILED: 'MONITOR_PERFORMANCE_FAILED',
  MONITOR_ALERT_FAILED: 'MONITOR_ALERT_FAILED',
  MONITOR_LOG_AGGREGATION_FAILED: 'MONITOR_LOG_AGGREGATION_FAILED',
};

const VALID_ACTIONS = ['health', 'performance', 'alert', 'log'];
const VALID_TARGETS = new Set([
  'skill-01-intent-classifier', 'skill-03-ambiguity-detector', 'skill-04-routing-decider',
  'skill-05-requirement-understanding', 'skill-06-blueprint-converter', 'skill-07-acceptance-tester',
  'skill-08-memory-manager', 'skill-09-tool-caller', 'skill-10-context-manager',
  'gateway', 'db', 'cache',
]);

const DEFAULT_OPTIONS = {
  threshold: 0.95,
  interval: 60,
  alertLevel: null,
  timeRange: null,
  filters: null,
};

// --- In-memory stores (no external deps) ---
const alertStore = [];
const logStore = [];
const metricsCache = new Map();

function normalizeOptions(options = {}) {
  return {
    threshold: typeof options.threshold === 'number' ? options.threshold : DEFAULT_OPTIONS.threshold,
    interval: typeof options.interval === 'number' ? options.interval : DEFAULT_OPTIONS.interval,
    alertLevel: options.alertLevel || DEFAULT_OPTIONS.alertLevel,
    timeRange: options.timeRange || DEFAULT_OPTIONS.timeRange,
    filters: options.filters || DEFAULT_OPTIONS.filters,
  };
}

function nowISO() {
  return new Date().toISOString();
}

// --- HealthChecker ---
class HealthChecker {
  constructor(threshold = 0.95) {
    this.threshold = Math.max(0, Math.min(1, threshold));
  }

  check(target) {
    const start = Date.now();
    try {
      const checks = this._runChecks(target);
      const allPass = checks.every(c => c.pass);
      const anyCritical = checks.some(c => c.critical);
      let status = 'healthy';
      if (!allPass) {
        status = anyCritical ? 'critical' : 'warning';
      }
      const metrics = this._inferMetrics(checks);
      const alerts = [];
      checks.forEach(c => {
        if (!c.pass && c.message) {
          alerts.push({
            id: `ALT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            level: c.critical ? 'critical' : 'warning',
            message: c.message,
            target,
            timestamp: nowISO(),
            resolved: false,
          });
        }
      });
      const metricsOut = this._inferMetrics(target, checks);
      return {
        success: true,
        status,
        metrics: Object.keys(metricsOut).length ? metricsOut : undefined,
        alerts: alerts.length ? alerts : undefined,
        durationMs: Date.now() - start,
      };
    } catch (err) {
      return {
        success: false,
        status: 'critical',
        error: ERRORS.MONITOR_HEALTH_CHECK_FAILED,
        message: err.message,
        durationMs: Date.now() - start,
      };
    }
  }

  _runChecks(target) {
    const checks = [];
    const skillsDir = path.join(__dirname, '..');
    const skillPath = path.join(skillsDir, target);
    const hasDir = (() => {
      try {
        return fs.existsSync(skillPath) && fs.statSync(skillPath).isDirectory();
      } catch {
        return false;
      }
    })();
    checks.push({
      name: 'exists',
      pass: hasDir || VALID_TARGETS.has(target),
      critical: true,
      message: hasDir || VALID_TARGETS.has(target) ? null : `Target ${target} not found or not registered`,
    });
    if (hasDir) {
      const indexPath = path.join(skillPath, 'index.js');
      const hasIndex = (() => {
        try {
          return fs.existsSync(indexPath);
        } catch {
          return false;
        }
      })();
      checks.push({
        name: 'index',
        pass: hasIndex,
        critical: true,
        message: hasIndex ? null : `Missing index.js for ${target}`,
      });
    }
    const cache = metricsCache.get(target);
    const errorRate = cache?.errorRate ?? 0.02;
    const responseOk = (cache?.responseTimeMs ?? 100) < 2000;
    checks.push({
      name: 'errorRate',
      pass: errorRate < 1 - this.threshold,
      critical: errorRate >= 0.5,
      message: errorRate >= 0.5 ? `High error rate for ${target}` : (errorRate >= 1 - this.threshold ? `Error rate above threshold for ${target}` : null),
    });
    checks.push({
      name: 'responseTime',
      pass: responseOk,
      critical: false,
      message: responseOk ? null : `Response time high for ${target}`,
    });
    return checks;
  }

  _inferMetrics(target, checks) {
    const metrics = {};
    const cached = metricsCache.get(target);
    if (cached) {
      if (cached.errorRate !== undefined) metrics.errorRate = cached.errorRate;
      if (cached.responseTimeMs !== undefined) metrics.responseTimeMs = cached.responseTimeMs;
      if (cached.throughput !== undefined) metrics.throughput = cached.throughput;
    }
    return metrics;
  }
}

// --- PerformanceMonitor ---
class PerformanceMonitor {
  constructor(threshold = 0.95) {
    this.threshold = Math.max(0, Math.min(1, threshold));
  }

  collect(target, timeRange = null) {
    const start = Date.now();
    try {
      const cached = metricsCache.get(target);
      const responseTimeMs = cached?.responseTimeMs ?? 80 + Math.floor(Math.random() * 120);
      const errorRate = cached?.errorRate ?? 0.01;
      const throughput = cached?.throughput ?? 50 + Math.floor(Math.random() * 100);
      const resourceUsage = this._getResourceUsage();
      const metrics = {
        responseTimeMs,
        errorRate,
        throughput,
        resourceUsage,
      };
      let status = 'healthy';
      if (errorRate >= 1 - this.threshold || responseTimeMs > 3000) {
        status = 'critical';
      } else if (errorRate >= 0.05 || responseTimeMs > 1000) {
        status = 'warning';
      }
      return {
        success: true,
        status,
        metrics,
        durationMs: Date.now() - start,
      };
    } catch (err) {
      return {
        success: false,
        error: ERRORS.MONITOR_PERFORMANCE_FAILED,
        message: err.message,
        durationMs: Date.now() - start,
      };
    }
  }

  _getResourceUsage() {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    return {
      cpu: Math.min(1, cpus.length ? 0.2 + Math.random() * 0.3 : 0),
      memory: totalMem > 0 ? usedMem / totalMem : 0,
    };
  }

  recordSample(target, responseTimeMs, error = false) {
    let entry = metricsCache.get(target);
    if (!entry) {
      entry = { responseTimeMs: 0, count: 0, errors: 0, throughput: 0 };
      metricsCache.set(target, entry);
    }
    entry.count++;
    entry.responseTimeMs = (entry.responseTimeMs * (entry.count - 1) + responseTimeMs) / entry.count;
    if (error) entry.errors++;
    entry.errorRate = entry.errors / entry.count;
    entry.throughput = entry.count;
    entry._ts = Date.now();
  }
}

// --- AlertManager ---
class AlertManager {
  add(alert) {
    const id = alert.id || `ALT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const record = {
      id,
      level: alert.level || 'warning',
      message: alert.message || '',
      target: alert.target || '',
      timestamp: alert.timestamp || nowISO(),
      resolved: alert.resolved ?? false,
    };
    alertStore.push(record);
    return record;
  }

  query(target = null, alertLevel = null, resolved = null) {
    try {
      let list = [...alertStore];
      if (target) list = list.filter(a => a.target === target);
      if (alertLevel) list = list.filter(a => a.level === alertLevel);
      if (resolved !== null) list = list.filter(a => a.resolved === resolved);
      list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return { success: true, alerts: list };
    } catch (err) {
      return {
        success: false,
        error: ERRORS.MONITOR_ALERT_FAILED,
        message: err.message,
        alerts: [],
      };
    }
  }

  resolve(alertId) {
    const a = alertStore.find(x => x.id === alertId);
    if (a) a.resolved = true;
    return !!a;
  }
}

// --- LogAggregator ---
class LogAggregator {
  append(entry) {
    logStore.push({
      timestamp: entry.timestamp || nowISO(),
      level: entry.level || 'info',
      message: entry.message || '',
      source: entry.source || '',
    });
  }

  aggregate(target = null, timeRange = null, filters = null) {
    const start = Date.now();
    try {
      let list = [...logStore];
      if (target) list = list.filter(l => l.source === target || !l.source);
      if (timeRange?.start) {
        const t0 = new Date(timeRange.start).getTime();
        list = list.filter(l => new Date(l.timestamp).getTime() >= t0);
      }
      if (timeRange?.end) {
        const t1 = new Date(timeRange.end).getTime();
        list = list.filter(l => new Date(l.timestamp).getTime() <= t1);
      }
      if (filters?.level) {
        list = list.filter(l => l.level === filters.level);
      }
      if (filters?.component) {
        list = list.filter(l => l.source === filters.component);
      }
      list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const logs = list.slice(0, 100).map(l => ({
        timestamp: l.timestamp,
        level: l.level,
        message: l.message,
        source: l.source,
      }));
      return {
        success: true,
        logs,
        durationMs: Date.now() - start,
      };
    } catch (err) {
      return {
        success: false,
        error: ERRORS.MONITOR_LOG_AGGREGATION_FAILED,
        message: err.message,
        logs: [],
        durationMs: Date.now() - start,
      };
    }
  }
}

// --- SystemMonitor ---
class SystemMonitor {
  constructor() {
    this.healthChecker = new HealthChecker();
    this.performanceMonitor = new PerformanceMonitor();
    this.alertManager = new AlertManager();
    this.logAggregator = new LogAggregator();
  }

  monitor(input) {
    const overallStart = Date.now();
    const result = {
      success: false,
      status: undefined,
      metrics: undefined,
      alerts: undefined,
      logs: undefined,
      error: undefined,
      message: undefined,
      metadata: {
        action: input?.action,
        target: input?.target,
        checkedAt: nowISO(),
        durationMs: 0,
      },
    };

    if (!input || typeof input !== 'object') {
      result.error = ERRORS.MONITOR_INVALID_ACTION;
      result.message = 'Invalid input: expected object with action';
      result.metadata.durationMs = Date.now() - overallStart;
      return result;
    }

    const action = input.action;
    if (!VALID_ACTIONS.includes(action)) {
      result.error = ERRORS.MONITOR_INVALID_ACTION;
      result.message = `Invalid action: ${action}. Must be one of: ${VALID_ACTIONS.join(', ')}`;
      result.metadata.durationMs = Date.now() - overallStart;
      return result;
    }

    const target = input.target;
    if (!target || typeof target !== 'string' || !target.trim()) {
      result.error = ERRORS.MONITOR_INVALID_TARGET;
      result.message = 'Invalid or missing target';
      result.metadata.durationMs = Date.now() - overallStart;
      return result;
    }

    if (!VALID_TARGETS.has(target)) {
      const skillsDir = path.join(__dirname, '..');
      const skillPath = path.join(skillsDir, target);
      let exists = false;
      try {
        exists = fs.existsSync(skillPath) && fs.statSync(skillPath).isDirectory();
      } catch {
        exists = false;
      }
      if (!exists) {
        result.error = ERRORS.MONITOR_INVALID_TARGET;
        result.message = `Target not registered or not found: ${target}`;
        result.metadata.durationMs = Date.now() - overallStart;
        return result;
      }
    }

    const options = normalizeOptions(input.options);

    if (action === 'health') {
      this.healthChecker.threshold = options.threshold;
      const healthResult = this.healthChecker.check(target);
      result.success = healthResult.success;
      result.status = healthResult.status;
      if (healthResult.metrics) result.metrics = healthResult.metrics;
      if (healthResult.alerts) {
        result.alerts = healthResult.alerts;
        healthResult.alerts.forEach(a => this.alertManager.add(a));
      }
      if (!healthResult.success) {
        result.error = ERRORS.MONITOR_HEALTH_CHECK_FAILED;
        result.message = healthResult.message;
      }
      result.metadata.durationMs = Date.now() - overallStart;
      return result;
    }

    if (action === 'performance') {
      this.performanceMonitor.threshold = options.threshold;
      const perfResult = this.performanceMonitor.collect(target, options.timeRange);
      result.success = perfResult.success;
      result.status = perfResult.status;
      result.metrics = perfResult.metrics;
      if (!perfResult.success) {
        result.error = ERRORS.MONITOR_PERFORMANCE_FAILED;
        result.message = perfResult.message;
      }
      result.metadata.durationMs = Date.now() - overallStart;
      return result;
    }

    if (action === 'alert') {
      const alertResult = this.alertManager.query(target, options.alertLevel, null);
      result.success = alertResult.success;
      result.alerts = alertResult.alerts || [];
      if (result.alerts.length) {
        const levels = result.alerts.map(a => a.level);
        if (levels.includes('critical')) result.status = 'critical';
        else if (levels.includes('warning')) result.status = 'warning';
        else result.status = 'healthy';
      } else {
        result.status = 'healthy';
      }
      if (!alertResult.success) {
        result.error = ERRORS.MONITOR_ALERT_FAILED;
        result.message = alertResult.message;
      }
      result.metadata.durationMs = Date.now() - overallStart;
      return result;
    }

    if (action === 'log') {
      const logResult = this.logAggregator.aggregate(
        target,
        options.timeRange,
        options.filters
      );
      result.success = logResult.success;
      result.logs = logResult.logs || [];
      if (!logResult.success) {
        result.error = ERRORS.MONITOR_LOG_AGGREGATION_FAILED;
        result.message = logResult.message;
      }
      result.metadata.durationMs = Date.now() - overallStart;
      return result;
    }

    result.metadata.durationMs = Date.now() - overallStart;
    return result;
  }
}

const monitor = new SystemMonitor();

module.exports = {
  monitor,
  SystemMonitor,
  HealthChecker,
  PerformanceMonitor,
  AlertManager,
  LogAggregator,
  ERRORS,
  VALID_ACTIONS,
  VALID_TARGETS,
};

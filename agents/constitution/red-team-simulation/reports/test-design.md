# 测试设计方案：用户积分系统

> 用于红蓝推演智能体验收测试

---

## 📋 项目概述

**项目名称**: 用户积分系统  
**复杂度**: B 级（普通）  
**核心功能**: 用户签到、积分累积、积分兑换

---

## 🏗️ 技术设计

### 架构设计

```
前端 (React) → API 网关 → 积分服务 → MySQL 数据库
                              ↓
                         Redis 缓存
```

### 核心流程

1. **用户签到**
   - 用户每日首次访问 → 自动签到
   - 获得 10 积分
   - 连续签到 7 天额外奖励 50 积分

2. **积分累积**
   - 签到：+10 积分/天
   - 连续签到奖励：+50 积分/7 天
   - 邀请好友：+100 积分/人

3. **积分兑换**
   - 100 积分 = 1 元代金券
   - 最低兑换：500 积分
   - 最高兑换：10000 积分/天

### 数据库设计

```sql
-- 用户积分表
CREATE TABLE user_points (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    points INT DEFAULT 0,
    last_signin DATE,
    consecutive_days INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
);

-- 积分流水表
CREATE TABLE point_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    change INT NOT NULL,
    balance_after INT NOT NULL,
    source VARCHAR(50) NOT NULL, -- signin, referral, exchange
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);
```

### 缓存策略

- 用户积分余额：Redis Hash，key=`user:points:{userId}`
- 缓存过期：24 小时
- 缓存更新：积分变动时同步更新

---

## ⚠️ 已知限制

1. 不支持积分转账
2. 积分永不过期
3. 兑换后不支持退款

---

**文档版本**: 1.0  
**创建日期**: 2026-03-28

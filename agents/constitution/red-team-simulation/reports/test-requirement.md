# 测试需求：在线商城优惠券系统

> 用于红蓝推演智能体完整测试

**需求 ID**: TEST-001  
**复杂度**: B 级（普通）  
**创建日期**: 2026-03-28  

---

## 📋 需求概述

### 核心功能

1. **优惠券发放**
   - 新用户注册赠送 100 元券包
   - 每日签到领取随机券
   - 活动页面限时抢购

2. **优惠券使用**
   - 下单时选择可用优惠券
   - 自动计算最优优惠组合
   - 支持满减、折扣、包邮券

3. **优惠券管理**
   - 用户查看可用/已用/过期券
   - 后台配置券模板
   - 数据统计分析

---

## 🏗️ 技术设计

### 架构设计

```
前端 (小程序/H5) 
    │
    ▼
API 网关 (Nginx + Kong)
    │
    ▼
优惠券服务 (Node.js + Express)
    │
    ├── Redis 缓存 (优惠券库存/用户可用券)
    └── MySQL 数据库 (券模板/用户券记录)
```

### 数据库设计

```sql
-- 优惠券模板表
CREATE TABLE coupon_template (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type ENUM('fixed', 'percent', 'shipping') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount DECIMAL(10,2),
    total_count INT NOT NULL,
    issued_count INT DEFAULT 0,
    valid_from DATETIME NOT NULL,
    valid_to DATETIME NOT NULL,
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户优惠券表
CREATE TABLE user_coupon (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    template_id BIGINT NOT NULL,
    status ENUM('unused', 'used', 'expired') DEFAULT 'unused',
    order_id BIGINT,
    valid_from DATETIME NOT NULL,
    valid_to DATETIME NOT NULL,
    used_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- 优惠券领取记录表
CREATE TABLE coupon_issue_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    template_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    user_coupon_id BIGINT NOT NULL,
    source VARCHAR(50), -- register, signin, activity
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_template (template_id),
    INDEX idx_user (user_id)
);
```

### 核心流程

**1. 领取优惠券**
```
用户请求 → 验证资格 → 检查库存 → 扣减库存 → 
创建用户券 → 更新缓存 → 返回结果
```

**2. 使用优惠券**
```
下单请求 → 查询可用券 → 计算最优组合 → 
锁定优惠券 → 创建订单 → 扣减库存 → 更新券状态
```

### 缓存策略

- 优惠券模板：Redis Hash，key=`coupon:template:{id}`
- 用户可用券：Redis List，key=`user:coupons:{userId}`
- 库存计数：Redis String，key=`coupon:stock:{templateId}`
- 缓存过期：模板 24 小时，用户券 1 小时

### 并发控制

- 库存扣减：Redis DECR + Lua 脚本保证原子性
- 超卖防护：数据库乐观锁 (version 字段)
- 限流：单用户每秒最多领 3 张券

---

## ⚠️ 已知限制

1. 不支持优惠券转赠
2. 过期券不提醒
3. 退款后优惠券不退回
4. 最优组合计算仅支持最多 3 张券

---

**文档版本**: 1.0  
**创建日期**: 2026-03-28  
**用途**: 红蓝推演智能体测试输入

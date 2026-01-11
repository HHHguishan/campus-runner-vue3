# 校园配送服务平台 API 接口文档

## 项目信息

- **项目名称**: 校园配送服务平台 (Campus Runner)
- **当前版本**: v2.2.0
- **项目进度**: 99% 完成
- **技术栈**: Spring Boot 3.5.8 + MyBatis-Plus + MySQL + Redis + JWT + 支付宝SDK
- **文档生成时间**: 2025-01-10

---

## 目录

- [基础信息](#基础信息)
- [认证中心](#认证中心)
- [用户管理](#用户管理)
- [支付宝账号管理](#支付宝账号管理) (NEW!)
- [订单管理](#订单管理)
- [骑手认证管理](#骑手认证管理)
- [管理员功能](#管理员功能)
- [地址管理](#地址管理)
- [支付中心](#支付中心)
- [钱包管理](#钱包管理)
- [提现管理](#提现管理)
- [评价系统](#评价系统)
- [短信服务](#短信服务)
- [骑手数据看板](#骑手数据看板)
- [系统配置管理](#系统配置管理)
- [公告管理](#公告管理)
- [通用接口](#通用接口)
- [数据模型](#数据模型)

---

## 基础信息

### 服务地址

- **本地开发环境**: `http://localhost:9090`
- **Swagger文档**: `http://localhost:9090/swagger-ui/index.html`

### 认证说明

系统使用JWT Token进行认证，除公开接口外，所有接口需要在请求头中携带Token：

```
Authorization: Bearer {token}
```

Token有效期：7天

### 统一响应格式

所有接口返回统一的JSON格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

**状态码说明**:
- `200`: 成功
- `401`: 未授权（Token无效或过期）
- `403`: 禁止访问（权限不足）
- `500`: 服务器错误

### 分页响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [],
    "total": 100,
    "current": 1,
    "size": 10,
    "pages": 10
  }
}
```

---

## 认证中心

### 1. 微信小程序一键登录

**接口路径**: `POST /api/auth/login/wechat`

**接口描述**: 微信小程序用户一键登录，支持登录即注册

**是否需要认证**: 否

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| code | String | 是 | 微信临时授权码(wx.login获取) | 071Kq0000n4S131DXq0000p7t2l1Kq01J |
| avatar | String | 否 | 用户头像(可选，用于同步资料) | https://thirdwx.qlogo.cn/xxx |
| nickname | String | 否 | 用户昵称(可选，用于同步资料) | 微信用户 |
| deviceInfo | String | 否 | 设备信息 | iPhone 15 Pro |
| location | String | 否 | 地理位置 | 广东省广州市天河区 |

**响应示例**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "expireTime": 1706487245000,
    "userInfo": {
      "userId": 1,
      "nickname": "微信用户",
      "avatar": "https://thirdwx.qlogo.cn/xxx",
      "phone": "13800138000"
    },
    "isFirstLogin": false,
    "needCompleteInfo": true,
    "message": "登录成功"
  }
}
```

---

### 2. 手机号验证码登录

**接口路径**: `POST /api/auth/login/phone`

**接口描述**: 使用手机号和验证码登录系统

**是否需要认证**: 否

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| phone | String | 是 | 手机号 | 13800138000 |
| code | String | 是 | 短信验证码 | 123456 |

**响应示例**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "expireTime": 1706487245000,
    "userInfo": {
      "userId": 1,
      "nickname": "微信用户",
      "avatar": "https://thirdwx.qlogo.cn/xxx",
      "phone": "13800138000"
    },
    "isFirstLogin": false,
    "needCompleteInfo": false,
    "message": "登录成功"
  }
}
```

---

### 3. 管理员账号密码登录

**接口路径**: `POST /api/auth/login/admin`

**接口描述**: 管理员使用账号密码登录后台管理系统

**是否需要认证**: 否

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| username | String | 是 | 管理员账号 | admin |
| password | String | 是 | 密码 | 123456 |

**响应示例**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "expireTime": 1706487245000,
    "userInfo": {
      "userId": 1,
      "nickname": "管理员",
      "role": 0
    },
    "isFirstLogin": false,
    "needCompleteInfo": false,
    "message": "管理员登录成功"
  }
}
```

---

## 用户管理

### 1. 获取个人信息

**接口路径**: `GET /api/user/info`

**接口描述**: 获取当前登录用户的个人信息

**是否需要认证**: 是

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "userId": 1,
    "nickname": "张三",
    "avatar": "https://example.com/avatar.jpg",
    "phone": "13800138000",
    "balance": 100.50,
    "role": 1,
    "runnerStatus": 1
  }
}
```

---

### 2. 修改个人资料

**接口路径**: `PUT /api/user/update`

**接口描述**: 修改当前用户的个人信息

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| nickname | String | 否 | 用户昵称 | 张三 |
| avatar | String | 否 | 头像URL | https://example.com/avatar.jpg |

**响应示例**:

```json
{
  "code": 200,
  "message": "修改成功",
  "data": null
}
```

---

### 3. 绑定手机号

**接口路径**: `POST /api/user/bind-phone`

**接口描述**: 绑定或修改用户手机号

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| phone | String | 是 | 手机号 | 13800138000 |
| code | String | 是 | 短信验证码 | 123456 |

**响应示例**:

```json
{
  "code": 200,
  "message": "绑定成功",
  "data": null
}
```

---

### 4. 身份切换

**接口路径**: `POST /api/user/switch-mode`

**接口描述**: 切换用户/骑手身份模式

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| targetMode | Integer | 是 | 目标模式(1-用户模式,2-骑手模式) | 2 |

**响应示例**:

```json
{
  "code": 200,
  "message": "切换成功",
  "data": {
    "currentMode": 2,
    "modeName": "骑手模式",
    "runnerInfo": {
      "runnerId": 1,
      "studentId": "2021001",
      "realName": "张三",
      "status": 1
    }
  }
}
```

---

### 5. 获取当前身份信息

**接口路径**: `GET /api/user/mode-info`

**接口描述**: 获取当前用户的身份模式和相关信息

**是否需要认证**: 是

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "currentMode": 2,
    "modeName": "骑手模式",
    "runnerInfo": {
      "runnerId": 1,
      "studentId": "2021001",
      "realName": "张三",
      "status": 1
    }
  }
}
```

---

## 支付宝账号管理

### 1. 绑定支付宝账号

**接口路径**: `POST /api/user/bind-alipay`

**接口描述**: 用户绑定支付宝账号（提现前必须先绑定）

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| alipayAccount | String | 是 | 支付宝账号（支持用户ID/邮箱/手机号） | 2088722092428257 |
| realName | String | 是 | 真实姓名（必须与支付宝账号一致） | 沙箱买家 |

**账号格式说明**:
- **用户ID**: 16位纯数字，例如：`2088722092428257`（推荐）
- **邮箱**: 标准邮箱格式，例如：`test@sandbox.com`
- **手机号**: 11位数字，1开头，例如：`13800138000`

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

**业务规则**:
- 支持智能识别账号类型
- 用户ID格式会自动提取并存储（用于快速转账）
- 重复绑定会覆盖之前的账号
- 姓名必须与支付宝账号真实姓名一致

---

### 2. 获取支付宝账号信息

**接口路径**: `GET /api/user/alipay-account`

**接口描述**: 查询当前用户绑定的支付宝账号信息

**是否需要认证**: 是

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "alipayAccount": "2088722092428257",
    "alipayUserId": "2088722092428257",
    "realName": "沙*家",
    "isBound": true,
    "bindTime": "2025-01-10T12:30:00"
  }
}
```

**字段说明**:
- `alipayAccount`: 支付宝账号（完整显示）
- `alipayUserId`: 支付宝用户ID（如果是用户ID格式才有值）
- `realName`: 真实姓名（已脱敏，只显示第一个字）
- `isBound`: 是否已绑定
- `bindTime`: 绑定时间

**未绑定示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "alipayAccount": null,
    "alipayUserId": null,
    "realName": null,
    "isBound": false,
    "bindTime": null
  }
}
```

---

### 3. 修改绑定账号

**接口路径**: `POST /api/user/bind-alipay`

**接口描述**: 重新绑定支付宝账号（覆盖之前的绑定）

**是否需要认证**: 是

**请求参数**: 同绑定接口

**响应示例**: 同绑定接口

**业务规则**:
- 支持修改已绑定的账号
- 新账号会覆盖旧账号
- 提现时会使用最新的账号

---

## 订单管理

### 1. 创建订单

**接口路径**: `POST /api/order/create`

**接口描述**: 用户创建新的配送订单

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| addressId | Long | 是 | 取件地址ID | 1 |
| deliveryAddress | String | 是 | 送达地址 | 广州市天河区xx大学xx宿舍 |
| deliveryPhone | String | 是 | 送达联系电话 | 13800138000 |
| deliveryName | String | 是 | 送达联系人 | 张三 |
| serviceType | Integer | 是 | 服务类型(1-帮我买,2-帮我送,3-帮我取) | 1 |
| goodsInfo | String | 是 | 物品信息 | 帮我买一杯奶茶 |
| remark | String | 否 | 备注 | 少冰少糖 |
| weight | BigDecimal | 否 | 物品重量(kg) | 1.5 |

**响应示例**:

```json
{
  "code": 200,
  "message": "订单创建成功",
  "data": {
    "orderId": 1001,
    "orderNo": "ORD20250108120001",
    "status": 0,
    "totalAmount": 15.50,
    "createTime": "2025-01-08 12:00:00"
  }
}
```

---

### 2. 分页查询订单列表

**接口路径**: `GET /api/order/list`

**接口描述**: 分页查询订单列表，支持多种筛选条件

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| page | Integer | 否 | 页码，默认1 | 1 |
| size | Integer | 否 | 每页大小，默认10 | 10 |
| status | Integer | 否 | 订单状态筛选 | 1 |
| serviceType | Integer | 否 | 服务类型筛选 | 1 |

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "orderId": 1001,
        "orderNo": "ORD20250108120001",
        "status": 1,
        "serviceType": 1,
        "totalAmount": 15.50,
        "createTime": "2025-01-08 12:00:00"
      }
    ],
    "total": 100,
    "current": 1,
    "size": 10,
    "pages": 10
  }
}
```

---

### 3. 获取订单详情

**接口路径**: `GET /api/order/{orderId}`

**接口描述**: 获取指定订单的详细信息

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| orderId | Long | 是 | 订单ID | 1001 |

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "orderId": 1001,
    "orderNo": "ORD20250108120001",
    "status": 1,
    "serviceType": 1,
    "totalAmount": 15.50,
    "addressInfo": {
      "pickupAddress": "广州市天河区xx奶茶店",
      "deliveryAddress": "广州市天河区xx大学xx宿舍"
    },
    "goodsInfo": "帮我买一杯奶茶",
    "createTime": "2025-01-08 12:00:00"
  }
}
```

---

### 4. 取消订单

**接口路径**: `PUT /api/order/cancel`

**接口描述**: 取消指定的订单

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| orderId | Long | 是 | 订单ID | 1001 |
| cancelReason | String | 否 | 取消原因 | 不需要了 |

**响应示例**:

```json
{
  "code": 200,
  "message": "订单已取消",
  "data": null
}
```

---

### 5. 骑手接单

**接口路径**: `POST /api/order/grab`

**接口描述**: 骑手接取订单

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| orderId | Long | 是 | 订单ID | 1001 |

**响应示例**:

```json
{
  "code": 200,
  "message": "接单成功",
  "data": null
}
```

---

### 6. 完成订单

**接口路径**: `PUT /api/order/finish`

**接口描述**: 骑手完成订单配送

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| orderId | Long | 是 | 订单ID | 1001 |
| finishRemark | String | 否 | 完成备注 | 已送达 |

**响应示例**:

```json
{
  "code": 200,
  "message": "订单已完成",
  "data": null
}
```

---

### 7. 获取订单统计

**接口路径**: `GET /api/order/statistics`

**接口描述**: 获取订单统计数据

**是否需要认证**: 是

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "totalOrders": 1000,
    "pendingOrders": 50,
    "completedOrders": 900,
    "cancelledOrders": 50,
    "todayOrders": 20
  }
}
```

---

## 骑手认证管理

### 1. 学生证认证申请

**接口路径**: `POST /api/runner/apply/student-card`

**接口描述**: 用户提交学生证信息申请成为骑手

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| studentId | String | 是 | 学号 | 2021001 |
| realName | String | 是 | 真实姓名 | 张三 |
| school | String | 是 | 学校名称 | xx大学 |
| college | String | 是 | 学院名称 | 计算机学院 |
| studentCardFront | String | 是 | 学生证正面照片URL | https://example.com/image1.jpg |
| studentCardBack | String | 是 | 学生证背面照片URL | https://example.com/image2.jpg |

**响应示例**:

```json
{
  "code": 200,
  "message": "申请已提交，请等待审核",
  "data": null
}
```

---

### 2. 查询申请状态

**接口路径**: `GET /api/runner/status`

**接口描述**: 查询当前用户的骑手认证申请状态

**是否需要认证**: 是

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "hasApplied": true,
    "status": 0,
    "statusName": "待审核",
    "applyTime": "2025-01-08 10:00:00",
    "auditTime": null,
    "rejectReason": null
  }
}
```

**状态说明**:
- `0`: 待审核
- `1`: 审核通过
- `2`: 审核驳回

---

### 3. 获取认证信息

**接口路径**: `GET /api/runner/info`

**接口描述**: 获取当前用户的骑手认证信息

**是否需要认证**: 是

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "runnerId": 1,
    "userId": 1,
    "studentId": "2021001",
    "realName": "张三",
    "school": "xx大学",
    "college": "计算机学院",
    "studentCardFront": "https://example.com/image1.jpg",
    "studentCardBack": "https://example.com/image2.jpg",
    "status": 1,
    "totalEvaluations": 50,
    "averageRating": 4.8,
    "positiveRate": 96.0,
    "creditScore": 100
  }
}
```

---

## 管理员功能

### 1. 审核通过

**接口路径**: `POST /api/admin/runner/approve`

**接口描述**: 管理员审核通过骑手认证申请

**是否需要认证**: 是（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| runnerId | Long | 是 | 骑手ID | 1 |
| auditRemark | String | 否 | 审核备注 | 认证信息核实无误 |

**响应示例**:

```json
{
  "code": 200,
  "message": "审核通过",
  "data": null
}
```

---

### 2. 审核驳回

**接口路径**: `POST /api/admin/runner/reject`

**接口描述**: 管理员审核驳回骑手认证申请

**是否需要认证**: 是（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| runnerId | Long | 是 | 骑手ID | 1 |
| rejectReason | String | 是 | 驳回原因 | 学生证信息不清晰 |

**响应示例**:

```json
{
  "code": 200,
  "message": "已驳回申请",
  "data": null
}
```

---

### 3. 待审核申请列表

**接口路径**: `GET /api/admin/runner/pending`

**接口描述**: 分页查询待审核的骑手认证申请

**是否需要认证**: 是（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| page | Integer | 否 | 页码，默认1 | 1 |
| size | Integer | 否 | 每页大小，默认10 | 10 |

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "runnerId": 1,
        "userId": 1,
        "studentId": "2021001",
        "realName": "张三",
        "school": "xx大学",
        "college": "计算机学院",
        "status": 0,
        "applyTime": "2025-01-08 10:00:00"
      }
    ],
    "total": 50,
    "current": 1,
    "size": 10,
    "pages": 5
  }
}
```

---

### 4. 申请详情

**接口路径**: `GET /api/admin/runner/{id}`

**接口描述**: 获取指定骑手认证申请的详细信息

**是否需要认证**: 是（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| id | Long | 是 | 骑手ID | 1 |

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "runnerId": 1,
    "userId": 1,
    "studentId": "2021001",
    "realName": "张三",
    "school": "xx大学",
    "college": "计算机学院",
    "studentCardFront": "https://example.com/image1.jpg",
    "studentCardBack": "https://example.com/image2.jpg",
    "status": 0,
    "applyTime": "2025-01-08 10:00:00"
  }
}
```

---

## 地址管理

### 1. 查询我的地址列表

**接口路径**: `GET /api/address/list`

**接口描述**: 查询当前用户的所有地址，默认地址置顶

**是否需要认证**: 是

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "contactName": "张三",
      "contactPhone": "13800138000",
      "province": "广东省",
      "city": "广州市",
      "district": "天河区",
      "detailAddress": "xx大学xx宿舍",
      "isDefault": 1,
      "latitude": 23.123456,
      "longitude": 113.123456
    }
  ]
}
```

---

### 2. 新增/修改地址

**接口路径**: `POST /api/address/save`

**接口描述**: 新增或修改地址信息，支持设置默认地址

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| id | Long | 否 | 地址ID（修改时必填） | 1 |
| contactName | String | 是 | 联系人姓名 | 张三 |
| contactPhone | String | 是 | 联系电话 | 13800138000 |
| province | String | 是 | 省份 | 广东省 |
| city | String | 是 | 城市 | 广州市 |
| district | String | 是 | 区县 | 天河区 |
| detailAddress | String | 是 | 详细地址 | xx大学xx宿舍 |
| isDefault | Integer | 否 | 是否默认地址(0-否,1-是) | 1 |
| latitude | BigDecimal | 否 | 纬度 | 23.123456 |
| longitude | BigDecimal | 否 | 经度 | 113.123456 |

**响应示例**:

```json
{
  "code": 200,
  "message": "保存成功",
  "data": null
}
```

---

### 3. 删除地址

**接口路径**: `DELETE /api/address/{id}`

**接口描述**: 删除指定的地址

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| id | Long | 是 | 地址ID | 1 |

**响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

### 4. 获取默认地址

**接口路径**: `GET /api/address/default`

**接口描述**: 获取用户的默认地址（下单时使用）

**是否需要认证**: 是

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "userId": 1,
    "contactName": "张三",
    "contactPhone": "13800138000",
    "province": "广东省",
    "city": "广州市",
    "district": "天河区",
    "detailAddress": "xx大学xx宿舍",
    "isDefault": 1,
    "latitude": 23.123456,
    "longitude": 113.123456
  }
}
```

---

### 5. 根据ID获取地址详情

**接口路径**: `GET /api/address/{id}`

**接口描述**: 获取指定地址的详细信息（编辑回显用）

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| id | Long | 是 | 地址ID | 1 |

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "userId": 1,
    "contactName": "张三",
    "contactPhone": "13800138000",
    "province": "广东省",
    "city": "广州市",
    "district": "天河区",
    "detailAddress": "xx大学xx宿舍",
    "isDefault": 1,
    "latitude": 23.123456,
    "longitude": 113.123456
  }
}
```

---

## 支付中心

### 1. 订单支付

**接口路径**: `POST /api/pay/doPay`

**接口描述**: 对订单进行支付

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| orderId | Long | 是 | 订单ID | 1001 |
| payType | Integer | 是 | 支付方式(1-余额支付) | 1 |
| payPassword | String | 否 | 支付密码 | 123456 |

**响应示例**:

```json
{
  "code": 200,
  "message": "支付成功",
  "data": null
}
```

---

### 2. 模拟充值（测试用）

**接口路径**: `POST /api/pay/mock/recharge`

**接口描述**: 【测试用】模拟充值功能

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| amount | BigDecimal | 是 | 充值金额 | 100.00 |

**响应示例**:

```json
{
  "code": 200,
  "message": "充值成功",
  "data": null
}
```

---

### 3. 创建支付宝充值订单（网页版）

**接口路径**: `POST /api/recharge/create`

**接口描述**: 用户创建支付宝充值订单，充值到钱包余额

**是否需要认证**: 是（用户模式）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| amount | BigDecimal | 是 | 充值金额（最小0.01元） | 0.01 |
| returnUrl | String | 否 | 支付成功后跳转URL | http://localhost:9090/success |

**响应示例**:

```json
{
  "code": 200,
  "message": "充值订单创建成功",
  "data": {
    "orderId": "RCH20250110120001",
    "amount": 0.01,
    "payFormHtml": "<form id=\"alipaysubmit\"...>"
  }
}
```

**业务规则**:
- 最小充值金额：0.01元
- 最大充值金额：50000元
- 支付宝沙箱环境测试

---

### 4. 创建支付宝充值订单（小程序版）

**接口路径**: `POST /api/recharge/mini`

**接口描述**: 用户创建支付宝充值订单，返回订单号供前端调起支付

**是否需要认证**: 是（用户模式）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| amount | BigDecimal | 是 | 充值金额（最小0.01元） | 0.01 |

**响应示例**:

```json
{
  "code": 200,
  "message": "充值订单创建成功",
  "data": {
    "orderId": "RCH20250110120001",
    "amount": 0.01
  }
}
```

---

### 5. 支付宝同步回调（用户跳转）

**接口路径**: `GET /api/alipay/return`

**接口描述**: 支付成功后用户浏览器跳转接口

**是否需要认证**: 否

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| out_trade_no | String | 是 | 商户订单号 |
| trade_no | String | 是 | 支付宝交易号 |
| total_amount | String | 是 | 交易金额 |
| timestamp | String | 是 | 交易时间 |

**响应**: 重定向到前端成功页面

---

### 6. 支付宝异步通知（服务器回调）

**接口路径**: `POST /api/alipay/notify`

**接口描述**: 支付宝服务器异步通知支付结果

**是否需要认证**: 否（需要验证签名）

**请求参数**: 支付宝POST表单数据

**响应**: 返回"success"给支付宝

**业务逻辑**:
- 验证RSA2签名
- 防重复处理（Redis标记）
- 自动增加用户余额
- 记录资金流水

---

## 钱包管理

### 1. 获取钱包余额

**接口路径**: `GET /api/wallet/balance`

**接口描述**: 查询当前用户的钱包余额

**是否需要认证**: 是

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": 100.50
}
```

---

### 2. 模拟充值（测试用）

**接口路径**: `POST /api/wallet/mock/recharge`

**接口描述**: 【测试用】模拟充值功能

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| amount | BigDecimal | 是 | 充值金额 | 100.00 |

**响应示例**:

```json
{
  "code": 200,
  "message": "充值成功",
  "data": null
}
```

---

### 3. 申请提现

**接口路径**: `POST /api/withdraw/apply`

**接口描述**: 骑手申请提现（自动使用已绑定的支付宝账号）

**是否需要认证**: 是（骑手模式）

**前提条件**: 必须先绑定支付宝账号（调用`/api/user/bind-alipay`）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| amount | BigDecimal | 是 | 提现金额（1-20000元） | 0.10 |

**响应示例**:

```json
{
  "code": 200,
  "message": "提现申请已提交，等待审核",
  "data": {
    "withdrawId": 1,
    "orderNo": "WTH20250110120001",
    "amount": 0.10,
    "status": 0,
    "createTime": "2025-01-10 12:00:00"
  }
}
```

**业务规则**:
- **必须先绑定支付宝账号**，否则会提示"请先绑定支付宝账号再提现"
- 最低提现金额：1元
- 最高提现金额：20000元
- 每日最多提现5次
- 同时只能有一个待审核申请
- 申请时立即冻结余额
- 自动使用已绑定的账号和姓名

**错误示例**:

```json
{
  "code": 500,
  "message": "请先绑定支付宝账号再提现"
}
```

**沙箱测试数据**:
- 绑定账号：2088722092428257（16位用户ID）
- 姓名：沙箱买家（固定）
- 测试金额：0.10元

---

### 4. 获取提现记录列表

**接口路径**: `GET /api/withdraw/list`

**接口描述**: 查询当前用户的提现记录

**是否需要认证**: 是（骑手模式）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| page | Integer | 否 | 页码，默认1 | 1 |
| size | Integer | 否 | 每页大小，默认10 | 10 |
| status | Integer | 否 | 状态筛选 | 3 |

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "orderNo": "WTH20250110120001",
        "amount": 0.10,
        "withdrawType": 1,
        "withdrawAccount": "2088722092428257",
        "withdrawName": "沙箱买家",
        "status": 3,
        "statusText": "转账成功",
        "alipayOrderId": "20250110220014***",
        "transferTime": "2025-01-10 12:05:00",
        "createTime": "2025-01-10 12:00:00"
      }
    ],
    "total": 10,
    "current": 1,
    "size": 10,
    "pages": 1
  }
}
```

**提现状态说明**:
- `0`: 待审核
- `1`: 审核通过
- `2`: 审核驳回
- `3`: 转账成功
- `4`: 转账失败

---

### 5. 管理员-提现审核列表

**接口路径**: `GET /api/admin/withdraw/list`

**接口描述**: 管理员查询提现申请列表

**是否需要认证**: 是（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| page | Integer | 否 | 页码，默认1 | 1 |
| size | Integer | 否 | 每页大小，默认10 | 10 |
| status | Integer | 否 | 状态筛选 | 0 |

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "orderNo": "WTH20250110120001",
        "userId": 1,
        "userName": "张三",
        "amount": 0.10,
        "withdrawType": 1,
        "withdrawAccount": "2088722092428257",
        "withdrawName": "沙箱买家",
        "status": 0,
        "createTime": "2025-01-10 12:00:00"
      }
    ],
    "total": 50,
    "current": 1,
    "size": 10,
    "pages": 5
  }
}
```

---

### 6. 管理员-审核通过

**接口路径**: `POST /api/admin/withdraw/approve`

**接口描述**: 管理员审核通过提现申请，自动触发支付宝转账

**是否需要认证**: 是（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| withdrawId | Long | 是 | 提现记录ID | 1 |

**响应示例**:

```json
{
  "code": 200,
  "message": "审核通过，转账成功",
  "data": {
    "withdrawId": 1,
    "alipayOrderId": "20250110220014***",
    "transferTime": "2025-01-10 12:05:00",
    "status": 3
  }
}
```

**业务流程**:
1. 管理员审核通过
2. 自动调用支付宝转账API
3. 记录支付宝转账单号
4. 更新提现状态为"转账成功"

---

### 7. 管理员-审核驳回

**接口路径**: `POST /api/admin/withdraw/reject`

**接口描述**: 管理员审核驳回提现申请，自动退还余额

**是否需要认证**: 是（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| withdrawId | Long | 是 | 提现记录ID | 1 |
| rejectReason | String | 是 | 驳回原因 | 账号信息不匹配 |

**响应示例**:

```json
{
  "code": 200,
  "message": "已驳回申请，余额已退还",
  "data": null
}
```

**业务流程**:
1. 管理员审核驳回
2. 自动退还冻结余额到用户账户
3. 记录退款流水
4. 更新提现状态为"审核驳回"

---

### 8. 获取资金流水记录

**接口路径**: `GET /api/wallet/transactions`

**接口描述**: 分页查询用户的资金流水记录

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| page | Integer | 否 | 页码，默认1 | 1 |
| size | Integer | 否 | 每页大小，默认10 | 10 |

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "userId": 1,
        "amount": 100.00,
        "type": 1,
        "typeName": "充值",
        "balanceBefore": 0.00,
        "balanceAfter": 100.00,
        "remark": "模拟充值",
        "createTime": "2025-01-08 12:00:00"
      }
    ],
    "total": 100,
    "current": 1,
    "size": 10,
    "pages": 10
  }
}
```

---

## 评价系统

### 1. 提交订单评价

**接口路径**: `POST /api/evaluation/submit`

**接口描述**: 用户对已完成的订单进行评价

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| orderId | Long | 是 | 订单ID | 1001 |
| rating | Integer | 是 | 评分(1-5星) | 5 |
| feedback | String | 否 | 评价内容 | 骑手服务很好，配送及时 |
| evaluationImgs | String | 否 | 评价图片(JSON数组) | ["url1", "url2"] |
| isAnonymous | Integer | 否 | 是否匿名(0-否,1-是) | 1 |

**响应示例**:

```json
{
  "code": 200,
  "message": "评价提交成功",
  "data": {
    "evaluationId": 1,
    "orderId": 1001,
    "rating": 5,
    "feedback": "骑手服务很好，配送及时",
    "isAnonymous": 1,
    "createTime": "2025-01-08 15:00:00"
  }
}
```

---

### 2. 骑手回复评价

**接口路径**: `POST /api/evaluation/reply`

**接口描述**: 骑手对收到的评价进行回复

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| orderId | Long | 是 | 订单ID | 1001 |
| replyContent | String | 是 | 回复内容 | 感谢您的好评，会继续努力 |

**响应示例**:

```json
{
  "code": 200,
  "message": "回复成功",
  "data": null
}
```

---

### 3. 获取评价列表

**接口路径**: `GET /api/evaluation/list`

**接口描述**: 分页获取评价列表

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| type | String | 是 | 查询类型(sent-我发出的, received-我收到的) | sent |
| page | Integer | 否 | 页码，默认1 | 1 |
| size | Integer | 否 | 每页大小，默认10 | 10 |
| rating | Integer | 否 | 评分筛选 | 5 |
| withReply | Boolean | 否 | 是否只看有回复的 | true |

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "evaluationId": 1,
        "orderId": 1001,
        "rating": 5,
        "feedback": "骑手服务很好",
        "isAnonymous": 1,
        "riderReply": "感谢您的好评",
        "replyTime": "2025-01-08 16:00:00",
        "createTime": "2025-01-08 15:00:00"
      }
    ],
    "total": 50,
    "current": 1,
    "size": 10,
    "pages": 5
  }
}
```

---

### 4. 获取评价详情

**接口路径**: `GET /api/evaluation/detail/{orderId}`

**接口描述**: 获取指定订单的评价详情

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| orderId | Long | 是 | 订单ID | 1001 |

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "evaluationId": 1,
    "orderId": 1001,
    "rating": 5,
    "feedback": "骑手服务很好",
    "evaluationImgs": ["url1", "url2"],
    "isAnonymous": 1,
    "riderReply": "感谢您的好评",
    "replyTime": "2025-01-08 16:00:00",
    "createTime": "2025-01-08 15:00:00"
  }
}
```

---

### 5. 获取评价统计

**接口路径**: `GET /api/evaluation/statistics`

**接口描述**: 获取用户的评价统计信息

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| type | String | 是 | 统计类型(sent-我发出的, received-我收到的) | sent |

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "totalEvaluations": 50,
    "averageRating": 4.8,
    "positiveRate": 96.0,
    "ratingDistribution": {
      "5": 40,
      "4": 8,
      "3": 2,
      "2": 0,
      "1": 0
    }
  }
}
```

---

### 6. 检查是否可评价

**接口路径**: `GET /api/evaluation/can-evaluate/{orderId}`

**接口描述**: 检查订单是否可以评价

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| orderId | Long | 是 | 订单ID | 1001 |

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": true
}
```

---

### 7. 检查是否可回复

**接口路径**: `GET /api/evaluation/can-reply/{orderId}`

**接口描述**: 检查骑手是否可以回复评价

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| orderId | Long | 是 | 订单ID | 1001 |

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": true
}
```

---

## 短信服务

### 1. 发送短信验证码

**接口路径**: `POST /api/sms/send-code`

**接口描述**: 向指定手机号发送短信验证码

**是否需要认证**: 否

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| phone | String | 是 | 手机号 | 13800138000 |

**响应示例**:

```json
{
  "code": 200,
  "message": "验证码已发送",
  "data": null
}
```

**业务规则**:
- 验证码5分钟内有效
- 60秒内不能重复发送
- 每日最多发送10次

---

### 2. 检查发送验证码限制

**接口路径**: `GET /api/sms/check-limit`

**接口描述**: 检查是否可以发送验证码，返回剩余等待时间

**是否需要认证**: 否

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| phone | String | 是 | 手机号 | 13800138000 |

**响应示例**:

```json
{
  "code": 200,
  "message": "可以发送验证码",
  "data": null
}
```

或

```json
{
  "code": 500,
  "message": "发送太频繁，请30秒后再试",
  "data": null
}
```

---

## 骑手数据看板

### 1. 获取工作台数据看板

**接口路径**: `GET /api/runner/dashboard/overview`

**接口描述**: 获取骑手首页展示的综合数据

**是否需要认证**: 是（骑手模式）

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "todayIncome": 150.50,
    "todayOrders": 8,
    "currentBalance": 520.30,
    "averageRating": 4.8,
    "totalEvaluations": 50,
    "positiveRate": 96.0,
    "creditScore": 100,
    "completionRate": 98.5
  }
}
```

---

### 2. 获取收入统计

**接口路径**: `GET /api/runner/dashboard/income`

**接口描述**: 获取骑手收入明细和增长率

**是否需要认证**: 是（骑手模式）

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "todayIncome": 150.50,
    "weekIncome": 850.30,
    "monthIncome": 3200.80,
    "totalIncome": 15200.50,
    "todayGrowthRate": 12.5,
    "weekGrowthRate": 8.3,
    "monthGrowthRate": 15.2,
    "recent7DaysIncome": [
      {"date": "2025-01-02", "income": 120.5},
      {"date": "2025-01-03", "income": 145.8},
      {"date": "2025-01-04", "income": 132.2},
      {"date": "2025-01-05", "income": 158.6},
      {"date": "2025-01-06", "income": 168.9},
      {"date": "2025-01-07", "income": 142.3},
      {"date": "2025-01-08", "income": 150.5}
    ]
  }
}
```

---

### 3. 获取订单统计

**接口路径**: `GET /api/runner/dashboard/orders`

**接口描述**: 获取骑手订单数据和趋势

**是否需要认证**: 是（骑手模式）

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "todayCompletedOrders": 8,
    "totalCompletedOrders": 520,
    "completionRate": 98.5,
    "averageDeliveryTime": 25.3,
    "averageOrderIncome": 18.8,
    "recent7DaysOrders": [
      {"date": "2025-01-02", "orders": 6},
      {"date": "2025-01-03", "orders": 7},
      {"date": "2025-01-04", "orders": 8},
      {"date": "2025-01-05", "orders": 9},
      {"date": "2025-01-06", "orders": 8},
      {"date": "2025-01-07", "orders": 7},
      {"date": "2025-01-08", "orders": 8}
    ]
  }
}
```

---

## 系统配置管理

### 1. 获取配置列表（管理员）

**接口路径**: `GET /api/admin/config/list`

**接口描述**: 查询所有系统配置项

**是否需要认证**: 是（管理员权限）

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "paramKey": "base_price",
      "paramName": "起步价",
      "paramValue": "5.00",
      "description": "订单起步价格（元）"
    },
    {
      "id": 2,
      "paramKey": "per_km_price",
      "paramName": "每公里价格",
      "paramValue": "2.00",
      "description": "每公里配送价格（元）"
    },
    {
      "id": 3,
      "paramKey": "weather_rate",
      "paramName": "恶劣天气加价",
      "paramValue": "1.5",
      "description": "恶劣天气加价倍率"
    },
    {
      "id": 4,
      "paramKey": "platform_rate",
      "paramName": "平台抽成比例",
      "paramValue": "0.1",
      "description": "平台抽成比例（0-1之间）"
    }
  ]
}
```

---

### 2. 更新配置（管理员）

**接口路径**: `PUT /api/admin/config/update`

**接口描述**: 管理员更新系统配置项

**是否需要认证**: 是（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| paramKey | String | 是 | 配置键 | base_price |
| paramValue | String | 是 | 配置值 | 6.00 |

**响应示例**:

```json
{
  "code": 200,
  "message": "配置更新成功",
  "data": null
}
```

**可修改的配置键白名单**:
- `base_price`: 起步价
- `per_km_price`: 每公里价格
- `weather_rate`: 恶劣天气加价
- `platform_rate`: 平台抽成比例

---

### 3. 获取单个配置值（公开）

**接口路径**: `GET /api/public/config/{key}`

**接口描述**: 根据参数键获取配置值

**是否需要认证**: 否

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| key | String | 是 | 配置键 | base_price |

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": "5.00"
}
```

---

### 4. 批量获取配置值（公开）

**接口路径**: `GET /api/public/config`

**接口描述**: 批量获取多个配置项

**是否需要认证**: 否

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| keys | String | 否 | 配置键，用逗号分隔 | base_price,per_km_price |

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "base_price": "5.00",
    "per_km_price": "2.00",
    "weather_rate": "1.5",
    "platform_rate": "0.1"
  }
}
```

---

## 公告管理

### 1. 公告列表（管理员）

**接口路径**: `GET /api/admin/notice/list`

**接口描述**: 分页查询公告列表，可按类型筛选

**是否需要认证**: 是（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| page | Integer | 否 | 页码，默认1 | 1 |
| size | Integer | 否 | 每页大小，默认10 | 10 |
| type | Integer | 否 | 类型筛选(1-普通公告,2-轮播图) | 1 |

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "title": "系统升级通知",
        "content": "系统将于今晚22:00-23:00进行升级维护",
        "type": 1,
        "typeName": "普通公告",
        "imageUrl": null,
        "status": 1,
        "sort": 1,
        "createTime": "2025-01-08 10:00:00"
      }
    ],
    "total": 20,
    "current": 1,
    "size": 10,
    "pages": 2
  }
}
```

---

### 2. 创建公告（管理员）

**接口路径**: `POST /api/admin/notice/create`

**接口描述**: 管理员创建新公告或轮播图

**是否需要认证**: 是（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| title | String | 是 | 公告标题 | 新用户优惠活动 |
| content | String | 是 | 公告内容 | 新用户注册即送优惠券 |
| type | Integer | 是 | 类型(1-普通公告,2-轮播图) | 2 |
| imageUrl | String | 否 | 图片URL(type=2时必填) | https://example.com/banner.jpg |
| status | Integer | 否 | 状态(0-隐藏,1-显示) | 1 |
| sort | Integer | 否 | 排序权重 | 1 |

**响应示例**:

```json
{
  "code": 200,
  "message": "创建成功",
  "data": 1
}
```

---

### 3. 更新公告（管理员）

**接口路径**: `PUT /api/admin/notice/update`

**接口描述**: 管理员更新公告内容

**是否需要认证**: 是（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| id | Long | 是 | 公告ID | 1 |
| title | String | 否 | 公告标题 | 新用户优惠活动 |
| content | String | 否 | 公告内容 | 新用户注册即送优惠券 |
| imageUrl | String | 否 | 图片URL | https://example.com/banner.jpg |
| status | Integer | 否 | 状态(0-隐藏,1-显示) | 1 |
| sort | Integer | 否 | 排序权重 | 1 |

**响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

---

### 4. 删除公告（管理员）

**接口路径**: `DELETE /api/admin/notice/delete/{id}`

**接口描述**: 管理员删除公告

**是否需要认证**: 是（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| id | Long | 是 | 公告ID | 1 |

**响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

### 5. 更新公告状态（管理员）

**接口路径**: `PUT /api/admin/notice/status/{id}`

**接口描述**: 显示或隐藏公告

**是否需要认证**: 是（管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| id | Long | 是 | 公告ID | 1 |
| status | Integer | 是 | 状态(0-隐藏,1-显示) | 0 |

**响应示例**:

```json
{
  "code": 200,
  "message": "状态更新成功",
  "data": null
}
```

---

### 6. 获取公告列表（公开）

**接口路径**: `GET /api/public/notice/list`

**接口描述**: 获取已发布的公告列表，可按类型筛选

**是否需要认证**: 否

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| type | Integer | 否 | 类型筛选(1-普通公告,2-轮播图) | 1 |

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "title": "系统升级通知",
      "content": "系统将于今晚22:00-23:00进行升级维护",
      "type": 1,
      "typeName": "普通公告",
      "imageUrl": null,
      "status": 1,
      "sort": 1,
      "createTime": "2025-01-08 10:00:00"
    }
  ]
}
```

---

### 7. 获取轮播图（公开）

**接口路径**: `GET /api/public/notice/banner`

**接口描述**: 获取首页轮播图列表

**是否需要认证**: 否

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "title": "新用户优惠活动",
      "content": "新用户注册即送优惠券",
      "type": 2,
      "typeName": "轮播图",
      "imageUrl": "https://example.com/banner1.jpg",
      "status": 1,
      "sort": 1,
      "createTime": "2025-01-08 10:00:00"
    },
    {
      "id": 2,
      "title": "春节活动",
      "content": "春节不打烊，配送继续",
      "type": 2,
      "typeName": "轮播图",
      "imageUrl": "https://example.com/banner2.jpg",
      "status": 1,
      "sort": 2,
      "createTime": "2025-01-08 11:00:00"
    }
  ]
}
```

---

## 通用接口

### 1. 文件上传

**接口路径**: `POST /api/common/upload`

**接口描述**: 上传文件到阿里云OSS

**是否需要认证**: 是

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| file | File | 是 | 文件对象 | - |
| type | String | 否 | 文件类型，默认temp | avatar |

**响应示例**:

```json
{
  "code": 200,
  "message": "上传成功",
  "data": "https://campus-runner-shan.oss-cn-beijing.aliyuncs.com/avatar/20250108/xxx.jpg"
}
```

**文件限制**:
- 单个文件最大10MB
- 每次请求最大50MB
- 支持的文件类型：图片（jpg、jpeg、png、gif）

---

## 数据模型

### 订单状态枚举

| 状态值 | 状态名称 | 说明 |
|--------|----------|------|
| 0 | 待支付 | 订单已创建，等待支付 |
| 1 | 待接单 | 已支付，等待骑手接单 |
| 2 | 配送中 | 骑手已接单，正在配送 |
| 3 | 已完成 | 配送完成 |
| 4 | 已取消 | 订单已取消 |
| 5 | 退款中 | 申请退款中 |

### 服务类型枚举

| 类型值 | 类型名称 | 说明 |
|--------|----------|------|
| 1 | 帮我买 | 帮忙购买物品 |
| 2 | 帮我送 | 帮忙配送物品 |
| 3 | 帮我取 | 帮忙取件 |

### 用户角色枚举

| 角色值 | 角色名称 | 说明 |
|--------|----------|------|
| 0 | 管理员 | 系统管理员 |
| 1 | 普通用户 | 普通用户 |

### 骑手状态枚举

| 状态值 | 状态名称 | 说明 |
|--------|----------|------|
| 0 | 未认证 | 未申请或未通过认证 |
| 1 | 已认证 | 已通过骑手认证 |
| 2 | 已冻结 | 骑手资格已冻结 |

### 认证申请状态枚举

| 状态值 | 状态名称 | 说明 |
|--------|----------|------|
| 0 | 待审核 | 提交申请，等待审核 |
| 1 | 审核通过 | 审核通过 |
| 2 | 审核驳回 | 审核驳回 |

### 评分标准

| 评分 | 说明 | 信用分变化 |
|------|------|-----------|
| 5星 | 好评 | +2分 |
| 4星 | 中评 | 0分 |
| 3星 | 中评 | 0分 |
| 2星 | 差评 | -2分 |
| 1星 | 差评 | -3分 |

### 公告类型枚举

| 类型值 | 类型名称 | 说明 |
|--------|----------|------|
| 1 | 普通公告 | 文字公告 |
| 2 | 轮播图 | 图片轮播 |

### 公告状态枚举

| 状态值 | 状态名称 | 说明 |
|--------|----------|------|
| 0 | 隐藏 | 不显示 |
| 1 | 显示 | 显示中 |

---

## 错误码说明

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 200 | 成功 | - |
| 400 | 请求参数错误 | 检查请求参数格式和必填项 |
| 401 | 未授权 | Token无效或过期，请重新登录 |
| 403 | 禁止访问 | 权限不足 |
| 404 | 资源不存在 | 检查请求路径和资源ID |
| 500 | 服务器错误 | 联系管理员或稍后重试 |

---

## 更新日志

### v2.2.0 (2025-01-10)
- ✅ **新增支付宝账号绑定功能**
  - 绑定支付宝账号：支持用户ID/邮箱/手机号
  - 智能账号识别：自动识别账号类型并存储用户ID
  - 账号信息查询：支持查询绑定状态和脱敏显示
  - 数据安全保护：账号和姓名自动脱敏

- ✅ **优化提现申请流程**
  - 简化接口参数：只需提现金额，无需填写账号
  - 自动使用绑定账号：提现时自动使用已绑定的支付宝账号
  - 前置条件检查：未绑定账号无法提现
  - 用户体验提升：一次绑定，永久使用

### v2.1.0 (2025-01-10)
- ✅ **新增支付宝充值系统**
  - 网页支付：生成HTML支付表单
  - 小程序支付：返回订单号
  - 支付回调处理：同步返回 + 异步通知
  - RSA2签名验证 + 防重复机制

- ✅ **新增提现管理系统**
  - 提现申请：支持支付宝/微信/银行卡
  - 余额冻结：申请时立即扣除
  - 管理员审核：通过自动转账、驳回自动退款
  - 支付宝转账集成：智能账号识别、状态跟踪
  - 数据脱敏：保护用户隐私

### v1.9.0 (2025-01-07)
- ✅ 新增系统配置管理功能
- ✅ 新增公告轮播管理功能
- ✅ 优化公开接口白名单

### v1.8.0 (2025-01-06)
- ✅ 新增骑手数据统计功能
- ✅ 新增短信验证码功能
- ✅ 完善评价反馈系统

---

## 联系方式

如有问题，请联系：
- **技术支持**: [邮箱]
- **项目地址**: [GitHub/其他仓库地址]

---

*文档最后更新: 2025-01-10*

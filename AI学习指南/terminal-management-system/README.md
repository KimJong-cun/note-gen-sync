# 智能终端管理系统

**版权所有: KimJong**

基于WebSocket的智能终端管理系统,采用前后端分离架构。

## 项目特性

- ✅ 前后端完全分离架构
- ✅ 基于WebSocket的实时双向通信
- ✅ 纯原生JavaScript实现(无框架依赖)
- ✅ HTML、CSS、JS完全分离
- ✅ 支持自定义服务器地址和端口
- ✅ 消息自动转发功能
- ✅ 实时连接状态监控
- ✅ 消息统计功能
- ✅ 自动重连机制

## 项目结构

```
terminal-management-system/
├── backend/                 # 后端目录
│   ├── app.js              # 主应用入口(HTTP+WebSocket)
│   ├── server.js           # WebSocket服务器
│   ├── http-server.js      # HTTP服务器
│   └── websocket-server.js # WebSocket服务器类
├── frontend/               # 前端目录
│   ├── index.html         # 主页面
│   ├── css/
│   │   └── style.css      # 样式文件
│   └── js/
│       ├── app.js         # 应用主控制器
│       ├── ui-controller.js    # UI控制器
│       └── websocket-client.js # WebSocket客户端
├── package.json           # 项目配置
└── README.md             # 项目说明
```

## 安装依赖

```bash
npm install
```

## 启动方式

### 方式一: 同时启动HTTP和WebSocket服务器(推荐)

```bash
npm start
```

或

```bash
npm run dev
```

访问地址:
- 前端: http://127.0.0.1:3000
- WebSocket: ws://127.0.0.1:8080

### 方式二: 仅启动WebSocket服务器

```bash
npm run ws-only
```

### 方式三: 仅启动HTTP服务器

```bash
npm run http-only
```

## 使用说明

### 1. 启动系统

```bash
npm start
```

### 2. 打开浏览器

访问 http://127.0.0.1:3000

### 3. 配置连接

- **服务器地址**: 默认为 127.0.0.1
- **端口**: 默认为 8080
- 点击"连接"按钮

### 4. 发送消息

- 在消息输入框中输入要发送的内容
- 点击"发送消息"按钮或使用 Ctrl+Enter 快捷键
- 消息将被转发给所有连接的客户端

### 5. 查看日志

- 所有消息和系统事件都会显示在消息日志区域
- 支持清空日志功能

## 功能说明

### WebSocket服务器功能

- 接收客户端连接
- 接收客户端消息
- 自动转发消息给所有连接的客户端
- 连接状态管理
- 错误处理

### 前端功能

- 自定义服务器地址和端口配置
- 实时连接状态显示
- 消息发送和接收
- 消息日志记录
- 发送/接收统计
- 自动重连机制(最多5次)

## 端口配置

可通过环境变量自定义端口:

```bash
# Windows
set HTTP_PORT=3000 && set WS_PORT=8080 && npm start

# Linux/Mac
HTTP_PORT=3000 WS_PORT=8080 npm start
```

## 技术栈

### 后端
- Node.js
- Express (HTTP服务器)
- ws (WebSocket库)
- cors (跨域支持)

### 前端
- 纯HTML5
- 纯CSS3
- 原生JavaScript (ES6+)
- WebSocket API

## 消息格式

### 服务器发送格式

```json
{
  "type": "system|forward|error",
  "data": "消息内容或数据对象",
  "timestamp": "ISO时间戳"
}
```

### 转发消息格式

```json
{
  "type": "forward",
  "data": {
    "data": "原始消息内容",
    "isSelf": true/false
  },
  "timestamp": "ISO时间戳"
}
```

## 开发说明

### 添加新功能

1. **后端**: 在 `backend/websocket-server.js` 中扩展
2. **前端**:
   - UI: 修改 `frontend/index.html` 和 `frontend/css/style.css`
   - 逻辑: 修改相应的 JS 文件

### 调试

浏览器控制台会显示详细的调试信息,包括:
- 连接状态变化
- 消息发送/接收
- 错误信息

## 常见问题

### Q: 无法连接到WebSocket服务器?

**A**: 请检查:
1. WebSocket服务器是否已启动
2. 服务器地址和端口是否正确
3. 防火墙是否阻止了连接

### Q: 前端无法访问?

**A**: 请确保:
1. HTTP服务器已启动
2. 访问地址为 http://127.0.0.1:3000 (不是直接打开HTML文件)

### Q: 消息没有转发?

**A**: 检查:
1. 至少需要两个客户端连接才能看到转发效果
2. 查看服务器控制台是否有错误信息

## 版本历史

### v1.0.0 (当前版本)
- ✅ 基础WebSocket服务器
- ✅ 前端连接界面
- ✅ 消息转发功能
- ✅ 实时状态监控
- ✅ 自动重连机制

## 许可证

ISC License

## 作者

**KimJong** - 米醋电子工作室
- Email: 3531313387@qq.com
- GitHub: McuXifeng

---

**版权所有 © KimJong**

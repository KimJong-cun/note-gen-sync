/**
 * 应用主入口 - 智能终端管理系统
 * 版权所有: KimJong
 * 使用统一服务器(HTTP + WebSocket 在同一端口)
 */

const UnifiedServer = require('./unified-server');

// 配置端口
const PORT = process.env.PORT || 8080;

// 创建统一服务器实例
const server = new UnifiedServer(PORT);

// 启动服务器
server.start();

// 优雅关闭处理
const gracefulShutdown = () => {
    server.stop();
    setTimeout(() => {
        process.exit(0);
    }, 1000);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

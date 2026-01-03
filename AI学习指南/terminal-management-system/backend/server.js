/**
 * 主服务器入口 - 智能终端管理系统
 * 版权所有: KimJong
 */

const WebSocketServer = require('./websocket-server');

// 从环境变量或使用默认端口
const WS_PORT = process.env.WS_PORT || 8080;

// 创建并启动WebSocket服务器
const wsServer = new WebSocketServer(WS_PORT);
wsServer.start();

// 优雅关闭处理
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    wsServer.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n正在关闭服务器...');
    wsServer.stop();
    process.exit(0);
});

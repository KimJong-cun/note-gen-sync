/**
 * WebSocket服务器 - 智能终端管理系统
 * 版权所有: KimJong
 * 功能: 接收WebSocket连接并转发数据给所有连接的客户端
 */

const WebSocket = require('ws');

class WebSocketServer {
    constructor(port = 8080) {
        this.port = port;
        this.wss = null;
        this.clients = new Set();
    }

    /**
     * 启动WebSocket服务器
     */
    start() {
        this.wss = new WebSocket.Server({
            port: this.port,
            host: '0.0.0.0'
        });

        this.wss.on('listening', () => {
            console.log(`[WebSocket服务器] 已启动,端口: ${this.port}`);
            console.log(`[WebSocket服务器] 监听地址: 0.0.0.0:${this.port} (所有网络接口)`);
        });

        this.wss.on('connection', (ws, req) => {
            const clientIp = req.socket.remoteAddress;
            console.log(`[新连接] 客户端已连接 - IP: ${clientIp}`);

            // 添加客户端到集合
            this.clients.add(ws);

            // 监听客户端消息
            ws.on('message', (message) => {
                this.handleMessage(ws, message, clientIp);
            });

            // 监听客户端断开
            ws.on('close', () => {
                console.log(`[断开连接] 客户端已断开 - IP: ${clientIp}`);
                this.clients.delete(ws);
            });

            // 监听错误
            ws.on('error', (error) => {
                console.error(`[错误] 客户端错误 - IP: ${clientIp}`, error.message);
                this.clients.delete(ws);
            });

            // 发送欢迎消息
            ws.send(JSON.stringify({
                type: 'system',
                message: '欢迎连接到智能终端管理系统',
                timestamp: new Date().toISOString()
            }));
        });

        this.wss.on('error', (error) => {
            console.error('[WebSocket服务器错误]', error);
        });
    }

    /**
     * 处理接收到的消息
     * @param {WebSocket} sender - 发送消息的客户端
     * @param {Buffer} message - 接收到的消息
     * @param {string} clientIp - 客户端IP
     */
    handleMessage(sender, message, clientIp) {
        try {
            const messageStr = message.toString();
            console.log(`[收到消息] 来自 ${clientIp}: ${messageStr}`);

            // 转发消息给所有客户端(包括发送者)
            this.broadcast(messageStr, sender);
        } catch (error) {
            console.error('[消息处理错误]', error);
            sender.send(JSON.stringify({
                type: 'error',
                message: '消息处理失败',
                timestamp: new Date().toISOString()
            }));
        }
    }

    /**
     * 广播消息给所有客户端
     * @param {string} message - 要广播的消息
     * @param {WebSocket} sender - 发送者(可选,用于识别)
     */
    broadcast(message, sender = null) {
        let successCount = 0;
        let failCount = 0;

        this.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    // 构造转发消息
                    const forwardMessage = JSON.stringify({
                        type: 'forward',
                        data: message,
                        isSelf: client === sender,
                        timestamp: new Date().toISOString()
                    });

                    client.send(forwardMessage);
                    successCount++;
                } catch (error) {
                    console.error('[广播失败]', error.message);
                    failCount++;
                }
            }
        });

        console.log(`[广播完成] 成功: ${successCount}, 失败: ${failCount}`);
    }

    /**
     * 停止WebSocket服务器
     */
    stop() {
        if (this.wss) {
            this.wss.close(() => {
                console.log('[WebSocket服务器] 已停止');
            });
        }
    }

    /**
     * 获取当前连接数
     */
    getConnectionCount() {
        return this.clients.size;
    }
}

module.exports = WebSocketServer;

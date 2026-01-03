/**
 * 统一服务器 - HTTP + WebSocket 在同一端口
 * 版权所有: KimJong
 * 参考Web项目的架构,将HTTP静态文件服务和WebSocket整合到同一端口
 */

const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

class UnifiedServer {
    constructor(port = 8080) {
        this.port = port;
        this.httpServer = null;
        this.wss = null;
        this.clients = new Set();
    }

    /**
     * 启动统一服务器
     */
    start() {
        // 创建HTTP服务器
        this.httpServer = http.createServer((req, res) => {
            this.handleHttpRequest(req, res);
        });

        // 创建WebSocket服务器,共享HTTP服务器
        this.wss = new WebSocket.Server({ server: this.httpServer });

        // 设置WebSocket连接处理
        this.setupWebSocket();

        // 启动监听
        this.httpServer.listen(this.port, () => {
            console.log('========================================');
            console.log('  智能终端管理系统');
            console.log('  版权所有: KimJong');
            console.log('========================================\n');
            console.log(`[统一服务器] 已启动,端口: ${this.port}`);
            console.log(`[HTTP服务] http://localhost:${this.port}`);
            console.log(`[WebSocket服务] ws://localhost:${this.port}`);
            console.log(`[监听地址] 0.0.0.0:${this.port} (所有网络接口)\n`);
        });

        this.httpServer.on('error', (error) => {
            console.error('[服务器错误]', error);
            if (error.code === 'EADDRINUSE') {
                console.error(`端口 ${this.port} 已被占用,请尝试其他端口`);
                process.exit(1);
            }
        });
    }

    /**
     * 处理HTTP请求
     */
    handleHttpRequest(req, res) {
        // 确定请求的文件路径
        let filePath = req.url === '/' ? 'index.html' : req.url.substring(1);

        // 基本安全检查
        if (filePath.includes('..')) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }

        // 健康检查接口
        if (req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'ok',
                service: '智能终端管理系统',
                timestamp: new Date().toISOString()
            }));
            return;
        }

        // 构建完整文件路径
        const fullPath = path.join(__dirname, '../frontend', filePath);
        const ext = path.extname(fullPath).toLowerCase();

        // 确定Content-Type
        const contentTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml'
        };
        const contentType = contentTypes[ext] || 'application/octet-stream';

        // 读取并返回文件
        fs.readFile(fullPath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    res.writeHead(404);
                    res.end('404 Not Found');
                } else {
                    res.writeHead(500);
                    res.end(`Error ${error.code}`);
                }
                console.log(`[HTTP] ${req.method} ${req.url} - ${error.code || 500}`);
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
                console.log(`[HTTP] ${req.method} ${req.url} - 200`);
            }
        });
    }

    /**
     * 设置WebSocket连接处理
     */
    setupWebSocket() {
        this.wss.on('connection', (ws, req) => {
            const clientIp = req.socket.remoteAddress;
            console.log(`[WebSocket] 新连接 - IP: ${clientIp}`);

            // 添加客户端到集合
            this.clients.add(ws);

            // 发送欢迎消息
            ws.send(JSON.stringify({
                type: 'system',
                message: '欢迎连接到智能终端管理系统',
                timestamp: new Date().toISOString()
            }));

            // 监听客户端消息
            ws.on('message', (message) => {
                this.handleMessage(ws, message, clientIp);
            });

            // 监听客户端断开
            ws.on('close', () => {
                console.log(`[WebSocket] 断开连接 - IP: ${clientIp}`);
                this.clients.delete(ws);
            });

            // 监听错误
            ws.on('error', (error) => {
                console.error(`[WebSocket] 客户端错误 - IP: ${clientIp}`, error.message);
                this.clients.delete(ws);
            });
        });

        this.wss.on('error', (error) => {
            console.error('[WebSocket服务器错误]', error);
        });
    }

    /**
     * 处理接收到的消息
     */
    handleMessage(sender, message, clientIp) {
        try {
            const messageStr = message.toString();
            console.log(`[WebSocket] 收到消息 - ${clientIp}: ${messageStr}`);

            // 广播消息给所有客户端
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
     */
    broadcast(message, sender = null) {
        let successCount = 0;
        let failCount = 0;

        this.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                try {
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
     * 停止服务器
     */
    stop() {
        console.log('\n正在关闭服务器...');

        // 关闭所有WebSocket连接
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.close();
            }
        });

        // 关闭WebSocket服务器
        if (this.wss) {
            this.wss.close(() => {
                console.log('[WebSocket服务器] 已停止');
            });
        }

        // 关闭HTTP服务器
        if (this.httpServer) {
            this.httpServer.close(() => {
                console.log('[HTTP服务器] 已停止');
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

// 如果直接运行此文件
if (require.main === module) {
    const port = process.env.PORT || 8080;
    const server = new UnifiedServer(port);

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
}

module.exports = UnifiedServer;

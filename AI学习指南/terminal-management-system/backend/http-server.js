/**
 * HTTP服务器 - 智能终端管理系统前端
 * 版权所有: KimJong
 * 功能: 提供前端静态文件服务
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

class HTTPServer {
    constructor(port = 3000) {
        this.port = port;
        this.app = express();
        this.server = null;
        this.setupMiddleware();
        this.setupRoutes();
    }

    /**
     * 配置中间件
     */
    setupMiddleware() {
        // 启用CORS
        this.app.use(cors());

        // 设置静态文件目录
        const frontendPath = path.join(__dirname, '../frontend');
        this.app.use(express.static(frontendPath));

        // 日志中间件
        this.app.use((req, res, next) => {
            console.log(`[HTTP] ${req.method} ${req.url}`);
            next();
        });
    }

    /**
     * 配置路由
     */
    setupRoutes() {
        // 主页路由
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../frontend/index.html'));
        });

        // 健康检查
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                service: '智能终端管理系统',
                timestamp: new Date().toISOString()
            });
        });

        // 404处理
        this.app.use((req, res) => {
            res.status(404).json({
                error: '页面不存在',
                path: req.url
            });
        });
    }

    /**
     * 启动HTTP服务器
     */
    start() {
        this.server = this.app.listen(this.port, '0.0.0.0', () => {
            console.log(`[HTTP服务器] 已启动,端口: ${this.port}`);
            console.log(`[访问地址] http://127.0.0.1:${this.port}`);
            console.log(`[外网访问] http://0.0.0.0:${this.port} (所有网络接口)`);
        });
    }

    /**
     * 停止HTTP服务器
     */
    stop() {
        if (this.server) {
            this.server.close(() => {
                console.log('[HTTP服务器] 已停止');
            });
        }
    }
}

module.exports = HTTPServer;

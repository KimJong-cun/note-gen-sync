/**
 * UI控制器 - 智能终端管理系统
 * 版权所有: KimJong
 */

class UIController {
    constructor() {
        // 获取DOM元素
        this.elements = {
            serverAddress: document.getElementById('server-address'),
            serverPort: document.getElementById('server-port'),
            connectBtn: document.getElementById('connect-btn'),
            disconnectBtn: document.getElementById('disconnect-btn'),
            statusDot: document.getElementById('status-dot'),
            statusText: document.getElementById('status-text'),
            messageInput: document.getElementById('message-input'),
            sendBtn: document.getElementById('send-btn'),
            messageLog: document.getElementById('message-log'),
            clearLogBtn: document.getElementById('clear-log-btn'),
            currentConnection: document.getElementById('current-connection'),
            messageStats: document.getElementById('message-stats')
        };

        this.setupEventListeners();
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 清空日志按钮
        this.elements.clearLogBtn.addEventListener('click', () => {
            this.clearLog();
        });

        // 输入框回车发送
        this.elements.messageInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.elements.sendBtn.click();
            }
        });
    }

    /**
     * 更新连接状态显示
     * @param {string} state - 状态
     */
    updateConnectionState(state) {
        const stateConfig = {
            connecting: {
                text: '正在连接...',
                dotClass: 'connecting'
            },
            connected: {
                text: '已连接',
                dotClass: 'connected'
            },
            disconnected: {
                text: '未连接',
                dotClass: 'disconnected'
            },
            reconnecting: {
                text: '重新连接中...',
                dotClass: 'connecting'
            },
            error: {
                text: '连接错误',
                dotClass: 'disconnected'
            },
            closing: {
                text: '正在断开...',
                dotClass: 'connecting'
            }
        };

        const config = stateConfig[state] || stateConfig.disconnected;

        this.elements.statusText.textContent = config.text;
        this.elements.statusDot.className = `status-dot ${config.dotClass}`;

        // 更新按钮状态
        if (state === 'connected') {
            this.elements.connectBtn.disabled = true;
            this.elements.disconnectBtn.disabled = false;
            this.elements.sendBtn.disabled = false;
        } else if (state === 'disconnected' || state === 'error') {
            this.elements.connectBtn.disabled = false;
            this.elements.disconnectBtn.disabled = true;
            this.elements.sendBtn.disabled = true;
        } else {
            this.elements.connectBtn.disabled = true;
            this.elements.disconnectBtn.disabled = true;
            this.elements.sendBtn.disabled = true;
        }
    }

    /**
     * 添加日志条目
     * @param {string} type - 日志类型 (system/sent/received/error)
     * @param {string} message - 消息内容
     * @param {object} data - 额外数据
     */
    addLog(type, message, data = null) {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;

        const timestamp = new Date().toLocaleTimeString('zh-CN', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3
        });

        const typeLabels = {
            system: '[系统]',
            sent: '[发送]',
            received: '[接收]',
            error: '[错误]'
        };

        let content = `<span class="log-timestamp">${timestamp}</span>`;
        content += `<span class="log-type">${typeLabels[type] || '[未知]'}</span>`;
        content += `<span class="log-message">${this.escapeHtml(message)}</span>`;

        if (data) {
            content += `<pre style="margin-top: 5px; color: #95a5a6;">${this.escapeHtml(JSON.stringify(data, null, 2))}</pre>`;
        }

        logEntry.innerHTML = content;
        this.elements.messageLog.appendChild(logEntry);

        // 自动滚动到底部
        this.elements.messageLog.scrollTop = this.elements.messageLog.scrollHeight;
    }

    /**
     * 清空日志
     */
    clearLog() {
        this.elements.messageLog.innerHTML = '';
        this.addLog('system', '日志已清空');
    }

    /**
     * 更新连接信息
     * @param {string} address - 服务器地址
     * @param {string} port - 端口
     */
    updateConnectionInfo(address, port) {
        if (address && port) {
            this.elements.currentConnection.textContent = `ws://${address}:${port}`;
        } else {
            this.elements.currentConnection.textContent = '无';
        }
    }

    /**
     * 更新消息统计
     * @param {object} stats - 统计信息
     */
    updateMessageStats(stats) {
        this.elements.messageStats.textContent = `发送: ${stats.sent} | 接收: ${stats.received}`;
    }

    /**
     * 获取服务器配置
     */
    getServerConfig() {
        return {
            address: this.elements.serverAddress.value.trim(),
            port: this.elements.serverPort.value.trim()
        };
    }

    /**
     * 获取消息内容
     */
    getMessageInput() {
        return this.elements.messageInput.value;
    }

    /**
     * 清空消息输入框
     */
    clearMessageInput() {
        this.elements.messageInput.value = '';
    }

    /**
     * 验证服务器配置
     */
    validateServerConfig() {
        const config = this.getServerConfig();

        if (!config.address) {
            this.addLog('error', '请输入服务器地址');
            return false;
        }

        if (!config.port) {
            this.addLog('error', '请输入端口号');
            return false;
        }

        const port = parseInt(config.port);
        if (isNaN(port) || port < 1 || port > 65535) {
            this.addLog('error', '端口号必须在 1-65535 之间');
            return false;
        }

        return true;
    }

    /**
     * HTML转义
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 显示通知
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型
     */
    showNotification(message, type = 'info') {
        // 简单的通知实现,可以后续扩展为更复杂的通知系统
        this.addLog(type === 'error' ? 'error' : 'system', message);
    }

    /**
     * 禁用输入框
     */
    disableInputs() {
        this.elements.serverAddress.disabled = true;
        this.elements.serverPort.disabled = true;
    }

    /**
     * 启用输入框
     */
    enableInputs() {
        this.elements.serverAddress.disabled = false;
        this.elements.serverPort.disabled = false;
    }
}

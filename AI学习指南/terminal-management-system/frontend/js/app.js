/**
 * 应用主控制器 - 智能终端管理系统
 * 版权所有: KimJong
 */

class App {
    constructor() {
        this.wsClient = new WebSocketClient();
        this.ui = new UIController();
        this.initialize();
    }

    /**
     * 初始化应用
     */
    initialize() {
        console.log('智能终端管理系统已启动 - 版权所有: KimJong');

        // 设置WebSocket事件回调
        this.setupWebSocketCallbacks();

        // 设置UI事件
        this.setupUIEvents();

        // 初始化UI
        this.ui.addLog('system', '系统已就绪,请配置服务器地址并连接');
    }

    /**
     * 设置WebSocket事件回调
     */
    setupWebSocketCallbacks() {
        // 连接建立
        this.wsClient.on('open', (event) => {
            const config = this.ui.getServerConfig();
            this.ui.addLog('system', `已成功连接到服务器: ws://${config.address}:${config.port}`);
            this.ui.updateConnectionInfo(config.address, config.port);
            this.ui.disableInputs();
        });

        // 连接关闭
        this.wsClient.on('close', (info) => {
            this.ui.addLog('system', `连接已关闭: ${info.reason} (代码: ${info.code})`);
            this.ui.updateConnectionInfo(null, null);
            this.ui.enableInputs();
        });

        // 接收消息
        this.wsClient.on('message', (messageData) => {
            this.handleReceivedMessage(messageData);
            this.updateStats();
        });

        // 错误处理
        this.wsClient.on('error', (errorData) => {
            this.ui.addLog('error', errorData.message);
        });

        // 状态变化
        this.wsClient.on('stateChange', (state) => {
            this.ui.updateConnectionState(state);
        });
    }

    /**
     * 设置UI事件
     */
    setupUIEvents() {
        // 连接按钮
        this.ui.elements.connectBtn.addEventListener('click', () => {
            this.handleConnect();
        });

        // 断开按钮
        this.ui.elements.disconnectBtn.addEventListener('click', () => {
            this.handleDisconnect();
        });

        // 发送按钮
        this.ui.elements.sendBtn.addEventListener('click', () => {
            this.handleSendMessage();
        });
    }

    /**
     * 处理连接
     */
    handleConnect() {
        if (!this.ui.validateServerConfig()) {
            return;
        }

        const config = this.ui.getServerConfig();
        this.ui.addLog('system', `正在连接到 ws://${config.address}:${config.port}...`);
        this.wsClient.connect(config.address, config.port);
    }

    /**
     * 处理断开连接
     */
    handleDisconnect() {
        this.ui.addLog('system', '正在断开连接...');
        this.wsClient.disconnect();
    }

    /**
     * 处理发送消息
     */
    handleSendMessage() {
        const message = this.ui.getMessageInput();

        if (!message.trim()) {
            this.ui.addLog('error', '消息不能为空');
            return;
        }

        const success = this.wsClient.send(message);

        if (success) {
            this.ui.addLog('sent', message);
            this.ui.clearMessageInput();
            this.updateStats();
        }
    }

    /**
     * 处理接收到的消息
     * @param {object} messageData - 消息数据
     */
    handleReceivedMessage(messageData) {
        switch (messageData.type) {
            case 'system':
                // 系统消息
                this.ui.addLog('system', messageData.data.message);
                break;

            case 'forward':
                // 转发的消息
                const forwardData = messageData.data;
                const prefix = forwardData.isSelf ? '(自己)' : '';
                this.ui.addLog('received', `${prefix} ${forwardData.data}`);
                break;

            case 'text':
                // 普通文本消息
                this.ui.addLog('received', messageData.data);
                break;

            case 'error':
                // 错误消息
                this.ui.addLog('error', messageData.data.message || messageData.data);
                break;

            default:
                // 其他类型消息,显示原始数据
                this.ui.addLog('received', '收到消息', messageData.data);
                break;
        }
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        const stats = this.wsClient.getStats();
        this.ui.updateMessageStats(stats);
    }
}

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

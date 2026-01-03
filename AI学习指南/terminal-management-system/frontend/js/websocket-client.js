/**
 * WebSocket客户端类 - 智能终端管理系统
 * 版权所有: KimJong
 */

class WebSocketClient {
    constructor() {
        this.ws = null;
        this.serverAddress = '';
        this.serverPort = '';
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;

        // 统计信息
        this.stats = {
            sent: 0,
            received: 0
        };

        // 事件回调
        this.callbacks = {
            onOpen: null,
            onClose: null,
            onMessage: null,
            onError: null,
            onStateChange: null
        };
    }

    /**
     * 连接到WebSocket服务器
     * @param {string} address - 服务器地址
     * @param {string} port - 服务器端口
     */
    connect(address, port) {
        if (this.isConnected) {
            console.warn('已经连接到服务器');
            return;
        }

        this.serverAddress = address;
        this.serverPort = port;

        // 如果端口为空、80或443,则不添加端口号
        let url;
        if (!port || port === '80' || port === '443') {
            url = `ws://${address}`;
        } else {
            url = `ws://${address}:${port}`;
        }

        try {
            this.updateState('connecting');
            this.ws = new WebSocket(url);
            this.setupEventHandlers();
        } catch (error) {
            console.error('连接失败:', error);
            this.triggerCallback('onError', { type: 'connection', message: error.message });
            this.updateState('error');
        }
    }

    /**
     * 设置WebSocket事件处理器
     */
    setupEventHandlers() {
        // 连接建立
        this.ws.onopen = (event) => {
            console.log('WebSocket连接已建立');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.updateState('connected');
            this.triggerCallback('onOpen', event);
        };

        // 接收消息
        this.ws.onmessage = (event) => {
            console.log('收到消息:', event.data);
            this.stats.received++;

            try {
                const data = JSON.parse(event.data);
                this.triggerCallback('onMessage', {
                    type: data.type || 'unknown',
                    data: data,
                    raw: event.data,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                // 如果不是JSON格式,作为普通文本处理
                this.triggerCallback('onMessage', {
                    type: 'text',
                    data: event.data,
                    raw: event.data,
                    timestamp: new Date().toISOString()
                });
            }
        };

        // 连接关闭
        this.ws.onclose = (event) => {
            console.log('WebSocket连接已关闭', event);
            this.isConnected = false;
            this.updateState('disconnected');

            const closeInfo = {
                code: event.code,
                reason: event.reason || '未知原因',
                wasClean: event.wasClean
            };

            this.triggerCallback('onClose', closeInfo);

            // 如果不是主动断开,尝试重连
            if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
                this.attemptReconnect();
            }
        };

        // 连接错误
        this.ws.onerror = (error) => {
            console.error('WebSocket错误:', error);
            this.triggerCallback('onError', {
                type: 'websocket',
                message: '连接发生错误',
                error: error
            });
            this.updateState('error');
        };
    }

    /**
     * 尝试重新连接
     */
    attemptReconnect() {
        this.reconnectAttempts++;
        console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

        this.updateState('reconnecting');

        setTimeout(() => {
            if (!this.isConnected && this.reconnectAttempts <= this.maxReconnectAttempts) {
                this.connect(this.serverAddress, this.serverPort);
            }
        }, this.reconnectDelay);
    }

    /**
     * 断开连接
     */
    disconnect() {
        if (!this.ws) {
            console.warn('没有活动的连接');
            return;
        }

        this.reconnectAttempts = this.maxReconnectAttempts; // 防止自动重连
        this.ws.close(1000, '用户主动断开');
        this.ws = null;
    }

    /**
     * 发送消息
     * @param {string|object} message - 要发送的消息
     */
    send(message) {
        if (!this.isConnected || !this.ws) {
            console.error('未连接到服务器');
            this.triggerCallback('onError', {
                type: 'send',
                message: '未连接到服务器,无法发送消息'
            });
            return false;
        }

        try {
            const dataToSend = typeof message === 'object'
                ? JSON.stringify(message)
                : message;

            this.ws.send(dataToSend);
            this.stats.sent++;
            console.log('消息已发送:', dataToSend);
            return true;
        } catch (error) {
            console.error('发送消息失败:', error);
            this.triggerCallback('onError', {
                type: 'send',
                message: '发送消息失败: ' + error.message
            });
            return false;
        }
    }

    /**
     * 更新连接状态
     * @param {string} state - 新状态
     */
    updateState(state) {
        this.triggerCallback('onStateChange', state);
    }

    /**
     * 触发回调函数
     * @param {string} callbackName - 回调名称
     * @param {*} data - 传递给回调的数据
     */
    triggerCallback(callbackName, data) {
        if (typeof this.callbacks[callbackName] === 'function') {
            this.callbacks[callbackName](data);
        }
    }

    /**
     * 注册事件回调
     * @param {string} event - 事件名称
     * @param {function} callback - 回调函数
     */
    on(event, callback) {
        if (this.callbacks.hasOwnProperty(`on${event.charAt(0).toUpperCase()}${event.slice(1)}`)) {
            this.callbacks[`on${event.charAt(0).toUpperCase()}${event.slice(1)}`] = callback;
        }
    }

    /**
     * 获取连接状态
     */
    getState() {
        if (!this.ws) return 'disconnected';

        switch (this.ws.readyState) {
            case WebSocket.CONNECTING:
                return 'connecting';
            case WebSocket.OPEN:
                return 'connected';
            case WebSocket.CLOSING:
                return 'closing';
            case WebSocket.CLOSED:
                return 'disconnected';
            default:
                return 'unknown';
        }
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * 重置统计信息
     */
    resetStats() {
        this.stats.sent = 0;
        this.stats.received = 0;
    }
}

// 输入处理器类
class InputHandler {
    constructor(canvas) {
        this.canvas = canvas;
        this.clickCallback = null;
        this.lastClickTime = 0;
        this.clickDelay = 300; // 防抖延迟（毫秒）
        
        this.bindEvents();
    }

    // 绑定事件监听器
    bindEvents() {
        // 鼠标点击事件
        this.canvas.addEventListener('click', (event) => {
            this.handleClick(event);
        });

        // 触摸事件（移动设备支持）
        this.canvas.addEventListener('touchstart', (event) => {
            event.preventDefault();
            this.handleTouch(event);
        });

        // 鼠标移动事件（可选，用于显示瞄准线等）
        this.canvas.addEventListener('mousemove', (event) => {
            this.handleMouseMove(event);
        });
    }

    // 处理鼠标点击
    handleClick = (event) => {
        const currentTime = Date.now();
        
        // 防抖处理
        if (currentTime - this.lastClickTime < this.clickDelay) {
            return;
        }
        
        this.lastClickTime = currentTime;
        
        // 获取点击位置
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // 转换为Canvas坐标
        const canvasX = (x / rect.width) * this.canvas.width;
        const canvasY = (y / rect.height) * this.canvas.height;
        
        console.log(`鼠标点击位置: (${Math.round(canvasX)}, ${Math.round(canvasY)})`);
        
        // 调用回调函数
        if (this.clickCallback) {
            this.clickCallback(canvasX, canvasY);
        }
    }

    // 处理触摸事件
    handleTouch = (event) => {
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // 转换为Canvas坐标
            const canvasX = (x / rect.width) * this.canvas.width;
            const canvasY = (y / rect.height) * this.canvas.height;
            
            console.log(`触摸位置: (${Math.round(canvasX)}, ${Math.round(canvasY)})`);
            
            // 调用回调函数
            if (this.clickCallback) {
                this.clickCallback(canvasX, canvasY);
            }
        }
    }

    // 处理鼠标移动
    handleMouseMove = (event) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // 转换为Canvas坐标
        const canvasX = (x / rect.width) * this.canvas.width;
        const canvasY = (y / rect.height) * this.canvas.height;
        
        // 可以在这里实现瞄准线或其他鼠标跟随效果
        // 暂时不实现，避免性能问题
    }

    // 设置点击回调函数
    setClickCallback(callback) {
        this.clickCallback = callback;
    }

    // 验证点击位置是否有效
    isValidClickPosition(x, y) {
        // 检查是否在Canvas范围内
        if (x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height) {
            return false;
        }
        
        // 检查是否在水域范围内（从230px到底部留50px边距）
        const waterAreaTop = 230;
        const waterAreaBottom = this.canvas.height - 50;
        
        if (y < waterAreaTop || y > waterAreaBottom) {
            console.log('点击位置不在水域范围内');
            return false;
        }
        
        // 检查是否离玩家太近
        const playerArea = 200; // 玩家周围的禁止区域
        if (x < playerArea) {
            console.log('点击位置离玩家太近');
            return false;
        }
        
        return true;
    }

    // 获取Canvas相对坐标
    getCanvasCoordinates(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        return {
            x: (x / rect.width) * this.canvas.width,
            y: (y / rect.height) * this.canvas.height
        };
    }

    // 设置防抖延迟
    setClickDelay(delay) {
        this.clickDelay = delay;
    }

    // 启用/禁用输入
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    // 清理事件监听器
    destroy() {
        if (this.canvas) {
            this.canvas.removeEventListener('click', this.handleClick);
            this.canvas.removeEventListener('touchstart', this.handleTouch);
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        }
    }
}
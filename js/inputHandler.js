// 输入处理器类
class InputHandler {
    constructor(canvas) {
        this.canvas = canvas;
        this.clickCallback = null;
        this.lastClickTime = 0;
        this.clickDelay = 300; // 防抖延迟（毫秒）
        
        // 触屏优化相关属性
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.isTouching = false;
        this.swipeThreshold = 50; // 滑动阈值（像素）
        this.swipeTimeThreshold = 300; // 滑动时间阈值（毫秒）
        this.playerController = null; // 玩家控制器引用
        this.leftMoving = false;
        this.rightMoving = false;
        
        this.bindEvents();
    }

    // 绑定事件监听器
    bindEvents() {
        // 鼠标点击事件
        this.canvas.addEventListener('click', (event) => {
            this.handleClick(event);
        });

        // 触摸开始事件
        this.canvas.addEventListener('touchstart', (event) => {
            event.preventDefault();
            this.handleTouchStart(event);
        });
        
        // 触摸移动事件
        this.canvas.addEventListener('touchmove', (event) => {
            event.preventDefault();
            this.handleTouchMove(event);
        });
        
        // 触摸结束事件
        this.canvas.addEventListener('touchend', (event) => {
            event.preventDefault();
            this.handleTouchEnd(event);
        });
        
        // 触摸取消事件
        this.canvas.addEventListener('touchcancel', (event) => {
            event.preventDefault();
            this.handleTouchEnd(event);
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

    // 处理触摸开始事件
    handleTouchStart = (event) => {
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // 转换为Canvas坐标
            const canvasX = (x / rect.width) * this.canvas.width;
            const canvasY = (y / rect.height) * this.canvas.height;
            
            this.touchStartX = canvasX;
            this.touchStartY = canvasY;
            this.touchStartTime = Date.now();
            this.isTouching = true;
            
            console.log(`触摸开始位置: (${Math.round(canvasX)}, ${Math.round(canvasY)})`);
            
            // 判断触摸区域
            const screenMiddle = this.canvas.width / 2;
            
            if (canvasX < screenMiddle) {
                // 左半屏：开始检测滑动
                console.log('左半屏触摸开始，准备检测滑动');
            } else {
                // 右半屏：立即投放鱼钩
                console.log('右半屏点击，投放鱼钩');
                if (this.clickCallback) {
                    this.clickCallback(canvasX, canvasY);
                }
            }
        }
    }
    
    // 处理触摸移动事件
    handleTouchMove = (event) => {
        if (!this.isTouching || event.touches.length === 0) return;
        
        const touch = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // 转换为Canvas坐标
        const canvasX = (x / rect.width) * this.canvas.width;
        const canvasY = (y / rect.height) * this.canvas.height;
        
        const screenMiddle = this.canvas.width / 2;
        
        // 只在左半屏处理滑动
        if (this.touchStartX < screenMiddle) {
            const deltaX = canvasX - this.touchStartX;
            const deltaY = canvasY - this.touchStartY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            // 如果滑动距离超过阈值，进行方向判定
            if (distance > this.swipeThreshold) {
                // 只关注X轴方向，忽略Y轴
                if (Math.abs(deltaX) > Math.abs(deltaY) * 0.5) { // X轴移动明显大于Y轴
                    if (deltaX > 0) {
                        // 向右滑动
                        this.setPlayerMovement('right', true);
                        this.setPlayerMovement('left', false);
                        console.log('检测到向右滑动');
                    } else {
                        // 向左滑动
                        this.setPlayerMovement('left', true);
                        this.setPlayerMovement('right', false);
                        console.log('检测到向左滑动');
                    }
                }
            }
        }
    }
    
    // 处理触摸结束事件
    handleTouchEnd = (event) => {
        if (!this.isTouching) return;
        
        console.log('触摸结束');
        
        // 停止所有移动
        this.setPlayerMovement('left', false);
        this.setPlayerMovement('right', false);
        
        // 重置触摸状态
        this.isTouching = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
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

    // 设置玩家控制器引用
    setPlayerController(player) {
        this.playerController = player;
    }
    
    // 设置玩家移动状态
    setPlayerMovement(direction, isMoving) {
        if (!this.playerController) return;
        
        if (direction === 'left') {
            this.leftMoving = isMoving;
            this.playerController.setKey('a', isMoving);
        } else if (direction === 'right') {
            this.rightMoving = isMoving;
            this.playerController.setKey('d', isMoving);
        }
    }
    
    // 获取当前移动状态
    getMovementState() {
        return {
            left: this.leftMoving,
            right: this.rightMoving
        };
    }
    
    // 设置滑动灵敏度
    setSwipeThreshold(threshold) {
        this.swipeThreshold = threshold;
    }
    
    // 检查是否为触屏设备
    isTouchDevice() {
        return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
    }

    // 清理事件监听器
    destroy() {
        if (this.canvas) {
            this.canvas.removeEventListener('click', this.handleClick);
            this.canvas.removeEventListener('touchstart', this.handleTouchStart);
            this.canvas.removeEventListener('touchmove', this.handleTouchMove);
            this.canvas.removeEventListener('touchend', this.handleTouchEnd);
            this.canvas.removeEventListener('touchcancel', this.handleTouchEnd);
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        }
    }
}
// 时间管理器类
class TimeManager {
    constructor() {
        this.gameTime = 0; // 游戏总时间（秒）
        this.remainingTime = 0; // 剩余时间（秒）
        this.isRunning = false;
        this.isPaused = false;
        this.timeUpCallback = null;
        
        // 时间选择对应的分钟数
        this.timeOptions = {
            1: 1,  // 1分钟 - 对应 one.png
            2: 2,  // 2分钟 - 对应 two.png  
            3: 3   // 3分钟 - 对应 three.png
        };
    }
    
    // 设置游戏时间
    setGameTime(option) {
        const minutes = this.timeOptions[option] || 3; // 默认3分钟
        this.gameTime = minutes * 60; // 转换为秒
        this.remainingTime = this.gameTime;
        console.log(`设置游戏时间: ${minutes} 分钟`);
    }
    
    // 开始计时
    start() {
        if (this.remainingTime > 0) {
            this.isRunning = true;
            this.isPaused = false;
            console.log('开始计时');
        }
    }
    
    // 暂停计时
    pause() {
        this.isPaused = true;
        console.log('暂停计时');
    }
    
    // 继续计时
    resume() {
        this.isPaused = false;
        console.log('继续计时');
    }
    
    // 停止计时
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        console.log('停止计时');
    }
    
    // 重置计时器
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.remainingTime = this.gameTime;
        console.log('重置计时器');
    }
    
    // 更新时间
    update(deltaTime) {
        if (!this.isRunning || this.isPaused || this.remainingTime <= 0) {
            return;
        }
        
        this.remainingTime -= deltaTime;
        
        // 时间到了
        if (this.remainingTime <= 0) {
            this.remainingTime = 0;
            this.isRunning = false;
            console.log('时间到！');
            
            if (this.timeUpCallback) {
                this.timeUpCallback();
            }
        }
    }
    
    // 设置时间到的回调
    setTimeUpCallback(callback) {
        this.timeUpCallback = callback;
    }
    
    // 获取剩余时间（秒）
    getRemainingTime() {
        return Math.max(0, this.remainingTime);
    }
    
    // 获取剩余时间（分:秒格式）
    getFormattedTime() {
        const totalSeconds = Math.ceil(this.getRemainingTime());
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // 获取时间进度（0-1）
    getTimeProgress() {
        if (this.gameTime === 0) return 0;
        return Math.max(0, (this.gameTime - this.remainingTime) / this.gameTime);
    }
    
    // 检查是否正在运行
    isTimerRunning() {
        return this.isRunning && !this.isPaused;
    }
    
    // 检查时间是否用完
    isTimeUp() {
        return this.remainingTime <= 0;
    }
    
    // 获取时间选项描述
    getTimeOptionDescription(option) {
        const minutes = this.timeOptions[option];
        return `${minutes} 分钟`;
    }
    
    // 添加额外时间（用于奖励等）
    addTime(seconds) {
        this.remainingTime += seconds;
        console.log(`增加 ${seconds} 秒游戏时间`);
    }
    
    // 渲染时间显示
    renderTimeDisplay(ctx) {
        if (!this.isRunning && this.remainingTime === this.gameTime) {
            return; // 游戏还未开始，不显示时间
        }
        
        // 渲染剩余时间
        ctx.save();
        ctx.fillStyle = this.remainingTime < 30 ? '#FF4444' : '#FFFFFF'; // 少于30秒时红色警告
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        
        const timeText = `剩余时间: ${this.getFormattedTime()}`;
        const x = ctx.canvas.width / 2;
        const y = 40;
        
        // 添加背景
        const textWidth = ctx.measureText(timeText).width;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x - textWidth/2 - 10, y - 25, textWidth + 20, 35);
        
        // 渲染文字
        ctx.fillStyle = this.remainingTime < 30 ? '#FF4444' : '#FFFFFF';
        ctx.fillText(timeText, x, y);
        
        // 渲染时间进度条
        this.renderTimeProgressBar(ctx);
        
        ctx.restore();
    }
    
    // 渲染时间进度条
    renderTimeProgressBar(ctx) {
        const barWidth = 200;
        const barHeight = 8;
        const x = (ctx.canvas.width - barWidth) / 2;
        const y = 55;
        
        // 背景条
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // 进度条
        const progress = this.getTimeProgress();
        const progressWidth = barWidth * progress;
        
        let progressColor = '#4CAF50'; // 绿色
        if (progress > 0.7) progressColor = '#FF9800'; // 橙色
        if (progress > 0.9) progressColor = '#F44336'; // 红色
        
        ctx.fillStyle = progressColor;
        ctx.fillRect(x, y, progressWidth, barHeight);
        
        // 边框
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
    }
}
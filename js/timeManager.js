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
    renderTimeDisplay(ctx, gameState = null, wordManager = null) {
        // 在背单词模式下显示当前单词
        if (gameState === GameState.PLAYING_WORD_MODE && wordManager) {
            this.renderWordDisplay(ctx, wordManager);
            return;
        }
        
        // 在拼单词模式下显示当前单词和拼写进度
        if (gameState === GameState.PLAYING_SPELL_MODE && wordManager) {
            this.renderSpellDisplay(ctx, wordManager);
            return;
        }
        
        // 在单词匹配模式下显示当前单词和进度
        if (gameState === GameState.PLAYING_MATCH_MODE && wordManager) {
            this.renderMatchDisplay(ctx, wordManager);
            return;
        }
        
        if (!this.isRunning && this.remainingTime === this.gameTime) {
            return; // 游戏还未开始，不显示时间
        }
        
        // 渲染剩余时间（透明背景，白色文字）
        ctx.save();
        
        // 设置文字颜色和阴影效果
        ctx.fillStyle = this.remainingTime < 30 ? '#FF4444' : '#FFFFFF'; // 少于30秒时红色警告
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        
        // 添加文字阴影效果，提升可读性
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        const timeText = `剩余时间: ${this.getFormattedTime()}`;
        const x = ctx.canvas.width / 2;
        const y = 40;
        
        // 直接渲染文字，不添加背景
        ctx.fillText(timeText, x, y);
        
        // 清除阴影效果
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // 渲染时间进度条
        this.renderTimeProgressBar(ctx);
        
        ctx.restore();
    }
    
    // 渲染单词显示（背单词模式）
    renderWordDisplay(ctx, wordManager) {
        ctx.save();
        
        // 获取当前要显示的文字
        const displayText = wordManager.getCurrentDisplayText();
        const progress = wordManager.getProgress();
        
        // 设置文字样式
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        
        // 添加文字阴影效果
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        const x = ctx.canvas.width / 2;
        const y = 40;
        
        // 显示当前单词或意思
        if (displayText) {
            ctx.fillText(displayText, x, y);
        }
        
        // 显示进度信息
        ctx.font = 'bold 18px Arial';
        const progressText = `进度: ${progress.current}/${progress.target}`;
        ctx.fillText(progressText, x, y + 35);
        
        // 清除阴影效果
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // 渲染背单词进度条
        this.renderWordProgressBar(ctx, progress);
        
        ctx.restore();
    }
    
    // 渲染拼单词显示（拼单词模式）
    renderSpellDisplay(ctx, wordManager) {
        ctx.save();
        
        const currentWord = wordManager.getCurrentWord();
        if (!currentWord) {
            ctx.restore();
            return;
        }
        
        // 设置文字样式
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        
        // 添加文字阴影效果
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        const x = ctx.canvas.width / 2;
        let y = 40;
        
        // 显示单词和意思
        ctx.fillText(`单词: ${currentWord.word}`, x, y);
        y += 35;
        ctx.fillText(`意思: ${currentWord.meaning}`, x, y);
        y += 35;
        
        // 显示拼写进度
        const progress = wordManager.getCurrentProgress();
        const spelledPart = progress.spelledLetters.join('').toUpperCase();
        const remainingPart = '_'.repeat(Math.max(0, progress.requiredLetters.length - progress.spelledLetters.length));
        const spellingProgress = `${spelledPart}${remainingPart}`;
        
        ctx.font = 'bold 24px Arial';
        ctx.fillText(`进度: ${spellingProgress}`, x, y);
        
        // 清除阴影效果
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.restore();
    }
    
    // 渲染单词匹配显示（单词匹配模式）
    renderMatchDisplay(ctx, wordManager) {
        ctx.save();
        
        const progress = wordManager.getCurrentProgress();
        
        // 检查游戏是否已完成
        if (progress.currentWordIndex >= progress.wordGroup.length) {
            // 游戏已完成，显示完成信息
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'center';
            
            // 添加文字阴影效果
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            
            const x = ctx.canvas.width / 2;
            let y = 40;
            
            ctx.fillText('游戏完成！', x, y);
            y += 35;
            
            // 显示最终进度
            const progressText = `进度: ${progress.wordGroup.length}/${progress.wordGroup.length}`;
            ctx.font = 'bold 18px Arial';
            ctx.fillText(progressText, x, y);
            
            // 清除阴影效果
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            // 渲染完成进度条（100%）
            this.renderMatchProgressBar(ctx, progress, true);
            
            ctx.restore();
            return;
        }
        
        const currentWord = wordManager.getCurrentMatchWord();
        if (!currentWord) {
            ctx.restore();
            return;
        }
        
        // 设置文字样式
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        
        // 添加文字阴影效果
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        const x = ctx.canvas.width / 2;
        let y = 40;
        
        // 显示当前需要匹配的单词
        ctx.fillText(`单词: ${currentWord.word}`, x, y);
        y += 35;
        
        // 显示进度信息（显示已完成的数量）
        const completedCount = progress.currentWordIndex;
        const totalCount = progress.wordGroup.length;
        const progressText = `进度: ${completedCount}/${totalCount}`;
        ctx.font = 'bold 18px Arial';
        ctx.fillText(progressText, x, y);
        
        // 清除阴影效果
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // 渲染匹配进度条
        this.renderMatchProgressBar(ctx, progress);
        
        ctx.restore();
    }
    
    // 渲染背单词进度条
    renderWordProgressBar(ctx, progress) {
        const barWidth = 300;
        const barHeight = 10;
        const x = (ctx.canvas.width - barWidth) / 2;
        const y = 85;
        
        // 背景条
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // 进度条
        const progressRatio = progress.current / progress.target;
        const progressWidth = barWidth * progressRatio;
        
        // 根据进度选择颜色
        let progressColor = '#4CAF50'; // 绿色
        if (progressRatio > 0.5) progressColor = '#2196F3'; // 蓝色
        if (progressRatio > 0.8) progressColor = '#FF9800'; // 橙色
        
        ctx.fillStyle = progressColor;
        ctx.fillRect(x, y, progressWidth, barHeight);
        
        // 边框
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
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
    
    // 渲染单词匹配进度条
    renderMatchProgressBar(ctx, progress, forceComplete = false) {
        const barWidth = 300;
        const barHeight = 10;
        const x = (ctx.canvas.width - barWidth) / 2;
        const y = 85;
        
        // 背景条
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // 进度条
        let progressRatio;
        if (forceComplete) {
            // 强制显示为100%完成
            progressRatio = 1.0;
        } else {
            const currentIndex = progress.currentWordIndex;
            const totalWords = progress.wordGroup.length;
            progressRatio = currentIndex / totalWords;
        }
        
        const progressWidth = barWidth * progressRatio;
        
        // 根据进度选择颜色
        let progressColor = '#4CAF50'; // 绿色
        if (progressRatio > 0.3) progressColor = '#2196F3'; // 蓝色
        if (progressRatio > 0.6) progressColor = '#FF9800'; // 橙色
        if (progressRatio > 0.8) progressColor = '#9C27B0'; // 紫色
        if (forceComplete) progressColor = '#4CAF50'; // 完成时显示绿色
        
        ctx.fillStyle = progressColor;
        ctx.fillRect(x, y, progressWidth, barHeight);
        
        // 边框
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
    }
}
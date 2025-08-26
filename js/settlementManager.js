// 游戏结算管理器类
/*
=== 快速调节参数指南 ===
如需调整白色字体效果，请在 renderSettlementText() 方法中修改以下参数：

1. fontSizeMultiplier: 字体大小倍数
   - 当前值: 1.8
   - 调节范围: 1.0-3.0
   - 数值越大字体越大

2. 各行文字位置（相对于板子顶部的百分比）
   - line1Position: 0.2 (游戏时间)
   - line2Position: 0.4 (本局分数)
   - line3Position: 0.6 (最高分数)
   - line4Position: 0.8 (捕获数量)
   - 调节范围: 0.0-1.0
   - 0.0=板子顶部, 0.5=板子中心, 1.0=板子底部

3. shadowStrength: 字体阴影强度
   - 当前值: 4
   - 调节范围: 0-10
   - 数值越大阴影越明显

=== 摇摆动画参数 ===
在构造函数中调整以下参数：

1. swingAmplitude: 摇摆幅度
   - 当前值: 0.25
   - 调节范围: 0.1-0.5
   - 数值越大摇摆角度越大

2. swingSpeed: 摇摆速度
   - 当前值: 12
   - 调节范围: 5-20
   - 数值越大摇摆越快

3. swingDuration: 摇摆时间
   - 当前值: 5000ms (5秒)
   - 调节范围: 2000-8000ms
   - 在 updateSwingAnimation() 方法中修改

4. dropDuration: 掉落时间
   - 当前值: 1000ms (1秒)
   - 调节范围: 500-2000ms
   - 使用平滑缓入缓出，无弹跳效果
   - 在 updateDropAnimation() 方法中修改
*/
class SettlementManager {
    constructor(ctx, resources) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.resources = resources;
        this.gameOverImage = null;
        
        // 动画状态
        this.animationState = 'hidden'; // hidden, dropping, swinging, stable
        this.animationStartTime = 0;
        
        // 位置和动画参数
        this.boardX = 0;
        this.boardY = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.currentAngle = 0; // 摇摆角度
        this.swingAmplitude = 0.25; // 摇摆幅度（增加从0.1到0.25）
        this.swingSpeed = 12; // 摇摆速度（增加从8刀12）
        this.swingDecay = 0.995; // 摇摆衰减（减少衰减从0.98到0.995）
        
        // 结算数据
        this.settlementData = {
            playTime: 0,
            currentScore: 0,
            highScore: 0,
            fishCaught: 0
        };
        
        this.setResources();
    }
    
    // 设置资源
    setResources() {
        if (this.resources) {
            this.gameOverImage = this.resources['gameover'];
            // console.log('SettlementManager 资源加载状态:');
            // console.log('gameover.png:', this.gameOverImage ? '加载成功' : '加载失败');
        }
    }
    
    // 开始结算动画
    startSettlement(timeOption, scoreManager, gameMode = 'amusement', wordManager = null) {
        console.log('开始游戏结算动画，接收的timeOption:', timeOption);
        console.log('游戏模式:', gameMode);
        console.log('scoreManager状态:', {
            score: scoreManager.getScore(),
            highScore: scoreManager.getHighScoreForTime(timeOption), // 使用指定时间的最高分
            fishCaught: scoreManager.getFishCaught()
        });
        
        // 保存游戏模式和结算数据
        this.gameMode = gameMode;
        this.wordManager = wordManager;
        
        if (gameMode === 'study' && wordManager) {
            // 学习模式：保存单词学习数据
            const currentWord = wordManager.getCurrentWord();
            this.settlementData = {
                playTime: timeOption,
                currentScore: scoreManager.getScore(),
                highScore: scoreManager.getHighScoreForTime(timeOption),
                fishCaught: scoreManager.getFishCaught(),
                studyMode: gameMode,
                learnedWord: currentWord ? currentWord.word : '单词',
                wordMeaning: currentWord ? currentWord.meaning : '意思',
                progress: wordManager.getProgress()
            };
        } else {
            // 娱乐模式：保存普通数据
            this.settlementData = {
                playTime: timeOption,
                currentScore: scoreManager.getScore(),
                highScore: scoreManager.getHighScoreForTime(timeOption), // 使用指定时间的最高分
                fishCaught: scoreManager.getFishCaught(),
                studyMode: 'amusement'
            };
        }
        
        console.log('保存的结算数据:', this.settlementData);
        
        // 计算目标位置（屏幕中央），图片缩小3倍
        const originalWidth = this.gameOverImage ? this.gameOverImage.width : 300;
        const originalHeight = this.gameOverImage ? this.gameOverImage.height : 200;
        const boardWidth = originalWidth / 3;  // 缩小3倍
        const boardHeight = originalHeight / 3; // 缩小3倍
        
        this.boardWidth = boardWidth;
        this.boardHeight = boardHeight;
        
        this.targetX = (this.canvas.width - boardWidth) / 2;
        this.targetY = (this.canvas.height - boardHeight) / 2;
        
        // 初始位置（屏幕上方）
        this.boardX = this.targetX;
        this.boardY = -boardHeight - 50;
        
        // 重置动画参数
        this.animationState = 'dropping';
        this.animationStartTime = Date.now();
        this.currentAngle = 0;
        this.swingAmplitude = 0.25; // 使用更大的初始摇摆幅度
        
        console.log(`[Settlement] 结算板初始化完成 - 尺寸: ${boardWidth}x${boardHeight}`);
    }
    
    // 更新动画
    update(deltaTime) {
        if (this.animationState === 'hidden') return;
        
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.animationStartTime;
        
        console.log(`[Settlement] Update - 状态: ${this.animationState}, 时间: ${elapsedTime}ms`);
        
        switch (this.animationState) {
            case 'dropping':
                this.updateDropAnimation(elapsedTime, deltaTime);
                break;
            case 'swinging':
                this.updateSwingAnimation(elapsedTime, deltaTime);
                break;
            case 'stable':
                // 动画完成，保持稳定
                break;
        }
    }
    
    // 更新掉落动画
    updateDropAnimation(elapsedTime, deltaTime) {
        const dropDuration = 1000; // 1秒掉落时间（缩短时间）
        const progress = Math.min(elapsedTime / dropDuration, 1);
        
        // 使用简单的缓入缓出函数，移除弹跳效果
        const easeInOut = (t) => {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        };
        
        const easedProgress = easeInOut(progress);
        // 使用缩放后的高度
        const scaledHeight = this.boardHeight || (this.gameOverImage ? this.gameOverImage.height / 3 : 200);
        this.boardY = this.targetY * easedProgress + (-scaledHeight - 50) * (1 - easedProgress);
        
        if (progress >= 1) {
            this.boardY = this.targetY;
            this.animationState = 'swinging';
            this.animationStartTime = Date.now();
            console.log('[Settlement] 掉落动画完成，开始摇摆动画');
        }
    }
    
    // 更新摇摆动画
    updateSwingAnimation(elapsedTime, deltaTime) {
        const swingDuration = 5000; // 5秒摇摆时间（从3秒增加到5秒）
        const progress = Math.min(elapsedTime / swingDuration, 1);
        
        // 摇摆角度计算，使用更加渐进的衰减曲线
        const decayFactor = Math.pow(1 - progress, 2); // 使用平方衰减，让初期摇摆更明显
        this.currentAngle = this.swingAmplitude * Math.sin(elapsedTime * this.swingSpeed / 1000) * decayFactor;
        
        if (progress >= 1 || Math.abs(this.currentAngle) < 0.002) {
            this.currentAngle = 0;
            this.animationState = 'stable';
            console.log('[Settlement] 摇摆动画完成，结算板稳定');
        }
    }
    
    // 渲染结算画面
    render() {
        if (this.animationState === 'hidden') {
            return;
        }
        
        this.ctx.save();
        
        // 渲染半透明背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameOverImage) {
            // 应用摇摆变换，使用缩放后的尺寸
            const scaledWidth = this.boardWidth || this.gameOverImage.width / 3;
            const scaledHeight = this.boardHeight || this.gameOverImage.height / 3;
            const centerX = this.boardX + scaledWidth / 2;
            const centerY = this.boardY + scaledHeight / 2;
            
            this.ctx.save(); // 保存当前状态
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(this.currentAngle);
            this.ctx.translate(-centerX, -centerY);
            
            // 绘制缩放后的结算板图片
            this.ctx.drawImage(this.gameOverImage, this.boardX, this.boardY, scaledWidth, scaledHeight);
            
            this.ctx.restore(); // 恢复状态
            
            // console.log(`渲染结算板: 位置(${this.boardX}, ${this.boardY}), 缩放尺寸(${scaledWidth} x ${scaledHeight}), 摇摆角度: ${this.currentAngle}`);
        } else {
            // 如果图片未加载，显示占位符
            const fallbackWidth = 300;
            const fallbackHeight = 200;
            this.ctx.fillStyle = 'rgba(139, 69, 19, 0.9)'; // 木板颜色
            this.ctx.fillRect(this.boardX, this.boardY, fallbackWidth, fallbackHeight);
            this.ctx.strokeStyle = '#8B4513';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(this.boardX, this.boardY, fallbackWidth, fallbackHeight);
            
            // console.log('使用占位符渲染结算板');
        }
        
        // 渲染结算文字信息（在变换内渲染，跟随板子摇摆）
        if (this.gameOverImage) {
            // 应用与板子相同的摇摆变换
            const scaledWidth = this.boardWidth || this.gameOverImage.width / 3;
            const scaledHeight = this.boardHeight || this.gameOverImage.height / 3;
            const centerX = this.boardX + scaledWidth / 2;
            const centerY = this.boardY + scaledHeight / 2;
            
            this.ctx.save(); // 保存当前状态
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(this.currentAngle);
            this.ctx.translate(-centerX, -centerY);
            
            // 在变换内渲染文字
            this.renderSettlementText();
            
            this.ctx.restore(); // 恢复状态
        } else {
            // 无图片时直接渲染文字
            this.renderSettlementText();
        }
        
        // 在板子外面渲染黄色提示文字（不跟随摇摆）
        this.renderContinuePrompt();
        
        this.ctx.restore();
    }
    
    // 渲染结算文字（每块木板只显示一行白色文字）
    renderSettlementText() {
        // 从摇摆阶段开始显示文字
        if (this.animationState === 'hidden' || this.animationState === 'dropping') {
            return; // 掉落时不显示文字，摇摆开始后显示
        }
        
        // 使用缩放后的尺寸计算中心位置
        const boardWidth = this.boardWidth || (this.gameOverImage ? this.gameOverImage.width / 3 : 300);
        const boardHeight = this.boardHeight || (this.gameOverImage ? this.gameOverImage.height / 3 : 200);
        
        // ========== 可调节参数区域 ==========
        // 字体大小倍数：数值越大字体越大（建议范围：1.0-3.0）
        const fontSizeMultiplier = 1.8;  // 默认1.8，可以自由调节
        
        // 每一行文字相对于板子顶部的位置（百分比，0.0-1.0）
        const line1Position = 0.37;  // 第一行：游戏时间
        const line2Position = 0.58;  // 第二行：本局分数
        const line3Position = 0.78;  // 第三行：最高分数
        const line4Position = 0.95;  // 第四行：捕获数量
        
        // 字体粗细：可选 'normal', 'bold', '900' 等
        const fontWeight = 'bold';
        
        // 字体阴影强度（0-10，数值越大阴影越明显）
        const shadowStrength = 4;
        // =====================================
        
        // 计算单块木板的高度（假设有4块木板）
        const singleBoardHeight = boardHeight / 4;
        const boardCenterX = this.boardX + boardWidth / 2;
        
        // 设置文字样式
        this.ctx.fillStyle = '#FFFFFF'; // 白色文字
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        this.ctx.shadowBlur = shadowStrength;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        // 计算字体大小：基础大小 × 倍数
        const baseFontSize = Math.min(boardWidth, singleBoardHeight) / 5; // 基础大小稍大
        const fontSize = baseFontSize * fontSizeMultiplier;
        this.ctx.font = `${fontWeight} ${Math.round(fontSize)}px Arial`;
        
        if (this.settlementData.studyMode === 'study') {
            // 学习模式：显示不同内容
            const line1Y = this.boardY + boardHeight * line1Position;
            this.ctx.fillText('背单词', boardCenterX, line1Y);
            
            const line2Y = this.boardY + boardHeight * line2Position;
            this.ctx.fillText(`单词: ${this.settlementData.learnedWord}`, boardCenterX, line2Y);
            
            const line3Y = this.boardY + boardHeight * line3Position;
            this.ctx.fillText(`意思: ${this.settlementData.wordMeaning}`, boardCenterX, line3Y);
            
            const line4Y = this.boardY + boardHeight * line4Position;
            this.ctx.fillText(`恭喜你学会了【${this.settlementData.learnedWord}】`, boardCenterX, line4Y);
        } else {
            // 娱乐模式：显示分数等信息
            // 游戏时间 - 使用单独位置参数
            const timeText = this.getTimeText(this.settlementData.playTime);
            const line1Y = this.boardY + boardHeight * line1Position;
            this.ctx.fillText(timeText, boardCenterX, line1Y);
            
            // 当局分数 - 使用单独位置参数
            const line2Y = this.boardY + boardHeight * line2Position;
            this.ctx.fillText(`本局分数: ${this.settlementData.currentScore}`, boardCenterX, line2Y);
            
            // 最高分数 - 使用单独位置参数
            const line3Y = this.boardY + boardHeight * line3Position;
            this.ctx.fillText(`最高分数: ${this.settlementData.highScore}`, boardCenterX, line3Y);
            
            // 捕获数量 - 使用单独位置参数
            const line4Y = this.boardY + boardHeight * line4Position;
            this.ctx.fillText(`捕获: ${this.settlementData.fishCaught} 条`, boardCenterX, line4Y);
        }
        
        // 清除阴影效果
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        // === 调试信息（可选，显示当前参数值） ===
        console.log(`[结算显示] 字体大小: ${Math.round(fontSize)}px, 字体倍数: ${fontSizeMultiplier}`);
        console.log(`[文字位置] 第1行: ${line1Position}, 第2行: ${line2Position}, 第3行: ${line3Position}, 第4行: ${line4Position}`);
    }
    
    // 渲染继续提示文字（放在板子外面，不跟随摇摆）
    renderContinuePrompt() {
        // 只在稳定后显示
        if (this.animationState !== 'stable') {
            return;
        }
        
        // 计算板子位置
        const boardWidth = this.boardWidth || (this.gameOverImage ? this.gameOverImage.width / 3 : 300);
        const boardHeight = this.boardHeight || (this.gameOverImage ? this.gameOverImage.height / 3 : 200);
        const boardCenterX = this.boardX + boardWidth / 2;
        const boardBottomY = this.boardY + boardHeight;
        
        // 设置黄色文字样式
        this.ctx.fillStyle = '#FFFF00'; // 黄色
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        // 让提示文字更大一些
        const fontSize = Math.min(boardWidth, boardHeight) / 12;
        this.ctx.font = `bold ${Math.round(fontSize)}px Arial`;
        
        // 在板子下方50px处显示提示
        this.ctx.fillText('点击任意位置继续', boardCenterX, boardBottomY + 50);
        
        // 清除阴影
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }
    
    // 获取时间文字
    getTimeText(timeOption) {
        console.log('getTimeText接收的timeOption:', timeOption);
        const timeTexts = {
            1: '一分钟',
            2: '两分钟', 
            3: '三分钟'
        };
        const result = timeTexts[timeOption] || '游戏结束';
        console.log('返回的时间文字:', result);
        return result;
    }
    
    // 处理点击事件
    handleClick(x, y) {
        if (this.animationState === 'stable') {
            // 结算完成，可以点击继续
            return true;
        }
        return false;
    }
    
    // 检查是否处于活跃状态
    isActive() {
        return this.animationState !== 'hidden';
    }
    
    // 隐藏结算画面
    hide() {
        this.animationState = 'hidden';
        console.log('隐藏结算画面');
    }
    
    // 检查动画是否完成
    isAnimationComplete() {
        return this.animationState === 'stable';
    }
}
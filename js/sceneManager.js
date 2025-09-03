// 场景管理器类
class SceneManager {
    constructor(ctx) {
        this.ctx = ctx;
        this.resources = null;
        this.canvas = ctx.canvas;
        this.showTouchGuide = false; // 是否显示触屏操作提示
        this.touchGuideAlpha = 0; // 触屏提示透明度
        this.touchGuideStartTime = 0; // 触屏提示开始时间
    }

    // 设置资源引用
    setResources(resources) {
        this.resources = resources;
    }

    // 渲染整个场景
    render() {
        if (!this.resources) {
            console.warn('Resources not loaded yet');
            return;
        }

        // 清空画布
        this.clearCanvas();
        
        // 渲染背景
        this.renderBackground();
        
        // 渲染触屏操作提示（如果需要）
        if (this.showTouchGuide) {
            this.renderTouchGuide();
        }
        
        // 注意：玩家现在由EntityManager管理和渲染
        
        // 可选：渲染游戏介绍人（在特定状态下）
        // this.renderGuide();
    }

    // 清空画布
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 渲染海洋背景
    renderBackground() {
        const bgImage = this.resources['background'];
        if (bgImage) {
            // 将背景图片缩放到画布大小
            this.ctx.drawImage(
                bgImage, 
                0, 0, 
                this.canvas.width, 
                this.canvas.height
            );
        } else {
            // 如果背景图片未加载，使用渐变色作为备用
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#87CEEB'); // 天蓝色
            gradient.addColorStop(0.7, '#4682B4'); // 钢蓝色
            gradient.addColorStop(1, '#191970'); // 深蓝色
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    // 渲染钓鱼者
    renderPlayer() {
        const playerImage = this.resources['player'];
        if (playerImage) {
            // 计算缩放后的尺寸
            const scaledWidth = playerImage.width * GameConfig.PLAYER_SCALE;
            const scaledHeight = playerImage.height * GameConfig.PLAYER_SCALE;
            
            // 将玩家放在上方50px处
            const playerX = 50;
            const playerY = 50;
            
            this.ctx.drawImage(playerImage, playerX, playerY, scaledWidth, scaledHeight);
        }
    }

    // 渲染游戏介绍人（可选）
    renderGuide() {
        const guideImage = this.resources['guide'];
        if (guideImage) {
            // 将介绍人放在右上角
            const guideX = this.canvas.width - guideImage.width - 20;
            const guideY = 20;
            
            this.ctx.drawImage(guideImage, guideX, guideY);
        }
    }

    // 渲染水波效果（可选装饰）
    renderWaterEffect() {
        const time = Date.now() * 0.001;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            const y = this.canvas.height * 0.8 + Math.sin(time + i) * 10;
            
            for (let x = 0; x <= this.canvas.width; x += 20) {
                const waveY = y + Math.sin((x * 0.01) + time + i) * 5;
                if (x === 0) {
                    this.ctx.moveTo(x, waveY);
                } else {
                    this.ctx.lineTo(x, waveY);
                }
            }
            this.ctx.stroke();
        }
    }

    // 渲染触屏操作提示
    renderTouchGuide() {
        const currentTime = Date.now();
        const elapsed = currentTime - this.touchGuideStartTime;
        const fadeDuration = 3000; // 3秒淡出
        
        // 计算透明度（3秒后开始淡出）
        if (elapsed < fadeDuration) {
            this.touchGuideAlpha = 0.6;
        } else {
            const fadeElapsed = elapsed - fadeDuration;
            const fadeTime = 2000; // 2秒淡出时间
            this.touchGuideAlpha = Math.max(0, 0.6 - (fadeElapsed / fadeTime) * 0.6);
            
            // 完全淡出后隐藏提示
            if (this.touchGuideAlpha <= 0) {
                this.showTouchGuide = false;
                return;
            }
        }
        
        this.ctx.save();
        this.ctx.globalAlpha = this.touchGuideAlpha;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // 绘制左半屏提示（滑动控制区域）
        this.ctx.fillStyle = 'rgba(0, 150, 255, 0.3)';
        this.ctx.fillRect(0, 0, centerX, this.canvas.height);
        
        // 绘制右半屏提示（点击投放区域）
        this.ctx.fillStyle = 'rgba(255, 150, 0, 0.3)';
        this.ctx.fillRect(centerX, 0, centerX, this.canvas.height);
        
        // 绘制分割线
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, 0);
        this.ctx.lineTo(centerX, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 绘制文字说明
        this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // 左侧说明
        const leftText1 = '滑动控制';
        const leftText2 = '左右移动';
        this.ctx.strokeText(leftText1, centerX / 2, centerY - 30);
        this.ctx.fillText(leftText1, centerX / 2, centerY - 30);
        this.ctx.strokeText(leftText2, centerX / 2, centerY + 10);
        this.ctx.fillText(leftText2, centerX / 2, centerY + 10);
        
        // 右侧说明
        const rightText1 = '点击投放';
        const rightText2 = '鱼钩深度';
        this.ctx.strokeText(rightText1, centerX + centerX / 2, centerY - 30);
        this.ctx.fillText(rightText1, centerX + centerX / 2, centerY - 30);
        this.ctx.strokeText(rightText2, centerX + centerX / 2, centerY + 10);
        this.ctx.fillText(rightText2, centerX + centerX / 2, centerY + 10);
        
        // 绘制手势图标
        this.renderSwipeIcon(centerX / 2, centerY + 80);
        this.renderTapIcon(centerX + centerX / 2, centerY + 80);
        
        this.ctx.restore();
    }
    
    // 绘制滑动图标
    renderSwipeIcon(x, y) {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        
        // 绘制左右箭头
        const arrowSize = 25;
        
        // 左箭头
        this.ctx.beginPath();
        this.ctx.moveTo(x - arrowSize, y);
        this.ctx.lineTo(x - arrowSize / 2, y - arrowSize / 3);
        this.ctx.moveTo(x - arrowSize, y);
        this.ctx.lineTo(x - arrowSize / 2, y + arrowSize / 3);
        this.ctx.stroke();
        
        // 右箭头
        this.ctx.beginPath();
        this.ctx.moveTo(x + arrowSize, y);
        this.ctx.lineTo(x + arrowSize / 2, y - arrowSize / 3);
        this.ctx.moveTo(x + arrowSize, y);
        this.ctx.lineTo(x + arrowSize / 2, y + arrowSize / 3);
        this.ctx.stroke();
        
        // 中间连线
        this.ctx.beginPath();
        this.ctx.moveTo(x - arrowSize / 2, y);
        this.ctx.lineTo(x + arrowSize / 2, y);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    // 绘制点击图标
    renderTapIcon(x, y) {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 3;
        
        // 绘制圆圈（手指点击效果）
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // 绘制点击波纹效果
        const time = Date.now() * 0.005;
        for (let i = 0; i < 3; i++) {
            const radius = 25 + Math.sin(time + i * 0.5) * 10;
            const alpha = 0.5 - (radius - 25) / 20;
            if (alpha > 0) {
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(x, y, radius, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }
        
        this.ctx.restore();
    }
    
    // 显示触屏操作提示
    showTouchGuideHint() {
        // 检查是否为触屏设备
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
        
        if (isTouchDevice) {
            this.showTouchGuide = true;
            this.touchGuideStartTime = Date.now();
            console.log('显示触屏操作提示');
        }
    }
    
    // 隐藏触屏操作提示
    hideTouchGuideHint() {
        this.showTouchGuide = false;
        this.touchGuideAlpha = 0;
    }
}
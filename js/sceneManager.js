// 场景管理器类
class SceneManager {
    constructor(ctx) {
        this.ctx = ctx;
        this.resources = null;
        this.canvas = ctx.canvas;
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

    // 获取画布尺寸
    getCanvasSize() {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }
}
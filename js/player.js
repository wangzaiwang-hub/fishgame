// 玩家实体类
class Player extends Entity {
    constructor(x, y, resources) {
        super(x, y, 100, 150); // 假设玩家大小
        this.resources = resources;
        this.image = null;
        this.speed = GameConfig.PLAYER_SPEED;
        this.keys = {
            left: false,
            right: false
        };
        this.setImage();
    }

    // 设置玩家图片
    setImage() {
        if (this.resources) {
            this.image = this.resources['player'];
            
            // 如果图片加载成功，更新实际尺寸（应用缩放）
            if (this.image) {
                this.width = this.image.width * GameConfig.PLAYER_SCALE;
                this.height = this.image.height * GameConfig.PLAYER_SCALE;
            }
        }
    }

    // 更新玩家位置
    update(deltaTime) {
        if (!this.active) return;
        
        // 处理左右移动
        if (this.keys.left) {
            this.x -= this.speed * deltaTime;
        }
        if (this.keys.right) {
            this.x += this.speed * deltaTime;
        }
        
        // 限制玩家在屏幕范围内
        this.x = Math.max(0, Math.min(this.x, GameConfig.CANVAS_WIDTH - this.width));
    }

    // 渲染玩家
    render(ctx) {
        if (!this.active || !this.image) return;
        
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    // 设置按键状态
    setKey(key, pressed) {
        switch(key.toLowerCase()) {
            case 'a':
            case 'arrowleft':
                this.keys.left = pressed;
                break;
            case 'd':
            case 'arrowright':
                this.keys.right = pressed;
                break;
        }
    }

    // 获取鱼钩投放起始位置
    getHookStartPosition() {
        return {
            x: this.x + this.width * 0.85, // 从玩家右上角方向投放
            y: this.y + this.height * 0.2  // 从玩家上半身投放
        };
    }
}
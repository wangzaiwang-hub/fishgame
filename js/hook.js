// 鱼钩实体类
class Hook extends Entity {
    constructor(startX, startY, player = null) {
        super(startX, startY, 10, 10); // 鱼钩的大小
        
        this.startX = startX;
        this.startY = startY;
        this.targetX = startX;
        this.targetY = startY;
        this.state = 'idle'; // idle, casting, returning
        this.speed = GameConfig.HOOK_SPEED;
        this.lineLength = 0;
        this.maxLineLength = 0;
        this.player = player; // 引用玩家对象
    }

    // 投放鱼钩（竖直落下）
    cast(targetX, targetY) {
        if (this.state !== 'idle') return false;
        
        // 鱼钩竖直落下，X坐标保持不变
        this.targetX = this.startX;
        this.targetY = targetY;
        this.state = 'casting';
        
        // 计算最大线长（只考虑垂直距离）
        this.maxLineLength = Math.abs(targetY - this.startY);
        this.lineLength = 0;
        
        console.log(`鱼钩竖直投放到深度: ${targetY}`);
        return true;
    }

    // 更新鱼钩状态
    update(deltaTime) {
        if (!this.active) return;
        
        // 实时更新起始位置为玩家当前位置（所有状态下）
        if (this.player) {
            const hookPos = this.player.getHookStartPosition();
            this.startX = hookPos.x;
            this.startY = hookPos.y;
            
            // 如果鱼钩处于idle状态，同时更新鱼钩位置
            if (this.state === 'idle') {
                this.x = hookPos.x;
                this.y = hookPos.y;
            }
        }
        
        switch (this.state) {
            case 'casting':
                this.updateCasting(deltaTime);
                break;
            case 'returning':
                this.updateReturning(deltaTime);
                break;
        }
    }

    // 更新投放状态（竖直下降）
    updateCasting(deltaTime) {
        // 竖直下降
        const moveDistance = this.speed * deltaTime;
        this.y += moveDistance;
        this.lineLength += moveDistance;
        
        // 检查是否到达目标深度
        if (this.y >= this.targetY || this.lineLength >= this.maxLineLength) {
            this.y = this.targetY;
            this.state = 'returning';
            
            // 在目标位置停留一小段时间
            setTimeout(() => {
                if (this.state === 'returning') {
                    // 开始返回
                }
            }, 200);
        }
    }

    // 更新返回状态
    updateReturning(deltaTime) {
        const dx = this.startX - this.x;
        const dy = this.startY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= 5) {
            // 返回到起始位置，重置为idle状态
            this.x = this.startX;
            this.y = this.startY;
            this.state = 'idle';
            this.lineLength = 0;
            return;
        }
        
        // 计算返回方向
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        // 移动鱼钩
        const moveDistance = this.speed * deltaTime;
        this.x += dirX * moveDistance;
        this.y += dirY * moveDistance;
        this.lineLength = Math.max(0, this.lineLength - moveDistance);
    }

    // 渲染鱼钩和钓鱼线
    render(ctx) {
        if (!this.active) return;
        
        // 绘制钓鱼线（连接到鱼钩中心）
        if (this.state !== 'idle') {
            ctx.strokeStyle = '#8B4513'; // 棕色线
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.startX, this.startY);
            ctx.lineTo(this.x + this.width/2, this.y + this.height/2); // 连接到鱼钩中心
            ctx.stroke();
        }
        
        // 只在非idle状态下绘制鱼钩
        if (this.state !== 'idle') {
            // 绘制鱼钩主体
            ctx.fillStyle = '#C0C0C0'; // 银色鱼钩
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // 绘制鱼钩的钩子部分
            ctx.strokeStyle = '#C0C0C0';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2 + 3, 2, 0, Math.PI);
            ctx.stroke();
        }
        
        // 调试：绘制碰撞框
        if (false) { // 设为true来显示碰撞框
            ctx.strokeStyle = 'blue';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }

    // 检查鱼钩是否处于活跃状态（正在移动）
    isActive() {
        return this.state !== 'idle';
    }

    // 获取鱼钩状态
    getState() {
        return this.state;
    }

    // 强制返回
    forceReturn() {
        if (this.state === 'casting') {
            this.state = 'returning';
        }
    }

    // 重置鱼钩到起始位置
    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.state = 'idle';
        this.lineLength = 0;
    }

    // 检查是否与鱼类碰撞
    checkCollisionWithFish(fish) {
        if (this.state === 'idle' || !fish.active) return false;
        
        const hookBounds = this.getBounds();
        const fishBounds = fish.getBounds();
        
        return !(hookBounds.right < fishBounds.left || 
                hookBounds.left > fishBounds.right || 
                hookBounds.bottom < fishBounds.top || 
                hookBounds.top > fishBounds.bottom);
    }
}
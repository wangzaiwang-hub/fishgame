// 实体基类
class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.active = true;
    }

    // 更新实体状态
    update(deltaTime) {
        // 子类重写此方法
    }

    // 渲染实体
    render(ctx) {
        // 子类重写此方法
    }

    // 获取边界框用于碰撞检测
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }

    // 检查是否在屏幕范围内
    isInBounds(canvasWidth, canvasHeight) {
        const bounds = this.getBounds();
        return bounds.right >= 0 && 
               bounds.left <= canvasWidth && 
               bounds.bottom >= 0 && 
               bounds.top <= canvasHeight;
    }

    // 销毁实体
    destroy() {
        this.active = false;
    }
}
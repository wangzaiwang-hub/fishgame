// 鱼类实体类
class Fish extends Entity {
    constructor(x, y, type, direction, speed, resources) {
        // 假设鱼的大小，实际会根据图片调整
        super(x, y, 60, 40);
        
        this.type = type; // 鱼的类型 (1-15)
        this.direction = direction; // 移动方向 (1为右，-1为左)
        this.speed = speed; // 移动速度
        this.resources = resources;
        this.image = null;
        this.score = this.calculateScore();
        this.scale = GameConfig.FISH_SCALE; // 缩放比例
        
        // 上下移动相关属性
        this.verticalSpeed = (Math.random() - 0.5) * 30; // 随机垂直速度
        this.verticalAmplitude = 20 + Math.random() * 30; // 上下移动幅度
        this.verticalTime = Math.random() * Math.PI * 2; // 随机起始相位
        this.baseY = y; // 基础Y位置
        
        // 设置鱼的图片
        this.setImage();
    }

    // 设置鱼的图片
    setImage() {
        if (this.resources) {
            this.image = this.resources[`fish_${this.type}`];
            
            // 如果图片加载成功，更新实际尺寸（应用缩放）
            if (this.image) {
                this.width = this.image.width * this.scale;
                this.height = this.image.height * this.scale;
            }
        }
    }

    // 计算鱼的分数
    calculateScore() {
        // 根据鱼的类型计算分数
        if (this.type >= 1 && this.type <= 10) {
            // 右游鱼类
            return 10 + (this.type - 1) * 10; // 10-100分
        } else if (this.type >= 11 && this.type <= 15) {
            // 左游鱼类
            return 20 + (this.type - 11) * 15; // 20-80分
        }
        return 10; // 默认分数
    }

    // 重写getBounds方法，提供更小的碰撞区域
    getBounds() {
        // 碰撞区域比图片小20%（每边缩小10%）
        const margin = 0.15; // 10%边距
        const actualWidth = this.width * (1 - margin * 2);
        const actualHeight = this.height * (1 - margin * 2);
        const offsetX = this.width * margin;
        const offsetY = this.height * margin;
        
        return {
            x: this.x + offsetX,
            y: this.y + offsetY,
            width: actualWidth,
            height: actualHeight,
            left: this.x + offsetX,
            right: this.x + offsetX + actualWidth,
            top: this.y + offsetY,
            bottom: this.y + offsetY + actualHeight
        };
    }

    // 更新鱼的位置
    update(deltaTime) {
        if (!this.active) return;
        
        // 水平移动
        this.x += this.direction * this.speed * deltaTime;
        
        // 垂直移动（上下波动）
        this.verticalTime += deltaTime;
        this.y = this.baseY + Math.sin(this.verticalTime) * this.verticalAmplitude;
        
        // 限制鱼在水域范围内（最高230px）
        this.y = Math.max(230, Math.min(this.y, GameConfig.CANVAS_HEIGHT - 50 - this.height));
        
        // 检查是否超出屏幕边界
        if (this.direction > 0) {
            // 向右游的鱼，检查右边界
            if (this.x > GameConfig.CANVAS_WIDTH + this.width) {
                this.destroy();
            }
        } else {
            // 向左游的鱼，检查左边界
            if (this.x < -this.width) {
                this.destroy();
            }
        }
    }

    // 渲染鱼类
    render(ctx) {
        if (!this.active || !this.image) return;
        
        // 所有鱼类图片都不翻转，保持原始朝向
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        
        // 调试：绘制边界框（可选）
        if (false) { // 设为true来显示碰撞框
            // 绘制图片边界（红色）
            ctx.strokeStyle = 'red';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            // 绘制实际碰撞区域（绿色）
            const bounds = this.getBounds();
            ctx.strokeStyle = 'green';
            ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        }
    }

    // 获取分数
    getScore() {
        return this.score;
    }

    // 被捕获时的处理
    onCaught() {
        this.destroy();
        // 可以在这里添加被捕获的特效
        console.log(`捕获了类型${this.type}的鱼，获得${this.score}分！`);
    }

    // 检查是否与点击位置碰撞
    isClickedAt(x, y) {
        const bounds = this.getBounds();
        return x >= bounds.left && 
               x <= bounds.right && 
               y >= bounds.top && 
               y <= bounds.bottom;
    }

    // 静态方法：创建随机鱼类
    static createRandomFish(resources, canvasWidth, canvasHeight) {
        // 随机选择鱼的类型和方向
        const isRightFish = Math.random() < 0.6; // 60%概率是右游鱼
        
        let type, direction, x, y;
        
        if (isRightFish) {
            // 右游鱼 (1-10)：从左到右移动
            type = FishConfig.RIGHT_FISH.types[
                Math.floor(Math.random() * FishConfig.RIGHT_FISH.types.length)
            ];
            direction = FishConfig.RIGHT_FISH.direction; // direction = 1
            x = -100; // 从左侧屏幕外开始
            console.log(`创建右游鱼：类型${type}，方向${direction}`);
        } else {
            // 左游鱼 (11-15)：从右到左移动
            type = FishConfig.LEFT_FISH.types[
                Math.floor(Math.random() * FishConfig.LEFT_FISH.types.length)
            ];
            direction = FishConfig.LEFT_FISH.direction; // direction = -1
            x = canvasWidth + 100; // 从右侧屏幕外开始
            console.log(`创建左游鱼：类型${type}，方向${direction}`);
        }
        
        // 随机Y位置（从230px到背景图底部）
        y = Math.random() * (canvasHeight - 230 - 50) + 230; // 230px到底部留50px边距
        
        // 随机速度
        const minSpeed = GameConfig.FISH_MIN_SPEED;
        const maxSpeed = GameConfig.FISH_MAX_SPEED;
        const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
        
        return new Fish(x, y, type, direction, speed, resources);
    }
}
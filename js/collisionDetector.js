// 碰撞检测器类
class CollisionDetector {
    constructor() {
        this.collisionCallbacks = [];
    }

    // 检查所有碰撞
    checkCollisions(entityManager) {
        const fishes = entityManager.getFishes();
        const hooks = entityManager.getHooks();
        
        // 检查鱼钩与鱼类的碰撞
        this.checkHookFishCollisions(hooks, fishes);
    }

    // 检查鱼钩与鱼类的碰撞
    checkHookFishCollisions(hooks, fishes) {
        for (let hook of hooks) {
            if (!hook.isActive()) continue;
            
            for (let fish of fishes) {
                if (!fish.active) continue;
                
                if (this.checkAABBCollision(hook, fish)) {
                    this.handleHookFishCollision(hook, fish);
                }
            }
        }
    }

    // AABB (轴对齐边界框) 碰撞检测
    checkAABBCollision(entity1, entity2) {
        const bounds1 = entity1.getBounds();
        const bounds2 = entity2.getBounds();
        
        return !(bounds1.right < bounds2.left || 
                bounds1.left > bounds2.right || 
                bounds1.bottom < bounds2.top || 
                bounds1.top > bounds2.bottom);
    }

    // 圆形碰撞检测（更精确）
    checkCircleCollision(entity1, entity2) {
        const center1X = entity1.x + entity1.width / 2;
        const center1Y = entity1.y + entity1.height / 2;
        const center2X = entity2.x + entity2.width / 2;
        const center2Y = entity2.y + entity2.height / 2;
        
        const dx = center1X - center2X;
        const dy = center1Y - center2Y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const radius1 = Math.min(entity1.width, entity1.height) / 2;
        const radius2 = Math.min(entity2.width, entity2.height) / 2;
        
        return distance < (radius1 + radius2);
    }

    // 处理鱼钩与鱼类的碰撞
    handleHookFishCollision(hook, fish) {
        console.log(`鱼钩碰撞到鱼类！类型: ${fish.type}, 分数: ${fish.getScore()}`);
        
        // 触发鱼类被捕获
        fish.onCaught();
        
        // 让鱼钩开始返回
        hook.forceReturn();
        
        // 准备碰撞数据
        let collisionData = {
            hook: hook,
            fish: fish,
            score: fish.getScore()
        };
        
        // 如果是背单词模式，添加单词相关数据
        if (fish.wordData) {
            collisionData.wordData = fish.wordData;
            collisionData.isCorrect = fish.wordData.isCorrect;
            console.log(`背单词模式碰撞：答案${fish.wordData.isCorrect ? '正确' : '错误'}`);
        }
        
        // 触发碰撞回调
        this.triggerCollisionCallbacks('hook-fish', collisionData);
    }

    // 添加碰撞回调
    addCollisionCallback(callback) {
        this.collisionCallbacks.push(callback);
    }

    // 移除碰撞回调
    removeCollisionCallback(callback) {
        const index = this.collisionCallbacks.indexOf(callback);
        if (index > -1) {
            this.collisionCallbacks.splice(index, 1);
        }
    }

    // 触发碰撞回调
    triggerCollisionCallbacks(type, data) {
        this.collisionCallbacks.forEach(callback => {
            try {
                callback(type, data);
            } catch (error) {
                console.error('碰撞回调执行出错:', error);
            }
        });
    }

    // 检查点与实体的碰撞
    checkPointEntityCollision(x, y, entity) {
        const bounds = entity.getBounds();
        return x >= bounds.left && 
               x <= bounds.right && 
               y >= bounds.top && 
               y <= bounds.bottom;
    }

    // 检查线段与矩形的碰撞
    checkLineRectCollision(x1, y1, x2, y2, rect) {
        // 简化的线段与矩形碰撞检测
        const bounds = rect.getBounds();
        
        // 检查线段端点是否在矩形内
        if (this.checkPointEntityCollision(x1, y1, rect) || 
            this.checkPointEntityCollision(x2, y2, rect)) {
            return true;
        }
        
        // 检查线段是否与矩形边相交
        return this.lineIntersectsRect(x1, y1, x2, y2, bounds);
    }

    // 线段与矩形相交检测
    lineIntersectsRect(x1, y1, x2, y2, rect) {
        // 检查线段是否与矩形的四条边相交
        return this.lineIntersectsLine(x1, y1, x2, y2, rect.left, rect.top, rect.right, rect.top) ||
               this.lineIntersectsLine(x1, y1, x2, y2, rect.right, rect.top, rect.right, rect.bottom) ||
               this.lineIntersectsLine(x1, y1, x2, y2, rect.right, rect.bottom, rect.left, rect.bottom) ||
               this.lineIntersectsLine(x1, y1, x2, y2, rect.left, rect.bottom, rect.left, rect.top);
    }

    // 两条线段相交检测
    lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (denom === 0) return false;
        
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
        
        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }

    // 清理碰撞检测器
    clear() {
        this.collisionCallbacks = [];
    }
}
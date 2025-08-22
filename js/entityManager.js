// 实体管理器类
class EntityManager {
    constructor() {
        this.entities = [];
        this.fishes = [];
        this.hooks = [];
        this.lastFishSpawn = 0;
        this.resources = null;
    }

    // 设置资源引用
    setResources(resources) {
        this.resources = resources;
    }

    // 添加实体
    addEntity(entity) {
        this.entities.push(entity);
        
        // 根据类型分类存储
        if (entity instanceof Fish) {
            this.fishes.push(entity);
        } else if (entity instanceof Hook) {
            this.hooks.push(entity);
        }
        // Player类型只存储在主entities数组中
    }

    // 移除实体
    removeEntity(entity) {
        // 从主列表移除
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }

        // 从分类列表移除
        if (entity instanceof Fish) {
            const fishIndex = this.fishes.indexOf(entity);
            if (fishIndex > -1) {
                this.fishes.splice(fishIndex, 1);
            }
        } else if (entity instanceof Hook) {
            const hookIndex = this.hooks.indexOf(entity);
            if (hookIndex > -1) {
                this.hooks.splice(hookIndex, 1);
            }
        }
    }

    // 生成新鱼类
    spawnFish() {
        if (!this.resources) return;
        
        // 检查是否达到最大鱼类数量
        if (this.fishes.length >= GameConfig.MAX_FISH_COUNT) {
            return;
        }

        const fish = Fish.createRandomFish(
            this.resources, 
            GameConfig.CANVAS_WIDTH, 
            GameConfig.CANVAS_HEIGHT
        );
        
        this.addEntity(fish);
        console.log(`生成了新鱼类，类型: ${fish.type}, 方向: ${fish.direction > 0 ? '右' : '左'}`);
    }

    // 更新所有实体
    update(deltaTime) {
        const currentTime = Date.now();
        
        // 检查是否需要生成新鱼类
        if (currentTime - this.lastFishSpawn > GameConfig.FISH_SPAWN_RATE) {
            this.spawnFish();
            this.lastFishSpawn = currentTime;
        }

        // 更新所有实体
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            
            if (entity.active) {
                entity.update(deltaTime);
            } else {
                // 移除非活跃实体
                this.removeEntity(entity);
            }
        }
    }

    // 渲染所有实体
    render(ctx) {
        // 按层级渲染：先玩家，然后鱼类，最后鱼钩
        this.entities.forEach(entity => {
            if (entity.active && entity instanceof Player) {
                entity.render(ctx);
            }
        });

        this.fishes.forEach(fish => {
            if (fish.active) {
                fish.render(ctx);
            }
        });

        this.hooks.forEach(hook => {
            if (hook.active) {
                hook.render(ctx);
            }
        });
    }

    // 获取所有鱼类
    getFishes() {
        return this.fishes.filter(fish => fish.active);
    }

    // 获取所有鱼钩
    getHooks() {
        return this.hooks.filter(hook => hook.active);
    }

    // 获取指定位置的鱼类
    getFishAt(x, y) {
        for (let fish of this.fishes) {
            if (fish.active && fish.isClickedAt(x, y)) {
                return fish;
            }
        }
        return null;
    }

    // 清空所有实体
    clear() {
        this.entities = [];
        this.fishes = [];
        this.hooks = [];
        this.lastFishSpawn = 0;
    }

    // 获取实体数量统计
    getStats() {
        return {
            total: this.entities.length,
            fishes: this.fishes.length,
            hooks: this.hooks.length,
            activeFishes: this.fishes.filter(f => f.active).length,
            activeHooks: this.hooks.filter(h => h.active).length
        };
    }

    // 强制生成鱼类（用于测试）
    forceSpawnFish() {
        this.spawnFish();
    }
}
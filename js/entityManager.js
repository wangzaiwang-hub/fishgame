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
    spawnFish(wordManager = null) {
        if (!this.resources) return;
        
        // 检查是否达到最大鱼类数量
        if (this.fishes.length >= GameConfig.MAX_FISH_COUNT) {
            return;
        }

        let fish;
        
        if (wordManager && wordManager.words.length > 0) {
            const studyMode = wordManager.getCurrentStudyMode();
            
            if (studyMode === 'beidanci') {
                // 背单词模式：所有鱼都显示相同内容
                const wordData = wordManager.getRandomWordForFish();
                
                fish = Fish.createRandomFish(
                    this.resources, 
                    GameConfig.CANVAS_WIDTH, 
                    GameConfig.CANVAS_HEIGHT,
                    wordData
                );
                
                console.log(`生成背单词鱼类：类型${fish.type}, 方向${fish.direction > 0 ? '右' : '左'}, 内容: "${wordData?.displayText}", 是否正确: ${wordData?.isCorrect}`);
            } else if (studyMode === 'pindanci') {
                // 拼单词模式：生成26个字母鱼
                this.spawnLetterFish(wordManager);
                return;
            } else if (studyMode === 'dancipipei') {
                // 单词匹配模式：生成带有意思的鱼
                this.spawnMeaningFish(wordManager);
                return;
            } else {
                // 其他学习模式
                fish = Fish.createRandomFish(
                    this.resources, 
                    GameConfig.CANVAS_WIDTH, 
                    GameConfig.CANVAS_HEIGHT
                );
            }
        } else {
            // 普通模式：生成没有单词数据的鱼类
            fish = Fish.createRandomFish(
                this.resources, 
                GameConfig.CANVAS_WIDTH, 
                GameConfig.CANVAS_HEIGHT
            );
            
            console.log(`生成普通鱼类：类型${fish.type}, 方向${fish.direction > 0 ? '右' : '左'}`);
        }
        
        if (fish) {
            this.addEntity(fish);
        }
    }
    
    // 生成字母鱼（拼单词模式）
    spawnLetterFish(wordManager) {
        // 获取下一个需要的字母
        const correctLetterData = wordManager.getLetterForFish();
        if (!correctLetterData) {
            console.log('拼单词已完成，不再生成字母鱼');
            return;
        }
        
        // 生成正确的字母鱼
        const correctFish = Fish.createRandomFish(
            this.resources,
            GameConfig.CANVAS_WIDTH,
            GameConfig.CANVAS_HEIGHT,
            correctLetterData
        );
        this.addEntity(correctFish);
        console.log(`生成正确字母鱼: ${correctLetterData.displayText}`);
        
        // 生成随机字母鱼作为干扰项（数量可调整）
        const distractorCount = Math.floor(Math.random() * 3) + 2; // 2-4个干扰项
        for (let i = 0; i < distractorCount; i++) {
            if (this.fishes.length >= GameConfig.MAX_FISH_COUNT) break;
            
            const distractorData = wordManager.getRandomLetterForFish();
            if (distractorData) {
                const distractorFish = Fish.createRandomFish(
                    this.resources,
                    GameConfig.CANVAS_WIDTH,
                    GameConfig.CANVAS_HEIGHT,
                    distractorData
                );
                this.addEntity(distractorFish);
                console.log(`生成干扰字母鱼: ${distractorData.displayText}`);
            }
        }
    }
    
    // 生成意思鱼（单词匹配模式）
    spawnMeaningFish(wordManager) {
        // 检查当前屏幕上正确答案鱼的数量
        const correctFishCount = this.getCorrectAnswerFishCount();
        const totalFishCount = this.fishes.length;
        
        console.log(`当前屏幕状态: 总鱼数=${totalFishCount}, 正确答案鱼数=${correctFishCount}`);
        
        // 如果正确答案鱼少于2条，优先生成正确答案鱼
        if (correctFishCount < 2) {
            const correctMeaningData = wordManager.getCorrectMeaningForFish();
            if (correctMeaningData) {
                const correctFish = Fish.createRandomFish(
                    this.resources,
                    GameConfig.CANVAS_WIDTH,
                    GameConfig.CANVAS_HEIGHT,
                    correctMeaningData
                );
                this.addEntity(correctFish);
                console.log(`生成正确答案鱼: "${correctMeaningData.displayText}"`);
                return;
            }
        }
        
        // 否则生成随机意思鱼（可能是正确答案，也可能是干扰项）
        const meaningData = wordManager.getRandomWordForFish();
        if (!meaningData) {
            console.log('单词匹配模式：没有可用的意思数据');
            return;
        }
        
        const meaningFish = Fish.createRandomFish(
            this.resources,
            GameConfig.CANVAS_WIDTH,
            GameConfig.CANVAS_HEIGHT,
            meaningData
        );
        
        this.addEntity(meaningFish);
        console.log(`生成单词匹配鱼: "${meaningData.displayText}", 是否正确: ${meaningData.isCorrect}`);
    }
    
    // 获取当前屏幕上正确答案鱼的数量
    getCorrectAnswerFishCount() {
        return this.fishes.filter(fish => 
            fish.active && 
            fish.wordData && 
            fish.wordData.isCorrect === true
        ).length;
    }

    // 更新所有实体
    update(deltaTime, wordManager = null) {
        const currentTime = Date.now();
        
        // 检查是否需要生成新鱼类
        if (currentTime - this.lastFishSpawn > GameConfig.FISH_SPAWN_RATE) {
            this.spawnFish(wordManager);
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
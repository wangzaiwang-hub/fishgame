// 分数管理器类
class ScoreManager {
    constructor() {
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.fishCaught = 0;
        this.scoreCallbacks = [];
        this.recentScores = []; // 最近获得的分数，用于动画效果
    }

    // 添加分数
    addScore(points, fishType = null) {
        if (points <= 0) return;
        
        this.score += points;
        this.fishCaught++;
        
        // 记录最近分数用于动画
        this.recentScores.push({
            points: points,
            timestamp: Date.now(),
            fishType: fishType
        });
        
        // 检查是否创造新纪录
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            console.log(`新纪录！当前最高分: ${this.highScore}`);
        }
        
        console.log(`获得 ${points} 分！当前总分: ${this.score}`);
        
        // 触发分数更新回调
        this.triggerScoreCallbacks();
        
        // 更新UI
        this.updateScoreDisplay();
    }

    // 获取当前分数
    getScore() {
        return this.score;
    }

    // 获取最高分
    getHighScore() {
        return this.highScore;
    }

    // 获取捕获的鱼类数量
    getFishCaught() {
        return this.fishCaught;
    }

    // 重置分数
    reset() {
        this.score = 0;
        this.fishCaught = 0;
        this.recentScores = [];
        this.updateScoreDisplay();
        this.triggerScoreCallbacks();
    }

    // 根据鱼类类型计算分数
    calculateFishScore(fishType) {
        // 基础分数配置
        const baseScores = {
            // 右游鱼类 (1-10)
            1: 10, 2: 15, 3: 20, 4: 25, 5: 30,
            6: 35, 7: 40, 8: 45, 9: 50, 10: 60,
            // 左游鱼类 (11-15) - 通常更难捕获，分数更高
            11: 70, 12: 80, 13: 90, 14: 100, 15: 120
        };
        
        return baseScores[fishType] || 10;
    }

    // 保存最高分到本地存储
    saveHighScore() {
        try {
            localStorage.setItem('fishingGameHighScore', this.highScore.toString());
        } catch (error) {
            console.warn('无法保存最高分:', error);
        }
    }

    // 从本地存储加载最高分
    loadHighScore() {
        try {
            const saved = localStorage.getItem('fishingGameHighScore');
            return saved ? parseInt(saved, 10) : 0;
        } catch (error) {
            console.warn('无法加载最高分:', error);
            return 0;
        }
    }

    // 更新分数显示
    updateScoreDisplay() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = `分数: ${this.score}`;
        }
    }

    // 添加分数更新回调
    addScoreCallback(callback) {
        this.scoreCallbacks.push(callback);
    }

    // 移除分数更新回调
    removeScoreCallback(callback) {
        const index = this.scoreCallbacks.indexOf(callback);
        if (index > -1) {
            this.scoreCallbacks.splice(index, 1);
        }
    }

    // 触发分数更新回调
    triggerScoreCallbacks() {
        this.scoreCallbacks.forEach(callback => {
            try {
                callback(this.score, this.fishCaught);
            } catch (error) {
                console.error('分数回调执行出错:', error);
            }
        });
    }

    // 获取游戏统计信息
    getStats() {
        return {
            currentScore: this.score,
            highScore: this.highScore,
            fishCaught: this.fishCaught,
            averageScore: this.fishCaught > 0 ? Math.round(this.score / this.fishCaught) : 0
        };
    }

    // 渲染分数动画效果
    renderScoreAnimations(ctx) {
        const currentTime = Date.now();
        
        // 清理过期的分数动画
        this.recentScores = this.recentScores.filter(scoreData => {
            return currentTime - scoreData.timestamp < 2000; // 2秒后移除
        });
        
        // 渲染分数弹出动画
        this.recentScores.forEach((scoreData, index) => {
            const elapsed = currentTime - scoreData.timestamp;
            const progress = elapsed / 2000; // 2秒动画
            
            if (progress < 1) {
                const alpha = 1 - progress;
                const y = 100 + elapsed * 0.05; // 向上飘动
                const x = GameConfig.CANVAS_WIDTH / 2 + index * 50;
                
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = '#FFD700'; // 金色
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`+${scoreData.points}`, x, y);
                ctx.restore();
            }
        });
    }

    // 清理分数管理器
    clear() {
        this.scoreCallbacks = [];
        this.recentScores = [];
    }
}
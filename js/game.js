// 主游戏类
class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.state = GameState.MENU;
        this.lastTime = 0;
        this.animationId = null;
        
        // 设置全屏Canvas
        this.resizeCanvas();
        
        // 初始化各个管理器
        this.resourceLoader = new ResourceLoader();
        this.sceneManager = new SceneManager(this.ctx);
        this.entityManager = new EntityManager();
        this.collisionDetector = new CollisionDetector();
        this.scoreManager = new ScoreManager();
        this.inputHandler = new InputHandler(this.canvas);
        this.player = null; // 玩家实体
        
        // 绑定事件
        this.bindEvents();
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 监听键盘事件
        this.bindKeyboardEvents();
    }

    // 调整Canvas大小为全屏
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        GameConfig.CANVAS_WIDTH = window.innerWidth;
        GameConfig.CANVAS_HEIGHT = window.innerHeight;
    }

    // 绑定键盘事件
    bindKeyboardEvents() {
        window.addEventListener('keydown', (event) => {
            if (this.player && this.state === GameState.PLAYING) {
                this.player.setKey(event.key, true);
            }
            
            // 空格键投放鱼钩
            if (event.key === ' ' || event.key === 'Spacebar') {
                event.preventDefault();
                if (this.state === GameState.PLAYING && this.player) {
                    const hookPos = this.player.getHookStartPosition();
                    this.castHookVertical(hookPos.x, GameConfig.CANVAS_HEIGHT - 50);
                }
            }
        });

        window.addEventListener('keyup', (event) => {
            if (this.player && this.state === GameState.PLAYING) {
                this.player.setKey(event.key, false);
            }
        });
    }

    // 初始化游戏
    async init() {
        try {
            console.log('正在加载游戏资源...');
            await this.resourceLoader.loadAllResources();
            console.log('资源加载完成');
            
            // 设置场景管理器的资源
            this.sceneManager.setResources(this.resourceLoader.resources);
            
            // 设置实体管理器的资源
            this.entityManager.setResources(this.resourceLoader.resources);
            
            // 创建玩家实体（离上方130px）
            this.player = new Player(50, 130, this.resourceLoader.resources);
            this.entityManager.addEntity(this.player);
            
            // 创建一个持久的鱼钩实体
            const hookPos = this.player.getHookStartPosition();
            const hook = new Hook(hookPos.x, hookPos.y, this.player);
            this.entityManager.addEntity(hook);
            
            // 设置输入处理器的回调（鼠标点击仍然可用）
            this.inputHandler.setClickCallback((x, y) => {
                if (this.state === GameState.PLAYING) {
                    this.castHookVertical(x, y);
                }
            });
            
            // 设置碰撞检测回调
            this.collisionDetector.addCollisionCallback((type, data) => {
                if (type === 'hook-fish') {
                    this.scoreManager.addScore(data.score, data.fish.type);
                }
            });
            
            console.log('游戏初始化完成');
            return true;
        } catch (error) {
            console.error('游戏初始化失败:', error);
            return false;
        }
    }

    // 绑定UI事件
    bindEvents() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const restartBtn = document.getElementById('restartBtn');

        startBtn.addEventListener('click', () => this.start());
        pauseBtn.addEventListener('click', () => this.pause());
        restartBtn.addEventListener('click', () => this.restart());
    }

    // 开始游戏
    start() {
        if (this.state === GameState.MENU || this.state === GameState.PAUSED) {
            this.state = GameState.PLAYING;
            this.updateUI();
            
            if (!this.animationId) {
                this.lastTime = performance.now();
                this.gameLoop();
            }
        }
    }

    // 暂停游戏
    pause() {
        if (this.state === GameState.PLAYING) {
            this.state = GameState.PAUSED;
            this.updateUI();
        } else if (this.state === GameState.PAUSED) {
            this.start();
        }
    }

    // 重新开始游戏
    restart() {
        this.state = GameState.PLAYING;
        this.scoreManager.reset();
        this.entityManager.clear();
        
        // 重新创建玩家和鱼钩
        if (this.player) {
            this.player = new Player(50, 130, this.resourceLoader.resources);
            this.entityManager.addEntity(this.player);
            
            // 创建新的鱼钩
            const hookPos = this.player.getHookStartPosition();
            const hook = new Hook(hookPos.x, hookPos.y, this.player);
            this.entityManager.addEntity(hook);
        }
        
        this.updateUI();
        
        if (!this.animationId) {
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }

    // 投放鱼钩（竖直落下）
    castHookVertical(targetX, targetY) {
        // 检查是否已有鱼钩存在（包括idle状态的）
        const existingHooks = this.entityManager.getHooks();
        if (existingHooks.length > 0) {
            // 如果有idle状态的鱼钩，使用它；否则不创建新的
            const idleHook = existingHooks.find(hook => !hook.isActive());
            if (idleHook) {
                idleHook.cast(idleHook.startX, targetY);
                return;
            } else {
                console.log('已有鱼钩在使用中');
                return;
            }
        }
        
        if (!this.player) return;
        
        // 创建新鱼钩，传入玩家引用
        const hookPos = this.player.getHookStartPosition();
        const hook = new Hook(hookPos.x, hookPos.y, this.player);
        this.entityManager.addEntity(hook);
        
        // 竖直投放鱼钩到指定深度
        hook.cast(hookPos.x, targetY);
    }

    // 兼容原有的点击投放（保留功能）
    castHook(x, y) {
        // 验证点击位置
        if (!this.inputHandler.isValidClickPosition(x, y)) {
            return;
        }
        
        this.castHookVertical(x, y);
    }

    // 游戏主循环
    gameLoop() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // 转换为秒
        this.lastTime = currentTime;

        // 更新游戏状态
        if (this.state === GameState.PLAYING) {
            this.update(deltaTime);
        }

        // 渲染画面
        this.render();

        // 继续循环
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    // 更新游戏状态
    update(deltaTime) {
        // 更新实体管理器
        this.entityManager.update(deltaTime);
        
        // 检测碰撞
        this.collisionDetector.checkCollisions(this.entityManager);
    }

    // 渲染游戏画面
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 渲染场景
        this.sceneManager.render();
        
        // 渲染实体
        this.entityManager.render(this.ctx);
        
        // 渲染分数动画
        this.scoreManager.renderScoreAnimations(this.ctx);
        
        // 渲染UI
        this.renderUI();
    }

    // 渲染UI元素
    renderUI() {
        // 渲染分数和统计信息
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`分数: ${this.scoreManager.getScore()}`, 20, 40);
        
        // 渲染最高分
        this.ctx.font = '18px Arial';
        this.ctx.fillText(`最高分: ${this.scoreManager.getHighScore()}`, 20, 70);
        
        // 渲染捕获数量
        this.ctx.fillText(`捕获: ${this.scoreManager.getFishCaught()} 条`, 20, 95);
        
        // 根据游戏状态渲染提示信息
        if (this.state === GameState.MENU) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '36px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('点击开始游戏按钮开始', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.textAlign = 'left';
        } else if (this.state === GameState.PAUSED) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '36px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('游戏暂停', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.textAlign = 'left';
        }
    }

    // 更新UI按钮状态
    updateUI() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const restartBtn = document.getElementById('restartBtn');
        const scoreElement = document.getElementById('score');

        switch (this.state) {
            case GameState.MENU:
                startBtn.disabled = false;
                pauseBtn.disabled = true;
                restartBtn.disabled = true;
                break;
            case GameState.PLAYING:
                startBtn.disabled = true;
                pauseBtn.disabled = false;
                pauseBtn.textContent = '暂停';
                restartBtn.disabled = false;
                break;
            case GameState.PAUSED:
                startBtn.disabled = true;
                pauseBtn.disabled = false;
                pauseBtn.textContent = '继续';
                restartBtn.disabled = false;
                break;
        }

        scoreElement.textContent = `分数: ${this.scoreManager.getScore()}`;
    }

    // 停止游戏循环
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}
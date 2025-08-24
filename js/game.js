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
        this.dialogManager = null; // 将在初始化时创建
        this.timeManager = new TimeManager();
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
            // 先检查对话系统是否处理了按键
            if (this.dialogManager && this.dialogManager.handleKeyPress()) {
                return; // 对话系统处理了按键，不再处理游戏按键
            }
            
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
            
            // 创建对话管理器
            this.dialogManager = new DialogManager(this.ctx, this.resourceLoader.resources);
            
            // 设置时间管理器回调
            this.timeManager.setTimeUpCallback(() => {
                this.onTimeUp();
            });
            
            // 创建玩家实体（离上方130px）
            this.player = new Player(50, 130, this.resourceLoader.resources);
            this.entityManager.addEntity(this.player);
            
            // 创建一个持久的鱼钩实体
            const hookPos = this.player.getHookStartPosition();
            const hook = new Hook(hookPos.x, hookPos.y, this.player);
            this.entityManager.addEntity(hook);
            
            // 设置输入处理器的回调（鼠标点击仍然可用）
            this.inputHandler.setClickCallback((x, y) => {
                // 先检查对话系统是否处理了点击
                if (this.dialogManager && this.dialogManager.handleClick(x, y)) {
                    return; // 对话系统处理了点击，不再处理游戏点击
                }
                
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
            
            // 设置初始状态为欢迎对话
            this.state = GameState.WELCOME_DIALOG;
            this.startWelcomeDialog();
            
            return true;
        } catch (error) {
            console.error('游戏初始化失败:', error);
            return false;
        }
    }

    // 开始欢迎对话
    startWelcomeDialog() {
        this.dialogManager.startWelcomeDialog((timeOption) => {
            this.onTimeSelected(timeOption);
        });
    }
    
    // 处理时间选择
    onTimeSelected(timeOption) {
        console.log(`选择了时间选项: ${timeOption}`);
        
        // 先完全重置游戏状态
        this.resetGameState();
        
        // 设置新的游戏时间
        this.timeManager.setGameTime(timeOption);
        
        // 隐藏对话管理器
        if (this.dialogManager) {
            this.dialogManager.hide();
        }
        
        // 直接开始游戏，不进入菜单状态
        this.state = GameState.PLAYING;
        this.timeManager.start(); // 开始计时
        this.updateUI();
        
        if (!this.animationId) {
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }
    
    // 处理时间到了
    onTimeUp() {
        console.log('游戏时间到了');
        this.state = GameState.END_DIALOG;
        this.timeManager.stop();
        this.startEndDialog();
    }
    
    // 开始结束对话
    startEndDialog() {
        this.dialogManager.startEndDialog((replayOption) => {
            this.onReplaySelected(replayOption);
        });
    }
    
    // 处理重玩选择
    onReplaySelected(replayOption) {
        console.log(`选择了重玩选项: ${replayOption}`);
        if (replayOption === 1 || replayOption === 2 || replayOption === 3) {
            // 先完全重置游戏状态
            this.resetGameState();
            
            // 设置新的游戏时间
            this.timeManager.setGameTime(replayOption);
            
            // 直接开始游戏
            this.state = GameState.PLAYING;
            this.timeManager.start(); // 开始计时
            this.updateUI();
            
            if (!this.animationId) {
                this.lastTime = performance.now();
                this.gameLoop();
            }
        } else {
            // 结束游戏
            this.state = GameState.GAME_OVER;
            this.updateUI();
        }
    }
    bindEvents() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const restartBtn = document.getElementById('restartBtn');

        startBtn.addEventListener('click', () => {
            if (startBtn.textContent === '退出游戏') {
                this.exitGame();
            } else {
                this.start();
            }
        });
        pauseBtn.addEventListener('click', () => this.pause());
        restartBtn.addEventListener('click', () => this.restart());
    }

    // 完全重置游戏状态
    resetGameState() {
        console.log('完全重置游戏状态');
        
        // 重置分数管理器
        this.scoreManager.reset();
        
        // 清空所有实体
        this.entityManager.clear();
        
        // 重置时间管理器
        this.timeManager.reset();
        
        // 重新创建玩家和鱼钩
        this.player = new Player(50, 130, this.resourceLoader.resources);
        this.entityManager.addEntity(this.player);
        
        // 创建新的鱼钩
        const hookPos = this.player.getHookStartPosition();
        const hook = new Hook(hookPos.x, hookPos.y, this.player);
        this.entityManager.addEntity(hook);
        
        console.log('游戏状态重置完成');
    }

    // 退出游戏
    exitGame() {
        // 停止时间管理器
        this.timeManager.stop();
        // 返回到欢迎对话状态
        this.state = GameState.WELCOME_DIALOG;
        // 重新开始欢迎对话
        this.startWelcomeDialog();
        this.updateUI();
    }

    // 开始游戏
    start() {
        if (this.state === GameState.MENU || this.state === GameState.PAUSED) {
            this.state = GameState.PLAYING;
            this.timeManager.start(); // 开始计时
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
            this.timeManager.pause(); // 暂停计时
            this.updateUI();
        } else if (this.state === GameState.PAUSED) {
            this.timeManager.resume(); // 继续计时
            this.start();
        }
    }

    // 重新开始游戏
    restart() {
        this.state = GameState.PLAYING;
        this.scoreManager.reset();
        this.entityManager.clear();
        this.timeManager.reset(); // 重置计时器
        this.timeManager.start(); // 开始计时
        
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

        // 更新对话系统
        if (this.dialogManager) {
            this.dialogManager.update(deltaTime);
        }
        
        // 更新时间管理器
        this.timeManager.update(deltaTime);

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
        
        // 渲染场景背景
        this.sceneManager.render();
        
        // 对话系统优先渲染（仅在欢迎对话和结束对话状态下显示）
        if (this.dialogManager && this.dialogManager.shouldShow(this.state)) {
            console.log('渲染对话系统');
            this.dialogManager.render();
        }
        
        // 只在非对话状态下渲染游戏实体
        if (this.state !== GameState.WELCOME_DIALOG && this.state !== GameState.END_DIALOG) {
            // 渲染实体
            this.entityManager.render(this.ctx);
            
            // 渲染分数动画
            this.scoreManager.renderScoreAnimations(this.ctx);
            
            // 渲染时间显示
            this.timeManager.renderTimeDisplay(this.ctx);
            
            // 渲染UI
            this.renderUI();
        }
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
            case GameState.WELCOME_DIALOG:
            case GameState.END_DIALOG:
                startBtn.disabled = true;
                startBtn.textContent = '开始游戏';
                pauseBtn.disabled = true;
                restartBtn.disabled = true;
                break;
            case GameState.MENU:
                startBtn.disabled = false;
                startBtn.textContent = '开始游戏';
                pauseBtn.disabled = true;
                restartBtn.disabled = true;
                break;
            case GameState.PLAYING:
                startBtn.disabled = false;
                startBtn.textContent = '退出游戏'; // 将开始按钮改为退出按钮
                pauseBtn.disabled = false;
                pauseBtn.textContent = '暂停';
                restartBtn.disabled = false;
                break;
            case GameState.PAUSED:
                startBtn.disabled = false;
                startBtn.textContent = '退出游戏'; // 暂停时也显示退出按钮
                pauseBtn.disabled = false;
                pauseBtn.textContent = '继续';
                restartBtn.disabled = false;
                break;
            case GameState.TIME_UP:
            case GameState.GAME_OVER:
                startBtn.disabled = true;
                startBtn.textContent = '开始游戏';
                pauseBtn.disabled = true;
                restartBtn.disabled = true;
                break;
        }

        if (scoreElement) {
            scoreElement.textContent = `分数: ${this.scoreManager.getScore()}`;
        }
    }

    // 停止游戏循环
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}
// 主游戏类
class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.state = GameState.MENU;
        this.lastTime = 0;
        this.animationId = null;
        this.currentTimeOption = 1; // 初始化时间选项，默认为1分钟
        this.currentGameMode = null; // 当前游戏模式：'amusement' 或 'study'
        
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
        
        // 通知对话管理器更新布局，确保按钮居中
        if (this.dialogManager) {
            this.dialogManager.updateLayout();
        }
        
        // 如果玩家已经创建，更新玩家位置
        if (this.player) {
            this.updatePlayerPosition();
        }
        
        console.log(`画布尺寸调整为: ${this.canvas.width} x ${this.canvas.height}`);
    }

    // 绑定键盘事件
    bindKeyboardEvents() {
        window.addEventListener('keydown', (event) => {
            // 先检查对话系统是否处理了按键
            if (this.dialogManager && this.dialogManager.handleKeyPress()) {
                // 如果在欢迎对话状态，按键后进入模式选择
                if (this.state === GameState.WELCOME_DIALOG) {
                    this.startModeSelection();
                }
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
    
    // 计算相对于背景的位置
    getBackgroundRelativePosition(relativeX, relativeY) {
        // relativeX 和 relativeY 是相对于背景的百分比位置（0.0-1.0）
        // 例如：relativeX=0.1 表示从左侧10%的位置
        // relativeY=0.15 表示从上方15%的位置
        return {
            x: this.canvas.width * relativeX,
            y: this.canvas.height * relativeY
        };
    }
    
    // 更新玩家位置（相对于背景）
    updatePlayerPosition() {
        if (!this.player) return;
        
        // 让玩家始终位于背景的相对位置
        // X: 从左侧10%的位置
        // Y: 从上方15%的位置（大致相当于原来的130px）
        const newPos = this.getBackgroundRelativePosition(0.1, 0.15);
        this.player.x = newPos.x;
        this.player.y = newPos.y;
        
        // === 玩家图片顶部坐标与背景顶部坐标的相对关系调试信息 ===
        console.log('\n=== ME图片与BG背景坐标关系 ===');
        
        // 背景信息
        console.log('【背景坐标信息】');
        console.log(`背景尺寸: ${this.canvas.width} x ${this.canvas.height}`);
        console.log(`背景左上角坐标 (顶部): (0, 0)`);
        console.log(`背景右下角坐标 (底部): (${this.canvas.width}, ${this.canvas.height})`);
        
        // 玩家图片基本信息
        console.log('\n【ME图片基本信息】');
        console.log(`玩家当前坐标 (左上角): (${this.player.x.toFixed(1)}, ${this.player.y.toFixed(1)})`);
        
        if (this.player.image) {
            console.log(`ME图片原始尺寸: ${this.player.image.width} x ${this.player.image.height}`);
            console.log(`ME图片显示尺寸: ${this.player.width} x ${this.player.height}`);
            console.log(`ME图片顶部坐标: (${this.player.x.toFixed(1)}, ${this.player.y.toFixed(1)})`);
            console.log(`ME图片底部坐标: (${this.player.x.toFixed(1)}, ${(this.player.y + this.player.height).toFixed(1)})`);
            console.log(`ME图片中心坐标: (${(this.player.x + this.player.width/2).toFixed(1)}, ${(this.player.y + this.player.height/2).toFixed(1)})`);
        } else {
            console.log('ME图片未加载或不存在');
        }
        
        // 相对于背景的位置关系
        console.log('\n【ME相对于BG的位置关系】');
        console.log(`ME图片顶部 相对于 BG顶部:`);
        console.log(`  - X轴偏移: ${this.player.x.toFixed(1)}px (占背景宽度的 ${(this.player.x / this.canvas.width * 100).toFixed(2)}%)`);
        console.log(`  - Y轴偏移: ${this.player.y.toFixed(1)}px (占背景高度的 ${(this.player.y / this.canvas.height * 100).toFixed(2)}%)`);
        
        console.log(`ME图片左侧 距离 BG左边缘: ${this.player.x.toFixed(1)}px`);
        console.log(`ME图片顶部 距离 BG顶边缘: ${this.player.y.toFixed(1)}px`);
        console.log(`ME图片右侧 距离 BG右边缘: ${(this.canvas.width - this.player.x - this.player.width).toFixed(1)}px`);
        console.log(`ME图片底部 距离 BG底边缘: ${(this.canvas.height - this.player.y - this.player.height).toFixed(1)}px`);
        
        // 百分比位置
        console.log('\n【百分比相对位置】');
        console.log(`ME在BG中的X位置: ${(this.player.x / this.canvas.width * 100).toFixed(2)}% (设置值: 10.0%)`);
        console.log(`ME在BG中的Y位置: ${(this.player.y / this.canvas.height * 100).toFixed(2)}% (设置值: 15.0%)`);
        
        if (this.player.image) {
            console.log(`ME图片中心在BG中的位置: X=${((this.player.x + this.player.width/2) / this.canvas.width * 100).toFixed(2)}%, Y=${((this.player.y + this.player.height/2) / this.canvas.height * 100).toFixed(2)}%`);
        }
        
        console.log('=================================\n');
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
            
            // 创建结算管理器
            this.settlementManager = new SettlementManager(this.ctx, this.resourceLoader.resources);
            
            // 设置时间管理器回调
            this.timeManager.setTimeUpCallback(() => {
                this.onTimeUp();
            });
            
            // 创建玩家实体（位置相对于背景）
            const playerPos = this.getBackgroundRelativePosition(0.1, 0.15);
            this.player = new Player(playerPos.x, playerPos.y, this.resourceLoader.resources);
            this.entityManager.addEntity(this.player);
            
            // 创建一个持久的鱼钩实体
            const hookPos = this.player.getHookStartPosition();
            const hook = new Hook(hookPos.x, hookPos.y, this.player);
            this.entityManager.addEntity(hook);
            
            // 设置输入处理器的回调（鼠标点击仍然可用）
            this.inputHandler.setClickCallback((x, y) => {
                // 先检查结算系统是否处理了点击
                if (this.settlementManager && this.state === GameState.GAME_SETTLEMENT) {
                    if (this.settlementManager.handleClick(x, y)) {
                        // 结算完成，进入结束对话
                        this.state = GameState.END_DIALOG;
                        this.settlementManager.hide();
                        this.startEndDialog();
                        return;
                    }
                }
                
                // 再检查对话系统是否处理了点击
                if (this.dialogManager && this.dialogManager.handleClick(x, y)) {
                    // 如果在欢迎对话状态，点击后进入模式选择
                    if (this.state === GameState.WELCOME_DIALOG) {
                        this.startModeSelection();
                    }
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
        this.dialogManager.startWelcomeDialog();
    }
    
    // 开始模式选择
    startModeSelection() {
        this.state = GameState.MODE_SELECTION;
        this.dialogManager.startModeSelectionDialog((mode) => {
            this.onModeSelected(mode);
        });
    }
    
    // 处理模式选择
    onModeSelected(mode) {
        console.log(`选择了游戏模式: ${mode}`);
        this.currentGameMode = mode; // 保存选择的模式
        
        if (mode === 'study') {
            // 学习模式：进入学习内容选择
            this.startStudySelection();
        } else {
            // 娱乐模式：进入时间选择阶段
            this.startTimeSelection();
        }
    }
    
    // 开始学习选择
    startStudySelection() {
        this.state = GameState.MENU;
        this.dialogManager.startStudySelectionDialog((studyOption) => {
            this.onStudySelected(studyOption);
        });
    }
    
    // 处理学习选择
    onStudySelected(studyOption) {
        console.log(`选择了学习内容: ${studyOption}`);
        
        // TODO: 下一步实现学习游戏逻辑
        // 目前暂时直接开始游戏（无时间限制）
        this.currentTimeOption = null; // 学习模式无时间限制
        
        // 设置分数管理器的模式（传递学习选项而不是时间）
        this.scoreManager.setTimeOption(studyOption);
        
        // 先完全重置游戏状态
        this.resetGameState();
        
        // 学习模式不设置时间限制
        // this.timeManager.setGameTime(无需设置)
        
        // 隐藏对话管理器
        if (this.dialogManager) {
            this.dialogManager.hide();
        }
        
        // 直接开始游戏，不进入菜单状态
        this.state = GameState.PLAYING;
        // 学习模式不开始计时
        // this.timeManager.start();
        this.updateUI();
        
        if (!this.animationId) {
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }
    
    // 开始时间选择
    startTimeSelection() {
        this.state = GameState.MENU;
        this.dialogManager.startTimeSelectionDialog((timeOption) => {
            this.onTimeSelected(timeOption);
        });
    }
    
    // 处理时间选择
    onTimeSelected(timeOption) {
        console.log(`选择了时间选项: ${timeOption}`, '类型:', typeof timeOption);
        
        // 保存当前选择的时间选项
        this.currentTimeOption = timeOption;
        console.log('保存后的currentTimeOption:', this.currentTimeOption, '类型:', typeof this.currentTimeOption);
        
        // 设置分数管理器的时间选项
        this.scoreManager.setTimeOption(timeOption);
        
        // 先完全重置游戏状态
        this.resetGameState();
        
        // 检查重置后的值
        console.log('重置后的currentTimeOption:', this.currentTimeOption, '类型:', typeof this.currentTimeOption);
        
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
        console.log('=== 游戏时间到了 ===');
        console.log('当前保存的currentTimeOption:', this.currentTimeOption, '类型:', typeof this.currentTimeOption);
        console.log('=== 即将传递给结算管理器 ===');
        this.state = GameState.GAME_SETTLEMENT;
        this.timeManager.stop();
        
        // 获取当前选择的时间选项
        const timeOption = this.currentTimeOption || 1;
        console.log('传递给结算管理器的timeOption:', timeOption, '类型:', typeof timeOption);
        
        // 开始结算动画
        this.settlementManager.startSettlement(timeOption, this.scoreManager);
    }
    
    // 开始结束对话
    startEndDialog() {
        this.dialogManager.startEndDialog((mode) => {
            this.onEndModeSelected(mode);
        });
    }
    
    // 处理结束对话中的模式选择
    onEndModeSelected(mode) {
        console.log(`结束对话中选择了游戏模式: ${mode}`);
        this.currentGameMode = mode; // 保存选择的模式
        
        // 直接进入时间选择
        this.startTimeSelection();
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
        console.log('重置前的currentTimeOption:', this.currentTimeOption);
        
        // 重置分数管理器
        this.scoreManager.reset();
        
        // 清空所有实体
        this.entityManager.clear();
        
        // 重置时间管理器
        this.timeManager.reset();
        
        // 重新创建玩家和鱼钩
        const playerPos = this.getBackgroundRelativePosition(0.1, 0.15);
        this.player = new Player(playerPos.x, playerPos.y, this.resourceLoader.resources);
        this.entityManager.addEntity(this.player);
        
        // 创建新的鱼钩
        const hookPos = this.player.getHookStartPosition();
        const hook = new Hook(hookPos.x, hookPos.y, this.player);
        this.entityManager.addEntity(hook);
        
        console.log('游戏状态重置完成，当前currentTimeOption:', this.currentTimeOption);
    }

    // 退出游戏
    exitGame() {
        console.log('退出游戏，当前currentTimeOption:', this.currentTimeOption);
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
        console.log('重新开始游戏，当前currentTimeOption:', this.currentTimeOption);
        this.state = GameState.PLAYING;
        this.scoreManager.reset();
        this.entityManager.clear();
        this.timeManager.reset(); // 重置计时器
        
        // 重新设置游戏时间为当前选择的时间选项
        if (this.currentTimeOption) {
            this.timeManager.setGameTime(this.currentTimeOption);
            console.log('重新设置游戏时间为:', this.currentTimeOption);
        }
        
        this.timeManager.start(); // 开始计时
        
        // 重新创建玩家和鱼钩
        if (this.player) {
            const playerPos = this.getBackgroundRelativePosition(0.1, 0.15);
            this.player = new Player(playerPos.x, playerPos.y, this.resourceLoader.resources);
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
        
        // 更新结算管理器
        if (this.settlementManager && this.state === GameState.GAME_SETTLEMENT) {
            this.settlementManager.update(deltaTime);
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
        
        // 对话系统优先渲染（仅在相关状态下显示）
        if (this.dialogManager && this.shouldShowDialog()) {
            // console.log('渲染对话系统');
            this.dialogManager.render();
        }
        
        // 结算画面渲染（最高优先级）
        if (this.settlementManager && this.state === GameState.GAME_SETTLEMENT) {
            // 结算状态下也渲染游戏实体作为背景
            this.entityManager.render(this.ctx);
            this.scoreManager.renderScoreAnimations(this.ctx);
            this.timeManager.renderTimeDisplay(this.ctx);
            this.renderUI();
            
            // 然后渲染结算画面
            this.settlementManager.render();
            return;
        }
        
        // 只在非对话状态下渲染游戏实体
        if (!this.shouldShowDialog() && this.state !== GameState.GAME_SETTLEMENT) {
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
    
    // 判断是否应该显示对话系统
    shouldShowDialog() {
        return this.state === GameState.WELCOME_DIALOG || 
               this.state === GameState.MODE_SELECTION || 
               this.state === GameState.MENU || 
               this.state === GameState.END_DIALOG;
    }

    // 渲染UI元素
    renderUI() {
        // 固定在左上角的分数统计信息
        const leftMargin = 20;  // 左边距
        const topMargin = 30;   // 上边距
        const lineHeight = 25;  // 行高
        
        // 设置文字样式（移除背景，只显示白色文字）
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 22px Arial';
        this.ctx.textAlign = 'left';
        
        // 添加文字阴影效果，提升可读性
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        this.ctx.shadowBlur = 3;
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;
        
        // 渲染分数信息（固定在左上角）
        this.ctx.fillText(`分数: ${this.scoreManager.getScore()}`, leftMargin, topMargin);
        
        // 渲染最高分
        this.ctx.font = 'bold 18px Arial';
        this.ctx.fillText(`最高分: ${this.scoreManager.getHighScore()}`, leftMargin, topMargin + lineHeight);
        
        // 渲染捕获数量
        this.ctx.fillText(`捕获: ${this.scoreManager.getFishCaught()} 条`, leftMargin, topMargin + lineHeight * 2);
        
        // 清除阴影效果，避免影响其他渲染
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        // console.log(`分数UI渲染 - 位置: (${leftMargin}, ${topMargin}), 分数: ${this.scoreManager.getScore()}, 最高分: ${this.scoreManager.getHighScore()}, 捕获: ${this.scoreManager.getFishCaught()}`);
        
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
        
        // 分数现在由Canvas渲染，不再需要更新HTML元素
        console.log('按钮UI状态更新完成');
    }

    // 停止游戏循环
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}
// 单词墙管理器类
class WordWallManager {
    constructor(ctx) {
        this.ctx = ctx;
        this.isVisible = false;
        this.currentLevel = 'cet4'; // 当前等级：cet4 或 cet6
        this.currentPage = 0; // 当前页码
        this.wordsData = []; // 当前显示的单词数据
        this.completedWords = new Set(); // 已完成的单词索引
        this.currentWordIndex = 0; // 当前选中的单词索引
        this.pageInfo = null; // 分页信息
        
        // UI元素位置
        this.levelButtons = {
            cet4: { x: 30, y: 30, width: WordWallConfig.LEVEL_BUTTON_WIDTH, height: WordWallConfig.LEVEL_BUTTON_HEIGHT },
            cet6: { x: 135, y: 30, width: WordWallConfig.LEVEL_BUTTON_WIDTH, height: WordWallConfig.LEVEL_BUTTON_HEIGHT }
        };
        
        this.wordButtons = []; // 单词按钮位置数组
        this.startGameButton = null; // 开始游戏按钮
        this.pageButtons = { // 分页按钮
            prev: null,
            next: null
        };
        
        this.setupWordButtons();
    }
    
    // 绘制圆角矩形的辅助方法
    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
    
    // 设置单词按钮位置
    setupWordButtons() {
        this.wordButtons = [];
        const canvasWidth = this.ctx.canvas.width;
        const canvasHeight = this.ctx.canvas.height;
        
        // 计算单词区域的起始位置（居中显示）
        const totalWidth = WordWallConfig.WORDS_PER_ROW * WordWallConfig.WORD_BUTTON_WIDTH + 
                          (WordWallConfig.WORDS_PER_ROW - 1) * WordWallConfig.WORD_SPACING_X;
        const totalHeight = 2 * WordWallConfig.WORD_BUTTON_HEIGHT + WordWallConfig.WORD_SPACING_Y;
        
        const startX = (canvasWidth - totalWidth) / 2;
        const startY = (canvasHeight - totalHeight) / 2 - 50; // 向上偏移50px为标题留空间
        
        // 创建10个单词按钮（2行5列）
        for (let i = 0; i < WordWallConfig.WORDS_PER_GROUP; i++) {
            const row = Math.floor(i / WordWallConfig.WORDS_PER_ROW);
            const col = i % WordWallConfig.WORDS_PER_ROW;
            
            const x = startX + col * (WordWallConfig.WORD_BUTTON_WIDTH + WordWallConfig.WORD_SPACING_X);
            const y = startY + row * (WordWallConfig.WORD_BUTTON_HEIGHT + WordWallConfig.WORD_SPACING_Y);
            
            this.wordButtons.push({
                x: x,
                y: y,
                width: WordWallConfig.WORD_BUTTON_WIDTH,
                height: WordWallConfig.WORD_BUTTON_HEIGHT,
                wordIndex: i
            });
        }
        
        // 设置分页按钮位置（增加与单词区域的距离）
        const pageButtonY = startY + totalHeight + 35; // 进一步增加间距到35px
        this.pageButtons.prev = {
            x: (canvasWidth / 2) - 110, // 调整位置，适应更大的按钮
            y: pageButtonY,
            width: 80, // 增加宽度从70到80
            height: 32 // 增加高度从28到32
        };
        
        this.pageButtons.next = {
            x: (canvasWidth / 2) + 30, // 调整位置
            y: pageButtonY,
            width: 80, // 增加宽度
            height: 32 // 增加高度
        };
        
        // 设置开始游戏按钮位置（增加与分页按钮的距离）
        this.startGameButton = {
            x: (canvasWidth - 240) / 2, // 适应更大的按钮宽度
            y: pageButtonY + 70, // 进一步增加间距到70px
            width: 240, // 增加宽度从200到240
            height: 55 // 增加高度从50到55
        };
    }
    
    // 显示单词墙
    show(words, completedWords = new Set(), selectedWordIndex = 0, pageInfo = null, wordErrors = null, studyMode = null, isGameCompleted = false) {
        this.isVisible = true;
        this.wordsData = words; // 保存完整的单词数据（包含绝对索引信息）
        this.completedWords = new Set(completedWords);
        this.currentWordIndex = selectedWordIndex; // 当前选中的单词绝对索引
        this.pageInfo = pageInfo; // 分页信息
        this.wordErrors = wordErrors; // 单词匹配模式的错误统计
        this.studyMode = studyMode; // 当前学习模式
        this.isGameCompleted = isGameCompleted; // 游戏是否已完成
        this.setupWordButtons(); // 重新计算按钮位置
        
        console.log(`显示单词墙: 第${pageInfo?.currentPage || 1}页, 单词数量: ${words.length}`);
    }
    
    // 隐藏单词墙
    hide() {
        this.isVisible = false;
    }
    
    // 切换等级
    switchLevel(level) {
        if (level === 'cet4' || level === 'cet6') {
            this.currentLevel = level;
            console.log(`切换到${level === 'cet4' ? '四级' : '六级'}单词`);
            return true;
        }
        return false;
    }
    
    // 处理点击事件
    handleClick(x, y) {
        if (!this.isVisible) {
            console.log('单词墙不可见，不处理点击');
            return null;
        }
        
        console.log(`单词墙点击检测: (${x}, ${y})`);
        
        // 检查等级切换按钮
        for (let level in this.levelButtons) {
            const btn = this.levelButtons[level];
            console.log(`检查${level}按钮: (${btn.x}, ${btn.y}, ${btn.width}, ${btn.height})`);
            if (x >= btn.x && x <= btn.x + btn.width && 
                y >= btn.y && y <= btn.y + btn.height) {
                console.log(`点击了${level}按钮`);
                return { type: 'level', level: level };
            }
        }
        
        // 检查分页按钮
        if (this.pageButtons.prev && 
            x >= this.pageButtons.prev.x && x <= this.pageButtons.prev.x + this.pageButtons.prev.width &&
            y >= this.pageButtons.prev.y && y <= this.pageButtons.prev.y + this.pageButtons.prev.height) {
            console.log('点击了上一页按钮');
            return { type: 'page', direction: 'prev' };
        }
        
        if (this.pageButtons.next && 
            x >= this.pageButtons.next.x && x <= this.pageButtons.next.x + this.pageButtons.next.width &&
            y >= this.pageButtons.next.y && y <= this.pageButtons.next.y + this.pageButtons.next.height) {
            console.log('点击了下一页按钮');
            return { type: 'page', direction: 'next' };
        }
        
        // 检查单词按钮
        for (let i = 0; i < this.wordButtons.length; i++) {
            const btn = this.wordButtons[i];
            if (x >= btn.x && x <= btn.x + btn.width && 
                y >= btn.y && y <= btn.y + btn.height) {
                console.log(`点击了单词按钮${i}`);
                // 返回相对索引（在当前页中的位置）
                return { type: 'word', wordIndex: btn.wordIndex };
            }
        }
        
        // 检查开始游戏按钮
        if (this.startGameButton && 
            x >= this.startGameButton.x && x <= this.startGameButton.x + this.startGameButton.width && 
            y >= this.startGameButton.y && y <= this.startGameButton.y + this.startGameButton.height) {
            console.log('点击了开始游戏按钮');
            return { type: 'startGame' };
        }
        
        console.log('未点击到任何按钮');
        return null;
    }
    
    // 渲染单词墙
    render() {
        if (!this.isVisible) return;
        
        const ctx = this.ctx;
        ctx.save();
        
        // 绘制半透明背景
        ctx.fillStyle = WordWallConfig.BACKGROUND_COLOR;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // 绘制标题
        this.renderTitle();
        
        // 绘制等级切换按钮
        this.renderLevelButtons();
        
        // 绘制单词按钮
        this.renderWordButtons();
        
        // 绘制分页按钮和页码信息
        this.renderPageControls();
        
        // 绘制开始游戏按钮
        this.renderStartButton();
        
        // 绘制说明文字
        this.renderInstructions();
        
        ctx.restore();
    }
    
    // 渲染标题
    renderTitle() {
        const ctx = this.ctx;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 添加阴影效果
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // 根据学习模式显示不同的标题
        let modeText = '背单词模式';
        if (this.studyMode === 'pindanci') {
            modeText = '拼单词模式';
        } else if (this.studyMode === 'dancipipei') {
            modeText = '单词匹配模式';
        }
        
        const title = `${this.currentLevel === 'cet4' ? '四级' : '六级'}单词墙 - ${modeText}`;
        ctx.fillText(title, ctx.canvas.width / 2, 100);
        
        // 清除阴影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
    
    // 渲染等级切换按钮
    renderLevelButtons() {
        const ctx = this.ctx;
        const radius = 8; // 圆角半径
        
        for (let level in this.levelButtons) {
            const btn = this.levelButtons[level];
            const isActive = (level === this.currentLevel);
            
            // 绘制圆角按钮背景
            ctx.fillStyle = isActive ? '#2196F3' : '#616161';
            this.drawRoundedRect(ctx, btn.x, btn.y, btn.width, btn.height, radius);
            ctx.fill();
            
            // 绘制圆角按钮边框
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            this.drawRoundedRect(ctx, btn.x, btn.y, btn.width, btn.height, radius);
            ctx.stroke();
            
            // 按钮文字
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const text = level === 'cet4' ? '四级' : '六级';
            ctx.fillText(text, btn.x + btn.width / 2, btn.y + btn.height / 2);
        }
    }
    
    // 渲染单词按钮
    renderWordButtons() {
        const ctx = this.ctx;
        const radius = 6; // 单词按钮的圆角半径稍小一些
        
        for (let i = 0; i < this.wordButtons.length; i++) {
            const btn = this.wordButtons[i];
            const wordData = this.wordsData[i];
            
            if (!wordData) continue;
            
            // 使用绝对索引来判断状态
            const absoluteIndex = wordData.absoluteIndex;
            
            // 确定按钮颜色
            let buttonColor;
            
            // 检查是否是单词匹配模式且游戏已完成
            if (this.studyMode === 'dancipipei' && this.isGameCompleted && this.wordErrors) {
                // 只对当前游戏组的单词显示红绿色
                const wordKey = `${wordData.word}-${wordData.meaning}`;
                const hasRecord = this.wordErrors.has(wordKey);
                
                // 只有在wordErrors中有记录的单词才显示红绿色（表示这是当前游戏组的单词）
                if (hasRecord) {
                    const hasError = this.wordErrors.get(wordKey) > 0;
                    
                    if (hasError) {
                        buttonColor = '#F44336'; // 有错误的单词显示红色
                    } else {
                        buttonColor = '#4CAF50'; // 正确的单词显示绿色
                    }
                } else {
                    // 不在当前游戏组中的单词，使用正常颜色逻辑
                    if (wordData.completed) {
                        buttonColor = WordWallConfig.COMPLETED_COLOR; // 已完成：绿色
                    } else if (wordData.current) {
                        buttonColor = WordWallConfig.CURRENT_COLOR; // 当前单词：蓝色
                    } else {
                        buttonColor = WordWallConfig.INCOMPLETE_COLOR; // 未完成：灰色
                    }
                }
            } else {
                // 正常的单词墙颜色逻辑
                if (wordData.completed) {
                    buttonColor = WordWallConfig.COMPLETED_COLOR; // 已完成：绿色
                } else if (wordData.current) {
                    buttonColor = WordWallConfig.CURRENT_COLOR; // 当前单词：蓝色
                } else {
                    buttonColor = WordWallConfig.INCOMPLETE_COLOR; // 未完成：灰色
                }
            }
            
            // 绘制圆角按钮背景
            ctx.fillStyle = buttonColor;
            this.drawRoundedRect(ctx, btn.x, btn.y, btn.width, btn.height, radius);
            ctx.fill();
            
            // 绘制圆角按钮边框
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            this.drawRoundedRect(ctx, btn.x, btn.y, btn.width, btn.height, radius);
            ctx.stroke();
            
            // 绘制单词文字
            ctx.fillStyle = WordWallConfig.TEXT_COLOR;
            ctx.font = '16px Arial'; // 增加字体大小从14px到16px
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // 处理长单词，可能需要换行或截断
            const word = wordData.word;
            const maxWidth = btn.width - 10;
            let displayText = word;
            
            // 如果文字太长，进行截断
            const textWidth = ctx.measureText(word).width;
            if (textWidth > maxWidth) {
                displayText = word.substring(0, 8) + '...';
            }
            
            ctx.fillText(displayText, btn.x + btn.width / 2, btn.y + btn.height / 2);
        }
    }
        
    // 渲染分页控件
    renderPageControls() {
        if (!this.pageInfo) return;
            
        const ctx = this.ctx;
        const radius = 6; // 分页按钮的圆角半径
            
        // 渲染页码信息（调整位置到按钮中间）
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
            
        const pageText = `第 ${this.pageInfo.currentPage} / ${this.pageInfo.totalPages} 页`;
        const progressText = `已完成: ${this.pageInfo.completedInCurrentPage} / ${this.pageInfo.totalInCurrentPage}`;
            
        const centerX = ctx.canvas.width / 2;
        const pageY = this.pageButtons.prev.y + this.pageButtons.prev.height / 2; // 与按钮在同一水平线
            
        // 在两个按钮中间显示页码信息
        ctx.fillText(pageText, centerX, pageY);
            
        ctx.font = '12px Arial';
        ctx.fillText(progressText, centerX, pageY + 28); // 进一步增加间距从22px到28px
            
        // 渲染上一页按钮
        if (this.pageInfo.hasPreviousPage) {
            ctx.fillStyle = '#2196F3';
        } else {
            ctx.fillStyle = '#9E9E9E';
        }
            
        this.drawRoundedRect(ctx, this.pageButtons.prev.x, this.pageButtons.prev.y, 
                            this.pageButtons.prev.width, this.pageButtons.prev.height, radius);
        ctx.fill();
            
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        this.drawRoundedRect(ctx, this.pageButtons.prev.x, this.pageButtons.prev.y, 
                            this.pageButtons.prev.width, this.pageButtons.prev.height, radius);
        ctx.stroke();
            
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Arial'; // 增加字体大小从12px到14px
        ctx.textAlign = 'center';
        ctx.fillText('上一页', 
                    this.pageButtons.prev.x + this.pageButtons.prev.width / 2, 
                    this.pageButtons.prev.y + this.pageButtons.prev.height / 2);
            
        // 渲染下一页按钮
        if (this.pageInfo.hasNextPage) {
            ctx.fillStyle = '#2196F3';
        } else {
            ctx.fillStyle = '#9E9E9E';
        }
            
        this.drawRoundedRect(ctx, this.pageButtons.next.x, this.pageButtons.next.y, 
                            this.pageButtons.next.width, this.pageButtons.next.height, radius);
        ctx.fill();
            
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        this.drawRoundedRect(ctx, this.pageButtons.next.x, this.pageButtons.next.y, 
                            this.pageButtons.next.width, this.pageButtons.next.height, radius);
        ctx.stroke();
            
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Arial'; // 增加字体大小从12px到14px
        ctx.textAlign = 'center';
        ctx.fillText('下一页', 
                    this.pageButtons.next.x + this.pageButtons.next.width / 2, 
                    this.pageButtons.next.y + this.pageButtons.next.height / 2);
    }
    
    // 渲染开始游戏按钮
    renderStartButton() {
        const ctx = this.ctx;
        const radius = 10; // 开始游戏按钮的圆角半径稍大一些
        
        if (!this.startGameButton) return;
        
        const btn = this.startGameButton;
        
        // 绘制圆角按钮背景
        ctx.fillStyle = '#4CAF50';
        this.drawRoundedRect(ctx, btn.x, btn.y, btn.width, btn.height, radius);
        ctx.fill();
        
        // 绘制圆角按钮边框
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        this.drawRoundedRect(ctx, btn.x, btn.y, btn.width, btn.height, radius);
        ctx.stroke();
        
        // 按钮文字（根据学习模式显示不同的文本）
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 22px Arial'; // 增加字体大小从20px到22px
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 根据学习模式显示不同的按钮文本
        let buttonText = '开始背单词';
        if (this.studyMode === 'pindanci') {
            buttonText = '开始拼单词';
        } else if (this.studyMode === 'dancipipei') {
            buttonText = '开始单词匹配';
        }
        
        ctx.fillText(buttonText, btn.x + btn.width / 2, btn.y + btn.height / 2);
    }
    
    // 渲染说明文字
    renderInstructions() {
        const ctx = this.ctx;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 添加阴影效果
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        let instructions;
        if (this.studyMode === 'dancipipei' && this.isGameCompleted && this.wordErrors) {
            // 单词匹配模式结束后的说明
            instructions = [
                '绿色：匹配正确的单词',
                '红色：匹配错误的单词',
                '点击左上角可切换四级/六级单词'
            ];
        } else {
            // 普通模式的说明
            instructions = [
                '绿色：已完成的单词',
                '蓝色：当前学习的单词',
                '灰色：待学习的单词',
                '点击左上角可切换四级/六级单词'
            ];
        }
        
        const startY = ctx.canvas.height - 150;
        instructions.forEach((text, index) => {
            ctx.fillText(text, ctx.canvas.width / 2, startY + index * 25);
        });
        
        // 清除阴影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
    
    // 更新单词状态
    updateWordStatus(completedWords, currentWordIndex) {
        this.completedWords = new Set(completedWords);
        this.currentWordIndex = currentWordIndex;
    }
    
    // 获取当前等级
    getCurrentLevel() {
        return this.currentLevel;
    }
    
    // 检查是否可见
    isWordWallVisible() {
        return this.isVisible;
    }
}
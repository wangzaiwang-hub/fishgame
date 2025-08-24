// 对话管理器类
class DialogManager {
    constructor(ctx, resources) {
        this.ctx = ctx;
        this.resources = resources;
        this.canvas = ctx.canvas;
        
        // 角色和对话框资源
        this.manImage = null;
        this.messageImage = null;
        this.oneImage = null;
        this.twoImage = null;
        this.threeImage = null;
        
        // 对话状态
        this.dialogState = 'hidden'; // hidden, sliding_in, talking, waiting_start, waiting_choice, sliding_out
        this.currentDialog = '';
        this.displayedText = '';
        this.textIndex = 0;
        this.lastTextTime = 0;
        this.textSpeed = 80; // 每个字显示间隔（毫秒）
        this.waitingForStart = false; // 是否正在等待开始游戏
        
        // 角色动画（让袁老板的右下角与背景右下角对齐）
        // 首先获取缩放后的袁老板尺寸（假设原始尺寸为 300x400，缩放后为 100x133）
        const manScaledWidth = 100;  // 缩放后宽度 （将在渲染时根据实际图片计算）
        const manScaledHeight = 133; // 缩放后高度
        
        // 计算袁老板的位置，让右下角与画布右下角对齐
        this.manX = this.canvas.width - manScaledWidth; // 右侧对齐
        this.manY = this.canvas.height - manScaledHeight; // 底部对齐
        this.targetManX = this.canvas.width - manScaledWidth - 100; // 目标位置向左偏移100像素
        this.slideSpeed = 300;
        
        console.log(`画布尺寸: ${this.canvas.width} x ${this.canvas.height}`);
        console.log(`袁老板对齐位置: 起始(${this.manX}, ${this.manY}), 目标(${this.targetManX}, ${this.manY})`);
        
        // 对话框位置（相对于袁老板的位置动态计算）
        // 将在渲染时根据袁老板的实际位置计算
        this.messageOffsetX = 80; // 相对于袁老板的X偏移量（左侧）
        this.messageOffsetY = -150; // 相对于袁老板的Y偏移量（上方）
        
        // 按钮位置和状态（中间分三行居中显示）
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // 使用默认尺寸，后续会根据图片实际尺寸调整
        const defaultButtonWidth = 100;
        const defaultButtonHeight = 60;
        const buttonSpacing = 120; // 增加按钮间距，从80改为120
        
        this.buttons = {
            one: { 
                x: centerX - defaultButtonWidth / 2, 
                y: centerY - buttonSpacing, 
                width: defaultButtonWidth, 
                height: defaultButtonHeight, 
                visible: false 
            },
            two: { 
                x: centerX - defaultButtonWidth / 2, 
                y: centerY, 
                width: defaultButtonWidth, 
                height: defaultButtonHeight, 
                visible: false 
            },
            three: { 
                x: centerX - defaultButtonWidth / 2, 
                y: centerY + buttonSpacing, 
                width: defaultButtonWidth, 
                height: defaultButtonHeight, 
                visible: false 
            }
        };
        
        // 回调函数
        this.onTimeChoice = null;
        this.onReplayChoice = null;
        
        this.setResources();
    }
    
    // 设置资源
    setResources() {
        if (this.resources) {
            this.manImage = this.resources['guide'];
            this.messageImage = this.resources['message'];
            this.oneImage = this.resources['one'];
            this.twoImage = this.resources['two'];
            this.threeImage = this.resources['three'];
            
            console.log('DialogManager 资源加载状态:');
            console.log('guide (man):', this.manImage ? '加载成功' : '加载失败');
            console.log('message:', this.messageImage ? '加载成功' : '加载失败');
            console.log('one.png:', this.oneImage ? '加载成功' : '加载失败');
            console.log('two.png:', this.twoImage ? '加载成功' : '加载失败');
            console.log('three.png:', this.threeImage ? '加载成功' : '加载失败');
            
            // 根据图片实际尺寸更新按钮位置
            this.updateButtonSizes();
        }
    }
    
    // 根据图片实际尺寸更新按钮位置
    updateButtonSizes() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const buttonSpacing = 120; // 按钮间距
        
        // 获取图片的实际尺寸，如果图片未加载则使用默认尺寸
        const buttonWidth = this.oneImage ? this.oneImage.width : 100;
        const buttonHeight = this.oneImage ? this.oneImage.height : 60;
        
        // 标题位置： centerY - 150，所以按钮起始位置应该在标题下方25px
        const titleY = centerY - 150;
        const buttonsStartY = titleY + 25; // 标题下方25px的间距
        
        console.log(`按钮布局: 屏幕中心(${centerX}, ${centerY}), 标题Y: ${titleY}, 按钮起始Y: ${buttonsStartY}, 按钮尺寸(${buttonWidth} x ${buttonHeight}), 间距: ${buttonSpacing}`);
        
        // 按钮水平居中，垂直从标题下方25px开始排列
        this.buttons.one.x = centerX - buttonWidth / 2;
        this.buttons.one.y = buttonsStartY;
        this.buttons.one.width = buttonWidth;
        this.buttons.one.height = buttonHeight;
        
        this.buttons.two.x = centerX - buttonWidth / 2;
        this.buttons.two.y = buttonsStartY + buttonSpacing;
        this.buttons.two.width = buttonWidth;
        this.buttons.two.height = buttonHeight;
        
        this.buttons.three.x = centerX - buttonWidth / 2;
        this.buttons.three.y = buttonsStartY + buttonSpacing * 2;
        this.buttons.three.width = buttonWidth;
        this.buttons.three.height = buttonHeight;
        
        console.log(`按钮位置计算完成:`);
        console.log(`  按钮1: (${this.buttons.one.x}, ${this.buttons.one.y})`);
        console.log(`  按钮2: (${this.buttons.two.x}, ${this.buttons.two.y})`);
        console.log(`  按钮3: (${this.buttons.three.x}, ${this.buttons.three.y})`);
    }
    
    // 响应式布局：在窗口大小变化时重新计算位置
    updateLayout() {
        // 更新画布尺寸
        this.canvas = this.ctx.canvas;
        
        console.log(`窗口尺寸变化: ${this.canvas.width} x ${this.canvas.height}`);
        
        // 重新计算角色位置
        this.manY = Math.max(50, this.canvas.height - 500);
        this.targetManX = this.canvas.width - 350;
        this.messageX = this.canvas.width - 500;
        this.messageY = Math.max(100, this.canvas.height - 450);
        
        // 重新计算按钮位置，确保始终居中显示
        this.updateButtonSizes();
        
        console.log('响应式布局更新完成');
    }
    
    // 开始欢迎对话
    startWelcomeDialog(onTimeChoice) {
        console.log('开始欢迎对话，设置状态为 sliding_in');
        this.onTimeChoice = onTimeChoice;
        this.dialogState = 'sliding_in';
        this.currentDialog = '我是袁老板，欢迎来到我的鱼塘，你想玩几分钟';
        this.displayedText = '';
        this.textIndex = 0;
        this.lastTextTime = 0;
        this.waitingForStart = false;
        
        // 使用动态计算的位置（如果图片已加载）
        if (this.manImage) {
            const scaledWidth = this.manImage.width / 3;
            const scaledHeight = this.manImage.height / 3;
            this.manX = this.canvas.width - scaledWidth; // 从右侧开始
            this.targetManX = this.canvas.width - scaledWidth - 100; // 目标位置
            this.manY = this.canvas.height - scaledHeight; // 底部对齐
        } else {
            // 如果图片未加载，使用默认值
            this.manX = this.canvas.width - 100;
            this.targetManX = this.canvas.width - 200;
            this.manY = this.canvas.height - 133;
        }
        
        console.log(`重置袁老板位置: 起始(${this.manX}, ${this.manY}) -> 目标(${this.targetManX}, ${this.manY})`);
        this.hideButtons();
    }
    
    // 开始结束对话
    startEndDialog(onReplayChoice) {
        this.onReplayChoice = onReplayChoice;
        this.dialogState = 'sliding_in';
        this.currentDialog = '时间到了，要再玩一次吗';
        this.displayedText = '';
        this.textIndex = 0;
        this.lastTextTime = 0;
        this.manX = this.canvas.width; // 重置位置
        this.hideButtons();
    }
    
    // 隐藏所有按钮
    hideButtons() {
        this.buttons.one.visible = false;
        this.buttons.two.visible = false;
        this.buttons.three.visible = false;
    }
    
    // 显示选择按钮
    showButtons() {
        this.buttons.one.visible = true;
        this.buttons.two.visible = true;
        this.buttons.three.visible = true;
    }
    
    // 更新对话系统
    update(deltaTime) {
        const currentTime = Date.now();
        
        switch (this.dialogState) {
            case 'sliding_in':
                this.updateSlideIn(deltaTime);
                break;
            case 'talking':
                this.updateTextDisplay(currentTime);
                break;
            case 'waiting_start':
                // 等待用户按键或点击，不需要更新
                break;
            case 'waiting_choice':
                // 等待用户选择，不需要更新
                break;
            case 'sliding_out':
                this.updateSlideOut(deltaTime);
                break;
        }
    }
    
    // 更新滑入动画
    updateSlideIn(deltaTime) {
        if (this.manX > this.targetManX) {
            const oldX = this.manX;
            this.manX -= this.slideSpeed * deltaTime;
            console.log(`袁老板滑动: ${oldX.toFixed(1)} → ${this.manX.toFixed(1)}, 目标: ${this.targetManX}`);
            
            if (this.manX <= this.targetManX) {
                this.manX = this.targetManX;
                this.dialogState = 'talking';
                this.lastTextTime = Date.now();
                console.log('袁老板滑动完成，开始对话');
            }
        }
    }
    
    // 更新文字显示
    updateTextDisplay(currentTime) {
        if (currentTime - this.lastTextTime >= this.textSpeed && this.textIndex < this.currentDialog.length) {
            this.displayedText += this.currentDialog[this.textIndex];
            this.textIndex++;
            this.lastTextTime = currentTime;
            
            // 文字显示完毕，进入等待开始状态
            if (this.textIndex >= this.currentDialog.length) {
                this.dialogState = 'waiting_start';
                this.waitingForStart = true;
            }
        }
    }
    
    // 更新滑出动画
    updateSlideOut(deltaTime) {
        if (this.manX < this.canvas.width) {
            this.manX += this.slideSpeed * deltaTime;
            if (this.manX >= this.canvas.width) {
                this.manX = this.canvas.width;
                this.dialogState = 'hidden';
            }
        }
    }
    
    // 渲染对话系统
    render() {
        if (this.dialogState === 'hidden') return;
        
        console.log(`对话系统渲染 - 状态: ${this.dialogState}`);
        
        // 渲染角色
        if (this.manImage) {
            // 计算缩放后的尺寸（缩小3倍）
            const scaledWidth = this.manImage.width / 3;
            const scaledHeight = this.manImage.height / 3;
            
            // 重新计算位置，让袁老板的右下角与背景右下角对齐
            if (this.dialogState === 'sliding_in') {
                // 滑动过程中不重新计算位置
            } else {
                // 初始状态或其他状态时重新计算位置
                this.manX = this.canvas.width - scaledWidth;
                this.manY = this.canvas.height - scaledHeight;
                this.targetManX = this.canvas.width - scaledWidth - 100;
            }
            
            console.log(`渲染袁老板: 位置(${this.manX}, ${this.manY}), 原始尺寸(${this.manImage.width}x${this.manImage.height}), 缩放后(${scaledWidth}x${scaledHeight})`);
            this.ctx.drawImage(this.manImage, this.manX, this.manY, scaledWidth, scaledHeight);
        } else {
            console.log('袁老板图片未加载，显示占位符');
            // 如果图片未加载，显示占位符
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
            this.ctx.fillRect(this.manX, this.manY, 150, 200);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillText('袁老板', this.manX + 10, this.manY + 100);
        }
        
        // 渲染对话框
        if (this.messageImage && (this.dialogState === 'talking' || this.dialogState === 'waiting_start' || this.dialogState === 'waiting_choice')) {
            // 动态计算对话框位置，相对于袁老板的位置
            this.messageX = this.manX + this.messageOffsetX;
            this.messageY = this.manY + this.messageOffsetY;
            
            console.log(`对话框位置: (${this.messageX}, ${this.messageY}), 相对于袁老板(${this.manX}, ${this.manY})`);
            
            this.ctx.drawImage(this.messageImage, this.messageX, this.messageY);
            
            // 渲染对话文字
            this.ctx.fillStyle = '#000000';
            this.ctx.font = '18px Arial';
            this.ctx.textAlign = 'center';
            
            // 将文字分行显示（按逗号分行）
            const words = this.displayedText;
            const maxWidth = 300; // 保留原有宽度限制作为备用
            const lines = this.wrapText(words, maxWidth);
            
            console.log(`对话文字分行结果:`, lines);
            
            // 计算对话框内文字的位置（让文字在对话框内居中显示）
            const textCenterX = this.messageX + (this.messageImage.width / 2);
            
            // 计算文字区域的总高度
            const totalTextHeight = lines.length * 25;
            // 让文字在对话框内垂直居中
            const textStartY = this.messageY + (this.messageImage.height / 2) - (totalTextHeight / 2) + 12; // +12是字体基线调整
            
            console.log(`文字位置: 中心X=${textCenterX}, 起始Y=${textStartY}, 行数=${lines.length}, 文字总高度=${totalTextHeight}`);
            
            lines.forEach((line, index) => {
                this.ctx.fillText(
                    line, 
                    textCenterX, // 对话框中心X位置
                    textStartY + index * 25 // 每行间距25像素
                );
            });
            
            // 调试：显示袁老板和对话框的边界框
            if (false) { // 设为false关闭调试边框
                // 袁老板边框（绿色）
                if (this.manImage) {
                    const scaledWidth = this.manImage.width / 3;
                    const scaledHeight = this.manImage.height / 3;
                    this.ctx.strokeStyle = 'green';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(this.manX, this.manY, scaledWidth, scaledHeight);
                }
                
                // 对话框边框（蓝色）
                if (this.messageImage) {
                    this.ctx.strokeStyle = 'blue';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(this.messageX, this.messageY, this.messageImage.width, this.messageImage.height);
                }
                
                // 文字中心点标记（黄色）
                const debugTextCenterX = this.messageX + (this.messageImage.width / 2);
                const totalTextHeight = lines.length * 25;
                const debugTextStartY = this.messageY + (this.messageImage.height / 2) - (totalTextHeight / 2) + 12;
                this.ctx.fillStyle = 'yellow';
                this.ctx.beginPath();
                this.ctx.arc(debugTextCenterX, debugTextStartY, 5, 0, 2 * Math.PI);
                this.ctx.fill();
                
                // 文字区域中心点标记（红色）
                const textAreaCenterY = debugTextStartY + (totalTextHeight / 2);
                this.ctx.fillStyle = 'red';
                this.ctx.beginPath();
                this.ctx.arc(debugTextCenterX, textAreaCenterY, 3, 0, 2 * Math.PI);
                this.ctx.fill();
                
                // 对话框中心点标记（橙色）
                const messageCenterX = this.messageX + (this.messageImage.width / 2);
                const messageCenterY = this.messageY + (this.messageImage.height / 2);
                this.ctx.fillStyle = 'orange';
                this.ctx.beginPath();
                this.ctx.arc(messageCenterX, messageCenterY, 3, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }
        
        // 在waiting_start状态时显示“按任意键开始游戏”提示
        if (this.dialogState === 'waiting_start') {
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            
            // 在画面中间显示提示文字
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            
            // 添加半透明背景
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(centerX - 200, centerY - 30, 400, 60);
            
            // 显示文字
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillText('按任意键开始游戏', centerX, centerY + 8);
        }
        
        // 渲染选择按钮
        if (this.dialogState === 'waiting_choice') {
            // 渲染选择提示
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 渲染标题
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 32px Arial';
            this.ctx.textAlign = 'center';
            
            const titleText = this.currentDialog.includes('玩几分钟') ? '请选择游戏时间' : '是否继续游戏';
            this.ctx.fillText(titleText, this.canvas.width / 2, this.canvas.height / 2 - 150);
            
            this.renderButtons();
        }
    }
    
    // 文字换行处理
    wrapText(text, maxWidth) {
        // 按逗号分行处理
        if (text.includes('，')) {
            const parts = text.split('，');
            const lines = [];
            
            for (let i = 0; i < parts.length; i++) {
                let line = parts[i].trim();
                if (i < parts.length - 1) {
                    line += '，'; // 除了最后一行，其他行都保留逗号
                }
                if (line) {
                    lines.push(line);
                }
            }
            
            return lines;
        }
        
        // 原有的按宽度换行逻辑（作为备用）
        const lines = [];
        let currentLine = '';
        
        for (let i = 0; i < text.length; i++) {
            const testLine = currentLine + text[i];
            const metrics = this.ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = text[i];
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine !== '') {
            lines.push(currentLine);
        }
        
        return lines;
    }
    
    // 渲染按钮
    renderButtons() {
        // 使用用户提供的图片素材，使用原始尺寸
        if (this.buttons.one.visible && this.oneImage) {
            this.ctx.drawImage(this.oneImage, this.buttons.one.x, this.buttons.one.y);
        }
        if (this.buttons.two.visible && this.twoImage) {
            this.ctx.drawImage(this.twoImage, this.buttons.two.x, this.buttons.two.y);
        }
        if (this.buttons.three.visible && this.threeImage) {
            this.ctx.drawImage(this.threeImage, this.buttons.three.x, this.buttons.three.y);
        }
        
        // 如果图片未加载，显示备用按钮
        if (this.buttons.one.visible && !this.oneImage) {
            this.renderFallbackButton(this.buttons.one, '1分钟'); // 对应 one.png
        }
        if (this.buttons.two.visible && !this.twoImage) {
            this.renderFallbackButton(this.buttons.two, '2分钟'); // 对应 two.png
        }
        if (this.buttons.three.visible && !this.threeImage) {
            this.renderFallbackButton(this.buttons.three, '3分钟'); // 对应 three.png
        }
    }
    
    // 渲染备用按钮（当图片未加载时使用）
    renderFallbackButton(button, text) {
        // 绘制按钮背景
        this.ctx.fillStyle = 'rgba(0, 102, 204, 0.8)';
        this.ctx.fillRect(button.x, button.y, button.width, button.height);
        
        // 绘制按钮边框
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(button.x, button.y, button.width, button.height);
        
        // 绘制按钮文字
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            text,
            button.x + button.width / 2,
            button.y + button.height / 2 + 6
        );
        
        // 恢复文字对齐方式
        this.ctx.textAlign = 'left';
    }
    
    // 处理键盘按键事件
    handleKeyPress() {
        if (this.dialogState === 'waiting_start') {
            this.dialogState = 'waiting_choice';
            this.showButtons();
            return true;
        }
        return false;
    }
    
    // 处理点击事件
    handleClick(x, y) {
        // 如果在等待开始状态，点击屏幕任意位置都可以开始
        if (this.dialogState === 'waiting_start') {
            this.dialogState = 'waiting_choice';
            this.showButtons();
            return true;
        }
        
        if (this.dialogState !== 'waiting_choice') return false;
        
        // 检查按钮点击
        if (this.isButtonClicked(this.buttons.one, x, y)) {
            this.handleButtonClick(1);
            return true;
        } else if (this.isButtonClicked(this.buttons.two, x, y)) {
            this.handleButtonClick(2);
            return true;
        } else if (this.isButtonClicked(this.buttons.three, x, y)) {
            this.handleButtonClick(3);
            return true;
        }
        
        return false;
    }
    
    // 检查按钮是否被点击
    isButtonClicked(button, x, y) {
        if (!button.visible) return false;
        
        // 如果有图片，使用图片的实际尺寸
        let buttonWidth = button.width;
        let buttonHeight = button.height;
        
        // 优先使用图片的实际尺寸
        if (button === this.buttons.one && this.oneImage) {
            buttonWidth = this.oneImage.width;
            buttonHeight = this.oneImage.height;
        } else if (button === this.buttons.two && this.twoImage) {
            buttonWidth = this.twoImage.width;
            buttonHeight = this.twoImage.height;
        } else if (button === this.buttons.three && this.threeImage) {
            buttonWidth = this.threeImage.width;
            buttonHeight = this.threeImage.height;
        }
        
        return x >= button.x && x <= button.x + buttonWidth &&
               y >= button.y && y <= button.y + buttonHeight;
    }
    
    // 处理按钮点击
    handleButtonClick(buttonNumber) {
        this.hideButtons();
        this.dialogState = 'sliding_out';
        
        // 根据当前对话类型调用相应回调
        if (this.currentDialog.includes('玩几分钟')) {
            // 欢迎对话，选择游戏时间
            if (this.onTimeChoice) {
                this.onTimeChoice(buttonNumber);
            }
        } else if (this.currentDialog.includes('再玩一次')) {
            // 结束对话，选择是否重玩
            if (this.onReplayChoice) {
                this.onReplayChoice(buttonNumber);
            }
        }
    }
    
    // 检查是否处于活跃状态
    isActive() {
        return this.dialogState !== 'hidden';
    }
    
    // 检查是否应该显示（游戏进行时不显示）
    shouldShow(gameState) {
        // 只在欢迎对话和结束对话时显示
        return gameState === 'welcome_dialog' || gameState === 'end_dialog';
    }
    
    // 强制隐藏对话
    hide() {
        this.dialogState = 'hidden';
        this.hideButtons();
    }
}this.messageOffsetX = -250; // 负数=左侧，正数=右侧
this.messageOffsetY = -100; // 负数=上方，正数=下方
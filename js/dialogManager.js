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
        this.amusementImage = null; // 新增：娱乐模式图片
        this.studyImage = null; // 新增：学习模式图片
        
        // 对话状态
        this.dialogState = 'hidden'; // hidden, sliding_in, talking, waiting_start, waiting_mode_choice, waiting_time_choice, sliding_out
        this.currentDialog = '';
        this.displayedText = '';
        this.textIndex = 0;
        this.lastTextTime = 0;
        this.textSpeed = 80; // 每个字显示间隔（毫秒）
        this.waitingForStart = false; // 是否正在等待开始游戏
        this.currentMode = null; // 当前选择的模式：'amusement' 或 'study'
        
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
        
        // 时间选择按钮（纵向排列）
        this.timeButtons = {
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
        
        // 模式选择按钮（按癨5行5列网格布局）
        // 屏幕分为5行：标题在第2行，按钮在第3行
        // 屏幕分为5列：娱乐模式在第2列，学习模式在第4列
        const rowHeight = this.canvas.height / 5;  // 每行高度
        const colWidth = this.canvas.width / 5;    // 每列宽度
        
        // 第3行中心作为按钮的Y位置
        const buttonY = rowHeight * 2.5 - (defaultButtonHeight / 2); // 第3行中心
        
        this.modeButtons = {
            amusement: {
                x: colWidth * 1.5 - (defaultButtonWidth / 2), // 第2列中心
                y: buttonY,
                width: defaultButtonWidth,
                height: defaultButtonHeight,
                visible: false
            },
            study: {
                x: colWidth * 3.5 - (defaultButtonWidth / 2), // 第4列中心
                y: buttonY,
                width: defaultButtonWidth,
                height: defaultButtonHeight,
                visible: false
            }
        };
        
        // 回调函数
        this.onModeChoice = null; // 新增：模式选择回调
        this.onTimeChoice = null;
        this.onStudyChoice = null; // 新增：学习选择回调
        this.onReplayChoice = null;
        
        // 学习模式选择按钮（纵向排列）
        this.studyButtons = {
            beidanci: { 
                x: centerX - defaultButtonWidth / 2, 
                y: centerY - buttonSpacing, 
                width: defaultButtonWidth, 
                height: defaultButtonHeight, 
                visible: false 
            },
            pindanci: { 
                x: centerX - defaultButtonWidth / 2, 
                y: centerY, 
                width: defaultButtonWidth, 
                height: defaultButtonHeight, 
                visible: false 
            },
            dancipipei: { 
                x: centerX - defaultButtonWidth / 2, 
                y: centerY + buttonSpacing, 
                width: defaultButtonWidth, 
                height: defaultButtonHeight, 
                visible: false 
            }
        };
        
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
            this.amusementImage = this.resources['amusement']; // 新增
            this.studyImage = this.resources['study']; // 新增
            this.beidanciImage = this.resources['beidanci']; // 学习模式按钮
            this.pindanciImage = this.resources['pindanci']; // 学习模式按钮
            this.dancipipeiImage = this.resources['dancipipei']; // 学习模式按钮
            
            console.log('DialogManager 资源加载状态:');
            console.log('guide (man):', this.manImage ? '加载成功' : '加载失败');
            console.log('message:', this.messageImage ? '加载成功' : '加载失败');
            console.log('one.png:', this.oneImage ? '加载成功' : '加载失败');
            console.log('two.png:', this.twoImage ? '加载成功' : '加载失败');
            console.log('three.png:', this.threeImage ? '加载成功' : '加载失败');
            console.log('amusement.png:', this.amusementImage ? '加载成功' : '加载失败');
            console.log('study.png:', this.studyImage ? '加载成功' : '加载失败');
            console.log('beidanci.png:', this.beidanciImage ? '加载成功' : '加载失败');
            console.log('pindanci.png:', this.pindanciImage ? '加载成功' : '加载失败');
            console.log('dancipipei.png:', this.dancipipeiImage ? '加载成功' : '加载失败');
            
            // 根据图片实际尺寸更新按钮位置
            this.updateButtonSizes();
        }
    }
    
    // 根据图片实际尺寸更新按钮位置
    updateButtonSizes() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const buttonSpacing = 120; // 按钮间距
        
        // 获取时间选择按钮的实际尺寸，如果图片未加载则使用默认尺寸
        const timeButtonWidth = this.oneImage ? this.oneImage.width : 100;
        const timeButtonHeight = this.oneImage ? this.oneImage.height : 60;
        
        // 获取学习选择按钮的实际尺寸，如果图片未加载则使用默认尺寸
        const studySelectionButtonWidth = this.beidanciImage ? this.beidanciImage.width : 100;
        const studySelectionButtonHeight = this.beidanciImage ? this.beidanciImage.height : 60;
        
        // 获取模式选择按钮的实际尺寸（都缩小到相同高度）
        // 计算缩放比例，让娱乐模式和学习模式等高
        let amusementButtonWidth = 100;
        let amusementButtonHeight = 60;
        let studyButtonWidth = 100;
        let studyButtonHeight = 60;
        
        if (this.amusementImage && this.studyImage) {
            // 学习模式缩小6倍的高度作为基准
            const targetHeight = this.studyImage.height / 6;
            
            // 计算娱乐模式需要的缩放比例来达到相同高度
            const amusementScale = this.amusementImage.height / targetHeight;
            amusementButtonWidth = this.amusementImage.width / amusementScale;
            amusementButtonHeight = targetHeight;
            
            // 学习模式保持6倍缩小
            studyButtonWidth = this.studyImage.width / 6;
            studyButtonHeight = this.studyImage.height / 6;
        } else if (this.amusementImage) {
            amusementButtonWidth = this.amusementImage.width / 3;
            amusementButtonHeight = this.amusementImage.height / 3;
        } else if (this.studyImage) {
            studyButtonWidth = this.studyImage.width / 6;
            studyButtonHeight = this.studyImage.height / 6;
        }
        
        // 标题位置： centerY - 150，所以按钮起始位置应该在标题下方25px
        const titleY = centerY - 150;
        const buttonsStartY = titleY + 25; // 标题下方25px的间距
        
        console.log(`按钮布局: 屏幕中心(${centerX}, ${centerY}), 标题Y: ${titleY}, 按钮起始Y: ${buttonsStartY}`);
        console.log(`时间按钮尺寸(${timeButtonWidth} x ${timeButtonHeight}), 娱乐按钮尺寸(${amusementButtonWidth} x ${amusementButtonHeight}), 学习按钮尺寸(${studyButtonWidth} x ${studyButtonHeight})`);
        
        // 时间选择按钮水平居中，垂直从标题下方25px开始排列
        this.timeButtons.one.x = centerX - timeButtonWidth / 2;
        this.timeButtons.one.y = buttonsStartY;
        this.timeButtons.one.width = timeButtonWidth;
        this.timeButtons.one.height = timeButtonHeight;
        
        this.timeButtons.two.x = centerX - timeButtonWidth / 2;
        this.timeButtons.two.y = buttonsStartY + buttonSpacing;
        this.timeButtons.two.width = timeButtonWidth;
        this.timeButtons.two.height = timeButtonHeight;
        
        this.timeButtons.three.x = centerX - timeButtonWidth / 2;
        this.timeButtons.three.y = buttonsStartY + buttonSpacing * 2;
        this.timeButtons.three.width = timeButtonWidth;
        this.timeButtons.three.height = timeButtonHeight;
        
        // 模式选择按钮水平居中，使用5行5列网格布局
        // 屏幕分为5行：标题在第2行，按钮在第3行
        // 屏幕分为5列：娱乐模式在第2列，学习模式在第4列
        const rowHeight = this.canvas.height / 5;  // 每行高度
        const colWidth = this.canvas.width / 5;    // 每列宽度
        
        // 第3行中心作为按钮的Y位置
        const amusementButtonY = rowHeight * 2.5 - (amusementButtonHeight / 2); // 第3行中心
        const studyButtonY = rowHeight * 2.5 - (studyButtonHeight / 2); // 第3行中心
        
        this.modeButtons.amusement.x = colWidth * 1.5 - amusementButtonWidth / 2; // 第2列中心
        this.modeButtons.amusement.y = amusementButtonY;
        this.modeButtons.amusement.width = amusementButtonWidth;
        this.modeButtons.amusement.height = amusementButtonHeight;
        
        this.modeButtons.study.x = colWidth * 3.5 - studyButtonWidth / 2; // 第4列中心
        this.modeButtons.study.y = studyButtonY;
        this.modeButtons.study.width = studyButtonWidth;
        this.modeButtons.study.height = studyButtonHeight;
        
        // 学习选择按钮水平居中，垂直从标题下方25px开始排列
        this.studyButtons.beidanci.x = centerX - studySelectionButtonWidth / 2;
        this.studyButtons.beidanci.y = buttonsStartY;
        this.studyButtons.beidanci.width = studySelectionButtonWidth;
        this.studyButtons.beidanci.height = studySelectionButtonHeight;
        
        this.studyButtons.pindanci.x = centerX - studySelectionButtonWidth / 2;
        this.studyButtons.pindanci.y = buttonsStartY + buttonSpacing;
        this.studyButtons.pindanci.width = studySelectionButtonWidth;
        this.studyButtons.pindanci.height = studySelectionButtonHeight;
        
        this.studyButtons.dancipipei.x = centerX - studySelectionButtonWidth / 2;
        this.studyButtons.dancipipei.y = buttonsStartY + buttonSpacing * 2;
        this.studyButtons.dancipipei.width = studySelectionButtonWidth;
        this.studyButtons.dancipipei.height = studySelectionButtonHeight;
        
        console.log(`时间按钮位置计算完成:`);
        console.log(`  按钮1: (${this.timeButtons.one.x}, ${this.timeButtons.one.y})`);
        console.log(`  按钮2: (${this.timeButtons.two.x}, ${this.timeButtons.two.y})`);
        console.log(`  按钮3: (${this.timeButtons.three.x}, ${this.timeButtons.three.y})`);
        console.log(`模式按钮位置计算完成 (5行5列布局):`);
        console.log(`  屏幕尺寸: ${this.canvas.width} x ${this.canvas.height}`);
        console.log(`  行高: ${rowHeight}, 列宽: ${colWidth}`);
        console.log(`  标题Y位置 (第2行中心): ${rowHeight * 1.5}`);
        console.log(`  娱乐按钮Y位置 (第3行中心): ${amusementButtonY}`);
        console.log(`  学习按钮Y位置 (第3行中心): ${studyButtonY}`);
        console.log(`  娱乐模式 (第2列): (${this.modeButtons.amusement.x}, ${this.modeButtons.amusement.y}) 尺寸: ${amusementButtonWidth}x${amusementButtonHeight}`);
        console.log(`  学习模式 (第4列): (${this.modeButtons.study.x}, ${this.modeButtons.study.y}) 尺寸: ${studyButtonWidth}x${studyButtonHeight}`);
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
    startWelcomeDialog() {
        console.log('开始欢迎对话，设置状态为 sliding_in');
        // 清除所有回调函数，确保状态重置
        this.onModeChoice = null;
        this.onTimeChoice = null;
        this.onStudyChoice = null;
        this.onReplayChoice = null;
        
        this.dialogState = 'sliding_in';
        this.currentDialog = '我是袁老板，欢迎来到我的鱼塘'; // 更新为简化的欢迎词
        this.displayedText = '';
        this.textIndex = 0;
        this.lastTextTime = 0;
        this.waitingForStart = false;
        this.currentMode = null; // 重置模式选择
        
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
        this.hideAllButtons();
    }
    
    // 开始模式选择对话
    startModeSelectionDialog(onModeChoice) {
        console.log('开始模式选择对话');
        // 清除其他回调函数
        this.onTimeChoice = null;
        this.onStudyChoice = null;
        this.onReplayChoice = null;
        // 设置模式选择回调
        this.onModeChoice = onModeChoice;
        this.dialogState = 'talking'; // 直接设置为说话状态，因为袁老板已经在位置上
        this.currentDialog = DialogConfig.MODE_SELECTION_TEXT; // '请选择游戏模式：娱乐模式还是学习模式'
        this.displayedText = '';
        this.textIndex = 0;
        this.lastTextTime = 0;
        this.waitingForStart = false;
        
        this.hideAllButtons();
        console.log('模式选择对话开始，待显示文本:', this.currentDialog);
    }
    
    // 开始时间选择对话
    startTimeSelectionDialog(onTimeChoice) {
        console.log('开始时间选择对话');
        // 清除其他回调函数
        this.onModeChoice = null;
        this.onStudyChoice = null;
        this.onReplayChoice = null;
        // 设置时间选择回调
        this.onTimeChoice = onTimeChoice;
        this.dialogState = 'talking';
        this.currentDialog = DialogConfig.TIME_SELECTION_TEXT; // '请选择游戏时长'
        this.displayedText = '';
        this.textIndex = 0;
        this.lastTextTime = 0;
        this.waitingForStart = false;
        
        this.hideAllButtons();
        console.log('时间选择对话开始，待显示文本:', this.currentDialog);
    }
    
    // 开始学习选择对话
    startStudySelectionDialog(onStudyChoice) {
        console.log('开始学习选择对话');
        // 清除其他回调函数
        this.onModeChoice = null;
        this.onTimeChoice = null;
        this.onReplayChoice = null;
        // 设置学习选择回调
        this.onStudyChoice = onStudyChoice;
        this.dialogState = 'talking';
        this.currentDialog = DialogConfig.STUDY_SELECTION_TEXT; // '请选择学习内容'
        this.displayedText = '';
        this.textIndex = 0;
        this.lastTextTime = 0;
        this.waitingForStart = false;
        
        this.hideAllButtons();
        console.log('学习选择对话开始，待显示文本:', this.currentDialog);
    }
    
    // 开始结束对话
    startEndDialog(onReplayChoice) {
        console.log('开始结束对话（模式选择）');
        // 清除所有其他回调函数
        this.onTimeChoice = null;
        this.onStudyChoice = null;
        this.onReplayChoice = null;
        // 设置模式选择回调
        this.onModeChoice = onReplayChoice; // 改为模式选择回调
        this.dialogState = 'sliding_in';
        this.currentDialog = DialogConfig.MODE_SELECTION_TEXT; // 使用模式选择文本
        this.displayedText = '';
        this.textIndex = 0;
        this.lastTextTime = 0;
        this.manX = this.canvas.width; // 重置位置
        this.hideAllButtons();
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
            
            // 文字显示完毕，根据对话内容决定下一个状态
            if (this.textIndex >= this.currentDialog.length) {
                if (this.currentDialog.includes('欢迎来到我的鱼塘')) {
                    // 欢迎对话结束，等待用户触发进入模式选择
                    this.dialogState = 'waiting_start';
                    this.waitingForStart = true;
                } else if (this.currentDialog.includes('请选择游戏模式')) {
                    // 模式选择对话结束（包括结束对话），显示模式按钮
                    this.dialogState = 'waiting_mode_choice';
                    this.showModeButtons();
                } else if (this.currentDialog.includes('请选择学习内容')) {
                    // 学习内容选择对话结束，显示学习按钮
                    this.dialogState = 'waiting_study_choice';
                    this.showStudyButtons();
                } else if (this.currentDialog.includes('请选择游戏时长')) {
                    // 时间选择对话结束，显示时间按钮
                    this.dialogState = 'waiting_time_choice';
                    this.showTimeButtons();
                } else {
                    // 其他对话
                    this.dialogState = 'waiting_choice';
                }
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
        if (this.dialogState === 'waiting_mode_choice') {
            // 模式选择状态
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 渲染标题（第2行居中）
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 32px Arial';
            this.ctx.textAlign = 'center';
            
            const rowHeight = this.canvas.height / 5;  // 每行高度
            const titleY = rowHeight * 1.5; // 第2行中心
            
            this.ctx.fillText('请选择游戏模式', this.canvas.width / 2, titleY);
            
            this.renderModeButtons();
        } else if (this.dialogState === 'waiting_time_choice') {
            // 时间选择状态
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 渲染标题
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 32px Arial';
            this.ctx.textAlign = 'center';
            
            this.ctx.fillText('请选择游戏时长', this.canvas.width / 2, this.canvas.height / 2 - 150);
            
            this.renderTimeButtons();
        } else if (this.dialogState === 'waiting_study_choice') {
            // 学习选择状态
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 渲染标题
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 32px Arial';
            this.ctx.textAlign = 'center';
            
            this.ctx.fillText('请选择学习内容', this.canvas.width / 2, this.canvas.height / 2 - 150);
            
            this.renderStudyButtons();
        } else if (this.dialogState === 'waiting_choice') {
            // 原有的选择逻辑（结束对话等）
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 渲染标题
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 32px Arial';
            this.ctx.textAlign = 'center';
            
            const titleText = this.currentDialog.includes('玩几分钟') ? '请选择游戏时间' : '是否继续游戏';
            this.ctx.fillText(titleText, this.canvas.width / 2, this.canvas.height / 2 - 150);
            
            this.renderTimeButtons(); // 使用时间按钮
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
    
    // 渲染模式选择按钮
    renderModeButtons() {
        // 娱乐模式按钮（缩放到和学习模式等高）
        if (this.modeButtons.amusement.visible && this.amusementImage) {
            // 计算缩放后的尺寸，保持和学习模式等高
            let scaledWidth, scaledHeight;
            if (this.studyImage) {
                const targetHeight = this.studyImage.height / 6;
                const amusementScale = this.amusementImage.height / targetHeight;
                scaledWidth = this.amusementImage.width / amusementScale;
                scaledHeight = targetHeight;
            } else {
                scaledWidth = this.amusementImage.width / 3;
                scaledHeight = this.amusementImage.height / 3;
            }
            
            this.ctx.drawImage(
                this.amusementImage, 
                this.modeButtons.amusement.x, 
                this.modeButtons.amusement.y,
                scaledWidth,
                scaledHeight
            );
            
            // 在图片下方渲染“娱乐模式”文字
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            this.ctx.shadowBlur = 3;
            this.ctx.shadowOffsetX = 1;
            this.ctx.shadowOffsetY = 1;
            
            const textX = this.modeButtons.amusement.x + scaledWidth / 2;
            const textY = this.modeButtons.amusement.y + scaledHeight + 30; // 图片下方30px
            this.ctx.fillText('娱乐模式', textX, textY);
        }
        
        // 学习模式按钮（缩小6倍）
        if (this.modeButtons.study.visible && this.studyImage) {
            const scaledWidth = this.studyImage.width / 6; // 再缩小一倍
            const scaledHeight = this.studyImage.height / 6; // 再缩小一倍
            this.ctx.drawImage(
                this.studyImage, 
                this.modeButtons.study.x, 
                this.modeButtons.study.y,
                scaledWidth,
                scaledHeight
            );
            
            // 在图片下方渲染“学习模式”文字
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            this.ctx.shadowBlur = 3;
            this.ctx.shadowOffsetX = 1;
            this.ctx.shadowOffsetY = 1;
            
            const textX = this.modeButtons.study.x + scaledWidth / 2;
            const textY = this.modeButtons.study.y + scaledHeight + 30; // 图片下方30px
            this.ctx.fillText('学习模式', textX, textY);
        }
        
        // 清除阴影效果
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        // 如果图片未加载，显示备用按钮
        if (this.modeButtons.amusement.visible && !this.amusementImage) {
            this.renderFallbackModeButton(this.modeButtons.amusement, '娱乐模式');
        }
        if (this.modeButtons.study.visible && !this.studyImage) {
            this.renderFallbackModeButton(this.modeButtons.study, '学习模式');
        }
    }
    
    // 渲染时间选择按钮
    renderTimeButtons() {
        // 使用用户提供的图片素材，使用原始尺寸
        if (this.timeButtons.one.visible && this.oneImage) {
            this.ctx.drawImage(this.oneImage, this.timeButtons.one.x, this.timeButtons.one.y);
        }
        if (this.timeButtons.two.visible && this.twoImage) {
            this.ctx.drawImage(this.twoImage, this.timeButtons.two.x, this.timeButtons.two.y);
        }
        if (this.timeButtons.three.visible && this.threeImage) {
            this.ctx.drawImage(this.threeImage, this.timeButtons.three.x, this.timeButtons.three.y);
        }
        
        // 如果图片未加载，显示备用按钮
        if (this.timeButtons.one.visible && !this.oneImage) {
            this.renderFallbackButton(this.timeButtons.one, '1分钟');
        }
        if (this.timeButtons.two.visible && !this.twoImage) {
            this.renderFallbackButton(this.timeButtons.two, '2分钟');
        }
        if (this.timeButtons.three.visible && !this.threeImage) {
            this.renderFallbackButton(this.timeButtons.three, '3分钟');
        }
    }
    
    // 渲染学习选择按钮
    renderStudyButtons() {
        // 使用学习模式的图片素材，使用原始尺寸
        if (this.studyButtons.beidanci.visible && this.beidanciImage) {
            this.ctx.drawImage(this.beidanciImage, this.studyButtons.beidanci.x, this.studyButtons.beidanci.y);
        }
        if (this.studyButtons.pindanci.visible && this.pindanciImage) {
            this.ctx.drawImage(this.pindanciImage, this.studyButtons.pindanci.x, this.studyButtons.pindanci.y);
        }
        if (this.studyButtons.dancipipei.visible && this.dancipipeiImage) {
            this.ctx.drawImage(this.dancipipeiImage, this.studyButtons.dancipipei.x, this.studyButtons.dancipipei.y);
        }
        
        // 如果图片未加载，显示备用按钮
        if (this.studyButtons.beidanci.visible && !this.beidanciImage) {
            this.renderFallbackButton(this.studyButtons.beidanci, '背单词');
        }
        if (this.studyButtons.pindanci.visible && !this.pindanciImage) {
            this.renderFallbackButton(this.studyButtons.pindanci, '拼单词');
        }
        if (this.studyButtons.dancipipei.visible && !this.dancipipeiImage) {
            this.renderFallbackButton(this.studyButtons.dancipipei, '单词匹配');
        }
    }
    
    // 渲染模式选择备用按钮（当图片未加载时使用）
    renderFallbackModeButton(button, text) {
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
    
    // 隐藏所有按钮
    hideAllButtons() {
        // 隐藏时间选择按钮
        this.timeButtons.one.visible = false;
        this.timeButtons.two.visible = false;
        this.timeButtons.three.visible = false;
        
        // 隐藏模式选择按钮
        this.modeButtons.amusement.visible = false;
        this.modeButtons.study.visible = false;
        
        // 隐藏学习选择按钮
        this.studyButtons.beidanci.visible = false;
        this.studyButtons.pindanci.visible = false;
        this.studyButtons.dancipipei.visible = false;
        
        console.log('所有按钮已隐藏');
    }
    
    // 显示模式选择按钮
    showModeButtons() {
        this.hideAllButtons(); // 先隐藏所有按钮
        this.modeButtons.amusement.visible = true;
        this.modeButtons.study.visible = true;
        console.log('显示模式选择按钮');
    }
    
    // 显示时间选择按钮
    showTimeButtons() {
        this.hideAllButtons(); // 先隐藏所有按钮
        this.timeButtons.one.visible = true;
        this.timeButtons.two.visible = true;
        this.timeButtons.three.visible = true;
        console.log('显示时间选择按钮');
    }
    
    // 显示学习选择按钮
    showStudyButtons() {
        this.hideAllButtons(); // 先隐藏所有按钮
        this.studyButtons.beidanci.visible = true;
        this.studyButtons.pindanci.visible = true;
        this.studyButtons.dancipipei.visible = true;
        console.log('显示学习选择按钮');
    }
    
    // 处理键盘按键事件
    handleKeyPress() {
        if (this.dialogState === 'waiting_start') {
            // 欢迎对话结束后，进入模式选择
            this.dialogState = 'waiting_mode_choice';
            this.showModeButtons();
            return true;
        }
        return false;
    }
    
    // 处理点击事件
    handleClick(x, y) {
        // 如果在等待开始状态，点击屏幕任意位置都可以开始
        if (this.dialogState === 'waiting_start') {
            this.dialogState = 'waiting_mode_choice';
            this.showModeButtons();
            return true;
        }
        
        // 模式选择状态
        if (this.dialogState === 'waiting_mode_choice') {
            if (this.isModeButtonClicked(this.modeButtons.amusement, x, y)) {
                this.handleModeButtonClick('amusement');
                return true;
            } else if (this.isModeButtonClicked(this.modeButtons.study, x, y)) {
                this.handleModeButtonClick('study');
                return true;
            }
        }
        
        // 时间选择状态
        if (this.dialogState === 'waiting_time_choice') {
            if (this.isTimeButtonClicked(this.timeButtons.one, x, y)) {
                this.handleTimeButtonClick(1);
                return true;
            } else if (this.isTimeButtonClicked(this.timeButtons.two, x, y)) {
                this.handleTimeButtonClick(2);
                return true;
            } else if (this.isTimeButtonClicked(this.timeButtons.three, x, y)) {
                this.handleTimeButtonClick(3);
                return true;
            }
        }
        
        // 学习选择状态
        if (this.dialogState === 'waiting_study_choice') {
            if (this.isStudyButtonClicked(this.studyButtons.beidanci, x, y)) {
                this.handleStudyButtonClick('beidanci');
                return true;
            } else if (this.isStudyButtonClicked(this.studyButtons.pindanci, x, y)) {
                this.handleStudyButtonClick('pindanci');
                return true;
            } else if (this.isStudyButtonClicked(this.studyButtons.dancipipei, x, y)) {
                this.handleStudyButtonClick('dancipipei');
                return true;
            }
        }
        
        // 原有的选择逻辑
        if (this.dialogState === 'waiting_choice') {
            if (this.isTimeButtonClicked(this.timeButtons.one, x, y)) {
                this.handleButtonClick(1);
                return true;
            } else if (this.isTimeButtonClicked(this.timeButtons.two, x, y)) {
                this.handleButtonClick(2);
                return true;
            } else if (this.isTimeButtonClicked(this.timeButtons.three, x, y)) {
                this.handleButtonClick(3);
                return true;
            }
        }
        
        return false;
    }
    
    // 检查模式按钮是否被点击
    isModeButtonClicked(button, x, y) {
        if (!button.visible) return false;
        
        // 使用等高的缩放计算
        let buttonWidth = button.width;
        let buttonHeight = button.height;
        
        if (button === this.modeButtons.amusement && this.amusementImage) {
            if (this.studyImage) {
                const targetHeight = this.studyImage.height / 6;
                const amusementScale = this.amusementImage.height / targetHeight;
                buttonWidth = this.amusementImage.width / amusementScale;
                buttonHeight = targetHeight;
            } else {
                buttonWidth = this.amusementImage.width / 3;
                buttonHeight = this.amusementImage.height / 3;
            }
        } else if (button === this.modeButtons.study && this.studyImage) {
            buttonWidth = this.studyImage.width / 6;
            buttonHeight = this.studyImage.height / 6;
        }
        
        return x >= button.x && x <= button.x + buttonWidth &&
               y >= button.y && y <= button.y + buttonHeight;
    }
    
    // 检查时间按钮是否被点击
    isTimeButtonClicked(button, x, y) {
        if (!button.visible) return false;
        
        // 使用图片的实际尺寸
        let buttonWidth = button.width;
        let buttonHeight = button.height;
        
        if (button === this.timeButtons.one && this.oneImage) {
            buttonWidth = this.oneImage.width;
            buttonHeight = this.oneImage.height;
        } else if (button === this.timeButtons.two && this.twoImage) {
            buttonWidth = this.twoImage.width;
            buttonHeight = this.twoImage.height;
        } else if (button === this.timeButtons.three && this.threeImage) {
            buttonWidth = this.threeImage.width;
            buttonHeight = this.threeImage.height;
        }
        
        return x >= button.x && x <= button.x + buttonWidth &&
               y >= button.y && y <= button.y + buttonHeight;
    }
    
    // 处理模式按钮点击
    handleModeButtonClick(mode) {
        console.log(`选择游戏模式: ${mode}`);
        this.currentMode = mode;
        this.hideAllButtons();
        
        // 调用模式选择回调
        if (this.onModeChoice) {
            this.onModeChoice(mode);
        }
    }
    
    // 处理时间按钮点击
    handleTimeButtonClick(timeOption) {
        console.log(`选择游戏时间: ${timeOption}分钟`);
        this.hideAllButtons();
        this.dialogState = 'hidden'; // 直接隐藏，不再播放滑出动画
        
        // 调用时间选择回调
        if (this.onTimeChoice) {
            this.onTimeChoice(timeOption);
        }
    }
    
    // 处理学习按钮点击
    handleStudyButtonClick(studyOption) {
        console.log(`选择学习内容: ${studyOption}`);
        this.hideAllButtons();
        this.dialogState = 'hidden'; // 直接隐藏，不再播放滑出动画
        
        // 调用学习选择回调
        if (this.onStudyChoice) {
            this.onStudyChoice(studyOption);
        }
    }
    
    // 处理按钮点击
    handleButtonClick(buttonNumber) {
        this.hideAllButtons();
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
        this.hideAllButtons();
    }
    
    // 检查学习按钮是否被点击
    isStudyButtonClicked(button, x, y) {
        if (!button.visible) return false;
        
        // 使用图片的实际尺寸
        let buttonWidth = button.width;
        let buttonHeight = button.height;
        
        if (button === this.studyButtons.beidanci && this.beidanciImage) {
            buttonWidth = this.beidanciImage.width;
            buttonHeight = this.beidanciImage.height;
        } else if (button === this.studyButtons.pindanci && this.pindanciImage) {
            buttonWidth = this.pindanciImage.width;
            buttonHeight = this.pindanciImage.height;
        } else if (button === this.studyButtons.dancipipei && this.dancipipeiImage) {
            buttonWidth = this.dancipipeiImage.width;
            buttonHeight = this.dancipipeiImage.height;
        }
        
        return x >= button.x && x <= button.x + buttonWidth &&
               y >= button.y && y <= button.y + buttonHeight;
    }
}this.messageOffsetX = -250; // 负数=左侧，正数=右侧
this.messageOffsetY = -100; // 负数=上方，正数=下方
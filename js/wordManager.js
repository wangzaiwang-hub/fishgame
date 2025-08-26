// 单词管理器类
class WordManager {
    constructor() {
        this.words = []; // 存储所有单词数据
        this.currentWordIndex = 0; // 当前学习的单词索引
        this.completedWords = new Set(); // 已完成的单词（绿色显示）
        this.fishCaught = 0; // 当前已钓到的鱼数量
        this.targetFishCount = 20; // 目标鱼数量
        this.level = 'cet4'; // 默认四级单词
        this.gameMode = 'memorize'; // 背单词模式
        this.selectedWordIndex = 0; // 从单词墙选择的单词索引
        this.currentPage = 0; // 当前页码（每页10个单词）
        this.wordsPerPage = 10; // 每页单词数量
        this.onPageChangeCallback = null; // 页面变化回调
    }

    // 加载单词数据
    async loadWords(level = 'cet4') {
        this.level = level;
        const fileName = level === 'cet6' ? '六级-乱序.txt' : '四级-乱序.txt';
        const filePath = `resource/${fileName}`;
        
        try {
            const response = await fetch(filePath);
            const text = await response.text();
            this.parseWords(text);
            console.log(`成功加载${level}单词，共${this.words.length}个`);
        } catch (error) {
            console.error('加载单词文件失败:', error);
            // 使用默认单词数据作为备用
            this.loadDefaultWords();
        }
    }

    // 解析单词文本数据
    parseWords(text) {
        const lines = text.split('\n');
        this.words = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed) {
                // 解析格式: "word\tadj. 意思"
                const parts = trimmed.split('\t');
                if (parts.length >= 2) {
                    const word = parts[0].trim();
                    const meaning = parts[1].trim();
                    this.words.push({ word, meaning });
                }
            }
        }
        
        // 保持单词原始顺序，不再打乱
        console.log(`解析完成，共${this.words.length}个单词，保持原始顺序`);
    }

    // 加载默认单词数据（备用）
    loadDefaultWords() {
        this.words = [
            { word: 'access', meaning: 'v. 获取 n. 接近，入口' },
            { word: 'project', meaning: 'n. 工程；课题、作业' },
            { word: 'intention', meaning: 'n. 打算，意图' },
            { word: 'negotiate', meaning: 'v. 谈判，协商，交涉' },
            { word: 'alternative', meaning: 'n. 代替品' },
            { word: 'generous', meaning: 'adj. 慷慨的' },
            { word: 'strategy', meaning: 'n. 策略，战略' },
            { word: 'crucial', meaning: 'adj. 至关重要的' },
            { word: 'obstacle', meaning: 'n. 阻碍' },
            { word: 'automatic', meaning: 'adj. 自动的' }
        ];
        // 保持默认单词的原始顺序
        console.log('使用默认单词数据，保持原始顺序');
    }

    // 打乱单词顺序
    shuffleWords() {
        for (let i = this.words.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.words[i], this.words[j]] = [this.words[j], this.words[i]];
        }
    }

    // 获取当前学习的单词
    getCurrentWord() {
        if (this.selectedWordIndex < this.words.length) {
            return this.words[this.selectedWordIndex];
        }
        return null;
    }
    
    // 设置要学习的单词（从单词墙选择）
    setSelectedWord(relativeIndex) {
        // relativeIndex是在当前页中的相对索引（0-9）
        // 需要转换为绝对索引
        const absoluteIndex = this.currentPage * this.wordsPerPage + relativeIndex;
        
        if (absoluteIndex >= 0 && absoluteIndex < this.words.length) {
            this.selectedWordIndex = absoluteIndex;
            this.fishCaught = 0; // 重置进度
            console.log(`选中学习单词: 第${this.currentPage + 1}页第${relativeIndex + 1}个 - ${this.words[absoluteIndex].word} - ${this.words[absoluteIndex].meaning}`);
            console.log(`绝对索引: ${absoluteIndex}, 相对索引: ${relativeIndex}`);
            return true;
        }
        return false;
    }

    // 获取鱼身上要显示的内容（背单词模式）
    getRandomWordForFish() {
        if (this.words.length === 0) return null;
        
        const currentWord = this.getCurrentWord();
        if (!currentWord) return null;

        // 背单词模式：所有鱼都显示相同内容
        if (this.fishCaught < 10) {
            // 前10次：上方显示意思，鱼身显示单词（需要钓到单词）
            return {
                displayText: currentWord.word,
                isCorrect: true,
                word: currentWord.word,
                meaning: currentWord.meaning
            };
        } else {
            // 后10次：上方显示单词，鱼身显示意思（需要钓到意思）
            return {
                displayText: currentWord.meaning,
                isCorrect: true,
                word: currentWord.word,
                meaning: currentWord.meaning
            };
        }
    }

    // 获取干扰选项（错误答案）- 背单词模式不需要干扰项
    getDistractorForFish() {
        // 背单词模式下所有鱼都显示相同内容，不需要干扰项
        return null;
    }

    // 钓到鱼时的处理
    onFishCaught(fishData) {
        if (fishData.isCorrect) {
            // 钓到正确的鱼
            this.fishCaught++;
            console.log(`钓到正确答案！进度: ${this.fishCaught}/${this.targetFishCount}`);
            
            // 检查是否需要切换模式（前10次到后10次）
            if (this.fishCaught === 10) {
                console.log('切换到后10次模式，需要清除所有鱼类');
                // 触发清除鱼类的回调
                if (this.onStageSwitchCallback) {
                    this.onStageSwitchCallback();
                }
            }
            
            // 完成一个单词的学习（钓20次）
            if (this.fishCaught >= this.targetFishCount) {
                this.completedWords.add(this.selectedWordIndex);
                console.log(`完成单词学习: ${this.words[this.selectedWordIndex].word}`);
                
                // 检查当前页是否全部完成
                if (this.isCurrentPageCompleted()) {
                    console.log('当前页全部完成，尝试进入下一页');
                    // 自动进入下一页（如果有的话）
                    if (this.goToNextPage()) {
                        // 选中下一页的第一个单词
                        this.setSelectedWord(0); // 相对索引为0（即新页的第一个单词）
                        console.log('已自动进入下一页并选中第一个单词');
                        
                        // 触发页面变化回调
                        if (this.onPageChangeCallback) {
                            this.onPageChangeCallback();
                        }
                    } else {
                        console.log('已学完所有单词！');
                    }
                }
            }
            
            return true; // 返回true表示正确
        } else {
            console.log('钓到错误答案');
            return false; // 返回false表示错误
        }
    }
    
    // 设置阶段切换回调
    setStageSwitchCallback(callback) {
        this.onStageSwitchCallback = callback;
    }
    
    // 设置页面变化回调
    setPageChangeCallback(callback) {
        this.onPageChangeCallback = callback;
    }

    // 检查游戏是否结束
    isGameComplete() {
        return this.fishCaught >= this.targetFishCount;
    }

    // 获取当前显示文本（在倒计时位置显示）
    getCurrentDisplayText() {
        const currentWord = this.getCurrentWord();
        if (!currentWord) return '';
        
        if (this.fishCaught < 10) {
            // 前10次：上方显示意思，鱼身显示单词（需要钓单词）
            return currentWord.meaning;
        } else {
            // 后10次：上方显示单词，鱼身显示意思（需要钓意思）
            return currentWord.word;
        }
    }

    // 获取游戏进度信息
    getProgress() {
        return {
            current: this.fishCaught,
            target: this.targetFishCount,
            percentage: (this.fishCaught / this.targetFishCount) * 100,
            completedWords: this.completedWords.size,
            currentWordIndex: this.currentWordIndex,
            showMeaning: this.showMeaning
        };
    }

    // 重置游戏
    reset() {
        this.fishCaught = 0;
        this.currentWordIndex = 0;
        this.completedWords.clear();
        this.showMeaning = false;
        // 保持单词原始顺序，不再打乱
        console.log('背单词游戏重置，保持单词原始顺序');
    }

    // 获取单词墙数据（用于显示单词墙界面）
    getWordWallData() {
        const wallData = [];
        const startIndex = this.currentPage * this.wordsPerPage;
        const endIndex = Math.min(startIndex + this.wordsPerPage, this.words.length);
        
        console.log(`获取单词墙数据: 第${this.currentPage + 1}页, 索引${startIndex}-${endIndex - 1}`);
        
        for (let i = startIndex; i < endIndex; i++) {
            const relativeIndex = i - startIndex; // 在当前页中的相对索引
            wallData.push({
                word: this.words[i].word,
                meaning: this.words[i].meaning,
                completed: this.completedWords.has(i), // 使用绝对索引检查完成状态
                current: i === this.selectedWordIndex, // 使用绝对索引检查当前选中
                absoluteIndex: i, // 保存绝对索引供调试使用
                relativeIndex: relativeIndex // 保存相对索引供点击使用
            });
        }
        
        console.log('单词墙数据:', wallData.map(item => `${item.word}(${item.absoluteIndex})`).join(', '));
        return wallData;
    }
    
    // 检查当前页是否全部完成
    isCurrentPageCompleted() {
        const startIndex = this.currentPage * this.wordsPerPage;
        const endIndex = Math.min(startIndex + this.wordsPerPage, this.words.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            if (!this.completedWords.has(i)) {
                return false;
            }
        }
        return true;
    }
    
    // 进入下一页
    goToNextPage() {
        const maxPage = Math.ceil(this.words.length / this.wordsPerPage) - 1;
        if (this.currentPage < maxPage) {
            this.currentPage++;
            console.log(`进入第${this.currentPage + 1}页`);
            return true;
        }
        return false;
    }
    
    // 进入上一页
    goToPreviousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            console.log(`返回第${this.currentPage + 1}页`);
            return true;
        }
        return false;
    }
    
    // 获取分页信息
    getPageInfo() {
        const totalPages = Math.ceil(this.words.length / this.wordsPerPage);
        return {
            currentPage: this.currentPage + 1, // 显示从1开始
            totalPages: totalPages,
            hasNextPage: this.currentPage < totalPages - 1,
            hasPreviousPage: this.currentPage > 0,
            completedInCurrentPage: this.getCompletedWordsInCurrentPage(),
            totalInCurrentPage: Math.min(this.wordsPerPage, this.words.length - this.currentPage * this.wordsPerPage)
        };
    }
    
    // 获取当前页已完成的单词数量
    getCompletedWordsInCurrentPage() {
        const startIndex = this.currentPage * this.wordsPerPage;
        const endIndex = Math.min(startIndex + this.wordsPerPage, this.words.length);
        let completed = 0;
        
        for (let i = startIndex; i < endIndex; i++) {
            if (this.completedWords.has(i)) {
                completed++;
            }
        }
        
        return completed;
    }
}
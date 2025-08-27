// 单词管理器类
class WordManager {
    constructor() {
        this.words = []; // 存储所有单词数据
        this.currentWordIndex = 0; // 当前学习的单词索引
        
        // 为不同学习模式创建独立的进度追踪
        this.progressData = {
            'beidanci': {
                completedWords: new Set(), // 已完成的单词（绿色显示）
                selectedWordIndex: 0, // 从单词墙选择的单词索引
                currentPage: 0, // 当前页码（每页10个单词）
                fishCaught: 0, // 当前已钓到的鱼数量
                targetFishCount: 20 // 目标鱼数量
            },
            'pindanci': {
                completedWords: new Set(),
                selectedWordIndex: 0,
                currentPage: 0,
                fishCaught: 0,
                targetFishCount: 1, // 拼单词模式只需要拼出一次单词
                spelledLetters: [], // 已拼出的字母序列
                requiredLetters: [] // 需要的字母序列
            },
            'dancipipei': {
                completedWords: new Set(),
                selectedWordIndex: 0,
                currentPage: 0,
                fishCaught: 0,
                targetFishCount: 10, // 单词匹配模式
                currentWordIndex: 0, // 当前匹配的单词索引（在当前组中）
                errorCount: 0, // 总错误次数
                wordErrors: new Map(), // 每个单词的错误次数
                wordGroup: [], // 当前组的单词列表
                shuffledMeanings: [] // 打乱后的意思列表
            }
        };
        
        this.currentStudyMode = 'beidanci'; // 当前学习模式
        this.wordsPerPage = 10; // 每页单词数量
        this.level = 'cet4'; // 默认四级单词
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
    
    // 设置学习模式
    setStudyMode(mode) {
        if (this.progressData[mode]) {
            this.currentStudyMode = mode;
            console.log(`切换到学习模式: ${mode}`);
        } else {
            console.error(`不支持的学习模式: ${mode}`);
        }
    }
    
    // 获取当前模式的进度数据
    getCurrentProgress() {
        return this.progressData[this.currentStudyMode];
    }
    
    // 获取当前学习模式
    getCurrentStudyMode() {
        return this.currentStudyMode;
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
        const progress = this.getCurrentProgress();
        if (progress.selectedWordIndex < this.words.length) {
            return this.words[progress.selectedWordIndex];
        }
        return null;
    }
    
    // 设置要学习的单词（从单词墙选择）
    setSelectedWord(relativeIndex) {
        const progress = this.getCurrentProgress();
        // relativeIndex是在当前页中的相对索引（0-9）
        // 需要转换为绝对索引
        const absoluteIndex = progress.currentPage * this.wordsPerPage + relativeIndex;
        
        if (absoluteIndex >= 0 && absoluteIndex < this.words.length) {
            progress.selectedWordIndex = absoluteIndex;
            progress.fishCaught = 0; // 重置进度
            
            // 如果是拼单词模式，重置拼写状态
            if (this.currentStudyMode === 'pindanci') {
                progress.spelledLetters = [];
                const currentWord = this.words[absoluteIndex];
                progress.requiredLetters = currentWord.word.toLowerCase().split('');
                console.log(`拼单词模式 - 需要拼写: ${progress.requiredLetters.join('')}`);
            }
            
            console.log(`选中学习单词: 第${progress.currentPage + 1}页第${relativeIndex + 1}个 - ${this.words[absoluteIndex].word} - ${this.words[absoluteIndex].meaning}`);
            console.log(`绝对索引: ${absoluteIndex}, 相对索引: ${relativeIndex}, 学习模式: ${this.currentStudyMode}`);
            return true;
        }
        return false;
    }

    // 获取鱼身上要显示的内容（支持不同学习模式）
    getRandomWordForFish() {
        if (this.words.length === 0) return null;
        
        const currentWord = this.getCurrentWord();
        if (!currentWord) return null;
        
        const progress = this.getCurrentProgress();
        
        if (this.currentStudyMode === 'beidanci') {
            // 背单词模式：所有鱼都显示相同内容
            if (progress.fishCaught < 10) {
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
        } else if (this.currentStudyMode === 'pindanci') {
            // 拼单词模式：返回26个字母中的一个
            // 这里返回null，实际的字母鱼由getLetterForFish方法处理
            return null;
        } else if (this.currentStudyMode === 'dancipipei') {
            // 单词匹配模式：返回打乱后的意思中的一个
            if (progress.shuffledMeanings.length === 0) {
                console.log('没有可用的意思列表');
                return null;
            }
            
            // 随机选择一个意思
            const randomIndex = Math.floor(Math.random() * progress.shuffledMeanings.length);
            const selectedMeaning = progress.shuffledMeanings[randomIndex];
            
            // 检查是否是当前需要的意思
            const currentWord = progress.wordGroup[progress.currentWordIndex];
            const isCorrect = currentWord && selectedMeaning === currentWord.meaning;
            
            return {
                displayText: selectedMeaning,
                isCorrect: isCorrect,
                word: currentWord ? currentWord.word : '',
                meaning: selectedMeaning
            };
        }
        
        return null;
    }
    
    // 获取拼单词模式的字母鱼内容
    getLetterForFish() {
        if (this.currentStudyMode !== 'pindanci') {
            console.log('不是拼单词模式');
            return null;
        }
        
        const currentWord = this.getCurrentWord();
        if (!currentWord) {
            console.log('没有当前单词');
            return null;
        }
        
        const progress = this.getCurrentProgress();
        
        console.log(`拼单词模式调试:`);
        console.log(`  - 当前单词: ${currentWord.word}`);
        console.log(`  - 已拼字母: [${progress.spelledLetters.join(', ')}]`);
        console.log(`  - 需要字母: [${progress.requiredLetters.join(', ')}]`);
        
        // 获取下一个需要的字母
        const nextLetterIndex = progress.spelledLetters.length;
        console.log(`  - 下一个字母索引: ${nextLetterIndex}`);
        
        if (nextLetterIndex >= progress.requiredLetters.length) {
            console.log('已经拼完了');
            return null; // 已经拼完了
        }
        
        const targetLetter = progress.requiredLetters[nextLetterIndex];
        console.log(`  - 目标字母: ${targetLetter}`);
        
        // 返回正确的字母（注意：isCorrect属性设置为true）
        const result = {
            displayText: targetLetter.toUpperCase(),
            isCorrect: true, // 这是正确的字母鱼
            word: currentWord.word,
            meaning: currentWord.meaning,
            letter: targetLetter,
            nextLetterIndex: nextLetterIndex
        };
        
        console.log(`  - 返回结果:`, result);
        return result;
    }
    
    // 获取拼单词模式的干扰字母
    getRandomLetterForFish() {
        if (this.currentStudyMode !== 'pindanci') return null;
        
        const currentWord = this.getCurrentWord();
        if (!currentWord) return null;
        
        // 生成26个字母中的随机一个（作为干扰项）
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
        
        return {
            displayText: randomLetter.toUpperCase(),
            isCorrect: false, // 这是干扰字母鱼，明确标记为错误
            word: currentWord.word,
            meaning: currentWord.meaning,
            letter: randomLetter
        };
    }

    // 获取干扰选项（错误答案）- 背单词模式不需要干扰项
    getDistractorForFish() {
        // 背单词模式下所有鱼都显示相同内容，不需要干扰项
        return null;
    }

    // 钓到鱼时的处理（支持不同学习模式）
    onFishCaught(fishData) {
        const progress = this.getCurrentProgress();
        
        if (this.currentStudyMode === 'beidanci') {
            return this.handleBeidanciMode(fishData, progress);
        } else if (this.currentStudyMode === 'pindanci') {
            return this.handlePindanciMode(fishData, progress);
        } else if (this.currentStudyMode === 'dancipipei') {
            return this.handleDancipipeiMode(fishData, progress);
        }
        
        return false;
    }
    
    // 处理背单词模式
    handleBeidanciMode(fishData, progress) {
        if (fishData.isCorrect) {
            // 钓到正确的鱼
            progress.fishCaught++;
            console.log(`背单词模式 - 钓到正确答案！进度: ${progress.fishCaught}/${progress.targetFishCount}`);
            
            // 检查是否需要切换模式（前10次到后10次）
            if (progress.fishCaught === 10) {
                console.log('切换到后10次模式，需要清除所有鱼类');
                // 触发清除鱼类的回调
                if (this.onStageSwitchCallback) {
                    this.onStageSwitchCallback();
                }
            }
            
            // 完成一个单词的学习（钓20次）
            if (progress.fishCaught >= progress.targetFishCount) {
                progress.completedWords.add(progress.selectedWordIndex);
                console.log(`完成单词学习: ${this.words[progress.selectedWordIndex].word}`);
                this.handleWordCompletion(progress);
            }
            
            return true; // 返回true表示正确
        } else {
            console.log('钓到错误答案');
            return false; // 返回false表示错误
        }
    }
    
    // 处理拼单词模式
    handlePindanciMode(fishData, progress) {
        console.log('=== 拼单词模式判定开始 ===');
        console.log('鱼类数据:', fishData);
        console.log('当前进度:', {
            spelledLetters: progress.spelledLetters,
            requiredLetters: progress.requiredLetters,
            nextIndex: progress.spelledLetters.length
        });
        
        // 检查是否已完成拼写
        if (progress.spelledLetters.length >= progress.requiredLetters.length) {
            console.log('❌ 拼写已完成，不应再钓鱼');
            return false;
        }
        
        // 获取下一个需要的字母
        const nextLetterIndex = progress.spelledLetters.length;
        const expectedLetter = progress.requiredLetters[nextLetterIndex];
        console.log(`期望字母: ${expectedLetter}, 钓到字母: ${fishData.letter}`);
        
        // 精确判定：只有当钓到的字母恰好是下一个需要的字母时才算正确
        if (fishData.letter && fishData.letter.toLowerCase() === expectedLetter.toLowerCase()) {
            // 钓到正确的字母
            progress.spelledLetters.push(expectedLetter); // 使用标准格式的字母
            console.log(`✅ 钓到正确字母: ${expectedLetter}, 已拼出: ${progress.spelledLetters.join('')}`);
            
            // 检查是否完成拼写
            if (progress.spelledLetters.length >= progress.requiredLetters.length) {
                progress.fishCaught = 1; // 拼单词只需要完成一次
                progress.completedWords.add(progress.selectedWordIndex);
                console.log(`🎉 拼单词完成: ${progress.spelledLetters.join('')} = ${this.words[progress.selectedWordIndex].word}`);
                console.log('🔍 拼写完成后的状态检查:');
                console.log(`  - progress.fishCaught: ${progress.fishCaught}`);
                console.log(`  - progress.targetFishCount: ${progress.targetFishCount}`);
                console.log(`  - isGameComplete(): ${this.isGameComplete()}`);
                console.log(`  - 当前学习模式: ${this.currentStudyMode}`);
                this.handleWordCompletion(progress);
            }
            
            return true;
        } else {
            // 钓到错误字母或不匹配的字母：重置拼写进度
            console.log(`❌ 钓到错误字母: 期望 ${expectedLetter}, 实际 ${fishData.letter}`);
            console.log('🔄 重置拼写进度，清空已拼字母');
            progress.spelledLetters = []; // 清空已拼字母
            console.log(`重置后已拼字母: [${progress.spelledLetters.join(', ')}]`);
            
            return false;
        }
    }
    
    // 处理单词匹配模式
    handleDancipipeiMode(fishData, progress) {
        console.log('=== 单词匹配模式判定开始 ===');
        console.log('鱼类数据:', fishData);
        console.log('当前进度:', {
            currentWordIndex: progress.currentWordIndex,
            errorCount: progress.errorCount,
            fishCaught: progress.fishCaught,
            targetFishCount: progress.targetFishCount
        });
        
        // 检查是否已完成所有单词
        if (progress.currentWordIndex >= progress.wordGroup.length) {
            console.log('✅ 所有单词已完成匹配');
            return false;
        }
        
        // 获取当前需要匹配的单词
        const currentWord = progress.wordGroup[progress.currentWordIndex];
        const expectedMeaning = currentWord.meaning;
        
        console.log(`期望意思: ${expectedMeaning}`);
        console.log(`钓到意思: ${fishData.meaning}`);
        
        // 判断是否匹配正确
        if (fishData.meaning && fishData.meaning === expectedMeaning) {
            // 匹配正确
            console.log(`✅ 匹配正确: ${currentWord.word} -> ${expectedMeaning}`);
            progress.currentWordIndex++; // 进入下一个单词
            progress.fishCaught++;
            
            // 检查是否完成所有单词
            if (progress.currentWordIndex >= progress.wordGroup.length) {
                console.log('🎉 单词匹配游戏完成！');
                progress.fishCaught = progress.targetFishCount; // 设置为完成状态
                this.handleWordCompletion(progress);
            }
            
            return true;
        } else {
            // 匹配错误
            console.log(`❌ 匹配错误: 期望 ${expectedMeaning}, 实际 ${fishData.meaning}`);
            progress.errorCount++; // 增加错误次数
            
            // 记录当前单词的错误次数
            const wordKey = `${currentWord.word}-${currentWord.meaning}`;
            if (!progress.wordErrors.has(wordKey)) {
                progress.wordErrors.set(wordKey, 0);
            }
            progress.wordErrors.set(wordKey, progress.wordErrors.get(wordKey) + 1);
            
            console.log(`当前单词错误次数: ${progress.wordErrors.get(wordKey)}`);
            console.log(`总错误次数: ${progress.errorCount}`);
            
            return false;
        }
    }
    
    // 处理单词完成后的通用逻辑
    handleWordCompletion(progress) {
        // 拼单词模式不自动进入下一页，由游戏结算后返回单词墙
        if (this.currentStudyMode === 'pindanci') {
            console.log('拼单词模式完成，等待显示结算界面');
            return;
        }
        
        // 其他模式（背单词等）的原有逻辑
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
    
    // 设置阶段切换回调
    setStageSwitchCallback(callback) {
        this.onStageSwitchCallback = callback;
    }
    
    // 设置页面变化回调
    setPageChangeCallback(callback) {
        this.onPageChangeCallback = callback;
    }
    
    // 设置拼写错误重置回调
    setErrorResetCallback(callback) {
        this.onErrorResetCallback = callback;
    }

    // 检查游戏是否结束
    isGameComplete() {
        const progress = this.getCurrentProgress();
        
        if (this.currentStudyMode === 'pindanci') {
            // 拼单词模式：检查是否已完成拼写（通过fishCaught标志判断）
            console.log(`拼单词模式游戏完成检查: fishCaught=${progress.fishCaught}, target=${progress.targetFishCount}`);
            return progress.fishCaught >= progress.targetFishCount;
        } else {
            // 背单词和其他模式：检查是否达到目标数量
            return progress.fishCaught >= progress.targetFishCount;
        }
    }

    // 获取当前显示文本（在倒计时位置显示）
    getCurrentDisplayText() {
        const currentWord = this.getCurrentWord();
        if (!currentWord) return '';
        
        const progress = this.getCurrentProgress();
        
        if (this.currentStudyMode === 'beidanci') {
            if (progress.fishCaught < 10) {
                // 前10次：上方显示意思，鱼身显示单词（需要钓单词）
                return currentWord.meaning;
            } else {
                // 后10次：上方显示单词，鱼身显示意思（需要钓意思）
                return currentWord.word;
            }
        } else if (this.currentStudyMode === 'pindanci') {
            // 拼单词模式：显示单词和意思，以及当前进度
            const spelledPart = progress.spelledLetters.join('').toUpperCase();
            const remainingPart = '_'.repeat(Math.max(0, progress.requiredLetters.length - progress.spelledLetters.length));
            return `${currentWord.meaning}\n${spelledPart}${remainingPart}`;
        }
        
        return '';
    }

    // 获取游戏进度信息
    getProgress() {
        const progress = this.getCurrentProgress();
        return {
            current: progress.fishCaught,
            target: progress.targetFishCount,
            percentage: (progress.fishCaught / progress.targetFishCount) * 100,
            completedWords: progress.completedWords.size,
            currentWordIndex: progress.selectedWordIndex,
            showMeaning: this.currentStudyMode === 'beidanci' && progress.fishCaught >= 10
        };
    }

    // 重置游戏
    reset() {
        // 重置所有学习模式的进度数据
        for (let mode in this.progressData) {
            this.progressData[mode].fishCaught = 0;
            this.progressData[mode].selectedWordIndex = 0;
            this.progressData[mode].currentPage = 0;
            this.progressData[mode].completedWords.clear();
            
            // 拼单词模式的特殊重置
            if (mode === 'pindanci') {
                this.progressData[mode].spelledLetters = [];
                this.progressData[mode].requiredLetters = [];
            }
        }
        
        // 保持单词原始顺序，不再打乱
        console.log('游戏重置，所有模式进度已清零');
    }

    // 获取单词墙数据（用于显示单词墙界面）
    getWordWallData() {
        const progress = this.getCurrentProgress();
        const wallData = [];
        const startIndex = progress.currentPage * this.wordsPerPage;
        const endIndex = Math.min(startIndex + this.wordsPerPage, this.words.length);
        
        console.log(`获取单词墙数据 [模式: ${this.currentStudyMode}]: 第${progress.currentPage + 1}页, 索引${startIndex}-${endIndex - 1}`);
        
        for (let i = startIndex; i < endIndex; i++) {
            const relativeIndex = i - startIndex; // 在当前页中的相对索引
            wallData.push({
                word: this.words[i].word,
                meaning: this.words[i].meaning,
                completed: progress.completedWords.has(i), // 使用绝对索引检查完成状态
                current: i === progress.selectedWordIndex, // 使用绝对索引检查当前选中
                absoluteIndex: i, // 保存绝对索引供调试使用
                relativeIndex: relativeIndex // 保存相对索引供点击使用
            });
        }
        
        console.log('单词墙数据:', wallData.map(item => `${item.word}(${item.absoluteIndex})`).join(', '));
        return wallData;
    }
    
    // 检查当前页是否全部完成
    isCurrentPageCompleted() {
        const progress = this.getCurrentProgress();
        const startIndex = progress.currentPage * this.wordsPerPage;
        const endIndex = Math.min(startIndex + this.wordsPerPage, this.words.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            if (!progress.completedWords.has(i)) {
                return false;
            }
        }
        return true;
    }
    
    // 进入下一页
    goToNextPage() {
        const progress = this.getCurrentProgress();
        const maxPage = Math.ceil(this.words.length / this.wordsPerPage) - 1;
        if (progress.currentPage < maxPage) {
            progress.currentPage++;
            console.log(`[模式: ${this.currentStudyMode}] 进入第${progress.currentPage + 1}页`);
            return true;
        }
        return false;
    }
    
    // 进入上一页
    goToPreviousPage() {
        const progress = this.getCurrentProgress();
        if (progress.currentPage > 0) {
            progress.currentPage--;
            console.log(`[模式: ${this.currentStudyMode}] 返回第${progress.currentPage + 1}页`);
            return true;
        }
        return false;
    }
    
    // 获取分页信息
    getPageInfo() {
        const progress = this.getCurrentProgress();
        const totalPages = Math.ceil(this.words.length / this.wordsPerPage);
        return {
            currentPage: progress.currentPage + 1, // 显示从1开始
            totalPages: totalPages,
            hasNextPage: progress.currentPage < totalPages - 1,
            hasPreviousPage: progress.currentPage > 0,
            completedInCurrentPage: this.getCompletedWordsInCurrentPage(),
            totalInCurrentPage: Math.min(this.wordsPerPage, this.words.length - progress.currentPage * this.wordsPerPage)
        };
    }
    
    // 获取当前页已完成的单词数量
    getCompletedWordsInCurrentPage() {
        const progress = this.getCurrentProgress();
        const startIndex = progress.currentPage * this.wordsPerPage;
        const endIndex = Math.min(startIndex + this.wordsPerPage, this.words.length);
        let completed = 0;
        
        for (let i = startIndex; i < endIndex; i++) {
            if (progress.completedWords.has(i)) {
                completed++;
            }
        }
        
        return completed;
    }
    
    // 初始化单词匹配模式
    initWordMatchMode(pageIndex = 0) {
        console.log('初始化单词匹配模式, 页面:', pageIndex);
        const progress = this.getCurrentProgress();
        
        // 设置当前页面
        progress.currentPage = pageIndex;
        
        // 获取当前页的单词组（10个单词）
        const startIndex = pageIndex * this.wordsPerPage;
        const endIndex = Math.min(startIndex + this.wordsPerPage, this.words.length);
        progress.wordGroup = this.words.slice(startIndex, endIndex);
        
        // 获取所有意思并打乱
        progress.shuffledMeanings = progress.wordGroup.map(word => word.meaning);
        this.shuffleArray(progress.shuffledMeanings);
        
        // 重置游戏状态
        progress.currentWordIndex = 0;
        progress.fishCaught = 0;
        progress.errorCount = 0;
        progress.wordErrors.clear();
        
        console.log('单词匹配模式初始化完成:', {
            wordGroup: progress.wordGroup.map(w => w.word),
            shuffledMeanings: progress.shuffledMeanings,
            currentWordIndex: progress.currentWordIndex
        });
        
        return progress.wordGroup.length > 0;
    }
    
    // 获取当前需要匹配的单词（单词匹配模式）
    getCurrentMatchWord() {
        if (this.currentStudyMode !== 'dancipipei') return null;
        
        const progress = this.getCurrentProgress();
        if (progress.currentWordIndex >= progress.wordGroup.length) {
            return null;
        }
        
        return progress.wordGroup[progress.currentWordIndex];
    }
    
    // 获取单词匹配模式的显示文本
    getMatchModeDisplayText() {
        if (this.currentStudyMode !== 'dancipipei') return '';
        
        const currentWord = this.getCurrentMatchWord();
        if (!currentWord) return '游戏完成！';
        
        const progress = this.getCurrentProgress();
        return `单词: ${currentWord.word}\n进度: ${progress.currentWordIndex + 1}/${progress.wordGroup.length}`;
    }
    
    // 获取单词匹配模式的统计信息
    getMatchModeStats() {
        if (this.currentStudyMode !== 'dancipipei') return null;
        
        const progress = this.getCurrentProgress();
        const totalWords = progress.wordGroup.length;
        const completedWords = progress.currentWordIndex;
        const accuracy = progress.errorCount + completedWords > 0 ? 
            (completedWords / (progress.errorCount + completedWords) * 100).toFixed(1) : '100.0';
        
        return {
            totalWords: totalWords,
            completedWords: completedWords,
            errorCount: progress.errorCount,
            accuracy: parseFloat(accuracy),
            isAllCorrect: progress.errorCount === 0,
            encouragementText: progress.errorCount === 0 ? 
                '你真棒，你已掌握这些单词' : 
                '再接再厉，下次一定可以全对'
        };
    }
    
    // 数组打乱工具方法
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
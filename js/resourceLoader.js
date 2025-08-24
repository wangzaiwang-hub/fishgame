// 资源加载器类
class ResourceLoader {
    constructor() {
        this.resources = {};
        this.loadedCount = 0;
        this.totalCount = 0;
        this.loadingCallbacks = [];
    }

    // 加载单个图片资源
    loadImage(key, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                console.log(`✓ 成功加载图片: ${key} (${src})`);
                this.resources[key] = img;
                this.loadedCount++;
                this.updateProgress();
                resolve(img);
            };
            
            img.onerror = (error) => {
                console.error(`✗ 加载图片失败: ${key} (${src})`, error);
                reject(new Error(`Failed to load image: ${src}`));
            };
            
            // 添加超时处理
            setTimeout(() => {
                if (!this.resources[key]) {
                    console.error(`✗ 图片加载超时: ${key} (${src})`);
                    reject(new Error(`Image load timeout: ${src}`));
                }
            }, 10000); // 10秒超时
            
            img.src = src;
        });
    }

    // 加载所有游戏资源
    async loadAllResources() {
        const resourcesToLoad = [];
        
        // 加载背景
        resourcesToLoad.push(
            this.loadImage('background', ResourcePaths.BACKGROUND)
        );
        
        // 加载角色
        resourcesToLoad.push(
            this.loadImage('player', ResourcePaths.PLAYER)
        );
        
        resourcesToLoad.push(
            this.loadImage('guide', ResourcePaths.GUIDE)
        );
        
        // 加载对话相关资源
        resourcesToLoad.push(
            this.loadImage('message', ResourcePaths.MESSAGE)
        );
        
        // 加载游戏结算相关资源
        resourcesToLoad.push(
            this.loadImage('gameover', ResourcePaths.GAMEOVER)
        );
        
        resourcesToLoad.push(
            this.loadImage('one', ResourcePaths.BUTTON_ONE)
        );
        
        resourcesToLoad.push(
            this.loadImage('two', ResourcePaths.BUTTON_TWO)
        );
        
        resourcesToLoad.push(
            this.loadImage('three', ResourcePaths.BUTTON_THREE)
        );
        
        // 加载所有鱼类图片
        for (let i = 1; i <= 15; i++) {
            resourcesToLoad.push(
                this.loadImage(`fish_${i}`, ResourcePaths.FISH[i])
            );
        }
        
        this.totalCount = resourcesToLoad.length;
        this.loadedCount = 0;
        
        try {
            await Promise.all(resourcesToLoad);
            console.log('所有资源加载完成');
            return true;
        } catch (error) {
            console.error('资源加载失败:', error);
            throw error;
        }
    }

    // 更新加载进度
    updateProgress() {
        const progress = this.loadedCount / this.totalCount;
        console.log(`资源加载进度: ${Math.round(progress * 100)}%`);
        
        // 调用进度回调
        this.loadingCallbacks.forEach(callback => {
            callback(progress, this.loadedCount, this.totalCount);
        });
    }

    // 添加加载进度回调
    onProgress(callback) {
        this.loadingCallbacks.push(callback);
    }

    // 获取资源
    getResource(key) {
        return this.resources[key];
    }

    // 检查资源是否已加载
    isLoaded(key) {
        return this.resources.hasOwnProperty(key) && this.resources[key] !== null;
    }

    // 获取所有资源
    getAllResources() {
        return this.resources;
    }

    // 清理资源
    clear() {
        this.resources = {};
        this.loadedCount = 0;
        this.totalCount = 0;
        this.loadingCallbacks = [];
    }
}
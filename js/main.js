// 游戏入口点
let game;

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', async () => {
    console.log('开始初始化钓鱼游戏...');
    
    try {
        // 创建游戏实例
        game = new Game('gameCanvas');
        
        // 初始化游戏
        const success = await game.init();
        
        if (success) {
            console.log('钓鱼游戏初始化成功！');
            // 开始游戏循环（菜单状态）
            game.gameLoop();
        } else {
            console.error('游戏初始化失败');
            alert('游戏初始化失败，请检查资源文件是否完整');
        }
    } catch (error) {
        console.error('游戏启动出错:', error);
        alert('游戏启动失败: ' + error.message);
    }
});

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    if (game) {
        game.stop();
    }
});
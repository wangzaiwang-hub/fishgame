// 游戏配置常量
const GameConfig = {
    CANVAS_WIDTH: window.innerWidth,
    CANVAS_HEIGHT: window.innerHeight,
    FISH_SPAWN_RATE: 2000, // 毫秒
    HOOK_SPEED: 300,
    MAX_FISH_COUNT: 15,
    FISH_MIN_SPEED: 50,
    FISH_MAX_SPEED: 150,
    FISH_SCALE: 0.1, // 鱼类缩放比例 (0.2/2)
    PLAYER_SCALE: 0.17, // 玩家缩放比例 (0.5/3)
    PLAYER_SPEED: 200 // 玩家移动速度
};

// 游戏状态枚举
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over'
};

// 鱼类配置
const FishConfig = {
    RIGHT_FISH: {
        types: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        direction: 1,
        speedRange: [50, 150],
        scoreRange: [10, 100]
    },
    LEFT_FISH: {
        types: [11, 12, 13, 14, 15],
        direction: -1,
        speedRange: [50, 150],
        scoreRange: [10, 100]
    }
};

// 资源路径配置
const ResourcePaths = {
    BACKGROUND: 'resource/bg.png',
    PLAYER: 'resource/me.png',
    GUIDE: 'resource/man.png',
    FISH: {
        1: 'resource/1.png',
        2: 'resource/2.png',
        3: 'resource/3.png',
        4: 'resource/4.png',
        5: 'resource/5.png',
        6: 'resource/6.png',
        7: 'resource/7.png',
        8: 'resource/8.png',
        9: 'resource/9.png',
        10: 'resource/10.png',
        11: 'resource/11.png',
        12: 'resource/12.png',
        13: 'resource/13.png',
        14: 'resource/14.png',
        15: 'resource/15.png'
    }
};
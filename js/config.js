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
    WELCOME_DIALOG: 'welcome_dialog',
    WAITING_START: 'waiting_start',
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    TIME_UP: 'time_up',
    GAME_SETTLEMENT: 'game_settlement',
    END_DIALOG: 'end_dialog',
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
    MESSAGE: 'resource/message.png',
    GAMEOVER: 'resource/gameover.png',
    BUTTON_ONE: 'resource/one.png',
    BUTTON_TWO: 'resource/two.png',
    BUTTON_THREE: 'resource/three.png',
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

// 对话配置
const DialogConfig = {
    TEXT_SPEED: 80, // 文字显示速度（毫秒）
    SLIDE_SPEED: 400, // 角色滑动速度
    WELCOME_TEXT: '我是袁老板，欢迎来到我的鱼塘，你想玩几分钟',
    END_TEXT: '时间到了，要再玩一次吗'
};

// 时间配置
const TimeConfig = {
    OPTIONS: {
        1: 1, // 1分钟
        2: 2, // 2分钟
        3: 3  // 3分钟
    },
    WARNING_TIME: 30 // 少于30秒时显示警告
};
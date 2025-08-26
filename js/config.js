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
    MODE_SELECTION: 'mode_selection', // 模式选择状态
    STUDY_SELECTION: 'study_selection', // 学习内容选择状态
    WORD_WALL: 'word_wall', // 单词墙显示状态
    MENU: 'menu',
    PLAYING: 'playing',
    PLAYING_WORD_MODE: 'playing_word_mode', // 背单词游戏状态
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
    BUTTON_AMUSEMENT: 'resource/amusement.png', // 新增：娱乐模式按钮
    BUTTON_STUDY: 'resource/study.png', // 新增：学习模式按钮
    // 学习模式选项按钮
    BUTTON_BEIDANCI: 'resource/beidanci.png', // 背单词
    BUTTON_PINDANCI: 'resource/pindanci.png', // 拼单词
    BUTTON_DANCIPIPEI: 'resource/dancipipei.png', // 单词匹配
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
    MODE_SELECTION_TEXT: '请选择游戏模式，娱乐模式还是学习模式', // 新增：模式选择文本
    TIME_SELECTION_TEXT: '请选择游戏时长', // 新增：时间选择文本
    STUDY_SELECTION_TEXT: '请选择学习内容', // 新增：学习选择文本
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

// 学习模式配置
const StudyConfig = {
    OPTIONS: {
        'beidanci': '背单词', // 背单词模式
        'pindanci': '拼单词', // 拼单词模式
        'dancipipei': '单词匹配' // 单词匹配模式
    }
};

// 单词墙配置
const WordWallConfig = {
    WORDS_PER_GROUP: 10, // 每组单词数量
    WORDS_PER_ROW: 5, // 每行显示的单词数量
    WORD_BUTTON_WIDTH: 140, // 单词按钮宽度（从120增加到140）
    WORD_BUTTON_HEIGHT: 45, // 单词按钮高度（从40增加到45）
    WORD_SPACING_X: 30, // 单词按钮水平间距（从20增加到30）
    WORD_SPACING_Y: 25, // 单词按钮垂直间距（从15增加到25）
    LEVEL_BUTTON_WIDTH: 90, // 等级切换按钮宽度（从80增加到90）
    LEVEL_BUTTON_HEIGHT: 40, // 等级切换按钮高度（从35增加到40）
    COMPLETED_COLOR: '#4CAF50', // 已完成单词颜色（绿色）
    INCOMPLETE_COLOR: '#9E9E9E', // 未完成单词颜色（灰色）
    CURRENT_COLOR: '#2196F3', // 当前单词颜色（蓝色）
    TEXT_COLOR: '#FFFFFF', // 文字颜色
    BACKGROUND_COLOR: 'rgba(0, 0, 0, 0.8)' // 背景颜色
};
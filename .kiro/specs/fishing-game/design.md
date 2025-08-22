# 钓鱼游戏设计文档

## 概述

钓鱼游戏是一个基于HTML5 Canvas的2D休闲游戏。游戏采用面向对象的JavaScript架构，使用requestAnimationFrame实现流畅的动画效果。游戏包含场景渲染、实体管理、碰撞检测、用户交互和状态管理等核心系统。

## 架构

### 整体架构
```
Game (主游戏类)
├── SceneManager (场景管理器)
├── EntityManager (实体管理器)
├── InputHandler (输入处理器)
├── CollisionDetector (碰撞检测器)
├── ScoreManager (分数管理器)
└── ResourceLoader (资源加载器)
```

### 游戏循环
游戏采用标准的游戏循环模式：
1. 处理输入 (Input)
2. 更新游戏状态 (Update)
3. 渲染画面 (Render)

## 组件和接口

### 1. Game 主游戏类
```javascript
class Game {
  constructor(canvasId)
  init()
  start()
  pause()
  restart()
  gameLoop()
  update(deltaTime)
  render()
}
```

### 2. Entity 实体基类
```javascript
class Entity {
  constructor(x, y, width, height)
  update(deltaTime)
  render(ctx)
  getBounds()
}
```

### 3. Fish 鱼类实体
```javascript
class Fish extends Entity {
  constructor(x, y, type, direction)
  update(deltaTime)
  render(ctx)
  getScore()
}
```

### 4. Hook 鱼钩实体
```javascript
class Hook extends Entity {
  constructor(x, y)
  cast(targetX, targetY)
  update(deltaTime)
  render(ctx)
  isActive()
}
```

### 5. Player 玩家实体
```javascript
class Player extends Entity {
  constructor(x, y)
  render(ctx)
}
```

## 数据模型

### 游戏状态
```javascript
const GameState = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over'
}
```

### 鱼类配置
```javascript
const FishConfig = {
  RIGHT_FISH: {
    types: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    direction: 1,
    speed: 50-150,
    score: 10-100
  },
  LEFT_FISH: {
    types: [11, 12, 13, 14, 15],
    direction: -1,
    speed: 50-150,
    score: 10-100
  }
}
```

### 游戏配置
```javascript
const GameConfig = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  FISH_SPAWN_RATE: 2000, // 毫秒
  HOOK_SPEED: 300,
  MAX_FISH_COUNT: 10
}
```

## 错误处理

### 资源加载错误
- 图片加载失败时显示占位符或错误信息
- 提供重试机制
- 记录错误日志

### 游戏运行时错误
- Canvas上下文获取失败的处理
- 动画帧请求失败的降级方案
- 内存泄漏防护（及时清理不用的实体）

### 用户输入错误
- 无效点击位置的处理
- 快速连续点击的防抖处理

## 测试策略

### 单元测试
- Entity类的基础功能测试
- Fish移动和边界检测测试
- Hook投放和碰撞检测测试
- ScoreManager分数计算测试
- CollisionDetector碰撞算法测试

### 集成测试
- 游戏循环完整性测试
- 实体管理器与各实体的交互测试
- 场景切换流程测试
- 资源加载和游戏初始化测试

### 性能测试
- 大量鱼类同时存在时的性能测试
- 长时间运行的内存使用测试
- 不同设备上的帧率测试

### 用户体验测试
- 不同屏幕尺寸的适配测试
- 触摸和鼠标操作的响应测试
- 游戏平衡性测试（难度曲线）

## 渲染系统

### Canvas管理
- 使用双缓冲技术避免闪烁
- 实现视口裁剪优化性能
- 支持高DPI屏幕的适配

### 精灵渲染
- 实现精灵批处理减少绘制调用
- 支持精灵动画帧切换
- 实现Z-index层级管理

### 特效系统
- 鱼类被捕获时的粒子效果
- 水波纹效果
- 分数弹出动画

## 音效系统（可选扩展）

### 音效管理
- 背景音乐循环播放
- 钓鱼成功音效
- 界面操作音效
- 音量控制和静音功能
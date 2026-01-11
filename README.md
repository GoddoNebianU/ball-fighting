# 火柴人格斗游戏 (Ball Fighting)

一个基于 PixiJS v8 的俯视角火柴人格斗游戏，支持多人对战和 AI 对战。

## 🎮 游戏特色

- **俯视角格斗**: 创新的俯视角 2D 格斗体验
- **多样化武器**: 近战武器、手枪、机枪、狙击枪
- **智能 AI**: 具备战术决策、子弹躲避、复仇机制的 AI 系统
- **多人对战**: 支持 1-3 名玩家同时游戏
- **动态玩家系统**: 灵活配置人类玩家和 AI 玩家
- **实时特效**: 攻击特效、血包系统、击杀提示
- **完整 UI**: 血条、时间显示、武器状态、击杀历史

## 🚀 快速开始

### 前置要求

- Node.js 18+
- pnpm (推荐包管理器)

### 安装依赖

```bash
# 安装前端依赖
pnpm install

# 安装后端依赖 (可选)
cd server
pnpm install
```

### 启动游戏

```bash
# 启动前端开发服务器
pnpm run dev

# 启动后端服务器 (可选，另一个终端)
cd server
pnpm run dev
```

游戏将在 `http://localhost:5173` 启动。

### 生产构建

```bash
# 构建前端
pnpm run build

# 构建后端
cd server
pnpm run build
```

## 🎯 游戏操作

### 玩家 1 (蓝色 - WASD)

- `W/A/S/D` - 移动
- `Space` - 格挡
- `J` - 当前武器攻击
- `H` - 切换轻拳
- `U` - 切换重拳
- `K` - 切换手枪
- `L` - 切换机枪
- `I` - 切换狙击枪

### 玩家 2 (橙色 - 方向键/数字键)

- `↑/↓/←/→` 或 `5/2/1/3` - 移动
- `Enter` 或 `0` - 攻击
- `Shift` 或 `.` - 格挡
- `7` - 切换轻拳
- `8` - 切换重拳
- `9` - 切换手枪
- `4` - 切换机枪
- `6` - 切换狙击枪

## 🤖 AI 系统

游戏采用先进的 AI 决策系统：

### 核心特性

- **状态机决策**: 根据距离、血量、武器状态选择最优策略
- **子弹躲避**: 使用向量数学计算躲避轨迹
- **武器策略**: 根据战斗距离自动选择最佳武器
- **复仇机制**: 优先攻击伤害自己的角色
- **反应延迟**: 模拟人类反应时间，避免过于精准

### AI 架构

```
GameAI (AI 主控制器)
├── Map<Fighter, AIController> (动态 AI 控制器)
├── AIDecision (决策逻辑)
├── AIStateExecutor (状态执行)
├── AIWeaponStrategy (武器策略)
├── AIHealthPackBehavior (血包行为)
└── AIBulletDodge (子弹躲避)
```

## ⚔️ 武器系统

### 武器类型

- **轻拳**: 快速近战，5 伤害
- **重拳**: 慢速近战，15 伤害
- **手枪**: 远程，15 伤害，600ms 冷却，无限弹药
- **机枪**: 远程连发，2 伤害，100ms 冷却，30 发弹夹
- **狙击枪**: 远程高伤，50 伤害，5秒 冷却，每回合 3 发

### 武器机制

- **弹药系统**: 部分武器有限制弹药
- **换弹机制**: 机枪支持自动换弹
- **冷却系统**: 所有武器都有攻击冷却
- **武器切换**: 流畅的武器切换体验

## 🏗️ 项目架构

### 技术栈

- **PixiJS v8** - 2D 渲染引擎
- **TypeScript** - 类型安全开发
- **Vite** - 构建工具
- **PixiJS UI** - UI 组件库
- **Express** - 后端 API

### 核心架构

```
FightingGame (游戏主控制器)
├── PlayerManager (玩家管理器)
├── BulletManager (投射物管理)
├── EffectManager (特效管理)
├── HealthPackManager (血包管理)
├── GameAI (AI 决策系统)
├── GameInput (输入处理)
└── GameUI (UI 渲染)
```

### 文件结构

```
src/app/screens/fighting/
├── ai/                    # AI 系统
├── combat/                # 战斗相关
├── entities/              # 游戏实体
├── fighter/               # 角色系统
├── ui/                    # 用户界面
├── weapons/               # 武器系统
└── FightingGame.ts        # 游戏主控制器
```

## ⚙️ 配置玩家

在 `FightingGame.ts` 中修改 `playerConfigs` 数组：

```typescript
const playerConfigs: PlayerConfig[] = [
  {
    name: "P1", // 玩家名称
    color: 0x4488ff, // 蓝色
    startX: -200,
    startY: 0,
    isAI: false, // 人类玩家
  },
  {
    name: "AI", // AI 玩家
    color: 0x44ff44, // 绿色
    startX: 0,
    startY: 200,
    isAI: true, // AI 控制
  },
];
```

## 🎨 游戏平衡

### 角色属性

- 最大生命值: 200
- 移动速度: 180 像素/秒
- 碰撞半径: 25 像素

### 游戏规则

- 回合时间: 99 秒
- 血包刷新: 每 10 秒
- 胜利条件: 击败所有对手或时间结束时血量最高

## 🔧 开发命令

```bash
# 开发服务器
pnpm run dev

# 生产构建
pnpm run build

# 代码检查
pnpm run lint

# 类型检查
tsc --noEmit
```

## 📝 开发规范

- **语言**: 只使用中文进行回复和交流
- **包管理器**: 始终使用 `pnpm`
- **文件大小**: 单文件超过 200 行必须拆分
- **文件组织**: 按功能分门别类放到对应文件夹
- **代码风格**: 使用 ESLint + Prettier
- **类型安全**: TypeScript 严格模式

## 🌟 特色功能

### 动态玩家系统

- 不再硬编码 player1/2/3
- 使用动态数组管理玩家
- 通过 `isAI` 字段控制玩家类型
- 玩家名称自动同步到 UI 和通知

### 子弹躲避系统

- 实时计算子弹轨迹
- 垂直方向移动躲避
- 30% 概率同时格挡
- 向量数学精确计算

### 特效系统

- 攻击特效渲染
- 击杀提示动画
- 血包拾取效果
- 武器切换动画

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

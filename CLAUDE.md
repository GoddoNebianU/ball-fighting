# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 开发规范

1. **语言**: 只使用中文进行回复和交流
2. **包管理器**: 始终使用 `pnpm` 和 `pnpx`，而不是 `npm` 和 `npx`
3. **文件大小限制**: 单个文件超过 200 行必须拆分
4. **文件组织**: 文件必须按功能分门别类放到对应的文件夹中

## 常用命令

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

## 项目架构

这是一个基于 PixiJS v8 的俯视角火柴人格斗游戏项目。

### 核心技术栈
- **PixiJS v8** - 2D 渲染引擎
- **TypeScript** - 类型安全开发
- **Vite** - 构建工具
- **PixiJS UI** - UI 组件库

### 游戏架构

游戏采用**状态机模式**和**组合模式**：

```
FightingGame (游戏主控制器)
├── PlayerManager (玩家管理器 - 动态玩家系统)
│   └── Fighter[] (玩家数组)
├── BulletManager (投射物管理)
├── EffectManager (特效管理)
├── HealthPackManager (血包管理)
├── GameAI (AI 决策系统)
│   ├── Map<Fighter, AIController> (动态 AI 控制器)
│   ├── AIDecision (决策逻辑)
│   ├── AIStateExecutor (状态执行)
│   ├── AIWeaponStrategy (武器策略)
│   ├── AIHealthPackBehavior (血包行为)
│   └── AIBulletDodge (子弹躲避)
├── GameInput (输入处理)
│   └── 支持 N 个人类玩家
└── GameUI (UI 渲染)
    ├── UIComponents (UI 组件)
    ├── UIUpdater (UI 更新)
    └── UIAnimations (UI 动画)
```

### 动态玩家系统

游戏使用 **PlayerManager** 统一管理所有角色，支持灵活配置玩家数量：

```typescript
interface PlayerConfig {
  name: string;      // 玩家名称 (用于 UI 和获胜通知)
  color: number;     // 角色颜色
  startX: number;    // 初始 X 位置
  startY: number;    // 初始 Y 位置
  isAI: boolean;     // 是否为 AI 控制
}
```

**关键特性**:
- 不再硬编码 player1/2/3，使用动态数组
- 通过 `isAI` 字段控制是玩家还是 AI
- 玩家名称在配置中指定，自动同步到 UI 和获胜通知

### 角色状态机

角色使用有限状态机 (FSM) 管理行为：

```typescript
enum FighterState {
  IDLE,   // 待机
  WALK,   // 移动
  ATTACK, // 攻击中
  BLOCK,  // 格挡
  HIT,    // 受击眩晕
}
```

### 武器系统架构

武器系统采用**面向对象设计**，每种武器都是独立的类：

- **Weapon** (基类) - 定义通用接口和弹药/冷却/换弹系统
- **PunchLight/PunchHeavy** - 近战武器 (无限弹药)
- **Pistol** - 手枪 (无限弹药)
- **MachineGun** - 机枪 (30发弹夹，2秒换弹，可连发)
- **Sniper** - 狙击枪 (每回合3发，5秒冷却，不自动换弹)
- **WeaponManager** - 管理多个武器的切换和状态

**关键设计**：
- 玩家和 AI 共享相同的武器对象
- `Weapon.shoot()` 方法处理弹药消耗和冷却检查
- `Weapon.getState()` 返回当前弹药、换弹状态
- AI 会检查狙击枪弹药，耗尽后自动切换到其他武器

### 文件组织结构

```
src/app/screens/fighting/
├── ai/                    # AI 系统
│   ├── AIDecision.ts      # AI 决策逻辑
│   ├── AIStateExecutor.ts # 状态执行
│   ├── AIWeaponStrategy.ts # 武器选择策略
│   ├── AIHealthPackBehavior.ts # 血包行为
│   ├── AIBulletDodge.ts   # 子弹躲避系统
│   ├── types.ts           # AI 类型定义
│   └── GameAI.ts          # AI 主控制器
├── combat/                # 战斗相关
│   ├── Bullet.ts          # 子弹类
│   ├── BulletManager.ts   # 子弹管理器
│   ├── EffectTypes.ts     # 特效类型
│   ├── WeaponEffectRenderer.ts # 武器特效渲染
│   └── EffectManager.ts   # 特效管理器
├── entities/              # 游戏实体
│   ├── PlayerManager.ts   # 玩家管理器 (动态玩家系统)
│   ├── HealthPack.ts      # 血包类
│   └── HealthPackManager.ts # 血包管理器
├── fighter/               # 角色系统
│   ├── Fighter.ts         # 角色主类
│   ├── FighterCombat.ts   # 战斗逻辑
│   ├── FighterGraphics.ts # 渲染系统
│   ├── FighterInput.ts    # 输入接口
│   ├── FighterConfig.ts   # 配置参数
│   └── index.ts
├── ui/                    # 用户界面
│   ├── GameUI.ts          # UI 主类
│   ├── UIComponents.ts    # UI 组件
│   ├── UIUpdater.ts       # UI 更新器
│   ├── UIAnimations.ts    # UI 动画
│   ├── FightingStage.ts   # 战场背景
│   └── types.ts           # UI 类型
├── weapons/               # 武器系统
│   ├── Weapon.ts          # 武器基类
│   ├── Punch.ts           # 近战武器
│   ├── Firearm.ts         # 枪械武器 (手枪/机枪/狙击枪)
│   ├── WeaponManager.ts   # 武器管理器
│   └── index.ts
├── FightingGame.ts        # 游戏主控制器
├── GameInput.ts           # 输入处理 (支持多玩家)
├── types.ts               # 全局类型定义
└── index.ts               # 模块导出
```

### AI 决策系统

AI 使用状态机 + 反应延迟机制 + 子弹躲避系统：

1. **决策层** (`AIDecision`) - 根据距离、血量选择状态
2. **执行层** (`AIStateExecutor`) - 执行具体状态行为
3. **武器策略** (`AIWeaponStrategy`) - 根据距离自动选择最佳武器
   - 会检查狙击枪弹药，耗尽后使用其他武器
4. **子弹躲避** (`AIBulletDodge`) - 使用向量数学计算并躲避子弹
   - 计算子弹击中时间
   - 垂直方向移动躲避
   - 30% 概率同时格挡
5. **反应延迟** - 模拟人类反应时间，避免过于精准
6. **复仇机制** - 优先攻击伤害自己的角色 (+500 优先级)

### 游戏循环

```
FightingGame.update()
├── GameInput.updatePlayerInputs() # 处理输入
├── GameAI.update()                # AI 决策
│   └── Map<Fighter, AIController> # 动态 AI 控制器
├── PlayerManager.updateAll()      # 更新所有玩家
│   ├── Fighter.update()
│   │   ├── WeaponManager.update() # 武器冷却/换弹
│   │   ├── FighterCombat.update() # 战斗状态
│   │   └── FighterPhysics.update() # 物理移动
├── BulletManager.update()         # 更新子弹
├── EffectManager.update()         # 更新特效
├── HealthPackManager.update()     # 更新血包
└── GameUI.update()                # 更新 UI
```

### 操作控制

**玩家 1** (蓝色 - WASD):
- `W/A/S/D` - 移动
- `Space` - 格挡
- `J` - 当前武器攻击
- `H` - 切换轻拳
- `U` - 切换重拳
- `K` - 切换手枪
- `L` - 切换机枪
- `I` - 切换狙击枪

**玩家 2** (橙色 - 数字键):
- `5/2/1/3` (小键盘或主键盘) - 上/下/左/右移动
- `0` - 攻击
- `.` (小数点) - 格挡
- `7` - 切换轻拳
- `8` - 切换重拳
- `9` - 切换手枪
- `4` - 切换机枪
- `6` - 切换狙击枪

**注意**: 玩家数量由 `PlayerConfig` 中的 `isAI` 字段决定，可以灵活配置 1-3 个人类玩家。

### 配置玩家

在 `FightingGame.ts` 中修改 `playerConfigs` 数组来配置玩家：

```typescript
const playerConfigs: PlayerConfig[] = [
  {
    name: "P1",              // 玩家名称 (显示在 UI 和获胜通知)
    color: 0x4488ff,         // 蓝色
    startX: -200,
    startY: 0,
    isAI: false,             // 人类玩家
  },
  {
    name: "P2",              // 第二个玩家
    color: 0xff6644,         // 橙色
    startX: 200,
    startY: 0,
    isAI: false,             // 人类玩家
  },
  {
    name: "AI",              // AI 玩家
    color: 0x44ff44,         // 绿色
    startX: 0,
    startY: 200,
    isAI: true,              // AI 控制
  },
];
```

### 游戏平衡参数

**角色属性** (`FighterConfig.ts`):
- `maxHealth: 200` - 最大生命值
- `walkSpeed: 180` - 移动速度
- `radius: 25` - 碰撞半径

**武器平衡**:
- 手枪: 15 伤害, 600ms 冷却, 无限弹药
- 机枪: 2 伤害, 100ms 冷却, 30 发弹夹, 可连发
- 狙击枪: 50 伤害, 5秒 冷却, 每回合 3 发, 不自动换弹

### 代码约定

1. **文件拆分**: 单文件超过 200 行必须拆分到对应文件夹
2. **组合模式**: Fighter 使用多个子系统 (Physics/Graphics/Combat/Input) 而非单一大类
3. **状态管理**: 使用枚举 + 状态机，避免散乱的 boolean 标志
4. **武器对象**: 武器是独立的对象，不是 Fighter 的内部配置
5. **类型安全**: 使用 TypeScript 严格模式，避免 `any` 类型
6. **动态玩家**: 使用 PlayerManager 管理玩家，而不是硬编码 player1/2/3
7. **名称一致性**: 玩家名称在 PlayerConfig 中配置，自动同步到所有 UI 和通知

### 关键文件说明

- **FightingGame.ts** - 游戏主循环、碰撞检测、胜负判定
- **PlayerManager.ts** - 动态玩家系统，统一管理所有角色
- **Fighter.ts** - 角色主类，组合各个子系统
- **FighterCombat.ts** - 攻击/受击/格挡/眩晕逻辑
- **Weapon.ts** - 武器基类，定义弹药/冷却/换弹系统
- **AIWeaponStrategy.ts** - AI 武器选择策略，包含狙击枪弹药检查
- **AIBulletDodge.ts** - AI 子弹躲避系统，使用向量数学
- **BulletManager.ts** - 投射物生成、移动、碰撞检测
- **GameUI.ts** - 血条、时间、武器弹药显示
- **UIComponents.ts** - UI 组件创建，使用动态玩家名称
- **UIAnimations.ts** - UI 动画，显示获胜者名称

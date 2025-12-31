# 减少过多 Getter/Setter 的方案

## 问题根源

### 1. 不必要的代理 getter/setter
```typescript
// ❌ 糟糕：简单转发，没有额外逻辑
public get state(): FighterState {
  return this.combat.state;
}
public set state(value: FighterState) {
  this.combat.state = value;
}

// ✅ 更好：直接访问子系统
fighter.combat.state = FighterState.WALK;
```

### 2. 重复的封装层
```typescript
// ❌ AIDecision 代理到 AITactics
public getState(): AIState {
  return this.tactics.getState();
}

// ✅ 直接使用 AITactics
decision.tactics.state
```

## 具体改进方案

### 方案 1: 暴露子系统，直接访问

**Fighter.ts** - 移除代理 getter/setter：
```typescript
// 保留（有额外逻辑）：
public get input() {
  return this.inputHandler.input;
}

// 移除（简单转发）：
- public get state() => 直接访问 fighter.combat.state
- public set state() => 直接访问 fighter.combat.state
- public get attackAngle() => 直接访问 fighter.combat.attackAngle
- public get currentWeapon() => 直接访问 fighter.weaponManager.currentWeapon
- public get currentAttack() => 直接访问 fighter.combat.getCurrentAttack()
```

### 方案 2: 使用只读属性 + 方法

**Fighter.ts** - velocity 的改进：
```typescript
// ❌ 现在：
get velocityX() { return this.physics.velocityX; }
set velocityX(value) { this.physics.velocityX = value; }

// ✅ 改为方法 + 直接访问：
public getVelocity() { return { x: this.physics.velocityX, y: this.physics.velocityY }; }
public setVelocity(x: number, y: number) {
  this.physics.velocityX = x;
  this.physics.velocityY = y;
}
// 或者直接访问：
fighter.physics.velocityX = 100;
```

### 方案 3: 合并重复的类

**AIDecision + AITactics** - 合并为单一状态类：
```typescript
// ❌ 现在：AIDecision 代理到 AITactics
class AIDecision {
  getState() => this.tactics.getState()
  setState() => this.tactics.setState()
  getTimer() => this.tactics.getTimer()
  setTimer() => this.tactics.setTimer()
  // ... 大量代理方法
}

// ✅ 改为：直接暴露 tactics
class AIDecision {
  public readonly state = new AITactics(...);
  // 移除所有代理方法
}

// 使用时：
decision.state.getState()
```

### 方案 4: 使用接口/类型约束

```typescript
// 定义只读接口
interface FighterStateView {
  state: FighterState;
  health: number;
  isDead: boolean;
}

// 返回只读视图
public getState(): FighterStateView {
  return {
    state: this.combat.state,
    health: this.health,
    isDead: this.isDead,
  };
}
```

## 推荐的重构优先级

### 高优先级（立即改进）
1. **Fighter.ts** - 移除 `state`, `attackAngle`, `currentWeapon`, `currentAttack` 的 getter/setter
2. **AIDecision.ts** - 移除代理到 tactics 的方法，直接暴露 `tactics`
3. **AIStateExecutor.ts** - 同上

### 中优先级
4. **Fighter.velocityX/Y** - 改为方法或直接访问 physics
5. **AITactics.ts** - 考虑使用对象字面量而非类

### 低优先级（可选）
6. FighterCombat 的 getter - 部分可移除
7. UI 相关的 getter - 保持现状（提供抽象层）

## 改进后的代码示例

### Fighter.ts 简化版：
```typescript
export class Fighter extends Container {
  // 直接暴露子系统
  public readonly physics: FighterPhysics;
  public readonly combat: FighterCombat;
  public readonly weaponManager: WeaponManager;

  // 保留有封装价值的
  public get input() {
    return this.inputHandler.input;
  }

  // 移除所有简单转发的 getter/setter
  // 使用：fighter.combat.state = FighterState.WALK
}
```

### AIDecision 简化版：
```typescript
export class AIDecision {
  // 直接暴露，移除所有代理方法
  public readonly state: AITactics;
  public readonly weaponStrategy: AIWeaponStrategy;

  constructor() {
    this.state = new AITactics("idle", 0, 150, 0.5, 0);
    this.weaponStrategy = new AIWeaponStrategy();
  }

  // 只保留业务逻辑方法
  public makeDecision(distance: number, ai: Fighter): void {
    this.state.makeTacticalDecision(distance, ai);
  }
}
```

## 预期效果

- **代码行数减少**：约 100-150 行
- **复杂度降低**：减少间接层
- **性能提升**：减少函数调用开销
- **可读性提升**：代码路径更清晰

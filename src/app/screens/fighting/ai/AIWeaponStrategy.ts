import { Fighter } from "../fighter/Fighter";

/** AI武器选择策略 */
export class AIWeaponStrategy {
  /** 根据距离选择武器 */
  public decideWeapon(distance: number, ai: Fighter): number {
    // 获取狙击枪弹药状态
    const allWeapons = ai.weaponManager.getAllWeapons();
    const sniper = allWeapons[4]; // 狙击枪在索引4
    const sniperState = sniper.getState();
    const sniperHasAmmo = sniperState.currentAmmo > 0;

    // 根据距离和战术选择武器索引
    let targetIndex: number;

    if (distance > 400) {
      // 超远距离优先用狙击枪(索引4),如果没子弹则用手枪(索引2)
      targetIndex = sniperHasAmmo ? 4 : 2;
    } else if (distance > 250) {
      // 远距离用机枪(索引3)或狙击枪(索引4),如果狙击没子弹则只考虑机枪
      if (sniperHasAmmo) {
        targetIndex = Math.random() < 0.5 ? 4 : 3;
      } else {
        targetIndex = 3;
      }
    } else if (distance > 150) {
      // 中距离用手枪(索引2)或机枪(索引3)
      targetIndex = Math.random() < 0.6 ? 3 : 2;
    } else {
      // 近距离用重拳(索引1)或轻拳(索引0)
      targetIndex = Math.random() < 0.6 ? 1 : 0;
    }

    // 如果当前武器不是目标武器,切换武器
    if (ai.weaponManager.getCurrentWeaponIndex() !== targetIndex) {
      // 计算需要切换多少次
      let switchCount = 0;
      const maxSwitches = 5; // 最多按5次换武器键
      while (
        ai.weaponManager.getCurrentWeaponIndex() !== targetIndex &&
        switchCount < maxSwitches
      ) {
        ai.switchWeapon();
        switchCount++;
      }
      return 2000 + Math.random() * 3000; // 返回冷却时间
    }
    return 0;
  }
}

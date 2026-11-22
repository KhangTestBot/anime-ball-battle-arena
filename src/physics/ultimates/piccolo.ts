import type { UltimateHandler } from './types';

export interface PiccoloUltimateData {
  grenadesDone: number;
  grenadeCd: number;
  sbcFired: boolean;
  sbcAngle: number;
  sbcFlash: number;
}

export const piccoloUltimateHandler: UltimateHandler = {
  characterId: 'piccolo',
  title: 'ORANGE PICCOLO: SPECIAL BEAM CANNON!',
  subtitle:
    'Awakens Orange Piccolo (+20% DMG, Enchanted Armor & Unstoppable), traps foes with 3 Hellzone Grenade volleys, and drills through with Special Beam Cannon!',
  bannerColor: '#f97316',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.8);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.8);
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: PiccoloUltimateData = {
      grenadesDone: 0,
      grenadeCd: 0.32,
      sbcFired: false,
      sbcAngle: ang,
      sbcFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#f97316', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'ORANGE PICCOLO AWAKENED!!',
      '#f97316',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as PiccoloUltimateData;
    if (data.sbcFlash > 0) data.sbcFlash = Math.max(0, data.sbcFlash - dt);

    if (!data.sbcFired && data.grenadesDone < 3) {
      data.grenadeCd -= dt;
      if (data.grenadeCd <= 0) {
        data.grenadeCd = 0.44;
        data.grenadesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        data.sbcAngle = ang;
        for (const offset of [-0.22, 0, 0.22]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('piccolo_hellzone'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'zoltraak-orb',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 620,
            vy: Math.sin(a) * 620,
            radius: 12,
            damage: ctx.getEffectiveDamage(owner, 8.0),
            knockback: 205,
            color: '#facc15',
            secondaryColor: '#f97316',
            angle: a,
            life: 1.5,
            maxLife: 1.5,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.15 });
      }
    }

    if (!data.sbcFired && state.elapsed >= 2.05) {
      data.sbcFired = true;
      data.sbcFlash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.armorShredTimer = Math.max(e.armorShredTimer, 4.5);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.5),
          Math.cos(ang) * 630,
          Math.sin(ang) * 630,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        335,
        '#f97316',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'SPECIAL BEAM CANNON!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.5 });
    }
  },
};

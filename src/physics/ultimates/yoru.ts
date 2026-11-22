import type { UltimateHandler } from './types';

export interface YoruUltimateData {
  salvosDone: number;
  salvoCd: number;
  bangFired: boolean;
  flash: number;
}

export const yoruUltimateHandler: UltimateHandler = {
  characterId: 'yoru',
  title: 'WAR DEVIL: GUN & TANK GAUNTLETS!',
  subtitle:
    'Summons Gun & Tank Devil gauntlets (+22% DMG & Unstoppable), blasts 4 Statue of Liberty salvos, and fires BANG! War Calamity!',
  bannerColor: '#ef4444',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 22;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);

    const data: YoruUltimateData = {
      salvosDone: 0,
      salvoCd: 0.28,
      bangFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'GUN & TANK GAUNTLETS!!',
      '#ef4444',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'beam-fire', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as YoruUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.bangFired && data.salvosDone < 4) {
      data.salvoCd -= dt;
      if (data.salvoCd <= 0) {
        data.salvoCd = 0.36;
        data.salvosDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.18, 0, 0.18]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('yoru_gun'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'rocket',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 720,
            vy: Math.sin(a) * 720,
            radius: 11,
            damage: ctx.getEffectiveDamage(owner, 7.8),
            knockback: 230,
            color: '#ef4444',
            secondaryColor: '#facc15',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.2 });
      }
    }

    if (!data.bangFired && state.elapsed >= 2.05) {
      data.bangFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.armorShredTimer = Math.max(e.armorShredTimer, 4.5);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 27.0),
          Math.cos(ang) * 650,
          Math.sin(ang) * 650,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        355,
        '#ef4444',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'BANG!! WAR CALAMITY!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(21);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.45 });
    }
  },
};

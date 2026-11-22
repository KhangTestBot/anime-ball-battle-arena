import type { UltimateHandler } from './types';

export interface BerserkerHercUltimateData {
  smashesDone: number;
  smashCd: number;
  nineLivesFired: boolean;
  flash: number;
}

export const berserkerHercUltimateHandler: UltimateHandler = {
  characterId: 'berserker_herc',
  title: 'GOD HAND & NINE LIVES!!',
  subtitle:
    'Activates Twelve Labors God Hand (Totem Revive + Unstoppable + +25% DMG), unleashes 3 Axe-Sword shockwaves, and finishes with NINE LIVES!',
  bannerColor: '#ef4444',
  castDuration: 0.24,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.totemActive = true;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.8);
    owner.dmgBonusPct += 25;

    const data: BerserkerHercUltimateData = {
      smashesDone: 0,
      smashCd: 0.3,
      nineLivesFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'GOD HAND: TWELVE LABORS!!',
      '#ef4444',
      'powerup',
    );
    ctx.addScreenShake(14);
    ctx.emitSfx({ type: 'powerup', intensity: 1.35 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as BerserkerHercUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.nineLivesFired && data.smashesDone < 3) {
      data.smashCd -= dt;
      if (data.smashCd <= 0) {
        data.smashCd = 0.44;
        data.smashesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.2, 0, 0.2]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('herc_axe'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'axe',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 670,
            vy: Math.sin(a) * 670,
            radius: 15,
            damage: ctx.getEffectiveDamage(owner, 9.2),
            knockback: 250,
            color: '#78716c',
            secondaryColor: '#ef4444',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'wall', intensity: 1.3 });
      }
    }

    if (!data.nineLivesFired && state.elapsed >= 2.05) {
      data.nineLivesFired = true;
      data.flash = 1.5;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 28.5),
          Math.cos(ang) * 700,
          Math.sin(ang) * 700,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        370,
        '#ef4444',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'NINE LIVES: SHOOTING THE HUNDRED HEADS!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(22);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.5 });
    }
  },

  onExpire(_ctx, owner) {
    if (!owner) return;
    owner.totemActive = false;
  },
};

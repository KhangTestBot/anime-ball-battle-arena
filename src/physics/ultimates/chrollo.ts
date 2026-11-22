import type { UltimateHandler } from './types';

export interface ChrolloUltimateData {
  fishesDone: number;
  fishCd: number;
  sunMoonFired: boolean;
  flash: number;
}

export const chrolloUltimateHandler: UltimateHandler = {
  characterId: 'chrollo',
  title: 'SKILL HUNTER: SUN AND MOON!',
  subtitle:
    'Opens Bandit Secret (+20% DMG & Auto-Dodge), unleashes 3 Indoor Fish & Black Voice volleys, and detonates Sun and Moon!',
  bannerColor: '#a855f7',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.8);
    for (const e of ctx.getEnemies(owner)) {
      e.confusedTimer = Math.max(e.confusedTimer, 2.2);
    }

    const data: ChrolloUltimateData = {
      fishesDone: 0,
      fishCd: 0.3,
      sunMoonFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'SKILL HUNTER: BANDIT SECRET!',
      '#a855f7',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ChrolloUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.sunMoonFired && data.fishesDone < 3) {
      data.fishCd -= dt;
      if (data.fishCd <= 0) {
        data.fishCd = 0.44;
        data.fishesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.2, 0, 0.2]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('chrollo_fish'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'zoltraak-orb',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 660,
            vy: Math.sin(a) * 660,
            radius: 11,
            damage: ctx.getEffectiveDamage(owner, 8.0),
            knockback: 205,
            color: '#a855f7',
            secondaryColor: '#facc15',
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

    if (!data.sunMoonFired && state.elapsed >= 2.05) {
      data.sunMoonFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
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
        340,
        '#a855f7',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'SUN AND MOON DETONATION!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};

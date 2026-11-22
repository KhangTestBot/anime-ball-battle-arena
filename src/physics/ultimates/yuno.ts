import type { UltimateHandler } from './types';

export interface YunoUltimateData {
  volleysDone: number;
  volleyCd: number;
  quartetFired: boolean;
  flash: number;
}

export const yunoUltimateHandler: UltimateHandler = {
  characterId: 'yuno',
  title: 'STAR MAGIC & SPIRIT DIVE: QUARTET!',
  subtitle:
    'Enters Saint Stage Spirit Dive (Auto-Dodge + +20% DMG), fires 3 Spirit of Boreas & Star volleys, and unleashes Quartile Hasta!',
  bannerColor: '#10b981',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.0);
    owner.dmgBonusPct += 20;

    const data: YunoUltimateData = {
      volleysDone: 0,
      volleyCd: 0.28,
      quartetFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#10b981', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'SPIRIT DIVE: STAR MAGIC!!',
      '#10b981',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as YunoUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.quartetFired && data.volleysDone < 3) {
      data.volleyCd -= dt;
      if (data.volleyCd <= 0) {
        data.volleyCd = 0.44;
        data.volleysDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.22, 0, 0.22]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('yuno_star'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'tornado',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 720,
            vy: Math.sin(a) * 720,
            radius: 13,
            damage: ctx.getEffectiveDamage(owner, 8.4),
            knockback: 220,
            color: '#10b981',
            secondaryColor: '#facc15',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.2 });
      }
    }

    if (!data.quartetFired && state.elapsed >= 2.0) {
      data.quartetFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.5),
          Math.cos(ang) * 640,
          Math.sin(ang) * 640,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        345,
        '#10b981',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'QUARTILE HASTA: SAINT STAGE!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};

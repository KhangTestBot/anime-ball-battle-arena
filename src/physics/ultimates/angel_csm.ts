import type { UltimateHandler } from './types';

export interface AngelCsmUltimateData {
  wavesDone: number;
  waveCd: number;
  spearFired: boolean;
  flash: number;
}

export const angelCsmUltimateHandler: UltimateHandler = {
  characterId: 'angel_csm',
  title: 'ANGEL DEVIL: 1,000-YEAR LIFESPAN SPEAR!',
  subtitle:
    'Siphons enemy lifespan (Anti-Heal + Silence), launches 3 100-Year Sword waves, and hurls the halo-forged 1,000-Year Spear!',
  bannerColor: '#f8fafc',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    for (const e of ctx.getEnemies(owner)) {
      e.antiHealTimer = Math.max(e.antiHealTimer, 4.5);
      e.silenceTimer = Math.max(e.silenceTimer, 2.2);
    }

    const data: AngelCsmUltimateData = {
      wavesDone: 0,
      waveCd: 0.3,
      spearFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f8fafc', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'USAGE: 1,000 YEARS!!',
      '#f8fafc',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as AngelCsmUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.spearFired && data.wavesDone < 3) {
      data.waveCd -= dt;
      if (data.waveCd <= 0) {
        data.waveCd = 0.44;
        data.wavesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.18, 0, 0.18]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('angel_sword'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'sword-wave',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 690,
            vy: Math.sin(a) * 690,
            radius: 14,
            damage: ctx.getEffectiveDamage(owner, 8.0),
            knockback: 210,
            color: '#f8fafc',
            secondaryColor: '#ef4444',
            angle: a,
            life: 1.4,
            maxLife: 1.4,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.2 });
      }
    }

    if (!data.spearFired && state.elapsed >= 2.0) {
      data.spearFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.5),
          Math.cos(ang) * 620,
          Math.sin(ang) * 620,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        335,
        '#f8fafc',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        '1,000-YEAR SPEAR!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};

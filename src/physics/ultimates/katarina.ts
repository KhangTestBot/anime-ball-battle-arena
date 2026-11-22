import type { UltimateHandler } from './types';

export interface KatarinaUltimateData {
  ringsDone: number;
  ringCd: number;
  resetFired: boolean;
  flash: number;
}

export const katarinaUltimateHandler: UltimateHandler = {
  characterId: 'katarina',
  title: 'DEATH LOTUS (R): SHUNPO RESET!',
  subtitle:
    'Blinks with Shunpo (Auto-Dodge), unleashes 4 Death Lotus dagger rings inflicting Grievous Wounds, and finishes with Voracity Reset Cleave!',
  bannerColor: '#e11d48',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.8);
    owner.dmgBonusPct += 18;

    const data: KatarinaUltimateData = {
      ringsDone: 0,
      ringCd: 0.26,
      resetFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#e11d48', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'DEATH LOTUS!!',
      '#e11d48',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'slash', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KatarinaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.resetFired && data.ringsDone < 4) {
      data.ringCd -= dt;
      if (data.ringCd <= 0) {
        data.ringCd = 0.34;
        data.ringsDone += 1;
        for (let k = 0; k < 6; k++) {
          const a = (k * Math.PI) / 3 + data.ringsDone * 0.4;
          ctx.projectiles.push({
            id: ctx.nextId('kat_dagger'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'arrow-trident',
            x: owner.x + Math.cos(a) * (owner.radius + 8),
            y: owner.y + Math.sin(a) * (owner.radius + 8),
            vx: Math.cos(a) * 680,
            vy: Math.sin(a) * 680,
            radius: 9,
            damage: ctx.getEffectiveDamage(owner, 6.4),
            knockback: 165,
            color: '#e11d48',
            secondaryColor: '#f8fafc',
            angle: a,
            life: 1.25,
            maxLife: 1.25,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.2 });
      }
    }

    if (!data.resetFired && state.elapsed >= 2.0) {
      data.resetFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.antiHealTimer = Math.max(e.antiHealTimer, 4.5);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.0),
          Math.cos(ang) * 540,
          Math.sin(ang) * 540,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        305,
        '#e11d48',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'VORACITY RESET!!',
        '#e11d48',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};

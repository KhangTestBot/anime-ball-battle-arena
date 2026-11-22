import type { UltimateHandler } from './types';

export interface VanicaUltimateData {
  beastsDone: number;
  beastCd: number;
  curseFired: boolean;
  flash: number;
}

export const vanicaUltimateHandler: UltimateHandler = {
  characterId: 'vanica',
  title: 'CURSE-WARDING: DECAYING WORLD!',
  subtitle:
    'Unleashes Megicula Decaying World (Silence + Fear), sends 3 Crimson Blood Beast volleys, and detonates Red Beast Curse!',
  bannerColor: '#e11d48',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 22;
    for (const e of ctx.getEnemies(owner)) {
      e.silenceTimer = Math.max(e.silenceTimer, 2.8);
      e.stunTimer = Math.max(e.stunTimer, 0.85);
      e.stunKind = 'fear';
    }

    const data: VanicaUltimateData = {
      beastsDone: 0,
      beastCd: 0.28,
      curseFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#e11d48', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'DECAYING WORLD: RED BEAST!!',
      '#e11d48',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as VanicaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.curseFired && data.beastsDone < 3) {
      data.beastCd -= dt;
      if (data.beastCd <= 0) {
        data.beastCd = 0.44;
        data.beastsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.22, 0, 0.22]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('vanica_blood'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'red',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 690,
            vy: Math.sin(a) * 690,
            radius: 13,
            damage: ctx.getEffectiveDamage(owner, 8.6),
            knockback: 225,
            color: '#e11d48',
            secondaryColor: '#9333ea',
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

    if (!data.curseFired && state.elapsed >= 2.05) {
      data.curseFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
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
        '#e11d48',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'EXPLODING CURSE DETONATION!!',
        '#c084fc',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.45 });
    }
  },
};

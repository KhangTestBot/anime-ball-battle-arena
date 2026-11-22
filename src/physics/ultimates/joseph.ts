import type { UltimateHandler } from './types';

export interface JosephUltimateData {
  volleysDone: number;
  volleyCd: number;
  overdriveFired: boolean;
  flash: number;
}

export const josephUltimateHandler: UltimateHandler = {
  characterId: 'joseph',
  title: 'HERMIT PURPLE: YOUR NEXT LINE IS...!',
  subtitle:
    'Predicts enemy moves (Auto-Dodge + Silence), unleashes 3 Tommy Gun & Clacker Volley bursts, and finishes with Hamon Overdrive!',
  bannerColor: '#22c55e',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.0);
    for (const e of ctx.getEnemies(owner)) {
      e.silenceTimer = Math.max(e.silenceTimer, 2.2);
    }

    const data: JosephUltimateData = {
      volleysDone: 0,
      volleyCd: 0.28,
      overdriveFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#22c55e', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'YOUR NEXT LINE IS...!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'dodge', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as JosephUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.overdriveFired && data.volleysDone < 3) {
      data.volleyCd -= dt;
      if (data.volleyCd <= 0) {
        data.volleyCd = 0.42;
        data.volleysDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.24, -0.08, 0.08, 0.24]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('joseph_hamon'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'rocket',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 720,
            vy: Math.sin(a) * 720,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 6.8),
            knockback: 185,
            color: '#facc15',
            secondaryColor: '#a855f7',
            angle: a,
            life: 1.35,
            maxLife: 1.35,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.15 });
      }
    }

    if (!data.overdriveFired && state.elapsed >= 2.0) {
      data.overdriveFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.0);
        e.stunKind = 'chained';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.5),
          Math.cos(ang) * 580,
          Math.sin(ang) * 580,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        315,
        '#facc15',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'HERMIT PURPLE OVERDRIVE!!',
        '#22c55e',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};

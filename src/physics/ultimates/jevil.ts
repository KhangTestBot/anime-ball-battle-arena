import type { UltimateHandler } from './types';

export interface JevilUltimateData {
  knivesDone: number;
  knifeCd: number;
  finalChaosFired: boolean;
  flash: number;
}

export const jevilUltimateHandler: UltimateHandler = {
  characterId: 'jevil',
  title: 'CHAOS, CHAOS!: DEVILSKNIFE CAROUSEL!',
  subtitle:
    'Confuses all foes ("I CAN DO ANYTHING!" + Auto-Dodge), hurls 4 spinning Devilsknife scythe volleys, and drops Final Chaos!',
  bannerColor: '#a855f7',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.0);
    for (const e of ctx.getEnemies(owner)) {
      e.confusedTimer = Math.max(e.confusedTimer, 2.5);
    }

    const data: JevilUltimateData = {
      knivesDone: 0,
      knifeCd: 0.28,
      finalChaosFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'I CAN DO ANYTHING!!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as JevilUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.finalChaosFired && data.knivesDone < 4) {
      data.knifeCd -= dt;
      if (data.knifeCd <= 0) {
        data.knifeCd = 0.36;
        data.knivesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.25, 0, 0.25]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('jevil_scythe'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'scythe',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 630,
            vy: Math.sin(a) * 630,
            radius: 13,
            damage: ctx.getEffectiveDamage(owner, 7.2),
            knockback: 195,
            color: '#a855f7',
            secondaryColor: '#facc15',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.15 });
      }
    }

    if (!data.finalChaosFired && state.elapsed >= 2.0) {
      data.finalChaosFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.confusedTimer = Math.max(e.confusedTimer, 2.5);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.0),
          Math.cos(ang) * 580,
          Math.sin(ang) * 580,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#facc15',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'FINAL CHAOS!!',
        '#a855f7',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};

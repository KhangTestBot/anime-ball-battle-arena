import type { UltimateHandler } from './types';

export interface TogaUltimateData {
  knivesDone: number;
  knifeCd: number;
  paradeFired: boolean;
  flash: number;
}

export const togaUltimateHandler: UltimateHandler = {
  characterId: 'toga',
  title: "SAD MAN'S DEATH PARADE: TRANSFORM!",
  subtitle:
    'Copies quirks and confuses foes (Auto-Dodge + Confusion + Charm), hurls 4 clone-knife volleys, and floods the arena in Sad Man Death Parade!',
  bannerColor: '#ec4899',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.0);
    for (const e of ctx.getEnemies(owner)) {
      e.confusedTimer = Math.max(e.confusedTimer, 2.6);
      e.charmTimer = Math.max(e.charmTimer, 1.8);
      e.charmOwnerUid = owner.uid;
    }

    const data: TogaUltimateData = {
      knivesDone: 0,
      knifeCd: 0.28,
      paradeFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ec4899', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      "SAD MAN'S DEATH PARADE!!",
      '#ec4899',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'slash', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as TogaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.paradeFired && data.knivesDone < 4) {
      data.knifeCd -= dt;
      if (data.knifeCd <= 0) {
        data.knifeCd = 0.36;
        data.knivesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.22, 0, 0.22]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('toga_knife'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'arrow-trident',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 690,
            vy: Math.sin(a) * 690,
            radius: 9,
            damage: ctx.getEffectiveDamage(owner, 7.2),
            knockback: 190,
            color: '#ec4899',
            secondaryColor: '#facc15',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.15 });
      }
    }

    if (!data.paradeFired && state.elapsed >= 2.0) {
      data.paradeFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.antiHealTimer = Math.max(e.antiHealTimer, 4.0);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.0),
          Math.cos(ang) * 560,
          Math.sin(ang) * 560,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        310,
        '#ec4899',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'CLONE SWARM OVERWHELM!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};

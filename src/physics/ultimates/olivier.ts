import type { UltimateHandler } from './types';

export interface OlivierUltimateData {
  shellsDone: number;
  shellCd: number;
  slashFired: boolean;
  flash: number;
}

export const olivierUltimateHandler: UltimateHandler = {
  characterId: 'olivier',
  title: 'NORTHERN WALL OF BRIGGS: TANK BARRAGE!',
  subtitle:
    'Freezes enemies in Briggs blizzard (+18% DMG & Frost), fires 3 Briggs Tank Shell volleys, and executes Survival of the Fittest Slash!',
  bannerColor: '#38bdf8',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 18;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.2);
    for (const e of ctx.getEnemies(owner)) {
      e.frostTimer = Math.max(e.frostTimer, 4.0);
    }

    const data: OlivierUltimateData = {
      shellsDone: 0,
      shellCd: 0.3,
      slashFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'NORTHERN WALL OF BRIGGS!!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'beam-fire', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as OlivierUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.slashFired && data.shellsDone < 3) {
      data.shellCd -= dt;
      if (data.shellCd <= 0) {
        data.shellCd = 0.44;
        data.shellsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.16, 0, 0.16]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('briggs_shell'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'rocket',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 690,
            vy: Math.sin(a) * 690,
            radius: 11,
            damage: ctx.getEffectiveDamage(owner, 8.0),
            knockback: 225,
            color: '#38bdf8',
            secondaryColor: '#cbd5e1',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.15 });
      }
    }

    if (!data.slashFired && state.elapsed >= 2.0) {
      data.slashFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.armorShredTimer = Math.max(e.armorShredTimer, 4.0);
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
        '#38bdf8',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'SURVIVAL OF THE FITTEST!!',
        '#cbd5e1',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'slash', intensity: 1.4 });
    }
  },
};

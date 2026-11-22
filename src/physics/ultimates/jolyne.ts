import type { UltimateHandler } from './types';

export interface JolyneUltimateData {
  stringsDone: number;
  stringCd: number;
  oraFired: boolean;
  flash: number;
}

export const jolyneUltimateHandler: UltimateHandler = {
  characterId: 'jolyne',
  title: 'STONE FREE: MOBIUS STRIP ORA!',
  subtitle:
    'Forms a Mobius Strip (Shield + Unstoppable), binds foes with 3 Stone Free string barrages, and finishes with ORA ORA ORA!!',
  bannerColor: '#38bdf8',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.0);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.8);
    owner.dmgBonusPct += 18;

    const data: JolyneUltimateData = {
      stringsDone: 0,
      stringCd: 0.28,
      oraFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'STONE FREE: MOBIUS STRIP!!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as JolyneUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.oraFired && data.stringsDone < 3) {
      data.stringCd -= dt;
      if (data.stringCd <= 0) {
        data.stringCd = 0.44;
        data.stringsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.2, 0, 0.2]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('jolyne_str'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'arrow-trident',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 710,
            vy: Math.sin(a) * 710,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 7.8),
            knockback: 205,
            color: '#38bdf8',
            secondaryColor: '#22c55e',
            angle: a,
            life: 1.4,
            maxLife: 1.4,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.15 });
      }
    }

    if (!data.oraFired && state.elapsed >= 2.0) {
      data.oraFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.05);
        e.stunKind = 'chained';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.0),
          Math.cos(ang) * 600,
          Math.sin(ang) * 600,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#38bdf8',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'ORA ORA ORA ORA!!',
        '#22c55e',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};

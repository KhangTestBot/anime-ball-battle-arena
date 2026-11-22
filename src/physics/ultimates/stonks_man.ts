import type { UltimateHandler } from './types';

export interface StonksManUltimateData {
  candlesDone: number;
  candleCd: number;
  crashFired: boolean;
  flash: number;
}

export const stonksManUltimateHandler: UltimateHandler = {
  characterId: 'stonks_man',
  title: 'INFINITE STONKS & HELTH!!',
  subtitle:
    'Activates HELTH (+22% HP + Shield + +20% DMG), fires 3 rising green Stonks arrow volleys, and triggers MARKET CRASH!',
  bannerColor: '#22c55e',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.hp = Math.min(owner.maxHp, owner.hp + owner.maxHp * 0.22);
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.0);
    owner.dmgBonusPct += 20;

    const data: StonksManUltimateData = {
      candlesDone: 0,
      candleCd: 0.28,
      crashFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#22c55e', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'HELTH +22%!! STONKS UP!!',
      '#22c55e',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'heal', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as StonksManUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.crashFired && data.candlesDone < 3) {
      data.candleCd -= dt;
      if (data.candleCd <= 0) {
        data.candleCd = 0.44;
        data.candlesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.22, 0, 0.22]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('stonks_arrow'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'arrow-trident',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 740,
            vy: Math.sin(a) * 740,
            radius: 12,
            damage: ctx.getEffectiveDamage(owner, 8.4),
            knockback: 225,
            color: data.candlesDone % 2 === 1 ? '#22c55e' : '#ef4444',
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

    if (!data.crashFired && state.elapsed >= 2.0) {
      data.crashFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.5),
          Math.cos(ang) * 650,
          Math.sin(ang) * 650,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        355,
        '#22c55e',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'INFINITE STONKS!! +9999%!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.45 });
    }
  },
};

import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface EvokerUltimateData {
  fangsLineFired: boolean;
  fangAngle: number;
  vexWaves: number;
  vexCd: number;
  flash: number;
}

export const evokerUltimateHandler: UltimateHandler = {
  characterId: 'evoker',
  title: 'WOLOLO · EVOKER FANGS & VEX SWARM',
  subtitle:
    'Summons homing Vex spirit blades and erupts a snapping line of Evoker Fangs straight across the arena stunning & shattering shields!',
  bannerColor: '#eab308',
  castDuration: 0.24,
  duration: 3.7,

  onCast(ctx, owner, state) {
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: EvokerUltimateData = {
      fangsLineFired: false,
      fangAngle: ang,
      vexWaves: 0,
      vexCd: 0.3,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#eab308', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'WOLOLO! VEX SWARM!',
      '#fde047',
      'powerup',
    );
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as EvokerUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.fangsLineFired && data.vexWaves < 3) {
      data.vexCd -= dt;
      if (data.vexCd <= 0) {
        data.vexCd = 0.42;
        data.vexWaves += 1;
        for (let k = 0; k < 2; k++) {
          const a = owner.facingAngle + (k === 0 ? 0.5 : -0.5);
          ctx.projectiles.push({
            id: ctx.nextId('evoker_vex'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'dagger-blade',
            x: owner.x,
            y: owner.y,
            vx: Math.cos(a) * 440,
            vy: Math.sin(a) * 440,
            radius: 9,
            damage: ctx.getEffectiveDamage(owner, 7.6),
            knockback: 140,
            color: '#93c5fd',
            secondaryColor: '#f8fafc',
            angle: a,
            life: 2.0,
            maxLife: 2.0,
            piercing: false,
            homing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.0 });
      }
    }

    if (!data.fangsLineFired && state.elapsed >= 1.8) {
      data.fangsLineFired = true;
      data.flash = 1.25;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : data.fangAngle;
      data.fangAngle = ang;
      const lx = Math.cos(ang);
      const ly = Math.sin(ang);

      for (const e of ctx.getEnemies(owner)) {
        const px = e.x - owner.x;
        const py = e.y - owner.y;
        if (px * lx + py * ly >= -e.radius - 30 && Math.abs(px * ly - py * lx) <= e.radius + 84) {
          e.shieldTimer = 0;
          applyFighterStun(ctx, owner, e, 0.75, 'chained', 'FANG TRAP!');
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 20.5), 0, 0, {
            isCrit: true,
            bypassInvuln: true,
            sourceKind: 'ability',
          });
        }
      }
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'EVOKER FANGS!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(14);
      ctx.emitSfx({ type: 'crit', intensity: 1.25 });
    }
  },
};

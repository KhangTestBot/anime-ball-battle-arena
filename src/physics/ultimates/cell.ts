import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface CellUltimateData {
  juniorIds: string[];
  beamFired: boolean;
  beamAngle: number;
  beamFlash: number;
}

export const cellUltimateHandler: UltimateHandler = {
  characterId: 'cell',
  title: 'PERFECT CELL: CELL JUNIORS & SOLAR KAMEHAMEHA',
  subtitle:
    'Namekian cells regenerate +11% Max HP & spawn 3 AI Cell Juniors to swarm enemies → Unleashes a golden-blue Solar Kamehameha piercing foes & wiping out obstacles!',
  bannerColor: '#16a34a',
  castDuration: 0.25,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.3);
    const healAmt = owner.maxHp * 0.11 * getHealMultiplier(owner);
    if (healAmt > 0.5) {
      owner.hp = Math.min(owner.maxHp, owner.hp + healAmt);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 14,
        `+${Math.round(healAmt)} CELL REGEN`,
        '#4ade80',
        'heal',
      );
    }

    const { left, right, top, bottom } = ctx.bounds;
    const juniorIds: string[] = [];
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      const cid = ctx.nextId('cell_jr');
      juniorIds.push(cid);
      ctx.minions.push({
        id: cid,
        ownerUid: owner.uid,
        ownerCharId: owner.character.id,
        ownerSeries: owner.character.series,
        skillMotif: 'bio-cell',
        teamId: owner.teamId,
        kind: 'shadow',
        x: Math.max(left + 26, Math.min(right - 26, owner.x + Math.cos(a) * 44)),
        y: Math.max(top + 26, Math.min(bottom - 26, owner.y + Math.sin(a) * 44)),
        vx: Math.cos(a) * 300,
        vy: Math.sin(a) * 300,
        radius: 13,
        hp: 40,
        maxHp: 40,
        damage: ctx.getEffectiveDamage(owner, 4.0),
        life: 3.1,
        maxLife: 3.1,
        color: '#2563eb',
        accentColor: '#4ade80',
        hitCooldowns: {},
      });
    }

    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: CellUltimateData = {
      juniorIds,
      beamFired: false,
      beamAngle: ang,
      beamFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#eab308', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      195,
      '#facc15',
      6.5,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'CELL JUNIORS! GO!',
      '#86efac',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'beam-charge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as CellUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (data.beamFlash > 0) data.beamFlash = Math.max(0, data.beamFlash - dt);

    const target = ctx.getNearestEnemy(owner);
    if (!data.beamFired && target) {
      data.beamAngle = Math.atan2(target.y - owner.y, target.x - owner.x);
    }

    // Climax (1.8s): SOLAR KAMEHAMEHA!!
    if (!data.beamFired && state.elapsed >= 1.8) {
      data.beamFired = true;
      data.beamFlash = 1.15;

      const lx = Math.cos(data.beamAngle);
      const ly = Math.sin(data.beamAngle);

      ctx.beams.push({
        id: ctx.nextId('solar_kamehameha'),
        ownerUid: owner.uid,
        ownerCharId: owner.character.id,
        ownerSeries: owner.character.series,
        teamId: owner.teamId,
        originX: owner.x,
        originY: owner.y,
        angle: data.beamAngle,
        width: 38,
        damagePerTick: ctx.getEffectiveDamage(owner, 4.4),
        color: '#16a34a',
        secondaryColor: '#facc15',
        coreColor: '#ffffff',
        life: 1.05,
        maxLife: 1.05,
        tickTimer: 0.16,
        powerLevel: 7,
        style: 'kamehameha',
      });

      for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
        const obs = ctx.obstacles[i];
        const px = obs.x - owner.x;
        const py = obs.y - owner.y;
        const proj = px * lx + py * ly;
        const perp = Math.abs(px * ly - py * lx);
        if (proj >= 0 && perp <= 50) {
          ctx.obstacles.splice(i, 1);
        }
      }

      for (const e of enemies) {
        const px = e.x - owner.x;
        const py = e.y - owner.y;
        const proj = px * lx + py * ly;
        const perp = Math.abs(px * ly - py * lx);
        if (proj >= -e.radius && perp <= e.radius + 52) {
          e.armorShredTimer = Math.max(e.armorShredTimer, 2.5);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 15.0), lx * 520, ly * 520, {
            isCrit: true,
            sourceKind: 'ability',
          });
        }
      }

      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 22,
        'SOLAR KAMEHAMEHA!!',
        '#fef08a',
        'powerup',
      );
      ctx.addHitstop(0.08);
      ctx.addScreenShake(20);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.4 });
    }
  },
};

import type { UltimateHandler } from './types';

export interface UbwSword {
  x: number;
  y: number;
  fired: boolean;
}

export interface ArcherEmiyaUltimateData {
  swords: UbwSword[];
  fireIndex: number;
  fireCd: number;
  caladbolgFired: boolean;
  gearPhase: number;
}

export const archerEmiyaUltimateHandler: UltimateHandler = {
  characterId: 'archer_emiya',
  title: 'UNLIMITED BLADE WORKS',
  subtitle:
    'Deploys the Unlimited Blade Works Reality Marble with Sunset Gears · Plants 16 Spirit Swords around the arena for crossfire volleys → Fires space-twisting Caladbolg II!',
  bannerColor: '#dc2626',
  castDuration: 0.28,
  duration: 4.5,

  onCast(ctx, owner, state) {
    const { left, right, top, bottom } = ctx.bounds;
    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;
    const rx = Math.max(120, (right - left) * 0.42);
    const ry = Math.max(120, (bottom - top) * 0.42);

    const swords: UbwSword[] = [];
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI * 2) / 16;
      const ringScale = i % 2 === 0 ? 1.0 : 0.62;
      swords.push({
        x: Math.max(left + 22, Math.min(right - 22, cx + Math.cos(a) * rx * ringScale)),
        y: Math.max(top + 22, Math.min(bottom - 22, cy + Math.sin(a) * ry * ringScale)),
        fired: false,
      });
    }

    const data: ArcherEmiyaUltimateData = {
      swords,
      fireIndex: 0,
      fireCd: 0.12,
      caladbolgFired: false,
      gearPhase: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnShockwave(cx, cy, 280, '#f97316', 7, owner.character.id, owner.character.series);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'UNLIMITED BLADE WORKS!!',
      '#fca5a5',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 26, '#f97316', 85, 290, 3, 6, 'star');
    ctx.addScreenShake(12);
    ctx.addHitstop(0.06);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ArcherEmiyaUltimateData;
    const enemies = ctx.getEnemies(owner);
    data.gearPhase += dt * 0.7;

    // Progressively levitate & launch all 16 ground-planted UBW swords toward enemies from 360-degree crossfire!
    if (data.fireIndex < data.swords.length) {
      data.fireCd -= dt;
      while (data.fireCd <= 0 && data.fireIndex < data.swords.length) {
        data.fireCd += 0.16;
        const sword = data.swords[data.fireIndex];
        sword.fired = true;
        const target = enemies[data.fireIndex % Math.max(1, enemies.length)] ?? null;
        const ang = target ? Math.atan2(target.y - sword.y, target.x - sword.x) : owner.facingAngle;

        ctx.projectiles.push({
          id: ctx.nextId('ubw_sw'),
          ownerUid: owner.uid,
          teamId: owner.teamId,
          kind: 'sword-wave',
          x: sword.x,
          y: sword.y,
          vx: Math.cos(ang) * 700,
          vy: Math.sin(ang) * 700,
          radius: 9,
          damage: ctx.getEffectiveDamage(owner, 2.9),
          knockback: 175,
          color: '#f8fafc',
          secondaryColor: '#dc2626',
          angle: ang,
          life: 1.4,
          maxLife: 1.4,
          piercing: false,
          ownerCharId: owner.character.id,
          ownerSeries: owner.character.series,
          hitCooldowns: {},
          powerLevel: ctx.getForm(owner).powerLevel,
        });

        data.fireIndex++;
        if (data.fireIndex % 2 === 1) {
          ctx.emitSfx({ type: 'slash', intensity: 0.75 });
        }
      }
    }

    // Climax (2.9s): Fire Spiral Spatial Tear Arrow CALADBOLG II!
    if (!data.caladbolgFired && state.elapsed >= 2.9) {
      data.caladbolgFired = true;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

      ctx.projectiles.push({
        id: ctx.nextId('caladbolg'),
        ownerUid: owner.uid,
        teamId: owner.teamId,
        kind: 'arrow-trident',
        x: owner.x + Math.cos(ang) * (owner.radius + 14),
        y: owner.y + Math.sin(ang) * (owner.radius + 14),
        vx: Math.cos(ang) * 780,
        vy: Math.sin(ang) * 780,
        radius: 16,
        damage: ctx.getEffectiveDamage(owner, 14.5),
        knockback: 460,
        color: '#ef4444',
        secondaryColor: '#fde047',
        angle: ang,
        life: 1.6,
        maxLife: 1.6,
        piercing: true,
        explosiveRadius: 120,
        ownerCharId: owner.character.id,
        ownerSeries: owner.character.series,
        hitCooldowns: {},
        powerLevel: ctx.getForm(owner).powerLevel,
      });

      ctx.addHitstop(0.065);
      ctx.addScreenShake(16);
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 20,
        'CALADBOLG II!!',
        '#fde047',
        'powerup',
      );
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.35 });
    }
  },
};

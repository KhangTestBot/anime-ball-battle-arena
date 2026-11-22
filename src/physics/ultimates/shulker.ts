import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface ShulkerUltimateData {
  wavesFired: number;
  waveCd: number;
  levitationBurst: boolean;
  flash: number;
}

export const shulkerUltimateHandler: UltimateHandler = {
  characterId: 'shulker',
  title: 'END CITY SHELL & LEVITATION BULLET SWARM',
  subtitle:
    'Snaps shut in an armored Shulker Shell, fires 3 homing Shulker Bullet swarms, then suspends all enemies in Levitation!',
  bannerColor: '#c084fc',
  castDuration: 0.24,
  duration: 3.7,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.2);
    owner.shieldColor = '#c084fc';
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.2);

    const data: ShulkerUltimateData = {
      wavesFired: 0,
      waveCd: 0.3,
      levitationBurst: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, 0, '#c084fc', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'SHULKER SHELL!',
      '#e879f9',
      'powerup',
    );
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ShulkerUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.levitationBurst && data.wavesFired < 3) {
      data.waveCd -= dt;
      if (data.waveCd <= 0) {
        data.waveCd = 0.45;
        data.wavesFired += 1;
        for (let k = 0; k < 3; k++) {
          const a = (k * Math.PI * 2) / 3 + state.elapsed * 2;
          ctx.projectiles.push({
            id: ctx.nextId('shulker_b'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'glitch-cube',
            x: owner.x,
            y: owner.y,
            vx: Math.cos(a) * 340,
            vy: Math.sin(a) * 340,
            radius: 9,
            damage: ctx.getEffectiveDamage(owner, 7.6),
            knockback: 140,
            color: '#f8fafc',
            secondaryColor: '#c084fc',
            angle: a,
            life: 2.2,
            maxLife: 2.2,
            piercing: false,
            homing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.0 });
      }
    }

    if (!data.levitationBurst && state.elapsed >= 1.95) {
      data.levitationBurst = true;
      data.flash = 1.2;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.airborneTimer = Math.max(e.airborneTimer, 1.0);
        applyFighterStun(ctx, owner, e, 0.85, 'airborne', 'LEVITATION!');
        ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 18.5), 0, 0, {
          isCrit: true,
          bypassInvuln: true,
          sourceKind: 'ability',
        });
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        290,
        '#c084fc',
        8,
        owner.character.id,
        owner.character.series,
      );
      ctx.addScreenShake(13);
      ctx.emitSfx({ type: 'crit', intensity: 1.2 });
    }
  },
};

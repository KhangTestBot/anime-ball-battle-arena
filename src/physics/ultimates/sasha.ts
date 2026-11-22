import type { UltimateHandler } from './types';

export interface SashaUltimateData {
  shotsFired: number;
  shotCd: number;
  bullseyeFired: boolean;
  flash: number;
}

export const sashaUltimateHandler: UltimateHandler = {
  characterId: 'sasha',
  title: 'SNIPER OF PARADIS: ANTI-TITAN BULLSEYE!',
  subtitle:
    'Fires 4 piercing high-velocity Hunter Arrows and lands an unavoidable Anti-Titan Rifle Bullseye headshot!',
  bannerColor: '#ea580c',
  castDuration: 0.2,
  duration: 3.8,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 16;
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.4);

    const data: SashaUltimateData = {
      shotsFired: 0,
      shotCd: 0.26,
      bullseyeFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ea580c', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'DEADEYE LOCKED!',
      '#ea580c',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'powerup', intensity: 1.1 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as SashaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.bullseyeFired && data.shotsFired < 4) {
      data.shotCd -= dt;
      if (data.shotCd <= 0) {
        data.shotCd = 0.34;
        data.shotsFired += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        ctx.projectiles.push({
          id: ctx.nextId('sasha_arrow'),
          ownerUid: owner.uid,
          ownerCharId: owner.character.id,
          ownerSeries: owner.character.series,
          teamId: owner.teamId,
          kind: 'arrow-trident',
          x: owner.x + Math.cos(ang) * (owner.radius + 8),
          y: owner.y + Math.sin(ang) * (owner.radius + 8),
          vx: Math.cos(ang) * 760,
          vy: Math.sin(ang) * 760,
          radius: 9,
          damage: ctx.getEffectiveDamage(owner, 8.6),
          knockback: 200,
          color: '#ea580c',
          secondaryColor: '#fef08a',
          angle: ang,
          life: 1.5,
          maxLife: 1.5,
          piercing: true,
          hitCooldowns: {},
          powerLevel: ctx.getForm(owner).powerLevel,
        });
        ctx.emitSfx({ type: 'slash', intensity: 1.15 });
      }
    }

    if (!data.bullseyeFired && state.elapsed >= 1.95) {
      data.bullseyeFired = true;
      data.flash = 1.25;
      for (const e of ctx.getEnemies(owner)) {
        e.armorShredTimer = Math.max(e.armorShredTimer, 4.0);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.0),
          Math.cos(ang) * 520,
          Math.sin(ang) * 520,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        280,
        '#ea580c',
        9,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'BULLSEYE HEADSHOT!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(15);
      ctx.addHitstop(0.06);
      ctx.emitSfx({ type: 'crit', intensity: 1.4 });
    }
  },
};

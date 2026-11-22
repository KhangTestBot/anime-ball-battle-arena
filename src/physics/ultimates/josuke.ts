import type { UltimateHandler } from './types';

export interface JosukeUltimateData {
  shardsDone: number;
  shardCd: number;
  doraraFired: boolean;
  flash: number;
}

export const josukeUltimateHandler: UltimateHandler = {
  characterId: 'josuke',
  title: 'CRAZY DIAMOND: DORARARARA!!',
  subtitle:
    'Restores vitality (+18% HP + Shield), fires 3 homing restored crystal volleys, and crushes foes with DORARARARA!!',
  bannerColor: '#a855f7',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.hp = Math.min(owner.maxHp, owner.hp + owner.maxHp * 0.18);
    owner.shieldTimer = Math.max(owner.shieldTimer, 2.8);
    owner.dmgBonusPct += 16;

    const data: JosukeUltimateData = {
      shardsDone: 0,
      shardCd: 0.3,
      doraraFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'WHAT DID YOU SAY ABOUT MY HAIR?!',
      '#a855f7',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'heal', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as JosukeUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.doraraFired && data.shardsDone < 3) {
      data.shardCd -= dt;
      if (data.shardCd <= 0) {
        data.shardCd = 0.44;
        data.shardsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.18, 0, 0.18]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('josuke_shard'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'meteor',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 680,
            vy: Math.sin(a) * 680,
            radius: 11,
            damage: ctx.getEffectiveDamage(owner, 8.0),
            knockback: 210,
            color: '#a855f7',
            secondaryColor: '#38bdf8',
            angle: a,
            life: 1.4,
            maxLife: 1.4,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'wall', intensity: 1.2 });
      }
    }

    if (!data.doraraFired && state.elapsed >= 2.0) {
      data.doraraFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.0),
          Math.cos(ang) * 610,
          Math.sin(ang) * 610,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#a855f7',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'DORARARARARA!!',
        '#38bdf8',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};

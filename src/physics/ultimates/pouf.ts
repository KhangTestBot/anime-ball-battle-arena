import type { UltimateHandler } from './types';

export interface PoufUltimateData {
  scalesDone: number;
  scaleCd: number;
  collapseFired: boolean;
  flash: number;
}

export const poufUltimateHandler: UltimateHandler = {
  characterId: 'pouf',
  title: 'BEELZEBUB: SPIRITUAL MESSAGE SCALES!',
  subtitle:
    'Disperses into shimmering clones (Auto-Dodge + Enemy Confusion, Charm & Silence), fires 3 hypnotic scale waves, and triggers Spiritual Message Collapse!',
  bannerColor: '#eab308',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.2);
    for (const e of ctx.getEnemies(owner)) {
      e.confusedTimer = Math.max(e.confusedTimer, 2.8);
      e.silenceTimer = Math.max(e.silenceTimer, 2.2);
      e.charmTimer = Math.max(e.charmTimer, 1.8);
      e.charmOwnerUid = owner.uid;
    }

    const data: PoufUltimateData = {
      scalesDone: 0,
      scaleCd: 0.3,
      collapseFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#eab308', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'BEELZEBUB: SPIRITUAL MESSAGE!',
      '#eab308',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as PoufUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.collapseFired && data.scalesDone < 3) {
      data.scaleCd -= dt;
      if (data.scaleCd <= 0) {
        data.scaleCd = 0.44;
        data.scalesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.22, 0, 0.22]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('pouf_scale'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'zoltraak-orb',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 630,
            vy: Math.sin(a) * 630,
            radius: 11,
            damage: ctx.getEffectiveDamage(owner, 7.6),
            knockback: 190,
            color: '#eab308',
            secondaryColor: '#a855f7',
            angle: a,
            life: 1.5,
            maxLife: 1.5,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'powerup', intensity: 1.1 });
      }
    }

    if (!data.collapseFired && state.elapsed >= 2.0) {
      data.collapseFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.15);
        e.stunKind = 'genjutsu';
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
        315,
        '#a855f7',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'HYPNOTIC SCALE COLLAPSE!!',
        '#eab308',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};

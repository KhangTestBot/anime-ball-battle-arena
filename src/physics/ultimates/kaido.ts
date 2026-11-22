import type { UltimateHandler } from './types';

export interface KaenBreathCone {
  angle: number;
  timer: number;
}

export interface KaidoUltimateData {
  phase: 'drunk-dodge' | 'boro-breath' | 'kaen-daiko';
  breath: KaenBreathCone;
  flameCloakCd: Record<string, number>;
  baguaDashed: boolean;
}

export const kaidoUltimateHandler: UltimateHandler = {
  characterId: 'kaido',
  title: 'KAEN DAIKO: FLAME BAGUA & DRUNKEN DRAGON',
  subtitle:
    '3 Drunken Dragon stances: agile evasion → Boro Breath fire beam → Transforms into Flame Dragon Torch incinerating projectiles & Thunder Bagua!',
  bannerColor: '#ea580c',
  castDuration: 0.25,
  duration: 4.5,

  onCast(ctx, owner, state) {
    owner.giantTimer = Math.max(owner.giantTimer, 3.8);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.2);
    owner.evadeTimer = Math.max(owner.evadeTimer, 1.15);

    const target = ctx.getNearestEnemy(owner);
    const angle = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
    owner.facingAngle = angle;

    const data: KaidoUltimateData = {
      phase: 'drunk-dodge',
      breath: { angle, timer: 0 },
      flameCloakCd: {},
      baguaDashed: false,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, angle, '#f97316', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'WORORORO!! AZURE DRAGON!',
      '#a855f7',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 22, '#7c3aed', 80, 290, 3, 6, 'circle');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KaidoUltimateData;
    const enemies = ctx.getEnemies(owner);

    for (const uid of Object.keys(data.flameCloakCd)) {
      data.flameCloakCd[uid] -= dt;
      if (data.flameCloakCd[uid] <= 0) delete data.flameCloakCd[uid];
    }

    // 3 Canon Kaido Combat Phases over 4.5s!
    if (state.elapsed < 1.15) {
      data.phase = 'drunk-dodge';
      return;
    }

    if (state.elapsed < 2.35) {
      if (data.phase !== 'boro-breath') {
        data.phase = 'boro-breath';
        const nearest = ctx.getNearestEnemy(owner);
        data.breath.angle = nearest
          ? Math.atan2(nearest.y - owner.y, nearest.x - owner.x)
          : owner.facingAngle;
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 18,
          'BORO BREATH!!',
          '#f97316',
          'powerup',
        );
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.25 });
      }
      // Sweep Boro Breath across arena!
      data.breath.angle += dt * 0.65;
      data.breath.timer = 1.0;
      const dxL = Math.cos(data.breath.angle);
      const dyL = Math.sin(data.breath.angle);
      for (const e of enemies) {
        if (data.flameCloakCd[e.uid]) continue;
        const rx = e.x - owner.x;
        const ry = e.y - owner.y;
        const along = rx * dxL + ry * dyL;
        const perp = Math.abs(-rx * dyL + ry * dxL);
        if (along >= 0 && along <= 360 && perp <= e.radius + 38) {
          data.flameCloakCd[e.uid] = 0.35;
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 6.2), dxL * 220, dyL * 220, {
            sourceKind: 'ability',
          });
          e.burnTimer = Math.max(e.burnTimer, 3.0);
          e.burnDps = Math.max(e.burnDps, ctx.getEffectiveDamage(owner, 2.2));
          e.burnOwnerUid = owner.uid;
        }
      }
      return;
    }

    // Phase 3: KAEN DAIKO (Flaming Dragon Torch Armor — melts projectiles & Thunder Bagua dash!)
    if (data.phase !== 'kaen-daiko') {
      data.phase = 'kaen-daiko';
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 20,
        'KAEN DAIKO: FLAME BAGUA!',
        '#ef4444',
        'powerup',
      );
      ctx.emitSfx({ type: 'ko', intensity: 1.2 });
    }

    // Vaporize enemy projectiles colliding with Kaido's Giant Flame Dragon cloak!
    const cloakR = owner.radius + 28;
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (
        p.ownerUid !== owner.uid &&
        Math.hypot(p.x - owner.x, p.y - owner.y) <= cloakR + p.radius
      ) {
        ctx.spawnParticles(p.x, p.y, 7, '#f97316', 50, 170, 2.5, 5, 'circle');
        ctx.projectiles.splice(i, 1);
      }
    }

    // Thunder Bagua Kanabo slam rush toward nearest enemy!
    if (!data.baguaDashed) {
      data.baguaDashed = true;
      const t = ctx.getNearestEnemy(owner);
      if (t) {
        const ang = Math.atan2(t.y - owner.y, t.x - owner.x);
        owner.vx = Math.cos(ang) * 760;
        owner.vy = Math.sin(ang) * 760;
      }
    }

    for (const e of enemies) {
      if (data.flameCloakCd[e.uid]) continue;
      if (Math.hypot(e.x - owner.x, e.y - owner.y) <= cloakR + e.radius) {
        data.flameCloakCd[e.uid] = 0.4;
        const dx = e.x - owner.x;
        const dy = e.y - owner.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 11.5),
          (dx / d) * 580,
          (dy / d) * 580,
          { isCrit: true, sourceKind: 'ability' },
        );
        e.burnTimer = Math.max(e.burnTimer, 3.2);
        e.burnDps = Math.max(e.burnDps, ctx.getEffectiveDamage(owner, 2.5));
        e.burnOwnerUid = owner.uid;
        ctx.addScreenShake(12);
      }
    }
  },

  onExpire(_ctx, owner) {
    if (owner) {
      owner.giantTimer = 0;
      owner.evadeTimer = 0;
    }
  },
};

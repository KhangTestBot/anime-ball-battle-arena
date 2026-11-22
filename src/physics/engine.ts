import { getCharacterById } from '../characters/roster';
import {
  type ActiveUltimateState,
  type ArenaBounds,
  type ArenaDomain,
  type ArenaObstacle,
  type ArenaSizeKey,
  type Beam,
  type Bomb,
  type CastSeal,
  type FighterMatchSummary,
  type FighterState,
  type FloatingText,
  type FormConfig,
  type LightningBolt,
  MAX_BASE_HP,
  MIN_BASE_HP,
  type MatchConfig,
  type MatchResult,
  type Minion,
  type Particle,
  type Projectile,
  type RicochetArm,
  type SfxEvent,
  type Shockwave,
  type SkyPillar,
  type SlashEffect,
  type TrailNode,
  type UltimateCutInState,
} from '../types/game';
import { getCharacterVfxDNA } from '../renderer/vfxIdentity';
import {
  type AbilityContext,
  executeUltimateSkill,
  onFighterKill,
  onFighterTransform,
  updateBeams,
  updateBombs,
  updateFighterAbilities,
  updateLightningBolts,
  updateMinions,
  updateProjectiles,
  updateRicochetArms,
  updateSkyPillars,
  updateSlashes,
  updateTrails,
} from './abilities';
import { getHealMultiplier, updateActiveDomains } from './domains';
import { getNextLolItem, isLolChampion } from './lolShop';
import {
  resolveObstacleCollisions,
  shatterEnemyUltimates,
  updateCustomUltimates,
} from './ultimates/registry';

export const ARENA_SIZE_PX: Record<ArenaSizeKey, number> = {
  small: 520,
  medium: 640,
  large: 760,
};

const BASE_MIN_SPEED = 225;
const BASE_MAX_SPEED = 510;

export class BattleEngine implements AbilityContext {
  public readonly config: MatchConfig;
  public bounds: ArenaBounds;
  public fighters: FighterState[] = [];
  public projectiles: Projectile[] = [];
  public beams: Beam[] = [];
  public ricochetArms: RicochetArm[] = [];
  public slashes: SlashEffect[] = [];
  public trails: TrailNode[] = [];
  public bombs: Bomb[] = [];
  public skyPillars: SkyPillar[] = [];
  public lightningBolts: LightningBolt[] = [];
  public minions: Minion[] = [];
  public shockwaves: Shockwave[] = [];
  public castSeals: CastSeal[] = [];
  public domains: ArenaDomain[] = [];
  public obstacles: ArenaObstacle[] = [];
  public activeUltimates: ActiveUltimateState[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];

  public elapsed = 0;
  public suddenDeathActive = false;
  public suddenDeathStartSec: number;
  public screenShake = 0;
  public shakeX = 0;
  public shakeY = 0;
  public cameraGlitchTimer = 0;

  public finished = false;
  public matchResult: MatchResult | null = null;
  public activeCutIn: UltimateCutInState | null = null;

  private hitstopTimer = 0;
  private slowMoTimer = 0;
  private globalCutInCooldown = 0;
  private finishCountdown = -1;
  private pairCooldowns = new Map<string, number>();
  private idCounter = 0;
  private sfxHandler: ((event: SfxEvent) => void) | null;
  private suddenDeathWarned = false;
  private wallBurnCooldowns = new Map<string, number>();

  constructor(config: MatchConfig, onSfx?: (event: SfxEvent) => void) {
    const clampedHp = Math.max(
      MIN_BASE_HP,
      Math.min(MAX_BASE_HP, Math.round(Number.isFinite(config.baseHp) ? config.baseHp : 200)),
    );
    this.config = { ...config, baseHp: clampedHp };
    this.sfxHandler = onSfx ?? null;

    const fullSize = ARENA_SIZE_PX[config.arenaSize] ?? 640;
    this.bounds = {
      left: 0,
      top: 0,
      right: fullSize,
      bottom: fullSize,
      fullSize,
    };

    this.suddenDeathStartSec = Math.min(125, Math.round(22 + Math.pow(clampedHp, 0.56) * 0.85));
    this.initFighters();
  }

  public nextId(prefix: string): string {
    this.idCounter += 1;
    return `${prefix}_${this.idCounter}`;
  }

  public getForm(fighter: FighterState): FormConfig {
    return fighter.character.forms[fighter.formIndex] ?? fighter.character.forms[0];
  }

  public getEnemies(fighter: FighterState): FighterState[] {
    return this.fighters.filter((other) => {
      if (!other.alive || other.uid === fighter.uid) return false;
      if (fighter.teamId !== null && other.teamId === fighter.teamId) return false;
      return true;
    });
  }

  public getNearestEnemy(fighter: FighterState): FighterState | null {
    let best: FighterState | null = null;
    let bestDist = Infinity;
    for (const enemy of this.getEnemies(fighter)) {
      const d = Math.hypot(enemy.x - fighter.x, enemy.y - fighter.y);
      if (d < bestDist) {
        bestDist = d;
        best = enemy;
      }
    }
    return best;
  }

  private isUltimateActive(f: FighterState): boolean {
    return (
      (this.activeCutIn !== null && this.activeCutIn.fighterUid === f.uid) ||
      this.activeUltimates.some((u) => u.ownerUid === f.uid) ||
      this.domains.some((d) => d.ownerUid === f.uid)
    );
  }

  private addUltimateCharge(f: FighterState, amount: number): void {
    if (amount <= 0) return;
    if (f.spiritLockTimer > 0) return;
    if (this.isUltimateActive(f)) return;
    if (f.ultimateCooldown > 0) return;
    f.ultimateCharge = Math.min(100, f.ultimateCharge + amount);
  }

  public getEffectiveDamage(fighter: FighterState, rawBase: number): number {
    const form = this.getForm(fighter);
    const dmgScale = 1 + fighter.dmgBonusPct / 100;
    // Calibrated empirically so default 1000 HP duels average ~60 seconds (~1 minute)
    const hpPacing = Math.max(0.75, Math.pow(this.config.baseHp / 1000, 0.35));
    return rawBase * form.damageMult * dmgScale * hpPacing * 1.22;
  }

  public addScreenShake(amount: number): void {
    this.screenShake = Math.min(20, Math.max(this.screenShake, amount));
  }

  public addHitstop(seconds: number): void {
    this.hitstopTimer = Math.max(this.hitstopTimer, seconds);
  }

  public triggerCameraGlitch(seconds: number): void {
    this.cameraGlitchTimer = Math.max(this.cameraGlitchTimer, seconds);
  }

  public dispelEnemyFields(owner: FighterState): number {
    return shatterEnemyUltimates(this, owner);
  }

  public emitSfx(event: SfxEvent): void {
    if (this.sfxHandler) {
      this.sfxHandler(event);
    }
  }

  public spawnParticles(
    x: number,
    y: number,
    count: number,
    color: string,
    speedMin: number,
    speedMax: number,
    sizeMin = 2,
    sizeMax = 5,
    shape: Particle['shape'] = 'circle',
    glyph?: string,
  ): void {
    // Hard cap to keep 8-fighter mayhem buttery 60 FPS
    if (this.particles.length > 340) return;
    const allowed = Math.min(count, 360 - this.particles.length);
    for (let i = 0; i < allowed; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = speedMin + Math.random() * (speedMax - speedMin);
      const maxLife = 0.25 + Math.random() * 0.42;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        size: sizeMin + Math.random() * (sizeMax - sizeMin),
        color,
        alpha: 1,
        life: maxLife,
        maxLife,
        shape,
        glyph,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 12,
      });
    }
  }

  public spawnSeriesParticles(
    fighter: FighterState,
    x: number,
    y: number,
    count: number,
    color: string,
    speedMin = 70,
    speedMax = 260,
  ): void {
    const dna = getCharacterVfxDNA(fighter.character.id, fighter.character.series);
    this.spawnParticles(
      x,
      y,
      count,
      color,
      speedMin,
      speedMax,
      dna.particleShape === 'glyph' ? 7 : 2.6,
      dna.particleShape === 'glyph' ? 11 : 6.2,
      dna.particleShape,
      dna.particleGlyph,
    );
  }

  public spawnCastSeal(
    fighter: FighterState,
    x: number,
    y: number,
    angle: number,
    color: string,
    skillKey: string,
    isUltimate = false,
  ): void {
    if (this.castSeals.length > 26) {
      this.castSeals.shift();
    }
    const maxLife = isUltimate ? 1.05 : 0.62;
    this.castSeals.push({
      id: this.nextId('seal'),
      ownerUid: fighter.uid,
      ownerCharId: fighter.character.id,
      ownerSeries: fighter.character.series,
      x,
      y,
      angle,
      radius: fighter.radius * (isUltimate ? 3.2 : 2.05),
      color,
      secondaryColor: fighter.character.secondaryColor || '#ffffff',
      life: maxLife,
      maxLife,
      skillKey,
      isUltimate,
    });
  }

  public spawnShockwave(
    x: number,
    y: number,
    maxRadius: number,
    color: string,
    lineWidth = 4,
    ownerCharId?: string,
    ownerSeries?: string,
  ): void {
    if (this.shockwaves.length > 36) return;
    this.shockwaves.push({
      x,
      y,
      radius: 10,
      maxRadius,
      color,
      lineWidth,
      alpha: 0.95,
      ownerCharId,
      ownerSeries,
    });
  }

  public spawnFloatingText(
    x: number,
    y: number,
    text: string,
    color: string,
    kind: FloatingText['kind'],
    subtext?: string,
  ): void {
    if (this.floatingTexts.length > 48) {
      this.floatingTexts.shift();
    }
    const isBig = kind === 'crit' || kind === 'powerup' || kind === 'callout';
    const maxLife = kind === 'powerup' ? 1.55 : kind === 'callout' ? 1.15 : 0.85;
    const size = kind === 'powerup' ? 20 : kind === 'crit' ? 26 : kind === 'callout' ? 19 : 17;
    const longestLen = Math.max(text.length, subtext?.length ?? 0);
    const edgeMargin = Math.max(
      52,
      Math.min(this.bounds.fullSize * 0.38, longestLen * size * 0.34 + 18),
    );
    this.floatingTexts.push({
      x: Math.max(edgeMargin, Math.min(this.bounds.fullSize - edgeMargin, x)),
      y: Math.max(44, Math.min(this.bounds.fullSize - 40, y)),
      vy: kind === 'powerup' ? -36 : isBig ? -58 : -48,
      text,
      subtext,
      color,
      strokeColor: '#040711',
      size,
      life: maxLife,
      maxLife,
      kind,
    });
  }

  public applyDamage(
    attacker: FighterState | null,
    target: FighterState,
    rawDamage: number,
    knockX: number,
    knockY: number,
    opts?: {
      isCrit?: boolean;
      bypassInvuln?: boolean;
      sourceKind?: 'collision' | 'ability' | 'dot' | 'wall';
      allowLifesteal?: boolean;
    },
  ): number {
    if (!target.alive) return 0;
    if (target.untargetableTimer > 0 && !opts?.bypassInvuln) {
      return 0;
    }
    if (attacker && attacker.teamId !== null && attacker.teamId === target.teamId) {
      return 0;
    }
    if (target.invulnTimer > 0 && !opts?.bypassInvuln) {
      return 0;
    }

    const targetForm = this.getForm(target);

    // Ultra Instinct / Ackerman / Beyblade / Sans dodge roll (disabled while drowsy!)
    const effectiveDodge = Math.max(
      target.uiDodgeTimer > 0 ? 0.85 : (targetForm.dodgeChance ?? 0),
      target.evadeTimer > 0 ? 0.6 : 0,
    );
    if (
      effectiveDodge > 0 &&
      target.drowsyTimer <= 0 &&
      target.dodgeLockedTimer <= 0 &&
      opts?.sourceKind !== 'dot' &&
      opts?.sourceKind !== 'wall' &&
      Math.random() < effectiveDodge
    ) {
      target.afterimages.push({
        x: target.x,
        y: target.y,
        alpha: 0.85,
        color: targetForm.auraColor,
        formIndex: target.formIndex,
      });
      // Quick perpendicular evade impulse
      const side = Math.random() < 0.5 ? 1 : -1;
      const baseAngle = Math.atan2(target.vy, target.vx) + side * (Math.PI / 2);
      const evadeDist = 26;
      target.x = Math.max(
        this.bounds.left + target.radius,
        Math.min(this.bounds.right - target.radius, target.x + Math.cos(baseAngle) * evadeDist),
      );
      target.y = Math.max(
        this.bounds.top + target.radius,
        Math.min(this.bounds.bottom - target.radius, target.y + Math.sin(baseAngle) * evadeDist),
      );
      const dodgeText = target.character.id === 'sans' ? 'MISS!' : 'DODGE!';
      this.spawnFloatingText(
        target.x,
        target.y - target.radius - 12,
        dodgeText,
        target.character.id === 'sans' ? '#38bdf8' : '#e2e8f0',
        'callout',
      );
      this.spawnShockwave(target.x, target.y, target.radius * 1.8, '#e2e8f0', 2.5);
      this.emitSfx({ type: 'dodge' });
      return 0;
    }

    const baseArmor = Math.min(
      0.55,
      target.character.baseStats.armor + (targetForm.armorBonus ?? 0) + (target.lolArmorBonus ?? 0),
    );
    const armor = target.armorShredTimer > 0 ? baseArmor * 0.5 : baseArmor;
    const armorShredBonus = target.armorShredTimer > 0 ? 1.18 : 1.0;
    const shieldMult = target.shieldTimer > 0 && !opts?.bypassInvuln ? 0.58 : 1.0;
    const enchantMult = target.enchantArmorTimer > 0 ? 0.65 : 1.0;
    const shatterBonus =
      target.stunTimer > 0 && target.stunKind === 'frozen' && opts?.sourceKind !== 'dot'
        ? 1.32
        : 1.0;
    // Mahoraga Passive Dharma Wheel Adaptation: permanently reduces incoming damage by 7% per wheel turn (up to 56%!)
    const adaptMult =
      target.character.id === 'mahoraga'
        ? Math.max(0.44, 1 - target.mahoragaAdaptStacks * 0.07)
        : 1.0;
    const reduced =
      rawDamage *
      (1 - armor) *
      armorShredBonus *
      shieldMult *
      enchantMult *
      shatterBonus *
      adaptMult;
    const dmg = Math.max(1, Math.round(reduced));

    const minFloor = target.immortalTimer > 0 ? 1 : 0;
    target.hp = Math.max(minFloor, target.hp - dmg);
    target.damageTaken += dmg;
    target.hitFlashTimer = 0.14;

    // Mahoraga Passive Dharma Wheel (*KLINK!*): every ~7% Max HP taken turns the wheel (+1 stack up to 8 + heal!)
    if (
      target.character.id === 'mahoraga' &&
      target.alive &&
      target.hp > 0 &&
      target.mahoragaAdaptStacks < 8
    ) {
      target.mahoragaAdaptDmgAcc += dmg;
      const threshold = Math.max(18, target.maxHp * 0.07);
      while (target.mahoragaAdaptDmgAcc >= threshold && target.mahoragaAdaptStacks < 8) {
        target.mahoragaAdaptDmgAcc -= threshold;
        target.mahoragaAdaptStacks += 1;
        target.mahoragaWheelAngle += Math.PI / 4;
        target.mahoragaWheelFlash = 0.78;
        const heal = Math.round(target.maxHp * 0.04 * getHealMultiplier(target));
        if (heal > 0) {
          target.hp = Math.min(target.maxHp, target.hp + heal);
          this.spawnFloatingText(
            target.x,
            target.y + target.radius + 14,
            `+${heal}`,
            '#fde047',
            'heal',
          );
        }
        // Iconic *KLINK!* Dharma Wheel turn VFX: twin golden-white shockwaves, star burst, micro-hitstop & chime!
        this.spawnShockwave(
          target.x,
          target.y,
          target.radius + 78,
          '#facc15',
          5.5,
          target.character.id,
          target.character.series,
        );
        this.spawnShockwave(
          target.x,
          target.y,
          target.radius + 42,
          '#ffffff',
          3.2,
          target.character.id,
          target.character.series,
        );
        this.spawnParticles(target.x, target.y, 18, '#fef08a', 65, 220, 2.5, 5.5, 'star');
        this.addScreenShake(5.5);
        this.addHitstop(0.028);
        this.emitSfx({ type: 'powerup', intensity: 1.1 });
      }
    }
    const crowdHitScale = this.fighters.length >= 6 ? 0.58 : this.fighters.length >= 4 ? 0.78 : 1.0;
    const ultHpNorm = Math.pow(1000 / Math.max(100, this.config.baseHp), 0.62);
    if (attacker) {
      attacker.damageDealt += dmg;
      attacker.hitsLanded += 1;
      if (isLolChampion(attacker.character)) {
        attacker.lolGold += opts?.sourceKind === 'dot' ? 16 : 52;
      }
      // Rimuru harvests Souls / Magicules whenever landing hits (canon Harvest Festival -> True Dragon -> Ciel!)
      if (attacker.character.id === 'rimuru') {
        const soulGain = Math.max(4, (dmg / Math.max(100, target.maxHp)) * 220);
        attacker.rimuruSouls += soulGain;
      }
      this.addUltimateCharge(attacker, dmg * 0.14 * ultHpNorm * crowdHitScale);
      target.lastDamagedByUid = attacker.uid;
    }
    this.addUltimateCharge(target, dmg * 0.2 * ultHpNorm * crowdHitScale);

    // Apply knockback weighted inversely by mass (Enchanted Netherite adds +35% mass!)
    const holdInPlace =
      target.unstoppableTimer > 0 ||
      (target.stunTimer > 0 &&
        (target.stunKind === 'time-stop' || target.stunKind === 'void-overload'));
    if (!holdInPlace && (knockX !== 0 || knockY !== 0)) {
      const effectiveMass = target.mass * (target.enchantArmorTimer > 0 ? 1.35 : 1.0);
      const invMass = 1 / Math.max(0.6, effectiveMass);
      target.vx += knockX * invMass;
      target.vy += knockY * invMass;
    }

    // Denji / Lifesteal healing (unified Anti-Heal / Wither / Demon Slayer Mark / LoL Omnivamp modifiers!)
    if (attacker && attacker.alive && (opts?.allowLifesteal || attacker.lolLifestealBonus > 0)) {
      const atkForm = this.getForm(attacker);
      const ratio = (atkForm.lifestealRatio ?? 0) + (attacker.lolLifestealBonus ?? 0);
      const healMult = getHealMultiplier(attacker);
      if (ratio > 0 && healMult > 0) {
        const heal = Math.max(1, Math.round(dmg * ratio * healMult));
        const actualHeal = Math.min(attacker.maxHp - attacker.hp, heal);
        if (actualHeal > 0) {
          attacker.hp += actualHeal;
          this.spawnFloatingText(
            attacker.x,
            attacker.y - attacker.radius - 8,
            `+${actualHeal}`,
            '#4ade80',
            'heal',
          );
        }
      }
    }

    // Steve's Totem of Undying! Intercepts fatal KO once, revives at 25% Max HP, clears stuns & shoves enemies!
    if (target.hp <= 0 && target.totemActive) {
      target.totemActive = false;
      target.totemPopTimer = 1.1;
      target.hp = Math.max(1, Math.round(target.maxHp * 0.25));
      target.stunTimer = 0;
      target.stunKind = null;
      target.antiHealTimer = 0;
      target.karmaTimer = 0;
      target.karmaKind = null;
      target.paralyzeTimer = 0;
      target.invulnTimer = Math.max(target.invulnTimer, 0.85);
      this.spawnShockwave(
        target.x,
        target.y,
        175,
        '#facc15',
        6,
        target.character.id,
        target.character.series,
      );
      this.spawnParticles(target.x, target.y, 28, '#4ade80', 110, 340, 3, 6.5, 'pixel');
      this.spawnParticles(target.x, target.y, 20, '#facc15', 90, 300, 3, 6.5, 'pixel');
      this.spawnFloatingText(
        target.x,
        target.y - target.radius - 20,
        'TOTEM OF UNDYING!',
        '#facc15',
        'powerup',
      );
      this.addHitstop(0.06);
      this.addScreenShake(11);
      this.emitSfx({ type: 'powerup' });
      for (const e of this.getEnemies(target)) {
        const d = Math.hypot(e.x - target.x, e.y - target.y);
        if (d > 0.1 && d <= 210) {
          e.vx += ((e.x - target.x) / d) * 480;
          e.vy += ((e.y - target.y) / d) * 480;
        }
      }
      return dmg;
    }

    const isKo = target.hp <= 0;
    const bigHitThreshold = Math.max(14, Math.min(180, target.maxHp * 0.085));
    const isBigHit = Boolean(opts?.isCrit) || dmg >= bigHitThreshold || isKo;

    // Distinct high-contrast damage colors per attacker (so both fighters' damage numbers are immediately distinguishable!)
    const DMG_SLOT_PALETTE = [
      '#38bdf8', // Fighter 1 (Left): Bright Cyan-Blue
      '#fb7185', // Fighter 2 (Right): Vivid Rose-Red
      '#facc15', // Fighter 3: Gold
      '#4ade80', // Fighter 4: Emerald
      '#c084fc', // Fighter 5: Violet
      '#fb923c', // Fighter 6: Orange
      '#2dd4bf', // Fighter 7: Teal
      '#f472b6', // Fighter 8: Pink
    ];
    let dmgColor = '#ffffff';
    if (attacker) {
      if (attacker.teamId === 0) {
        dmgColor = '#38bdf8';
      } else if (attacker.teamId === 1) {
        dmgColor = '#fb7185';
      } else {
        const atkIdx = this.fighters.findIndex((x) => x.uid === attacker.uid);
        dmgColor = DMG_SLOT_PALETTE[(atkIdx >= 0 ? atkIdx : 0) % DMG_SLOT_PALETTE.length];
      }
    }

    this.spawnFloatingText(
      target.x + (Math.random() - 0.5) * 18,
      target.y - target.radius - 6,
      isBigHit ? `-${dmg}!` : `-${dmg}`,
      dmgColor,
      isBigHit ? 'crit' : 'damage',
    );

    if (isBigHit && !isKo) {
      this.addHitstop(0.045);
      this.addScreenShake(7.5);
    }

    if (isKo) {
      this.handleKo(target, attacker);
    }

    return dmg;
  }

  /** Advance simulation by dt seconds (fixed timestep recommended, e.g., 1/60) */
  public step(rawDt: number): void {
    const clampedDt = Math.min(0.05, Math.max(0, rawDt));

    // Decay screen shake & camera glitch smoothly even during hitstop
    if (this.cameraGlitchTimer > 0) {
      this.cameraGlitchTimer = Math.max(0, this.cameraGlitchTimer - clampedDt);
    }
    if (this.screenShake > 0.05) {
      this.screenShake *= Math.pow(0.001, clampedDt);
      this.shakeX = (Math.random() * 2 - 1) * this.screenShake;
      this.shakeY = (Math.random() * 2 - 1) * this.screenShake;
    } else {
      this.screenShake = 0;
      this.shakeX = 0;
      this.shakeY = 0;
    }

    // Dramatic Center-Screen Ultimate Cut-In Freeze!
    if (this.activeCutIn) {
      this.activeCutIn.timer -= clampedDt;
      if (this.activeCutIn.timer <= 0) {
        const cutIn = this.activeCutIn;
        this.activeCutIn = null;
        const caster = this.fighters.find((f) => f.uid === cutIn.fighterUid);
        if (caster && caster.alive && !this.finished) {
          executeUltimateSkill(this, caster);
        }
      }
      return;
    }

    // Hitstop freeze frame for juicy crits / KO
    if (this.hitstopTimer > 0) {
      this.hitstopTimer = Math.max(0, this.hitstopTimer - clampedDt);
      this.updateVisualTimersOnly(clampedDt * 0.3);
      return;
    }

    if (this.globalCutInCooldown > 0) {
      this.globalCutInCooldown = Math.max(0, this.globalCutInCooldown - clampedDt);
    }

    // Slow-motion KO window
    let timeScale = 1.0;
    if (this.slowMoTimer > 0) {
      this.slowMoTimer = Math.max(0, this.slowMoTimer - clampedDt);
      timeScale = 0.28;
    }
    const dt = clampedDt * timeScale;

    if (!this.finished) {
      this.elapsed += dt;
    }

    // Decay pair collision cooldowns
    for (const [key, val] of this.pairCooldowns.entries()) {
      const next = val - dt;
      if (next <= 0) this.pairCooldowns.delete(key);
      else this.pairCooldowns.set(key, next);
    }
    for (const [key, val] of this.wallBurnCooldowns.entries()) {
      const next = val - dt;
      if (next <= 0) this.wallBurnCooldowns.delete(key);
      else this.wallBurnCooldowns.set(key, next);
    }

    // Sudden Death shrinking walls
    this.updateSuddenDeath(dt);

    // Update fighters movement, DMG scaling, transformations, ultimates, and abilities
    for (const f of this.fighters) {
      this.updateFighterBase(f, dt);
      if (f.alive && !this.finished) {
        this.checkTransformations(f);
        if (f.stunTimer <= 0 && this.tryTriggerUltimate(f)) {
          return;
        }
        if (f.stunTimer <= 0) {
          const spiritMult = f.spiritLockTimer > 0 ? 0.6 : 1.0;
          const effDt = (f.silenceTimer > 0 ? dt * 0.4 : dt) * spiritMult;
          updateFighterAbilities(this, f, effDt);
        }
      }
    }

    // Resolve ball-to-ball collisions & physical ArenaObstacle collisions
    this.resolveFighterCollisions();
    resolveObstacleCollisions(this, dt);

    // Resolve wall bounces
    for (const f of this.fighters) {
      if (f.alive) {
        this.resolveWallBounce(f);
      }
    }

    // Update all dynamic combat objects, modular Custom Ultimates & active Domain Expansions
    updateCustomUltimates(this, dt);
    updateActiveDomains(this, dt);
    updateProjectiles(this, dt);
    updateBeams(this, dt);
    updateRicochetArms(this, dt);
    updateSlashes(this, dt);
    updateTrails(this, dt);
    updateBombs(this, dt);
    updateLightningBolts(this, dt);
    updateSkyPillars(this, dt);
    updateMinions(this, dt);

    // Guarantee every active effect entity carries its caster's exact characterId & anime/game series
    this.syncEntityIdentities();

    // Update VFX (particles, shockwaves, floating texts)
    this.updateEffects(clampedDt);

    // Check win state & finish delay
    this.checkWinCondition(clampedDt);
  }

  private syncEntityIdentities(): void {
    const byUid = new Map<string, FighterState>();
    for (const f of this.fighters) byUid.set(f.uid, f);

    const stamp = <
      T extends {
        ownerUid: string;
        ownerCharId?: string;
        ownerSeries?: string;
        secondaryColor?: string;
      },
    >(
      list: T[],
    ) => {
      for (const item of list) {
        if (item.ownerCharId && item.ownerSeries) continue;
        const owner = byUid.get(item.ownerUid);
        if (!owner) continue;
        item.ownerCharId = owner.character.id;
        item.ownerSeries = owner.character.series;
        if (!item.secondaryColor) item.secondaryColor = owner.character.secondaryColor;
      }
    };

    stamp(this.projectiles);
    stamp(this.beams);
    stamp(this.ricochetArms);
    stamp(this.slashes);
    stamp(this.trails);
    stamp(this.bombs);
    stamp(this.skyPillars);
    stamp(this.minions);
    for (const tr of this.trails) {
      if (!tr.color) {
        const owner = byUid.get(tr.ownerUid);
        if (owner) tr.color = owner.character.primaryColor;
      }
    }
  }

  /** Arena danger level 0 (calm white) -> 1 (heated orange) -> 2 (critical crimson) */
  public getArenaDangerLevel(): number {
    if (this.suddenDeathActive) return 2;
    const living = this.fighters.filter((f) => f.alive);
    if (living.length === 0) return 2;
    let minRatio = 1;
    let maxFormProgress = 0;
    for (const f of living) {
      minRatio = Math.min(minRatio, f.hp / f.maxHp);
      const maxIdx = Math.max(1, f.character.forms.length - 1);
      maxFormProgress = Math.max(maxFormProgress, f.formIndex / maxIdx);
    }
    if (minRatio <= 0.28) return 2;
    if (minRatio <= 0.56 || maxFormProgress >= 0.7) return 1;
    return 0;
  }

  private initFighters(): void {
    const slots = this.config.slots;
    const count = slots.length;
    const size = this.bounds.fullSize;
    const cx = size / 2;
    const cy = size / 2;

    // Count character occurrences so duplicate picks get crisp #1, #2 labels
    const charTotals = new Map<string, number>();
    for (const s of slots) {
      charTotals.set(s.characterId, (charTotals.get(s.characterId) ?? 0) + 1);
    }
    const charSeen = new Map<string, number>();

    // Shrink ball radius slightly if many fighters so everyone has room to bounce
    const crowdScale = count >= 13 ? 0.72 : count >= 9 ? 0.8 : count >= 7 ? 0.88 : 1.0;

    this.fighters = slots.map((slot, index) => {
      const char = getCharacterById(slot.characterId);
      const seen = (charSeen.get(char.id) ?? 0) + 1;
      charSeen.set(char.id, seen);
      const displayName = (charTotals.get(char.id) ?? 0) > 1 ? `${char.name} #${seen}` : char.name;

      let x = cx;
      let y = cy;
      let launchAngle = (Math.PI * 2 * index) / Math.max(1, count);

      if (this.config.mode === '1v1' || (this.config.mode === 'tournament' && count === 2)) {
        x = index === 0 ? size * 0.26 : size * 0.74;
        y = cy + (index === 0 ? -18 : 18);
        launchAngle =
          index === 0 ? (Math.random() - 0.5) * 0.9 : Math.PI + (Math.random() - 0.5) * 0.9;
      } else if (this.config.mode === 'team') {
        const team = slot.teamId ?? index % 2;
        const teamSlots = slots.filter((s, idx) => (s.teamId ?? idx % 2) === team);
        const posInTeam = teamSlots.indexOf(slot);
        const spacing = (size - 140) / Math.max(1, teamSlots.length);
        x = team === 0 ? size * 0.22 + (posInTeam % 2) * 34 : size * 0.78 - (posInTeam % 2) * 34;
        y = 70 + spacing * (posInTeam + 0.5);
        launchAngle =
          team === 0 ? (Math.random() - 0.5) * 1.1 : Math.PI + (Math.random() - 0.5) * 1.1;
      } else {
        const ringRadius = size * (count >= 7 ? 0.34 : 0.3);
        const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
        x = cx + Math.cos(angle) * ringRadius;
        y = cy + Math.sin(angle) * ringRadius;
        // Launch roughly inward with swirl so everyone immediately engages
        launchAngle = angle + Math.PI + (Math.random() - 0.5) * 0.85;
      }

      const initSpeed = (290 + Math.random() * 55) * char.baseStats.speed;
      const baseRadius = Math.round(char.baseStats.radius * crowdScale);

      return {
        uid: this.nextId('f'),
        slotIndex: index,
        character: char,
        displayName,
        teamId: this.config.mode === 'team' ? (slot.teamId ?? index % 2) : null,
        x,
        y,
        vx: Math.cos(launchAngle) * initSpeed,
        vy: Math.sin(launchAngle) * initSpeed,
        radius: baseRadius,
        mass: char.baseStats.mass,
        hp: this.config.baseHp,
        maxHp: this.config.baseHp,
        alive: true,
        koFadeTimer: 0,
        formIndex: 0,
        transformAngryTimer: 0,
        invulnTimer: 0,
        powerUpFlashTimer: 0,
        dmgBonusPct: 0,
        abilityTimer: char.baseStats.abilityCooldown * (0.45 + Math.random() * 0.45),
        abilityChargeTimer: 0,
        abilityChargeDuration: 0.42,
        abilityTargetAngle: launchAngle,
        hitFlashTimer: 0,
        squashTimer: 0,
        squashAngle: 0,
        facingAngle: launchAngle,
        spinAngle: 0,
        rageProgress: 0,
        infinityPulseTimer: 0.9,
        odmActiveTimer: 0,
        odmAnchorX: x,
        odmAnchorY: y,
        odmDashVx: 0,
        odmDashVy: 0,
        odmHitCooldowns: {},
        rasenganDashTimer: 0,
        trailDropTimer: 0.08,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitHitCooldowns: {},
        chainsawHitCooldowns: {},
        fuseTimer: 0,
        spinDashTimer: 0,
        getExcitedTimer: 0,
        ultimateCharge: 0,
        ultimatesUsed: 0,
        ultimateCooldown: 0,
        lastSkillIndex: -1,
        healSkillCooldown: 0,
        shieldTimer: 0,
        shieldColor: char.primaryColor,
        lastSkillName: '',
        stunTimer: 0,
        stunKind: null,
        confusedTimer: 0,
        burnTimer: 0,
        burnDps: 0,
        burnOwnerUid: null,
        silenceTimer: 0,
        immortalTimer: 0,
        unstoppableTimer: 0,
        antiHealTimer: 0,
        enchantArmorTimer: 0,
        totemActive: false,
        totemPopTimer: 0,
        glitchTeleportCd: 0,
        karmaTimer: 0,
        karmaDps: 0,
        karmaOwnerUid: null,
        karmaKind: null,
        paralyzeTimer: 0,
        paralyzeTick: 0,
        drowsyTimer: 0,
        armorShredTimer: 0,
        frostTimer: 0,
        charmTimer: 0,
        charmOwnerUid: null,
        airborneTimer: 0,
        uiDodgeTimer: 0,
        untargetableTimer: 0,
        spiritLockTimer: 0,
        slayerMarkTimer: 0,
        giantTimer: 0,
        evadeTimer: 0,
        dodgeLockedTimer: 0,
        savedVx: 0,
        savedVy: 0,
        afterimages: [],
        damageDealt: 0,
        damageTaken: 0,
        kills: 0,
        hitsLanded: 0,
        highestFormName: char.forms[0].name,
        eliminatedAt: null,
        lastDamagedByUid: null,
        lolGold: isLolChampion(char) ? 550 : 0,
        lolItemsCount: 0,
        lolSpeedBonus: 0,
        lolArmorBonus: 0,
        lolLifestealBonus: 0,
        lolCdrBonus: 0,
        lolShopFlashTimer: 0,
        steveMinedOres: 0,
        steveMineSpawnCd: 0.25,
        sukunaSlashCd: 0.45,
        gojoBasicCd: 0.55,
        mahoragaAdaptStacks: 0,
        mahoragaWheelAngle: 0,
        mahoragaAdaptDmgAcc: 0,
        mahoragaWheelFlash: 0,
        rimuruSouls: 0,
      };
    });
  }

  /**
   * Purchases the next iconic League of Legends Shop Item in the champion's 6-slot build path!
   * When `manualClick` is true, grants +220G bonus gold first so players can actively accelerate item spikes from the HUD.
   */
  public buyNextLolItem(f: FighterState, manualClick = false): boolean {
    if (!f.alive || !isLolChampion(f.character)) return false;
    const item = getNextLolItem(f);
    if (!item) return false;

    if (manualClick) {
      f.lolGold += 220;
    }
    if (f.lolGold < item.cost) return false;

    f.lolGold -= item.cost;
    f.lolItemsCount += 1;
    f.dmgBonusPct += item.dmgPct;
    f.lolSpeedBonus += item.speedBonus;
    f.lolArmorBonus += item.armorBonus;
    f.lolLifestealBonus += item.lifestealBonus;
    f.lolCdrBonus += item.cdrBonus;
    f.lolShopFlashTimer = 1.25;

    if (item.hpBonusPct > 0) {
      const bonusHp = Math.max(8, Math.round(this.config.baseHp * item.hpBonusPct));
      f.maxHp += bonusHp;
      const healAmt = Math.max(6, Math.round(bonusHp * Math.max(0.5, getHealMultiplier(f))));
      f.hp = Math.min(f.maxHp, f.hp + healAmt);
    }

    if (item.shieldSec && item.shieldSec > 0) {
      f.shieldTimer = Math.max(f.shieldTimer, item.shieldSec);
      f.shieldColor = item.color;
    }

    if (item.grantZhonya) {
      f.invulnTimer = Math.max(f.invulnTimer, 0.95);
      f.stunTimer = 0;
      f.stunKind = null;
      f.burnTimer = 0;
    }

    if (item.grantGuardianAngel) {
      f.totemActive = true;
    }

    const isFullBuild = f.lolItemsCount >= 6;
    this.spawnFloatingText(
      f.x,
      f.y - f.radius - 18,
      isFullBuild ? `FULL BUILD: ${item.name.toUpperCase()}!` : `BOUGHT: ${item.name}!`,
      '#facc15',
      'powerup',
      `+${item.dmgPct}% DMG · SLOT ${f.lolItemsCount}/6`,
    );
    this.spawnShockwave(
      f.x,
      f.y,
      f.radius * 2.7,
      item.color,
      4,
      f.character.id,
      f.character.series,
    );
    this.spawnParticles(f.x, f.y, 16, '#facc15', 70, 230, 2.5, 5.5, 'star');
    this.emitSfx({ type: 'powerup' });
    return true;
  }

  private updateSuddenDeath(dt: number): void {
    if (!this.config.suddenDeath || this.finished) return;
    if (this.elapsed < this.suddenDeathStartSec) return;

    if (!this.suddenDeathActive) {
      this.suddenDeathActive = true;
      if (!this.suddenDeathWarned) {
        this.suddenDeathWarned = true;
        this.emitSfx({ type: 'sudden-death' });
        this.addScreenShake(9);
        const mid = this.bounds.fullSize / 2;
        this.spawnFloatingText(
          mid,
          mid - 30,
          'SUDDEN DEATH!',
          '#fb3765',
          'powerup',
          'SHRINKING WALLS',
        );
      }
    }

    const minInnerSize = this.bounds.fullSize * 0.42;
    const currentWidth = this.bounds.right - this.bounds.left;
    if (currentWidth > minInnerSize) {
      const shrink = 15 * dt;
      const maxInset = (this.bounds.fullSize - minInnerSize) / 2;
      const nextInset = Math.min(maxInset, this.bounds.left + shrink);
      this.bounds.left = nextInset;
      this.bounds.top = nextInset;
      this.bounds.right = this.bounds.fullSize - nextInset;
      this.bounds.bottom = this.bounds.fullSize - nextInset;
    }
  }

  private updateFighterBase(f: FighterState, dt: number): void {
    // Update fading afterimages
    for (let i = f.afterimages.length - 1; i >= 0; i--) {
      f.afterimages[i].alpha -= dt * 2.6;
      if (f.afterimages[i].alpha <= 0) {
        f.afterimages.splice(i, 1);
      }
    }

    if (!f.alive) {
      if (f.koFadeTimer > 0) {
        f.koFadeTimer = Math.max(0, f.koFadeTimer - dt);
      }
      return;
    }

    const form = this.getForm(f);
    const crowdScale =
      this.fighters.length >= 13
        ? 0.72
        : this.fighters.length >= 9
          ? 0.8
          : this.fighters.length >= 7
            ? 0.88
            : 1.0;
    const giantScale = f.giantTimer > 0 ? 1.45 : 1.0;
    const targetRadius = Math.round(
      f.character.baseStats.radius * (form.radiusMult ?? 1) * crowdScale * giantScale,
    );
    f.radius += (targetRadius - f.radius) * Math.min(1, dt * 8);

    // Passive Ultimate gauge buildup over time (no passive DMG% scaling over time)
    if (!this.finished) {
      const sdBoost = this.suddenDeathActive ? 2.0 : 1.0;
      if (f.ultimateCooldown > 0) {
        f.ultimateCooldown = Math.max(0, f.ultimateCooldown - dt);
      } else {
        this.addUltimateCharge(f, dt * 2.1);
      }

      // Steve Minecraft ore-mining progression (can fight at any armor tier; mines corner ores when free!)
      if (this.isSteveMining(f)) {
        this.updateSteveMining(f, dt);
      }

      // Sukuna ranged Dismantle basic attack (carves instant anime slash lines directly across foes!)
      if (f.character.id === 'sukuna' && f.stunTimer <= 0) {
        this.updateSukunaRangedBasic(f, dt);
      }

      // Gojo Satoru Always-On Passive Infinity (Mugen) + Blue-Infused Basic Attack!
      if (f.character.id === 'gojo') {
        this.updateGojoPassiveAndBasic(f, dt);
      }

      // Mahoraga Passive Dharma Wheel gentle rotation + turn flash decay + faster stun recovery (4+ stacks)
      if (f.character.id === 'mahoraga') {
        f.mahoragaWheelAngle += dt * (0.45 + f.mahoragaAdaptStacks * 0.18);
        if (f.mahoragaWheelFlash > 0) {
          f.mahoragaWheelFlash = Math.max(0, f.mahoragaWheelFlash - dt);
        }
        if (f.mahoragaAdaptStacks >= 4 && f.stunTimer > 0) {
          f.stunTimer = Math.max(0, f.stunTimer - dt);
        }
      }

      // Rimuru Passive Predator / Beelzebuth: devours nearby non-piercing enemy projectiles to harvest Souls!
      if (f.character.id === 'rimuru' && f.silenceTimer <= 0) {
        const devourR = f.radius + 36;
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
          const p = this.projectiles[i];
          if (p.ownerUid === f.uid || p.piercing) continue;
          if (f.teamId !== null && p.teamId === f.teamId) continue;
          if (Math.hypot(p.x - f.x, p.y - f.y) <= devourR + p.radius) {
            this.projectiles.splice(i, 1);
            f.rimuruSouls += 24;
            this.spawnParticles(p.x, p.y, 8, '#a855f7', 40, 140, 2.2, 4.5, 'circle');
            this.emitSfx({ type: 'dodge', intensity: 0.7 });
          }
        }
      }

      // League of Legends passive Gold income & automatic 6-slot Item Shop progression!
      if (isLolChampion(f.character)) {
        f.lolGold += dt * 125 * sdBoost;
        const nextItem = getNextLolItem(f);
        if (nextItem && f.lolGold >= nextItem.cost) {
          this.buyNextLolItem(f, false);
        }
      }
    }

    // Decay transient timers & real status effects
    if (f.lolShopFlashTimer > 0) f.lolShopFlashTimer = Math.max(0, f.lolShopFlashTimer - dt);
    if (f.hitFlashTimer > 0) f.hitFlashTimer = Math.max(0, f.hitFlashTimer - dt);
    if (f.squashTimer > 0) f.squashTimer = Math.max(0, f.squashTimer - dt);
    if (f.transformAngryTimer > 0) f.transformAngryTimer = Math.max(0, f.transformAngryTimer - dt);
    if (f.invulnTimer > 0) f.invulnTimer = Math.max(0, f.invulnTimer - dt);
    if (f.powerUpFlashTimer > 0) f.powerUpFlashTimer = Math.max(0, f.powerUpFlashTimer - dt);
    if (f.confusedTimer > 0) f.confusedTimer = Math.max(0, f.confusedTimer - dt);
    if (f.silenceTimer > 0) f.silenceTimer = Math.max(0, f.silenceTimer - dt);
    if (f.immortalTimer > 0) f.immortalTimer = Math.max(0, f.immortalTimer - dt);
    if (f.unstoppableTimer > 0) f.unstoppableTimer = Math.max(0, f.unstoppableTimer - dt);
    if (f.antiHealTimer > 0) f.antiHealTimer = Math.max(0, f.antiHealTimer - dt);
    if (f.enchantArmorTimer > 0) f.enchantArmorTimer = Math.max(0, f.enchantArmorTimer - dt);
    if (f.totemPopTimer > 0) f.totemPopTimer = Math.max(0, f.totemPopTimer - dt);
    if (f.glitchTeleportCd > 0) f.glitchTeleportCd = Math.max(0, f.glitchTeleportCd - dt);
    if (f.drowsyTimer > 0) f.drowsyTimer = Math.max(0, f.drowsyTimer - dt);
    if (f.armorShredTimer > 0) f.armorShredTimer = Math.max(0, f.armorShredTimer - dt);
    if (f.frostTimer > 0) f.frostTimer = Math.max(0, f.frostTimer - dt);
    if (f.uiDodgeTimer > 0) f.uiDodgeTimer = Math.max(0, f.uiDodgeTimer - dt);
    if (f.untargetableTimer > 0) f.untargetableTimer = Math.max(0, f.untargetableTimer - dt);
    if (f.spiritLockTimer > 0) f.spiritLockTimer = Math.max(0, f.spiritLockTimer - dt);
    if (f.slayerMarkTimer > 0) f.slayerMarkTimer = Math.max(0, f.slayerMarkTimer - dt);
    if (f.giantTimer > 0) f.giantTimer = Math.max(0, f.giantTimer - dt);
    if (f.evadeTimer > 0) f.evadeTimer = Math.max(0, f.evadeTimer - dt);
    if (f.dodgeLockedTimer > 0) f.dodgeLockedTimer = Math.max(0, f.dodgeLockedTimer - dt);
    if (f.airborneTimer > 0) {
      f.airborneTimer = Math.max(0, f.airborneTimer - dt);
      f.vx *= Math.pow(0.05, dt);
      f.vy *= Math.pow(0.05, dt);
    }
    if (f.charmTimer > 0) {
      f.charmTimer = Math.max(0, f.charmTimer - dt);
      f.silenceTimer = Math.max(f.silenceTimer, 0.15);
      const charmer = f.charmOwnerUid
        ? this.fighters.find((x) => x.uid === f.charmOwnerUid && x.alive)
        : null;
      if (charmer) {
        const cdx = charmer.x - f.x;
        const cdy = charmer.y - f.y;
        const cd = Math.max(1, Math.hypot(cdx, cdy));
        f.vx = (cdx / cd) * 155;
        f.vy = (cdy / cd) * 155;
      }
      if (f.charmTimer <= 0) {
        f.charmOwnerUid = null;
      }
    }

    // Continuous Burn DoT (Jogo, Yamamoto, Natsu, Akainu, Roy Mustang...)
    if (f.burnTimer > 0 && !this.finished) {
      const prevFloor = Math.floor(f.burnTimer * 2.5);
      f.burnTimer = Math.max(0, f.burnTimer - dt);
      const nextFloor = Math.floor(f.burnTimer * 2.5);
      if (nextFloor < prevFloor && f.burnDps > 0) {
        const burner = f.burnOwnerUid
          ? (this.fighters.find((x) => x.uid === f.burnOwnerUid) ?? null)
          : null;
        this.applyDamage(burner, f, f.burnDps, 0, 0, { sourceKind: 'dot', bypassInvuln: true });
        this.spawnParticles(f.x, f.y, 4, '#f97316', 35, 110, 2, 4.5, 'circle');
      }
      if (f.burnTimer <= 0) {
        f.burnDps = 0;
        f.burnOwnerUid = null;
      }
    }

    // Sans Karmic Retribution (KR) & Wither Decay DoT (bypasses invulnerability!)
    if (f.karmaTimer > 0 && !this.finished) {
      const prevFloor = Math.floor(f.karmaTimer / 0.3);
      f.karmaTimer = Math.max(0, f.karmaTimer - dt);
      const nextFloor = Math.floor(f.karmaTimer / 0.3);
      if (nextFloor < prevFloor && f.karmaDps > 0) {
        const caster = f.karmaOwnerUid
          ? (this.fighters.find((x) => x.uid === f.karmaOwnerUid) ?? null)
          : null;
        this.applyDamage(caster, f, f.karmaDps, 0, 0, { sourceKind: 'dot', bypassInvuln: true });
        const pCol = f.karmaKind === 'kr' ? '#c084fc' : '#581c87';
        this.spawnParticles(f.x, f.y, 4, pCol, 30, 95, 2, 4.5, 'pixel');
      }
      if (f.karmaTimer <= 0) {
        f.karmaDps = 0;
        f.karmaOwnerUid = null;
        f.karmaKind = null;
      }
    }

    // Authentic Pokémon [PAR] Paralysis — periodic micro-stuns every 0.9s!
    if (f.paralyzeTimer > 0 && !this.finished) {
      f.paralyzeTimer = Math.max(0, f.paralyzeTimer - dt);
      f.paralyzeTick += dt;
      if (f.paralyzeTick >= 0.9 && f.stunTimer <= 0) {
        f.paralyzeTick = 0;
        f.savedVx = f.vx;
        f.savedVy = f.vy;
        f.stunTimer = Math.max(f.stunTimer, 0.24);
        f.stunKind = 'time-stop';
        this.spawnFloatingText(f.x, f.y - f.radius - 12, 'PARALYZED!', '#facc15', 'callout');
        this.spawnParticles(f.x, f.y, 8, '#facc15', 70, 190, 2.5, 5, 'star');
        this.emitSfx({ type: 'crit', intensity: 0.7 });
      }
      if (f.paralyzeTimer <= 0) {
        f.paralyzeTick = 0;
      }
    }

    // Hard Stun / Freeze / Unlimited Void / Time Stop paralysis!
    if (f.stunTimer > 0) {
      f.stunTimer = Math.max(0, f.stunTimer - dt);
      f.vx = 0;
      f.vy = 0;
      if (f.stunTimer <= 0) {
        f.stunKind = null;
        const spd = Math.hypot(f.savedVx, f.savedVy);
        if (spd > 40) {
          f.vx = f.savedVx;
          f.vy = f.savedVy;
        } else {
          const randA = Math.random() * Math.PI * 2;
          f.vx = Math.cos(randA) * BASE_MIN_SPEED;
          f.vy = Math.sin(randA) * BASE_MIN_SPEED;
        }
      }
      return;
    }

    // Subtle homing drift toward nearest enemy (or toward ore blocks while Steve is mining for Netherite!)
    if (f.abilityChargeTimer <= 0 && f.odmActiveTimer <= 0) {
      if (this.isSteveMining(f)) {
        const ore = this.obstacles.find(
          (o) =>
            o.ownerUid === f.uid &&
            (o.kind === 'iron-ore' || o.kind === 'diamond-ore' || o.kind === 'ancient-debris'),
        );
        const nearest = this.getNearestEnemy(f);
        const enemyDist = nearest ? Math.hypot(nearest.x - f.x, nearest.y - f.y) : Infinity;
        const oreDist = ore ? Math.hypot(ore.x - f.x, ore.y - f.y) : Infinity;
        // When free (no enemy engaging up close, or already right next to corner ore), head to the corner to mine!
        const isFreeToMine =
          Boolean(ore) &&
          !this.isUltimateActive(f) &&
          (enemyDist > 165 || (oreDist < 120 && enemyDist > 110));

        if (ore && isFreeToMine) {
          const dx = ore.x - f.x;
          const dy = ore.y - f.y;
          if (oreDist > 1) {
            const nx = dx / oreDist;
            const ny = dy / oreDist;
            const targetSpd = Math.max(255, Math.hypot(f.vx, f.vy));
            const desiredVx = nx * targetSpd;
            const desiredVy = ny * targetSpd;
            // Smoothly steer toward the corner ore while damping tangential orbit velocity
            const blend = Math.min(1, dt * (oreDist < 130 ? 6.5 : 3.6));
            f.vx += (desiredVx - f.vx) * blend;
            f.vy += (desiredVy - f.vy) * blend;
          }
        } else if (nearest && enemyDist > 1) {
          // Enemy is close -> fight directly at any armor tier!
          const steerDir = f.confusedTimer > 0 ? -1 : 1;
          const pull = 72 * f.character.baseStats.speed * steerDir;
          f.vx += ((nearest.x - f.x) / enemyDist) * pull * dt;
          f.vy += ((nearest.y - f.y) / enemyDist) * pull * dt;
        }
      } else if (f.character.id === 'sukuna') {
        // Ranged kiting AI: Sukuna maintains mid-to-long distance to slice foes with Dismantle!
        const nearest = this.getNearestEnemy(f);
        if (nearest) {
          const dx = nearest.x - f.x;
          const dy = nearest.y - f.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 1) {
            const nx = dx / dist;
            const ny = dy / dist;
            const steerDir = f.confusedTimer > 0 ? -1 : 1;
            if (dist < 185) {
              // Back off + strafe laterally to stay at ranged slash distance
              const push = 165 * f.character.baseStats.speed * steerDir;
              f.vx += (-nx * push - ny * push * 0.55) * dt;
              f.vy += (-ny * push + nx * push * 0.55) * dt;
            } else if (dist > 265) {
              const pull = 85 * f.character.baseStats.speed * steerDir;
              f.vx += nx * pull * dt;
              f.vy += ny * pull * dt;
            }
          }
        }
      } else {
        const nearest = this.getNearestEnemy(f);
        if (nearest) {
          const dx = nearest.x - f.x;
          const dy = nearest.y - f.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 1) {
            const steerDir = f.confusedTimer > 0 ? -1 : 1;
            const pull = 72 * f.character.baseStats.speed * steerDir;
            f.vx += (dx / dist) * pull * dt;
            f.vy += (dy / dist) * pull * dt;
          }
        }
      }
    }

    // Maintain smooth velocity window (never stalls, never explodes out of control)
    if (f.abilityChargeTimer <= 0 && f.odmActiveTimer <= 0) {
      const excitedMult = f.getExcitedTimer > 0 ? 1.48 : 1.0;
      const drowsyMult = f.drowsyTimer > 0 ? 0.55 : 1.0;
      const frostMult = f.frostTimer > 0 ? 0.55 : 1.0;
      // Transformations do NOT increase movement/bouncing speed so late-game fights stay readable
      const baseFormSpeedMult = f.character.forms[0]?.speedMult ?? 1;
      const speedMult =
        f.character.baseStats.speed *
        baseFormSpeedMult *
        (1 + (f.lolSpeedBonus ?? 0)) *
        excitedMult *
        drowsyMult *
        frostMult;
      const minSpd = BASE_MIN_SPEED * speedMult;
      const dashBoost = f.spinDashTimer > 0 ? 1.58 : f.rasenganDashTimer > 0 ? 1.45 : 1.0;
      const maxSpd = BASE_MAX_SPEED * dashBoost * speedMult;
      const curSpd = Math.hypot(f.vx, f.vy);

      if (curSpd < 0.01) {
        const randA = Math.random() * Math.PI * 2;
        f.vx = Math.cos(randA) * minSpd;
        f.vy = Math.sin(randA) * minSpd;
      } else if (curSpd < minSpd) {
        const boost = minSpd / curSpd;
        f.vx *= 1 + (boost - 1) * Math.min(1, dt * 8);
        f.vy *= 1 + (boost - 1) * Math.min(1, dt * 8);
      } else if (curSpd > maxSpd) {
        // Gentle aerodynamic damping above maxSpd so Serious Punch knockbacks still fly fast into walls!
        const damp = Math.pow(0.28, dt);
        const newSpd = maxSpd + (curSpd - maxSpd) * damp;
        f.vx = (f.vx / curSpd) * newSpd;
        f.vy = (f.vy / curSpd) * newSpd;
      }
    }

    // Leave speed afterimages for fast forms (Ichigo Bankai+, Goku UI, Gear 5)
    const speedNow = Math.hypot(f.vx, f.vy);
    if (
      (form.visualVariant === 'ui' ||
        form.visualVariant === 'gear5' ||
        form.visualVariant === 'bankai' ||
        form.visualVariant === 'truebankai' ||
        form.visualVariant === 'baryon' ||
        form.visualVariant === 'ackerman') &&
      speedNow > 390 &&
      Math.random() < 0.25
    ) {
      f.afterimages.push({
        x: f.x,
        y: f.y,
        alpha: 0.35,
        color: form.auraColor,
        formIndex: f.formIndex,
      });
    }

    // Integrate position
    f.x += f.vx * dt;
    f.y += f.vy * dt;

    if (speedNow > 20 && f.abilityChargeTimer <= 0) {
      f.facingAngle = Math.atan2(f.vy, f.vx);
    }
  }

  private isSteveMining(f: FighterState): boolean {
    return f.character.id === 'steve' && f.formIndex < f.character.forms.length - 1;
  }

  private updateSukunaRangedBasic(f: FighterState, dt: number): void {
    f.sukunaSlashCd -= dt;
    if (f.sukunaSlashCd > 0) return;

    const target = this.getNearestEnemy(f);
    if (!target) return;

    const form = this.getForm(f);
    f.sukunaSlashCd = 0.66 * (form.cooldownMult ?? 1);

    const baseAng = Math.atan2(target.y - f.y, target.x - f.x);
    f.facingAngle = baseAng;

    // Canon JJK Dismantle: instant razor-sharp slash lines carving directly across the target from afar!
    const slashCount = f.formIndex >= 2 ? 2 : 1;
    const perSlashDmg = this.getEffectiveDamage(
      f,
      f.character.baseStats.damage * (slashCount === 2 ? 0.56 : 0.82),
    );
    const baseCutAngle = (Math.random() - 0.5) * Math.PI * 0.7 + Math.PI * 0.25;
    const halfLen = 62 + form.powerLevel * 8;

    for (let i = 0; i < slashCount; i++) {
      const cutAng = i === 0 ? baseCutAngle : baseCutAngle + Math.PI * 0.5;
      const x1 = target.x - Math.cos(cutAng) * halfLen;
      const y1 = target.y - Math.sin(cutAng) * halfLen;
      const x2 = target.x + Math.cos(cutAng) * halfLen;
      const y2 = target.y + Math.sin(cutAng) * halfLen;

      this.slashes.push({
        id: this.nextId('sukuna_dismantle'),
        ownerUid: f.uid,
        ownerCharId: f.character.id,
        ownerSeries: f.character.series,
        teamId: f.teamId,
        x1,
        y1,
        x2,
        y2,
        color: '#e11d48',
        secondaryColor: '#09090b',
        coreColor: '#ffffff',
        width: slashCount === 2 ? 6.5 : 5.5,
        telegraphTimer: 0.055,
        activeTimer: 0.08,
        fadeTimer: 0.22,
        maxFade: 0.22,
        damage: perSlashDmg,
        hasStruck: false,
      });
    }
    this.spawnParticles(
      f.x + Math.cos(baseAng) * (f.radius + 4),
      f.y + Math.sin(baseAng) * (f.radius + 4),
      4,
      '#ff1f5a',
      50,
      160,
      2,
      4,
      'spark',
    );
    this.emitSfx({ type: 'slash', intensity: 0.75 });
  }

  private updateGojoPassiveAndBasic(f: FighterState, dt: number): void {
    // 1. Always-On Passive Infinity (Mugen): halts non-piercing enemy projectiles entering Gojo's space!
    if (f.silenceTimer <= 0) {
      const stopRadius = f.radius + 54;
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        if (p.ownerUid === f.uid) continue;
        if (f.teamId !== null && p.teamId === f.teamId) continue;
        if (p.piercing) continue; // Piercing spatial attacks / beams can challenge Infinity
        const dist = Math.hypot(p.x - f.x, p.y - f.y);
        if (dist <= stopRadius + p.radius) {
          this.projectiles.splice(i, 1);
          this.spawnParticles(p.x, p.y, 7, '#38bdf8', 30, 130, 2, 4.5, 'spark');
          this.spawnShockwave(
            f.x,
            f.y,
            f.radius + 32,
            '#38bdf8',
            2.5,
            f.character.id,
            f.character.series,
          );
          this.emitSfx({ type: 'dodge', intensity: 0.6 });
        }
      }
    }

    // 2. Canon JJK Gojo Basic Attack: Blue-Infused Martial Arts & Spatial Pull!
    if (f.stunTimer > 0) return;
    f.gojoBasicCd -= dt;
    if (f.gojoBasicCd > 0) return;

    const target = this.getNearestEnemy(f);
    if (!target) return;
    const dx = target.x - f.x;
    const dy = target.y - f.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 290) return;

    const form = this.getForm(f);
    f.gojoBasicCd = 0.58 * (form.cooldownMult ?? 1);
    const ang = Math.atan2(dy, dx);
    f.facingAngle = ang;

    // Blue gravitational snap pulls the opponent inward slightly while dealing a Blue-infused strike!
    const pullForce = dist > 95 ? -210 : 185;
    this.applyDamage(
      f,
      target,
      this.getEffectiveDamage(f, f.character.baseStats.damage * 0.76),
      Math.cos(ang) * pullForce,
      Math.sin(ang) * pullForce,
      { sourceKind: 'ability', isCrit: form.powerLevel >= 4 },
    );
    this.spawnShockwave(target.x, target.y, 58, '#38bdf8', 3.5, f.character.id, f.character.series);
    this.spawnParticles(target.x, target.y, 9, '#38bdf8', 60, 210, 2.2, 4.8, 'spark');
    this.emitSfx({ type: 'hit', intensity: 0.85 });
  }

  private updateSteveMining(f: FighterState, dt: number): void {
    const oreIdx = this.obstacles.findIndex(
      (o) =>
        o.ownerUid === f.uid &&
        (o.kind === 'iron-ore' || o.kind === 'diamond-ore' || o.kind === 'ancient-debris'),
    );

    if (oreIdx === -1) {
      f.steveMineSpawnCd -= dt;
      if (f.steveMineSpawnCd <= 0) {
        const kind =
          f.formIndex === 0 ? 'iron-ore' : f.formIndex === 1 ? 'diamond-ore' : 'ancient-debris';
        const color =
          kind === 'iron-ore' ? '#e2e8f0' : kind === 'diamond-ore' ? '#22d3ee' : '#c084fc';
        const secondaryColor =
          kind === 'iron-ore' ? '#cbd5e1' : kind === 'diamond-ore' ? '#67e8f9' : '#a855f7';
        // Spawn ore strictly in one of the 4 arena corners (preferring corners clear of enemies & not under Steve)
        const cornerPad = 56;
        const corners = [
          { x: this.bounds.left + cornerPad, y: this.bounds.top + cornerPad },
          { x: this.bounds.right - cornerPad, y: this.bounds.top + cornerPad },
          { x: this.bounds.left + cornerPad, y: this.bounds.bottom - cornerPad },
          { x: this.bounds.right - cornerPad, y: this.bounds.bottom - cornerPad },
        ];
        const enemies = this.getEnemies(f);
        const safeCorners = corners.filter(
          (c) =>
            Math.hypot(c.x - f.x, c.y - f.y) >= 120 &&
            enemies.every((e) => Math.hypot(c.x - e.x, c.y - e.y) >= 110),
        );
        const pool =
          safeCorners.length > 0
            ? safeCorners
            : corners.filter((c) => enemies.every((e) => Math.hypot(c.x - e.x, c.y - e.y) >= 90));
        const chosen = (pool.length > 0 ? pool : corners)[
          Math.floor(Math.random() * (pool.length > 0 ? pool.length : corners.length))
        ];
        const ox = Math.max(
          this.bounds.left + 44,
          Math.min(this.bounds.right - 44, chosen.x + (Math.random() - 0.5) * 24),
        );
        const oy = Math.max(
          this.bounds.top + 44,
          Math.min(this.bounds.bottom - 44, chosen.y + (Math.random() - 0.5) * 24),
        );
        this.obstacles.push({
          id: this.nextId('ore'),
          ownerUid: f.uid,
          ownerCharId: f.character.id,
          teamId: f.teamId,
          kind,
          x: ox,
          y: oy,
          w: 32,
          h: 32,
          hp: 1,
          maxHp: 1,
          life: 30,
          maxLife: 30,
          blocksProjectiles: false,
          restitution: 1.0,
          color,
          secondaryColor,
        });
      }
      return;
    }

    const ore = this.obstacles[oreIdx];
    const dx = ore.x - f.x;
    const dy = ore.y - f.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= f.radius + ore.w * 0.38) {
      if (ore.hp > 1) {
        // First pickaxe strike cracks the ore block and bounces Steve back for a second swing!
        ore.hp -= 1;
        const nx = dist > 0.01 ? dx / dist : 1;
        const ny = dist > 0.01 ? dy / dist : 0;
        const sep = f.radius + ore.w * 0.45 - dist;
        if (sep > 0) {
          f.x -= nx * sep;
          f.y -= ny * sep;
        }
        f.vx = -nx * 190 + ny * 85;
        f.vy = -ny * 190 - nx * 85;
        this.spawnParticles(ore.x, ore.y, 7, '#a8a29e', 50, 150, 2, 4.5, 'pixel');
        this.emitSfx({ type: 'wall', intensity: 0.75 });
        return;
      }

      this.obstacles.splice(oreIdx, 1);
      f.steveMinedOres += 1;
      f.steveMineSpawnCd = 0.65;
      this.spawnParticles(ore.x, ore.y, 14, ore.color, 70, 220, 3, 6, 'pixel');
      this.emitSfx({ type: 'wall', intensity: 1.1 });

      const oreLabel =
        ore.kind === 'iron-ore'
          ? 'IRON ORE'
          : ore.kind === 'diamond-ore'
            ? 'DIAMOND ORE'
            : 'ANCIENT DEBRIS';

      if (f.steveMinedOres < 5) {
        this.spawnFloatingText(
          ore.x,
          ore.y - 16,
          `MINED ${oreLabel} (${f.steveMinedOres}/5)`,
          ore.color,
          'callout',
        );
      } else {
        f.steveMinedOres = 0;
        const nextIdx = Math.min(f.character.forms.length - 1, f.formIndex + 1);
        const nextForm = f.character.forms[nextIdx];
        f.formIndex = nextIdx;
        f.highestFormName = nextForm.name;
        f.invulnTimer = Math.max(f.invulnTimer, 0.5);
        f.powerUpFlashTimer = 0.8;

        const isNetherite = nextIdx === f.character.forms.length - 1;
        const headline = isNetherite
          ? 'FULL NETHERITE! TIME TO FIGHT!!'
          : `${nextForm.name.toUpperCase()} CRAFTED!`;
        if (isNetherite) {
          f.transformAngryTimer = 3.4;
          this.addUltimateCharge(f, 40);
        }
        this.spawnFloatingText(f.x, f.y - f.radius - 20, headline, nextForm.auraColor, 'powerup');
        this.spawnShockwave(
          f.x,
          f.y,
          f.radius * 3.8,
          nextForm.auraColor,
          5,
          f.character.id,
          f.character.series,
        );
        this.addScreenShake(isNetherite ? 9 : 5);
        this.emitSfx({ type: 'powerup', intensity: isNetherite ? 1.35 : 1.0 });
        onFighterTransform(this, f, nextForm);
      }
    }
  }

  private checkTransformations(f: FighterState): void {
    // Steve upgrades armor strictly by mining Iron -> Diamond -> Ancient Debris!
    if (f.character.id === 'steve') return;
    const nextIdx = f.formIndex + 1;
    if (nextIdx >= f.character.forms.length) return;
    const nextForm = f.character.forms[nextIdx];
    const trig = nextForm.trigger;
    if (!trig) return;

    let shouldTransform = false;
    if (f.character.id === 'rimuru') {
      // Rimuru canon evolution conditions (NOT automatic on timer!):
      // Form 1 (True Demon Lord): Harvest Festival — 100 Souls harvested via combat/devouring
      // Form 2 (True Dragon): Veldora Release — 200 Souls (or >=145 Souls & HP < 55%)
      // Form 3 (Ciel · Azathoth): Manas Awakening — 300 Souls (or >=235 Souls & HP < 40%)
      const hpRatio = f.hp / f.maxHp;
      if (nextIdx === 1) {
        shouldTransform = f.rimuruSouls >= 100;
      } else if (nextIdx === 2) {
        shouldTransform = f.rimuruSouls >= 200 || (f.rimuruSouls >= 145 && hpRatio <= 0.55);
      } else if (nextIdx === 3) {
        shouldTransform = f.rimuruSouls >= 300 || (f.rimuruSouls >= 235 && hpRatio <= 0.4);
      }
    } else {
      const hpTimeScale = Math.pow(Math.max(100, this.config.baseHp) / 200, 0.32);
      const hpDmgScale = Math.pow(Math.max(100, this.config.baseHp) / 200, 0.85);
      const crowdDmgScale = 1 + Math.max(0, this.fighters.length - 2) * 0.18;
      const scaledTime = trig.timeSec * hpTimeScale;
      const scaledDmg = trig.damageDealt * hpDmgScale * crowdDmgScale;
      const hpRatio = f.hp / f.maxHp;
      shouldTransform =
        this.elapsed >= scaledTime || hpRatio <= trig.hpRatioBelow || f.damageDealt >= scaledDmg;
    }

    if (shouldTransform) {
      f.formIndex = nextIdx;
      f.highestFormName = nextForm.name;
      f.transformAngryTimer = 3.4;
      f.invulnTimer = 0.4;
      f.powerUpFlashTimer = 0.75;
      f.dmgBonusPct += 8;
      this.addUltimateCharge(f, 14);

      // Restore a portion of Max HP on form evolution to extend exciting battles!
      const totalForms = f.character.forms.length;
      const healPct =
        totalForms >= 5 ? 0.14 : totalForms === 4 ? 0.17 : totalForms === 3 ? 0.22 : 0.32;
      const rawHeal = Math.max(10, Math.round(f.maxHp * healPct * getHealMultiplier(f)));
      const actualHeal = Math.min(f.maxHp - f.hp, rawHeal);
      if (actualHeal > 0) {
        f.hp += actualHeal;
        this.spawnFloatingText(f.x, f.y + f.radius + 14, `+${actualHeal} HP`, '#4ade80', 'heal');
        this.spawnParticles(f.x, f.y, 12, '#4ade80', 60, 190, 2.5, 5, 'circle');
        this.emitSfx({ type: 'heal' });
      }

      // Push close enemies slightly on dramatic power-up burst
      for (const enemy of this.getEnemies(f)) {
        const dx = enemy.x - f.x;
        const dy = enemy.y - f.y;
        const d = Math.hypot(dx, dy);
        if (d > 0.01 && d < f.radius * 3.8) {
          enemy.vx += (dx / d) * 260;
          enemy.vy += (dy / d) * 260;
        }
      }

      const headline = nextForm.calloutText ?? `POWER UP!`;
      this.spawnFloatingText(
        f.x,
        f.y - f.radius - 20,
        headline,
        nextForm.auraColor,
        'powerup',
        nextForm.calloutText ? undefined : nextForm.name.toUpperCase(),
      );
      this.spawnShockwave(
        f.x,
        f.y,
        f.radius * 3.8,
        nextForm.auraColor,
        5,
        f.character.id,
        f.character.series,
      );
      this.spawnCastSeal(f, f.x, f.y, f.facingAngle, nextForm.auraColor, 'FORM', false);
      this.spawnSeriesParticles(f, f.x, f.y, 18, nextForm.auraColor, 110, 340);
      this.addScreenShake(6.5);
      this.emitSfx({ type: 'powerup' });

      onFighterTransform(this, f, nextForm);
    }
  }

  private tryTriggerUltimate(f: FighterState): boolean {
    if (
      f.ultimateCharge < 100 ||
      f.ultimateCooldown > 0 ||
      this.activeCutIn !== null ||
      this.globalCutInCooldown > 0 ||
      this.getEnemies(f).length === 0
    ) {
      return false;
    }

    const ult = f.character.ultimate;
    const form = this.getForm(f);
    f.ultimateCharge = 0;
    f.ultimatesUsed += 1;
    f.ultimateCooldown = 8.5;
    this.globalCutInCooldown = this.fighters.length >= 6 ? 2.4 : 0.9;

    this.activeCutIn = {
      fighterUid: f.uid,
      characterId: f.character.id,
      displayName: f.displayName,
      formName: form.name,
      formIndex: f.formIndex,
      ultimate: ult,
      timer: 1.28,
      duration: 1.28,
      executed: false,
    };

    this.emitSfx({
      type: 'ultimate-cutin',
      characterId: f.character.id,
      voiceLine: ult.voiceLine,
      voicePitch: ult.voicePitch,
      voiceRate: ult.voiceRate,
      voiceGender: ult.voiceGender,
    });

    return true;
  }

  private resolveFighterCollisions(): void {
    const list = this.fighters;
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      if (!a.alive || a.untargetableTimer > 0) continue;
      for (let j = i + 1; j < list.length; j++) {
        const b = list[j];
        if (!b.alive || b.untargetableTimer > 0) continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        const minDist = a.radius + b.radius;

        if (dist >= minDist) continue;

        const nx = dist > 0.001 ? dx / dist : 1;
        const ny = dist > 0.001 ? dy / dist : 0;
        const overlap = minDist - dist;

        // Positional separation weighted by mass
        const totalMass = a.mass + b.mass;
        const ratioA = b.mass / totalMass;
        const ratioB = a.mass / totalMass;
        a.x -= nx * overlap * ratioA;
        a.y -= ny * overlap * ratioA;
        b.x += nx * overlap * ratioB;
        b.y += ny * overlap * ratioB;

        // Elastic velocity impulse
        const rvx = b.vx - a.vx;
        const rvy = b.vy - a.vy;
        const velAlongNormal = rvx * nx + rvy * ny;

        if (velAlongNormal < 0) {
          const restitution = 1.06;
          const jImp = (-(1 + restitution) * velAlongNormal) / (1 / a.mass + 1 / b.mass);
          a.vx -= (jImp / a.mass) * nx;
          a.vy -= (jImp / a.mass) * ny;
          b.vx += (jImp / b.mass) * nx;
          b.vy += (jImp / b.mass) * ny;
        }

        // Guarantee lively separation bounce even on grazing bumps
        const sepBoost = 115;
        a.vx -= nx * sepBoost * ratioA;
        a.vy -= ny * sepBoost * ratioA;
        b.vx += nx * sepBoost * ratioB;
        b.vy += ny * sepBoost * ratioB;

        // Visual squash on impact
        const impactAngle = Math.atan2(ny, nx);
        a.squashTimer = 0.13;
        a.squashAngle = impactAngle;
        b.squashTimer = 0.13;
        b.squashAngle = impactAngle;

        // Teammates bounce gently with zero damage
        if (a.teamId !== null && a.teamId === b.teamId) {
          continue;
        }

        const pairKey = a.uid < b.uid ? `${a.uid}|${b.uid}` : `${b.uid}|${a.uid}`;
        if (this.pairCooldowns.has(pairKey)) continue;
        this.pairCooldowns.set(pairKey, 0.17);

        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const speedDiff = Math.hypot(rvx, rvy);
        const speedBonus = Math.min(1.45, Math.max(0.85, speedDiff / 440));

        // Calculate damage both ways (faster / heavier / aura-active attacker hits harder!)
        let rawA = this.getEffectiveDamage(a, a.character.baseStats.damage) * speedBonus;
        let rawB = this.getEffectiveDamage(b, b.character.baseStats.damage) * speedBonus;

        if (a.rasenganDashTimer > 0) {
          rawA *= 1.65;
          a.rasenganDashTimer = 0;
          this.spawnShockwave(mx, my, 85, this.getForm(a).auraColor, 4);
        }
        if (b.rasenganDashTimer > 0) {
          rawB *= 1.65;
          b.rasenganDashTimer = 0;
          this.spawnShockwave(mx, my, 85, this.getForm(b).auraColor, 4);
        }
        if (a.spinDashTimer > 0) {
          rawA *= 1.55;
          this.spawnParticles(mx, my, 8, '#facc15', 90, 250, 2.5, 5, 'circle');
        }
        if (b.spinDashTimer > 0) {
          rawB *= 1.55;
          this.spawnParticles(mx, my, 8, '#facc15', 90, 250, 2.5, 5, 'circle');
        }
        if (a.character.abilityId === 'kamehameha' || a.character.abilityId === 'final-flash') {
          rawA *= 1.12;
        }
        if (b.character.abilityId === 'kamehameha' || b.character.abilityId === 'final-flash') {
          rawB *= 1.12;
        }

        const isHeavyClash = speedDiff > 640;

        // Gojo Always-On Infinity dampens normal melee bumps against him (unless attacker is in Ultimate/Domain)
        const gojoInfA =
          a.character.id === 'gojo' && a.silenceTimer <= 0 && !this.isUltimateActive(b);
        const gojoInfB =
          b.character.id === 'gojo' && b.silenceTimer <= 0 && !this.isUltimateActive(a);
        if (gojoInfB) {
          rawA *= 0.25;
          this.spawnParticles(mx, my, 7, '#38bdf8', 50, 170, 2, 4.5, 'spark');
        }
        if (gojoInfA) {
          rawB *= 0.25;
          this.spawnParticles(mx, my, 7, '#38bdf8', 50, 170, 2, 4.5, 'spark');
        }

        // Sukuna (ranged Dismantle fighter) does not deal melee collision damage
        if (a.character.id !== 'sukuna') {
          this.applyDamage(a, b, rawA, nx * 165, ny * 165, {
            isCrit: isHeavyClash,
            sourceKind: 'collision',
            allowLifesteal: (this.getForm(a).lifestealRatio ?? 0) > 0,
          });
        }
        if (b.alive && b.character.id !== 'sukuna') {
          this.applyDamage(b, a, rawB, -nx * 165, -ny * 165, {
            isCrit: isHeavyClash,
            sourceKind: 'collision',
            allowLifesteal: (this.getForm(b).lifestealRatio ?? 0) > 0,
          });
        }

        // Clash VFX & SFX
        this.spawnParticles(mx, my, isHeavyClash ? 14 : 8, '#ffffff', 90, 290, 2, 4.5, 'spark');
        this.spawnParticles(mx, my, 5, this.getForm(a).auraColor, 70, 220, 2, 4, 'spark');
        this.spawnParticles(mx, my, 5, this.getForm(b).auraColor, 70, 220, 2, 4, 'spark');
        this.addScreenShake(isHeavyClash ? 7 : 3.5);
        this.emitSfx({
          type: isHeavyClash ? 'crit' : 'hit',
          intensity: Math.min(1.4, 0.75 + speedDiff / 800),
        });
      }
    }
  }

  private resolveWallBounce(f: FighterState): void {
    const { left, right, top, bottom } = this.bounds;
    let bounced = false;
    let impactSpeed = 0;
    let wallNormalAngle = 0;

    if (f.x - f.radius < left) {
      f.x = left + f.radius;
      impactSpeed = Math.abs(f.vx);
      f.vx = Math.abs(f.vx);
      wallNormalAngle = 0;
      bounced = true;
    } else if (f.x + f.radius > right) {
      f.x = right - f.radius;
      impactSpeed = Math.abs(f.vx);
      f.vx = -Math.abs(f.vx);
      wallNormalAngle = Math.PI;
      bounced = true;
    }

    if (f.y - f.radius < top) {
      f.y = top + f.radius;
      impactSpeed = Math.max(impactSpeed, Math.abs(f.vy));
      f.vy = Math.abs(f.vy);
      wallNormalAngle = Math.PI / 2;
      bounced = true;
    } else if (f.y + f.radius > bottom) {
      f.y = bottom - f.radius;
      impactSpeed = Math.max(impactSpeed, Math.abs(f.vy));
      f.vy = -Math.abs(f.vy);
      wallNormalAngle = -Math.PI / 2;
      bounced = true;
    }

    if (!bounced) return;

    // End ODM zip cleanly upon hitting wall anchor
    if (f.odmActiveTimer > 0) {
      f.odmActiveTimer = 0;
    }

    // Prevent pure horizontal/vertical bounce loops
    const spd = Math.hypot(f.vx, f.vy);
    if (spd > 1) {
      let ang = Math.atan2(f.vy, f.vx);
      const mod90 = Math.abs(((ang % (Math.PI / 2)) + Math.PI / 2) % (Math.PI / 2));
      if (mod90 < 0.14 || mod90 > Math.PI / 2 - 0.14) {
        ang += (Math.random() < 0.5 ? 1 : -1) * 0.2;
        f.vx = Math.cos(ang) * spd;
        f.vy = Math.sin(ang) * spd;
      }
    }

    f.squashTimer = 0.11;
    f.squashAngle = wallNormalAngle;

    this.spawnParticles(f.x, f.y, 4, this.getForm(f).auraColor, 50, 150, 1.8, 3.5, 'spark');
    this.emitSfx({ type: 'wall', intensity: Math.min(1.1, impactSpeed / 400) });
  }

  private handleKo(victim: FighterState, killer: FighterState | null): void {
    victim.alive = false;
    victim.hp = 0;
    victim.koFadeTimer = 0.55;
    victim.eliminatedAt = this.elapsed;

    const attributedKiller =
      killer && killer.uid !== victim.uid
        ? killer
        : victim.lastDamagedByUid
          ? (this.fighters.find((f) => f.uid === victim.lastDamagedByUid) ?? null)
          : null;

    if (attributedKiller && attributedKiller.uid !== victim.uid) {
      attributedKiller.kills += 1;
      this.addUltimateCharge(attributedKiller, 22);
      if (isLolChampion(attributedKiller.character)) {
        attributedKiller.lolGold += 480;
        this.buyNextLolItem(attributedKiller, false);
      }
      if (attributedKiller.character.id === 'rimuru') {
        attributedKiller.rimuruSouls += 75;
      }
      onFighterKill(this, attributedKiller, victim);
    }

    // Dramatic KO juice: hitstop + slow-mo + particle shatter + shockwave + boom
    this.addHitstop(0.075);
    this.slowMoTimer = 0.58;
    this.addScreenShake(15);
    this.emitSfx({ type: 'ko' });

    const form = this.getForm(victim);
    this.spawnShockwave(victim.x, victim.y, 145, '#ffffff', 6);
    this.spawnShockwave(victim.x, victim.y, 110, victim.character.primaryColor, 4.5);
    this.spawnParticles(
      victim.x,
      victim.y,
      34,
      victim.character.primaryColor,
      120,
      440,
      3,
      7.5,
      'shard',
    );
    this.spawnParticles(victim.x, victim.y, 18, form.auraColor, 100, 360, 2.5, 5.5, 'spark');
    this.spawnFloatingText(victim.x, victim.y - 16, 'K.O.!', '#ff2a5f', 'callout');
  }

  private updateVisualTimersOnly(dt: number): void {
    this.updateEffects(dt);
  }

  private updateEffects(dt: number): void {
    for (let i = this.castSeals.length - 1; i >= 0; i--) {
      const seal = this.castSeals[i];
      seal.life -= dt;
      if (seal.life <= 0) {
        this.castSeals.splice(i, 1);
      }
    }

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.radius += (s.maxRadius - s.radius) * Math.min(1, dt * 11) + 95 * dt;
      s.alpha = Math.max(0, 1 - s.radius / s.maxRadius);
      if (s.radius >= s.maxRadius || s.alpha <= 0.02) {
        this.shockwaves.splice(i, 1);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.pow(0.18, dt);
      p.vy *= Math.pow(0.18, dt);
      p.rotation += p.vRot * dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.life -= dt;
      if (t.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      t.y += t.vy * dt;
      t.vy *= Math.pow(0.35, dt);
    }
  }

  private checkWinCondition(clampedDt: number): void {
    if (this.finished) return;

    const living = this.fighters.filter((f) => f.alive);
    let over = false;
    if (this.config.mode === 'team') {
      const livingTeams = new Set(living.map((f) => f.teamId));
      over = livingTeams.size <= 1;
    } else {
      over = living.length <= 1;
    }

    if (!over) return;

    if (this.finishCountdown < 0) {
      this.finishCountdown = 1.05;
      return;
    }

    this.finishCountdown -= clampedDt;
    if (this.finishCountdown <= 0) {
      this.finished = true;
      this.matchResult = this.buildMatchResult();
      this.emitSfx({ type: 'victory' });
    }
  }

  private buildMatchResult(): MatchResult {
    const sorted = [...this.fighters].sort((a, b) => {
      if (a.alive !== b.alive) return a.alive ? -1 : 1;
      if (!a.alive && !b.alive) {
        return (b.eliminatedAt ?? 0) - (a.eliminatedAt ?? 0);
      }
      if (b.hp !== a.hp) return b.hp - a.hp;
      return b.damageDealt - a.damageDealt;
    });

    const summaries: FighterMatchSummary[] = sorted.map((f, idx) => ({
      uid: f.uid,
      slotIndex: f.slotIndex,
      characterId: f.character.id,
      displayName: f.displayName,
      series: f.character.series,
      primaryColor: f.character.primaryColor,
      teamId: f.teamId,
      alive: f.alive,
      hpRemaining: Math.ceil(f.hp),
      maxHp: f.maxHp,
      damageDealt: Math.round(f.damageDealt),
      kills: f.kills,
      highestFormName: f.highestFormName,
      finalFormIndex: f.formIndex,
      placement: idx + 1,
    }));

    const top = sorted[0] ?? null;
    let winnerTeamId: number | null = null;
    let winnerName = top ? top.displayName : 'Draw';

    if (this.config.mode === 'team') {
      const aliveTeam = sorted.find((f) => f.alive)?.teamId ?? top?.teamId ?? 0;
      winnerTeamId = aliveTeam;
      winnerName = aliveTeam === 0 ? 'Blue Team (Team A)' : 'Red Team (Team B)';
    }

    return {
      mode: this.config.mode,
      winnerUid: top ? top.uid : null,
      winnerTeamId,
      winnerName,
      durationSec: this.elapsed,
      fighters: summaries,
    };
  }
}

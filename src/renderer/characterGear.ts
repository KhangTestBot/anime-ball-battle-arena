import type { CharacterConfig, FormConfig } from '../types/game';
import { hexWithAlpha } from './characterDraw';
import { drawBespokeOuterOutfit, drawBespokeOuterWeapon } from './characterVisuals';

/**
 * Draws anime/game outerwear, capes, coats, wings, and shoulder silhouettes OUTSIDE the ball sphere
 * (drawn behind the head layer so characters look like full stylized anime fighters, not boxed-in spheres).
 */
export function drawAnimeOuterBodyAndCape(
  ctx: CanvasRenderingContext2D,
  char: CharacterConfig,
  form: FormConfig,
  r: number,
  facingAngle: number,
  t: number,
): void {
  const id = char.id;
  const flutter = Math.sin(t * 7.5 + facingAngle) * (r * 0.08);
  const acc = char.accessory;

  ctx.save();

  // 1. Billowing Capes / Cloaks / Coats behind shoulders
  if (id === 'saitama') {
    // Saitama iconic White Hero Cape with Red/Gold snap clasps!
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.72, r * 0.32);
    ctx.quadraticCurveTo(-r * 1.18, r * 0.95 + flutter, -r * 0.96, r * 1.46 + flutter);
    ctx.quadraticCurveTo(0, r * 1.24, r * 0.96, r * 1.46 - flutter);
    ctx.quadraticCurveTo(r * 1.18, r * 0.95 - flutter, r * 0.72, r * 0.32);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Yellow jumpsuit torso base & red zipper collar
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.95, r * 0.66, r * 0.38, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#dc2626';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(side * r * 0.44, r * 0.78, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  if (id === 'rimuru') {
    if (form.visualVariant === 'slime') {
      // Squishy glowing outer Slime skirt + mini Demon Crown silhouette
      ctx.fillStyle = hexWithAlpha('#38bdf8', 0.45);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r * 1.08, r * 0.48);
      ctx.quadraticCurveTo(0, r * 1.28 + flutter * 0.5, r * 1.08, r * 0.48);
      ctx.quadraticCurveTo(r * 0.7, r * 0.98, 0, r * 1.05);
      ctx.quadraticCurveTo(-r * 0.7, r * 0.98, -r * 1.08, r * 0.48);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Rimuru Demon Lord / True Dragon / Azathoth Black Fur-Trimmed Cloak + Dragon Bat Wings!
      if (form.powerLevel >= 4) {
        ctx.fillStyle = form.visualVariant === 'azathoth' ? '#1e1b4b' : '#0f172a';
        ctx.strokeStyle = form.auraColor;
        ctx.lineWidth = 2;
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(side * r * 0.5, r * 0.1);
          ctx.lineTo(side * r * 1.68, -r * 0.42 + flutter);
          ctx.lineTo(side * r * 1.48, r * 0.52 + flutter);
          ctx.lineTo(side * r * 0.75, r * 0.45);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
      // Royal Dark Mantle + White Plush Fur Rim Collar!
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = form.auraColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.95, r * 0.58);
      ctx.lineTo(-r * 1.15, r * 1.38 + flutter);
      ctx.lineTo(r * 1.15, r * 1.38 - flutter);
      ctx.lineTo(r * 0.95, r * 0.58);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(0, r * 0.88, r * 0.98, r * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  // Nine-Tails Fox Coat & Tails for Ahri
  if (id === 'ahri') {
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 1.6;
    for (let i = -3; i <= 3; i++) {
      const a = Math.PI / 2 + i * 0.34 + Math.sin(t * 5 + i) * 0.05;
      ctx.save();
      ctx.rotate(a - Math.PI / 2);
      ctx.beginPath();
      ctx.ellipse(0, r * 1.12, r * 0.22, r * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    return;
  }

  // Flowing Pirate Captain / Yonko Coats draped behind shoulders
  if (id === 'luffy' || id === 'shanks' || id === 'whitebeard' || id === 'kaido') {
    const coatCol =
      id === 'whitebeard'
        ? '#f8fafc'
        : id === 'luffy' && form.visualVariant === 'base'
          ? '#dc2626'
          : '#0f172a';
    const trimCol = id === 'whitebeard' ? '#fbbf24' : id === 'kaido' ? '#a855f7' : '#ef4444';
    ctx.fillStyle = coatCol;
    ctx.strokeStyle = trimCol;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-r * 1.05, r * 0.42);
    ctx.lineTo(-r * 1.26, r * 1.38 + flutter);
    ctx.lineTo(r * 1.26, r * 1.38 - flutter);
    ctx.lineTo(r * 1.05, r * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Kaido scaly dragon collar fluff / Whitebeard gold epaulettes
    if (id === 'kaido') {
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.ellipse(0, r * 0.72, r * 1.08, r * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (id === 'whitebeard') {
      ctx.fillStyle = '#facc15';
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(side * r * 0.94, r * 0.56, r * 0.34, r * 0.16, side * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
    return;
  }

  // Akatsuki Red-Cloud High Collars / Hokage Cloaks / Shinigami Shihakusho / Demon Slayers
  if (id === 'itachi' || id === 'pain' || id === 'obito') {
    ctx.fillStyle = '#09090b';
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 1.02, r * 0.12);
    ctx.lineTo(-r * 1.18, r * 1.3 + flutter);
    ctx.lineTo(r * 1.18, r * 1.3 - flutter);
    ctx.lineTo(r * 1.02, r * 0.12);
    ctx.lineTo(r * 0.76, r * 0.65);
    ctx.lineTo(-r * 0.76, r * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (id === 'minato' || id === 'naruto') {
    const isHokage = id === 'minato' || form.powerLevel >= 3;
    ctx.fillStyle = isHokage ? '#f8fafc' : '#f97316';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.95, r * 0.5);
    ctx.lineTo(-r * 1.18, r * 1.38 + flutter);
    ctx.lineTo(-r * 0.5, r * 1.22);
    ctx.lineTo(0, r * 1.42);
    ctx.lineTo(r * 0.5, r * 1.22);
    ctx.lineTo(r * 1.18, r * 1.38 - flutter);
    ctx.lineTo(r * 0.95, r * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (id === 'saber' || id === 'gilgamesh' || id === 'escanor') {
    // Royal Metallic Pauldrons + Mantle!
    ctx.fillStyle = id === 'saber' ? '#1d4ed8' : id === 'gilgamesh' ? '#eab308' : '#f59e0b';
    ctx.strokeStyle = id === 'saber' ? '#fde047' : '#09090b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.98, r * 0.52);
    ctx.lineTo(-r * 1.16, r * 1.34 + flutter);
    ctx.lineTo(r * 1.16, r * 1.34 - flutter);
    ctx.lineTo(r * 0.98, r * 0.52);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    for (const side of [-1, 1]) {
      ctx.fillStyle = id === 'saber' ? '#e2e8f0' : '#facc15';
      ctx.beginPath();
      ctx.ellipse(side * r * 0.88, r * 0.65, r * 0.36, r * 0.22, side * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  // Goku Orange Gi / Tail / UI Halo
  if (id === 'goku' || id === 'vegeta') {
    ctx.fillStyle = id === 'goku' ? '#ea580c' : '#1d4ed8';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.96, r * 0.82, r * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Goku Blue Undershirt trim / Vegeta white chestplate shoulder straps
    ctx.fillStyle = id === 'goku' ? '#1d4ed8' : '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.88, r * 0.5, r * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // Demon Wings (Meliodas, Jinwoo Shadow Monarch, Ulquiorra, Hakari fur jacket, Tanjiro Haori, Levi Cloak)
  if (id === 'meliodas' || id === 'jinwoo') {
    const wingCol = id === 'jinwoo' ? '#7e22ce' : '#581c87';
    ctx.fillStyle = hexWithAlpha(wingCol, 0.72);
    ctx.strokeStyle = id === 'jinwoo' ? '#c084fc' : '#a855f7';
    ctx.lineWidth = 2;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * r * 0.45, r * 0.2);
      ctx.quadraticCurveTo(side * r * 1.45, -r * 0.5 + flutter, side * r * 1.5, r * 0.55 + flutter);
      ctx.lineTo(side * r * 0.65, r * 0.65);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  // Bespoke canon outerwear for 30+ iconic expansion characters (Admirals, Captains, Hashira, Villains, Heroes)
  if (drawBespokeOuterOutfit(ctx, char, form, r, flutter)) {
    ctx.restore();
    return;
  }

  // Anti-duplicate varied Anime Shoulders / Coat / Scarf / Armor / Collar Silhouette for remaining expansion fighters!
  if (acc !== 'mc-mob' && id !== 'creeper' && id !== 'wither') {
    const coatColor = char.secondaryColor || form.auraColor;
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
    const cut = Math.abs(h) % 4;

    ctx.fillStyle = hexWithAlpha(char.primaryColor, 0.92);
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;

    if (cut === 0) {
      // Flowing High-Collar Cape
      ctx.beginPath();
      ctx.moveTo(-r * 0.94, r * 0.48);
      ctx.lineTo(-r * 1.15, r * 1.36 + flutter);
      ctx.lineTo(r * 1.15, r * 1.36 - flutter);
      ctx.lineTo(r * 0.94, r * 0.48);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (cut === 1) {
      // Martial Gi / Kimono Wrap with Diagonal Sash
      ctx.beginPath();
      ctx.roundRect(-r * 0.86, r * 0.62, r * 1.72, r * 0.62, 10);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = coatColor;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.52, r * 0.68);
      ctx.lineTo(r * 0.42, r * 1.2);
      ctx.stroke();
    } else if (cut === 2) {
      // Armored Shoulder Pauldrons
      ctx.beginPath();
      ctx.ellipse(0, r * 0.94, r * 0.8, r * 0.36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = coatColor;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(side * r * 0.86, r * 0.68, r * 0.32, r * 0.2, side * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    } else {
      // Flowing Scarf Collar + Tunic
      ctx.beginPath();
      ctx.moveTo(-r * 0.82, r * 0.66);
      ctx.quadraticCurveTo(-r * 0.98, r * 1.18 + flutter * 0.4, -r * 0.64, r * 1.24);
      ctx.lineTo(r * 0.64, r * 1.24);
      ctx.quadraticCurveTo(r * 0.98, r * 1.18 - flutter * 0.4, r * 0.82, r * 0.66);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = coatColor;
      ctx.beginPath();
      ctx.ellipse(0, r * 0.78, r * 0.72, r * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Draws iconic held weapons, staves, blades, guns, and stylized anime hands EXTENDING OUTSIDE the ball sphere!
 * Rotates naturally toward the character's facing/aiming angle with combat momentum bobbing.
 */
export function drawAnimeOuterWeaponAndHands(
  ctx: CanvasRenderingContext2D,
  char: CharacterConfig,
  form: FormConfig,
  r: number,
  facingAngle: number,
  orbitAngle: number,
  chargeProgress: number,
  t: number,
  isLiveBattle: boolean,
): void {
  const id = char.id;
  const swing = isLiveBattle ? Math.sin(t * 9 + orbitAngle * 0.3) * 0.12 : 0;
  const lunge = chargeProgress > 0 ? Math.sin(chargeProgress * Math.PI) * 8 : 0;

  ctx.save();

  // Orbit-based fighters (Zoro, Kratos, Asta, Steve, Vergil) already draw orbiting blades,
  // so give them expressive hand grips outside the ball without cluttering!
  if (
    char.abilityId === 'santoryu-orbit' ||
    char.abilityId === 'blades-of-chaos' ||
    char.abilityId === 'antimagic-cleave' ||
    char.abilityId === 'minecraft-tnt'
  ) {
    drawDualGlovedHands(ctx, char, r, facingAngle, lunge);
    ctx.restore();
    return;
  }

  ctx.rotate(facingAngle + swing);

  // 1. SAITAMA: Iconic Bright-Red Rubber Fist Punching Outward!
  if (id === 'saitama') {
    const ext = r + 10 + lunge;
    // Extended yellow arm sleeve
    ctx.fillStyle = '#eab308';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.fillRect(r * 0.62, -6, 14, 12);
    ctx.strokeRect(r * 0.62, -6, 14, 12);
    // Bold bright-red heroic glove fist!
    ctx.fillStyle = '#dc2626';
    ctx.shadowColor = form.powerLevel >= 4 ? '#facc15' : 'transparent';
    ctx.shadowBlur = form.powerLevel >= 4 ? 14 : 0;
    ctx.beginPath();
    ctx.roundRect(ext - 2, -11, 20, 22, 6);
    ctx.fill();
    ctx.stroke();
    // Knuckle lines & Serious flame highlight
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(ext + 14, -6);
    ctx.lineTo(ext + 14, 6);
    ctx.stroke();
    ctx.restore();
    return;
  }

  // 2. RIMURU: Tempest Katana Blade + Floating Ciel / Storm Slime Spirit Orb!
  if (id === 'rimuru') {
    drawHandDot(ctx, r + 4, 8, char.skinColor);
    const bladeCol = form.powerLevel >= 5 ? '#a855f7' : '#38bdf8';
    ctx.shadowColor = bladeCol;
    ctx.shadowBlur = form.powerLevel >= 3 ? 14 : 6;
    // Sleek straight Tempest Demon Sword extending past ball
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = bladeCol;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(r + 6, 6);
    ctx.lineTo(r + 42, 2);
    ctx.lineTo(r + 48, 6);
    ctx.lineTo(r + 41, 10);
    ctx.lineTo(r + 6, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Gold octagonal tsuba & black handle
    ctx.fillStyle = '#facc15';
    ctx.fillRect(r + 2, 1, 5, 14);
    ctx.fillStyle = '#09090b';
    ctx.fillRect(r - 7, 5.5, 9, 5);

    // Floating mini Rimuru Slime droplet companion / Ciel digital halo on off-hand!
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(r * 0.45, -r - 8 + Math.sin(t * 6) * 2.5, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // 3. KATANAS & LONG SWORDS: Ichigo, Sasuke, Tanjiro, Law, Shanks (LEFT hand!), Yuta, Yasuo, Meliodas, Vergil, Kenpachi, Yamamoto, Zenitsu, Rengoku, Aizen
  if (
    id === 'ichigo' ||
    id === 'sasuke' ||
    id === 'tanjiro' ||
    id === 'law' ||
    id === 'shanks' ||
    id === 'yuta' ||
    id === 'yasuo' ||
    id === 'meliodas' ||
    id === 'vergil' ||
    id === 'kenpachi' ||
    id === 'yamamoto' ||
    id === 'zenitsu' ||
    id === 'rengoku' ||
    id === 'aizen'
  ) {
    const sideY = id === 'shanks' ? -r * 0.72 : r * 0.72; // Shanks wields strictly left-handed!
    drawHandDot(ctx, r + 2, sideY * 0.35, char.skinColor);
    const len = id === 'law' || id === 'kenpachi' ? 48 : id === 'ichigo' ? 46 : 40;
    const width = id === 'kenpachi' || (id === 'ichigo' && form.powerLevel <= 2) ? 9.5 : 4.5;
    const bladeFill =
      id === 'ichigo' || id === 'tanjiro' || id === 'yuta' || id === 'zenitsu' || id === 'rengoku'
        ? '#0f172a'
        : id === 'meliodas'
          ? '#86efac'
          : '#f8fafc';
    const edgeCol =
      id === 'shanks'
        ? '#dc2626'
        : id === 'sasuke' || id === 'aizen'
          ? '#a855f7'
          : id === 'zenitsu'
            ? '#facc15'
            : id === 'yamamoto' || id === 'rengoku' || (id === 'tanjiro' && form.powerLevel >= 3)
              ? '#f97316'
              : id === 'kenpachi'
                ? '#eab308'
                : form.auraColor;

    ctx.shadowColor = edgeCol;
    ctx.shadowBlur = 10;
    ctx.fillStyle = bladeFill;
    ctx.strokeStyle = edgeCol;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(r + 4, sideY * 0.35 - width * 0.5);
    ctx.lineTo(r + 4 + len, sideY * 0.35 - width * 0.4);
    ctx.lineTo(r + 10 + len, sideY * 0.35);
    ctx.lineTo(r + 4 + len, sideY * 0.35 + width * 0.4);
    ctx.lineTo(r + 4, sideY * 0.35 + width * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Gold hilt & crossguard
    ctx.fillStyle = id === 'meliodas' ? '#facc15' : '#eab308';
    ctx.fillRect(r, sideY * 0.35 - 7, 4, 14);
    ctx.restore();
    return;
  }

  // 4. ROYAL KNIGHT / KING HEROES: Saber (Excalibur), Gilgamesh (Ea), Escanor (Rhitta)
  if (id === 'saber' || id === 'gilgamesh' || id === 'escanor') {
    drawHandDot(ctx, r + 3, 6, char.skinColor);
    if (id === 'escanor') {
      // Giant Golden Sacred Axe Rhitta!
      ctx.fillStyle = '#eab308';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2;
      ctx.fillRect(r - 4, 4, 38, 4.5);
      ctx.strokeRect(r - 4, 4, 38, 4.5);
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(r + 22, 4);
      ctx.arc(r + 28, 6, 17, -Math.PI * 0.65, Math.PI * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (id === 'gilgamesh') {
      // Spinning 3-Cylinder Sword of Rupture Ea
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(r, 3.5, 10, 5);
      for (let s = 0; s < 3; s++) {
        ctx.fillStyle = s % 2 === 0 ? '#dc2626' : '#09090b';
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1.5;
        ctx.fillRect(r + 10 + s * 10, 1, 9, 10);
        ctx.strokeRect(r + 10 + s * 10, 1, 9, 10);
      }
    } else {
      // Saber EXCALIBUR Holy Sword (green wind glow in base -> golden pillar blade in high forms)
      const isRevealed = form.powerLevel >= 3;
      ctx.shadowColor = isRevealed ? '#facc15' : '#34d399';
      ctx.shadowBlur = 14;
      ctx.fillStyle = isRevealed ? '#fef08a' : 'rgba(110, 231, 183, 0.72)';
      ctx.strokeStyle = isRevealed ? '#eab308' : '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(r + 6, 1);
      ctx.lineTo(r + 44, 2);
      ctx.lineTo(r + 50, 6);
      ctx.lineTo(r + 44, 10);
      ctx.lineTo(r + 6, 11);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(r + 2, -2, 5, 16);
    }
    ctx.restore();
    return;
  }

  // 5. HEAVY POLEARMS & CLUBS: Kaido (Kanabo), Whitebeard (Murakumogiri), Toji (Inverted Spear), Kashimo (Nyoi Staff)
  if (id === 'kaido' || id === 'whitebeard' || id === 'toji' || id === 'kashimo') {
    drawHandDot(ctx, r + 3, 6, char.skinColor);
    if (id === 'kaido') {
      // Giant Spiked Hassaikai Iron Kanabo
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(r, 3);
      ctx.lineTo(r + 44, -3);
      ctx.lineTo(r + 46, 13);
      ctx.lineTo(r, 9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (id === 'whitebeard') {
      // Murakumogiri Naginata Bisento
      ctx.fillStyle = '#eab308';
      ctx.fillRect(r - 8, 4, 42, 4);
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(r + 34, 2);
      ctx.quadraticCurveTo(r + 52, -4, r + 56, 6);
      ctx.quadraticCurveTo(r + 48, 12, r + 34, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (id === 'toji') {
      // 3-Pronged Sai Inverted Spear of Heaven
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(r + 4, 6);
      ctx.lineTo(r + 18, -3);
      ctx.lineTo(r + 14, 4);
      ctx.lineTo(r + 36, 6);
      ctx.lineTo(r + 14, 8);
      ctx.lineTo(r + 18, 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Kashimo Lightning Nyoi Staff
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#0ea5e9';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(r - 4, 6);
      ctx.lineTo(r + 44, 6);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  // 6. DUAL BLADES & SPECIALS: Archer EMIYA (Kanshou & Bakuya), Levi (ODM), Jinwoo (Daggers), Denji (Chainsaws)
  if (id === 'archer_emiya' || id === 'levi' || id === 'jinwoo' || id === 'denji') {
    for (const side of [-1, 1]) {
      const yOff = side * (r * 0.72);
      if (id === 'denji') {
        // Buzzing Extended Chainsaw Blades!
        ctx.fillStyle = '#94a3b8';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.fillRect(r + 2, yOff - 4, 34, 8);
        ctx.strokeRect(r + 2, yOff - 4, 34, 8);
      } else {
        drawHandDot(ctx, r + 2, yOff, char.skinColor);
        const col =
          id === 'archer_emiya'
            ? side === -1
              ? '#1e293b'
              : '#f8fafc'
            : id === 'jinwoo'
              ? '#a855f7'
              : '#cbd5e1';
        ctx.fillStyle = col;
        ctx.strokeStyle = id === 'jinwoo' ? '#e9d5ff' : '#09090b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(r + 4, yOff - 2.5);
        ctx.lineTo(r + 30, yOff - 3.5);
        ctx.lineTo(r + 35, yOff);
        ctx.lineTo(r + 30, yOff + 3.5);
        ctx.lineTo(r + 4, yOff + 2.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
    return;
  }

  // 7. ENERGY HANDS / STAVES / BLADES / GUNS FOR ALL OTHER HEROES
  if (id === 'frieren') {
    // Frieren Half-Moon Crimson Ruby Mage Staff
    drawHandDot(ctx, r + 3, 8, char.skinColor);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(r - 4, 8);
    ctx.lineTo(r + 38, 8);
    ctx.stroke();
    ctx.strokeStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(r + 43, 8, 8, Math.PI * 0.4, Math.PI * 1.6);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(r + 42, 8, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (id === 'jinx') {
    // Jinx Fishbones Shark Rocket Launcher shouldered!
    ctx.fillStyle = '#0ea5e9';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(r - 4, -10, 34, 15, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(r + 28, -2.5, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (id === 'madara' || id === 'obito') {
    // Uchiha Gourd Gunbai War Fan + Kama Chain
    drawHandDot(ctx, r + 3, 6, char.skinColor);
    ctx.fillStyle = '#991b1b';
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(r + 22, 6, 13, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (id === 'minato' || id === 'kakashi' || id === 'itachi') {
    // Minato 3-prong Kunai or Kakashi Raikiri Lightning Hand or Itachi Kunai
    drawHandDot(ctx, r + 4, 6, char.skinColor);
    if (id === 'kakashi') {
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#7dd3fc';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(r + 12, 6, 8 + Math.sin(t * 25) * 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = id === 'minato' ? '#facc15' : '#94a3b8';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(r + 8, 2);
      ctx.lineTo(r + 28, 6);
      ctx.lineTo(r + 8, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (id === 'goku' || id === 'naruto' || id === 'gojo' || id === 'vegeta' || id === 'luffy') {
    // Signature Ki / Rasengan / Purple / Haki Fist outside ball!
    const orbCol =
      id === 'naruto'
        ? '#38bdf8'
        : id === 'gojo'
          ? '#a855f7'
          : id === 'luffy'
            ? '#09090b'
            : form.auraColor;
    drawHandDot(ctx, r + 6 + lunge, 6, id === 'luffy' ? '#18181b' : char.skinColor);
    ctx.fillStyle = orbCol;
    ctx.shadowColor = form.auraColor;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(r + 10 + lunge, 6, 7.5 + Math.sin(t * 16) * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // 8. Bespoke Iconic Weapons for Major Expansion Fighters (Mihawk Yoru, Bakugo Gauntlets, Nobara Hammer, etc.)
  if (drawBespokeOuterWeapon(ctx, char, form, r, lunge, t)) {
    ctx.restore();
    return;
  }

  // 9. Universal Archetype Weapon Fallback covering remaining Expansion Fighters!
  drawUniversalArchetypeWeapon(ctx, char, form, r, lunge);
  ctx.restore();
}

function drawHandDot(ctx: CanvasRenderingContext2D, x: number, y: number, skin: string): void {
  ctx.save();
  ctx.fillStyle = skin || '#f5d0b5';
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x, y, 5.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawDualGlovedHands(
  ctx: CanvasRenderingContext2D,
  char: CharacterConfig,
  r: number,
  facingAngle: number,
  lunge: number,
): void {
  ctx.save();
  ctx.rotate(facingAngle);
  drawHandDot(ctx, r + 4 + lunge, -r * 0.55, char.skinColor);
  drawHandDot(ctx, r + 4 + lunge, r * 0.55, char.skinColor);
  ctx.restore();
}

function drawUniversalArchetypeWeapon(
  ctx: CanvasRenderingContext2D,
  char: CharacterConfig,
  form: FormConfig,
  r: number,
  lunge: number,
): void {
  const firstProj = char.skills[0]?.projectileKind ?? '';
  const eff = char.skills[0]?.effect ?? '';
  const ser = char.series.toLowerCase();

  drawHandDot(ctx, r + 4 + lunge, 6, char.skinColor);
  ctx.shadowColor = form.auraColor;
  ctx.shadowBlur = 8;

  if (
    firstProj === 'getsuga' ||
    firstProj === 'sword-wave' ||
    firstProj === 'dagger-blade' ||
    ser.includes('bleach') ||
    ser.includes('demon slayer') ||
    ser.includes('sword') ||
    ser.includes('fate') ||
    ser.includes('one piece')
  ) {
    // Sleek Anime Blade extending outside the ball
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = form.auraColor;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(r + 6, 3);
    ctx.lineTo(r + 36, 4);
    ctx.lineTo(r + 41, 6);
    ctx.lineTo(r + 36, 8);
    ctx.lineTo(r + 6, 9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#eab308';
    ctx.fillRect(r + 3, 1, 4, 10);
  } else if (firstProj === 'bullet' || firstProj === 'rocket') {
    // Tech Cannon / Blaster Barrel
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = form.auraColor;
    ctx.lineWidth = 1.6;
    ctx.fillRect(r + 3, 2, 24, 8);
    ctx.strokeRect(r + 3, 2, 24, 8);
  } else if (firstProj === 'spear' || firstProj === 'arrow-trident' || firstProj === 'scythe') {
    // Polearm / Scythe Shaft
    ctx.strokeStyle = form.auraColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(r - 2, 6);
    ctx.lineTo(r + 40, 6);
    ctx.stroke();
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(r + 34, 2);
    ctx.lineTo(r + 46, 6);
    ctx.lineTo(r + 34, 10);
    ctx.closePath();
    ctx.fill();
  } else if (
    eff === 'beam-shot' ||
    eff === 'chain-lightning' ||
    ser.includes('frieren') ||
    ser.includes('fairy')
  ) {
    // Arcane Gem Staff / Catalyst Orb
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(r, 6);
    ctx.lineTo(r + 28, 6);
    ctx.stroke();
    ctx.fillStyle = form.auraColor;
    ctx.beginPath();
    ctx.arc(r + 32, 6, 5.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Energized Martial / Brawler Gauntlet Glow
    ctx.fillStyle = form.auraColor;
    ctx.beginPath();
    ctx.arc(r + 8 + lunge, 6, 6.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

import type { CharacterConfig, FormConfig } from '../types/game';

function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Draws canon facial markings, scars, glasses, beards, and multi-eye details
 * inside the clipped head sphere for iconic expansion & core characters.
 */
export function drawBespokeFaceMarkings(
  ctx: CanvasRenderingContext2D,
  char: CharacterConfig,
  _form: FormConfig,
  r: number,
): void {
  const id = char.id;
  ctx.save();

  if (id === 'mahoraga') {
    // Iconic 4 white feathered eye-wings covering both eye sockets + fierce fanged grin!
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    for (const side of [-1, 1]) {
      // Upper eye-wing
      ctx.beginPath();
      ctx.moveTo(side * r * 0.14, -r * 0.08);
      ctx.quadraticCurveTo(side * r * 0.56, -r * 0.42, side * r * 0.94, -r * 0.24);
      ctx.quadraticCurveTo(side * r * 0.58, -r * 0.06, side * r * 0.14, -r * 0.02);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Lower eye-wing
      ctx.beginPath();
      ctx.moveTo(side * r * 0.14, r * 0.04);
      ctx.quadraticCurveTo(side * r * 0.58, r * 0.12, side * r * 0.88, r * 0.28);
      ctx.quadraticCurveTo(side * r * 0.48, r * 0.24, side * r * 0.14, r * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Fierce fanged Shikigami grin
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.roundRect(-r * 0.36, r * 0.34, r * 0.72, r * 0.2, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    for (let i = -2; i <= 2; i++) {
      const tx = i * r * 0.13;
      ctx.beginPath();
      ctx.moveTo(tx - r * 0.05, r * 0.34);
      ctx.lineTo(tx, r * 0.46);
      ctx.lineTo(tx + r * 0.05, r * 0.34);
      ctx.closePath();
      ctx.fill();
    }
  } else if (id === 'kokushibo') {
    // 6-eyed Upper Rank One: 2 extra upper eyes + 2 extra lower eyes + crimson Demon Slayer mark!
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, -r * 0.62);
    ctx.lineTo(-r * 0.25, -r * 0.48);
    ctx.lineTo(-r * 0.45, -r * 0.35);
    ctx.closePath();
    ctx.fill();

    for (const yOff of [-r * 0.36, r * 0.22]) {
      for (const side of [-1, 1]) {
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(side * r * 0.34, yOff, r * 0.14, r * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(side * r * 0.34, yOff, r * 0.045, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (id === 'akaza') {
    // Iconic deep-blue martial demon stripes across forehead & cheeks
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2.4;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * r * 0.22, -r * 0.58);
      ctx.lineTo(side * r * 0.56, -r * 0.38);
      ctx.moveTo(side * r * 0.28, r * 0.12);
      ctx.lineTo(side * r * 0.72, r * 0.2);
      ctx.moveTo(side * r * 0.26, r * 0.3);
      ctx.lineTo(side * r * 0.68, r * 0.4);
      ctx.stroke();
    }
  } else if (id === 'ulquiorra') {
    // Twin emerald vertical tear streaks
    ctx.fillStyle = '#10b981';
    for (const side of [-1, 1]) {
      ctx.fillRect(side * r * 0.36 - 2, r * 0.04, 4, r * 0.48);
    }
  } else if (id === 'hisoka') {
    // Magenta Star (right cheek) & Cyan Teardrop (left cheek)
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(-r * 0.46, r * 0.22, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(r * 0.46, r * 0.12);
    ctx.lineTo(r * 0.54, r * 0.28);
    ctx.lineTo(r * 0.38, r * 0.28);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'mahito') {
    // Patchwork dark surgical stitches across nose bridge & cheek
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-r * 0.72, r * 0.08);
    ctx.lineTo(r * 0.72, r * 0.08);
    ctx.stroke();
    for (let x = -r * 0.55; x <= r * 0.55; x += r * 0.22) {
      ctx.beginPath();
      ctx.moveTo(x, r * 0.01);
      ctx.lineTo(x, r * 0.15);
      ctx.stroke();
    }
  } else if (id === 'todoroki') {
    // Crimson frostbite/burn scar over left eye
    ctx.fillStyle = 'rgba(220, 38, 38, 0.52)';
    ctx.beginPath();
    ctx.ellipse(r * 0.34, -r * 0.12, r * 0.32, r * 0.24, 0.18, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'tengen') {
    // Bold crimson starburst eye markings around left eye
    ctx.strokeStyle = '#be123c';
    ctx.lineWidth = 2.2;
    for (let i = 0; i < 5; i++) {
      const a = -0.8 + i * 0.4;
      ctx.beginPath();
      ctx.moveTo(r * 0.34, -r * 0.08);
      ctx.lineTo(r * 0.34 + Math.cos(a) * r * 0.36, -r * 0.08 + Math.sin(a) * r * 0.36);
      ctx.stroke();
    }
  } else if (id === 'cell') {
    // Twin purple vertical bio-stripes on cheeks
    ctx.fillStyle = '#7e22ce';
    for (const side of [-1, 1]) {
      ctx.fillRect(side * r * 0.44 - 2.2, -r * 0.06, 4.4, r * 0.58);
    }
  } else if (id === 'yhwach') {
    // Thick black Quincy King mustache & goatee
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, r * 0.36);
    ctx.quadraticCurveTo(0, r * 0.14, r * 0.55, r * 0.36);
    ctx.quadraticCurveTo(0, r * 0.34, -r * 0.55, r * 0.36);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'whitebeard') {
    // Iconic giant curved white crescent mustache!
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-r * 0.88, r * 0.06);
    ctx.quadraticCurveTo(-r * 0.35, r * 0.46, 0, r * 0.26);
    ctx.quadraticCurveTo(r * 0.35, r * 0.46, r * 0.88, r * 0.06);
    ctx.quadraticCurveTo(r * 0.35, r * 0.26, 0, r * 0.14);
    ctx.quadraticCurveTo(-r * 0.35, r * 0.26, -r * 0.88, r * 0.06);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (id === 'blackbeard') {
    // Thick shaggy black pirate beard
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(0, r * 0.32, r * 0.78, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'mihawk') {
    // Sharp neat black chin goatee & thin mustache
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.moveTo(-r * 0.22, r * 0.58);
    ctx.lineTo(0, r * 0.84);
    ctx.lineTo(r * 0.22, r * 0.58);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-r * 0.28, r * 0.22, r * 0.56, 2.2);
  } else if (id === 'katakuri') {
    // Tall white-fur scarf covering lower half of face!
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.rect(-r, r * 0.16, r * 2, r * 0.9);
    ctx.fill();
    ctx.stroke();
  } else if (id === 'shanks') {
    // 3 diagonal red claw scars across left eye
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    for (const off of [-4, 0, 4]) {
      ctx.beginPath();
      ctx.moveTo(r * 0.2 + off, -r * 0.38);
      ctx.lineTo(r * 0.38 + off, r * 0.16);
      ctx.stroke();
    }
  } else if (id === 'geto') {
    // Forehead horizontal stitch line
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-r * 0.58, -r * 0.36);
    ctx.lineTo(r * 0.58, -r * 0.36);
    ctx.stroke();
  } else if (id === 'nanami' || id === 'maki' || id === 'kizaru') {
    // Signature eyewear: Nanami green oval glasses / Maki rectangular glasses / Kizaru amber shades
    const col = id === 'nanami' ? '#22c55e' : id === 'kizaru' ? '#f59e0b' : '#334155';
    ctx.fillStyle = id === 'maki' ? 'rgba(56, 189, 248, 0.28)' : col;
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.8;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      if (id === 'nanami') {
        ctx.ellipse(side * r * 0.34, -r * 0.08, r * 0.22, r * 0.14, 0, 0, Math.PI * 2);
      } else {
        ctx.rect(side * r * 0.34 - r * 0.22, -r * 0.2, r * 0.44, r * 0.24);
      }
      ctx.fill();
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-r * 0.12, -r * 0.08);
    ctx.lineTo(r * 0.12, -r * 0.08);
    ctx.stroke();
  } else if (id === 'shigaraki') {
    // Pale grey severed hand gripping across center of face!
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.roundRect(i * r * 0.16 - 3, -r * 0.36, 6, r * 0.62, 3);
      ctx.fill();
      ctx.stroke();
    }
  } else if (id === 'kenpachi') {
    // Black eyepatch over right eye + diagonal strap
    ctx.fillStyle = '#09090b';
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(-r * 0.34, -r * 0.08, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.85, -r * 0.45);
    ctx.lineTo(r * 0.2, r * 0.25);
    ctx.stroke();
  } else if (id === 'pain') {
    // 6 black chakra nose & cheek piercings
    ctx.fillStyle = '#09090b';
    for (const [px, py] of [
      [-r * 0.1, -r * 0.05],
      [r * 0.1, -r * 0.05],
      [-r * 0.36, r * 0.18],
      [r * 0.36, r * 0.18],
      [-r * 0.52, r * 0.24],
      [r * 0.52, r * 0.24],
    ]) {
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'gaara') {
    // Red Love kanji mark on forehead
    ctx.fillStyle = '#dc2626';
    ctx.font = `bold ${Math.max(8, Math.round(r * 0.36))}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('愛', -r * 0.3, -r * 0.42);
  } else if (id === 'jiraiya') {
    // Twin red tear paint lines
    ctx.fillStyle = '#dc2626';
    for (const side of [-1, 1]) {
      ctx.fillRect(side * r * 0.34 - 2.2, r * 0.04, 4.4, r * 0.52);
    }
  } else if (id === 'yamamoto') {
    // Long braided white beard
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, r * 0.32);
    ctx.lineTo(0, r * 0.96);
    ctx.lineTo(r * 0.5, r * 0.32);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

function drawBobHair(ctx: CanvasRenderingContext2D, r: number, color: string): void {
  ctx.fillStyle = color;
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, -r * 0.1, r * 1.04, Math.PI * 1.05, Math.PI * 1.95);
  ctx.lineTo(r * 1.02, r * 0.36);
  ctx.quadraticCurveTo(r * 0.78, r * 0.1, r * 0.7, -r * 0.35);
  ctx.quadraticCurveTo(0, -r * 0.48, -r * 0.7, -r * 0.35);
  ctx.quadraticCurveTo(-r * 0.78, r * 0.1, -r * 1.02, r * 0.36);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawPartedHair(
  ctx: CanvasRenderingContext2D,
  r: number,
  leftColor: string,
  rightColor: string,
): void {
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 1.8;
  // Left curtain bang
  ctx.fillStyle = leftColor;
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.06);
  ctx.quadraticCurveTo(-r * 0.95, -r * 0.96, -r * 1.06, r * 0.15);
  ctx.quadraticCurveTo(-r * 0.55, -r * 0.2, 0, -r * 0.46);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Right curtain bang
  ctx.fillStyle = rightColor;
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.06);
  ctx.quadraticCurveTo(r * 0.95, -r * 0.96, r * 1.06, r * 0.15);
  ctx.quadraticCurveTo(r * 0.55, -r * 0.2, 0, -r * 0.46);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawSweptBackHair(ctx: CanvasRenderingContext2D, r: number, color: string): void {
  ctx.fillStyle = color;
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-r * 0.92, -r * 0.38);
  ctx.lineTo(-r * 0.76, -r * 1.24);
  ctx.lineTo(-r * 0.28, -r * 1.02);
  ctx.lineTo(0, -r * 1.38);
  ctx.lineTo(r * 0.28, -r * 1.02);
  ctx.lineTo(r * 0.76, -r * 1.24);
  ctx.lineTo(r * 0.92, -r * 0.38);
  ctx.quadraticCurveTo(0, -r * 0.62, -r * 0.92, -r * 0.38);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawSharpSpikes(
  ctx: CanvasRenderingContext2D,
  r: number,
  color: string,
  count: number,
  height: number,
): void {
  ctx.fillStyle = color;
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-r * 0.96, -r * 0.25);
  for (let i = 0; i < count; i++) {
    const t0 = i / count;
    const tMid = (i + 0.5) / count;
    const t1 = (i + 1) / count;
    const a0 = Math.PI + t0 * Math.PI;
    const aMid = Math.PI + tMid * Math.PI;
    const a1 = Math.PI + t1 * Math.PI;
    ctx.lineTo(Math.cos(a0) * r * 0.96, Math.sin(a0) * r * 0.96);
    ctx.lineTo(Math.cos(aMid) * r * (1 + height), Math.sin(aMid) * r * (1 + height));
    ctx.lineTo(Math.cos(a1) * r * 0.96, Math.sin(a1) * r * 0.96);
  }
  ctx.quadraticCurveTo(0, -r * 0.42, -r * 0.96, -r * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

/**
 * Renders bespoke anime-faithful hair, hats, helmets, ears, and unique headgear for 50+ iconic characters,
 * plus anti-duplicate procedural hair variety for all remaining expansion fighters!
 * Returns `true` when fully handled.
 */
export function drawBespokeHairAndHeadgear(
  ctx: CanvasRenderingContext2D,
  char: CharacterConfig,
  form: FormConfig,
  r: number,
): boolean {
  const id = char.id;
  const hair = form.hairColor;
  ctx.save();

  // --- ICONIC BESPOKE PROFILES ---
  if (id === 'mahoraga') {
    // Sweeping ivory-white Shikigami head tail-crest + Floating 8-Handled Golden Dharma Wheel overhead!
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.32, -r * 0.88);
    ctx.bezierCurveTo(-r * 0.08, -r * 1.48, r * 0.76, -r * 1.38, r * 1.18, -r * 0.62);
    ctx.bezierCurveTo(r * 0.74, -r * 0.94, r * 0.26, -r * 0.96, r * 0.22, -r * 0.84);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Floating Miniature 8-Spoke Golden Dharma Wheel hovering directly above head
    const wy = -r * 1.38;
    const wr = r * 0.44;
    ctx.save();
    ctx.translate(0, wy);
    ctx.strokeStyle = '#eab308';
    ctx.fillStyle = '#fef08a';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 0, wr, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, wr * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * wr * 0.28, Math.sin(a) * wr * 0.28);
      ctx.lineTo(Math.cos(a) * (wr * 1.35), Math.sin(a) * (wr * 1.35));
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(Math.cos(a) * (wr * 1.38), Math.sin(a) * (wr * 1.38), 2.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.restore();
    return true;
  }

  if (id === 'urahara') {
    // Blonde shaggy hair + signature Green-and-White Striped Bucket Hat!
    drawPartedHair(ctx, r, '#fde047', '#fde047');
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(0, -r * 0.52, r * 0.92, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-r * 0.42, -r * 1.28, r * 0.26, r * 0.72);
    ctx.fillRect(r * 0.16, -r * 1.28, r * 0.26, r * 0.72);
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.52, r * 1.24, r * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return true;
  }

  if (id === 'mihawk') {
    // Wide-brim Black Musketeer Hat with Tall White Plume Feather!
    ctx.fillStyle = '#09090b';
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, -r * 0.56, r * 0.86, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.56, r * 1.38, r * 0.22, -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // White plume feather sweeping right
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#09090b';
    ctx.beginPath();
    ctx.moveTo(r * 0.25, -r * 0.92);
    ctx.quadraticCurveTo(r * 1.25, -r * 1.65, r * 1.35, -r * 0.95);
    ctx.quadraticCurveTo(r * 0.78, -r * 1.1, r * 0.25, -r * 0.92);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return true;
  }

  if (id === 'akainu') {
    // Crisp White Marine Admiral Cap with Dark Visor & Crimson Trim
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-r * 0.84, -r * 1.18, r * 1.68, r * 0.64, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.54, r * 1.05, r * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-r * 0.24, -r * 0.96, r * 0.48, r * 0.18);
    ctx.restore();
    return true;
  }

  if (id === 'blackbeard') {
    // Yonko Tricorne Captain Hat + Red Bandana!
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-r * 0.88, -r * 0.68, r * 1.76, r * 0.24);
    ctx.fillStyle = '#09090b';
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 1.28, -r * 0.6);
    ctx.quadraticCurveTo(0, -r * 1.48, r * 1.28, -r * 0.6);
    ctx.quadraticCurveTo(0, -r * 0.86, -r * 1.28, -r * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return true;
  }

  if (id === 'muzan') {
    // Curly Black Hair + Iconic White Fedora with Black Band!
    drawPartedHair(ctx, r, '#09090b', '#09090b');
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-r * 0.72, -r * 1.28, r * 1.44, r * 0.66, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-r * 0.72, -r * 0.78, r * 1.44, r * 0.16);
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.6, r * 1.22, r * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return true;
  }

  if (id === 'giorno') {
    // Signature 3 Golden Donut Hair Curls across Forehead!
    drawPartedHair(ctx, r, '#facc15', '#facc15');
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    for (const dx of [-r * 0.44, 0, r * 0.44]) {
      ctx.beginPath();
      ctx.arc(dx, -r * 0.82, r * 0.24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#854d0e';
      ctx.beginPath();
      ctx.arc(dx, -r * 0.82, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#facc15';
    }
    ctx.restore();
    return true;
  }

  if (id === 'allmight') {
    // 2 Towering V-Shaped Golden Victory Bangs!
    drawSweptBackHair(ctx, r, '#facc15');
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * r * 0.16, -r * 0.82);
      ctx.quadraticCurveTo(side * r * 0.52, -r * 1.72, side * r * 0.74, -r * 1.56);
      ctx.quadraticCurveTo(side * r * 0.42, -r * 1.22, side * r * 0.34, -r * 0.74);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    return true;
  }

  if (id === 'gon') {
    // Towering Vertical Jet-Black Hair Spikes!
    const tall = form.powerLevel >= 3 ? 2.15 : 1.58;
    ctx.fillStyle = '#09090b';
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-r * 0.86, -r * 0.34);
    ctx.lineTo(-r * 0.74, -r * (tall * 0.82));
    ctx.lineTo(-r * 0.34, -r * (tall * 0.65));
    ctx.lineTo(0, -r * tall);
    ctx.lineTo(r * 0.34, -r * (tall * 0.65));
    ctx.lineTo(r * 0.74, -r * (tall * 0.82));
    ctx.lineTo(r * 0.86, -r * 0.34);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return true;
  }

  if (id === 'beerus') {
    // Tall Pointed Purple Sphynx Cat Ears!
    ctx.fillStyle = '#a855f7';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * r * 0.32, -r * 0.84);
      ctx.lineTo(side * r * 0.72, -r * 1.72);
      ctx.lineTo(side * r * 0.88, -r * 0.56);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f9a8d4';
      ctx.beginPath();
      ctx.moveTo(side * r * 0.46, -r * 0.82);
      ctx.lineTo(side * r * 0.68, -r * 1.46);
      ctx.lineTo(side * r * 0.76, -r * 0.68);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#a855f7';
    }
    ctx.restore();
    return true;
  }

  if (id === 'cell') {
    // Perfect Cell Twin Tall Black-Green Crown Crest + Central Gem!
    ctx.fillStyle = '#09090b';
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * r * 0.16, -r * 0.88);
      ctx.lineTo(side * r * 0.58, -r * 1.66);
      ctx.lineTo(side * r * 0.92, -r * 0.64);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(0, -r * 0.76, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return true;
  }

  if (id === 'ulquiorra') {
    // Dark messy hair + Broken White Hollow Half-Helmet with Curved Horn!
    drawPartedHair(ctx, r, '#09090b', '#09090b');
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.56, r * 0.72, Math.PI * 1.05, Math.PI * 1.75);
    ctx.lineTo(-r * 0.88, -r * 0.52);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Single broken white horn
    ctx.beginPath();
    ctx.moveTo(-r * 0.62, -r * 0.96);
    ctx.lineTo(-r * 1.12, -r * 1.46);
    ctx.lineTo(-r * 0.38, -r * 1.06);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return true;
  }

  if (id === 'byakuya') {
    // Straight Black Hair + 2 White Kenseikan Hairpin Combs!
    drawPartedHair(ctx, r, '#09090b', '#09090b');
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.6;
    ctx.fillRect(-r * 0.44, -r * 1.18, r * 0.24, r * 0.34);
    ctx.strokeRect(-r * 0.44, -r * 1.18, r * 0.24, r * 0.34);
    ctx.fillRect(r * 0.2, -r * 1.18, r * 0.24, r * 0.34);
    ctx.strokeRect(r * 0.2, -r * 1.18, r * 0.24, r * 0.34);
    ctx.restore();
    return true;
  }

  if (id === 'tengen') {
    // Jeweled Silver Shinobi Headband with Hanging Gem Chains!
    drawSweptBackHair(ctx, r, '#f8fafc');
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.8;
    ctx.fillRect(-r * 0.92, -r * 0.68, r * 1.84, r * 0.28);
    ctx.strokeRect(-r * 0.92, -r * 0.68, r * 1.84, r * 0.28);
    ctx.fillStyle = '#ec4899';
    for (const gx of [-r * 0.56, 0, r * 0.56]) {
      ctx.beginPath();
      ctx.arc(gx, -r * 0.54, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return true;
  }

  if (id === 'rengoku') {
    // Golden Flame Hair with Crimson Tips!
    drawSharpSpikes(ctx, r, '#facc15', 7, 0.52);
    ctx.fillStyle = '#dc2626';
    for (let i = 0; i < 7; i++) {
      const a = Math.PI + ((i + 0.5) / 7) * Math.PI;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 1.44, Math.sin(a) * r * 1.44, 3.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return true;
  }

  if (id === 'meruem') {
    // Dark-Green Chimera King Turtle-Shell Carapace Helmet
    ctx.fillStyle = '#065f46';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -r * 0.34, r * 1.02, Math.PI * 1.04, Math.PI * 1.96);
    ctx.quadraticCurveTo(0, -r * 0.56, -r * 1.0, -r * 0.34);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return true;
  }

  if (id === 'bakugo') {
    // Explosive Jagged Ash-Blonde Spikes + Black-Orange Hero Mask Fins
    drawSharpSpikes(ctx, r, '#fde68a', 9, 0.56);
    ctx.fillStyle = '#f97316';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.6;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * r * 0.85, -r * 0.35);
      ctx.lineTo(side * r * 1.45, -r * 0.62);
      ctx.lineTo(side * r * 1.05, -r * 0.08);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    return true;
  }

  if (id === 'todoroki') {
    drawPartedHair(ctx, r, '#f8fafc', '#dc2626');
    ctx.restore();
    return true;
  }

  if (id === 'rukia' || id === 'nobara' || id === 'guy') {
    drawBobHair(ctx, r, hair);
    if (id === 'rukia') {
      // Single curved front strand down center of forehead
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.72);
      ctx.quadraticCurveTo(r * 0.14, -r * 0.38, -r * 0.04, -r * 0.16);
      ctx.stroke();
    }
    ctx.restore();
    return true;
  }

  if (id === 'hisoka' || id === 'gilgamesh' || id === 'katakuri' || id === 'todo') {
    drawSweptBackHair(ctx, r, hair);
    ctx.restore();
    return true;
  }

  if (id === 'aokiji') {
    // Curly Black Hair + Green Sleeping Mask pushed onto Forehead!
    drawPartedHair(ctx, r, '#09090b', '#09090b');
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-r * 0.72, -r * 0.9, r * 1.44, r * 0.34, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return true;
  }

  if (
    id === 'kokushibo' ||
    id === 'broly' ||
    id === 'gohan' ||
    id === 'toshiro' ||
    id === 'kenpachi'
  ) {
    drawSharpSpikes(ctx, r, hair, id === 'gohan' ? 5 : 8, id === 'gohan' ? 0.62 : 0.48);
    ctx.restore();
    return true;
  }

  if (
    id === 'yuji' ||
    id === 'akaza' ||
    id === 'doflamingo' ||
    id === 'giyu' ||
    id === 'mahito' ||
    id === 'shigaraki' ||
    id === 'geto' ||
    id === 'maki' ||
    id === 'nanami' ||
    id === 'yhwach' ||
    id === 'kizaru'
  ) {
    if (id === 'yuji' || id === 'akaza' || id === 'doflamingo') {
      drawSharpSpikes(ctx, r, hair, 7, 0.38);
      if (id === 'doflamingo') {
        // Signature sharp winged pink flamingo sunglasses
        ctx.fillStyle = '#ec4899';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(side * r * 0.08, -r * 0.12);
          ctx.lineTo(side * r * 0.78, -r * 0.34);
          ctx.lineTo(side * r * 0.62, r * 0.08);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
    } else {
      drawPartedHair(ctx, r, hair, hair);
    }
    ctx.restore();
    return true;
  }

  // --- ANTI-DUPLICATE PROCEDURAL VARIETY FOR ALL OTHER EXPANSION CHARACTERS ---
  // Skip hair for bald/helmet/Minecraft mob entries
  if (
    char.accessory === 'mc-mob' ||
    id === 'frieza' ||
    id === 'jiren' ||
    id === 'buu' ||
    id === 'kirby' ||
    id === 'leesin'
  ) {
    ctx.restore();
    return false;
  }

  const styleIdx = hashId(id) % 4;
  if (styleIdx === 0) {
    drawPartedHair(ctx, r, hair, hair);
  } else if (styleIdx === 1) {
    drawBobHair(ctx, r, hair);
  } else if (styleIdx === 2) {
    drawSweptBackHair(ctx, r, hair);
  } else {
    drawSharpSpikes(ctx, r, hair, 5 + (hashId(id) % 4), 0.34 + (hashId(id) % 3) * 0.08);
  }

  ctx.restore();
  // Return false only if character still needs specific hat/headband/horn overlay from drawExpansionHairAndAccessory
  const needsHat =
    char.accessory === 'cowboy-hat' ||
    char.accessory === 'fur-cap' ||
    char.accessory === 'top-hat' ||
    char.accessory === 'jotaro-cap' ||
    char.accessory === 'mario-cap' ||
    char.accessory === 'ninja-headband' ||
    char.accessory === 'sunglasses-pink';
  return !needsHat;
}

/**
 * Draws iconic outerwear, faction coats, wings, and collars outside the ball sphere for 35+ major expansion characters!
 * Returns `true` when handled (preventing the generic identical trapezoid coat!).
 */
export function drawBespokeOuterOutfit(
  ctx: CanvasRenderingContext2D,
  char: CharacterConfig,
  _form: FormConfig,
  r: number,
  flutter: number,
): boolean {
  const id = char.id;
  ctx.save();

  // 0. Mahoraga: Ivory-white Shikigami Muscular Shoulders + Black-and-Gold Sacred Loincloth Sash!
  if (id === 'mahoraga') {
    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.98, r * 0.56);
    ctx.quadraticCurveTo(0, r * 0.88, r * 0.98, r * 0.56);
    ctx.lineTo(r * 0.86, r * 1.18 + flutter * 0.35);
    ctx.lineTo(-r * 0.86, r * 1.18 - flutter * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Black sacred loincloth waist wrap + gold trim
    ctx.fillStyle = '#18181b';
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-r * 0.72, r * 0.86, r * 1.44, r * 0.34, 5);
    ctx.fill();
    ctx.stroke();

    // Central golden knot emblem
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, r * 1.02, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return true;
  }

  // 1. Marine Admirals (Akainu, Kizaru, Aokiji): White Justice Coat + Gold Epaulettes + Colored Suit!
  if (id === 'akainu' || id === 'kizaru' || id === 'aokiji') {
    const suitCol = id === 'akainu' ? '#b91c1c' : id === 'kizaru' ? '#eab308' : '#1e3a8a';
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 1.06, r * 0.42);
    ctx.lineTo(-r * 1.24, r * 1.4 + flutter);
    ctx.lineTo(r * 1.24, r * 1.4 - flutter);
    ctx.lineTo(r * 1.06, r * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = suitCol;
    ctx.fillRect(-r * 0.46, r * 0.72, r * 0.92, r * 0.56);

    ctx.fillStyle = '#facc15';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(side * r * 0.92, r * 0.54, r * 0.3, r * 0.14, side * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    return true;
  }

  // 2. Doflamingo: Fluffy Pink Flamingo Feather Coat!
  if (id === 'doflamingo') {
    ctx.fillStyle = '#ec4899';
    ctx.strokeStyle = '#9d174d';
    ctx.lineWidth = 2;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(i * r * 0.34, r * 0.92 + Math.abs(i) * 2 + flutter * 0.5, r * 0.34, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    return true;
  }

  // 3. Shinigami Captains (Byakuya, Toshiro, Kenpachi, Yamamoto, Aizen): White Captain Haori!
  if (
    id === 'byakuya' ||
    id === 'toshiro' ||
    id === 'kenpachi' ||
    id === 'yamamoto' ||
    id === 'aizen'
  ) {
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.96, r * 0.54);
    ctx.lineTo(-r * 1.14, r * 1.38 + flutter);
    ctx.lineTo(r * 1.14, r * 1.38 - flutter);
    ctx.lineTo(r * 0.96, r * 0.54);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner black shihakusho V-collar
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.moveTo(-r * 0.42, r * 0.68);
    ctx.lineTo(0, r * 1.18);
    ctx.lineTo(r * 0.42, r * 0.68);
    ctx.closePath();
    ctx.fill();

    // Byakuya silver-white scarf / Toshiro turquoise chain sash
    if (id === 'byakuya' || id === 'toshiro') {
      ctx.fillStyle = id === 'byakuya' ? '#e2e8f0' : '#2dd4bf';
      ctx.fillRect(-r * 0.62, r * 0.72, r * 1.24, r * 0.2);
      ctx.strokeRect(-r * 0.62, r * 0.72, r * 1.24, r * 0.2);
    }
    ctx.restore();
    return true;
  }

  // 4. Ulquiorra: White Arrancar High-Collar Coat + Dark Bat Demon Wings!
  if (id === 'ulquiorra') {
    ctx.fillStyle = '#09090b';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * r * 0.45, r * 0.15);
      ctx.lineTo(side * r * 1.65, -r * 0.35 + flutter);
      ctx.lineTo(side * r * 1.42, r * 0.65 + flutter);
      ctx.lineTo(side * r * 0.65, r * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#09090b';
    ctx.beginPath();
    ctx.moveTo(-r * 0.9, r * 0.55);
    ctx.lineTo(-r * 0.95, r * 1.3);
    ctx.lineTo(r * 0.95, r * 1.3);
    ctx.lineTo(r * 0.9, r * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return true;
  }

  // 5. Giyu Split Haori (Half Burgundy / Half Geometric Gold-Green)!
  if (id === 'giyu') {
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#881337';
    ctx.beginPath();
    ctx.moveTo(-r * 0.95, r * 0.56);
    ctx.lineTo(-r * 1.12, r * 1.36 + flutter);
    ctx.lineTo(0, r * 1.36);
    ctx.lineTo(0, r * 0.56);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(0, r * 0.56);
    ctx.lineTo(0, r * 1.36);
    ctx.lineTo(r * 1.12, r * 1.36 - flutter);
    ctx.lineTo(r * 0.95, r * 0.56);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return true;
  }

  // 6. Rengoku Flame-Hem White Haori / Zenitsu Gold-Triangle Haori
  if (id === 'rengoku' || id === 'zenitsu') {
    ctx.fillStyle = id === 'rengoku' ? '#f8fafc' : '#facc15';
    ctx.strokeStyle = id === 'rengoku' ? '#dc2626' : '#f97316';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.96, r * 0.52);
    ctx.lineTo(-r * 1.18, r * 1.4 + flutter);
    ctx.lineTo(r * 1.18, r * 1.4 - flutter);
    ctx.lineTo(r * 0.96, r * 0.52);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return true;
  }

  // 7. Beerus Egyptian Gold-Blue Striped God Collar / Cell Beetle Wings / Broly Green Ba Pelt
  if (id === 'beerus') {
    ctx.fillStyle = '#1d4ed8';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.88, r * 1.05, r * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return true;
  }

  if (id === 'cell') {
    ctx.fillStyle = '#09090b';
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(
        side * r * 1.1,
        r * 0.72 + flutter * 0.5,
        r * 0.34,
        r * 0.78,
        side * -0.45,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    return true;
  }

  if (id === 'broly') {
    ctx.fillStyle = '#22c55e';
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.96, r * 1.04, r * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return true;
  }

  // 8. Yuji Red Hoodie over Dark Uniform / Nanami Tan Suit + Yellow Tie / Geto Gold Kesa
  if (id === 'yuji') {
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-r * 0.88, r * 0.62, r * 1.76, r * 0.64, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.74, r * 0.76, r * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return true;
  }

  if (id === 'allmight' || id === 'bakugo') {
    ctx.fillStyle = id === 'allmight' ? '#2563eb' : '#09090b';
    ctx.strokeStyle = id === 'allmight' ? '#facc15' : '#f97316';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-r * 0.96, r * 0.62, r * 1.92, r * 0.68, 8);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = id === 'allmight' ? '#dc2626' : '#f97316';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-r * 0.56, r * 0.68);
    ctx.lineTo(r * 0.56, r * 1.24);
    ctx.moveTo(r * 0.56, r * 0.68);
    ctx.lineTo(-r * 0.56, r * 1.24);
    ctx.stroke();
    ctx.restore();
    return true;
  }

  ctx.restore();
  return false;
}

/**
 * Draws iconic held weapons extending outside the ball for major expansion fighters.
 * Returns `true` when a bespoke weapon is drawn.
 */
export function drawBespokeOuterWeapon(
  ctx: CanvasRenderingContext2D,
  char: CharacterConfig,
  _form: FormConfig,
  r: number,
  lunge: number,
  t: number,
): boolean {
  const id = char.id;

  // 0. MAHORAGA: Golden Sword of Extermination strapped to forearm!
  if (id === 'mahoraga') {
    ctx.save();
    // Arm cuff band
    ctx.fillStyle = '#18181b';
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(r - 2 + lunge, -2, 12, 14, 3);
    ctx.fill();
    ctx.stroke();

    // Curved golden positive-energy blade
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 8 + Math.sin(t * 14) * 3;
    ctx.beginPath();
    ctx.moveTo(r + 8 + lunge, 1);
    ctx.quadraticCurveTo(r + 32 + lunge, -5, r + 52 + lunge, 3);
    ctx.quadraticCurveTo(r + 30 + lunge, 12, r + 8 + lunge, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Ornate circular gold knuckle ring
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(r + 10 + lunge, 5, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return true;
  }

  // 1. MIHAWK: Giant Ornate Black Crossblade YORU!
  if (id === 'mihawk') {
    ctx.fillStyle = '#09090b';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(r + 6 + lunge, 1);
    ctx.lineTo(r + 54 + lunge, 2);
    ctx.lineTo(r + 62 + lunge, 6);
    ctx.lineTo(r + 54 + lunge, 10);
    ctx.lineTo(r + 6 + lunge, 11);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Ornate Gold Crucifix Crossguard
    ctx.fillStyle = '#eab308';
    ctx.fillRect(r + 2 + lunge, -12, 6, 36);
    ctx.strokeRect(r + 2 + lunge, -12, 6, 36);
    return true;
  }

  // 2. BAKUGO: Giant Green-Orange Grenade Gauntlets!
  if (id === 'bakugo') {
    ctx.fillStyle = '#15803d';
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(r + 2 + lunge, -6, 22, 22, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(r + 26 + lunge, 5, 5 + Math.sin(t * 20) * 1.5, 0, Math.PI * 2);
    ctx.fill();
    return true;
  }

  // 3. NOBARA: Hammer + Floating Iron Nails!
  if (id === 'nobara') {
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(r + 2 + lunge, 6);
    ctx.lineTo(r + 28 + lunge, 6);
    ctx.stroke();
    ctx.fillStyle = '#334155';
    ctx.fillRect(r + 24 + lunge, -4, 9, 20);
    ctx.fillStyle = '#f97316';
    for (const ny of [-8, 0, 14]) {
      ctx.fillRect(r + 36 + lunge, ny, 9, 2.5);
    }
    return true;
  }

  // 4. NANAMI: Cloth-Wrapped Dotted Blunt Cleaver!
  if (id === 'nanami') {
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.8;
    ctx.fillRect(r + 6 + lunge, 0, 34, 11);
    ctx.strokeRect(r + 6 + lunge, 0, 34, 11);
    ctx.fillStyle = '#eab308';
    for (let x = r + 11 + lunge; x <= r + 35 + lunge; x += 7) {
      ctx.beginPath();
      ctx.arc(x, 5.5, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    return true;
  }

  // 5. URAHARA: Crimson Benihime Cane Sword!
  if (id === 'urahara') {
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#fecaca';
    ctx.lineWidth = 1.6;
    ctx.fillRect(r + 6 + lunge, 3, 38, 5);
    ctx.strokeRect(r + 6 + lunge, 3, 38, 5);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(r + 1 + lunge, 2, 7, 7);
    return true;
  }

  // 6. TENGEN: Chained Dual Giant Nichirin Cleavers!
  if (id === 'tengen') {
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.8;
    for (const yOff of [-8, 10]) {
      ctx.beginPath();
      ctx.moveTo(r + 4 + lunge, yOff);
      ctx.lineTo(r + 36 + lunge, yOff - 2);
      ctx.lineTo(r + 40 + lunge, yOff + 4);
      ctx.lineTo(r + 4 + lunge, yOff + 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    return true;
  }

  // 7. BLACKBEARD: Left Darkness Vortex + Right White Gura Quake Sphere!
  if (id === 'blackbeard') {
    ctx.fillStyle = '#581c87';
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(r + 10 + lunge, -10, 8 + Math.sin(t * 14) * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(248, 250, 252, 0.88)';
    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(r + 10 + lunge, 14, 8 + Math.cos(t * 14) * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    return true;
  }

  // 8. ULQUIORRA: Glowing Emerald Lanza del Relámpago Javelin!
  if (id === 'ulquiorra') {
    ctx.strokeStyle = '#10b981';
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 14;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(r - 4 + lunge, 6);
    ctx.lineTo(r + 48 + lunge, 6);
    ctx.stroke();
    ctx.fillStyle = '#6ee7b7';
    ctx.beginPath();
    ctx.moveTo(r + 42 + lunge, 0);
    ctx.lineTo(r + 56 + lunge, 6);
    ctx.lineTo(r + 42 + lunge, 12);
    ctx.closePath();
    ctx.fill();
    return true;
  }

  // 9. HISOKA: Fan of Glowing Poker Playing Cards!
  if (id === 'hisoka') {
    for (let i = -1; i <= 1; i++) {
      ctx.save();
      ctx.translate(r + 14 + lunge, 6);
      ctx.rotate(i * 0.32);
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 1.6;
      ctx.fillRect(-4, -7, 8, 14);
      ctx.strokeRect(-4, -7, 8, 14);
      ctx.restore();
    }
    return true;
  }

  // 10. KATAKURI: Spiked Trident MOGURA!
  if (id === 'katakuri') {
    ctx.strokeStyle = '#71717a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(r + lunge, 6);
    ctx.lineTo(r + 38 + lunge, 6);
    ctx.stroke();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    for (const dy of [-5, 0, 5]) {
      ctx.beginPath();
      ctx.moveTo(r + 36 + lunge, 6 + dy);
      ctx.lineTo(r + 48 + lunge, 6 + dy);
      ctx.stroke();
    }
    return true;
  }

  // 11. RUKIA: Pure-White Sode no Shirayuki with Flowing White Ribbon!
  if (id === 'rukia') {
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 1.8;
    ctx.fillRect(r + 6 + lunge, 4, 36, 4.5);
    ctx.strokeRect(r + 6 + lunge, 4, 36, 4.5);
    ctx.strokeStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.moveTo(r + 4 + lunge, 6);
    ctx.quadraticCurveTo(r - 8, 14 + Math.sin(t * 8) * 5, r - 18, 8);
    ctx.stroke();
    return true;
  }

  // 12. KOKUSHIBO: Flesh-Eyed Katana Kyokokukamusari!
  if (id === 'kokushibo') {
    ctx.fillStyle = '#7f1d1d';
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1.8;
    ctx.fillRect(r + 6 + lunge, 3, 42, 6);
    ctx.strokeRect(r + 6 + lunge, 3, 42, 6);
    ctx.fillStyle = '#facc15';
    for (const ex of [r + 14 + lunge, r + 24 + lunge, r + 34 + lunge]) {
      ctx.beginPath();
      ctx.arc(ex, 6, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    return true;
  }

  // 13. KIZARU: Blazing Golden Light Sword Ama no Murakumo!
  if (id === 'kizaru') {
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 16;
    ctx.fillRect(r + 6 + lunge, 3, 40, 6);
    return true;
  }

  // 14. AKAINU: Dripping Molten Magma Fist!
  if (id === 'akainu') {
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#facc15';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 14;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(r + 12 + lunge, 6, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    return true;
  }

  // 15. YHWACH: Glowing Blue-Crimson Quincy Heilig Bogen Bow!
  if (id === 'yhwach') {
    ctx.strokeStyle = '#38bdf8';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(r + 10 + lunge, 6, 16, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();
    return true;
  }

  // 16. JOTARO / GIORNO: Manifested Stand Glowing Fist!
  if (id === 'jotaro' || id === 'giorno') {
    ctx.fillStyle = id === 'jotaro' ? '#8b5cf6' : '#facc15';
    ctx.strokeStyle = '#ffffff';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 14;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(r + 13 + lunge, 6, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    return true;
  }

  return false;
}

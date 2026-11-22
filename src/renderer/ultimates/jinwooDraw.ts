import type { JinwooUltimateData } from '../../physics/ultimates/jinwoo';
import type { UltimateRenderer } from './types';

export const jinwooUltimateRenderer: UltimateRenderer = {
  characterId: 'jinwoo',

  drawBackdrop(ctx, state, _bounds, fighters, t) {
    const owner = fighters.find((f) => f.uid === state.ownerUid && f.alive);
    const fade = Math.min(1, (state.duration - state.elapsed) / 0.45);

    // Shadow Monarch Swirling Violet-Black Mist Pool beneath Jinwoo
    if (owner) {
      ctx.save();
      ctx.globalAlpha = 0.65 * fade;
      ctx.translate(owner.x, owner.y);
      const mist = ctx.createRadialGradient(0, 0, owner.radius * 0.4, 0, 0, owner.radius + 46);
      mist.addColorStop(0, 'rgba(88, 28, 135, 0.72)');
      mist.addColorStop(0.6, 'rgba(9, 9, 11, 0.55)');
      mist.addColorStop(1, 'rgba(9, 9, 11, 0)');
      ctx.fillStyle = mist;
      ctx.beginPath();
      ctx.arc(0, 0, owner.radius + 46, 0, Math.PI * 2);
      ctx.fill();

      // Solo Leveling monarch sigil ring
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, owner.radius + 32, t * 2, t * 2 + Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  },

  drawForeground(ctx, state, bounds, _fighters, t) {
    const data = state.data as unknown as JinwooUltimateData;
    const cx = (bounds.left + bounds.right) / 2;

    // 1. Solo Leveling Iconic Blue Holographic [SYSTEM] Notification Popup!
    if (data.systemPopupTimer > 0) {
      const a = Math.max(0, Math.min(1, data.systemPopupTimer / 0.4));
      ctx.save();
      ctx.globalAlpha = a;
      const w = 264;
      const h = 30;
      const sx = cx - w / 2;
      const sy = bounds.top + 66;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.roundRect(sx, sy, w, h, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#bae6fd';
      ctx.font = '800 10.5px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('[SYSTEM] SHADOW EXTRACTION: SUCCESS', cx, sy + h / 2);
      ctx.restore();
    }

    // 2. IGRIS (Blood-Red Knight Commander — Knight Helm, Crimson Plume Crest & Broad Greatsword!)
    const ig = data.igris;
    if (ig.hp > 0) {
      ctx.save();
      ctx.translate(ig.x, ig.y);

      // Flowing Blood-Red Horsehair Plume Crest trailing behind helmet
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(0, -ig.radius * 0.9);
      ctx.quadraticCurveTo(-18, -ig.radius - 16 + Math.sin(t * 14) * 3, -24, -4);
      ctx.quadraticCurveTo(-10, -ig.radius * 0.3, 0, -ig.radius * 0.9);
      ctx.fill();

      // Dark Shadow Knight Armored Body & Visor Slit
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2.4;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, ig.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Glowing violet eyes inside dark knight visor
      ctx.fillStyle = '#e879f9';
      ctx.fillRect(-7, -3, 5, 2.5);
      ctx.fillRect(2, -3, 5, 2.5);

      // Greatsword swing arc
      ctx.strokeStyle = ig.slashAnim > 0 ? '#ef4444' : '#cbd5e1';
      ctx.lineWidth = ig.slashAnim > 0 ? 4.5 : 3;
      ctx.beginPath();
      ctx.moveTo(ig.radius - 2, -6);
      ctx.lineTo(ig.radius + 19, -22 + ig.slashAnim * 45);
      ctx.stroke();

      ctx.fillStyle = '#fca5a5';
      ctx.font = '800 8.5px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('IGRIS', 0, ig.radius + 11);
      ctx.restore();
    }

    // 3. BERU (Ant King Shadow Assassin — Chitin Mandibles, Cyan Glow Eyes & Beating Wings!)
    const be = data.beru;
    if (be.hp > 0) {
      ctx.save();
      ctx.translate(be.x, be.y);

      // Rapidly vibrating translucent violet insect wings!
      const wingSpread = 16 + Math.sin(be.wingPhase) * 7;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.38)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.4;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(side * (be.radius + 6), -6, 12, wingSpread * 0.4, side * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Chitinous Ant King Shadow Skull
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.4;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, be.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Piercing glowing cyan Ant King eyes + serrated mandibles
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.moveTo(-8, -3);
      ctx.lineTo(-2, -1);
      ctx.lineTo(-7, 2);
      ctx.moveTo(8, -3);
      ctx.lineTo(2, -1);
      ctx.lineTo(7, 2);
      ctx.fill();

      ctx.fillStyle = '#67e8f9';
      ctx.font = '800 8.5px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BERU', 0, be.radius + 11);
      ctx.restore();
    }
  },
};

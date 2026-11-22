import { describe, expect, it } from 'vitest';
import { CHARACTER_ROSTER } from '../../characters/roster';
import { getCharacterVfxDNA, resolveSeriesVfxId } from '../vfxIdentity';

describe('Per-Series & Per-Character Unique VFX Identity (336 Characters / 34 Series)', () => {
  it('maps every Anime & Game series in the roster to its own distinct SeriesVfxId', () => {
    const distinctSeries = Array.from(new Set(CHARACTER_ROSTER.map((c) => c.series)));
    const mappedIds = new Set(distinctSeries.map((s) => resolveSeriesVfxId(s)));
    expect(distinctSeries.length).toBeGreaterThanOrEqual(34);
    expect(mappedIds.size).toBe(distinctSeries.length);
  });

  it('assigns a strictly unique CharacterVfxDNA fingerprint to all 336 characters (0 collisions)', () => {
    const seen = new Map<string, string>();
    const collisions: string[] = [];

    for (const ch of CHARACTER_ROSTER) {
      const dna = getCharacterVfxDNA(ch.id, ch.series);
      const prev = seen.get(dna.fingerprint);
      if (prev) {
        collisions.push(`${ch.id} collided with ${prev} (${dna.fingerprint})`);
      } else {
        seen.set(dna.fingerprint, ch.id);
      }
    }

    expect(collisions).toEqual([]);
    expect(seen.size).toBe(CHARACTER_ROSTER.length);
  });

  it('gives every skill of all 336 characters a unique visualMotif tag', () => {
    const motifs = new Set<string>();
    let totalSkills = 0;

    for (const ch of CHARACTER_ROSTER) {
      for (const sk of ch.skills) {
        totalSkills += 1;
        expect(sk.visualMotif).toBeTruthy();
        expect(sk.visualMotif!.startsWith(`${ch.id}:`)).toBe(true);
        motifs.add(sk.visualMotif!);
      }
    }

    expect(totalSkills).toBeGreaterThanOrEqual(336 * 5 - 10);
    expect(motifs.size).toBe(totalSkills);
  });
});

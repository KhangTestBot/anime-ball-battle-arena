import { describe, expect, it } from 'vitest';
import { CHARACTER_ROSTER, getCharacterById } from '../roster';

describe('CHARACTER_ROSTER', () => {
  it('contains 337 unique anime & game characters with distinct signature abilities', () => {
    expect(CHARACTER_ROSTER.length).toBe(337);

    const anime = CHARACTER_ROSTER.filter((c) => c.category === 'anime');
    const games = CHARACTER_ROSTER.filter((c) => c.category === 'game');
    expect(anime.length).toBe(278);
    expect(games.length).toBe(59);

    const ids = new Set(CHARACTER_ROSTER.map((c) => c.id));
    expect(ids.size).toBe(CHARACTER_ROSTER.length);

    const abilities = new Set(CHARACTER_ROSTER.map((c) => c.abilityId));
    expect(abilities.size).toBe(CHARACTER_ROSTER.length);
  });

  it('defines valid forms and triggers for every character', () => {
    for (const char of CHARACTER_ROSTER) {
      expect(char.forms.length).toBeGreaterThanOrEqual(2);
      expect(char.baseStats.radius).toBeGreaterThan(15);
      expect(char.baseStats.abilityCooldown).toBeGreaterThan(1);
      expect(char.skills.length).toBeGreaterThanOrEqual(4);
      expect(char.skills.length).toBeLessThanOrEqual(char.id === 'steve' ? 9 : 5);
      expect(char.ultimate.name.length).toBeGreaterThan(2);
      expect(char.ultimate.voiceLine.length).toBeGreaterThan(2);

      for (let i = 1; i < char.forms.length; i++) {
        const trig = char.forms[i].trigger;
        expect(trig).toBeDefined();
        expect(trig!.timeSec).toBeGreaterThan(0);
        expect(trig!.hpRatioBelow).toBeGreaterThan(0);
        expect(trig!.hpRatioBelow).toBeLessThan(1);
      }
    }
  });

  it('includes signature anime & game icons (Minecraft, League of Legends, Undertale, etc.)', () => {
    expect(getCharacterById('luffy').forms.map((f) => f.name)).toEqual([
      'Gear 1',
      'Gear 2',
      'Gear 3',
      'Gear 4',
      'Gear 5',
    ]);
    expect(getCharacterById('steve').series).toBe('Minecraft');
    expect(getCharacterById('steve').skills.length).toBe(9);
    expect(getCharacterById('steve').skills.some((s) => s.effect === 'summon-dragon')).toBe(true);
    expect(getCharacterById('steve').forms.map((f) => f.name)).toEqual([
      'Wood Gear',
      'Iron Armor',
      'Diamond Gear',
      'Full Netherite',
    ]);
    for (const mcId of [
      'herobrine',
      'entity303',
      'warden',
      'wither',
      'alex',
      'enderman',
      'technoblade',
    ]) {
      const mc = getCharacterById(mcId);
      expect(mc.series).toBe('Minecraft');
      expect(mc.skills.length).toBe(5);
    }
    for (const expId of [
      'shanks',
      'broly',
      'itachi',
      'yuta',
      'rengoku',
      'aizen',
      'jotaro',
      'natsu',
      'saber',
      'edward',
      'meliodas',
      'escanor',
      'gilgamesh',
      'roy',
      'erza',
      'zed',
      'lux',
      'raiden',
      'cloud',
    ]) {
      const ch = getCharacterById(expId);
      expect(ch.id).toBe(expId);
      expect(ch.skills.length).toBe(5);
      expect(ch.forms.length).toBeGreaterThanOrEqual(3);
    }

    // Verify major famous anime series have ~14-20 characters each
    const seriesCount = (seriesName: string) =>
      CHARACTER_ROSTER.filter((c) => c.series === seriesName).length;
    expect(seriesCount('One Piece')).toBeGreaterThanOrEqual(15);
    expect(seriesCount('Dragon Ball')).toBeGreaterThanOrEqual(15);
    expect(seriesCount('Naruto')).toBeGreaterThanOrEqual(15);
    expect(seriesCount('Jujutsu Kaisen')).toBeGreaterThanOrEqual(15);
    expect(seriesCount('Demon Slayer')).toBeGreaterThanOrEqual(15);
    expect(seriesCount('Bleach')).toBeGreaterThanOrEqual(15);
    expect(seriesCount('Fairy Tail')).toBeGreaterThanOrEqual(15);
    expect(seriesCount('Fate')).toBeGreaterThanOrEqual(15);
    expect(seriesCount('Fullmetal Alchemist')).toBeGreaterThanOrEqual(15);
    expect(getCharacterById('yasuo').series).toBe('League of Legends');
    expect(getCharacterById('yasuo').skills.length).toBe(5);
    expect(getCharacterById('yasuo').skills.map((s) => s.key)).toEqual(['Q', 'W', 'E', 'E+Q', 'P']);
    expect(getCharacterById('sans').series).toBe('Undertale');
    const mahoraga = getCharacterById('mahoraga');
    expect(mahoraga.series).toBe('Jujutsu Kaisen');
    expect(mahoraga.skills.length).toBe(5);
    expect(mahoraga.forms.length).toBe(3);
  });
});

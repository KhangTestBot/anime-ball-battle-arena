import { describe, expect, it } from 'vitest';
import { matchFileNameToCharacterId } from '../voiceStore';

describe('RealVoiceStore filename matcher', () => {
  it('matches exact character IDs and popular anime/game voice clip filenames', () => {
    expect(matchFileNameToCharacterId('luffy.mp3')).toBe('luffy');
    expect(matchFileNameToCharacterId('goku-kamehameha.wav')).toBe('goku');
    expect(matchFileNameToCharacterId('gojo_ryoiki_tenkai.mp3')).toBe('gojo');
    expect(matchFileNameToCharacterId('yasuo-hasagi.ogg')).toBe('yasuo');
    expect(matchFileNameToCharacterId('minecraft_tnt.mp3')).toBe('steve');
    expect(matchFileNameToCharacterId('herobrine-white-eyes.mp3')).toBe('herobrine');
    expect(matchFileNameToCharacterId('entity_303_laugh.wav')).toBe('entity303');
    expect(matchFileNameToCharacterId('warden-sonic-boom.ogg')).toBe('warden');
    expect(matchFileNameToCharacterId('wither_storm.mp3')).toBe('wither');
    expect(matchFileNameToCharacterId('technoblade_never_dies.mp3')).toBe('technoblade');
    expect(matchFileNameToCharacterId('shanks_kamusari.mp3')).toBe('shanks');
    expect(matchFileNameToCharacterId('natsu_karyu.mp3')).toBe('natsu');
    expect(matchFileNameToCharacterId('saber_excalibur.mp3')).toBe('saber');
    expect(matchFileNameToCharacterId('edward_elric.mp3')).toBe('edward');
    expect(matchFileNameToCharacterId('meliodas_full_counter.mp3')).toBe('meliodas');
    expect(matchFileNameToCharacterId('zed_shadow.wav')).toBe('zed');
    expect(matchFileNameToCharacterId('raiden_shogun.mp3')).toBe('raiden');
    expect(matchFileNameToCharacterId('sans-megalovania.wav')).toBe('sans');
    expect(matchFileNameToCharacterId('vergil-judgment-cut.mp3')).toBe('vergil');
    expect(matchFileNameToCharacterId('kratos_sparta.m4a')).toBe('kratos');
    expect(matchFileNameToCharacterId('unknown_random_clip.mp3')).toBeNull();
  });
});

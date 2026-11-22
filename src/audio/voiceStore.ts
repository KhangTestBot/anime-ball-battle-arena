import { EXPANSION_VOICE_ALIASES } from '../characters/expansionAliases';
import { CHARACTER_ROSTER } from '../characters/roster';

export interface StoredVoiceMeta {
  characterId: string;
  fileName: string;
  mimeType: string;
  source: 'uploaded' | 'public';
  publicUrl?: string;
}

interface IndexedDbVoiceRow {
  characterId: string;
  fileName: string;
  mimeType: string;
  data: ArrayBuffer;
}

const DB_NAME = 'anime-ball-real-voices-db';
const STORE_NAME = 'voices';
const DB_VERSION = 1;

const ALIAS_MAP: Readonly<Record<string, string[]>> = {
  luffy: ['luffy', 'gear5', 'gear 5', 'gomu', 'bajrang', 'mugiwara'],
  goku: ['goku', 'kakarot', 'kamehameha', 'ultra instinct', 'ssj'],
  naruto: ['naruto', 'rasengan', 'rasenshuriken', 'dattebayo', 'baryon'],
  gojo: ['gojo', 'satoru', 'hollow purple', 'muryokusho', 'unlimited void', 'ryoiki'],
  sukuna: ['sukuna', 'ryomen', 'shrine', 'fukuma', 'cleave', 'dismantle'],
  zoro: ['zoro', 'roronoa', 'santoryu', 'enma', 'ashura'],
  tanjiro: ['tanjiro', 'kamado', 'hinokami', 'kagura'],
  ichigo: ['ichigo', 'kurosaki', 'getsuga', 'bankai', 'mugetsu'],
  saitama: ['saitama', 'one punch', 'serious punch', 'opm'],
  levi: ['levi', 'ackerman', 'rivaille'],
  jinwoo: ['jinwoo', 'sung', 'arise', 'monarch', 'solo leveling'],
  denji: ['denji', 'chainsaw', 'pochita'],
  sasuke: ['sasuke', 'uchiha', 'chidori', 'susanoo', 'indra'],
  vegeta: ['vegeta', 'final flash', 'ultra ego'],
  killua: ['killua', 'zoldyck', 'godspeed'],
  eren: ['eren', 'yeager', 'jaeger', 'rumbling', 'tatakae'],
  madara: ['madara', 'tengai', 'shinsei'],
  deku: ['deku', 'midoriya', 'izuku', 'plus ultra', 'detroit smash', 'blackwhip'],
  rimuru: ['rimuru', 'tempest', 'slime', 'beelzebuth', 'azathoth'],
  asta: ['asta', 'black clover', 'antimagic', 'anti magic'],
  frieren: ['frieren', 'zoltraak'],
  mob: ['mob', 'shigeo', 'kageyama'],
  steve: ['steve', 'minecraft', 'tnt', 'netherite', 'ender dragon'],
  herobrine: ['herobrine', 'hero brine', 'white eyes'],
  entity303: ['entity303', 'entity 303', '303', 'error 303'],
  warden: ['warden', 'deep dark', 'sculk', 'sonic boom'],
  wither: ['wither', 'wither boss', 'wither storm'],
  creeper: ['creeper', 'tsss', 'aw man'],
  yasuo: ['yasuo', 'hasagi', 'sorye', 'wind wall', 'last breath'],
  ahri: ['ahri', 'spirit rush', 'foxfire'],
  jinx: ['jinx', 'powder', 'death rocket', 'get excited'],
  sans: ['sans', 'megalovania', 'gaster', 'bad time', 'undertale'],
  pikachu: ['pikachu', 'pika', 'thunderbolt', 'pokemon'],
  sonic: ['sonic', 'spindash', 'chaos control'],
  vergil: ['vergil', 'yamato', 'judgment cut', 'motivated', 'bury the light'],
  kratos: ['kratos', 'sparta', 'spartan', 'god of war', 'boi'],
  ...EXPANSION_VOICE_ALIASES,
};

/** Match an audio filename (e.g. "yasuo-hasagi.mp3") to a roster character ID */
export function matchFileNameToCharacterId(fileName: string): string | null {
  const clean = fileName
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .trim();
  if (!clean) return null;

  // 1. Exact character ID match first
  const rawBase = fileName
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .trim();
  const tokens = clean.split(/\s+/);
  for (const c of CHARACTER_ROSTER) {
    if (clean === c.id || rawBase === c.id || clean === c.name.toLowerCase()) {
      return c.id;
    }
  }

  // 2. Prefix or token match against character ID (e.g. "zed_shadow.wav" -> first token "zed")
  for (const c of CHARACTER_ROSTER) {
    if (tokens[0] === c.id || rawBase.startsWith(`${c.id}_`) || rawBase.startsWith(`${c.id}-`)) {
      return c.id;
    }
  }

  // 3. Alias / token match (prefer multi-token or character ID match, then longest matching keyword)
  let bestId: string | null = null;
  let bestScore = 0;
  for (const c of CHARACTER_ROSTER) {
    const aliases = ALIAS_MAP[c.id] ?? [c.id, c.name.toLowerCase()];
    for (const alias of aliases) {
      if (clean.includes(alias)) {
        const isDirectIdToken = tokens.includes(c.id) && alias === c.id;
        const score = alias.length + (isDirectIdToken ? 20 : 0);
        if (score > bestScore) {
          bestScore = score;
          bestId = c.id;
        }
      }
    }
  }
  return bestId;
}

export class RealVoiceStore {
  private uploadedBuffers = new Map<string, ArrayBuffer>();
  private publicBuffers = new Map<string, ArrayBuffer>();
  private metaMap = new Map<string, StoredVoiceMeta>();
  private listeners = new Set<() => void>();
  private initialized = false;

  public onChange(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify(): void {
    for (const fn of this.listeners) fn();
  }

  public getMeta(characterId: string): StoredVoiceMeta | null {
    return this.metaMap.get(characterId) ?? null;
  }

  public hasRealVoice(characterId: string): boolean {
    return this.metaMap.has(characterId);
  }

  public getLoadedCount(): number {
    return this.metaMap.size;
  }

  public async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    await Promise.all([this.loadPublicManifest(), this.loadFromIndexedDb()]);
    this.notify();
  }

  /** Fetch an ArrayBuffer copy suitable for AudioContext.decodeAudioData */
  public async getAudioBufferCopy(characterId: string): Promise<ArrayBuffer | null> {
    const uploaded = this.uploadedBuffers.get(characterId);
    if (uploaded) {
      return uploaded.slice(0);
    }

    const cachedPublic = this.publicBuffers.get(characterId);
    if (cachedPublic) {
      return cachedPublic.slice(0);
    }

    const meta = this.metaMap.get(characterId);
    if (meta?.source === 'public' && meta.publicUrl && typeof fetch !== 'undefined') {
      try {
        const res = await fetch(meta.publicUrl);
        if (!res.ok) return null;
        const buf = await res.arrayBuffer();
        this.publicBuffers.set(characterId, buf);
        return buf.slice(0);
      } catch {
        return null;
      }
    }

    return null;
  }

  public async saveVoiceFile(characterId: string, file: File): Promise<void> {
    const data = await file.arrayBuffer();
    const row: IndexedDbVoiceRow = {
      characterId,
      fileName: file.name,
      mimeType: file.type || 'audio/mpeg',
      data,
    };

    this.uploadedBuffers.set(characterId, data);
    this.metaMap.set(characterId, {
      characterId,
      fileName: file.name,
      mimeType: row.mimeType,
      source: 'uploaded',
    });

    await this.putInIndexedDb(row);
    this.notify();
  }

  /** Bulk import multiple local audio files, auto-matching filenames to characters */
  public async importMultipleFiles(
    files: FileList | File[],
  ): Promise<{ matched: string[]; unmatched: string[] }> {
    const matched: string[] = [];
    const unmatched: string[] = [];

    for (const file of Array.from(files)) {
      const charId = matchFileNameToCharacterId(file.name);
      if (charId) {
        await this.saveVoiceFile(charId, file);
        matched.push(`${charId} ← ${file.name}`);
      } else {
        unmatched.push(file.name);
      }
    }

    return { matched, unmatched };
  }

  public async removeUploadedVoice(characterId: string): Promise<void> {
    this.uploadedBuffers.delete(characterId);
    const meta = this.metaMap.get(characterId);
    if (meta?.source === 'uploaded') {
      this.metaMap.delete(characterId);
    }
    await this.deleteFromIndexedDb(characterId);
    // Restore public manifest entry if one exists
    await this.loadPublicManifest();
    this.notify();
  }

  public async clearAllUploaded(): Promise<void> {
    this.uploadedBuffers.clear();
    for (const [id, meta] of this.metaMap.entries()) {
      if (meta.source === 'uploaded') {
        this.metaMap.delete(id);
      }
    }
    await this.clearIndexedDb();
    await this.loadPublicManifest();
    this.notify();
  }

  private async loadPublicManifest(): Promise<void> {
    if (typeof fetch === 'undefined') return;
    try {
      const res = await fetch('./voices/manifest.json', { cache: 'no-store' });
      if (!res.ok) return;
      const json = (await res.json()) as { voices?: Record<string, string> };
      const voices = json?.voices ?? {};
      for (const [rawKey, fileName] of Object.entries(voices)) {
        const charId = matchFileNameToCharacterId(rawKey) ?? rawKey;
        // User-uploaded custom voice takes precedence over public folder file
        if (this.uploadedBuffers.has(charId)) continue;
        this.metaMap.set(charId, {
          characterId: charId,
          fileName,
          mimeType: 'audio/mpeg',
          source: 'public',
          publicUrl: `./voices/${encodeURIComponent(fileName)}`,
        });
      }
    } catch {
      // Manifest absent or offline
    }
  }

  private openDb(): Promise<IDBDatabase | null> {
    if (typeof indexedDB === 'undefined') return Promise.resolve(null);
    return new Promise((resolve) => {
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'characterId' });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  private async loadFromIndexedDb(): Promise<void> {
    const db = await this.openDb();
    if (!db) return;
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const rows = (req.result ?? []) as IndexedDbVoiceRow[];
          for (const row of rows) {
            this.uploadedBuffers.set(row.characterId, row.data);
            this.metaMap.set(row.characterId, {
              characterId: row.characterId,
              fileName: row.fileName,
              mimeType: row.mimeType,
              source: 'uploaded',
            });
          }
          resolve();
        };
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  private async putInIndexedDb(row: IndexedDbVoiceRow): Promise<void> {
    const db = await this.openDb();
    if (!db) return;
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(row);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  private async deleteFromIndexedDb(characterId: string): Promise<void> {
    const db = await this.openDb();
    if (!db) return;
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(characterId);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  private async clearIndexedDb(): Promise<void> {
    const db = await this.openDb();
    if (!db) return;
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
}

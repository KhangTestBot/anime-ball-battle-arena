import type { SoundEngine } from '../audio/sfx';
import { CHARACTER_ROSTER } from '../characters/roster';
import { getCharacterPortraitDataUrl } from '../renderer/characterDraw';

export class VoiceManagerModal {
  private host: HTMLElement;
  private sfx: SoundEngine;
  private onCloseCallback: () => void;
  private statusMessage = '';
  private filterStatus: 'all' | 'loaded' | 'missing' = 'all';

  constructor(host: HTMLElement, sfx: SoundEngine, onClose: () => void) {
    this.host = host;
    this.sfx = sfx;
    this.onCloseCallback = onClose;
  }

  public open(): void {
    this.statusMessage = '';
    this.render();
  }

  public close(): void {
    this.sfx.stopActiveVoice();
    this.host.innerHTML = '';
    this.onCloseCallback();
  }

  private render(): void {
    const store = this.sfx.voiceStore;
    const loadedCount = store.getLoadedCount();
    const total = CHARACTER_ROSTER.length;

    const list = CHARACTER_ROSTER.filter((char) => {
      const has = store.hasRealVoice(char.id);
      if (this.filterStatus === 'loaded') return has;
      if (this.filterStatus === 'missing') return !has;
      return true;
    });

    this.host.innerHTML = `
      <div class="modal-backdrop" data-vm-backdrop="1">
        <div class="modal-card modal-voice" role="dialog" aria-modal="true" aria-label="Real Voice Manager">
          <div class="vm-header">
            <div>
              <div class="summary-kicker">REAL AUDIO (.MP3 · .WAV · .OGG · .M4A)</div>
              <h2 class="modal-title">REAL VOICE MANAGER (${loadedCount}/${total})</h2>
            </div>
            <button type="button" class="btn btn-xs btn-ghost" data-vm-action="close">Close</button>
          </div>

          <div class="vm-dropzone" data-vm-dropzone="1">
            <div class="vm-drop-text">
              <strong>Drag &amp; drop voice files here</strong> or bulk-select — files automatically match by filename
              (e.g. <code>luffy.mp3</code>, <code>goku-kamehameha.mp3</code>, <code>yasuo-hasagi.wav</code>, <code>gojo.mp3</code>) and persist in your browser.
            </div>
            <div class="vm-drop-actions">
              <label class="btn btn-primary btn-xs vm-file-btn">
                Bulk Upload Audio Files
                <input type="file" accept="audio/*" multiple data-vm-bulk="1" hidden />
              </label>
              ${
                loadedCount > 0
                  ? `<button type="button" class="btn btn-xs btn-ghost" data-vm-action="clear-all">Clear Uploaded Files</button>`
                  : ''
              }
            </div>
          </div>

          ${this.statusMessage ? `<div class="vm-status">${this.statusMessage}</div>` : ''}

          <div class="vm-filter-row">
            <div class="segmented segmented-xs">
              <button type="button" class="seg-btn ${this.filterStatus === 'all' ? 'is-active' : ''}" data-vm-filter="all">All (${total})</button>
              <button type="button" class="seg-btn ${this.filterStatus === 'loaded' ? 'is-active' : ''}" data-vm-filter="loaded">Loaded (${loadedCount})</button>
              <button type="button" class="seg-btn ${this.filterStatus === 'missing' ? 'is-active' : ''}" data-vm-filter="missing">Missing (${total - loadedCount})</button>
            </div>
            <span class="vm-folder-hint">Or place files in <code>public/voices/&lt;id&gt;.mp3</code> and run <code>npm run sync-voices</code></span>
          </div>

          <div class="vm-list">
            ${list
              .map((char) => {
                const meta = store.getMeta(char.id);
                const portrait = getCharacterPortraitDataUrl(char, 0, 56);
                const hasVoice = Boolean(meta);
                const statusLabel = meta
                  ? meta.source === 'public'
                    ? `/voices/${meta.fileName}`
                    : meta.fileName
                  : 'No real voice file attached';
                return `
                  <div class="vm-row ${hasVoice ? 'has-voice' : ''}">
                    <img src="${portrait}" alt="${char.name}" width="34" height="34" />
                    <div class="vm-row-info">
                      <div class="vm-row-name">
                        <strong>${char.name}</strong>
                        <span class="vm-row-id">${char.id}.mp3</span>
                        <span class="vm-row-series">${char.series}</span>
                      </div>
                      <div class="vm-row-file ${hasVoice ? 'is-ready' : ''}">${escapeHtml(statusLabel)}</div>
                    </div>
                    <div class="vm-row-actions">
                      <label class="btn btn-xs btn-secondary vm-file-btn">
                        ${hasVoice ? 'Replace' : 'Attach'}
                        <input type="file" accept="audio/*" data-vm-single="${char.id}" hidden />
                      </label>
                      <button type="button" class="btn btn-xs btn-ghost" data-vm-preview="${char.id}" ${hasVoice ? '' : 'disabled'}>
                        Preview
                      </button>
                      ${
                        meta?.source === 'uploaded'
                          ? `<button type="button" class="btn btn-xs btn-ghost" data-vm-remove="${char.id}">Remove</button>`
                          : ''
                      }
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    const root = this.host;

    root.querySelector('[data-vm-backdrop]')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.close();
      }
    });

    root.querySelector('[data-vm-action="close"]')?.addEventListener('click', () => {
      this.close();
    });

    root.querySelectorAll<HTMLElement>('[data-vm-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.filterStatus = btn.dataset.vmFilter as 'all' | 'loaded' | 'missing';
        this.render();
      });
    });

    const handleBulk = async (files: FileList | File[]) => {
      const res = await this.sfx.voiceStore.importMultipleFiles(files);
      const parts: string[] = [];
      if (res.matched.length > 0) {
        parts.push(
          `Attached ${res.matched.length} file(s): ${res.matched.slice(0, 4).join(', ')}${res.matched.length > 4 ? '...' : ''}`,
        );
      }
      if (res.unmatched.length > 0) {
        parts.push(
          `Could not auto-match ${res.unmatched.length} file(s) (${res.unmatched.slice(0, 3).join(', ')}) — please attach manually below.`,
        );
      }
      this.statusMessage = parts.join(' · ');
      this.render();
    };

    root.querySelector<HTMLInputElement>('[data-vm-bulk]')?.addEventListener('change', (e) => {
      const input = e.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        void handleBulk(input.files);
      }
    });

    const dropzone = root.querySelector<HTMLElement>('[data-vm-dropzone]');
    if (dropzone) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('is-dragover');
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('is-dragover');
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('is-dragover');
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
          void handleBulk(e.dataTransfer.files);
        }
      });
    }

    root
      .querySelector<HTMLElement>('[data-vm-action="clear-all"]')
      ?.addEventListener('click', () => {
        void this.sfx.voiceStore.clearAllUploaded().then(() => {
          this.statusMessage = 'Cleared all uploaded voice files.';
          this.render();
        });
      });

    root.querySelectorAll<HTMLInputElement>('[data-vm-single]').forEach((input) => {
      input.addEventListener('change', () => {
        const charId = input.dataset.vmSingle!;
        const file = input.files?.[0];
        if (!file) return;
        void this.sfx.voiceStore.saveVoiceFile(charId, file).then(() => {
          this.statusMessage = `Attached real voice for ${charId}: ${file.name}`;
          this.render();
        });
      });
    });

    root.querySelectorAll<HTMLButtonElement>('[data-vm-preview]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const charId = btn.dataset.vmPreview!;
        this.sfx.unlock();
        void this.sfx.playRealVoiceClip(charId);
      });
    });

    root.querySelectorAll<HTMLButtonElement>('[data-vm-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const charId = btn.dataset.vmRemove!;
        void this.sfx.voiceStore.removeUploadedVoice(charId).then(() => {
          this.statusMessage = `Removed uploaded voice for ${charId}.`;
          this.render();
        });
      });
    });
  }
}

function escapeHtml(val: string): string {
  return val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

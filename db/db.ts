import Dexie, { type Table } from 'dexie';
import type { GameState } from '../types';

export interface GameSave {
  id?: number;
  state: GameState;
}

class RedMicDexie extends Dexie {
  saves!: Table<GameSave, number>; 

  constructor() {
    super('red-mic-v3');
    this.version(1).stores({
      saves: '++id', // Primary key auto-incrementing
    });
  }
}

export const db = new RedMicDexie();

// Clean up old databases to free up significant space
setTimeout(() => {
    Dexie.delete('red-mic-game').catch(() => {});
    Dexie.delete('red-mic-v2').catch(() => {});
    // Clear out old large offline cache items
    localStorage.removeItem('old_gameState');
}, 5000);

export const getActiveSaveId = (): number => {
    const stored = localStorage.getItem('redmic_active_save_id');
    return stored ? parseInt(stored, 10) : 1;
};

export const setActiveSaveId = (id: number): void => {
    localStorage.setItem('redmic_active_save_id', id.toString());
};
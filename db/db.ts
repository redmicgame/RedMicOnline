import Dexie, { type Table } from 'dexie';
import type { GameState } from '../types';

export interface GameSave {
  id?: number;
  state: GameState;
}

class RedMicDexie extends Dexie {
  saves!: Table<GameSave, number>; 

  constructor() {
    super('red-mic-game');
    this.version(1).stores({
      saves: '++id', // Primary key auto-incrementing
    });
  }
}

export const db = new RedMicDexie();

export const getActiveSaveId = (): number => {
    const stored = localStorage.getItem('redmic_active_save_id');
    return stored ? parseInt(stored, 10) : 1;
};

export const setActiveSaveId = (id: number): void => {
    localStorage.setItem('redmic_active_save_id', id.toString());
};
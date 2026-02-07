import Dexie, { type Table } from 'dexie';

// Generic key-value store with LZ-string compression
export interface CompressedRecord {
  key: string;
  value: string; // LZ-compressed JSON string
  updatedAt: number;
}

class StudyTrackerDB extends Dexie {
  compressed!: Table<CompressedRecord, string>;

  constructor() {
    super('study-tracker-db');

    this.version(1).stores({
      // 'key' is the primary key; updatedAt for potential cleanup queries
      compressed: 'key, updatedAt',
    });
  }
}

export const db = new StudyTrackerDB();

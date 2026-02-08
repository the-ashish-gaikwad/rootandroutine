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
    // Hardcoded, stable database name — never changes between builds
    super('StudyAppDB');

    // Version 1: initial schema
    this.version(1).stores({
      compressed: 'key, updatedAt',
    });

    // Future schema changes: add new versions here, never delete the old ones.
    // Example:
    // this.version(2).stores({ compressed: 'key, updatedAt, category' });
  }
}

export const db = new StudyTrackerDB();

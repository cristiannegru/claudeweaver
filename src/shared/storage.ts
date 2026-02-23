// ============================================================
// ClaudeWeaver — Storage Abstraction
// Wraps browser.storage.local with typed CRUD operations.
// Works on both Firefox (browser.*) and Chrome (via polyfill).
// ============================================================

import browser from 'webextension-polyfill';
import type { Thread, Segment, UserSettings, SelectorMap } from './types';
import { STORAGE_KEYS, DEFAULT_SETTINGS, DEFAULT_SELECTORS } from './constants';

// ------- Generic helpers -------

type StorageRecord<T> = Record<string, T>;

async function getRecord<T>(key: string): Promise<StorageRecord<T>> {
  const result = await browser.storage.local.get(key);
  return (result[key] as StorageRecord<T>) ?? {};
}

async function setRecord<T>(key: string, record: StorageRecord<T>): Promise<void> {
  await browser.storage.local.set({ [key]: record });
}

// ------- Thread CRUD -------

export async function getAllThreads(): Promise<Thread[]> {
  const record = await getRecord<Thread>(STORAGE_KEYS.THREADS);
  return Object.values(record);
}

export async function getThread(id: string): Promise<Thread | null> {
  const record = await getRecord<Thread>(STORAGE_KEYS.THREADS);
  return record[id] ?? null;
}

export async function saveThread(thread: Thread): Promise<void> {
  const record = await getRecord<Thread>(STORAGE_KEYS.THREADS);
  record[thread.id] = thread;
  await setRecord(STORAGE_KEYS.THREADS, record);
}

export async function updateThread(id: string, updates: Partial<Thread>): Promise<Thread | null> {
  const record = await getRecord<Thread>(STORAGE_KEYS.THREADS);
  const existing = record[id];
  if (!existing) return null;
  const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
  record[id] = updated;
  await setRecord(STORAGE_KEYS.THREADS, record);
  return updated;
}

export async function deleteThread(id: string): Promise<boolean> {
  const record = await getRecord<Thread>(STORAGE_KEYS.THREADS);
  if (!record[id]) return false;
  delete record[id];
  await setRecord(STORAGE_KEYS.THREADS, record);
  // Also delete all segments for this thread
  const segments = await getRecord<Segment>(STORAGE_KEYS.SEGMENTS);
  const cleaned: StorageRecord<Segment> = {};
  for (const [segId, seg] of Object.entries(segments)) {
    if (seg.thread_id !== id) cleaned[segId] = seg;
  }
  await setRecord(STORAGE_KEYS.SEGMENTS, cleaned);
  return true;
}

// ------- Segment CRUD -------

export async function getAllSegments(): Promise<Segment[]> {
  const record = await getRecord<Segment>(STORAGE_KEYS.SEGMENTS);
  return Object.values(record);
}

export async function getSegment(id: string): Promise<Segment | null> {
  const record = await getRecord<Segment>(STORAGE_KEYS.SEGMENTS);
  return record[id] ?? null;
}

export async function getSegmentsByThread(threadId: string): Promise<Segment[]> {
  const record = await getRecord<Segment>(STORAGE_KEYS.SEGMENTS);
  return Object.values(record)
    .filter(s => s.thread_id === threadId)
    .sort((a, b) => a.sequence - b.sequence);
}

export async function getSegmentByConversationUrl(url: string): Promise<Segment | null> {
  const record = await getRecord<Segment>(STORAGE_KEYS.SEGMENTS);
  return Object.values(record).find(s => s.conversation_url === url) ?? null;
}

export async function saveSegment(segment: Segment): Promise<void> {
  const record = await getRecord<Segment>(STORAGE_KEYS.SEGMENTS);
  record[segment.id] = segment;
  await setRecord(STORAGE_KEYS.SEGMENTS, record);
}

export async function updateSegment(id: string, updates: Partial<Segment>): Promise<Segment | null> {
  const record = await getRecord<Segment>(STORAGE_KEYS.SEGMENTS);
  const existing = record[id];
  if (!existing) return null;
  const updated = { ...existing, ...updates };
  record[id] = updated;
  await setRecord(STORAGE_KEYS.SEGMENTS, record);
  return updated;
}

// ------- Active thread -------

export async function getActiveThreadId(): Promise<string | null> {
  const result = await browser.storage.local.get(STORAGE_KEYS.ACTIVE_THREAD);
  return (result[STORAGE_KEYS.ACTIVE_THREAD] as string) ?? null;
}

export async function setActiveThreadId(threadId: string | null): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEYS.ACTIVE_THREAD]: threadId });
}

// ------- Settings -------

export async function getSettings(): Promise<UserSettings> {
  const result = await browser.storage.local.get(STORAGE_KEYS.SETTINGS);
  const stored = result[STORAGE_KEYS.SETTINGS] as Partial<UserSettings> | undefined;
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function updateSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
  const current = await getSettings();
  const updated = { ...current, ...updates };
  await browser.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated });
  return updated;
}

// ------- Selector config -------

export async function getSelectorConfig(): Promise<SelectorMap> {
  const result = await browser.storage.local.get(STORAGE_KEYS.SELECTOR_CONFIG);
  const stored = result[STORAGE_KEYS.SELECTOR_CONFIG] as Partial<SelectorMap> | undefined;
  return { ...DEFAULT_SELECTORS, ...stored };
}

export async function updateSelectorConfig(updates: Partial<SelectorMap>): Promise<SelectorMap> {
  const current = await getSelectorConfig();
  const updated = { ...current, ...updates };
  await browser.storage.local.set({ [STORAGE_KEYS.SELECTOR_CONFIG]: updated });
  return updated;
}

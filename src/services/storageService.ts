import { ObservationRecord } from '../types';

const STORAGE_KEY = 'ghostqueue_community_observations_v1';

export function getStoredObservations(): ObservationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load observations from localStorage', err);
    return [];
  }
}

export function saveObservation(record: Omit<ObservationRecord, 'id' | 'timestamp'>): ObservationRecord {
  const newRecord: ObservationRecord = {
    ...record,
    id: `obs-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  try {
    const existing = getStoredObservations();
    const updated = [newRecord, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save observation to localStorage', err);
  }

  return newRecord;
}

export function getObservationsForLocation(locationId: string): ObservationRecord[] {
  const all = getStoredObservations();
  return all.filter(o => o.location_id === locationId);
}

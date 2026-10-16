import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncToGoogleSheets } from './sheetsSync';

const SYNC_QUEUE_KEY = 'SYNC_QUEUE';

/**
 * Append a failed payload to the persistent retry queue.
 */
export async function enqueueSync(payload: object): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    const queue: object[] = raw ? JSON.parse(raw) : [];
    queue.push(payload);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Storage failure — drop silently, never block the caller
  }
}

/**
 * Walk the queue and retry each payload with syncToGoogleSheets.
 * Successfully sent items are removed; failed ones stay for the next retry.
 */
export async function retryPendingSync(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    if (!raw) return;

    const queue: object[] = JSON.parse(raw);
    if (queue.length === 0) return;

    const remaining: object[] = [];

    for (const payload of queue) {
      try {
        await syncToGoogleSheets(payload);
        // Success — do not push to remaining
      } catch {
        remaining.push(payload);
      }
    }

    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remaining));
  } catch {
    // If reading/writing queue itself fails, do nothing
  }
}

/**
 * Returns the number of payloads waiting to be retried.
 */
export async function getPendingCount(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    if (!raw) return 0;
    const queue: object[] = JSON.parse(raw);
    return queue.length;
  } catch {
    return 0;
  }
}

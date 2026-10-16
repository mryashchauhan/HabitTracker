import AsyncStorage from '@react-native-async-storage/async-storage';

export const SHEETS_WEBHOOK_URL_KEY = 'SHEETS_WEBHOOK_URL';
export const SHEETS_SYNC_ENABLED_KEY = 'SHEETS_SYNC_ENABLED';
export const LAST_SYNC_TIME_KEY = 'LAST_SYNC_TIME';

/**
 * Fire-and-forget POST to the Google Apps Script webhook.
 * Reads the webhook URL and enabled flag from AsyncStorage on every call
 * so Settings changes take effect immediately without a restart.
 *
 * Throws if:
 *   - fetch itself fails (network error)
 *   - response.ok is false
 *
 * Returns silently if sync is disabled or webhook URL is empty.
 */
export async function syncToGoogleSheets(payload: object): Promise<void> {
  const [urlRaw, enabledRaw] = await AsyncStorage.multiGet([
    SHEETS_WEBHOOK_URL_KEY,
    SHEETS_SYNC_ENABLED_KEY,
  ]);

  const webhookUrl = urlRaw[1] ?? '';
  const syncEnabled = enabledRaw[1] === 'true';

  if (!syncEnabled || !webhookUrl.trim()) return;

  const response = await fetch(webhookUrl.trim(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Sheets sync failed: HTTP ${response.status}`);
  }
}

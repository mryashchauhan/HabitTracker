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

  const webhookUrl = (urlRaw[1] ?? '').trim();
  const syncEnabled = enabledRaw[1] === 'true';

  // Hardened validation: Must be enabled and must be a secure Google Apps Script webhook
  if (!syncEnabled || !webhookUrl.startsWith('https://script.google.com/macros/s/')) {
    return;
  }

  // 10-second fetch timeout to prevent hanging network calls
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Sheets sync failed: HTTP ${response.status}`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

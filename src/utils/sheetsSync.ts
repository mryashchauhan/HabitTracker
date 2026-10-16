import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitLog, AppSettings, FrequencyType, HabitType } from '../types';

export const SHEETS_WEBHOOK_URL_KEY = 'SHEETS_WEBHOOK_URL';
export const SHEETS_SYNC_ENABLED_KEY = 'SHEETS_SYNC_ENABLED';
export const LAST_SYNC_TIME_KEY = 'LAST_SYNC_TIME';

export function isValidWebhookUrl(url: string): boolean {
  return url.trim().startsWith('https://script.google.com/macros/s/');
}

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
  if (!syncEnabled || !isValidWebhookUrl(webhookUrl)) {
    return;
  }

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

/**
 * Explicitly pushes a full snapshot of all habits, logs, and settings to the Google Sheet.
 * Used when the user taps "Sync & Backup Now" in Settings so that even habits created
 * before connecting the Sheet are backed up completely.
 */
export async function pushFullBackupToSheets(
  habits: Habit[],
  logs: HabitLog[],
  settings: AppSettings
): Promise<void> {
  const urlRaw = await AsyncStorage.getItem(SHEETS_WEBHOOK_URL_KEY);
  const webhookUrl = (urlRaw ?? '').trim();

  if (!isValidWebhookUrl(webhookUrl)) {
    throw new Error('Please enter a valid Google Apps Script Webhook URL first.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'full_backup',
        habits,
        logs,
        settings,
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Backup failed with status ${response.status}`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

export interface RestoredSheetData {
  habits: Habit[];
  logs: HabitLog[];
  settings?: Partial<AppSettings>;
}

/**
 * Normalizes raw data returned from Google Apps Script into valid Habit[] and HabitLog[].
 * Supports both full JSON snapshots and legacy row-based sheet responses.
 */
function normalizeRestoredPayload(raw: any): RestoredSheetData {
  const payload = raw?.data ?? raw;
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid response from Google Sheets webhook.');
  }

  const rawHabits: any[] = Array.isArray(payload.habits) ? payload.habits : [];
  const rawLogs: any[] = Array.isArray(payload.logs)
    ? payload.logs
    : Array.isArray(payload.entries)
    ? payload.entries
    : [];

  const habits: Habit[] = rawHabits
    .map((h: any, idx: number): Habit | null => {
      if (!h) return null;
      const id = String(h.id ?? h.habitId ?? `h_restored_${idx}`);
      const name = String(h.name ?? h.habitName ?? '').trim();
      if (!name) return null;

      const type: HabitType =
        h.type === 'count' || h.type === 'timed' ? h.type : 'boolean';

      const freqType: FrequencyType =
        typeof h.frequency === 'object' && h.frequency?.type
          ? h.frequency.type
          : h.frequency === 'weekdays' || h.frequency === 'x_per_week' || h.frequency === 'custom'
          ? h.frequency
          : 'daily';

      return {
        id,
        name,
        icon: h.icon || '🔥',
        color: h.color || '#F6955D',
        category: h.category || 'custom',
        type,
        frequency:
          typeof h.frequency === 'object' && h.frequency
            ? h.frequency
            : { type: freqType },
        targetCount:
          h.targetCount !== undefined
            ? Number(h.targetCount)
            : type === 'count' && h.target
            ? Number(h.target)
            : undefined,
        targetDuration:
          h.targetDuration !== undefined
            ? Number(h.targetDuration)
            : type === 'timed' && h.target
            ? Number(h.target)
            : undefined,
        reminder: h.reminder,
        notes: h.notes,
        isPinned: Boolean(h.isPinned),
        isArchived: h.isArchived !== undefined ? Boolean(h.isArchived) : h.status === 'archived',
        createdAt: h.createdAt || h.timestamp || new Date().toISOString(),
        sortOrder: typeof h.sortOrder === 'number' ? h.sortOrder : idx,
      };
    })
    .filter((h): h is Habit => h !== null);

  const logs: HabitLog[] = rawLogs
    .map((l: any, idx: number): HabitLog | null => {
      if (!l) return null;
      const habitId = String(l.habitId ?? '');
      const rawDate = String(l.date ?? '').slice(0, 10);
      if (!habitId || !rawDate) return null;

      const completed =
        l.completed === true ||
        l.completed === 'true' ||
        l.completed === 'TRUE' ||
        l.completed === 1;
      const skipped =
        l.skipped === true ||
        l.skipped === 'true' ||
        l.skipped === 'TRUE' ||
        l.note === 'skipped';

      return {
        id: String(l.id ?? l.entryId ?? `${habitId}_${rawDate}_${idx}`),
        habitId,
        date: rawDate,
        completed,
        value:
          l.value !== undefined && l.value !== null && l.value !== ''
            ? Number(l.value)
            : l.count !== undefined && l.count !== null && l.count !== ''
            ? Number(l.count)
            : undefined,
        skipped,
        note: l.note && l.note !== 'skipped' ? String(l.note) : undefined,
        loggedAt: l.loggedAt || l.timestamp || new Date().toISOString(),
      };
    })
    .filter((l): l is HabitLog => l !== null);

  // If the sheet only had habit_entry rows and no separate habits list, synthesize missing habits
  const knownHabitIds = new Set(habits.map((h) => h.id));
  rawLogs.forEach((l: any) => {
    const hId = String(l?.habitId ?? '');
    const hName = String(l?.habitName ?? '').trim();
    if (hId && hName && !knownHabitIds.has(hId)) {
      knownHabitIds.add(hId);
      habits.push({
        id: hId,
        name: hName,
        icon: '🔥',
        color: '#F6955D',
        category: 'custom',
        type: 'boolean',
        frequency: { type: 'daily' },
        isPinned: false,
        isArchived: false,
        createdAt: new Date().toISOString(),
        sortOrder: habits.length,
      });
    }
  });

  return {
    habits,
    logs,
    settings: payload.settings,
  };
}

/**
 * Pulls backed-up habits and logs from the user's Google Apps Script webhook.
 * Tries GET ?action=restore first, then falls back to POST { eventType: 'restore' }.
 */
export async function restoreFromGoogleSheets(): Promise<RestoredSheetData> {
  const urlRaw = await AsyncStorage.getItem(SHEETS_WEBHOOK_URL_KEY);
  const webhookUrl = (urlRaw ?? '').trim();

  if (!isValidWebhookUrl(webhookUrl)) {
    throw new Error('Please enter a valid Google Apps Script Webhook URL first.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    // 1. Try GET ?action=restore
    const sep = webhookUrl.includes('?') ? '&' : '?';
    const getRes = await fetch(`${webhookUrl}${sep}action=restore`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (getRes.ok) {
      const text = await getRes.text();
      try {
        const parsed = JSON.parse(text);
        if (parsed && (Array.isArray(parsed.habits) || Array.isArray(parsed.logs) || parsed.data)) {
          return normalizeRestoredPayload(parsed);
        }
      } catch {
        // Fall through to POST if GET returned HTML or non-JSON
      }
    }

    // 2. Fallback: POST { eventType: 'restore' }
    const postRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'restore' }),
      signal: controller.signal,
    });

    if (!postRes.ok) {
      throw new Error(`Restore failed: HTTP ${postRes.status}`);
    }

    const postJson = await postRes.json();
    return normalizeRestoredPayload(postJson);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Ready-to-paste Google Apps Script for the user's Google Sheet.
 * Supports:
 *   1. Real-time human-readable "Habits" and "Logs" sheets
 *   2. Full lossless JSON snapshot in "_AppBackup" sheet
 *   3. 1-Click Restore via GET (?action=restore) or POST (eventType: "restore")
 *      (Reconstructs from "Habits" & "Logs" tabs automatically if "_AppBackup" is empty!)
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `// HabitTracker — Two-Way Google Sheets Sync & Backup Script
// 1. Open your Google Sheet -> Extensions -> Apps Script
// 2. Paste this code and click Save
// 3. Click Deploy -> New deployment -> Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 4. Copy the Web App URL into HabitTracker -> Settings -> Webhook URL

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var payload = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (payload.eventType === 'restore') {
      return buildRestoreResponse(ss);
    }

    if (payload.eventType === 'full_backup') {
      var backupSheet = getOrCreateSheet(ss, '_AppBackup', ['UpdatedAt', 'SnapshotJSON']);
      backupSheet.clearContents();
      backupSheet.appendRow(['UpdatedAt', 'SnapshotJSON']);
      backupSheet.appendRow([payload.timestamp || new Date().toISOString(), JSON.stringify({
        habits: payload.habits || [],
        logs: payload.logs || [],
        settings: payload.settings || {}
      })]);
      syncReadableTables(ss, payload.habits || [], payload.logs || []);
      return jsonResponse({ ok: true, mode: 'full_backup' });
    }

    if (payload.eventType === 'habit_created') {
      var hSheet = getOrCreateSheet(ss, 'Habits', [
        'habitId', 'habitName', 'type', 'frequency', 'target', 'unit', 'status', 'timestamp'
      ]);
      hSheet.appendRow([
        payload.habitId, payload.habitName, payload.type, payload.frequency,
        payload.target, payload.unit, payload.status, payload.timestamp
      ]);
      return jsonResponse({ ok: true });
    }

    if (payload.eventType === 'habit_entry') {
      var lSheet = getOrCreateSheet(ss, 'Logs', [
        'entryId', 'habitId', 'habitName', 'date', 'completed', 'count', 'duration', 'note', 'timestamp'
      ]);
      lSheet.appendRow([
        payload.entryId, payload.habitId, payload.habitName, payload.date,
        payload.completed, payload.count, payload.duration, payload.note, payload.timestamp
      ]);
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ ok: true, ignored: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return buildRestoreResponse(ss);
}

function buildRestoreResponse(ss) {
  var backupSheet = ss.getSheetByName('_AppBackup');
  if (backupSheet && backupSheet.getLastRow() >= 2) {
    var rawJson = backupSheet.getRange(2, 2).getValue();
    if (rawJson) {
      return jsonResponse(JSON.parse(rawJson));
    }
  }
  // Fallback: reconstruct from human-readable Habits & Logs sheets
  var habits = readSheetAsObjects(ss.getSheetByName('Habits'));
  var logs = readSheetAsObjects(ss.getSheetByName('Logs') || ss.getSheetByName('Entries'));
  return jsonResponse({ habits: habits, logs: logs });
}

function syncReadableTables(ss, habits, logs) {
  var hSheet = getOrCreateSheet(ss, 'Habits', [
    'habitId', 'habitName', 'type', 'frequency', 'target', 'unit', 'status', 'timestamp'
  ]);
  hSheet.clearContents();
  hSheet.appendRow(['habitId', 'habitName', 'type', 'frequency', 'target', 'unit', 'status', 'timestamp']);
  habits.forEach(function(h) {
    hSheet.appendRow([
      h.id, h.name, h.type, h.frequency && h.frequency.type ? h.frequency.type : 'daily',
      h.targetCount || h.targetDuration || '', h.type === 'timed' ? 'seconds' : h.type === 'count' ? 'count' : '',
      h.isArchived ? 'archived' : 'active', h.createdAt
    ]);
  });

  var nameMap = {};
  habits.forEach(function(h) { nameMap[h.id] = h.name; });

  var lSheet = getOrCreateSheet(ss, 'Logs', [
    'entryId', 'habitId', 'habitName', 'date', 'completed', 'count', 'duration', 'note', 'timestamp'
  ]);
  lSheet.clearContents();
  lSheet.appendRow(['entryId', 'habitId', 'habitName', 'date', 'completed', 'count', 'duration', 'note', 'timestamp']);
  logs.forEach(function(l) {
    lSheet.appendRow([
      l.id, l.habitId, nameMap[l.habitId] || '', l.date,
      l.completed, l.value || '', '', l.skipped ? 'skipped' : (l.note || ''), l.loggedAt
    ]);
  });
}

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length) sheet.appendRow(headers);
  }
  return sheet;
}

function readSheetAsObjects(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var results = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    results.push(obj);
  }
  return results;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

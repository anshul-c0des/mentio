// The time window in milliseconds for the spike (1 minute)
const SHORT_WINDOW_MS = 60 * 1000;
// The longer baseline window (5 minutes)
const LONG_WINDOW_MS = 5 * 60 * 1000;

// The threshold for alerting: e.g., if the short window count is 3x the long-term average
const SPIKE_THRESHOLD_MULTIPLIER = 3;

// A reduced minimum number of mentions for testing
const MIN_MENTIONS_FOR_SPIKE = 5;

// Structure to hold timestamps for all recent mentions
let mentionTimestamps: { timestamp: number }[] = [];

   // Adds a new mention timestamp and cleans up old entries.
export const trackMention = () => {
  const now = Date.now();

  mentionTimestamps.push({ timestamp: now });

  const cutoffTime = now - LONG_WINDOW_MS;
  mentionTimestamps = mentionTimestamps.filter(
    (m) => m.timestamp >= cutoffTime
  );
};

   // Checks for a conversation spike in the last SHORT_WINDOW.
export const checkForSpike = (): boolean => {
  const now = Date.now();
  const shortWindowCutoff = now - SHORT_WINDOW_MS;

  // 1. Calculate short window count
  const shortWindowMentions = mentionTimestamps.filter(
    (m) => m.timestamp >= shortWindowCutoff
  );
  const shortCount = shortWindowMentions.length;

  // 2. Calculate long window count and average rate
  const totalMentions = mentionTimestamps.length;

  // The total duration tracked in Short Window Units (e.g., 5 min / 1 min = 5 units)
  // We use SHORT_WINDOW_MS for calculation to avoid unit conversion errors.
  const totalShortWindowUnits = LONG_WINDOW_MS / SHORT_WINDOW_MS;

  // Calculate the average mentions per short window period (e.g., average per 1 minute)
  const averageRatePerShortWindow = totalMentions / totalShortWindowUnits;

  // Use the new, lower minimum mention requirement for testing
  if (totalMentions < MIN_MENTIONS_FOR_SPIKE) {
    return false;
  }

  // 3. Spike Detection Logic
  if (shortCount > averageRatePerShortWindow * SPIKE_THRESHOLD_MULTIPLIER) {
    console.log(
      `🔥 SPIKE DETECTED! Short Count: ${shortCount}, Baseline Avg: ${averageRatePerShortWindow.toFixed(
        2
      )}`
    );
    return true;
  }

  return false;
};

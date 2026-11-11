import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import memoryQueue from '@opennextjs/cloudflare/overrides/queue/memory-queue';

/**
 * Public pages regenerate every 5 minutes (settings and articles live in the
 * database). R2 keeps the rendered pages; the in-memory queue re-renders a
 * stale one through the Worker itself, which is enough at this traffic.
 * There is no tag cache, so revalidatePath() is a no-op here: an edited
 * setting or a newly published article appears within 5 minutes, not at once.
 */
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: memoryQueue,
});

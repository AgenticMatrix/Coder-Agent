/**
 * concurrency.ts — Parallel tool execution engine
 *
 * partitionToolCalls: groups consecutive concurrency-safe tools into batches,
 * with non-safe tools acting as barriers (each in its own batch).
 *
 * executeConcurrentBatch: runs a batch of tools with bounded parallelism
 * via a dynamic Promise pool.  Results are returned in original order.
 */

import type { ToolUseBlock, ToolResultBlock, ToolProgress } from './types.js';
import type { ToolRegistry } from './tool-registry.js';

// ---------------------------------------------------------------------------
// Partitioning
// ---------------------------------------------------------------------------

/**
 * Split a list of tool_use blocks into batches for execution.
 *
 * Consecutive tools marked `isConcurrencySafe` are grouped into a single
 * batch.  Every non-safe tool becomes its own single-element batch,
 * ensuring it runs in isolation (and acts as a barrier between safe batches).
 *
 * Preserves the original tool order: running batches sequentially produces
 * the same final ordering as running tools one-by-one.
 */
export function partitionToolCalls(
  toolBlocks: ToolUseBlock[],
  toolRegistry: ToolRegistry,
): ToolUseBlock[][] {
  const batches: ToolUseBlock[][] = [];
  let currentBatch: ToolUseBlock[] = [];

  for (const block of toolBlocks) {
    const def = toolRegistry.get(block.name)?.definition;
    const safe = def?.isConcurrencySafe === true;

    if (safe) {
      currentBatch.push(block);
    } else {
      // Flush current safe batch (if any)
      if (currentBatch.length > 0) {
        batches.push(currentBatch);
        currentBatch = [];
      }
      // Barrier: non-safe tool runs alone
      batches.push([block]);
    }
  }

  // Flush trailing safe batch
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
}

// ---------------------------------------------------------------------------
// Concurrent execution
// ---------------------------------------------------------------------------

export interface ConcurrentSlot {
  index: number;
  toolBlock: ToolUseBlock;
  promise: Promise<ToolResultBlock>;
}

/**
 * Run a batch of tools concurrently, with at most `maxConcurrency` in
 * flight at once.  When any tool settles the next pending tool (if any)
 * is started immediately.
 *
 * Each tool is executed in isolation — one failure does not cancel siblings.
 * Results are returned in the original batch order (indexed by position).
 *
 * The `onProgress` callback fires for every running/completed event so
 * callers can yield real-time status updates during execution.
 */
export async function executeConcurrentBatch(
  batch: ToolUseBlock[],
  maxConcurrency: number,
  executeOne: (block: ToolUseBlock) => Promise<ToolResultBlock>,
  signal: AbortSignal,
  onProgress?: (pe: ToolProgress) => void,
): Promise<ToolResultBlock[]> {
  if (batch.length === 0) return [];

  const results: ToolResultBlock[] = new Array(batch.length);
  let nextIndex = 0;

  // Wrap a single tool execution so we can track its index
  async function runSlot(index: number, block: ToolUseBlock): Promise<void> {
    if (signal.aborted) {
      results[index] = {
        type: 'tool_result',
        tool_use_id: block.id,
        content: 'Interrupted by user',
        is_error: true,
      };
      onProgress?.({ toolName: block.name, toolUseId: block.id, status: 'completed', is_error: true, message: 'Interrupted' });
      return;
    }

    try {
      const result = await executeOne(block);
      results[index] = result;
      onProgress?.({
        toolName: block.name,
        toolUseId: block.id,
        status: 'completed',
        is_error: result.is_error,
        message: result.is_error
          ? `Error: ${String(result.content)}`
          : String(result.content).slice(0, 500),
      });
    } catch (err) {
      results[index] = {
        type: 'tool_result',
        tool_use_id: block.id,
        content: err instanceof Error ? err.message : String(err),
        is_error: true,
      };
      onProgress?.({
        toolName: block.name,
        toolUseId: block.id,
        status: 'completed',
        is_error: true,
        message: `Error: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  // Dynamic pool: keep up to maxConcurrency slots running
  const running = new Set<Promise<void>>();

  while (nextIndex < batch.length || running.size > 0) {
    // Fill available slots
    while (running.size < maxConcurrency && nextIndex < batch.length) {
      const idx = nextIndex++;
      const p = runSlot(idx, batch[idx]!);
      running.add(p);
      // Auto-remove from set when done
      p.finally(() => running.delete(p));
    }

    if (running.size === 0) break;

    // Wait for any slot to settle before filling more
    await Promise.race(running);
  }

  return results;
}

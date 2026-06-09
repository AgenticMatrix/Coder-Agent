/**
 * Module-level store for the pending approval request.
 *
 * The agent bridge writes the DeferredPermission here when a
 * permission_required event fires, then awaits its promise.  The
 * ApprovalPrompt component reads the approval info for display
 * and calls resolve(true/false) when the user makes a choice.
 */
import type { DeferredPermission } from '../../core/types.js';

export interface PendingApproval {
  toolName: string;
  command: string;
  description: string;
  toolUseId: string;
  deferred: DeferredPermission;
}

let current: PendingApproval | null = null;

export function getPendingApproval(): PendingApproval | null {
  return current;
}

export function setPendingApproval(approval: PendingApproval | null): void {
  current = approval;
}

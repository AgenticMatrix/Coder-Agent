/**
 * NoSelect compat stub — Phase 2
 *
 * Marks a region as non-selectable and forwards mouse events via the
 * shared MouseProvider context.  Renders children wrapped in a dimmed
 * Text element.  Full text-selection exclusion deferred to later phases.
 */
import React, { useEffect, useRef } from 'react';
import { Text } from 'ink';
import {
  useMouseTracker,
  createMouseHandler,
  type MouseCallbacks,
} from './mouse-tracker.js';

export interface NoSelectProps {
  children?: React.ReactNode;
  /** When set, excludes from left edge to the right boundary (Phase 2: marker only) */
  from?: 'left-edge';
  /** CA extension: click handler — fires on mouse release near the press position */
  onClick?: (...args: any[]) => void;
  /** CA extension: mouse button press */
  onMouseDown?: (...args: any[]) => void;
  /** CA extension: mouse button release */
  onMouseUp?: (...args: any[]) => void;
  /** Additional props forwarded to the underlying Text element */
  [key: string]: unknown;
}

/**
 * NoSelect component — renders children in a dimmed Text wrapper and
 * dispatches mouse events via the MouseProvider context.
 *
 * The `from="left-edge"` marker is accepted but has no rendering effect
 * in Phase 2 — it exists for future text-selection-exclusion logic.
 */
export function NoSelect({
  children,
  onClick,
  onMouseDown,
  onMouseUp,
  from,
  ...rest
}: NoSelectProps): React.ReactElement {
  // Mouse event registration via the shared MouseProvider context
  const tracker = useMouseTracker();
  const callbacksRef = useRef<MouseCallbacks>({});

  // Keep ref in sync without re-registering
  callbacksRef.current = {
    onClick: onClick as MouseCallbacks['onClick'] | undefined,
    onMouseDown: onMouseDown as MouseCallbacks['onMouseDown'] | undefined,
    onMouseUp: onMouseUp as MouseCallbacks['onMouseUp'] | undefined,
  };

  useEffect(() => {
    const cleanup = createMouseHandler(tracker, {
      onClick(e) { callbacksRef.current.onClick?.(e); },
      onMouseDown(e) { callbacksRef.current.onMouseDown?.(e); },
      onMouseUp(e) { callbacksRef.current.onMouseUp?.(e); },
    });
    return cleanup;
  }, [tracker]);

  void from; // accepted but no rendering effect in Phase 2

  return <Text dimColor {...rest}>{typeof children === 'string' ? children : null}</Text>;
}

export default NoSelect;

/**
 * ScrollBox compat stub — Phase 2
 *
 * Box wrapper with forwardRef and stub scroll methods.  Mouse events
 * (onClick) are dispatched via the shared MouseProvider context.
 * Full virtual-scrolling implementation deferred to later phases.
 */
import React, { forwardRef, useEffect, useRef } from 'react';
import { Box } from 'ink';
import {
  useMouseTracker,
  createMouseHandler,
  type MouseCallbacks,
} from './mouse-tracker.js';

// ---------------------------------------------------------------------------
// Types (compatible with the old ScrollBoxHandle / ScrollBoxProps)
// ---------------------------------------------------------------------------

export interface ScrollBoxHandle {
  /** Jump to absolute scroll position */
  scrollTo(y: number): void;
  /** Relative scroll */
  scrollBy(dy: number): void;
  /** Scroll to a descendant element */
  scrollToElement(el: unknown, offset?: number): void;
  /** Scroll to the bottom */
  scrollToBottom(): void;
  /** Current scroll offset */
  getScrollTop(): number;
  /** Pending delta */
  getPendingDelta(): number;
  /** Full content height */
  getScrollHeight(): number;
  getFreshScrollHeight(): number;
  getViewportHeight(): number;
  getViewportTop(): number;
  getLastManualScrollAt(): number;
  isSticky(): boolean;
  subscribe(listener: () => void): () => void;
  setClampBounds(min: number, max: number): void;
}

export interface ScrollBoxProps {
  children?: React.ReactNode;
  /** Flexbox style props passed through to the underlying Box */
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  flexGrow?: number;
  flexShrink?: number;
  width?: number | string;
  height?: number | string;
  minHeight?: number | string;
  /** CA extension: click handler — fires on mouse release near the press position */
  onClick?: (...args: any[]) => void;
  /** CA extension: sticky scroll mode (Phase 2: accepted but no-op) */
  stickyScroll?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ScrollBox = forwardRef<ScrollBoxHandle, ScrollBoxProps>(
  function ScrollBox({ children, onClick, stickyScroll, ..._boxProps }, ref) {
    // Stub handle — methods are no-ops for Phase 2
    React.useImperativeHandle(ref, () => ({
      scrollTo: () => {},
      scrollBy: () => {},
      scrollToElement: () => {},
      scrollToBottom: () => {},
      getScrollTop: () => 0,
      getPendingDelta: () => 0,
      getScrollHeight: () => 0,
      getFreshScrollHeight: () => 0,
      getViewportHeight: () => 0,
      getViewportTop: () => 0,
      getLastManualScrollAt: () => 0,
      isSticky: () => true,
      subscribe: () => () => {},
      setClampBounds: () => {},
    }), []);

    // Mouse event registration via the shared MouseProvider context
    const tracker = useMouseTracker();
    const onClickRef = useRef(onClick);

    // Keep ref in sync without re-registering
    useEffect(() => {
      onClickRef.current = onClick;
    });

    useEffect(() => {
      const cleanup = createMouseHandler(tracker, {
        onClick(e) { onClickRef.current?.(e); },
      });
      return cleanup;
    }, [tracker]);

    void stickyScroll; // accepted but not implemented yet

    return (
      <Box flexDirection="column" overflow="hidden" {..._boxProps as any}>
        {children}
      </Box>
    );
  },
);

export default ScrollBox;

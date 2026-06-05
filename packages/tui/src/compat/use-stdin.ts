/**
 * useStdin compat wrapper
 *
 * Wraps ink's useStdin to add the `inputEmitter` property that CA's CLI
 * code expects.  Wires raw stdin data events to a standalone EventEmitter
 * so TextInput and other CA components receive real-time input.
 */
import { EventEmitter } from 'node:events';
import { useStdin as inkUseStdin } from 'ink';
import { useEffect, useMemo } from 'react';

export interface StdinProps {
  /** The stdin stream */
  readonly stdin: NodeJS.ReadStream;
  /** Enable/disable raw mode on stdin */
  readonly setRawMode: (value: boolean) => void;
  /** Whether the current stdin supports setRawMode */
  readonly isRawModeSupported: boolean;
  /** CA compat: event emitter for raw input events */
  readonly inputEmitter: EventEmitter;
}

/**
 * Wraps ink's useStdin hook to provide the `inputEmitter` property
 * that CA's textInput and other components use for raw stdin events.
 *
 * Forwards every 'data' chunk from the stdin ReadStream to the
 * inputEmitter as an `'input'` event (string payload).
 */
export function useStdin(): StdinProps {
  const publicProps = inkUseStdin();
  const inputEmitter = useMemo(() => new EventEmitter(), []);

  // Wire stdin data events → inputEmitter so TextInput receives input
  useEffect(() => {
    const { stdin } = publicProps;
    if (!stdin) return;

    function onData(data: Buffer): void {
      inputEmitter.emit('input', data.toString());
    }

    stdin.on('data', onData);
    return () => {
      stdin.removeListener('data', onData);
    };
  }, [publicProps.stdin, inputEmitter]);

  return {
    stdin: publicProps.stdin,
    setRawMode: publicProps.setRawMode,
    isRawModeSupported: publicProps.isRawModeSupported,
    inputEmitter,
  };
}

export default useStdin;

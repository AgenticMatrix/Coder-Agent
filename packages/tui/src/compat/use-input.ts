/**
 * useInput compat wrapper — Phase 1
 *
 * Wraps ink v7's useInput (which provides 2 args: input, key) to provide
 * a 3-argument handler (input, key, event) expected by CA's CLI code.
 *
 * The third argument is an InputEvent with a `keypress` property (raw string
 * + isPasted flag) that textInput.tsx and other CA components depend on.
 * Without this wrapper, `event` is `undefined` and any access to
 * `event.keypress` throws TypeError, crashing the React tree.
 */
import { useInput as inkUseInput } from 'ink';
import type { Key as InkKey } from 'ink';
import { InputEvent, type Key } from './types.js';

type InputHandler = (input: string, key: Key, event: InputEvent) => void;

/**
 * Wraps ink v7's 2-arg useInput to provide CA's 3-arg handler signature.
 *
 * For each input event, constructs an InputEvent with:
 *   - keypress.raw = input (the raw stdin string)
 *   - keypress.isPasted = false (bracketed paste detection deferred)
 *
 * The Key type is cast to our extended type with wheelUp/wheelDown stubs.
 */
export function useInput(inputHandler: InputHandler, options?: { isActive?: boolean }): void {
  inkUseInput((input: string, key: InkKey) => {
    const event = new InputEvent(input, key as Key);
    inputHandler(input, key as Key, event);
  }, options as any);
}

export default useInput;

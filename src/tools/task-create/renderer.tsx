import React from 'react';
import { Box, Text } from 'ink';
import { useToolTimer } from '../shared/useToolTimer.js';
import type { ToolUseRendererProps } from '../types.js';

export function TaskCreateRenderer(props: ToolUseRendererProps): React.ReactNode {
  const subject = props.input.subject as string | undefined;
  const isDone = props.state === 'done';
  const isExecuting = props.state === 'executing';
  const { elapsedSecs, blinkOn } = useToolTimer(isExecuting);

  const indicator = isDone ? '●' : isExecuting ? (blinkOn ? '●' : '○') : '○';
  const indicatorColor = isDone ? 'green' : 'yellow';

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text>
        <Text color={indicatorColor}>{indicator} </Text>
        <Text bold>TaskCreate</Text>
        {subject ? <Text dimColor> · {subject}</Text> : null}
        {isExecuting ? (
          <Text dimColor color="yellow"> running {elapsedSecs}s</Text>
        ) : null}
      </Text>
    </Box>
  );
}

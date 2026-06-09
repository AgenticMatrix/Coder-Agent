import React from 'react';
import { Box, Text } from 'ink';
import { useToolTimer } from '../shared/useToolTimer.js';
import type { ToolUseRendererProps } from '../types.js';

export function TaskGetRenderer(props: ToolUseRendererProps): React.ReactNode {
  const taskId = props.input.taskId as string | undefined;
  const isDone = props.state === 'done';
  const isExecuting = props.state === 'executing';
  const { elapsedSecs, blinkOn } = useToolTimer(isExecuting);
  const status = props.result?.metadata?.status as string | undefined;

  const label = taskId ? `#${taskId}${status ? ` · ${status}` : ''}` : '';

  const indicator = isDone ? '●' : isExecuting ? (blinkOn ? '●' : '○') : '○';
  const indicatorColor = isDone ? 'green' : 'yellow';

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text>
        <Text color={indicatorColor}>{indicator} </Text>
        <Text bold>TaskGet</Text>
        {label ? <Text dimColor> · {label}</Text> : null}
        {isExecuting ? (
          <Text dimColor color="yellow"> running {elapsedSecs}s</Text>
        ) : null}
      </Text>
    </Box>
  );
}

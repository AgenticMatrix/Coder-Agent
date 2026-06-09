import React from 'react';
import { Box, Text } from 'ink';
import { useToolTimer } from '../shared/useToolTimer.js';
import type { ToolUseRendererProps } from '../types.js';

export function TaskUpdateRenderer(props: ToolUseRendererProps): React.ReactNode {
  const taskId = props.input.taskId as string | undefined;
  const status = props.input.status as string | undefined;
  const isDone = props.state === 'done';
  const isExecuting = props.state === 'executing';
  const { elapsedSecs, blinkOn } = useToolTimer(isExecuting);

  const label = status ? `${status}` : taskId ? `#${taskId}` : '';

  const indicator = isDone ? '●' : isExecuting ? (blinkOn ? '●' : '○') : '○';
  const indicatorColor = isDone ? 'green' : 'yellow';

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text>
        <Text color={indicatorColor}>{indicator} </Text>
        <Text bold>TaskUpdate</Text>
        {label ? <Text dimColor> · {label}</Text> : null}
        {isExecuting ? (
          <Text dimColor color="yellow"> running {elapsedSecs}s</Text>
        ) : null}
      </Text>
    </Box>
  );
}

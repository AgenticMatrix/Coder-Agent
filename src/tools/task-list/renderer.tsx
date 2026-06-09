import React from 'react';
import { Box, Text } from 'ink';
import { useToolTimer } from '../shared/useToolTimer.js';
import type { ToolUseRendererProps } from '../types.js';

export function TaskListRenderer(props: ToolUseRendererProps): React.ReactNode {
  const isDone = props.state === 'done';
  const isExecuting = props.state === 'executing';
  const { elapsedSecs, blinkOn } = useToolTimer(isExecuting);
  const result = props.result;
  const count = isDone && result?.metadata?.count !== undefined
    ? `${result.metadata.count} task(s)`
    : '';

  const indicator = isDone ? '●' : isExecuting ? (blinkOn ? '●' : '○') : '○';
  const indicatorColor = isDone ? 'green' : 'yellow';

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text>
        <Text color={indicatorColor}>{indicator} </Text>
        <Text bold>TaskList</Text>
        {count ? <Text dimColor> · {count}</Text> : null}
        {isExecuting ? (
          <Text dimColor color="yellow"> running {elapsedSecs}s</Text>
        ) : null}
      </Text>
    </Box>
  );
}

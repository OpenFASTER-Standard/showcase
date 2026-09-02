import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

type FlowEdgeData = {
  duration?: number;
  active?: boolean;
};

export function FlowEdge({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  data,
  style,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const { duration = 1.6, active = false } = (data as FlowEdgeData) ?? {};

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} />
      {active && (
        <circle r="5" fill="#f59e0b">
          <animateMotion dur={`${duration}s`} repeatCount="1" path={edgePath} />
        </circle>
      )}
    </>
  );
}

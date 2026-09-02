import { getSmoothStepPath, type EdgeProps } from "@xyflow/react";

type FlowEdgeData = {
  duration?: number;
  active?: boolean;
};

// No persistent line drawn (operator asked for all lines between the big
// nodes removed) -- the computed path is used only as the amber particle's
// travel path during play, via <animateMotion>, never rendered itself.
export function FlowEdge({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  data,
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

  if (!active) return null;

  return (
    <circle id={id} r="5" fill="#f59e0b">
      <animateMotion dur={`${duration}s`} repeatCount="1" path={edgePath} />
    </circle>
  );
}

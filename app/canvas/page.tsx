"use client";

import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { ArchitectureNode } from "@/components/canvas/nodes/architecture-node";
import { PipelineStageNode } from "@/components/canvas/nodes/pipeline-stage-node";
import {
  architectureNodes,
  architectureEdges,
  pipelineStageNodes,
  governanceEdges,
} from "@/lib/canvas-layout";

const nodeTypes = {
  architectureNode: ArchitectureNode,
  pipelineStageNode: PipelineStageNode,
};

export default function CanvasPage() {
  const nodes = [...architectureNodes, ...pipelineStageNodes];
  const edges = [...architectureEdges, ...governanceEdges];
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView />
    </div>
  );
}

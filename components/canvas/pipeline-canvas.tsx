"use client";

import { useCallback, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { ArchitectureNode } from "./nodes/architecture-node";
import { PipelineStageNode } from "./nodes/pipeline-stage-node";
import { FlowEdge } from "./edges/flow-edge";
import {
  architectureNodes,
  architectureEdges,
  pipelineStageNodes,
  flowEdges,
  governanceEdges,
} from "@/lib/canvas-layout";

const nodeTypes = {
  architectureNode: ArchitectureNode,
  pipelineStageNode: PipelineStageNode,
};

const edgeTypes = { flowEdge: FlowEdge };

const STAGE_DURATION_MS = 1600;

function PipelineCanvasInner() {
  const [activeStageIndex, setActiveStageIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);

  const play = useCallback(() => {
    setPlaying(true);
    setActiveStageIndex(0);
    for (let i = 1; i < pipelineStageNodes.length; i++) {
      setTimeout(() => setActiveStageIndex(i), i * STAGE_DURATION_MS);
    }
    setTimeout(() => {
      setPlaying(false);
      setActiveStageIndex(null);
    }, pipelineStageNodes.length * STAGE_DURATION_MS);
  }, []);

  const nodes: Node[] = [
    ...architectureNodes,
    ...pipelineStageNodes.map((node, i) => ({
      ...node,
      data: { ...node.data, active: activeStageIndex === i },
    })),
  ];

  const edges: Edge[] = [
    ...architectureEdges,
    ...governanceEdges,
    ...flowEdges.map((edge, i) => ({
      ...edge,
      data: { ...edge.data, active: playing && activeStageIndex === i + 1 },
    })),
  ];

  return (
    <div className="relative h-screen w-screen bg-neutral-50">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView>
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#d4d4d4" />
        <Controls />
        <MiniMap pannable zoomable maskColor="rgba(255,255,255,0.6)" nodeColor="#d4d4d4" style={{ backgroundColor: "#fafafa" }} />
        <Panel position="top-right">
          <button
            type="button"
            onClick={play}
            disabled={playing}
            aria-label="Watch Hans's given name flow through the pipeline"
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 shadow hover:bg-neutral-100 disabled:opacity-50"
          >
            {playing ? "Playing..." : "▶ Watch Hans's given name flow through"}
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function PipelineCanvas() {
  return (
    <ReactFlowProvider>
      <PipelineCanvasInner />
    </ReactFlowProvider>
  );
}

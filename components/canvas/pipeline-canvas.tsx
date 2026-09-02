"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { ArchitectureNode } from "./nodes/architecture-node";
import { PipelineStageNode } from "./nodes/pipeline-stage-node";
import { FlowEdge } from "./edges/flow-edge";
import { architectureNodes, pipelineStageNodes, flowEdges } from "@/lib/canvas-layout";

const nodeTypes = {
  architectureNode: ArchitectureNode,
  pipelineStageNode: PipelineStageNode,
};

const edgeTypes = { flowEdge: FlowEdge };

const STAGE_DURATION_MS = 1600;

function PipelineCanvasInner() {
  const [activeStageIndex, setActiveStageIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  // useNodesState (not a plain derived array) so dragging actually works:
  // React Flow tracks a node's position in its own internal store during a
  // drag, but only PERSISTS that change if something feeds the resulting
  // NodeChange back in via onNodesChange -- without it, the "dragging" CSS
  // class and selection state still appear (confirmed live), but the
  // node's rendered position silently never updates. Re-deriving a fresh
  // `nodes` array from the original static layout on every render (the
  // previous approach) fed React Flow's own StoreUpdater a new array
  // reference every time too, which would have fought any position state
  // it did track.
  const [nodes, , onNodesChange] = useNodesState([...architectureNodes, ...pipelineStageNodes]);

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

  // The "active" highlight is presentational, not a position change --
  // overlaid on top of whatever `nodes` currently holds (real, possibly
  // user-dragged positions) rather than folded into the drag-tracked state
  // itself.
  const displayNodes = useMemo(
    () =>
      nodes.map((node, i) =>
        node.type === "pipelineStageNode"
          ? { ...node, data: { ...node.data, active: activeStageIndex === i - architectureNodes.length } }
          : node,
      ),
    [nodes, activeStageIndex],
  );

  // No architecture/governance connector lines -- operator asked for all
  // lines between the big nodes removed. flowEdges are kept (not dropped
  // entirely) since FlowEdge itself no longer draws a persistent line; the
  // edge's path is only used as the amber particle's travel path during
  // play, not shown at rest.
  const edges: Edge[] = flowEdges.map((edge, i) => ({
    ...edge,
    data: { ...edge.data, active: playing && activeStageIndex === i + 1 },
  }));

  return (
    <div className="relative h-screen w-screen bg-neutral-50">
      {/* onlyRenderVisibleElements: every architecture/pipeline-stage node
          with a graph now mounts its own Sigma renderer, each holding its
          own WebGL context -- 8 of them, close enough to real browsers'
          typical simultaneous-context limits that a fully mounted canvas
          hit "Too many active WebGL contexts" live. Unmounting off-screen
          nodes (which tears down their Sigma instance too, via its own
          effect cleanup) keeps only the actually-visible ones alive. */}
      {/* minZoom: React Flow's own default floor is 0.5 -- this canvas's
          real content (5 columns ~980px apart, 900px-wide nodes) needs
          fitView to reach ~0.37 to show everything at once. Left at the
          default, fitView silently clamped to 0.5, overflowing both the
          left and right edges by the same amount (confirmed live via each
          node's real getBoundingClientRect()) rather than actually fitting. */}
      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        onlyRenderVisibleElements
      >
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

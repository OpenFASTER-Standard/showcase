"use client";

import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { ArchitectureNode } from "./nodes/architecture-node";
import { PipelineStageNode } from "./nodes/pipeline-stage-node";
import { architectureNodes, pipelineStageNodes } from "@/lib/canvas-layout";

const nodeTypes = {
  architectureNode: ArchitectureNode,
  pipelineStageNode: PipelineStageNode,
};

function PipelineCanvasInner() {
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
        nodes={nodes}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        onlyRenderVisibleElements
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#d4d4d4" />
        <Controls />
        {/* position="top-right": the default bottom-right spot now sits
            directly on top of the "Real XML" node in the 4-row layout
            (confirmed live -- its fixed-size SVG was intercepting wheel/
            pointer events meant for the node underneath). Row 1 only spans
            the middle 3 columns, so the top corners are genuinely empty
            canvas space regardless of pan/zoom starting state. */}
        <MiniMap
          position="top-right"
          pannable
          zoomable
          maskColor="rgba(255,255,255,0.6)"
          nodeColor="#d4d4d4"
          style={{ backgroundColor: "#fafafa" }}
        />
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

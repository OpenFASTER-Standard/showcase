"use client";

import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { ArchitectureNode } from "@/components/canvas/nodes/architecture-node";
import { architectureNodes, architectureEdges } from "@/lib/canvas-layout";

const nodeTypes = { architectureNode: ArchitectureNode };

export default function CanvasPage() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow nodes={architectureNodes} edges={architectureEdges} nodeTypes={nodeTypes} fitView />
    </div>
  );
}

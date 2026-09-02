"use client";

import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const nodes = [
  { id: "a", position: { x: 0, y: 0 }, data: { label: "A" } },
  { id: "b", position: { x: 200, y: 0 }, data: { label: "B" } },
];
const edges = [{ id: "a-b", source: "a", target: "b" }];

export default function CanvasPage() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView />
    </div>
  );
}

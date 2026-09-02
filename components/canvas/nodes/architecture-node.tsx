import dynamic from "next/dynamic";
import { Handle, Position, type NodeProps } from "@xyflow/react";

import type { RdfGraphData } from "./rdf-graph-view";

// Same reason as pipeline-stage-node.tsx, including the same `loading`
// fallback reserving RdfGraphView's real final size up front so React
// Flow's initial fitView doesn't measure a transiently shorter node.
const RdfGraphView = dynamic(() => import("./rdf-graph-view").then((m) => m.RdfGraphView), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full rounded border border-neutral-200 bg-white" />,
});

export type ArchitectureNodeData = {
  label: string;
  repoUrl: string;
  graph: RdfGraphData;
};

export function ArchitectureNode({ data }: NodeProps & { data: ArchitectureNodeData }) {
  return (
    <div className="w-[900px] rounded-lg border border-neutral-200 bg-white p-4 text-neutral-900 shadow-sm">
      <Handle type="target" position={Position.Top} />
      <a
        href={data.repoUrl}
        target="_blank"
        rel="noreferrer"
        className="text-base font-semibold tracking-tight text-blue-700 hover:underline"
      >
        {data.label}
      </a>
      <div className="mt-2">
        <RdfGraphView graph={data.graph} />
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

import { Handle, Position, type NodeProps } from "@xyflow/react";

import { RdfGraphView, type RdfGraphData } from "./rdf-graph-view";

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

import { Handle, Position, type NodeProps } from "@xyflow/react";

import { RdfGraphView, type RdfGraphData } from "./rdf-graph-view";
import { SheetView, type Sheet } from "./sheet-view";

export type PipelineStageNodeData = {
  title: string;
  subtitle: string;
  fileUrl: string;
  kind: "sheet" | "graph" | "text";
  sheets?: Sheet[];
  graph?: RdfGraphData;
  lang?: "xml";
  snippet?: string;
};

export function PipelineStageNode({ data }: NodeProps & { data: PipelineStageNodeData }) {
  return (
    <div className="w-[900px] rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Top} id="gov" />
      <div className="mb-3">
        <a
          href={data.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="text-base font-semibold tracking-tight text-blue-700 hover:underline"
        >
          {data.title}
        </a>
        <div className="text-xs text-neutral-500">{data.subtitle}</div>
      </div>
      {data.kind === "sheet" && data.sheets && <SheetView sheets={data.sheets} />}
      {data.kind === "graph" && data.graph && <RdfGraphView graph={data.graph} />}
      {data.kind === "text" && data.snippet && (
        <pre className="nodrag nowheel max-h-[600px] overflow-auto whitespace-pre-wrap font-mono text-xs text-neutral-700">
          {data.snippet}
        </pre>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

import { Handle, Position, type NodeProps } from "@xyflow/react";

export type PipelineStageNodeData = {
  title: string;
  subtitle: string;
  lang: "text" | "turtle" | "xml";
  snippet: string;
  active?: boolean;
};

export function PipelineStageNode({ data }: NodeProps & { data: PipelineStageNodeData }) {
  return (
    <div
      className={`w-80 rounded-lg border p-3 shadow-sm transition-colors ${
        data.active ? "border-amber-400 bg-amber-950/40" : "border-neutral-800 bg-neutral-950"
      }`}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Top} id="gov" />
      <div className="mb-2">
        <div className="text-sm font-semibold text-neutral-100">{data.title}</div>
        <div className="text-[11px] text-neutral-500">{data.subtitle}</div>
      </div>
      <pre className="whitespace-pre-wrap font-mono text-[11px] text-neutral-300">{data.snippet}</pre>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

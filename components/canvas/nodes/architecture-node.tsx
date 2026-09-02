import { Handle, Position, type NodeProps } from "@xyflow/react";

export type ArchitectureNodeData = {
  label: string;
  description: string;
  repoUrl: string;
};

export function ArchitectureNode({ data }: NodeProps & { data: ArchitectureNodeData }) {
  return (
    <div className="w-64 rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-neutral-100 shadow-sm">
      <Handle type="target" position={Position.Top} />
      <a
        href={data.repoUrl}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-semibold tracking-tight hover:underline"
      >
        {data.label}
      </a>
      <p className="mt-1 text-xs leading-snug text-neutral-400">{data.description}</p>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

import { Handle, Position, type NodeProps } from "@xyflow/react";

export type ArchitectureNodeData = {
  label: string;
  description: string;
  repoUrl: string;
};

export function ArchitectureNode({ data }: NodeProps & { data: ArchitectureNodeData }) {
  return (
    <div className="w-64 rounded-lg border border-neutral-200 bg-white p-4 text-neutral-900 shadow-sm">
      <Handle type="target" position={Position.Top} />
      <a
        href={data.repoUrl}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-semibold tracking-tight text-blue-700 hover:underline"
      >
        {data.label}
      </a>
      <p className="mt-1 text-xs leading-snug text-neutral-500">{data.description}</p>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

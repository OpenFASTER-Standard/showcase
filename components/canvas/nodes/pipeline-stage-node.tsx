import dynamic from "next/dynamic";
import { Handle, Position, type NodeProps } from "@xyflow/react";

import type { RdfGraphData } from "./rdf-graph-view";
import { SheetView, type Sheet } from "./sheet-view";

// Sigma.js references WebGL2RenderingContext at module-load time, which
// doesn't exist during Next.js's server-side prerender step (static
// export builds the page once on the server first) -- ssr: false defers
// loading this module until the browser, where WebGL is real.
const RdfGraphView = dynamic(() => import("./rdf-graph-view").then((m) => m.RdfGraphView), { ssr: false });

export type PipelineStageNodeData = {
  title: string;
  subtitle: string;
  kind: "sheet" | "graph" | "text";
  sheets?: Sheet[];
  graph?: RdfGraphData;
  highlightId?: string;
  lang?: "xml";
  snippet?: string;
  active?: boolean;
};

export function PipelineStageNode({ data }: NodeProps & { data: PipelineStageNodeData }) {
  return (
    <div
      className={`w-[900px] rounded-lg border p-4 shadow-sm transition-colors ${
        data.active ? "border-amber-400 bg-amber-50" : "border-neutral-200 bg-white"
      }`}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Top} id="gov" />
      <div className="mb-3">
        <div className="text-base font-semibold text-neutral-900">{data.title}</div>
        <div className="text-xs text-neutral-500">{data.subtitle}</div>
      </div>
      {data.kind === "sheet" && data.sheets && <SheetView sheets={data.sheets} />}
      {data.kind === "graph" && data.graph && (
        <RdfGraphView graph={data.graph} highlightId={data.highlightId} active={data.active} />
      )}
      {data.kind === "text" && data.snippet && (
        <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap font-mono text-xs text-neutral-700">
          {data.snippet}
        </pre>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

import dynamic from "next/dynamic";
import { Handle, Position, type NodeProps } from "@xyflow/react";

import type { RdfGraphData } from "./rdf-graph-view";
import { SheetView, type SheetData } from "./sheet-view";

// Sigma.js references WebGL2RenderingContext at module-load time, which
// doesn't exist during Next.js's server-side prerender step (static
// export builds the page once on the server first) -- ssr: false defers
// loading this module until the browser, where WebGL is real.
const RdfGraphView = dynamic(() => import("./rdf-graph-view").then((m) => m.RdfGraphView), { ssr: false });

export type PipelineStageNodeData = {
  title: string;
  subtitle: string;
  kind: "sheet" | "graph" | "text";
  sheet?: SheetData;
  graph?: RdfGraphData;
  lang?: "xml";
  snippet?: string;
  active?: boolean;
};

export function PipelineStageNode({ data }: NodeProps & { data: PipelineStageNodeData }) {
  return (
    <div
      className={`w-96 rounded-lg border p-3 shadow-sm transition-colors ${
        data.active ? "border-amber-400 bg-amber-50" : "border-neutral-200 bg-white"
      }`}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Top} id="gov" />
      <div className="mb-2">
        <div className="text-sm font-semibold text-neutral-900">{data.title}</div>
        <div className="text-[11px] text-neutral-500">{data.subtitle}</div>
      </div>
      {data.kind === "sheet" && data.sheet && <SheetView sheet={data.sheet} />}
      {data.kind === "graph" && data.graph && <RdfGraphView graph={data.graph} />}
      {data.kind === "text" && data.snippet && (
        <pre className="whitespace-pre-wrap font-mono text-[11px] text-neutral-700">{data.snippet}</pre>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

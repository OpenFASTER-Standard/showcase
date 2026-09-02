import type { Node, Edge } from "@xyflow/react";

import pipelineData from "@/data/pipeline-example.json";

// Wide enough for the pipeline-stage layer's real graph/sheet views
// (w-[900px]) without overlapping neighbors, now that both layers render
// full real graphs rather than a small snippet or a few lines of prose.
export const COL = [0, 980, 1960, 2940, 3920];
const ARCHITECTURE_Y = 0;
const STAGE_Y = 780;

const architectureGraphs = pipelineData.architectureGraphs as Record<
  string,
  { nodes: { id: string; label: string; kind: "iri" | "blank" | "literal" }[]; edges: { source: string; target: string; label: string }[] }
>;

// initialWidth/initialHeight: a hint matching each node's real CSS size
// (w-[900px], and each body's real rendered height), superseded by React
// Flow's own measurement once mounted. Without this hint, MiniMap's own
// node lookup (nodeHasDimensions()) requires a node to already have been
// measured before it'll draw anything for it at all -- confirmed live: the
// MiniMap rendered completely empty (not just low-contrast) until this was
// added, even though fitView/the main canvas both worked from real
// measured sizes.
const ARCHITECTURE_NODE_SIZE = { initialWidth: 900, initialHeight: 670 };

export const architectureNodes: Node[] = [
  {
    id: "spreadsheet-ontology",
    type: "architectureNode",
    position: { x: COL[0], y: ARCHITECTURE_Y },
    ...ARCHITECTURE_NODE_SIZE,
    data: {
      label: "Spreadsheet Ontology",
      repoUrl: "https://github.com/OpenFASTER-Standard/spreadsheet-ontology",
      graph: architectureGraphs["spreadsheet-ontology"],
    },
  },
  {
    id: "institutional-ontology",
    type: "architectureNode",
    position: { x: COL[1], y: ARCHITECTURE_Y },
    ...ARCHITECTURE_NODE_SIZE,
    data: {
      label: "Institutional Ontology",
      repoUrl: "https://github.com/OpenFASTER-Standard/institutional-ontology",
      graph: architectureGraphs["institutional-ontology"],
    },
  },
  {
    id: "realizations",
    type: "architectureNode",
    position: { x: COL[2], y: ARCHITECTURE_Y },
    ...ARCHITECTURE_NODE_SIZE,
    data: {
      label: "Realizations",
      repoUrl: "https://github.com/OpenFASTER-Standard/realizations",
      graph: architectureGraphs["realizations"],
    },
  },
  {
    id: "xml-ontology",
    type: "architectureNode",
    position: { x: COL[3], y: ARCHITECTURE_Y },
    ...ARCHITECTURE_NODE_SIZE,
    data: {
      label: "XML Ontology",
      repoUrl: "https://github.com/OpenFASTER-Standard/xml-ontology",
      graph: architectureGraphs["xml-ontology"],
    },
  },
  {
    id: "xsd-ontology",
    type: "architectureNode",
    position: { x: COL[4], y: ARCHITECTURE_Y },
    ...ARCHITECTURE_NODE_SIZE,
    data: {
      label: "XSD Ontology",
      repoUrl: "https://github.com/OpenFASTER-Standard/xsd-ontology",
      graph: architectureGraphs["xsd-ontology"],
    },
  },
];

export const architectureEdges: Edge[] = [
  { id: "real-io", source: "realizations", target: "institutional-ontology", type: "smoothstep", label: "realizes concepts from", style: { stroke: "#525252" } },
  { id: "real-sso", source: "realizations", target: "spreadsheet-ontology", type: "smoothstep", label: "layout shape from", style: { stroke: "#525252" } },
  { id: "real-xmlo", source: "realizations", target: "xml-ontology", type: "smoothstep", label: "instance shape from", style: { stroke: "#525252" } },
  { id: "real-xsdo", source: "realizations", target: "xsd-ontology", type: "smoothstep", label: "structural shape from", style: { stroke: "#525252" } },
];

export const pipelineStageNodes: Node[] = pipelineData.stages.map((stage, i) => ({
  id: `stage-${stage.id}`,
  type: "pipelineStageNode",
  position: { x: COL[i], y: STAGE_Y },
  initialWidth: 900,
  initialHeight: stage.kind === "sheet" ? 230 : 690,
  data: {
    title: stage.title,
    subtitle: stage.subtitle,
    kind: stage.kind,
    sheets: "sheets" in stage ? stage.sheets : undefined,
    graph: "graph" in stage ? stage.graph : undefined,
    highlightId: "highlightId" in stage ? stage.highlightId : undefined,
    lang: "lang" in stage ? stage.lang : undefined,
    snippet: "snippet" in stage ? stage.snippet : undefined,
  },
}));

export const governanceEdges: Edge[] = [
  { id: "gov-excel", source: "stage-excel", sourceHandle: "gov", target: "spreadsheet-ontology", type: "straight", style: { strokeDasharray: "4 4", stroke: "#525252" } },
  { id: "gov-sso", source: "stage-sso", sourceHandle: "gov", target: "spreadsheet-ontology", type: "straight", style: { strokeDasharray: "4 4", stroke: "#525252" } },
  { id: "gov-abox-io", source: "stage-abox", sourceHandle: "gov", target: "institutional-ontology", type: "straight", style: { strokeDasharray: "4 4", stroke: "#525252" } },
  { id: "gov-abox-real", source: "stage-abox", sourceHandle: "gov", target: "realizations", type: "straight", style: { strokeDasharray: "4 4", stroke: "#525252" } },
  { id: "gov-xmlo", source: "stage-xmlo", sourceHandle: "gov", target: "xml-ontology", type: "straight", style: { strokeDasharray: "4 4", stroke: "#525252" } },
  { id: "gov-xml", source: "stage-xml", sourceHandle: "gov", target: "xsd-ontology", type: "straight", style: { strokeDasharray: "4 4", stroke: "#525252" } },
];

export const flowEdges: Edge[] = [
  { id: "flow-1", source: "stage-excel", target: "stage-sso", type: "flowEdge", data: { duration: 1.6 } },
  { id: "flow-2", source: "stage-sso", target: "stage-abox", type: "flowEdge", data: { duration: 1.6 } },
  { id: "flow-3", source: "stage-abox", target: "stage-xmlo", type: "flowEdge", data: { duration: 1.6 } },
  { id: "flow-4", source: "stage-xmlo", target: "stage-xml", type: "flowEdge", data: { duration: 1.6 } },
];

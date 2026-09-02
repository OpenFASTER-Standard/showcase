import type { Node, Edge } from "@xyflow/react";

import pipelineData from "@/data/pipeline-example.json";

// Wide enough for the pipeline-stage layer's real graph/sheet views
// (w-[900px]) without overlapping neighbors, now that both layers render
// full real graphs rather than a small snippet or a few lines of prose.
export const COL = [0, 980, 1960, 2940, 3920];

// Four stacked rows instead of one "reference ontologies" row + one
// "pipeline trace" row: row 1 holds the three structural/shape ontologies
// (XSDO/XMLO/SSO) Realizations draws its instance/structural/layout shape
// from; row 2 is Institutional Ontology (the concepts Realizations draws
// its domain vocabulary from); row 3 is Realizations itself, which sits
// below both since it depends on all four; row 4 is the unchanged
// pipeline-stage trace (Excel -> SSO graph -> A-box graph -> XMLO graph ->
// Real XML) for the real Hans Muster fixture. 780 repeats the original
// architecture-row -> stage-row gap (670-tall node + ~110px margin).
const ROW1_Y = 0;
const ROW2_Y = 780;
const ROW3_Y = 1560;
const ROW4_Y = 2340;
// Row 1's three nodes (900px wide, 980px spacing) centered under the same
// total span row 4's five columns cover -- (2 * 980 + 900) leaves exactly
// 980px on each side of a 4820px-wide span, which happens to land on
// COL[1]/COL[2]/COL[3] already.
const ROW1_COL = [COL[1], COL[2], COL[3]];
// Row 2/3's single node centered on that same span's midpoint.
const ROW_CENTER_COL = COL[2];

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
  // Row 1: the three structural/shape ontologies.
  {
    id: "xsd-ontology",
    type: "architectureNode",
    position: { x: ROW1_COL[0], y: ROW1_Y },
    ...ARCHITECTURE_NODE_SIZE,
    data: {
      label: "XSD Ontology",
      fileUrl: "https://github.com/OpenFASTER-Standard/xsd-ontology/blob/main/xsd-ontology.owl",
      graph: architectureGraphs["xsd-ontology"],
    },
  },
  {
    id: "xml-ontology",
    type: "architectureNode",
    position: { x: ROW1_COL[1], y: ROW1_Y },
    ...ARCHITECTURE_NODE_SIZE,
    data: {
      label: "XML Ontology",
      fileUrl: "https://github.com/OpenFASTER-Standard/xml-ontology/blob/main/xml-ontology.owl",
      graph: architectureGraphs["xml-ontology"],
    },
  },
  {
    id: "spreadsheet-ontology",
    type: "architectureNode",
    position: { x: ROW1_COL[2], y: ROW1_Y },
    ...ARCHITECTURE_NODE_SIZE,
    data: {
      label: "Spreadsheet Ontology",
      fileUrl: "https://github.com/OpenFASTER-Standard/spreadsheet-ontology/blob/main/spreadsheet-ontology.owl",
      graph: architectureGraphs["spreadsheet-ontology"],
    },
  },
  // Row 2: the concept ontology.
  {
    id: "institutional-ontology",
    type: "architectureNode",
    position: { x: ROW_CENTER_COL, y: ROW2_Y },
    ...ARCHITECTURE_NODE_SIZE,
    data: {
      label: "Institutional Ontology",
      fileUrl: "https://github.com/OpenFASTER-Standard/institutional-ontology/blob/main/institutional-ontology.owl",
      graph: architectureGraphs["institutional-ontology"],
    },
  },
  // Row 3: Realizations, which draws on all four ontologies above.
  {
    id: "realizations",
    type: "architectureNode",
    position: { x: ROW_CENTER_COL, y: ROW3_Y },
    ...ARCHITECTURE_NODE_SIZE,
    data: {
      label: "Realizations",
      fileUrl: "https://github.com/OpenFASTER-Standard/realizations/blob/main/modules/kafe.ttl",
      graph: architectureGraphs["realizations"],
    },
  },
];

export const architectureEdges: Edge[] = [
  { id: "real-io", source: "realizations", target: "institutional-ontology", type: "smoothstep", label: "realizes concepts from", style: { stroke: "#525252" } },
  { id: "real-sso", source: "realizations", target: "spreadsheet-ontology", type: "smoothstep", label: "layout shape from", style: { stroke: "#525252" } },
  { id: "real-xmlo", source: "realizations", target: "xml-ontology", type: "smoothstep", label: "instance shape from", style: { stroke: "#525252" } },
  { id: "real-xsdo", source: "realizations", target: "xsd-ontology", type: "smoothstep", label: "structural shape from", style: { stroke: "#525252" } },
];

// Real source file (+ exact function definition line, verified against
// GitHub) each pipeline stage's data is actually produced by, per
// realizations/scripts/export_showcase_data.py's own imports.
const PIPELINE_STAGE_FILE_URLS: Record<string, string> = {
  excel: "https://github.com/OpenFASTER-Standard/realizations/blob/main/generator/showcase_fixture.py#L15",
  sso: "https://github.com/OpenFASTER-Standard/realizations/blob/main/generator/xlsx_ingest.py#L18",
  abox: "https://github.com/OpenFASTER-Standard/realizations/blob/main/generator/xlsx_ingest.py#L126",
  xmlo: "https://github.com/OpenFASTER-Standard/realizations/blob/main/generator/xml_instance_generator.py#L138",
  xml: "https://github.com/OpenFASTER-Standard/realizations/blob/main/generator/xml_instance_generator.py#L185",
};

export const pipelineStageNodes: Node[] = pipelineData.stages.map((stage, i) => ({
  id: `stage-${stage.id}`,
  type: "pipelineStageNode",
  position: { x: COL[i], y: ROW4_Y },
  initialWidth: 900,
  initialHeight: stage.kind === "sheet" ? 230 : 690,
  data: {
    title: stage.title,
    subtitle: stage.subtitle,
    fileUrl: PIPELINE_STAGE_FILE_URLS[stage.id],
    kind: stage.kind,
    sheets: "sheets" in stage ? stage.sheets : undefined,
    graph: "graph" in stage ? stage.graph : undefined,
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

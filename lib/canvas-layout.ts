import type { Node, Edge } from "@xyflow/react";

export const COL = [0, 320, 640, 960, 1280];
const ARCHITECTURE_Y = 0;

export const architectureNodes: Node[] = [
  {
    id: "spreadsheet-ontology",
    type: "architectureNode",
    position: { x: COL[0], y: ARCHITECTURE_Y },
    data: {
      label: "Spreadsheet Ontology",
      description: "A raw, structure-agnostic cell grid, plus an optional layout layer -- independent of any domain.",
      repoUrl: "https://github.com/OpenFASTER-Standard/spreadsheet-ontology",
    },
  },
  {
    id: "institutional-ontology",
    type: "architectureNode",
    position: { x: COL[1], y: ARCHITECTURE_Y },
    data: {
      label: "Institutional Ontology",
      description: "Framework-agnostic concepts -- given names, roles, forms of address -- shared across MiKaDiv and KaFE.",
      repoUrl: "https://github.com/OpenFASTER-Standard/institutional-ontology",
    },
  },
  {
    id: "realizations",
    type: "architectureNode",
    position: { x: COL[2], y: ARCHITECTURE_Y },
    data: {
      label: "Realizations",
      description: "Ties the four ontologies together for one real module: KaFE's real, curated structure.",
      repoUrl: "https://github.com/OpenFASTER-Standard/realizations",
    },
  },
  {
    id: "xml-ontology",
    type: "architectureNode",
    position: { x: COL[3], y: ARCHITECTURE_Y },
    data: {
      label: "XML Ontology",
      description: "A concrete XML document's real structure -- real elements in real order, not a grammar of what's allowed.",
      repoUrl: "https://github.com/OpenFASTER-Standard/xml-ontology",
    },
  },
  {
    id: "xsd-ontology",
    type: "architectureNode",
    position: { x: COL[4], y: ARCHITECTURE_Y },
    data: {
      label: "XSD Ontology",
      description: "XML Schema's own abstract Schema Component Model, made graph-expressible.",
      repoUrl: "https://github.com/OpenFASTER-Standard/xsd-ontology",
    },
  },
];

export const architectureEdges: Edge[] = [
  { id: "real-io", source: "realizations", target: "institutional-ontology", type: "smoothstep", label: "realizes concepts from" },
  { id: "real-sso", source: "realizations", target: "spreadsheet-ontology", type: "smoothstep", label: "layout shape from" },
  { id: "real-xmlo", source: "realizations", target: "xml-ontology", type: "smoothstep", label: "instance shape from" },
  { id: "real-xsdo", source: "realizations", target: "xsd-ontology", type: "smoothstep", label: "structural shape from" },
];

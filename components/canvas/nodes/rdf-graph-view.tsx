import { useMemo } from "react";

export type RdfGraphNode = { id: string; label: string; kind: "iri" | "blank" | "literal" };
export type RdfGraphEdge = { source: string; target: string; label: string };
export type RdfGraphData = { nodes: RdfGraphNode[]; edges: RdfGraphEdge[] };

// Matches riptide's own examples/graph-viewer/index.html convention for
// the iri/literal pair: gold nodes are literal values, blue nodes are
// IRIs. Blank nodes get a third, distinct color -- they are real objects
// too, just unminted ones, and should read as neither an IRI nor a value.
const IRI_COLOR = "#2b6cb0";
const BLANK_COLOR = "#7c3aed";
const LITERAL_COLOR = "#b8860b";
const HIGHLIGHT_COLOR = "#f59e0b"; // same amber as the active-stage border/flow-edge particle

function colorFor(kind: RdfGraphNode["kind"]): string {
  if (kind === "iri") return IRI_COLOR;
  if (kind === "blank") return BLANK_COLOR;
  return LITERAL_COLOR;
}

// Real identifiers can be long (a full sso: cell URI is 70+ characters) --
// keep the real id as the underlying data (RdfGraphNode.label is never
// truncated by the exporter), just shorten what's actually drawn so a full
// graph doesn't turn into overlapping text.
function displayLabel(node: RdfGraphNode): string {
  if (node.kind === "literal") {
    return node.label.length > 24 ? `${node.label.slice(0, 23)}…"` : node.label;
  }
  if (node.kind === "blank") {
    return node.label.length > 12 ? `${node.label.slice(0, 10)}…` : node.label;
  }
  const tail = node.label.split(/[/#]/).filter(Boolean).pop() ?? node.label;
  return tail.length > 24 ? `…${tail.slice(-23)}` : tail;
}

type Point = { x: number; y: number };

function layout(nodes: RdfGraphNode[], edges: RdfGraphEdge[]): Map<string, Point> {
  const positions = new Map<string, Point>();
  nodes.forEach((n, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI;
    positions.set(n.id, {
      x: Math.cos(angle) * 4 + (Math.random() - 0.5),
      y: Math.sin(angle) * 4 + (Math.random() - 0.5),
    });
  });

  // A small real force simulation (repulsion + spring edges + light
  // centering) -- the same real technique riptide's own graph-viewer
  // example uses (tickLayout()), run once here since this data is static
  // (baked at build time), not streamed live.
  for (let iter = 0; iter < 200; iter++) {
    const forces = new Map<string, Point>(nodes.map((n) => [n.id, { x: 0, y: 0 }]));
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = positions.get(nodes[i].id)!;
        const b = positions.get(nodes[j].id)!;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = Math.max(dx * dx + dy * dy, 0.01);
        const dist = Math.sqrt(distSq);
        const repulsion = 2 / distSq;
        const fx = (dx / dist) * repulsion;
        const fy = (dy / dist) * repulsion;
        forces.get(nodes[i].id)!.x += fx;
        forces.get(nodes[i].id)!.y += fy;
        forces.get(nodes[j].id)!.x -= fx;
        forces.get(nodes[j].id)!.y -= fy;
      }
    }
    for (const edge of edges) {
      const a = positions.get(edge.source);
      const b = positions.get(edge.target);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const spring = 0.05;
      forces.get(edge.source)!.x += dx * spring;
      forces.get(edge.source)!.y += dy * spring;
      forces.get(edge.target)!.x -= dx * spring;
      forces.get(edge.target)!.y -= dy * spring;
    }
    for (const n of nodes) {
      const pos = positions.get(n.id)!;
      const force = forces.get(n.id)!;
      pos.x += force.x * 0.1 - pos.x * 0.01;
      pos.y += force.y * 0.1 - pos.y * 0.01;
    }
  }
  return positions;
}

// A plain SVG rendering -- no WebGL, so no context-limit concern
// regardless of how many graph nodes are on screen at once, and no
// zoom-dependent swapping: this is the only rendering, at every zoom
// level, exactly like every other element on the canvas (it scales via
// the same React Flow viewport transform everything else does). Replaced
// a Sigma.js/WebGL renderer that had to be gated by zoom+visibility --
// measured live, each Sigma instance cost 6 real WebGL contexts, so all 8
// graph nodes on screen at once needed 48 simultaneous contexts, far past
// any browser's real limit. Operator explicitly rejected any
// zoom-dependent appearance change in favor of this always-on rendering.
export function RdfGraphView({
  graph,
  highlightId,
  active,
}: {
  graph: RdfGraphData;
  highlightId?: string;
  active?: boolean;
}) {
  const { nodePoints, edgeLines, viewBox } = useMemo(() => {
    const positions = layout(graph.nodes, graph.edges);
    const xs = [...positions.values()].map((p) => p.x);
    const ys = [...positions.values()].map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const pad = 0.8;
    const box = `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;

    const lines = graph.edges
      .map((edge) => {
        const source = positions.get(edge.source);
        const target = positions.get(edge.target);
        if (!source || !target) return null;
        return { key: `${edge.source}->${edge.target}:${edge.label}`, source, target, label: edge.label };
      })
      .filter((l): l is { key: string; source: Point; target: Point; label: string } => l !== null);

    const points = graph.nodes.map((node) => {
      const isHighlighted = Boolean(active && highlightId && node.id === highlightId);
      return {
        key: node.id,
        pos: positions.get(node.id)!,
        color: isHighlighted ? HIGHLIGHT_COLOR : colorFor(node.kind),
        r: isHighlighted ? 0.14 : node.kind === "iri" ? 0.09 : node.kind === "blank" ? 0.08 : 0.07,
        label: displayLabel(node),
      };
    });

    return { nodePoints: points, edgeLines: lines, viewBox: box };
  }, [graph, highlightId, active]);

  return (
    <div className="nodrag nowheel h-[600px] w-full rounded border border-neutral-200 bg-white">
      <svg viewBox={viewBox} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {edgeLines.map((line) => (
          <g key={line.key}>
            <line x1={line.source.x} y1={line.source.y} x2={line.target.x} y2={line.target.y} stroke="#d4d4d8" strokeWidth={0.015} />
            <text
              x={(line.source.x + line.target.x) / 2}
              y={(line.source.y + line.target.y) / 2}
              fontSize={0.09}
              fill="#a1a1aa"
              textAnchor="middle"
            >
              {line.label}
            </text>
          </g>
        ))}
        {nodePoints.map((node) => (
          <g key={node.key}>
            <circle cx={node.pos.x} cy={node.pos.y} r={node.r} fill={node.color} />
            <text x={node.pos.x + node.r + 0.04} y={node.pos.y + 0.03} fontSize={0.11} fill="#27272a">
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

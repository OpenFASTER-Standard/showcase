"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useViewport } from "@xyflow/react";
import Graph from "graphology";
import Sigma from "sigma";

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

// Every architecture/pipeline-stage graph node mounts its own Sigma
// renderer -- and each Sigma instance costs *six* real WebGL contexts, not
// one (measured live: forcing all 8 graph nodes to mount simultaneously
// created 48 real WebGL contexts, confirmed via a getContext() call
// counter, not a guess). No zoom/visibility budget makes 8x6=48
// simultaneous contexts safe against any real browser's limit, so the
// interactive canvas stays gated -- but the *static* SVG preview below
// costs zero WebGL contexts (plain SVG shapes), so it can always render
// for real instead of leaving a zoomed-out node with just placeholder text.
const ZOOM_RENDER_THRESHOLD = 0.5;

function colorFor(kind: RdfGraphNode["kind"]): string {
  if (kind === "iri") return IRI_COLOR;
  if (kind === "blank") return BLANK_COLOR;
  return LITERAL_COLOR;
}

// Real identifiers can be long (a full sso: cell URI is 70+ characters) --
// keep the real id as the underlying data (RdfGraphNode.label is never
// truncated by the exporter), just shorten what's actually drawn on the
// canvas so a full graph doesn't turn into overlapping text.
function displayLabel(node: RdfGraphNode): string {
  if (node.kind === "literal") {
    return node.label.length > 40 ? `${node.label.slice(0, 39)}…"` : node.label;
  }
  if (node.kind === "blank") {
    return node.label.length > 14 ? `${node.label.slice(0, 12)}…` : node.label;
  }
  const tail = node.label.split(/[/#]/).filter(Boolean).pop() ?? node.label;
  return tail.length > 40 ? `…${tail.slice(-39)}` : tail;
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
  // (baked at build time), not streamed live the way riptide's is.
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

function SigmaGraphCanvas({
  graph,
  highlightId,
  active,
}: {
  graph: RdfGraphData;
  highlightId?: string;
  active?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // multi: true -- real RDF data legitimately has more than one edge
    // between the same node pair (two different predicates connecting the
    // same subject/object), which a plain (non-multi) graphology Graph
    // rejects as a duplicate edge.
    const g = new Graph({ multi: true });
    const positions = layout(graph.nodes, graph.edges);
    for (const node of graph.nodes) {
      const pos = positions.get(node.id)!;
      const isHighlighted = Boolean(active && highlightId && node.id === highlightId);
      g.addNode(node.id, {
        x: pos.x,
        y: pos.y,
        size: isHighlighted ? 14 : node.kind === "iri" ? 8 : node.kind === "blank" ? 7 : 6,
        label: displayLabel(node),
        color: isHighlighted ? HIGHLIGHT_COLOR : colorFor(node.kind),
      });
    }
    for (const edge of graph.edges) {
      g.addEdge(edge.source, edge.target, { label: edge.label, size: 1, color: "#a3a3a3" });
    }

    const renderer = new Sigma(g, containerRef.current, {
      renderEdgeLabels: true,
      labelSize: 11,
      labelColor: { color: "#27272a" },
      edgeLabelSize: 10,
      edgeLabelColor: { color: "#71717a" },
      defaultEdgeColor: "#a3a3a3",
    });

    return () => renderer.kill();
  }, [graph, highlightId, active]);

  return <div ref={containerRef} className="nodrag nowheel h-full w-full" />;
}

// A static, non-interactive preview built from the exact same real
// node/edge data and force-directed layout the interactive canvas uses --
// plain SVG shapes, zero WebGL contexts, so it can render unconditionally
// as the always-visible fallback while the interactive canvas stays gated.
function SvgGraphPreview({ graph }: { graph: RdfGraphData }) {
  const { nodePoints, edgeLines, viewBox } = useMemo(() => {
    const positions = layout(graph.nodes, graph.edges);
    const xs = [...positions.values()].map((p) => p.x);
    const ys = [...positions.values()].map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const pad = 0.6;
    const box = `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;

    const lines = graph.edges
      .map((edge) => {
        const source = positions.get(edge.source);
        const target = positions.get(edge.target);
        if (!source || !target) return null;
        return { key: `${edge.source}->${edge.target}:${edge.label}`, source, target };
      })
      .filter((l): l is { key: string; source: Point; target: Point } => l !== null);

    const points = graph.nodes.map((node) => ({
      key: node.id,
      pos: positions.get(node.id)!,
      color: colorFor(node.kind),
      r: node.kind === "iri" ? 0.09 : node.kind === "blank" ? 0.08 : 0.07,
    }));

    return { nodePoints: points, edgeLines: lines, viewBox: box };
  }, [graph]);

  return (
    <svg viewBox={viewBox} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      {edgeLines.map((line) => (
        <line
          key={line.key}
          x1={line.source.x}
          y1={line.source.y}
          x2={line.target.x}
          y2={line.target.y}
          stroke="#d4d4d8"
          strokeWidth={0.02}
        />
      ))}
      {nodePoints.map((node) => (
        <circle key={node.key} cx={node.pos.x} cy={node.pos.y} r={node.r} fill={node.color} />
      ))}
    </svg>
  );
}

export function RdfGraphView({
  graph,
  highlightId,
  active,
}: {
  graph: RdfGraphData;
  highlightId?: string;
  active?: boolean;
}) {
  const { zoom } = useViewport();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [inRealViewport, setInRealViewport] = useState(false);

  // React Flow's own zoom is global, shared by every node -- gating on
  // zoom alone (an earlier version of this fix) still mounted all 8 Sigma
  // instances at once the moment the user zoomed in anywhere, since every
  // node crosses the same threshold together. What actually varies
  // per-node is real on-screen presence: IntersectionObserver against the
  // true browser viewport (not React Flow's virtual one), which shrinks
  // to cover only 1-2 of these 900px-wide nodes once zoomed in normally.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInRealViewport(entry.isIntersecting), {
      threshold: 0.4,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The currently-playing stage always renders for real, even at overview
  // zoom -- otherwise "watch Hans's given name flow through" would animate
  // into an invisible placeholder. Play only activates one stage at a
  // time, so this adds at most one extra live WebGL context, not 48.
  const canRenderInteractive = (zoom > ZOOM_RENDER_THRESHOLD && inRealViewport) || Boolean(active);

  return (
    <div ref={wrapperRef} className="nodrag nowheel relative h-[600px] w-full rounded border border-neutral-200 bg-white">
      {canRenderInteractive ? (
        <SigmaGraphCanvas graph={graph} highlightId={highlightId} active={active} />
      ) : (
        <>
          <SvgGraphPreview graph={graph} />
          <div className="pointer-events-none absolute bottom-1.5 left-1.5 rounded bg-white/80 px-1.5 py-0.5 text-[10px] text-neutral-500">
            {graph.nodes.length} nodes, {graph.edges.length} edges — zoom in to explore
          </div>
        </>
      )}
    </div>
  );
}

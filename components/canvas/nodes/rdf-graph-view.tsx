"use client";

import { useEffect, useRef } from "react";
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

export function RdfGraphView({
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

    const g = new Graph();
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

  return <div ref={containerRef} className="nodrag nowheel h-[600px] w-full rounded border border-neutral-200 bg-white" />;
}

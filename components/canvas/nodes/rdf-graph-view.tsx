"use client";

import { useEffect, useRef } from "react";
import cytoscape from "cytoscape";
import { useViewport } from "@xyflow/react";

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

// Cytoscape.js, Canvas2D-rendered by default (not WebGL) -- chosen after
// Sigma.js proved architecturally unable to run 8 simultaneous instances
// (its own maintainers confirm contexts get evicted past ~5-6 concurrent
// instances: github.com/jacomyal/sigma.js/issues/1321) and Cosmos.gl's
// device-sharing turned out not to support simultaneous multi-panel
// display either (verified live: only the last-initialized instance keeps
// the shared canvas). Canvas2D has no such context ceiling -- any number
// of Cytoscape instances can be on screen at once, each fully interactive
// (native pan/zoom/drag/hover), with no zoom-dependent gating needed.
const PIXELS_PER_UNIT = 70;

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
  const cyRef = useRef<cytoscape.Core | null>(null);
  const { zoom, x, y } = useViewport();

  useEffect(() => {
    if (!containerRef.current) return;

    const positions = layout(graph.nodes, graph.edges);
    const elements = [
      ...graph.nodes.map((node) => ({
        data: { id: node.id, label: displayLabel(node), color: colorFor(node.kind) },
        position: { x: positions.get(node.id)!.x * PIXELS_PER_UNIT, y: positions.get(node.id)!.y * PIXELS_PER_UNIT },
        classes: active && highlightId && node.id === highlightId ? "highlighted" : undefined,
      })),
      ...graph.edges.map((edge, i) => ({
        data: { id: `e${i}`, source: edge.source, target: edge.target, label: edge.label },
      })),
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      layout: { name: "preset" },
      wheelSensitivity: 0.2,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "data(color)",
            width: 12,
            height: 12,
            label: "data(label)",
            "font-size": 9,
            color: "#27272a",
            "text-valign": "center",
            "text-halign": "right",
            "text-margin-x": 4,
          },
        },
        {
          selector: "node.highlighted",
          style: {
            "background-color": HIGHLIGHT_COLOR,
            width: 20,
            height: 20,
            "font-weight": "bold",
          },
        },
        {
          selector: "edge",
          style: {
            width: 1,
            "line-color": "#a3a3a3",
            "curve-style": "bezier",
            label: "data(label)",
            "font-size": 8,
            color: "#71717a",
            "text-background-color": "#ffffff",
            "text-background-opacity": 0.7,
          },
        },
      ],
    });
    cy.fit(undefined, 20);
    cyRef.current = cy;

    // Cytoscape renders to <canvas>, not real DOM/SVG nodes, so e2e tests
    // can't query rendered content directly (no `getByText`/`svg circle`
    // locators). This exposes the real element counts and the live
    // instance itself for that purpose -- a minimal testability hook, not
    // a runtime feature.
    const hookTarget = containerRef.current as HTMLDivElement & {
      __cyNodeCount?: number;
      __cyEdgeCount?: number;
      __cy?: cytoscape.Core;
    };
    hookTarget.__cyNodeCount = cy.nodes().length;
    hookTarget.__cyEdgeCount = cy.edges().length;
    hookTarget.__cy = cy;

    return () => {
      cyRef.current = null;
      cy.destroy();
    };
  }, [graph, highlightId, active]);

  // React Flow zooms/pans the outer canvas by mutating an ancestor div's
  // `transform: scale(...)` directly via JS on every frame -- no CSS
  // transition/animation, no scroll, no layout-size change. Cytoscape's own
  // mouse-to-graph coordinate math caches a "container client coords" scale
  // factor (BRp$e.findContainerClientCoords in its bundled source) and only
  // invalidates that cache on transitionend/animationend/scroll/resize/
  // ResizeObserver -- none of which React Flow's transform ever fires. Left
  // alone, the cached scale silently goes stale the moment the outer canvas
  // is zoomed, so every subsequent in-graph wheel-zoom centers on the wrong
  // point. cy.resize() is the public API that forces Cytoscape to discard
  // that cache (it calls the renderer's invalidateContainerClientCoordsCache
  // internally), so re-run it whenever the outer viewport changes.
  useEffect(() => {
    cyRef.current?.resize();
  }, [zoom, x, y]);

  return <div ref={containerRef} className="nodrag nowheel h-[600px] w-full rounded border border-neutral-200 bg-white" />;
}

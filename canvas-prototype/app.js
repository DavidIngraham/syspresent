// src/canvas-prototype/geometry.mjs
function graphArea(width, height, panels = []) {
  if (!panels.length) return { x: 16, y: 16, width: width - 32, height: height - 76 };
  const p = panels[0];
  if (p.width > width * 0.7) return { x: 16, y: 16, width: width - 32, height: Math.max(100, p.y - 30) };
  if (p.x < width * 0.3) return { x: p.x + p.width + 20, y: 16, width: width - p.x - p.width - 36, height: height - 76 };
  return { x: 16, y: 16, width: Math.max(160, p.x - 34), height: height - 76 };
}
function fitNodes(nodes, area) {
  const minX = nodes.length ? Math.min(...nodes.map((n) => n.x)) : 0, minY = nodes.length ? Math.min(...nodes.map((n) => n.y)) : 0;
  const maxX = nodes.length ? Math.max(...nodes.map((n) => n.x + n.width)) : 1, maxY = nodes.length ? Math.max(...nodes.map((n) => n.y + n.height)) : 1;
  const scale = Math.min(1.4, area.width / (maxX - minX + 20), area.height / (maxY - minY + 20));
  const offsetX = area.x + (area.width - (maxX - minX) * scale) / 2 - minX * scale, offsetY = area.y + (area.height - (maxY - minY) * scale) / 2 - minY * scale;
  return { scale, nodes: nodes.map((n) => ({ ...n, x: n.x * scale + offsetX, y: n.y * scale + offsetY, width: n.width * scale, height: n.height * scale })) };
}

// src/canvas-prototype/engine/client.mjs
function createSemanticEngine({ assetBase, workerURL = new URL("./worker.js", import.meta.url), WorkerClass = globalThis.Worker } = {}) {
  if (!assetBase) throw new TypeError("assetBase must locate the pinned Go/WASM engine assets");
  const worker = new WorkerClass(workerURL);
  const pending = /* @__PURE__ */ new Map();
  let sequence = 0;
  let closed = false;
  function request(method, params) {
    if (closed) return Promise.reject(new Error("Semantic engine has been terminated"));
    const id = ++sequence;
    return new Promise((resolve2, reject) => {
      pending.set(id, { resolve: resolve2, reject });
      worker.postMessage({ id, method, params });
    });
  }
  function rejectAll(error) {
    for (const job of pending.values()) job.reject(error);
    pending.clear();
  }
  worker.onmessage = ({ data }) => {
    const job = pending.get(data.id);
    if (!job) return;
    pending.delete(data.id);
    if (data.error) {
      const error = new Error(data.error.message);
      error.code = data.error.code;
      job.reject(error);
    } else job.resolve(data.result);
  };
  worker.onerror = (event) => {
    closed = true;
    rejectAll(new Error(event.message || "Semantic engine worker failed"));
    worker.terminate();
  };
  const base = new URL(assetBase, globalThis.location?.href || import.meta.url).href;
  const ready = request("Initialize", { assetBase: base });
  return {
    ready,
    async call(method, params = {}) {
      await ready;
      return request(method, params);
    },
    terminate() {
      closed = true;
      worker.terminate();
      rejectAll(new Error("Semantic engine has been terminated"));
    }
  };
}

// src/canvas-prototype/core/index.mjs
var copy = (value) => structuredClone(value);
var ENGINEERING_RELATIONSHIPS = Object.freeze([
  "derive",
  "derivation",
  "refine",
  "refinement",
  "satisfy",
  "satisfaction",
  "verify",
  "verification",
  "allocate",
  "allocation",
  "dependency",
  "composition",
  "reference",
  "connection",
  "flow",
  "item-flow",
  "control-flow",
  "causation"
]);
var FORBIDDEN_SHORTCUTS = /* @__PURE__ */ new Set(["type", "typing", "specialization", "owner", "owningMembership", "ownedMembership", "documentation", "membership"]);
var endpoint = (edge, side) => side === "source" ? edge.source ?? edge.fromId ?? edge.from_id ?? edge.from : edge.target ?? edge.toId ?? edge.to_id ?? edge.to;
var nativeEdges = (graph) => (graph.relationships ?? []).map((edge) => ({ ...edge, source: endpoint(edge, "source"), target: endpoint(edge, "target") }));
var allowedKinds = (options) => new Set((options.relationshipKinds ?? ENGINEERING_RELATIONSHIPS).filter((kind) => !FORBIDDEN_SHORTCUTS.has(kind)));
function graphPolicy(graph, options) {
  const elements = new Map((graph.elements ?? []).map((element2) => [element2.id, element2]));
  const scope = options.scopeIds ? /* @__PURE__ */ new Set([...options.scopeIds, ...options.includedIds ?? []]) : null;
  const explicit = new Set(options.includedIds ?? []);
  const allowedElement = (id) => {
    const element2 = elements.get(id);
    if (!element2) return "unavailable";
    if (scope && !scope.has(id)) return "outside-scope";
    if ((element2.layer === "metamodel" || element2.metamodel === true) && !explicit.has(id)) return "metamodel-boundary";
    return null;
  };
  return { elements, edges: nativeEdges(graph), kinds: allowedKinds(options), allowedElement };
}
function engineeringContext(graph, options = {}) {
  const { focus, depth = 1, budget = 24 } = options;
  if (!Number.isInteger(depth) || depth < 0 || !Number.isInteger(budget) || budget < 1) throw new Error("Invalid context depth or budget");
  const policy = graphPolicy(graph, options), wanted = /* @__PURE__ */ new Set(), omissions = [], seenOmissions = /* @__PURE__ */ new Set();
  const omit = (edge, target, reason) => {
    const key = `${edge?.id}:${target}:${reason}`;
    if (!seenOmissions.has(key)) {
      seenOmissions.add(key);
      omissions.push({ relationshipId: edge?.id ?? null, target, reason });
    }
  };
  const rootReason = policy.allowedElement(focus);
  if (rootReason) {
    omit(null, focus, rootReason);
    return { elements: [], relationships: [], omissions };
  }
  wanted.add(focus);
  const queue = [[focus, 0]];
  while (queue.length) {
    const [id, distance] = queue.shift();
    for (const edge of policy.edges) {
      if (edge.source !== id && edge.target !== id) continue;
      const target = edge.source === id ? edge.target : edge.source;
      if (!policy.kinds.has(edge.kind)) {
        omit(edge, target, "relationship-policy");
        continue;
      }
      const reason = policy.allowedElement(target);
      if (reason) {
        omit(edge, target, reason);
        continue;
      }
      if (wanted.has(target)) continue;
      if (distance >= depth) {
        omit(edge, target, "depth");
        continue;
      }
      if (wanted.size >= budget) {
        omit(edge, target, "budget");
        continue;
      }
      wanted.add(target);
      queue.push([target, distance + 1]);
    }
  }
  return copy({ elements: [...wanted].map((id) => policy.elements.get(id)), relationships: policy.edges.filter((edge) => policy.kinds.has(edge.kind) && wanted.has(edge.source) && wanted.has(edge.target)), omissions });
}
function findEngineeringRoute(graph, options = {}) {
  const { from, to, maxHops = 12 } = options, policy = graphPolicy(graph, options), omissions = [];
  for (const id of [from, to]) {
    const reason = policy.allowedElement(id);
    if (reason) return { found: false, elements: [], relationships: [], omissions: [{ target: id, reason }] };
  }
  const visited = /* @__PURE__ */ new Set([from]), queue = [{ id: from, path: [from], edges: [] }];
  while (queue.length) {
    const current = queue.shift();
    if (current.id === to) return copy({ found: true, elements: current.path.map((id) => policy.elements.get(id)), relationships: current.edges, omissions });
    for (const edge of policy.edges) {
      if (edge.source !== current.id && edge.target !== current.id) continue;
      const target = edge.source === current.id ? edge.target : edge.source;
      const reason = !policy.kinds.has(edge.kind) ? "relationship-policy" : policy.allowedElement(target);
      if (reason) {
        omissions.push({ relationshipId: edge.id, target, reason });
        continue;
      }
      if (visited.has(target)) continue;
      if (current.edges.length >= maxHops) {
        omissions.push({ relationshipId: edge.id, target, reason: "hop-limit" });
        continue;
      }
      visited.add(target);
      queue.push({ id: target, path: [...current.path, target], edges: [...current.edges, edge] });
    }
  }
  return copy({ found: false, elements: [], relationships: [], omissions });
}
function directTypingContext(graph, id) {
  const elements = new Map((graph.elements ?? []).map((element2) => [element2.id, element2]));
  const relationships = nativeEdges(graph).filter((edge) => ["type", "typing"].includes(edge.kind) && (edge.source === id || edge.target === id));
  const ids = /* @__PURE__ */ new Set([id]);
  for (const edge of relationships) {
    ids.add(edge.source);
    ids.add(edge.target);
  }
  return copy({ elements: [...ids].filter((key) => elements.has(key)).map((key) => elements.get(key)), relationships });
}
function projectView(view) {
  const nodes = (view.nodes ?? []).map((node) => ({ ...copy(node), id: node.id, semanticId: node.semanticId ?? node.semantic_id ?? null, parentId: node.parentId ?? node.parent ?? null }));
  if (nodes.some((node) => typeof node.id !== "string")) throw new Error("Native drawing node lacks a representation ID");
  if (new Set(nodes.map((node) => node.id)).size !== nodes.length) throw new Error("Duplicate representation ID");
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = (view.edges ?? []).map((edge, index) => ({ ...copy(edge), id: edge.id ?? `${view.id ?? "view"}:edge:${index}`, source: endpoint(edge, "source"), target: endpoint(edge, "target") }));
  if (edges.some((edge) => !nodeIds.has(edge.source) || !nodeIds.has(edge.target))) throw new Error("Native edge references an unavailable drawing node");
  return { ...copy(view), nodes, edges };
}
var intersects = (a, b, gap = 0) => a.x < b.x + b.width + gap && a.x + a.width + gap > b.x && a.y < b.y + b.height + gap && a.y + a.height + gap > b.y;
function topologicalRanks(ids, edges) {
  let sequence = 0;
  const stack = [], active = /* @__PURE__ */ new Set(), low = /* @__PURE__ */ new Map(), indices = /* @__PURE__ */ new Map(), groups = [];
  const next = new Map(ids.map((id) => [id, []]));
  for (const [a, b] of edges) if (a !== b && next.has(a) && next.has(b)) next.get(a).push(b);
  function visit(id) {
    indices.set(id, sequence);
    low.set(id, sequence++);
    stack.push(id);
    active.add(id);
    for (const target of next.get(id)) {
      if (!indices.has(target)) {
        visit(target);
        low.set(id, Math.min(low.get(id), low.get(target)));
      } else if (active.has(target)) low.set(id, Math.min(low.get(id), indices.get(target)));
    }
    if (low.get(id) === indices.get(id)) {
      const group = [];
      let item;
      do {
        item = stack.pop();
        active.delete(item);
        group.push(item);
      } while (item !== id);
      groups.push(group);
    }
  }
  for (const id of ids) if (!indices.has(id)) visit(id);
  const membership = new Map(groups.flatMap((group, index) => group.map((id) => [id, index]))), rank = new Map(groups.map((_, index) => [index, 0]));
  for (let pass = 0; pass < groups.length; pass++) {
    let changed = false;
    for (const [a, b] of edges) {
      const x = membership.get(a), y = membership.get(b);
      if (x !== y && x !== void 0 && y !== void 0 && rank.get(y) < rank.get(x) + 1) {
        rank.set(y, rank.get(x) + 1);
        changed = true;
      }
    }
    if (!changed) break;
  }
  return new Map(ids.map((id) => [id, rank.get(membership.get(id))]));
}
function layoutScene(nativeView, options = {}) {
  const { width = 1e3, height = 700, padding = 20, gap = 24, panels = [] } = options;
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) throw new Error("Invalid viewport");
  const view = projectView(nativeView), nodeMap = new Map(view.nodes.map((node) => [node.id, node])), omissions = [];
  const children = new Map(view.nodes.map((node) => [node.id, []]));
  for (const node of view.nodes) if (node.parentId && nodeMap.has(node.parentId)) children.get(node.parentId).push(node.id);
  const roots = view.nodes.filter((node) => !node.parentId || !nodeMap.has(node.parentId));
  const sizes = /* @__PURE__ */ new Map(), visiting = /* @__PURE__ */ new Set(), childPlacements = /* @__PURE__ */ new Map();
  let intervals = [[padding, width - padding]];
  for (const panel of panels.filter((panel2) => panel2.y <= padding + 76 && panel2.y + panel2.height > padding)) {
    intervals = intervals.flatMap(([left, right]) => panel.x >= right || panel.x + panel.width <= left ? [[left, right]] : [[left, Math.min(right, panel.x - gap)], [Math.max(left, panel.x + panel.width + gap), right]].filter(([a, b]) => b > a));
  }
  const contentWidth = Math.max(160, ...intervals.map(([a, b]) => b - a));
  const controlSizes = /* @__PURE__ */ new Map([["initial", [28, 28]], ["final", [32, 32]], ["fork", [80, 24]], ["join", [80, 24]], ["decision", [44, 44]], ["merge", [44, 44]], ["start", [28, 28]], ["end", [32, 32]]]);
  const flowKinds = /* @__PURE__ */ new Set(["succession", "control-flow", "transition", "flow"]);
  function directChildOf(id, parent) {
    let child = nodeMap.get(id), count = 0;
    while (child?.parentId && child.parentId !== parent) {
      child = nodeMap.get(child.parentId);
      if (++count > view.nodes.length) throw new Error("Cyclic native drawing containment");
    }
    return child?.parentId === parent ? child.id : null;
  }
  function measure(id) {
    if (sizes.has(id)) return sizes.get(id);
    if (visiting.has(id)) throw new Error("Cyclic native drawing containment");
    visiting.add(id);
    const node = nodeMap.get(id), items = children.get(id);
    const lines = [node.label ?? node.name ?? "", ...(node.compartments ?? []).map((value) => typeof value === "string" ? value : JSON.stringify(value))].join("\n").split("\n");
    const symbol = controlSizes.get(node.kind);
    const ownHeight = symbol ? symbol[1] : Math.max(76, Math.min(16, lines.length) * 18 + 24, Number(node.height) || 0);
    const ownWidth = symbol ? symbol[0] : Math.max(160, Math.min(280, Math.max(0, ...lines.map((line) => line.length)) * 7 + 32), Number(node.width) || 0);
    for (const child of items) measure(child);
    const behavioral = ["action", "activity", "state"].includes(view.kind);
    const edges = view.edges.filter((edge) => !behavioral || flowKinds.has(edge.kind)).map((edge) => [directChildOf(edge.source, id), directChildOf(edge.target, id)]).filter(([a, b]) => a && b && a !== b);
    const ranks2 = topologicalRanks(items, edges);
    const rows = [];
    for (const child of [...items].sort((a, b) => ranks2.get(a) - ranks2.get(b) || items.indexOf(a) - items.indexOf(b))) {
      const childSize = sizes.get(child), rank = ranks2.get(child), previous = rows.at(-1);
      if (!previous || previous.rank !== rank || !behavioral && previous.width + 16 + childSize.width > contentWidth - 32) rows.push({ rank, ids: [child], width: childSize.width, height: childSize.height });
      else {
        previous.ids.push(child);
        previous.width += 16 + childSize.width;
        previous.height = Math.max(previous.height, childSize.height);
      }
    }
    const childWidth = Math.max(0, ...rows.map((row) => row.width));
    const containerWidth = Math.max(ownWidth, items.length ? childWidth + 32 : 0);
    let y = ownHeight + 16;
    const positions = [];
    for (const row of rows) {
      let x = (containerWidth - row.width) / 2;
      for (const child of row.ids) {
        const childSize = sizes.get(child);
        positions.push({ id: child, x, y: y + (row.height - childSize.height) / 2, width: childSize.width, height: childSize.height });
        x += childSize.width + 16;
      }
      y += row.height + 16;
    }
    childPlacements.set(id, positions);
    const size = { width: containerWidth, height: items.length ? y : ownHeight, headerHeight: ownHeight };
    visiting.delete(id);
    sizes.set(id, size);
    return size;
  }
  for (const node of view.nodes) measure(node.id);
  const rootOf = (id) => {
    let node = nodeMap.get(id), count = 0;
    while (node?.parentId && nodeMap.has(node.parentId)) {
      node = nodeMap.get(node.parentId);
      if (++count > view.nodes.length) throw new Error("Cyclic native drawing containment");
    }
    return node?.id;
  };
  const general = /* @__PURE__ */ new Set(["general", "gv", "requirement", "definition", "tree", "mixed", "structure"]);
  const orderedEdges = view.edges.map((edge) => {
    const a = rootOf(edge.source), b = rootOf(edge.target);
    return general.has(view.kind) && ["derive", "derivation", "typing", "type", "specialization", "satisfy", "satisfaction", "verify", "verification"].includes(edge.kind) ? [b, a] : [a, b];
  });
  const ranks = topologicalRanks(roots.map((node) => node.id), orderedEdges);
  const reserved = panels.map((panel) => ({ ...copy(panel) })), occupied = [...reserved], placed = /* @__PURE__ */ new Map();
  let minimumY = padding, lastRank = -1, rankBottom = padding;
  for (const node of [...roots].sort((a, b) => ranks.get(a.id) - ranks.get(b.id) || a.id.localeCompare(b.id))) {
    const rank = ranks.get(node.id), size = sizes.get(node.id);
    if (rank !== lastRank) {
      minimumY = rankBottom + (lastRank < 0 ? 0 : gap);
      lastRank = rank;
    }
    const ys = [minimumY, ...occupied.map((rect) => rect.y + rect.height + gap).filter((y) => y >= minimumY)].sort((a, b) => a - b);
    let position = null;
    for (const y of [...new Set(ys)]) {
      const xs = [padding, ...occupied.filter((rect) => y < rect.y + rect.height + gap && y + size.height + gap > rect.y).map((rect) => rect.x + rect.width + gap)].sort((a, b) => a - b);
      for (const x of [...new Set(xs)]) {
        const rect = { x, y, width: size.width, height: size.height };
        if (x + size.width > width - padding) continue;
        if (!occupied.some((other) => intersects(rect, other, gap))) {
          position = rect;
          break;
        }
      }
      if (position) break;
    }
    if (!position) {
      const y = Math.max(minimumY, ...occupied.map((rect) => rect.y + rect.height + gap));
      position = { x: padding, y, width: size.width, height: size.height };
    }
    occupied.push(position);
    placed.set(node.id, position);
    rankBottom = Math.max(rankBottom, position.y + position.height);
  }
  const result = [];
  function collect(id, rect) {
    const node = nodeMap.get(id);
    result.push({ ...node, ...rect });
    for (const child of childPlacements.get(id) ?? []) collect(child.id, { x: rect.x + child.x, y: rect.y + child.y, width: child.width, height: child.height });
  }
  for (const root of roots) collect(root.id, placed.get(root.id));
  const bounds = { x: 0, y: 0, width: Math.max(width, ...result.map((node) => node.x + node.width + padding)), height: Math.max(height, ...result.map((node) => node.y + node.height + padding)) };
  if (bounds.width > width || bounds.height > height) omissions.push({ reason: "layout-overflow", message: "The scene needs scrolling or fewer elements to retain readable node sizes." });
  return { ...view, nodes: result, panels: reserved, bounds, omissions };
}
function semanticIds(scene2) {
  return [...new Set((scene2.nodes ?? scene2.view?.nodes ?? []).map((node) => node.semanticId).filter(Boolean))];
}
function planTransition(fromScene, toScene, options = {}) {
  const previous = fromScene.view ?? fromScene, next = toScene.view ?? toScene;
  const oldIds = semanticIds(previous), newIds = semanticIds(next), duration = options.reducedMotion ? 0 : 360;
  const correspondence = oldIds.filter((id) => newIds.includes(id)).map((semanticId) => ({ semanticId, fromRepresentationIds: previous.nodes.filter((node) => node.semanticId === semanticId).map((node) => node.id), toRepresentationIds: next.nodes.filter((node) => node.semanticId === semanticId).map((node) => node.id) }));
  if (previous.kind === next.kind) return { mode: "same-kind", correspondence, stages: [{ kind: "reflow", viewKind: next.kind, semanticIds: newIds, duration }] };
  const route = options.graph && fromScene.focus && toScene.focus ? findEngineeringRoute(options.graph, { ...options, from: fromScene.focus, to: toScene.focus }) : null;
  const journey = route?.found ? route.elements.map((element2) => element2.id) : [];
  const all = [.../* @__PURE__ */ new Set([...oldIds, ...journey, ...newIds])];
  return { mode: "cross-kind", correspondence, route, stages: [
    { kind: "gv-bridge", viewKind: "gv", semanticIds: oldIds, duration },
    { kind: "gv-journey", viewKind: "gv", semanticIds: all, route: route?.found ? route.relationships : [], disconnected: route?.found === false, duration },
    { kind: "gv-gather", viewKind: "gv", semanticIds: newIds, duration },
    { kind: "morph", viewKind: next.kind, semanticIds: newIds, duration }
  ] };
}

// src/canvas-prototype/graph.mjs
var refs = (value) => Array.isArray(value) ? value.flatMap(refs) : value && typeof value === "object" && typeof value["@id"] === "string" ? [value["@id"]] : [];
var camel = (value) => Array.isArray(value) ? value.map(camel) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()), camel(v)])) : value;
function adaptNativeView(raw, name) {
  const v = camel(raw);
  return { ...v, id: name, title: name, nodes: v.nodes ?? [], edges: v.edges ?? [], notices: v.notices ?? [] };
}
function modelGraph(raw, views = []) {
  const elements = raw.map((e) => ({ id: e["@id"], kind: e["@type"], name: e.declaredName || e.qualifiedName || e["@id"], qualifiedName: e.qualifiedName, description: e.body || "", native: e, layer: e["sysx:sourceLine"] ? "project" : "library" }));
  const index = new Map(elements.map((e) => [e.id, e])), relationships = [];
  const add = (source, target, kind, id, nativeRelationship) => {
    if (!source || !target) return;
    relationships.push({ id, source, target, kind, label: kind, authority: "native-api", nativeRelationship });
  };
  for (const item of raw) {
    const id = item["@id"];
    if (item["@type"] === "Dependency") for (const client of refs(item.client)) for (const supplier of refs(item.supplier)) add(client, supplier, "dependency", "api:" + id + ":" + client + ":" + supplier, id);
    if (["PartUsage", "PartDefinition"].includes(item["@type"])) {
      for (const child of refs(item.ownedMember)) if (index.get(child)?.kind === "PartUsage") add(id, child, "composition", `part:${id}:${child}`);
    }
    if (item["@type"]?.endsWith("Usage")) for (const type of refs(item.type)) add(id, type, "typing", `typing:${id}:${type}`);
    if (item["@type"] === "Documentation") for (const owner of refs(item.owner)) {
      const target = index.get(owner);
      if (target && !target.description) target.description = item.body || "";
    }
  }
  for (const view of views) {
    const nodes = new Map(view.nodes.map((n) => [n.id, n.semanticId]));
    for (const [i, edge] of view.edges.entries()) {
      const source = nodes.get(edge.fromId ?? edge.from ?? edge.source), target = nodes.get(edge.toId ?? edge.to ?? edge.target);
      add(source, target, edge.kind, `view:${view.id}:${i}`);
    }
  }
  const seen = /* @__PURE__ */ new Set();
  return { elements, relationships: relationships.filter((e) => {
    const key = JSON.stringify([e.source, e.target, e.kind]);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }) };
}
function graphView(graph, context, name = "Focused General View") {
  const known = new Map(graph.elements.map((e) => [e.id, e]));
  return { id: "explore:" + context.elements.map((e) => e.id).join(","), kind: "definition", title: name, omissions: context.omissions ?? [], nodes: context.elements.map((e) => ({ id: "gv:" + e.id, semanticId: e.id, name: e.name, kind: e.kind.replace(/(Usage|Definition)$/, "").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase(), qualifiedName: e.qualifiedName, detail: e.description || "", type: refs(e.native?.type).map((id) => known.get(id)?.name || id).join(", ") })), edges: context.relationships.map((e) => ({ ...e, semanticSource: e.source, semanticTarget: e.target, source: "gv:" + e.source, target: "gv:" + e.target })) };
}
function requireNativeIdentity(view) {
  const missing = view.nodes.filter((n) => !n.semanticId && !["synthetic", "control", "notation"].includes(n.identityStatus));
  if (missing.length) throw Error("Native semantic identity missing for " + missing.map((n) => n.name || n.id).join(", "));
  return view;
}

// node_modules/fflate/esm/browser.js
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start2) {
  var b = new u16(31);
  for (var i = 0; i < 31; ++i) {
    b[i] = start2 += 1 << eb[i - 1];
  }
  var r = new i32(b[30]);
  for (var i = 1; i < 30; ++i) {
    for (var j = b[i]; j < b[i + 1]; ++j) {
      r[j] = j - b[i] << 5 | i;
    }
  }
  return { b, r };
};
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x = (i & 43690) >> 1 | (i & 21845) << 1;
  x = (x & 52428) >> 2 | (x & 13107) << 2;
  x = (x & 61680) >> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
}
var x;
var i;
var hMap = function(cd, mb, r) {
  var s = cd.length;
  var i = 0;
  var l = new u16(mb);
  for (; i < s; ++i) {
    if (cd[i])
      ++l[cd[i] - 1];
  }
  var le = new u16(mb);
  for (i = 1; i < mb; ++i) {
    le[i] = le[i - 1] + l[i - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        var sv = i << 4 | cd[i];
        var r_1 = mb - cd[i];
        var v = le[cd[i] - 1]++ << r_1;
        for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
          co[rev[v] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        co[i] = rev[le[cd[i] - 1]++] >> 15 - cd[i];
      }
    }
  }
  return co;
};
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var flm = /* @__PURE__ */ hMap(flt, 9, 0);
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a) {
  var m = a[0];
  for (var i = 1; i < a.length; ++i) {
    if (a[i] > m)
      m = a[i];
  }
  return m;
};
var bits = function(d, p, m) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
};
var bits16 = function(d, p) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
};
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  return new u8(v.subarray(s, e));
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
];
var err = function(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt)
    throw e;
  return e;
};
var inflt = function(dat, st, buf, dict) {
  var sl = dat.length, dl = dict ? dict.length : 0;
  if (!sl || st.f && !st.l)
    return buf || new u8(0);
  var noBuf = !buf;
  var resize = noBuf || st.i != 2;
  var noSt = st.i;
  if (noBuf)
    buf = new u8(sl * 3);
  var cbuf = function(l2) {
    var bl = buf.length;
    if (l2 > bl) {
      var nbuf = new u8(Math.max(bl * 2, l2));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
  var tbts = sl * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
        if (t > sl) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + l);
        buf.set(dat.subarray(s, t), bt);
        st.b = bt += l, st.p = pos = t * 8, st.f = final;
        continue;
      } else if (type == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl);
        var clt = new u8(19);
        for (var i = 0; i < hcLen; ++i) {
          clt[clim[i]] = bits(dat, pos + i * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i = 0; i < tl; ) {
          var r = clm[bits(dat, pos, clbmsk)];
          pos += r & 15;
          var s = r >> 4;
          if (s < 16) {
            ldt[i++] = s;
          } else {
            var c = 0, n = 0;
            if (s == 16)
              n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
            else if (s == 17)
              n = 3 + bits(dat, pos, 7), pos += 3;
            else if (s == 18)
              n = 11 + bits(dat, pos, 127), pos += 7;
            while (n--)
              ldt[i++] = c;
          }
        }
        var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
        lbt = max(lt);
        dbt = max(dt);
        lm = hMap(lt, lbt, 1);
        dm = hMap(dt, dbt, 1);
      } else
        err(1);
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
    }
    if (resize)
      cbuf(bt + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (; ; lpos = pos) {
      var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
      pos += c & 15;
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
      if (!c)
        err(2);
      if (sym < 256)
        buf[bt++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i = sym - 257, b = fleb[i];
          add = bits(dat, pos, (1 << b) - 1) + fl[i];
          pos += b;
        }
        var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
        if (!d)
          err(3);
        pos += d & 15;
        var dt = fd[dsym];
        if (dsym > 3) {
          var b = fdeb[dsym];
          dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
        }
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + 131072);
        var end = bt + add;
        if (bt < dt) {
          var shift = dl - dt, dend = Math.min(dt, end);
          if (shift + bt < 0)
            err(3);
          for (; bt < dend; ++bt)
            buf[bt] = dict[shift + bt];
        }
        for (; bt < end; ++bt)
          buf[bt] = buf[bt - dt];
      }
    }
    st.l = lm, st.p = lpos, st.b = bt, st.f = final;
    if (lm)
      final = 1, st.m = lbt, st.d = dm, st.n = dbt;
  } while (!final);
  return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
var wbits = function(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
};
var wbits16 = function(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
  d[o + 2] |= v >> 16;
};
var hTree = function(d, mb) {
  var t = [];
  for (var i = 0; i < d.length; ++i) {
    if (d[i])
      t.push({ s: i, f: d[i] });
  }
  var s = t.length;
  var t2 = t.slice();
  if (!s)
    return { t: et, l: 0 };
  if (s == 1) {
    var v = new u8(t[0].s + 1);
    v[t[0].s] = 1;
    return { t: v, l: 1 };
  }
  t.sort(function(a, b) {
    return a.f - b.f;
  });
  t.push({ s: -1, f: 25001 });
  var l = t[0], r = t[1], i0 = 0, i1 = 1, i2 = 2;
  t[0] = { s: -1, f: l.f + r.f, l, r };
  while (i1 != s - 1) {
    l = t[t[i0].f < t[i2].f ? i0++ : i2++];
    r = t[i0 != i1 && t[i0].f < t[i2].f ? i0++ : i2++];
    t[i1++] = { s: -1, f: l.f + r.f, l, r };
  }
  var maxSym = t2[0].s;
  for (var i = 1; i < s; ++i) {
    if (t2[i].s > maxSym)
      maxSym = t2[i].s;
  }
  var tr = new u16(maxSym + 1);
  var mbt = ln(t[i1 - 1], tr, 0);
  if (mbt > mb) {
    var i = 0, dt = 0;
    var lft = mbt - mb, cst = 1 << lft;
    t2.sort(function(a, b) {
      return tr[b.s] - tr[a.s] || a.f - b.f;
    });
    for (; i < s; ++i) {
      var i2_1 = t2[i].s;
      if (tr[i2_1] > mb) {
        dt += cst - (1 << mbt - tr[i2_1]);
        tr[i2_1] = mb;
      } else
        break;
    }
    dt >>= lft;
    while (dt > 0) {
      var i2_2 = t2[i].s;
      if (tr[i2_2] < mb)
        dt -= 1 << mb - tr[i2_2]++ - 1;
      else
        ++i;
    }
    for (; i >= 0 && dt; --i) {
      var i2_3 = t2[i].s;
      if (tr[i2_3] == mb) {
        --tr[i2_3];
        ++dt;
      }
    }
    mbt = mb;
  }
  return { t: new u8(tr), l: mbt };
};
var ln = function(n, l, d) {
  return n.s == -1 ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1)) : l[n.s] = d;
};
var lc = function(c) {
  var s = c.length;
  while (s && !c[--s])
    ;
  var cl = new u16(++s);
  var cli = 0, cln = c[0], cls = 1;
  var w = function(v) {
    cl[cli++] = v;
  };
  for (var i = 1; i <= s; ++i) {
    if (c[i] == cln && i != s)
      ++cls;
    else {
      if (!cln && cls > 2) {
        for (; cls > 138; cls -= 138)
          w(32754);
        if (cls > 2) {
          w(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
          cls = 0;
        }
      } else if (cls > 3) {
        w(cln), --cls;
        for (; cls > 6; cls -= 6)
          w(8304);
        if (cls > 2)
          w(cls - 3 << 5 | 8208), cls = 0;
      }
      while (cls--)
        w(cln);
      cls = 1;
      cln = c[i];
    }
  }
  return { c: cl.subarray(0, cli), n: s };
};
var clen = function(cf, cl) {
  var l = 0;
  for (var i = 0; i < cl.length; ++i)
    l += cf[i] * cl[i];
  return l;
};
var wfblk = function(out, pos, dat) {
  var s = dat.length;
  var o = shft(pos + 2);
  out[o] = s & 255;
  out[o + 1] = s >> 8;
  out[o + 2] = out[o] ^ 255;
  out[o + 3] = out[o + 1] ^ 255;
  for (var i = 0; i < s; ++i)
    out[o + i + 4] = dat[i];
  return (o + 4 + s) * 8;
};
var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
  wbits(out, p++, final);
  ++lf[256];
  var _a2 = hTree(lf, 15), dlt = _a2.t, mlb = _a2.l;
  var _b2 = hTree(df, 15), ddt = _b2.t, mdb = _b2.l;
  var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
  var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
  var lcfreq = new u16(19);
  for (var i = 0; i < lclt.length; ++i)
    ++lcfreq[lclt[i] & 31];
  for (var i = 0; i < lcdt.length; ++i)
    ++lcfreq[lcdt[i] & 31];
  var _e = hTree(lcfreq, 7), lct = _e.t, mlcb = _e.l;
  var nlcc = 19;
  for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
    ;
  var flen = bl + 5 << 3;
  var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
  var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
  if (bs >= 0 && flen <= ftlen && flen <= dtlen)
    return wfblk(out, p, dat.subarray(bs, bs + bl));
  var lm, ll, dm, dl;
  wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
  if (dtlen < ftlen) {
    lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
    var llm = hMap(lct, mlcb, 0);
    wbits(out, p, nlc - 257);
    wbits(out, p + 5, ndc - 1);
    wbits(out, p + 10, nlcc - 4);
    p += 14;
    for (var i = 0; i < nlcc; ++i)
      wbits(out, p + 3 * i, lct[clim[i]]);
    p += 3 * nlcc;
    var lcts = [lclt, lcdt];
    for (var it = 0; it < 2; ++it) {
      var clct = lcts[it];
      for (var i = 0; i < clct.length; ++i) {
        var len = clct[i] & 31;
        wbits(out, p, llm[len]), p += lct[len];
        if (len > 15)
          wbits(out, p, clct[i] >> 5 & 127), p += clct[i] >> 12;
      }
    }
  } else {
    lm = flm, ll = flt, dm = fdm, dl = fdt;
  }
  for (var i = 0; i < li; ++i) {
    var sym = syms[i];
    if (sym > 255) {
      var len = sym >> 18 & 31;
      wbits16(out, p, lm[len + 257]), p += ll[len + 257];
      if (len > 7)
        wbits(out, p, sym >> 23 & 31), p += fleb[len];
      var dst = sym & 31;
      wbits16(out, p, dm[dst]), p += dl[dst];
      if (dst > 3)
        wbits16(out, p, sym >> 5 & 8191), p += fdeb[dst];
    } else {
      wbits16(out, p, lm[sym]), p += ll[sym];
    }
  }
  wbits16(out, p, lm[256]);
  return p + ll[256];
};
var deo = /* @__PURE__ */ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
var et = /* @__PURE__ */ new u8(0);
var dflt = function(dat, lvl, plvl, pre, post, st) {
  var s = st.z || dat.length;
  var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7e3)) + post);
  var w = o.subarray(pre, o.length - post);
  var lst = st.l;
  var pos = (st.r || 0) & 7;
  if (lvl) {
    if (pos)
      w[0] = st.r >> 3;
    var opt = deo[lvl - 1];
    var n = opt >> 13, c = opt & 8191;
    var msk_1 = (1 << plvl) - 1;
    var prev = st.p || new u16(32768), head = st.h || new u16(msk_1 + 1);
    var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
    var hsh = function(i2) {
      return (dat[i2] ^ dat[i2 + 1] << bs1_1 ^ dat[i2 + 2] << bs2_1) & msk_1;
    };
    var syms = new i32(25e3);
    var lf = new u16(288), df = new u16(32);
    var lc_1 = 0, eb = 0, i = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
    for (; i + 2 < s; ++i) {
      var hv = hsh(i);
      var imod = i & 32767, pimod = head[hv];
      prev[imod] = pimod;
      head[hv] = imod;
      if (wi <= i) {
        var rem = s - i;
        if ((lc_1 > 7e3 || li > 24576) && (rem > 423 || !lst)) {
          pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i - bs, pos);
          li = lc_1 = eb = 0, bs = i;
          for (var j = 0; j < 286; ++j)
            lf[j] = 0;
          for (var j = 0; j < 30; ++j)
            df[j] = 0;
        }
        var l = 2, d = 0, ch_1 = c, dif = imod - pimod & 32767;
        if (rem > 2 && hv == hsh(i - dif)) {
          var maxn = Math.min(n, rem) - 1;
          var maxd = Math.min(32767, i);
          var ml = Math.min(258, rem);
          while (dif <= maxd && --ch_1 && imod != pimod) {
            if (dat[i + l] == dat[i + l - dif]) {
              var nl = 0;
              for (; nl < ml && dat[i + nl] == dat[i + nl - dif]; ++nl)
                ;
              if (nl > l) {
                l = nl, d = dif;
                if (nl > maxn)
                  break;
                var mmd = Math.min(dif, nl - 2);
                var md = 0;
                for (var j = 0; j < mmd; ++j) {
                  var ti = i - dif + j & 32767;
                  var pti = prev[ti];
                  var cd = ti - pti & 32767;
                  if (cd > md)
                    md = cd, pimod = ti;
                }
              }
            }
            imod = pimod, pimod = prev[imod];
            dif += imod - pimod & 32767;
          }
        }
        if (d) {
          syms[li++] = 268435456 | revfl[l] << 18 | revfd[d];
          var lin = revfl[l] & 31, din = revfd[d] & 31;
          eb += fleb[lin] + fdeb[din];
          ++lf[257 + lin];
          ++df[din];
          wi = i + l;
          ++lc_1;
        } else {
          syms[li++] = dat[i];
          ++lf[dat[i]];
        }
      }
    }
    for (i = Math.max(i, wi); i < s; ++i) {
      syms[li++] = dat[i];
      ++lf[dat[i]];
    }
    pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i - bs, pos);
    if (!lst) {
      st.r = pos & 7 | w[pos / 8 | 0] << 3;
      pos -= 7;
      st.h = head, st.p = prev, st.i = i, st.w = wi;
    }
  } else {
    for (var i = st.w || 0; i < s + lst; i += 65535) {
      var e = i + 65535;
      if (e >= s) {
        w[pos / 8 | 0] = lst;
        e = s;
      }
      pos = wfblk(w, pos + 1, dat.subarray(i, e));
    }
    st.i = s;
  }
  return slc(o, 0, pre + shft(pos) + post);
};
var crct = /* @__PURE__ */ function() {
  var t = new Int32Array(256);
  for (var i = 0; i < 256; ++i) {
    var c = i, k = 9;
    while (--k)
      c = (c & 1 && -306674912) ^ c >>> 1;
    t[i] = c;
  }
  return t;
}();
var crc = function() {
  var c = -1;
  return {
    p: function(d) {
      var cr = c;
      for (var i = 0; i < d.length; ++i)
        cr = crct[cr & 255 ^ d[i]] ^ cr >>> 8;
      c = cr;
    },
    d: function() {
      return ~c;
    }
  };
};
var dopt = function(dat, opt, pre, post, st) {
  if (!st) {
    st = { l: 1 };
    if (opt.dictionary) {
      var dict = opt.dictionary.subarray(-32768);
      var newDat = new u8(dict.length + dat.length);
      newDat.set(dict);
      newDat.set(dat, dict.length);
      dat = newDat;
      st.w = dict.length;
    }
  }
  return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20 : 12 + opt.mem, pre, post, st);
};
var mrg = function(a, b) {
  var o = {};
  for (var k in a)
    o[k] = a[k];
  for (var k in b)
    o[k] = b[k];
  return o;
};
var b2 = function(d, b) {
  return d[b] | d[b + 1] << 8;
};
var b4 = function(d, b) {
  return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
};
var b8 = function(d, b) {
  return b4(d, b) + b4(d, b + 4) * 4294967296;
};
var wbytes = function(d, b, v) {
  for (; v; ++b)
    d[b] = v, v >>>= 8;
};
function deflateSync(data, opts) {
  return dopt(data, opts || {}, 0, 0);
}
function inflateSync(data, opts) {
  return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
var fltn = function(d, p, t, o) {
  for (var k in d) {
    var val = d[k], n = p + k, op = o;
    if (Array.isArray(val))
      op = mrg(o, val[1]), val = val[0];
    if (val instanceof u8)
      t[n] = [val, op];
    else {
      t[n += "/"] = [new u8(0), op];
      fltn(val, n, t, o);
    }
  }
};
var te = typeof TextEncoder != "undefined" && /* @__PURE__ */ new TextEncoder();
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {
}
var dutf8 = function(d) {
  for (var r = "", i = 0; ; ) {
    var c = d[i++];
    var eb = (c > 127) + (c > 223) + (c > 239);
    if (i + eb > d.length)
      return { s: r, r: slc(d, i - 1) };
    if (!eb)
      r += String.fromCharCode(c);
    else if (eb == 3) {
      c = ((c & 15) << 18 | (d[i++] & 63) << 12 | (d[i++] & 63) << 6 | d[i++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
    } else if (eb & 1)
      r += String.fromCharCode((c & 31) << 6 | d[i++] & 63);
    else
      r += String.fromCharCode((c & 15) << 12 | (d[i++] & 63) << 6 | d[i++] & 63);
  }
};
function strToU8(str, latin1) {
  if (latin1) {
    var ar_1 = new u8(str.length);
    for (var i = 0; i < str.length; ++i)
      ar_1[i] = str.charCodeAt(i);
    return ar_1;
  }
  if (te)
    return te.encode(str);
  var l = str.length;
  var ar = new u8(str.length + (str.length >> 1));
  var ai = 0;
  var w = function(v) {
    ar[ai++] = v;
  };
  for (var i = 0; i < l; ++i) {
    if (ai + 5 > ar.length) {
      var n = new u8(ai + 8 + (l - i << 1));
      n.set(ar);
      ar = n;
    }
    var c = str.charCodeAt(i);
    if (c < 128 || latin1)
      w(c);
    else if (c < 2048)
      w(192 | c >> 6), w(128 | c & 63);
    else if (c > 55295 && c < 57344)
      c = 65536 + (c & 1023 << 10) | str.charCodeAt(++i) & 1023, w(240 | c >> 18), w(128 | c >> 12 & 63), w(128 | c >> 6 & 63), w(128 | c & 63);
    else
      w(224 | c >> 12), w(128 | c >> 6 & 63), w(128 | c & 63);
  }
  return slc(ar, 0, ai);
}
function strFromU8(dat, latin1) {
  if (latin1) {
    var r = "";
    for (var i = 0; i < dat.length; i += 16384)
      r += String.fromCharCode.apply(null, dat.subarray(i, i + 16384));
    return r;
  } else if (td) {
    return td.decode(dat);
  } else {
    var _a2 = dutf8(dat), s = _a2.s, r = _a2.r;
    if (r.length)
      err(8);
    return s;
  }
}
var slzh = function(d, b) {
  return b + 30 + b2(d, b + 26) + b2(d, b + 28);
};
var zh = function(d, b, z) {
  var fnl = b2(d, b + 28), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl, bs = b4(d, b + 20);
  var _a2 = z && bs == 4294967295 ? z64e(d, es) : [bs, b4(d, b + 24), b4(d, b + 42)], sc = _a2[0], su = _a2[1], off = _a2[2];
  return [b2(d, b + 10), sc, su, fn, es + b2(d, b + 30) + b2(d, b + 32), off];
};
var z64e = function(d, b) {
  for (; b2(d, b) != 1; b += 4 + b2(d, b + 2))
    ;
  return [b8(d, b + 12), b8(d, b + 4), b8(d, b + 20)];
};
var exfl = function(ex) {
  var le = 0;
  if (ex) {
    for (var k in ex) {
      var l = ex[k].length;
      if (l > 65535)
        err(9);
      le += l + 4;
    }
  }
  return le;
};
var wzh = function(d, b, f, fn, u, c, ce, co) {
  var fl2 = fn.length, ex = f.extra, col = co && co.length;
  var exl = exfl(ex);
  wbytes(d, b, ce != null ? 33639248 : 67324752), b += 4;
  if (ce != null)
    d[b++] = 20, d[b++] = f.os;
  d[b] = 20, b += 2;
  d[b++] = f.flag << 1 | (c < 0 && 8), d[b++] = u && 8;
  d[b++] = f.compression & 255, d[b++] = f.compression >> 8;
  var dt = new Date(f.mtime == null ? Date.now() : f.mtime), y = dt.getFullYear() - 1980;
  if (y < 0 || y > 119)
    err(10);
  wbytes(d, b, y << 25 | dt.getMonth() + 1 << 21 | dt.getDate() << 16 | dt.getHours() << 11 | dt.getMinutes() << 5 | dt.getSeconds() >> 1), b += 4;
  if (c != -1) {
    wbytes(d, b, f.crc);
    wbytes(d, b + 4, c < 0 ? -c - 2 : c);
    wbytes(d, b + 8, f.size);
  }
  wbytes(d, b + 12, fl2);
  wbytes(d, b + 14, exl), b += 16;
  if (ce != null) {
    wbytes(d, b, col);
    wbytes(d, b + 6, f.attrs);
    wbytes(d, b + 10, ce), b += 14;
  }
  d.set(fn, b);
  b += fl2;
  if (exl) {
    for (var k in ex) {
      var exf = ex[k], l = exf.length;
      wbytes(d, b, +k);
      wbytes(d, b + 2, l);
      d.set(exf, b + 4), b += 4 + l;
    }
  }
  if (col)
    d.set(co, b), b += col;
  return b;
};
var wzf = function(o, b, c, d, e) {
  wbytes(o, b, 101010256);
  wbytes(o, b + 8, c);
  wbytes(o, b + 10, c);
  wbytes(o, b + 12, d);
  wbytes(o, b + 16, e);
};
function zipSync(data, opts) {
  if (!opts)
    opts = {};
  var r = {};
  var files = [];
  fltn(data, "", r, opts);
  var o = 0;
  var tot = 0;
  for (var fn in r) {
    var _a2 = r[fn], file = _a2[0], p = _a2[1];
    var compression = p.level == 0 ? 0 : 8;
    var f = strToU8(fn), s = f.length;
    var com = p.comment, m = com && strToU8(com), ms = m && m.length;
    var exl = exfl(p.extra);
    if (s > 65535)
      err(11);
    var d = compression ? deflateSync(file, p) : file, l = d.length;
    var c = crc();
    c.p(file);
    files.push(mrg(p, {
      size: file.length,
      crc: c.d(),
      c: d,
      f,
      m,
      u: s != fn.length || m && com.length != ms,
      o,
      compression
    }));
    o += 30 + s + exl + l;
    tot += 76 + 2 * (s + exl) + (ms || 0) + l;
  }
  var out = new u8(tot + 22), oe = o, cdl = tot - o;
  for (var i = 0; i < files.length; ++i) {
    var f = files[i];
    wzh(out, f.o, f, f.f, f.u, f.c.length);
    var badd = 30 + f.f.length + exfl(f.extra);
    out.set(f.c, f.o + badd);
    wzh(out, o, f, f.f, f.u, f.c.length, f.o, f.m), o += 16 + badd + (f.m ? f.m.length : 0);
  }
  wzf(out, o, files.length, cdl, oe);
  return out;
}
function unzipSync(data, opts) {
  var files = {};
  var e = data.length - 22;
  for (; b4(data, e) != 101010256; --e) {
    if (!e || data.length - e > 65558)
      err(13);
  }
  ;
  var c = b2(data, e + 8);
  if (!c)
    return {};
  var o = b4(data, e + 16);
  var z = o == 4294967295 || c == 65535;
  if (z) {
    var ze = b4(data, e - 12);
    z = b4(data, ze) == 101075792;
    if (z) {
      c = b4(data, ze + 32);
      o = b4(data, ze + 48);
    }
  }
  var fltr = opts && opts.filter;
  for (var i = 0; i < c; ++i) {
    var _a2 = zh(data, o, z), c_2 = _a2[0], sc = _a2[1], su = _a2[2], fn = _a2[3], no = _a2[4], off = _a2[5], b = slzh(data, off);
    o = no;
    if (!fltr || fltr({
      name: fn,
      size: sc,
      originalSize: su,
      compression: c_2
    })) {
      if (!c_2)
        files[fn] = slc(data, b, b + sc);
      else if (c_2 == 8)
        files[fn] = inflateSync(data.subarray(b, b + sc), { out: new u8(su) });
      else
        err(14, "unknown compression type " + c_2);
    }
  }
  return files;
}

// src/canvas-prototype/project.mjs
var SCHEMA = "syspresent.project.v1";
function projectPath(name) {
  if (typeof name !== "string" || !name || name.startsWith("/") || name.includes("\\") || name.includes(":") || name.split("/").some((x) => x === ".." || x === "." || !x)) throw Error("Invalid project path: " + name);
  return name;
}
var fileText = (project, name) => {
  const value = project.files[projectPath(name)];
  if (value === void 0) throw Error("Missing project file: " + name);
  return typeof value === "string" ? value : strFromU8(value);
};
function validateProject(project) {
  const m = project.manifest;
  if (m?.schemaVersion !== SCHEMA) throw Error("Unsupported project manifest");
  for (const key of ["modelSources", "viewSources", "systemOfInterest"]) if (!Array.isArray(m[key]) || !m[key].length || !m[key].every((x) => typeof x === "string" && x)) throw Error("Project requires " + key);
  for (const name of [...m.modelSources, ...m.viewSources, m.story, ...m.assets ?? []]) fileText(project, name);
  if ((/* @__PURE__ */ new Set([...m.modelSources, ...m.viewSources])).size !== m.modelSources.length + m.viewSources.length) throw Error("Model and view source files must be separate");
  if (!["complete", "scoped"].includes(m.publication?.scope)) throw Error("Publication scope must be complete or scoped");
  return project;
}
function parseStory(markdown2) {
  const scenes = [], pattern = /^```syspresent\s*\n([\s\S]*?)\n```[ \t]*$/gm;
  let previous;
  for (const match of markdown2.matchAll(pattern)) {
    if (previous) previous.markdown = markdown2.slice(previous.bodyStart, match.index).trim();
    let config;
    try {
      config = JSON.parse(match[1]);
    } catch {
      throw Error("Invalid scene JSON near character " + match.index);
    }
    if (config.type !== "scene") throw Error("Canvas prototype requires scene blocks");
    for (const key of ["id", "title", "view", "focus"]) if (typeof config[key] !== "string" || !config[key]) throw Error("Scene requires " + key);
    if (scenes.some((s) => s.id === config.id)) throw Error("Duplicate scene " + config.id);
    if (config.journey !== void 0 && (!Array.isArray(config.journey) || !config.journey.every((x) => typeof x === "string" && x))) throw Error("Invalid scene journey");
    if (!["right", "bottom", "left"].includes(config.panel?.placement ?? "right")) throw Error("Unsupported panel placement");
    previous = { ...config, bodyStart: match.index + match[0].length, markdown: "" };
    scenes.push(previous);
  }
  if (previous) previous.markdown = markdown2.slice(previous.bodyStart).trim();
  return scenes.map(({ bodyStart, ...scene2 }) => scene2);
}
function writeStory(title, scenes) {
  return "# " + title + "\n\n" + scenes.map(({ markdown: markdown2, ...config }) => "```syspresent\n" + JSON.stringify({ ...config, type: "scene" }) + "\n```\n\n" + (markdown2 ?? "").trim() + "\n").join("\n");
}
function packProject(project) {
  validateProject(project);
  const files = {};
  for (const [name, data] of Object.entries(project.files)) files[projectPath(name)] = typeof data === "string" ? strToU8(data) : data;
  files["project.json"] = strToU8(JSON.stringify(project.manifest, null, 2) + "\n");
  return zipSync(files, { level: 6 });
}
function unpackProject(bytes) {
  let expanded = 0;
  const files = unzipSync(bytes, { filter: (entry) => {
    projectPath(entry.name.replace(/\/$/, ""));
    if (entry.name.endsWith("/")) return false;
    if (entry.originalSize > 64 * 1024 * 1024 || (expanded += entry.originalSize) > 160 * 1024 * 1024) throw Error("Project archive exceeds prototype size limit");
    return true;
  } });
  if (!files["project.json"]) throw Error("Project archive requires project.json at its root");
  return validateProject({ manifest: JSON.parse(strFromU8(files["project.json"])), files });
}
function documentsFor(project) {
  return [...project.manifest.modelSources, ...project.manifest.viewSources].map((name) => ({ name, content: fileText(project, name), language: name.endsWith(".kerml") ? "kerml" : "sysml" }));
}
function appendScene(project, scene2) {
  const scenes = parseStory(fileText(project, project.manifest.story));
  if (scenes.some((s) => s.id === scene2.id)) throw Error("Scene ID already exists");
  scenes.push(scene2);
  project.files[project.manifest.story] = writeStory(project.manifest.title, scenes);
  return scenes;
}
function captureViewSource({ packageName = "CanvasCaptured", name, qualifiedNames, definition = "GeneralView" }) {
  const quoted = (s) => "'" + s.replaceAll("\\", "\\\\").replaceAll("'", "\\'") + "'";
  if (!["GeneralView", "ActionFlowView", "InterconnectionView", "StateTransitionView", "SequenceView"].includes(definition)) throw Error("Unsupported captured view definition");
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(packageName)) throw Error("Invalid captured package name");
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(name)) throw Error("Invalid captured view name");
  const refs2 = [...new Set(qualifiedNames)];
  if (!refs2.length) throw Error("Capture requires native-qualified model elements");
  const reference = (q) => q.split("::").map(quoted).join("::");
  return `package ${packageName} {
    private import StandardViewDefinitions::*;
    view ${name} : ${definition} {
${refs2.map((q) => "        expose " + reference(q) + ";").join("\n")}
    }
}
`;
}
function requirementCoverageSource(qualifiedRoots, packageName = "SyspresentRuntimeContext") {
  const quoted = (s) => "'" + s.replaceAll("\\", "\\\\").replaceAll("'", "\\'") + "'";
  return `package ${packageName} {
 private import StandardViewDefinitions::*;
 view coverage : GeneralView {
  filter @SysML::RequirementUsage or @SysML::RequirementDefinition;
${qualifiedRoots.map((q) => "  expose " + q.split("::").map(quoted).join("::") + "::**;").join("\n")}
 }
}
`;
}

// src/canvas-prototype/app.mjs
var $ = (id) => document.getElementById(id);
var el = (name, text, cls) => {
  const e = document.createElement(name);
  if (text !== void 0) e.textContent = text;
  if (cls) e.className = cls;
  return e;
};
var button = (text, fn) => {
  const e = el("button", text);
  e.type = "button";
  e.onclick = () => Promise.resolve(fn()).catch(report);
  return e;
};
var state = { engine: null, project: null, graph: null, views: /* @__PURE__ */ new Map(), scenes: [], sceneIndex: 0, focus: null, selected: null, view: null, displayed: null, exploring: false, expanded: /* @__PURE__ */ new Set(), rects: /* @__PURE__ */ new Map(), reduce: matchMedia("(prefers-reduced-motion: reduce)").matches, revision: 0, loadRevision: 0, animations: [], transitioning: false, provenance: null, history: [] };
var report = (error) => {
  $("status").textContent = error.message || String(error);
  $("editor-error").textContent = error.message || String(error);
  console.error(error);
};
var element = (id) => state.graph?.elements.find((e) => e.id === id);
var label = (id) => element(id)?.name || id;
var resolve = (value) => state.graph?.elements.find((e) => e.id === value || e.qualifiedName === value)?.id;
var qname = (id) => element(id)?.qualifiedName;
var scene = () => state.scenes[state.sceneIndex];
function scopeIds() {
  const roots = state.project.manifest.systemOfInterest;
  return state.graph.elements.filter((e) => roots.some((root) => e.qualifiedName === root || e.qualifiedName?.startsWith(root + "::"))).map((e) => e.id);
}
function status(text) {
  $("status").textContent = text;
}
function inline(parent, text) {
  let start2 = 0;
  for (const m of text.matchAll(/\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*/g)) {
    parent.append(document.createTextNode(text.slice(start2, m.index)));
    parent.append(el(m[1] ? "strong" : m[2] ? "code" : "em", m[1] ?? m[2] ?? m[3]));
    start2 = m.index + m[0].length;
  }
  parent.append(document.createTextNode(text.slice(start2)));
}
function markdown(text) {
  const host = el("div");
  let paragraph = [], list;
  const flush = () => {
    if (paragraph.length) {
      const p = el("p");
      inline(p, paragraph.join(" "));
      host.append(p);
      paragraph = [];
    }
    list = null;
  };
  for (const line of text.split("\n")) {
    const heading = /^(#{1,6})\s+(.+)$/.exec(line), item = /^[-*]\s+(.+)$/.exec(line);
    if (heading) {
      flush();
      host.append(el("h" + Math.min(6, Number(heading[1].length) + 1), heading[2]));
    } else if (item) {
      if (paragraph.length) flush();
      if (!list) {
        list = el("ul");
        host.append(list);
      }
      const li = el("li");
      inline(li, item[1]);
      list.append(li);
    } else if (!line.trim()) flush();
    else paragraph.push(line);
  }
  flush();
  return host;
}
async function exampleProject() {
  const manifest = await fetch("./example/project.json").then((r) => {
    if (!r.ok) throw Error("Example project unavailable");
    return r.json();
  });
  const files = {};
  await Promise.all([...manifest.modelSources, ...manifest.viewSources, manifest.story, ...manifest.assets].map(async (name) => {
    const r = await fetch("./example/" + name);
    if (!r.ok) throw Error("Missing example " + name);
    files[name] = await r.text();
  }));
  return validateProject({ manifest, files });
}
async function compile(project) {
  let parsed = await state.engine.call("ParseSources", { documents: documentsFor(project) });
  const errors = (parsed.diagnostics ?? []).filter((d) => String(d.severity).toLowerCase().includes("error"));
  if (errors.length) throw Error(errors.map((d) => `${d.message} (${d.span?.file ?? "source"}:${d.span?.startLine ?? "?"})`).join("\n"));
  if (!parsed.modelHash) throw Error("Native engine returned no model identity");
  let exported = await state.engine.call("ExportModel", { modelHash: parsed.modelHash });
  if (!Array.isArray(exported.elements)) throw Error("Native model export has no element array");
  const rootIDs = (parsed.roots ?? []).flatMap((r) => r.childIds ?? []), roots = exported.elements.filter((e) => rootIDs.includes(e["@id"]) && e.qualifiedName).map((e) => e.qualifiedName);
  let runtimePackage = "SyspresentRuntimeContext";
  while (exported.elements.some((e) => e.qualifiedName === runtimePackage)) runtimePackage += "X";
  parsed = await state.engine.call("ParseSources", { documents: [...documentsFor(project), { name: "__syspresent_runtime_context.sysml", content: requirementCoverageSource(roots, runtimePackage) }] });
  const runtimeErrors = (parsed.diagnostics ?? []).filter((d) => String(d.severity).toLowerCase().includes("error"));
  if (runtimeErrors.length) throw Error(runtimeErrors.map((d) => d.message).join("\n"));
  exported = await state.engine.call("ExportModel", { modelHash: parsed.modelHash });
  const coverage = requireNativeIdentity(adaptNativeView(await state.engine.call("RenderView", { modelHash: parsed.modelHash, view: runtimePackage + "::coverage", includeSemanticIdentity: true }), runtimePackage + "::coverage"));
  exported.elements = exported.elements.filter((e) => e.qualifiedName !== runtimePackage && !e.qualifiedName?.startsWith(runtimePackage + "::"));
  const viewNames = exported.elements.filter((e) => e["@type"] === "ViewUsage" && e.qualifiedName && e["sysx:sourceLine"]).map((e) => e.qualifiedName);
  const views = /* @__PURE__ */ new Map();
  for (const name of viewNames) {
    const raw = await state.engine.call("RenderView", { modelHash: parsed.modelHash, view: name, includeSemanticIdentity: true });
    views.set(name, requireNativeIdentity(adaptNativeView(raw, name)));
  }
  const graph = modelGraph(exported.elements, [...views.values(), coverage]);
  for (const root of project.manifest.systemOfInterest) if (!graph.elements.some((e) => e.qualifiedName === root)) throw Error("System of interest does not resolve: " + root);
  const scenes = parseStory(fileText(project, project.manifest.story));
  const byName = (value) => graph.elements.find((e) => e.id === value || e.qualifiedName === value)?.id;
  for (const [sceneIndex, item] of scenes.entries()) {
    if (item.journey?.length && (byName(item.journey.at(-1)) !== byName(item.focus) || sceneIndex > 0 && byName(item.journey[0]) !== byName(scenes[sceneIndex - 1].focus))) throw Error(`Scene ${item.id}: saved journey must connect the previous scene focus to this focus`);
    if (!views.has(item.view)) throw Error(`Scene ${item.id}: native view ${item.view} does not resolve`);
    if (!byName(item.focus)) throw Error(`Scene ${item.id}: focus ${item.focus} does not resolve`);
    for (let i = 1; i < (item.journey ?? []).length; i++) {
      const from = byName(item.journey[i - 1]), to = byName(item.journey[i]);
      if (!from || !to || !findEngineeringRoute(graph, { from, to, maxHops: 1 }).found) throw Error(`Scene ${item.id}: saved journey has a missing engineering connection`);
    }
  }
  for (let i = 1; i < scenes.length; i++) {
    const a = scenes[i - 1], b = scenes[i], plan = planTransition({ view: views.get(a.view), focus: byName(a.focus) }, { view: views.get(b.view), focus: byName(b.focus) }, { graph, scopeIds: graph.elements.filter((e) => project.manifest.systemOfInterest.some((root) => e.qualifiedName === root || e.qualifiedName?.startsWith(root + "::"))).map((e) => e.id) });
    if (plan.mode === "cross-kind" && !plan.route.found) throw Error(`Scene ${b.id}: no engineering route from the previous scene within the presentation boundary`);
  }
  return { project, modelHash: parsed.modelHash, exported, graph, views, scenes, coverage };
}
function busy(value) {
  for (const id of ["previous", "next", "scenes", "standalone", "return", "fit", "find-toggle", "edit"]) $(id).disabled = value;
}
async function loadProject(project) {
  const revision = ++state.loadRevision;
  ++state.revision;
  busy(true);
  status("Parsing project with OpenSysML WASM\u2026");
  $("selection").hidden = true;
  let compiled;
  try {
    compiled = await compile(validateProject(project));
  } catch (error) {
    if (revision === state.loadRevision) {
      busy(false);
      $("previous").disabled = state.sceneIndex === 0;
      $("next").disabled = state.sceneIndex === state.scenes.length - 1;
    }
    throw error;
  }
  if (revision !== state.loadRevision) return;
  Object.assign(state, compiled, { sceneIndex: 0, selected: null, exploring: false, expanded: /* @__PURE__ */ new Set(), rects: /* @__PURE__ */ new Map(), view: null, displayed: null, history: [], extraViews: /* @__PURE__ */ new Map() });
  busy(false);
  updateLists();
  $("editor-error").textContent = "";
  $("project-menu").open = false;
  if (state.scenes.length) await showScene(0, false);
  else {
    state.focus = resolve(project.manifest.systemOfInterest[0]);
    await explore(state.focus);
  }
  status(`OpenSysML WASM \xB7 ${state.graph.elements.length} native elements \xB7 ${state.views.size} views`);
  $("boundary").textContent = project.manifest.publication.scope === "scoped" ? "Scoped publication \xB7 traversal stays within supplied model" : "Complete project \xB7 standalone exploration available";
}
function updateLists() {
  $("scenes").replaceChildren();
  for (const [i, s] of state.scenes.entries()) {
    const option = el("option", `${i + 1}. ${s.title}`);
    option.value = i;
    $("scenes").append(option);
  }
  $("views").replaceChildren();
  for (const name of state.views.keys()) {
    const option = el("option", name);
    option.value = name;
    $("views").append(option);
  }
  $("view-file").replaceChildren();
  for (const name of state.project.manifest.viewSources) {
    const option = el("option", name);
    option.value = name;
    $("view-file").append(option);
  }
}
function panelGeometry() {
  const panel = $("narrative"), stage = $("stage");
  if (state.exploring || !scene()) {
    panel.hidden = true;
    return [];
  }
  panel.hidden = false;
  panel.replaceChildren(el("div", `Scene ${state.sceneIndex + 1} of ${state.scenes.length}`, "scene-count"), el("h2", scene().title), markdown(scene().markdown));
  const width = stage.clientWidth, height = stage.clientHeight, narrow = width < 700, placement = narrow ? "bottom" : scene().panel?.placement ?? "right";
  panel.style.cssText = "";
  panel.style.width = (narrow ? width - 24 : Math.min(390, Math.max(280, width * 0.3))) + "px";
  if (placement === "bottom") {
    panel.style.width = width - 24 + "px";
    panel.style.left = "12px";
    panel.style.bottom = "58px";
    panel.style.maxHeight = (narrow ? Math.max(140, height * 0.27) : Math.max(140, height * 0.25)) + "px";
  } else {
    panel.style.top = "16px";
    panel.style[placement === "left" ? "left" : "right"] = "16px";
    panel.style.maxHeight = Math.max(140, height - 90) + "px";
  }
  const a = panel.getBoundingClientRect(), b = stage.getBoundingClientRect();
  return [{ id: "narrative", x: a.x - b.x, y: a.y - b.y, width: a.width, height: a.height }];
}
function sizeView(view) {
  return { ...view, nodes: view.nodes.map((n) => {
    const expanded = state.expanded.has(n.semanticId), detail = expanded ? element(n.semanticId)?.description || n.detail || "No statement or documentation recorded." : n.kind === "requirement" ? n.detail ?? "" : "";
    const lines = Math.max(1, Math.ceil(detail.length / 32));
    return { ...n, displayDetail: detail, height: detail ? Math.max(n.height || 0, 58 + lines * 16) : n.height };
  }) };
}
function cancelAnimations() {
  for (const a of state.animations) a.cancel();
  state.animations = [];
}
function svgel(name, attrs = {}) {
  const e = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}
function edgePoints(a, b) {
  const ac = { x: a.x + a.width / 2, y: a.y + a.height / 2 }, bc = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  if (Math.abs(ac.y - bc.y) > Math.abs(ac.x - bc.x) * 0.5) {
    const down = bc.y > ac.y, start3 = { x: ac.x, y: down ? a.y + a.height : a.y }, end2 = { x: bc.x, y: down ? b.y : b.y + b.height }, middle2 = (start3.y + end2.y) / 2;
    return { d: `M${start3.x},${start3.y} L${start3.x},${middle2} L${end2.x},${middle2} L${end2.x},${end2.y}`, x: (start3.x + end2.x) / 2, y: middle2 - 5 };
  }
  const right = bc.x > ac.x, start2 = { x: right ? a.x + a.width : a.x, y: ac.y }, end = { x: right ? b.x : b.x + b.width, y: bc.y }, middle = (start2.x + end.x) / 2;
  return { d: `M${start2.x},${start2.y} L${middle},${start2.y} L${middle},${end.y} L${end.x},${end.y}`, x: middle + 4, y: (start2.y + end.y) / 2 - 5 };
}
async function frame(view, caption = "", duration = 0) {
  cancelAnimations();
  const stage = $("stage"), width = stage.clientWidth, height = stage.clientHeight, panels = panelGeometry();
  const layout = layoutScene(sizeView(view), { width, height, panels, padding: 16, gap: 24 }), area = graphArea(width, height, panels), nodes = layout.nodes;
  const fitted = fitNodes(nodes, area), scale = fitted.scale, positioned = fitted.nodes, byID = new Map(positioned.map((n) => [n.id, n]));
  const svg = $("connections");
  svg.replaceChildren();
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const defs = svgel("defs"), marker = svgel("marker", { id: "arrow", markerWidth: 9, markerHeight: 7, refX: 8, refY: 3.5, orient: "auto", markerUnits: "strokeWidth" });
  marker.append(svgel("path", { d: "M0,0 L8,3.5 L0,7", fill: "none", stroke: "#426869", "stroke-width": 1.4 }));
  defs.append(marker);
  svg.append(defs);
  for (const e of layout.edges) {
    const a = byID.get(e.source), b = byID.get(e.target);
    if (!a || !b) continue;
    const path = edgePoints(a, b), group = svgel("g", { "data-relationship": e.semanticId || e.id });
    const line = svgel("path", { d: path.d, fill: "none", stroke: "#426869", "stroke-width": 1.5, "marker-end": "url(#arrow)" });
    if (["satisfy", "verify", "dependency", "derive", "typing", "specialization"].includes(e.kind)) line.setAttribute("stroke-dasharray", "5 3");
    group.append(line);
    if (e.label) {
      const text = svgel("text", { x: path.x, y: path.y, "font-size": 12, fill: "#355e60", "paint-order": "stroke", stroke: "#f5f7f7", "stroke-width": 4 });
      text.textContent = e.label;
      group.append(text);
    }
    svg.append(group);
    if (duration && !state.reduce) state.animations.push(group.animate([{ opacity: 0 }, { opacity: 1 }], { duration, fill: "both" }));
  }
  const host = $("nodes");
  host.replaceChildren();
  const nextRects = /* @__PURE__ */ new Map();
  for (const n of positioned) {
    const children = nodes.some((c) => c.parentId === n.id), semantic = n.semanticId, node = el("button", void 0, `node ${n.kind}${children ? " container" : ""}${semantic && semantic === state.selected ? " selected" : ""}`);
    node.type = "button";
    node.dataset.representation = n.id;
    if (semantic) node.dataset.semanticId = semantic;
    node.setAttribute("aria-label", `${n.name || n.kind}: select ${n.kind}`);
    node.style.width = n.width / scale + "px";
    node.style.height = n.height / scale + "px";
    node.style.zIndex = String(children ? 0 : 3);
    node.style.transform = `translate(${n.x}px,${n.y}px) scale(${scale})`;
    const shortName = n.name?.includes("::") ? n.name.split("::").at(-1) : n.name;
    node.append(el("span", `\xAB${n.kind}\xBB${n.type ? " : " + n.type : ""}`, "kind"), el("span", shortName || n.kind, "name"));
    if (n.displayDetail && !children) node.append(el("span", n.displayDetail, "detail"));
    node.onclick = (event) => {
      event.stopPropagation();
      select(semantic, n);
    };
    node.oncontextmenu = (event) => {
      event.preventDefault();
      select(semantic, n);
    };
    host.append(node);
    const key = semantic || `${view.id}:${n.id}`, old = state.rects.get(key);
    nextRects.set(key, { x: n.x, y: n.y, scale });
    if (duration && !state.reduce) {
      const from = old ? `translate(${old.x}px,${old.y}px) scale(${old.scale})` : `translate(${n.x}px,${n.y}px) scale(${scale * 0.85})`;
      state.animations.push(node.animate([{ transform: from, opacity: old ? 1 : 0 }, { transform: node.style.transform, opacity: 1 }], { duration, easing: "cubic-bezier(.2,.65,.25,1)", fill: "both" }));
    }
  }
  state.rects = nextRects;
  state.layout = { ...layout, displayNodes: positioned, scale, area };
  state.displayed = view;
  const omissions = view.omissions ?? [];
  $("context-details").hidden = !omissions.length;
  $("context-details").textContent = `Context (${omissions.length})`;
  $("transition").textContent = caption || `${view.kind} \xB7 ${nodes.length} elements`;
  if (duration && !state.reduce) await Promise.all(state.animations.map((a) => a.finished.catch(() => {
  })));
}
function gather(ids) {
  const set = new Set(ids), elements = state.graph.elements.filter((e) => set.has(e.id));
  return graphView(state.graph, { elements, relationships: state.graph.relationships.filter((e) => set.has(e.source) && set.has(e.target)) }, "General View journey");
}
async function transitionTo(view, focus, { animate = true, journey, allowDisconnected = false } = {}) {
  const revision = ++state.revision, previous = state.view;
  const plan = previous ? planTransition({ view: previous, focus: state.previousFocus }, { view, focus }, { graph: state.graph, scopeIds: state.exploring ? void 0 : scopeIds(), reducedMotion: state.reduce }) : null;
  if (journey?.length > 1 && plan?.route && resolve(journey[0]) === state.previousFocus && resolve(journey.at(-1)) === focus) {
    const ids = journey.map(resolve);
    const routeEdges = [];
    for (let i = 1; i < ids.length; i++) {
      const route = findEngineeringRoute(state.graph, { from: ids[i - 1], to: ids[i], scopeIds: scopeIds(), maxHops: 1 });
      if (!route.found) throw Error("Saved journey no longer resolves within the presentation boundary");
      routeEdges.push(...route.relationships);
    }
    plan.route = { found: true, elements: ids.map(element), relationships: routeEdges };
    const stage = plan.stages.find((s) => s.kind === "gv-journey");
    if (stage) {
      stage.route = routeEdges;
      stage.semanticIds = ids;
    }
  }
  const disconnected = plan?.mode === "cross-kind" && plan.route?.found === false;
  if (disconnected && !state.exploring && !allowDisconnected) throw Error("No engineering route connects these viewpoints within the presentation system. Explore the model to open a disconnected viewpoint explicitly.");
  $("selection").hidden = true;
  state.transitioning = true;
  state.lastTransition = plan;
  try {
    if (animate && plan && !disconnected) {
      for (const step of plan.stages) {
        if (revision !== state.revision) return;
        const projected = step.viewKind === "gv" ? gather(step.semanticIds) : view;
        await frame(projected, step.kind === "gv-bridge" ? "General View \xB7 leaving the current notation" : step.kind === "gv-journey" ? "General View \xB7 following engineering connections" : step.kind === "gv-gather" ? "General View \xB7 gathering destination features" : step.kind === "morph" ? "Arranging the destination view" : "Rearranging within this notation", step.duration);
      }
    }
    if (revision !== state.revision) return;
    await frame(view, disconnected ? "No engineering route \xB7 explicit view jump" : "", disconnected && !state.reduce ? 240 : 0);
    if (revision !== state.revision) return;
    state.view = view;
    state.focus = focus;
    state.previousFocus = focus;
    $("boundary").textContent = !scopeIds().includes(focus) ? "Outside presentation boundary \xB7 loaded model context" : state.project.manifest.publication.scope === "scoped" ? "Scoped publication \xB7 supplied model context only" : "Complete project \xB7 standalone exploration available";
  } finally {
    if (revision === state.revision) state.transitioning = false;
  }
}
async function showScene(index, animate = true) {
  if (index < 0 || index >= state.scenes.length) return;
  const saved = { sceneIndex: state.sceneIndex, exploring: state.exploring, selected: state.selected };
  state.sceneIndex = index;
  state.exploring = false;
  state.selected = null;
  const s = scene();
  const focus = resolve(s.focus), view = state.views.get(s.view);
  try {
    if (!focus || !view) throw Error("Scene focus or native view is unavailable");
    await transitionTo(view, focus, { animate, journey: s.journey, allowDisconnected: true });
  } catch (error) {
    Object.assign(state, saved);
    if (state.view) await frame(state.view);
    throw error;
  } finally {
    $("scenes").value = state.sceneIndex;
    $("previous").disabled = state.sceneIndex === 0;
    $("next").disabled = state.sceneIndex === state.scenes.length - 1;
    $("return").hidden = !state.exploring || !state.scenes.length;
    $("standalone").hidden = state.exploring;
  }
}
async function explore(id, kind) {
  if (!id || !element(id)) throw Error("Model target unavailable");
  const revision = ++state.revision, modelHash = state.modelHash;
  let view;
  if (kind) {
    const q = qname(id);
    if (!q) throw Error("Native view requires a qualified model identity");
    const raw = await state.engine.call("RenderView", { modelHash, view: `#${kind}:${q}`, includeSemanticIdentity: true });
    if (revision !== state.revision || modelHash !== state.modelHash) return;
    view = { ...requireNativeIdentity(adaptNativeView(raw, `#${kind}:${q}`)), capture: { definition: kind === "action" ? "ActionFlowView" : "InterconnectionView", root: q } };
    state.extraViews ??= /* @__PURE__ */ new Map();
    state.extraViews.set(view.id, view);
    state.graph = modelGraph(state.exported.elements, [...state.views.values(), state.coverage, ...state.extraViews.values()]);
  }
  if (revision !== state.revision) return;
  state.history.push({ view: state.view, focus: state.focus });
  state.exploring = true;
  $("return").hidden = !state.scenes.length;
  $("standalone").hidden = true;
  if (view) await transitionTo(view, id);
  else {
    const context = engineeringContext(state.graph, { focus: id, depth: 1, budget: 14 });
    await transitionTo(graphView(state.graph, context), id);
    status(`Focused General View \xB7 ${context.elements.length} elements \xB7 ${context.omissions.length} context boundaries (details available)`);
  }
}
function select(id, node) {
  state.selected = id || null;
  for (const n of $("nodes").children) n.classList.toggle("selected", !!id && n.dataset.semanticId === id);
  const menu = $("selection");
  menu.replaceChildren(el("strong", node?.name || label(id)));
  menu.hidden = false;
  if (!id) {
    menu.append(el("p", "This is a native notation/control element; it has no model-element identity."), button("Close", () => {
      menu.hidden = true;
    }));
    return;
  }
  menu.append(button("Focus", () => explore(id)), button(state.expanded.has(id) ? "Collapse compartment" : "Show statement / compartment", async () => {
    if (state.expanded.has(id)) state.expanded.delete(id);
    else state.expanded.add(id);
    await frame(state.view);
    select(id, node);
  }));
  const e = element(id);
  if (["PartUsage", "PartDefinition", "Package"].includes(e?.kind)) menu.append(button("Internal view", () => explore(id, "interconnection")));
  if (["ActionUsage", "ActionDefinition"].includes(e?.kind)) menu.append(button("Activity view", () => explore(id, "action")));
  const kinds = [...new Set(state.graph.relationships.filter((r) => r.source === id || r.target === id).map((r) => r.kind))].filter((k) => !["typing", "owner", "specialization"].includes(k));
  for (const kind of kinds) menu.append(button(`Follow ${kind} relationships`, async () => {
    state.exploring = true;
    $("return").hidden = !state.scenes.length;
    const context = engineeringContext(state.graph, { focus: id, relationshipKinds: [kind], depth: 1, budget: 14 });
    await transitionTo(graphView(state.graph, context), id);
  }));
  const typing = directTypingContext(state.graph, id);
  if (typing.elements.length > 1) menu.append(button("Show direct type context", async () => {
    state.exploring = true;
    $("return").hidden = !state.scenes.length;
    await transitionTo(graphView(state.graph, typing, "Explicit typing context"), id);
  }));
  menu.append(button("Close", () => {
    menu.hidden = true;
  }));
}
function download(name, bytes, type) {
  const blob = new Blob([bytes], { type }), url = URL.createObjectURL(blob), a = el("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3e3);
}
function openEditor() {
  if (!state.project) return;
  $("scene-title").value = scene()?.title || "New scene";
  $("scene-prose").value = scene()?.markdown || "";
  $("panel-placement").value = scene()?.panel?.placement || "right";
  $("view-source").value = fileText(state.project, $("view-file").value);
  $("editor-error").textContent = "";
  $("editor").showModal();
}
async function capture() {
  if (!state.view) throw Error("Open a view before capturing a scene");
  let viewName = state.view.id;
  const project = structuredClone(state.project), number = state.scenes.length + 1;
  if (!state.views.has(viewName)) {
    if (!state.view.capture) throw Error("This focused graph cannot yet be captured faithfully as a native SysML view. Open a declared view, Internal view, or Activity view, then capture it.");
    const names = [state.view.capture.root];
    const name = "scene" + number;
    const packageName = "CanvasCaptured" + number;
    const filename = "captured-views.sysml";
    const declaration = captureViewSource({ packageName, name, qualifiedNames: names, definition: state.view.capture.definition });
    project.files[filename] = (project.files[filename] ? fileText(project, filename) + "\n" : "") + declaration;
    if (!project.manifest.viewSources.includes(filename)) project.manifest.viewSources.push(filename);
    viewName = packageName + "::" + name;
  }
  const s = { type: "scene", id: "captured-" + Date.now(), title: $("scene-title").value || "Captured view", view: viewName, focus: qname(state.focus), panel: { placement: $("panel-placement").value }, markdown: $("scene-prose").value };
  if (!s.focus) throw Error("Captured focus needs a native qualified identity");
  appendScene(project, s);
  await loadProject(project);
  await showScene(state.scenes.length - 1, false);
  $("editor").close();
  status("Scene captured. Export the project ZIP or Markdown to keep it.");
}
function bind() {
  $("previous").onclick = () => showScene(state.sceneIndex - 1).catch(report);
  $("next").onclick = () => showScene(state.sceneIndex + 1).catch(report);
  $("scenes").onchange = () => showScene(Number($("scenes").value)).catch(report);
  $("standalone").onclick = async () => {
    try {
      state.exploring = true;
      $("return").hidden = !state.scenes.length;
      $("standalone").hidden = true;
      await transitionTo(state.view, state.focus);
      status("Explore this native view \xB7 select an element for contextual actions");
    } catch (error) {
      report(error);
    }
  };
  $("return").onclick = () => showScene(state.sceneIndex).catch(report);
  $("fit").onclick = () => frame(state.view).catch(report);
  $("reduce").setAttribute("aria-pressed", state.reduce);
  $("reduce").onclick = () => {
    state.reduce = !state.reduce;
    $("reduce").setAttribute("aria-pressed", state.reduce);
  };
  $("find-toggle").onclick = () => {
    $("find").hidden = !$("find").hidden;
    if (!$("find").hidden) $("search").focus();
  };
  $("search").oninput = () => {
    const q = $("search").value.trim().toLowerCase();
    $("search-results").replaceChildren();
    if (!q) return;
    const hits = state.graph.elements.filter((e) => e.qualifiedName && e.layer === "project" && e.native.declaredName && (e.name + " " + e.qualifiedName).toLowerCase().includes(q));
    for (const e of hits.slice(0, 30)) $("search-results").append(button(e.qualifiedName, async () => {
      $("find").hidden = true;
      await explore(e.id);
    }));
  };
  $("open-view").onclick = async () => {
    try {
      const view = state.views.get($("views").value);
      if (!view) return;
      const target = view.nodes.find((n) => n.semanticId)?.semanticId;
      state.exploring = true;
      $("return").hidden = !state.scenes.length;
      $("find").hidden = true;
      await transitionTo(view, target);
    } catch (e) {
      report(e);
    }
  };
  $("context-details").onclick = () => {
    const omissions = state.displayed?.omissions ?? [];
    $("information-text").textContent = omissions.map((o) => `${["unavailable", "outside-scope", "metamodel-boundary"].includes(o.reason) ? "Unavailable / boundary" : "Hidden by view policy"}: ${o.reason} \xB7 ${label(o.target)} (${o.target})`).join("\n") + "\n\nCoverage: part composition, dependencies and direct types come from the native API. Other engineering links come from native requirement and declared views. Unprojected relationship kinds may be unavailable.";
    $("information").showModal();
  };
  $("edit").onclick = openEditor;
  $("view-file").onchange = () => {
    $("view-source").value = fileText(state.project, $("view-file").value);
  };
  $("save-scene").onclick = async () => {
    try {
      if (!scene()) throw Error("Capture a first scene before editing it");
      scene().title = $("scene-title").value;
      scene().markdown = $("scene-prose").value;
      scene().panel = { placement: $("panel-placement").value };
      state.project.files[state.project.manifest.story] = writeStory(state.project.manifest.title, state.scenes);
      updateLists();
      $("editor").close();
      await showScene(state.sceneIndex, false);
    } catch (e) {
      report(e);
    }
  };
  $("capture-scene").onclick = () => capture().catch(report);
  $("apply-views").onclick = async () => {
    try {
      const project = structuredClone(state.project);
      project.files[$("view-file").value] = $("view-source").value;
      await loadProject(project);
      $("editor").close();
    } catch (e) {
      report(e);
    }
  };
  $("import-project").onclick = () => {
    $("project-file").click();
  };
  $("project-file").onchange = async () => {
    try {
      const file = $("project-file").files[0];
      if (file) await loadProject(unpackProject(new Uint8Array(await file.arrayBuffer())));
    } catch (e) {
      report(e);
    } finally {
      $("project-file").value = "";
    }
  };
  $("import-markdown").onclick = () => {
    $("markdown-file").click();
  };
  $("markdown-file").onchange = async () => {
    try {
      const file = $("markdown-file").files[0];
      if (file) {
        const project = structuredClone(state.project);
        project.files[project.manifest.story] = await file.text();
        await loadProject(project);
      }
    } catch (e) {
      report(e);
    } finally {
      $("markdown-file").value = "";
    }
  };
  $("export-project").onclick = () => {
    try {
      download("syspresent-project.zip", packProject(state.project), "application/zip");
      $("project-menu").open = false;
    } catch (e) {
      report(e);
    }
  };
  $("export-markdown").onclick = () => {
    download("story.md", fileText(state.project, state.project.manifest.story), "text/markdown");
    $("project-menu").open = false;
  };
  $("load-example").onclick = () => exampleProject().then(loadProject).catch(report);
  $("about").onclick = () => {
    $("information-text").textContent = JSON.stringify({ engine: state.provenance, project: state.project.manifest, modelHash: state.modelHash, graph: { elements: state.graph.elements.length, relationships: state.graph.relationships.length }, view: state.view.id, lastTransition: state.lastTransition, notice: state.exported.notice }, null, 2);
    $("information").showModal();
  };
  $("stage").onclick = (e) => {
    if (e.target === $("stage") || e.target === $("nodes")) $("selection").hidden = true;
  };
  let resize;
  new ResizeObserver(() => {
    clearTimeout(resize);
    resize = setTimeout(() => {
      if (state.view && !state.transitioning) frame(state.view).catch(report);
    }, 100);
  }).observe($("stage"));
}
async function start() {
  bind();
  busy(true);
  state.engine = createSemanticEngine({ assetBase: new URL("./engine/", location.href), workerURL: new URL("./engine/worker.js", location.href) });
  const [project, info] = await Promise.all([exampleProject(), state.engine.ready]);
  state.provenance = await fetch("./engine/provenance.json").then((r) => r.ok ? r.json() : info);
  await loadProject(project);
}
start().catch(report);
//# sourceMappingURL=app.js.map

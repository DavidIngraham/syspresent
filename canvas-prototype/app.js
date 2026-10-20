var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/elkjs/lib/elk-api.js
var require_elk_api = __commonJS({
  "node_modules/elkjs/lib/elk-api.js"(exports, module) {
    (function(f) {
      if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f();
      } else if (typeof define === "function" && define.amd) {
        define([], f);
      } else {
        var g;
        if (typeof window !== "undefined") {
          g = window;
        } else if (typeof global !== "undefined") {
          g = global;
        } else if (typeof self !== "undefined") {
          g = self;
        } else {
          g = this;
        }
        g.ELK = f();
      }
    })(function() {
      var define2, module2, exports2;
      return (/* @__PURE__ */ function() {
        function r(e, n, t) {
          function o(i2, f) {
            if (!n[i2]) {
              if (!e[i2]) {
                var c = "function" == typeof __require && __require;
                if (!f && c) return c(i2, true);
                if (u) return u(i2, true);
                var a = new Error("Cannot find module '" + i2 + "'");
                throw a.code = "MODULE_NOT_FOUND", a;
              }
              var p = n[i2] = { exports: {} };
              e[i2][0].call(p.exports, function(r2) {
                var n2 = e[i2][1][r2];
                return o(n2 || r2);
              }, p, p.exports, r, e, n, t);
            }
            return n[i2].exports;
          }
          for (var u = "function" == typeof __require && __require, i = 0; i < t.length; i++) o(t[i]);
          return o;
        }
        return r;
      }())({ 1: [function(require2, module3, exports3) {
        "use strict";
        Object.defineProperty(exports3, "__esModule", {
          value: true
        });
        exports3["default"] = void 0;
        function _typeof(o) {
          "@babel/helpers - typeof";
          return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
            return typeof o2;
          } : function(o2) {
            return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
          }, _typeof(o);
        }
        function _classCallCheck(a, n) {
          if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
        }
        function _defineProperties(e, r) {
          for (var t = 0; t < r.length; t++) {
            var o = r[t];
            o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey(o.key), o);
          }
        }
        function _createClass(e, r, t) {
          return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: false }), e;
        }
        function _toPropertyKey(t) {
          var i = _toPrimitive(t, "string");
          return "symbol" == _typeof(i) ? i : i + "";
        }
        function _toPrimitive(t, r) {
          if ("object" != _typeof(t) || !t) return t;
          var e = t[Symbol.toPrimitive];
          if (void 0 !== e) {
            var i = e.call(t, r || "default");
            if ("object" != _typeof(i)) return i;
            throw new TypeError("@@toPrimitive must return a primitive value.");
          }
          return ("string" === r ? String : Number)(t);
        }
        var ELK2 = exports3["default"] = /* @__PURE__ */ function() {
          function ELK3() {
            var _this = this;
            var _ref = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, _ref$defaultLayoutOpt = _ref.defaultLayoutOptions, defaultLayoutOptions = _ref$defaultLayoutOpt === void 0 ? {} : _ref$defaultLayoutOpt, _ref$algorithms = _ref.algorithms, algorithms = _ref$algorithms === void 0 ? ["layered", "stress", "mrtree", "radial", "force", "disco", "sporeOverlap", "sporeCompaction", "rectpacking"] : _ref$algorithms, workerFactory = _ref.workerFactory, workerUrl = _ref.workerUrl;
            _classCallCheck(this, ELK3);
            this.defaultLayoutOptions = defaultLayoutOptions;
            this.initialized = false;
            if (typeof workerUrl === "undefined" && typeof workerFactory === "undefined") {
              throw new Error("Cannot construct an ELK without both 'workerUrl' and 'workerFactory'.");
            }
            var factory = workerFactory;
            if (typeof workerUrl !== "undefined" && typeof workerFactory === "undefined") {
              factory = function factory2(url) {
                return new Worker(url);
              };
            }
            var worker = factory(workerUrl);
            if (typeof worker.postMessage !== "function") {
              throw new TypeError("Created worker does not provide the required 'postMessage' function.");
            }
            this.worker = new PromisedWorker(worker);
            this.worker.postMessage({
              cmd: "register",
              algorithms
            }).then(function(r) {
              return _this.initialized = true;
            })["catch"](console.err);
          }
          return _createClass(ELK3, [{
            key: "layout",
            value: function layout(graph) {
              var _ref2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, _ref2$layoutOptions = _ref2.layoutOptions, layoutOptions = _ref2$layoutOptions === void 0 ? this.defaultLayoutOptions : _ref2$layoutOptions, _ref2$logging = _ref2.logging, logging = _ref2$logging === void 0 ? false : _ref2$logging, _ref2$measureExecutio = _ref2.measureExecutionTime, measureExecutionTime = _ref2$measureExecutio === void 0 ? false : _ref2$measureExecutio;
              if (!graph) {
                return Promise.reject(new Error("Missing mandatory parameter 'graph'."));
              }
              return this.worker.postMessage({
                cmd: "layout",
                graph,
                layoutOptions,
                options: {
                  logging,
                  measureExecutionTime
                }
              });
            }
          }, {
            key: "knownLayoutAlgorithms",
            value: function knownLayoutAlgorithms() {
              return this.worker.postMessage({
                cmd: "algorithms"
              });
            }
          }, {
            key: "knownLayoutOptions",
            value: function knownLayoutOptions() {
              return this.worker.postMessage({
                cmd: "options"
              });
            }
          }, {
            key: "knownLayoutCategories",
            value: function knownLayoutCategories() {
              return this.worker.postMessage({
                cmd: "categories"
              });
            }
          }, {
            key: "terminateWorker",
            value: function terminateWorker() {
              if (this.worker) this.worker.terminate();
            }
          }]);
        }();
        var PromisedWorker = /* @__PURE__ */ function() {
          function PromisedWorker2(worker) {
            var _this2 = this;
            _classCallCheck(this, PromisedWorker2);
            if (worker === void 0) {
              throw new Error("Missing mandatory parameter 'worker'.");
            }
            this.resolvers = {};
            this.worker = worker;
            this.worker.onmessage = function(answer) {
              setTimeout(function() {
                _this2.receive(_this2, answer);
              }, 0);
            };
          }
          return _createClass(PromisedWorker2, [{
            key: "postMessage",
            value: function postMessage2(msg) {
              var id = this.id || 0;
              this.id = id + 1;
              msg.id = id;
              var self2 = this;
              return new Promise(function(resolve2, reject) {
                self2.resolvers[id] = function(err2, res) {
                  if (err2) {
                    self2.convertGwtStyleError(err2);
                    reject(err2);
                  } else {
                    resolve2(res);
                  }
                };
                self2.worker.postMessage(msg);
              });
            }
          }, {
            key: "receive",
            value: function receive(self2, answer) {
              var json = answer.data;
              var resolver = self2.resolvers[json.id];
              if (resolver) {
                delete self2.resolvers[json.id];
                if (json.error) {
                  resolver(json.error);
                } else {
                  resolver(null, json.data);
                }
              }
            }
          }, {
            key: "terminate",
            value: function terminate() {
              if (this.worker) {
                this.worker.terminate();
              }
            }
          }, {
            key: "convertGwtStyleError",
            value: function convertGwtStyleError(err2) {
              if (!err2) {
                return;
              }
              var javaException = err2["__java$exception"];
              if (javaException) {
                if (javaException.cause && javaException.cause.backingJsObject) {
                  err2.cause = javaException.cause.backingJsObject;
                  this.convertGwtStyleError(err2.cause);
                }
                delete err2["__java$exception"];
              }
            }
          }]);
        }();
      }, {}], 2: [function(require2, module3, exports3) {
        "use strict";
        var ELK2 = require2("./elk-api.js")["default"];
        Object.defineProperty(module3.exports, "__esModule", {
          value: true
        });
        module3.exports = ELK2;
        ELK2["default"] = ELK2;
      }, { "./elk-api.js": 1 }] }, {}, [2])(2);
    });
  }
});

// src/canvas-prototype/landing.mjs
function showLanding(document2, visible2) {
  const isLanding = Boolean(visible2);
  for (const id of ["viewer-header", "stage", "viewer-footer"]) {
    const element2 = document2.getElementById(id);
    if (element2) element2.hidden = isLanding;
  }
  const landing = document2.getElementById("landing");
  if (landing) landing.hidden = !isLanding;
  document2.body.classList.toggle("landing-mode", isLanding);
}

// src/canvas-prototype/reader-settings.mjs
var key = "syspresent.reader.v1";
var defaults = Object.freeze({ compartments: "all", routing: "square" });
function readerSettings(value = {}) {
  return {
    compartments: ["all", "none", "focused"].includes(value?.compartments) ? value.compartments : defaults.compartments,
    routing: ["square", "mind-map"].includes(value?.routing) ? value.routing : defaults.routing
  };
}
function loadReaderSettings(storage) {
  try {
    return readerSettings(JSON.parse(storage.getItem(key) || "{}"));
  } catch {
    return { ...defaults };
  }
}
function saveReaderSettings(storage, value) {
  const settings = readerSettings(value);
  try {
    storage.setItem(key, JSON.stringify(settings));
  } catch {
  }
  return settings;
}
function compartmentVisible(node, { mode = "all", focus, expanded = /* @__PURE__ */ new Set(), collapsed = /* @__PURE__ */ new Set() } = {}) {
  if (collapsed.has(node.semanticId)) return false;
  if (expanded.has(node.semanticId)) return true;
  return mode === "all" || mode === "focused" && !!node.semanticId && node.semanticId === focus;
}

// src/canvas-prototype/geometry.mjs
var overlaps = (a, b, gap = 0) => a.x < b.x + b.width + gap && a.x + a.width + gap > b.x && a.y < b.y + b.height + gap && a.y + a.height + gap > b.y;
var centre = (n) => ({ x: n.x + n.width / 2, y: n.y + n.height / 2 });
function graphArea(width, height, panels = []) {
  const left = 16, top = 16, right = Math.max(left + 1, width - 16), bottom = Math.max(top + 1, height - 60);
  const xs = [left, right, ...panels.flatMap((p) => [Math.max(left, p.x - 16), Math.min(right, p.x + p.width + 16)])];
  const ys = [top, bottom, ...panels.flatMap((p) => [Math.max(top, p.y - 16), Math.min(bottom, p.y + p.height + 16)])];
  const candidates = [];
  for (const x of xs) for (const r of xs) for (const y of ys) for (const b of ys) {
    const rect = { x, y, width: r - x, height: b - y };
    if (rect.width > 0 && rect.height > 0 && !panels.some((p) => overlaps(rect, p))) candidates.push(rect);
  }
  return candidates.sort((a, b) => b.width * b.height - a.width * a.height)[0] ?? { x: left, y: top, width: right - left, height: bottom - top };
}
function fitNodes(nodes, area) {
  const minX = nodes.length ? Math.min(...nodes.map((n) => n.x)) : 0, minY = nodes.length ? Math.min(...nodes.map((n) => n.y)) : 0;
  const maxX = nodes.length ? Math.max(...nodes.map((n) => n.x + n.width)) : 1, maxY = nodes.length ? Math.max(...nodes.map((n) => n.y + n.height)) : 1;
  const scale = Math.min(1.4, area.width / (maxX - minX + 20), area.height / (maxY - minY + 20));
  const offsetX = area.x + (area.width - (maxX - minX) * scale) / 2 - minX * scale, offsetY = area.y + (area.height - (maxY - minY) * scale) / 2 - minY * scale;
  return { scale, nodes: nodes.map((n) => ({ ...n, x: n.x * scale + offsetX, y: n.y * scale + offsetY, width: n.width * scale, height: n.height * scale })) };
}
var simplify = (points) => points.filter((p, i) => !i || p.x !== points[i - 1].x || p.y !== points[i - 1].y).filter((p, i, all) => !i || i === all.length - 1 || !(all[i - 1].x === p.x && p.x === all[i + 1].x || all[i - 1].y === p.y && p.y === all[i + 1].y));
function segmentBlocked(a, b, obstacles) {
  return obstacles.some((n) => a.x === b.x ? a.x > n.x && a.x < n.x + n.width && Math.max(a.y, b.y) > n.y && Math.min(a.y, b.y) < n.y + n.height : a.y > n.y && a.y < n.y + n.height && Math.max(a.x, b.x) > n.x && Math.min(a.x, b.x) < n.x + n.width);
}
function routeOrthogonal(start2, end, obstacles, { bendPenalty = 14, segmentCost = () => 0 } = {}) {
  const xs = [.../* @__PURE__ */ new Set([start2.x, end.x, ...obstacles.flatMap((n) => [n.x, n.x + n.width])])].sort((a, b) => a - b);
  const ys = [.../* @__PURE__ */ new Set([start2.y, end.y, ...obstacles.flatMap((n) => [n.y, n.y + n.height])])].sort((a, b) => a - b);
  const points = [], byXY = /* @__PURE__ */ new Map();
  for (const x of xs) for (const y of ys) if (!obstacles.some((n) => x > n.x && x < n.x + n.width && y > n.y && y < n.y + n.height)) {
    byXY.set(x + "," + y, points.length);
    points.push({ x, y });
  }
  const first = byXY.get(start2.x + "," + start2.y), last = byXY.get(end.x + "," + end.y);
  if (first === void 0 || last === void 0) return null;
  const links = points.map(() => []);
  for (const axis of ["x", "y"]) {
    const groups = /* @__PURE__ */ new Map();
    for (const [i, p] of points.entries()) {
      const value = p[axis];
      if (!groups.has(value)) groups.set(value, []);
      groups.get(value).push(i);
    }
    for (const group of groups.values()) {
      group.sort((a, b) => points[a][axis === "x" ? "y" : "x"] - points[b][axis === "x" ? "y" : "x"]);
      for (let j = 1; j < group.length; j++) {
        const a = group[j - 1], b = group[j];
        if (!segmentBlocked(points[a], points[b], obstacles)) {
          const length2 = Math.abs(points[a].x - points[b].x) + Math.abs(points[a].y - points[b].y);
          links[a].push([b, length2, axis]);
          links[b].push([a, length2, axis]);
        }
      }
    }
  }
  const queue = [{ id: first, cost: 0, axis: "", path: [first] }], best = /* @__PURE__ */ new Map();
  while (queue.length) {
    queue.sort((a, b) => a.cost - b.cost);
    const current = queue.shift(), key2 = current.id + current.axis;
    if (best.has(key2) && best.get(key2) < current.cost) continue;
    if (current.id === last) return current.path.map((i) => points[i]);
    for (const [id, length2, axis] of links[current.id]) {
      const cost = current.cost + length2 + (current.axis && current.axis !== axis ? bendPenalty : 0) + Math.max(0, Number(segmentCost(points[current.id], points[id])) || 0), key3 = id + axis;
      if (best.has(key3) && best.get(key3) <= cost) continue;
      best.set(key3, cost);
      queue.push({ id, cost, axis, path: [...current.path, id] });
    }
  }
  return null;
}
function endpoints(a, b, sourceFraction = 0.5, targetFraction = 0.5) {
  const ac = centre(a), bc = centre(b), vertical = Math.abs(ac.y - bc.y) > Math.abs(ac.x - bc.x) * 0.5;
  const normal = (side) => ({ NORTH: { x: 0, y: -1 }, SOUTH: { x: 0, y: 1 }, EAST: { x: 1, y: 0 }, WEST: { x: -1, y: 0 } })[side];
  const defaultDirection = vertical ? { x: 0, y: bc.y > ac.y ? 1 : -1 } : { x: bc.x > ac.x ? 1 : -1, y: 0 };
  const sourceDirection = normal(a.kind === "port" ? a.portSide ?? a.side : "") ?? defaultDirection, targetDirection = normal(b.kind === "port" ? b.portSide ?? b.side : "") ?? { x: -defaultDirection.x, y: -defaultDirection.y };
  const attachment = (node, direction, fraction) => direction.x ? { x: node.x + (direction.x > 0 ? node.width : 0), y: node.y + node.height * fraction } : { x: node.x + node.width * fraction, y: node.y + (direction.y > 0 ? node.height : 0) };
  return [attachment(a, sourceDirection, sourceFraction), attachment(b, targetDirection, targetFraction), sourceDirection, targetDirection];
}
function connectionObstacles(edge, nodes) {
  const byID = new Map(nodes.map((n) => [n.id, n])), ancestors = /* @__PURE__ */ new Set(), leafPortOwners = /* @__PURE__ */ new Set();
  for (const id of [edge.source, edge.target]) {
    let node = byID.get(id);
    if (node?.kind === "port" && node.parentId && !byID.get(node.parentId)?.headerHeight) leafPortOwners.add(node.parentId);
    const seen = /* @__PURE__ */ new Set();
    while (node?.parentId && !seen.has(node.parentId)) {
      seen.add(node.parentId);
      ancestors.add(node.parentId);
      node = byID.get(node.parentId);
    }
  }
  return nodes.filter((n) => (n.opacity ?? 1) > 0.08 && n.width > 0 && n.height > 0).flatMap((n) => ancestors.has(n.id) && !leafPortOwners.has(n.id) ? n.headerHeight ? [{ ...n, height: n.headerHeight }] : [] : [n]);
}
function route(a, b, nodes, options = {}) {
  const [start2, end, direction, targetDirection] = endpoints(a, b, options.sourceFraction, options.targetFraction), clearance = options.clearance ?? 8;
  let stub = { x: start2.x + direction.x * clearance, y: start2.y + direction.y * clearance }, finish = { x: end.x + targetDirection.x * clearance, y: end.y + targetDirection.y * clearance };
  const obstacles = connectionObstacles({ source: a.id, target: b.id }, nodes).map((n) => ({ x: n.x - 4, y: n.y - 4, width: n.width + 8, height: n.height + 8 }));
  let middle = routeOrthogonal(stub, finish, obstacles);
  if (!middle && clearance > 4.1) {
    stub = { x: start2.x + direction.x * 4.1, y: start2.y + direction.y * 4.1 };
    finish = { x: end.x + targetDirection.x * 4.1, y: end.y + targetDirection.y * 4.1 };
    middle = routeOrthogonal(stub, finish, obstacles);
  }
  const points = middle ? simplify([start2, ...middle, end]) : [];
  return { points, d: points.map((p, i) => (i ? "L" : "M") + p.x + "," + p.y).join(" "), routingBlocked: !middle };
}
function lineCrossesRect(a, b, rect, padding = 0) {
  const left = rect.x - padding, top = rect.y - padding, right = rect.x + rect.width + padding, bottom = rect.y + rect.height + padding;
  let lo = 0, hi = 1;
  for (const [origin, delta, min, max2] of [[a.x, b.x - a.x, left, right], [a.y, b.y - a.y, top, bottom]]) {
    if (Math.abs(delta) < 1e-9) {
      if (origin <= min || origin >= max2) return false;
      continue;
    }
    let first = (min - origin) / delta, last = (max2 - origin) / delta;
    if (first > last) [first, last] = [last, first];
    lo = Math.max(lo, first);
    hi = Math.min(hi, last);
    if (lo >= hi) return false;
  }
  return hi > 0 && lo < 1;
}
function clearLeader(box, points, nodes, labels) {
  const from = { x: box.x + box.width / 2, y: box.y + box.height / 2 }, targets = [...points, ...points.slice(1).map((p, i) => ({ x: (p.x + points[i].x) / 2, y: (p.y + points[i].y) / 2 }))];
  targets.sort((a, b) => Math.hypot(a.x - from.x, a.y - from.y) - Math.hypot(b.x - from.x, b.y - from.y));
  const to = targets.find((target) => !nodes.some((n) => n.width > 0 && n.height > 0 && lineCrossesRect(from, target, n, 2)) && !labels.some((label2) => lineCrossesRect(from, target, label2, 2)));
  return to ? { from, to } : null;
}
function labelCandidates(points, width, height) {
  const candidates = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i], length2 = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    if (length2 < 8) continue;
    for (const t of [0.5, 0.25, 0.75]) {
      const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
      if (a.y === b.y) {
        candidates.push({ x: x - width / 2, y: y - height - 3, score: length2 }, { x: x - width / 2, y: y + 3, score: length2 - 1 });
      } else candidates.push({ x: x + 5, y: y - height / 2, score: length2 - 2 }, { x: x - width - 5, y: y - height / 2, score: length2 - 3 });
    }
  }
  return candidates.sort((a, b) => b.score - a.score);
}
function routeEdges(edges, nodes, options = {}) {
  const byID = new Map(nodes.map((n) => [n.id, n])), labels = [], ports = /* @__PURE__ */ new Map();
  const measured = (text2) => {
    const size = options.measureLabel?.(text2);
    return { width: Math.max(1, size?.width ?? String(text2).length * 7.2 + 4), height: Math.max(1, size?.height ?? 16) };
  };
  const ordered = [...edges].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  for (const edge of ordered) for (const side of ["source", "target"]) {
    const key2 = edge[side];
    if (!ports.has(key2)) ports.set(key2, []);
    ports.get(key2).push({ edge, side });
  }
  const fraction = (edge, side) => {
    const group = ports.get(edge[side]), index = group.findIndex((item) => item.edge === edge && item.side === side);
    return group.length === 1 ? 0.5 : 0.2 + 0.6 * (index + 0.5) / group.length;
  };
  const area = options.area;
  return edges.map((edge) => {
    const a = byID.get(edge.source), b = byID.get(edge.target);
    if (!a || !b) return null;
    const result = { ...edge, ...route(a, b, nodes, { ...options, sourceFraction: fraction(edge, "source"), targetFraction: fraction(edge, "target") }) };
    if (!edge.label || result.routingBlocked) return result;
    const size = measured(edge.label), valid = (box) => !nodes.some((n) => n.width > 0 && n.height > 0 && overlaps(box, n, 3)) && !labels.some((other) => overlaps(box, other, 4)) && (!area || box.x >= area.x && box.y >= area.y && box.x + box.width <= area.x + area.width && box.y + box.height <= area.y + area.height);
    let labelBox = labelCandidates(result.points, size.width, size.height).map((candidate) => ({ ...candidate, ...size })).find(valid);
    if (!labelBox) {
      const mid = result.points[1] ?? result.points[0], region = area ?? { x: Math.min(...nodes.map((n) => n.x)) - 80, y: Math.min(...nodes.map((n) => n.y)) - 40, width: Math.max(...nodes.map((n) => n.x + n.width)) - Math.min(...nodes.map((n) => n.x)) + 160, height: Math.max(...nodes.map((n) => n.y + n.height)) - Math.min(...nodes.map((n) => n.y)) + 80 };
      const cards = nodes.filter((n) => n.width > 0 && n.height > 0);
      const xs = [region.x, ...cards.flatMap((n) => [n.x + n.width / 2 - size.width / 2, n.x - size.width - 4, n.x + n.width + 4]), ...result.points.map((p) => p.x - size.width / 2)];
      const ys = [region.y, ...cards.flatMap((n) => [n.y + n.height + 4, n.y - size.height - 4]), ...result.points.map((p) => p.y - size.height / 2)];
      for (let y = region.y; y + size.height <= region.y + region.height; y += size.height + 5) ys.push(y);
      for (let x = region.x; x + size.width <= region.x + region.width; x += Math.max(12, size.width / 2)) xs.push(x);
      const slots = [];
      for (const y of new Set(ys)) for (const x of new Set(xs)) {
        const box = { x, y, ...size };
        if (valid(box)) slots.push(box);
      }
      slots.sort((a2, b3) => Math.hypot(a2.x + a2.width / 2 - mid.x, a2.y + a2.height / 2 - mid.y) - Math.hypot(b3.x + b3.width / 2 - mid.x, b3.y + b3.height / 2 - mid.y));
      for (const slot of slots) {
        const leader = clearLeader(slot, result.points, nodes, labels);
        if (leader) {
          labelBox = slot;
          result.labelLeader = leader;
          break;
        }
      }
    }
    if (labelBox) {
      labels.push(labelBox);
      result.labelBox = labelBox;
      result.x = labelBox.x;
      result.y = labelBox.y + labelBox.height * 0.78;
    } else result.labelOmitted = true;
    return result;
  }).filter(Boolean);
}
function fitDiagram(layout, area) {
  const occupied = [...layout.nodes, ...layout.nodes.flatMap((n) => n.portLabelBox ? [n.portLabelBox] : []), ...layout.edges.flatMap((e) => [...e.labelBox ? [e.labelBox] : [], ...e.points.map((p) => ({ ...p, width: 0, height: 0 }))])], fit = fitNodes(occupied, area), scale = fit.scale;
  const origin = occupied[0], fitted = fit.nodes[0], dx = origin ? fitted.x - origin.x * scale : area.x, dy = origin ? fitted.y - origin.y * scale : area.y;
  const point2 = (p) => ({ x: p.x * scale + dx, y: p.y * scale + dy }), box = (n) => ({ ...n, ...point2(n), width: n.width * scale, height: n.height * scale });
  return { ...layout, scale, nodes: layout.nodes.map((n) => ({ ...box(n), ...n.headerHeight ? { headerHeight: n.headerHeight * scale } : {}, ...n.portLabelBox ? { portLabelBox: box(n.portLabelBox) } : {} })), edges: layout.edges.map((e) => ({ ...e, points: e.points.map(point2), ...e.labelBox ? { labelBox: box(e.labelBox), x: e.x * scale + dx, y: e.y * scale + dy } : {}, labelScale: scale })), ports: layout.ports?.map((p) => ({ ...p, ...point2(p) })) };
}
function routeIsClear(points, edge, nodes, { orthogonalOnly = false } = {}) {
  if (points.length < 2 || points.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))) return false;
  const obstacles = connectionObstacles(edge, nodes);
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    if (orthogonalOnly && Math.abs(a.x - b.x) > 0.01 && Math.abs(a.y - b.y) > 0.01) return false;
    if (obstacles.some((n) => lineCrossesRect(a, b, { x: n.x + 0.05, y: n.y + 0.05, width: Math.max(0, n.width - 0.1), height: Math.max(0, n.height - 0.1) }))) return false;
  }
  return true;
}
function routeConnectsEndpoints(points, edge, nodes, tolerance = 0.7) {
  const byID = new Map(nodes.map((n) => [n.id, n]));
  const touches = (point2, node) => {
    if (!point2 || !node) return false;
    if (!node.width && !node.height) return Math.hypot(point2.x - node.x, point2.y - node.y) <= tolerance;
    const insideX = point2.x >= node.x - tolerance && point2.x <= node.x + node.width + tolerance, insideY = point2.y >= node.y - tolerance && point2.y <= node.y + node.height + tolerance;
    return insideX && insideY && (Math.abs(point2.x - node.x) <= tolerance || Math.abs(point2.x - node.x - node.width) <= tolerance || Math.abs(point2.y - node.y) <= tolerance || Math.abs(point2.y - node.y - node.height) <= tolerance);
  };
  return points.length >= 2 && touches(points[0], byID.get(edge.source)) && touches(points.at(-1), byID.get(edge.target));
}

// src/canvas-prototype/routing-style.mjs
var point = (p) => `${p.x},${p.y}`;
var line = (points) => points.map((p, i) => (i ? "L" : "M") + point(p)).join(" ");
var mix = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
var distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function cubic(a, b, c, d, t) {
  return mix(mix(mix(a, b, t), mix(b, c, t), t), mix(mix(b, c, t), mix(c, d, t), t), t);
}
function connectionPath(points, { style = "square", edge = {}, nodes = [] } = {}) {
  if (!points?.length) return "";
  if (style !== "mind-map" || points.length < 3) return line(points);
  const a = points[0], d = points.at(-1), start2 = points[1], end = points.at(-2);
  const handle = Math.min(140, distance(a, d) * 0.45), l1 = distance(a, start2) || 1, l2 = distance(d, end) || 1;
  const b = { x: a.x + (start2.x - a.x) / l1 * handle, y: a.y + (start2.y - a.y) / l1 * handle };
  const c = { x: d.x + (end.x - d.x) / l2 * handle, y: d.y + (end.y - d.y) / l2 * handle };
  const xmin = Math.min(a.x, b.x, c.x, d.x), xmax = Math.max(a.x, b.x, c.x, d.x);
  const ymin = Math.min(a.y, b.y, c.y, d.y), ymax = Math.max(a.y, b.y, c.y, d.y);
  const blocks = connectionObstacles(edge, nodes);
  const hullClear = !blocks.some((n) => xmin < n.x + n.width && xmax > n.x && ymin < n.y + n.height && ymax > n.y);
  const samples = Array.from({ length: 33 }, (_, i) => cubic(a, b, c, d, i / 32));
  if (hullClear && routeIsClear(samples, edge, nodes)) return `M${point(a)} C${point(b)} ${point(c)} ${point(d)}`;
  let path = "M" + point(a);
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i], prev = points[i - 1], next = points[i + 1];
    let r = Math.min(28, distance(prev, p) / 3, distance(p, next) / 3);
    let before, after;
    while (r > 0.5) {
      before = mix(p, prev, r / (distance(prev, p) || 1));
      after = mix(p, next, r / (distance(p, next) || 1));
      const x = Math.min(before.x, p.x, after.x), y = Math.min(before.y, p.y, after.y), right = Math.max(before.x, p.x, after.x), bottom = Math.max(before.y, p.y, after.y);
      if (!blocks.some((n) => x < n.x + n.width && right > n.x && y < n.y + n.height && bottom > n.y)) break;
      r /= 2;
    }
    path += r > 0.5 ? ` L${point(before)} Q${point(p)} ${point(after)}` : ` L${point(p)}`;
  }
  return path + " L" + point(d);
}

// src/canvas-prototype/view-contract.mjs
var supportedViewKinds = Object.freeze([
  "requirement",
  "definition",
  "tree",
  "package",
  "interconnection",
  "action",
  "state",
  "sequence",
  "fault-tree",
  "table",
  "matrix",
  "case",
  "mixed"
]);
var supportsView = (view) => supportedViewKinds.includes(typeof view === "string" ? view : view?.kind);
var isGridView = (view) => view?.kind === "table" || view?.kind === "matrix";
function rendererFamily(view) {
  if (isGridView(view)) return "grid";
  if (view?.kind === "sequence") return "sequence";
  return supportsView(view) ? "graph" : "unsupported";
}
var identity = (value) => typeof value === "string" && value.length ? value : void 0;
function representations(view) {
  const result = [];
  const add = (record, item) => result.push({
    ...record,
    semanticId: identity(item?.semanticId),
    identityStatus: item?.identityStatus ?? (identity(item?.semanticId) ? "native" : "unknown"),
    label: item?.name ?? item?.label ?? "",
    qualifiedName: item?.qualifiedName
  });
  for (const [index, node] of (view?.nodes ?? []).entries()) add({ role: "node", index, representationId: node.id }, node);
  for (const [index, edge] of (view?.edges ?? []).entries()) add({
    role: "edge",
    index,
    representationId: edge.id,
    sourceSemanticId: edge.sourceSemanticId ?? edge.semanticSource,
    targetSemanticId: edge.targetSemanticId ?? edge.semanticTarget,
    kind: edge.kind
  }, edge);
  for (const [row, item] of (view?.rows ?? []).entries()) add({
    role: "row",
    row,
    representationId: `row:${row}`
  }, { ...item, name: item.name ?? item.cells?.[0] });
  for (const item of view?.columnElements ?? []) add({
    role: "column",
    column: item.index,
    representationId: `column:${item.index}`
  }, { ...item, name: item.name ?? view.columns?.[item.index] });
  for (const cell of view?.relationshipCells ?? []) {
    for (const [index, relationship] of (cell.relationships ?? []).entries()) add({
      role: "cell",
      row: cell.row,
      column: cell.column,
      index,
      representationId: `cell:${cell.row}:${cell.column}:${index}`,
      sourceSemanticId: relationship.sourceSemanticId,
      targetSemanticId: relationship.targetSemanticId,
      kind: relationship.kind
    }, relationship);
  }
  return result;
}
var representedIdentities = (view) => [...new Set(representations(view).map((r) => r.semanticId).filter(Boolean))];

// src/canvas-prototype/grid-view.mjs
var copy = (value) => value === void 0 ? void 0 : structuredClone(value);
var text = (value) => value === null || value === void 0 ? "" : String(value);
var hasIdentity = (value) => typeof value === "string" && value.length > 0;
var positionKey = (row, column) => `${row}:${column}`;
function gridRowOrder(view, sort) {
  const indices = (view.rows ?? []).map((_, index) => index);
  if (view.kind === "matrix" || !sort || !Number.isInteger(sort.column) || sort.column < 0 || sort.column >= (view.columns ?? []).length) return indices;
  const direction = sort.direction === "descending" ? -1 : 1;
  return indices.sort((a, b) => {
    const left = text(view.rows[a].cells?.[sort.column]), right = text(view.rows[b].cells?.[sort.column]);
    return direction * left.localeCompare(right, void 0, { numeric: true }) || a - b;
  });
}
function mountGrid(host, view, options = {}) {
  if (!isGridView(view)) throw Error(`Grid renderer cannot render ${view?.kind}`);
  const doc = host.ownerDocument, matrix = view.kind === "matrix";
  const rows = view.rows ?? [], columns = view.columns ?? [];
  const columnElements = new Map((view.columnElements ?? []).map((item) => [item.index, item]));
  const relationships = /* @__PURE__ */ new Map();
  for (const cell of view.relationshipCells ?? []) {
    const key2 = positionKey(cell.row, cell.column);
    relationships.set(key2, [...relationships.get(key2) ?? [], ...copy(cell.relationships ?? [])]);
  }
  const nativeIds = new Set(representedIdentities(view));
  const semanticIdsFor = (selection) => [...new Set([
    selection?.semanticId,
    ...(selection?.relationships ?? []).map((item) => item.semanticId)
  ].filter(hasIdentity))];
  const incoming = copy(options.state ?? {});
  const initialIds = options.selectedIds ?? (hasIdentity(options.selectedId) ? [options.selectedId] : incoming.selectedIds ?? (hasIdentity(incoming.selectedId) ? [incoming.selectedId] : []));
  const sharedSelectionExplicit = Array.isArray(options.selectedIds) || hasIdentity(options.selectedId);
  const initialIdentities = [...new Set(initialIds.filter(hasIdentity))];
  const savedSelectionIdentities = semanticIdsFor(incoming.selection);
  const selectionMatchesShared = initialIdentities.length === savedSelectionIdentities.length && initialIdentities.every((id) => savedSelectionIdentities.includes(id));
  let state2 = {
    scrollTop: Math.max(0, Number(incoming.scrollTop) || 0),
    scrollLeft: Math.max(0, Number(incoming.scrollLeft) || 0),
    sort: matrix ? null : incoming.sort ?? null,
    widths: { ...incoming.widths },
    selection: sharedSelectionExplicit && !selectionMatchesShared ? null : incoming.selection ?? null,
    selectedId: initialIdentities.length === 1 ? initialIdentities[0] : null,
    selectedIds: initialIdentities
  };
  let destroyed = false;
  const listeners = [];
  const listen = (target, event, handler, settings2) => {
    target.addEventListener(event, handler, settings2);
    listeners.push(() => target.removeEventListener(event, handler, settings2));
  };
  const el2 = (tag, className, content) => {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (content !== void 0) node.textContent = text(content);
    return node;
  };
  const labelFor2 = (id) => text(options.labelFor?.(id) || id);
  const button2 = (label2, action, className = "") => {
    const result = el2("button", className, label2);
    result.type = "button";
    result.addEventListener("click", (event) => {
      event.stopPropagation();
      action();
    });
    return result;
  };
  const shell = el2("section", "canvas-grid-view");
  shell.setAttribute("aria-label", view.title ?? view.id ?? (matrix ? "Relationship matrix" : "Model table"));
  const toolbar = el2("div", "canvas-grid-toolbar");
  const settings = el2("details", "canvas-grid-settings");
  settings.append(el2("summary", null, "Columns"));
  const widthFields = el2("div", "canvas-grid-widths");
  settings.append(widthFields);
  toolbar.append(settings);
  const summary = el2("span", "canvas-grid-summary", `${rows.length} rows \xB7 ${columns.length} columns`);
  toolbar.append(summary);
  const viewport = el2("div", "canvas-grid-scroll");
  viewport.tabIndex = 0;
  viewport.setAttribute("role", "region");
  viewport.setAttribute("aria-label", `${matrix ? "Matrix" : "Table"} contents; scroll to read all rows and columns`);
  const table = el2("table", "canvas-grid-table");
  table.setAttribute("aria-label", view.title ?? view.id ?? "Native model view");
  const colgroup = el2("colgroup"), thead = el2("thead"), tbody = el2("tbody");
  table.append(colgroup, thead, tbody);
  viewport.append(table);
  const inspector = el2("div", "canvas-grid-inspector");
  inspector.setAttribute("role", "status");
  inspector.setAttribute("aria-live", "polite");
  const disclosure = el2("p", "canvas-grid-disclosure");
  shell.append(toolbar, viewport, inspector, disclosure);
  host.append(shell);
  const bindings = [];
  const getState = () => copy({ ...state2, scrollTop: viewport.scrollTop, scrollLeft: viewport.scrollLeft });
  const changed = () => {
    if (!destroyed) options.onStateChange?.(getState());
  };
  const samePosition = (a, b) => a && b && a.kind === b.kind && a.row === b.row && a.column === b.column;
  const rowSelection = (row) => ({
    kind: "row",
    row,
    semanticId: rows[row].semanticId,
    label: text(rows[row].cells?.[0] ?? rows[row].name ?? `Row ${row + 1}`),
    identityStatus: rows[row].identityStatus ?? (hasIdentity(rows[row].semanticId) ? "native" : "unknown")
  });
  const columnSelection = (column) => ({
    kind: "column",
    column,
    semanticId: columnElements.get(column)?.semanticId,
    label: text(columns[column]),
    identityStatus: columnElements.get(column)?.identityStatus ?? (hasIdentity(columnElements.get(column)?.semanticId) ? "native" : "unknown")
  });
  const cellSelection = (row, column) => {
    const links = copy(relationships.get(positionKey(row, column)) ?? []);
    return {
      kind: matrix ? "relationship-cell" : "value-cell",
      row,
      column,
      ...links.length === 1 && hasIdentity(links[0].semanticId) ? { semanticId: links[0].semanticId } : {},
      label: text(rows[row].cells?.[column]),
      rowSemanticId: rows[row].semanticId,
      columnSemanticId: columnElements.get(column)?.semanticId,
      relationships: links
    };
  };
  const bind2 = (node, selection) => {
    bindings.push({ node, selection });
    const id = semanticIdsFor(selection)[0];
    if (id) node.dataset.semanticId = id;
    node.dataset.gridKind = selection.kind;
    if (selection.row !== void 0) node.dataset.gridRow = String(selection.row);
    if (selection.column !== void 0) node.dataset.gridColumn = String(selection.column);
    return node;
  };
  const renderInspector = () => {
    inspector.replaceChildren();
    const selection = state2.selection;
    if (!selection) {
      inspector.append(el2("span", null, "Select a row, heading or cell to inspect it. Explore is a separate action."));
      return;
    }
    const description = el2("div", "canvas-grid-selection");
    if (selection.kind === "relationship-cell") {
      description.append(el2("strong", null, `${text(rows[selection.row]?.cells?.[0])} \xD7 ${text(columns[selection.column])}`));
      const links = selection.relationships ?? [];
      if (!links.length) {
        description.append(el2("p", null, selection.label ? "Relationship provenance is unavailable for this cell. Its displayed value is retained." : "No matching relationship in this view."));
        if (selection.label) description.append(el2("p", null, selection.label));
      } else {
        description.append(el2("p", null, `${links.length} native relationship${links.length === 1 ? "" : "s"}. Direction is shown for each relationship.`));
        const list = el2("ul");
        for (const relationship of links) {
          const item = el2("li");
          item.append(el2("span", null, `${relationship.kind ?? "Relationship"}: ${hasIdentity(relationship.sourceSemanticId) ? labelFor2(relationship.sourceSemanticId) : "Unknown source identity"} \u2192 ${hasIdentity(relationship.targetSemanticId) ? labelFor2(relationship.targetSemanticId) : "Unknown target identity"}${relationship.label ? ` \xB7 ${relationship.label}` : ""}`));
          if (hasIdentity(relationship.semanticId)) {
            const provenance = el2("details", "canvas-grid-provenance");
            provenance.append(el2("summary", null, "Native identity"));
            provenance.append(el2("small", null, `Relationship: ${relationship.semanticId}`));
            if (relationship.qualifiedName) provenance.append(el2("small", null, `Qualified name: ${relationship.qualifiedName}`));
            provenance.append(el2("small", null, `Source: ${relationship.sourceSemanticId ?? "unavailable"}`), el2("small", null, `Target: ${relationship.targetSemanticId ?? "unavailable"}`));
            item.append(provenance);
          } else item.append(el2("small", null, "Relationship identity unavailable."));
          list.append(item);
        }
        description.append(list);
      }
    } else {
      description.append(el2("strong", null, selection.label || "Empty value"));
      if (selection.kind === "value-cell") description.append(el2("p", null, "Native displayed value. This cell has no exported property identity."));
      else if (!hasIdentity(selection.semanticId)) description.append(el2("p", null, "Native semantic identity unavailable; model exploration is unavailable for this representation."));
    }
    const canExplore = hasIdentity(selection.semanticId) || (selection.relationships ?? []).some((item) => hasIdentity(item.sourceSemanticId) && hasIdentity(item.targetSemanticId));
    if (canExplore) description.append(button2(selection.kind === "relationship-cell" ? "Explore relationship" : "Explore element", () => options.onExplore?.(copy(state2.selection)), "canvas-grid-explore"));
    inspector.append(description);
  };
  const highlight = () => {
    for (const { node, selection } of bindings) {
      const selected = samePosition(selection, state2.selection) || state2.selectedIds.some((id) => semanticIdsFor(selection).includes(id));
      node.classList.toggle("is-selected", !!selected);
      if (node.tagName === "BUTTON") node.setAttribute("aria-pressed", String(!!selected));
      const crosshair = matrix && state2.selection?.kind === "relationship-cell" && (selection.row === state2.selection.row || selection.column === state2.selection.column);
      node.classList.toggle("is-axis-highlight", !!crosshair);
    }
    const unknownRows = rows.filter((row) => !hasIdentity(row.semanticId)).length;
    const missing = state2.selectedIds.some((id) => !nativeIds.has(id));
    disclosure.textContent = [
      ...missing ? ["The selected element is not represented in this view. Your semantic selection is retained."] : [],
      ...unknownRows ? [`${unknownRows} row${unknownRows === 1 ? " has" : "s have"} no exported semantic identity.`] : []
    ].join(" ");
    disclosure.hidden = !disclosure.textContent;
  };
  const selectSelection = (selection) => {
    state2.selection = copy(selection);
    state2.selectedId = hasIdentity(selection.semanticId) ? selection.semanticId : null;
    state2.selectedIds = semanticIdsFor(selection);
    highlight();
    renderInspector();
    changed();
    options.onSelect?.(copy(selection));
  };
  const applyWidths = () => {
    let totalWidth = 0;
    for (const [index, col] of [...colgroup.children].entries()) {
      const width = Number(state2.widths[index]);
      const appliedWidth = Number.isFinite(width) && width >= 80 && width <= 900 ? width : 200;
      col.style.width = `${appliedWidth}px`;
      totalWidth += appliedWidth;
    }
    table.style.width = `${totalWidth}px`;
  };
  for (const [column, label2] of columns.entries()) {
    colgroup.append(el2("col"));
    const field = el2("label", null, `${text(label2) || `Column ${column + 1}`} width`);
    const input = el2("input");
    input.type = "number";
    input.min = "80";
    input.max = "900";
    input.step = "20";
    input.value = String(state2.widths[column] ?? 200);
    input.setAttribute("aria-label", `${text(label2) || `Column ${column + 1}`} width in pixels`);
    input.addEventListener("change", () => {
      const width = Number(input.value);
      if (!Number.isFinite(width) || width < 80 || width > 900) {
        input.value = String(state2.widths[column] ?? 200);
        return;
      }
      state2.widths[column] = width;
      applyWidths();
      changed();
    });
    field.append(input);
    widthFields.append(field);
  }
  const renderTable = () => {
    const scrollTop = viewport.scrollTop, scrollLeft = viewport.scrollLeft;
    bindings.length = 0;
    thead.replaceChildren();
    tbody.replaceChildren();
    const heading = el2("tr");
    for (const [column, label2] of columns.entries()) {
      const th = el2("th");
      th.scope = "col";
      const selection = columnSelection(column);
      const select2 = bind2(button2(text(label2) || `Column ${column + 1}`, () => selectSelection(selection), "canvas-grid-heading"), selection);
      select2.setAttribute("aria-label", `Inspect column ${text(label2) || column + 1}`);
      th.append(select2);
      if (!matrix) {
        th.setAttribute("aria-sort", state2.sort?.column === column ? state2.sort.direction : "none");
        const sort = button2("\u2195", () => {
          state2.sort = { column, direction: state2.sort?.column === column && state2.sort.direction === "ascending" ? "descending" : "ascending" };
          renderTable();
          thead.querySelectorAll(".canvas-grid-sort")[column]?.focus({ preventScroll: true });
          changed();
        }, "canvas-grid-sort");
        sort.setAttribute("aria-label", `Sort by ${text(label2) || `column ${column + 1}`} ${state2.sort?.column === column && state2.sort.direction === "ascending" ? "descending" : "ascending"}`);
        th.append(sort);
      }
      heading.append(bind2(th, selection));
    }
    thead.append(heading);
    for (const row of gridRowOrder(view, state2.sort)) {
      const tr = el2("tr");
      tr.dataset.nativeRow = String(row);
      for (const [column] of columns.entries()) {
        const cell = el2(column === 0 ? "th" : "td");
        if (column === 0) cell.scope = "row";
        const selection = column === 0 ? rowSelection(row) : cellSelection(row, column);
        const displayed = text(rows[row].cells?.[column]);
        const label2 = displayed || (matrix && column > 0 ? "\u2014" : "Empty");
        const select2 = bind2(button2(label2, () => selectSelection(selection), "canvas-grid-value"), selection);
        select2.setAttribute("aria-label", column === 0 ? `Inspect row ${label2}` : `Inspect ${text(columns[column])} for ${text(rows[row].cells?.[0])}: ${displayed || (matrix ? "no matching relationship in this view" : "empty value")}`);
        cell.append(select2);
        tr.append(bind2(cell, selection));
      }
      tbody.append(tr);
    }
    viewport.scrollTop = scrollTop;
    viewport.scrollLeft = scrollLeft;
    applyWidths();
    highlight();
  };
  renderTable();
  renderInspector();
  viewport.scrollTop = state2.scrollTop;
  viewport.scrollLeft = state2.scrollLeft;
  listen(viewport, "scroll", changed, { passive: true });
  for (const event of ["wheel", "pointerdown", "pointermove", "pointerup", "touchstart", "touchmove", "touchend", "keydown"]) {
    listen(shell, event, (event2) => event2.stopPropagation(), { passive: true });
  }
  const selectMany = (ids) => {
    state2.selectedIds = [...new Set((ids ?? []).filter(hasIdentity))];
    state2.selectedId = state2.selectedIds.length === 1 ? state2.selectedIds[0] : null;
    state2.selection = null;
    highlight();
    renderInspector();
  };
  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      for (const remove of listeners) remove();
      shell.remove();
    },
    getState,
    select(id) {
      selectMany(hasIdentity(id) ? [id] : []);
    },
    selectMany,
    reveal(id) {
      const match = bindings.find((binding) => binding.node.tagName === "BUTTON" && semanticIdsFor(binding.selection).includes(id));
      if (!match) return false;
      match.node.scrollIntoView?.({ block: "nearest", inline: "nearest" });
      return true;
    },
    anchors() {
      const clip = viewport.getBoundingClientRect(), origin = host.getBoundingClientRect();
      return bindings.filter(({ node }) => node.tagName === "BUTTON").flatMap(({ node, selection }) => {
        const rect = node.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0 || rect.bottom <= clip.top || rect.top >= clip.bottom || rect.right <= clip.left || rect.left >= clip.right) return [];
        const left = Math.max(clip.left, rect.left), top = Math.max(clip.top, rect.top);
        const right = Math.min(clip.right, rect.right), bottom = Math.min(clip.bottom, rect.bottom);
        return semanticIdsFor(selection).map((semanticId2, index) => ({
          semanticId: semanticId2,
          role: selection.kind,
          row: selection.row,
          column: selection.column,
          representationId: `grid:${selection.kind}:${selection.row ?? ""}:${selection.column ?? ""}:${index}`,
          x: left - origin.left,
          y: top - origin.top,
          width: right - left,
          height: bottom - top
        }));
      });
    }
  };
}

// src/canvas-prototype/core/index.mjs
var copy2 = (value) => structuredClone(value);
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
    const key2 = `${edge?.id}:${target}:${reason}`;
    if (!seenOmissions.has(key2)) {
      seenOmissions.add(key2);
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
    const [id, distance3] = queue.shift();
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
      if (distance3 >= depth) {
        omit(edge, target, "depth");
        continue;
      }
      if (wanted.size >= budget) {
        omit(edge, target, "budget");
        continue;
      }
      wanted.add(target);
      queue.push([target, distance3 + 1]);
    }
  }
  return copy2({ elements: [...wanted].map((id) => policy.elements.get(id)), relationships: policy.edges.filter((edge) => policy.kinds.has(edge.kind) && wanted.has(edge.source) && wanted.has(edge.target)), omissions });
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
    if (current.id === to) return copy2({ found: true, elements: current.path.map((id) => policy.elements.get(id)), relationships: current.edges, omissions });
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
  return copy2({ found: false, elements: [], relationships: [], omissions });
}
var UPWARD_KINDS = /* @__PURE__ */ new Set(["derive", "derivation", "refine", "refinement", "satisfy", "satisfaction", "verify", "verification"]);
var DOWNWARD_KINDS = /* @__PURE__ */ new Set(["composition", "containment"]);
function hierarchyPolicy(graph, options, includeOwnership) {
  const policy = graphPolicy(graph, options), omissions = [], seen = /* @__PURE__ */ new Set(), upward = /* @__PURE__ */ new Map();
  const omit = (edge, target, reason) => {
    const key2 = JSON.stringify([edge?.id, target, reason]);
    if (!seen.has(key2)) {
      seen.add(key2);
      omissions.push({ relationshipId: edge?.id ?? null, target, reason });
    }
  };
  const allowed = (id) => {
    const reason = policy.allowedElement(id);
    if (reason) return reason;
    const element2 = policy.elements.get(id);
    if (element2.layer === "metamodel" || element2.metamodel === true) return "metamodel-boundary";
    return element2.layer === "library" ? "library-boundary" : null;
  };
  const ownershipIds = new Set((graph.containment ?? []).map((edge) => edge.id));
  const links = [...policy.edges, ...includeOwnership ? (graph.containment ?? []).map((edge) => ({ ...edge, source: endpoint(edge, "source"), target: endpoint(edge, "target") })) : []];
  for (const edge of links) {
    const ownership = includeOwnership && ownershipIds.has(edge.id) && ["owner", "ownership", "containment"].includes(edge.kind);
    if (!ownership && !UPWARD_KINDS.has(edge.kind) && !DOWNWARD_KINDS.has(edge.kind)) continue;
    if (!ownership && !policy.kinds.has(edge.kind)) continue;
    const [child, parent] = DOWNWARD_KINDS.has(edge.kind) ? [edge.target, edge.source] : [edge.source, edge.target];
    if (!upward.has(child)) upward.set(child, []);
    upward.get(child).push({ parent, edge, ownership });
  }
  for (const links2 of upward.values()) links2.sort((a, b) => a.parent.localeCompare(b.parent) || String(a.edge.id).localeCompare(String(b.edge.id)));
  return { ...policy, allowed, upward, omissions, omit };
}
function findHierarchyRoute(graph, options = {}) {
  const { from, to, maxHops = 12 } = options;
  if (!Number.isInteger(maxHops) || maxHops < 0) throw Error("Invalid route hop limit");
  function search(includeOwnership) {
    const policy = hierarchyPolicy(graph, options, includeOwnership);
    for (const id of [from, to]) {
      const reason = policy.allowed(id);
      if (reason) return { found: false, elements: [], relationships: [], omissions: [{ target: id, reason }] };
    }
    function ancestors(root) {
      const found = /* @__PURE__ */ new Map([[root, { ids: [root], edges: [], ownership: false }]]), queue = [root];
      for (let cursor = 0; cursor < queue.length; cursor++) {
        const current = queue[cursor], path = found.get(current);
        for (const { parent, edge, ownership } of policy.upward.get(current) ?? []) {
          const reason = policy.allowed(parent);
          if (reason) {
            policy.omit(edge, parent, reason);
            continue;
          }
          if (found.has(parent)) continue;
          if (path.edges.length >= maxHops) {
            policy.omit(edge, parent, "hop-limit");
            continue;
          }
          found.set(parent, { ids: [...path.ids, parent], edges: [...path.edges, edge], ownership: path.ownership || ownership });
          queue.push(parent);
        }
      }
      return found;
    }
    const left = ancestors(from), right = ancestors(to), common = [...left.keys()].filter((id) => right.has(id));
    const bounded = common.filter((id) => left.get(id).edges.length + right.get(id).edges.length <= maxHops);
    bounded.sort((a, b) => {
      const lengths = (id) => [left.get(id).edges.length, right.get(id).edges.length];
      const [al, ar] = lengths(a), [bl, br] = lengths(b);
      return al + ar - bl - br || Math.max(al, ar) - Math.max(bl, br) || a.localeCompare(b);
    });
    if (!bounded.length) {
      if (common.length) policy.omit(null, to, "hop-limit");
      policy.omit(null, to, "no-common-ancestor");
      return { found: false, elements: [], relationships: [], omissions: policy.omissions };
    }
    const ancestor = bounded[0], ascent = left.get(ancestor), descent = right.get(ancestor), ids = [...ascent.ids, ...descent.ids.slice(0, -1).reverse()];
    return copy2({
      found: true,
      strategy: ascent.ownership || descent.ownership ? "ownership-ancestor" : "common-ancestor",
      commonAncestor: ancestor,
      ascentIds: ascent.ids,
      descentIds: [...descent.ids].reverse(),
      elements: ids.map((id) => policy.elements.get(id)),
      relationships: [...ascent.edges, ...[...descent.edges].reverse()],
      omissions: policy.omissions
    });
  }
  const engineering = search(false);
  return engineering.found || !(graph.containment ?? []).length ? engineering : search(true);
}
function findExplicitRoute(graph, ids, options = {}) {
  const policy = graphPolicy(graph, options), relationships = [], elements = [], omissions = [];
  if (!Array.isArray(ids) || !ids.length) return { found: false, elements: [], relationships: [], omissions: [{ reason: "empty-route" }] };
  const ownership = new Set((graph.containment ?? []).map((edge) => edge.id));
  const edges = [...policy.edges, ...(graph.containment ?? []).map((edge) => ({ ...edge, source: endpoint(edge, "source"), target: endpoint(edge, "target") }))];
  for (const [index, id] of ids.entries()) {
    const reason = policy.allowedElement(id);
    if (reason) return { found: false, elements: [], relationships: [], omissions: [{ target: id, reason }] };
    elements.push(policy.elements.get(id));
    if (!index) continue;
    const previous = ids[index - 1], edge = edges.find((edge2) => (policy.kinds.has(edge2.kind) || ownership.has(edge2.id)) && (edge2.source === previous && edge2.target === id || edge2.target === previous && edge2.source === id));
    if (!edge) return { found: false, elements: [], relationships: [], omissions: [{ target: id, reason: "missing-explicit-link" }] };
    relationships.push(edge);
  }
  return copy2({ found: true, strategy: "explicit", elements, relationships, omissions });
}
function directTypingContext(graph, id) {
  const elements = new Map((graph.elements ?? []).map((element2) => [element2.id, element2]));
  const relationships = nativeEdges(graph).filter((edge) => ["type", "typing"].includes(edge.kind) && (edge.source === id || edge.target === id));
  const ids = /* @__PURE__ */ new Set([id]);
  for (const edge of relationships) {
    ids.add(edge.source);
    ids.add(edge.target);
  }
  return copy2({ elements: [...ids].filter((key2) => elements.has(key2)).map((key2) => elements.get(key2)), relationships });
}
function projectView(view) {
  const nodes = (view.nodes ?? []).map((node) => ({ ...copy2(node), id: node.id, semanticId: node.semanticId ?? node.semantic_id ?? null, parentId: node.parentId ?? node.parent ?? null }));
  if (nodes.some((node) => typeof node.id !== "string")) throw new Error("Native drawing node lacks a representation ID");
  if (new Set(nodes.map((node) => node.id)).size !== nodes.length) throw new Error("Duplicate representation ID");
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = (view.edges ?? []).map((edge, index) => ({ ...copy2(edge), id: edge.id ?? `${view.id ?? "view"}:edge:${index}`, source: endpoint(edge, "source"), target: endpoint(edge, "target") }));
  if (edges.some((edge) => !nodeIds.has(edge.source) || !nodeIds.has(edge.target))) throw new Error("Native edge references an unavailable drawing node");
  return { ...copy2(view), nodes, edges };
}
function semanticIds(scene2) {
  return representedIdentities(scene2.view ?? scene2);
}
function planTransition(fromScene, toScene, options = {}) {
  const previous = fromScene.view ?? fromScene, next = toScene.view ?? toScene;
  const oldIds = semanticIds(previous), newIds = semanticIds(next), duration = options.reducedMotion ? 0 : 360;
  const correspondence = oldIds.filter((id) => newIds.includes(id)).map((semanticId2) => ({ semanticId: semanticId2, fromRepresentationIds: representations(previous).filter((node) => node.semanticId === semanticId2).map((node) => node.representationId), toRepresentationIds: representations(next).filter((node) => node.semanticId === semanticId2).map((node) => node.representationId) }));
  if (previous.kind === next.kind && correspondence.length && !options.journey?.length) return { mode: "same-kind", journeyRequired: false, correspondence, stages: [{ kind: "reflow", viewKind: next.kind, semanticIds: newIds, focusId: toScene.focus, duration }] };
  const route2 = options.graph && fromScene.focus && toScene.focus ? options.journey?.length ? options.journey[0] === fromScene.focus && options.journey.at(-1) === toScene.focus ? findExplicitRoute(options.graph, options.journey, options) : { found: false, elements: [], relationships: [], omissions: [{ reason: "explicit-route-endpoints" }] } : findHierarchyRoute(options.graph, { ...options, from: fromScene.focus, to: toScene.focus }) : { found: false, elements: [], relationships: [], omissions: [{ reason: "missing-route-context" }] };
  const bounded = (ids, focus) => [...new Set([focus, ...ids].filter(Boolean))].slice(0, 24);
  const journey = route2.found ? route2.elements.map((element2) => element2.id) : [], stages = [{ kind: "gv-bridge", viewKind: "gv", semanticIds: bounded(oldIds, fromScene.focus), focusId: fromScene.focus, duration }];
  if (route2.found) {
    if (journey.length === 1) stages.push({ kind: "gv-journey", viewKind: "gv", semanticIds: journey, focusId: journey[0], route: [], routeIndex: 0, duration });
    else for (let index = 1; index < journey.length; index++) {
      const start2 = Math.max(0, index - 1), end = Math.min(journey.length, index + 2);
      stages.push({
        kind: "gv-journey",
        viewKind: "gv",
        semanticIds: journey.slice(start2, end),
        focusId: journey[index],
        route: route2.relationships.slice(start2, end - 1),
        routeIndex: index,
        phase: route2.commonAncestor ? index <= journey.indexOf(route2.commonAncestor) ? "ascent" : "descent" : "explicit",
        duration
      });
    }
  } else stages.push({ kind: "gv-journey", viewKind: "gv", semanticIds: [], focusId: toScene.focus, route: [], disconnected: true, duration });
  stages.push({ kind: "gv-gather", viewKind: "gv", semanticIds: bounded(newIds, toScene.focus), focusId: toScene.focus, duration }, { kind: "morph", viewKind: next.kind, semanticIds: bounded(newIds, toScene.focus), focusId: toScene.focus, duration });
  return { mode: previous.kind === next.kind ? "same-kind-journey" : "cross-kind", journeyRequired: true, correspondence, route: route2, stages };
}

// src/canvas-prototype/sequence-view.mjs
var serial = 0;
var semanticId = (record) => record.semanticId ?? record.semantic_id ?? null;
var labelOf = (node) => [node.nameSynthesized ?? node.name_synthesized ? "" : node.name, node.type].filter(Boolean).join(" : ") || node.kind;
function sequenceLayout(nativeView) {
  const view = projectView(nativeView);
  if (view.kind !== "sequence") throw Error("Sequence renderer requires a native sequence view");
  const notices = [...view.notices ?? []];
  for (const node of view.nodes) if (node.parentId) notices.push(`Nested sequence participant ${labelOf(node)} is shown as a lifeline; its native nesting is not represented.`);
  for (const note of view.notes ?? []) notices.push(typeof note === "string" ? note : note.text ?? JSON.stringify(note));
  const columnWidth = Math.max(210, ...view.nodes.map((node) => Math.min(360, 80 + labelOf(node).length * 7)));
  const participantHeight = Math.max(72, ...view.nodes.map((node) => 40 + [labelOf(node), node.text, node.detail].filter(Boolean).join("\n").split("\n").reduce((sum, line2) => sum + Math.max(1, Math.ceil(line2.length * 7 / (columnWidth - 50))) * 19, 0)));
  const nodes = view.nodes.map((node, index) => ({ ...node, semanticId: semanticId(node), x: 30 + index * columnWidth, y: 16, width: columnWidth - 30, height: participantHeight }));
  const byId = new Map(nodes.map((node) => [node.id, node]));
  let y = participantHeight + 70;
  const edges = view.edges.map((edge, index) => {
    const from = byId.get(edge.source), to = byId.get(edge.target), a = from.x + from.width / 2, b = to.x + to.width / 2, self2 = a === b;
    const width = self2 ? Math.max(150, columnWidth - 40) : Math.max(140, Math.abs(b - a) - 24);
    const label2 = edge.label ?? "", detail = [edge.fromLabel ?? edge.from_label, edge.toLabel ?? edge.to_label].filter(Boolean).join(" \u2192 ");
    const text2 = [label2, detail].filter(Boolean).join("\n");
    const labelHeight = Math.max(30, text2.split("\n").reduce((sum, line2) => sum + Math.max(1, Math.ceil(line2.length * 7 / (width - 12))) * 19, 0) + 8);
    const points = self2 ? [{ x: a, y }, { x: a + Math.max(65, columnWidth * 0.37), y }, { x: a + Math.max(65, columnWidth * 0.37), y: y + 30 }, { x: a, y: y + 30 }] : [{ x: a, y }, { x: b, y }];
    const supported = ["flow", "succession", "transition"].includes(edge.kind);
    if (!supported) notices.push(`Unsupported sequence message kind: ${edge.kind}. Its native record remains available; no message arrow is inferred.`);
    const result = {
      ...edge,
      semanticId: semanticId(edge),
      sourceSemanticId: from.semanticId,
      targetSemanticId: to.semanticId,
      order: index,
      points,
      supported,
      self: self2,
      labelBox: { x: self2 ? a + 12 : Math.min(a, b) + 12, y: y - labelHeight - 5, width, height: labelHeight },
      text: text2
    };
    y += Math.max(78, labelHeight + 38) + (self2 ? 30 : 0);
    return result;
  });
  if (view.fragments?.length) notices.push("Native interaction fragments are not supported by this renderer; their ordering and concurrency are not inferred.");
  return { ...view, nodes, edges, notices, width: Math.max(340, 30 + nodes.length * columnWidth), height: Math.max(220, y + 20) };
}
function mountSequence(host, nativeView, { onSelect = () => {
}, onExplore = () => {
}, selectedId = null, selectedIds, state: state2 = {}, onStateChange = () => {
} } = {}) {
  const document2 = host.ownerDocument, layout = sequenceLayout(nativeView), records = [], selected = { value: null, ids: [] };
  const make = (tag, text2, cls) => {
    const e = document2.createElement(tag);
    if (text2 !== void 0) e.textContent = text2;
    if (cls) e.className = cls;
    return e;
  };
  const svg = (tag, attrs = {}) => {
    const e = document2.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    return e;
  };
  const root = make("section", void 0, "sequence-view");
  root.setAttribute("aria-label", "Sequence view");
  const toolbar = make("div", void 0, "sequence-toolbar");
  const evidence = make("p", "Modeled interaction \xB7 vertical spacing does not represent elapsed time.", "sequence-evidence");
  const explore2 = make("button", "Explore selection");
  explore2.type = "button";
  explore2.disabled = true;
  explore2.onclick = () => {
    if (selected.value) onExplore(selected.value);
  };
  toolbar.append(evidence, explore2);
  root.append(toolbar);
  const selectionNotice = make("p", "", "sequence-selection-notice");
  selectionNotice.hidden = true;
  selectionNotice.setAttribute("role", "status");
  root.append(selectionNotice);
  if (layout.notices.length) {
    const notices = make("details", void 0, "sequence-notices");
    notices.append(make("summary", `${layout.notices.length} native or rendering notices`));
    const list = make("ul");
    for (const notice of layout.notices) list.append(make("li", typeof notice === "string" ? notice : notice.message ?? JSON.stringify(notice)));
    notices.append(list);
    root.append(notices);
  }
  const viewport = make("div", void 0, "sequence-viewport");
  viewport.tabIndex = 0;
  viewport.setAttribute("aria-label", "Sequence participants and ordered messages; scroll to reveal more");
  const canvas = make("div", void 0, "sequence-canvas");
  canvas.style.width = layout.width + "px";
  canvas.style.height = layout.height + "px";
  const drawing = svg("svg", { width: layout.width, height: layout.height, "aria-hidden": "true", class: "sequence-lines" });
  const markerId = `sequence-arrow-${++serial}`, defs = svg("defs"), marker = svg("marker", { id: markerId, viewBox: "0 0 12 12", refX: 11, refY: 6, markerWidth: 9, markerHeight: 9, orient: "auto" });
  marker.append(svg("path", { d: "M1 1 L11 6 L1 11 Z", fill: "currentColor" }));
  defs.append(marker);
  drawing.append(defs);
  canvas.append(drawing);
  const currentState = () => ({ scrollLeft: viewport.scrollLeft, scrollTop: viewport.scrollTop, selectedId: selected.ids.length === 1 ? selected.ids[0] : null, ...selected.ids.length > 1 ? { selectedIds: [...selected.ids] } : {} });
  const highlight = () => {
    for (const item of records) {
      const active2 = selected.ids.includes(item.selection.semanticId);
      item.button.classList.toggle("selected", active2);
      item.button.setAttribute("aria-pressed", String(active2));
      item.path?.classList.toggle("selected", active2);
    }
    explore2.disabled = !selected.value?.semanticId;
    const missing = selected.ids.filter((id) => !records.some((item) => item.selection.semanticId === id));
    selectionNotice.textContent = missing.length ? `${missing.length} selected element${missing.length === 1 ? " is" : "s are"} not represented in this sequence. Your semantic selection is retained.` : "";
    selectionNotice.hidden = !missing.length;
  };
  const select2 = (id, { notify = false, record = null } = {}) => {
    selected.ids = id ? [id] : [];
    selected.value = record ?? records.find((item) => item.selection.semanticId === id)?.selection ?? null;
    highlight();
    if (notify) {
      onSelect(selected.value);
      onStateChange(currentState());
    }
  };
  const selectMany = (ids) => {
    selected.ids = [...new Set((ids ?? []).filter((id) => typeof id === "string" && id))];
    selected.value = selected.ids.length === 1 ? records.find((item) => item.selection.semanticId === selected.ids[0])?.selection ?? null : null;
    highlight();
  };
  const register = (button2, selection, box, path) => {
    button2.type = "button";
    button2.dataset.representation = selection.id;
    if (selection.semanticId) button2.dataset.semanticId = selection.semanticId;
    button2.setAttribute("aria-pressed", "false");
    button2.onclick = (event) => {
      event.stopPropagation();
      select2(selection.semanticId, { notify: true, record: selection });
    };
    Object.assign(button2.style, { left: box.x + "px", top: box.y + "px", width: box.width + "px", minHeight: box.height + "px" });
    records.push({ button: button2, selection, box, path });
    canvas.append(button2);
  };
  for (const node of layout.nodes) {
    const x = node.x + node.width / 2;
    drawing.append(svg("line", { x1: x, x2: x, y1: node.y + node.height, y2: layout.height - 15, class: "sequence-lifeline" }));
    const button2 = make("button", void 0, "sequence-participant");
    button2.append(make("span", `\xAB${node.kind}\xBB`, "sequence-kind"), make("span", labelOf(node)));
    if (node.detail || node.text) {
      button2.append(make("span", [node.text, node.detail].filter(Boolean).join("\n"), "sequence-detail"));
    }
    register(button2, { ...node, label: labelOf(node) }, node);
  }
  for (const edge of layout.edges) {
    let path = null;
    if (edge.supported) {
      path = svg("path", { d: edge.points.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" "), class: "sequence-message-line", "marker-end": `url(#${markerId})` });
      drawing.append(path);
    }
    const button2 = make("button", edge.text || "(unnamed message)", "sequence-message");
    button2.setAttribute("aria-label", `Message ${edge.order + 1}: ${edge.text || "unnamed"}, ${labelOf(layout.nodes.find((n) => n.id === edge.source))} to ${labelOf(layout.nodes.find((n) => n.id === edge.target))}${edge.self ? ", self-message" : ""}`);
    register(button2, { ...edge, kind: "relationship", relationshipKind: edge.kind, label: edge.label, relationships: [{ semanticId: edge.semanticId, sourceSemanticId: edge.sourceSemanticId, targetSemanticId: edge.targetSemanticId, kind: edge.kind, label: edge.label }] }, edge.labelBox, path);
  }
  viewport.append(canvas);
  root.append(viewport);
  host.replaceChildren(root);
  viewport.scrollLeft = state2.scrollLeft ?? 0;
  viewport.scrollTop = state2.scrollTop ?? 0;
  viewport.addEventListener("scroll", () => onStateChange(currentState()));
  for (const type of ["wheel", "pointerdown", "touchstart"]) viewport.addEventListener(type, (event) => event.stopPropagation(), { passive: true });
  if (selectedIds) selectMany(selectedIds);
  else if (selectedId) select2(selectedId);
  else if (state2.selectedIds) selectMany(state2.selectedIds);
  else select2(state2.selectedId);
  return {
    destroy() {
      root.remove();
    },
    getState: currentState,
    select: select2,
    selectMany,
    reveal(id) {
      const item = records.find((item2) => item2.selection.semanticId === id);
      if (item) item.button.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    },
    anchors() {
      const hostBox = host.getBoundingClientRect();
      return records.filter((item) => item.selection.semanticId).flatMap((item) => {
        const box = item.button.getBoundingClientRect(), area = viewport.getBoundingClientRect();
        if (box.right < area.left || box.left > area.right || box.bottom < area.top || box.top > area.bottom) return [];
        return [{ semanticId: item.selection.semanticId, representationId: item.selection.id, x: box.x - hostBox.x, y: box.y - hostBox.y, width: box.width, height: box.height }];
      });
    }
  };
}

// src/canvas-prototype/behavior-view.mjs
var cases = /* @__PURE__ */ new Set(["case", "case def", "use case", "use case def", "analysis", "analysis def", "verification", "verification def", "analysis case", "analysis case def", "verification case", "verification case def"]);
var events = /* @__PURE__ */ new Set(["event", "basic event", "house event", "undeveloped event", "AND", "OR"]);
var controls = /* @__PURE__ */ new Set(["start", "initial", "final", "end", "terminate", "terminate action", "fork", "join", "decision", "merge", "choice", "junction", "shallow history", "deep history"]);
var behaviors = /* @__PURE__ */ new Set(["state", "state def", "region", "action", "action def", "accept", "send", "perform action", "exhibit state"]);
var behaviorNodeDetail = (node) => behaviorNotation(node) ? [...new Set([node.text, node.detail].filter(Boolean))].join("\n") : "";
var visibleDetail = (node) => {
  const native = behaviorNodeDetail(node), shown = node.displayDetail ?? "";
  return shown.includes(native) ? shown : [native, shown].filter(Boolean).join("\n");
};
function behaviorNotation(node) {
  if (cases.has(node.kind)) return { family: "case", shape: "ellipse" };
  if (node.kind === "objective") return { family: "case", shape: "note" };
  if (["actor", "subject"].includes(node.kind)) return { family: "case", shape: "box" };
  if (events.has(node.kind)) return { family: "fault-tree", shape: node.kind };
  if (controls.has(node.kind)) return { family: "control", shape: node.kind };
  if (behaviors.has(node.kind)) return { family: "behavior", shape: node.kind === "region" ? "region" : "rounded" };
  return null;
}
function behaviorFace(document2, node) {
  const notation = behaviorNotation(node);
  if (!notation) return null;
  const make = (tag, text2, cls) => {
    const e = document2.createElement(tag);
    if (text2) e.textContent = text2;
    if (cls) e.className = cls;
    return e;
  };
  const face2 = make("span", null, `node-face behavior-face behavior-${notation.family}`);
  face2.dataset.shape = notation.shape;
  if (notation.family === "control") {
    const glyph = make("span", { "shallow history": "H", "deep history": "H*" }[node.kind] ?? "", "behavior-control");
    glyph.setAttribute("aria-hidden", "true");
    face2.append(glyph);
    const name2 = node.nameSynthesized ?? node.name_synthesized ? "" : node.name;
    const label2 = [name2, behaviorNodeDetail(node)].filter(Boolean).join("\n");
    if (label2) face2.append(make("span", label2, "control-caption"));
    return face2;
  }
  if (notation.family === "fault-tree") {
    const svg = document2.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 80 60");
    svg.setAttribute("aria-hidden", "true");
    svg.classList.add("fault-symbol");
    const path = document2.createElementNS(svg.namespaceURI, "path");
    path.setAttribute("d", {
      AND: "M16 54 V30 A24 24 0 0 1 64 30 V54 Z",
      OR: "M16 54 Q20 20 40 6 Q60 20 64 54 Q40 43 16 54 Z",
      "basic event": "M64 30 A24 24 0 1 1 16 30 A24 24 0 1 1 64 30 Z",
      "undeveloped event": "M40 6 L70 30 L40 54 L10 30 Z",
      "house event": "M12 54 V24 L40 6 L68 24 V54 Z",
      event: "M10 10 H70 V50 H10 Z"
    }[node.kind]);
    svg.append(path);
    face2.append(svg);
  }
  face2.append(make("span", `\xAB${node.kind}\xBB${node.type ? " : " + node.type : ""}`, "kind"));
  const name = node.nameSynthesized ?? node.name_synthesized ? "" : node.name;
  if (name) face2.append(make("span", name, "name"));
  const detail = visibleDetail(node);
  if (detail) face2.append(make("span", detail, "detail"));
  return face2;
}
function applyBehaviorLayout(view) {
  return { ...view, nodes: view.nodes.map((node) => {
    const notation = behaviorNotation(node);
    if (!notation || notation.family === "control") return node;
    const text2 = visibleDetail(node), lines = text2.split("\n").reduce((sum, line2) => sum + Math.max(1, Math.ceil(line2.length / 28)), 0);
    const base = notation.family === "fault-tree" ? 132 : notation.family === "case" ? 110 : 80;
    return { ...node, width: Math.max(node.width ?? 0, notation.shape === "ellipse" ? 200 : 170), height: Math.max(node.height ?? 0, base + (text2 ? lines * 18 : 0)), behaviorFamily: notation.family };
  }) };
}

// src/canvas-prototype/elk-layout.mjs
var import_elk_api = __toESM(require_elk_api(), 1);

// src/canvas-prototype/notation.mjs
var profiles = Object.freeze({
  connection: ["solid", "none", "none", false, "connector"],
  transition: ["solid", "none", "filled-arrow", true, "behavior"],
  succession: ["solid", "none", "filled-arrow", true, "behavior"],
  flow: ["dashed", "none", "filled-arrow", true, "behavior"],
  binding: ["solid", "none", "none", false, "connector"],
  specialization: ["solid", "none", "hollow-triangle", true, "classifier"],
  typing: ["dashed", "none", "hollow-triangle", true, "classifier"],
  composition: ["solid", "diamond", "none", true, "ownership"],
  reference: ["solid", "hollow-diamond", "none", true, "ownership"],
  containment: ["solid", "containment", "none", true, "ownership"],
  import: ["dashed", "none", "open-arrow", true, "dependency"],
  satisfy: ["dashed", "none", "open-arrow", true, "dependency"],
  verify: ["dashed", "none", "open-arrow", true, "dependency"],
  derive: ["dashed", "none", "open-arrow", true, "derivation"],
  refine: ["dashed", "none", "open-arrow", true, "dependency"],
  allocate: ["dashed", "none", "open-arrow", true, "dependency"],
  association: ["solid", "none", "none", false, "connector"],
  include: ["dashed", "none", "filled-arrow", true, "dependency"],
  anchor: ["dashed", "none", "none", false, "annotation"],
  dependency: ["dashed", "none", "open-arrow", true, "dependency"]
});
function edgeAppearance(edge, { viewKind = edge.viewKind } = {}) {
  const profile = Object.hasOwn(profiles, edge.kind) ? profiles[edge.kind] : null;
  if (!profile) return {
    line: "solid",
    sourceMarker: "none",
    targetMarker: "none",
    directed: false,
    label: edge.label ?? "",
    supported: false,
    family: "unsupported",
    notice: `Unsupported relationship notation: ${String(edge.kind ?? "(missing kind)")}. Shown as a neutral line; direction is not inferred.`
  };
  let [line2, sourceMarker, targetMarker, directed, family] = profile;
  if (["case", "mixed"].includes(viewKind) && ["typing", "reference"].includes(edge.kind)) {
    line2 = "dashed";
    sourceMarker = "none";
    targetMarker = "open-arrow";
    directed = true;
    family = "dependency";
  }
  return {
    line: line2,
    sourceMarker,
    targetMarker,
    directed,
    family,
    label: edge.label ?? "",
    supported: true,
    notice: ""
  };
}
function edgeLayoutHints(edge, options) {
  const appearance = edgeAppearance(edge, options);
  const caseReference = appearance.family === "dependency" && edge.kind === "reference";
  const rank = ["specialization", "typing", "derive", "refine", "satisfy", "verify"].includes(edge.kind) ? "target-above-source" : ["composition", "containment", "reference"].includes(edge.kind) && !caseReference ? "source-above-target" : ["transition", "succession", "flow"].includes(edge.kind) ? "source-before-target" : "free";
  return {
    family: appearance.family,
    rank,
    preserveEndpoints: true,
    supported: appearance.supported
  };
}
function markerDefinition(name) {
  const common = {
    viewBox: "0 0 12 12",
    refX: 11,
    refY: 6,
    markerWidth: 12,
    markerHeight: 12,
    orient: "auto-start-reverse"
  };
  switch (name) {
    case "open-arrow":
      return { ...common, path: "M1,1 L11,6 L1,11", fill: "none" };
    case "filled-arrow":
      return { ...common, path: "M1,1 L11,6 L1,11 Z", fill: "line" };
    case "hollow-triangle":
      return { ...common, path: "M1,1 L11,6 L1,11 Z", fill: "background" };
    case "diamond":
      return { ...common, path: "M1,6 L6,1 L11,6 L6,11 Z", fill: "line" };
    case "hollow-diamond":
      return { ...common, path: "M1,6 L6,1 L11,6 L6,11 Z", fill: "background" };
    case "containment":
      return { ...common, path: "M11,6 A5,5 0 1,1 1,6 A5,5 0 1,1 11,6 Z", fill: "background" };
    case "continuation-chevron":
      return { ...common, path: "M2,1 L7,6 L2,11 M6,1 L11,6 L6,11", fill: "none" };
    default:
      return null;
  }
}

// src/canvas-prototype/elk-layout.mjs
var createLayoutEngine = (options) => new import_elk_api.default({ algorithms: ["layered"], ...options });
var behavioralKinds = /* @__PURE__ */ new Set(["action", "activity", "state", "sequence", "fault-tree", "mixed"]);
var sizes = /* @__PURE__ */ new Map([["initial", [28, 28]], ["final", [32, 32]], ["fork", [80, 8]], ["join", [80, 8]], ["decision", [44, 44]], ["merge", [44, 44]], ["choice", [44, 44]], ["junction", [20, 20]], ["shallow history", [36, 36]], ["deep history", [36, 36]], ["terminate action", [32, 32]], ["start", [28, 28]], ["end", [32, 32]]]);
var overlap = (a, b, gap = 0) => a.x < b.x + b.width + gap && a.x + a.width + gap > b.x && a.y < b.y + b.height + gap && a.y + a.height + gap > b.y;
var segmentHits = (a, b, n) => a.x === b.x ? a.x > n.x + 0.01 && a.x < n.x + n.width - 0.01 && Math.max(a.y, b.y) > n.y + 0.01 && Math.min(a.y, b.y) < n.y + n.height - 0.01 : a.y === b.y && a.y > n.y + 0.01 && a.y < n.y + n.height - 0.01 && Math.max(a.x, b.x) > n.x + 0.01 && Math.min(a.x, b.x) < n.x + n.width - 0.01;
var simplify2 = (points) => points.filter((p, i) => !i || p.x !== points[i - 1].x || p.y !== points[i - 1].y).filter((p, i, all) => !i || i === all.length - 1 || !(all[i - 1].x === p.x && p.x === all[i + 1].x || all[i - 1].y === p.y && p.y === all[i + 1].y));
var num = (value, fallback) => Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : fallback;
function dimensions(node) {
  const symbol = sizes.get(node.kind);
  return { width: symbol?.[0] ?? num(node.width, 160), height: symbol?.[1] ?? num(node.height, 76) };
}
function isPort(node, nodes) {
  return node.kind === "port" && nodes.has(node.parentId);
}
function projectEmbeddedPorts(view) {
  const nodes = [...view.nodes], attachments = /* @__PURE__ */ new Map(), usedIDs = new Set(nodes.map((n) => n.id));
  for (const owner of view.nodes) for (const port of owner.ports ?? []) {
    if (typeof port.id !== "string" || !port.id) throw Error("Native embedded port lacks a rendering ID");
    const key2 = JSON.stringify([owner.id, port.id]);
    if (attachments.has(key2)) throw Error("Duplicate native port on " + owner.id + ": " + port.id);
    let id = "syspresent-native-port:" + key2;
    while (usedIDs.has(id)) id += ":";
    usedIDs.add(id);
    attachments.set(key2, id);
    const name = port.nameSynthesized ? "" : port.name ?? "", label2 = port.type ? name + " : " + port.type : name;
    nodes.push({ id, kind: "port", name, label: label2, parentId: owner.id, width: 12, height: 12, semanticId: null, identityStatus: "modeled-pin", nativePortId: port.id, nativePort: structuredClone(port), direction: port.direction, parameter: port.parameter, origin: structuredClone(port.origin ?? null) });
  }
  const edges = view.edges.map((edge) => {
    const result = { ...edge };
    for (const [endpoint3, field, attachment] of [["source", "fromPort", "sourceAttachment"], ["target", "toPort", "targetAttachment"]]) {
      const pin = edge[field] ?? edge[field === "fromPort" ? "from_port" : "to_port"];
      if (!pin) continue;
      const id = attachments.get(JSON.stringify([edge[endpoint3], pin]));
      if (!id) throw Error("Native connection " + edge.id + " references unavailable port " + pin + " on " + edge[endpoint3]);
      result[attachment] = id;
    }
    return result;
  });
  return { ...view, nodes, edges };
}
function orientation(edge, behavioral, viewKind) {
  return viewKind === "fault-tree" || !behavioral && edgeLayoutHints(edge, { viewKind }).rank === "target-above-source" ? [edge.target, edge.source, true] : [edge.source, edge.target, false];
}
function partitions(nodes, edges, capacity) {
  const ranks = new Map(nodes.map((n) => [n.id, 0]));
  for (let i = 0; i < nodes.length; i++) {
    let changed = false;
    for (const [a, b] of edges) {
      if (a !== b && ranks.has(a) && ranks.has(b) && ranks.get(b) <= ranks.get(a)) {
        ranks.set(b, ranks.get(a) + 1);
        changed = true;
      }
    }
    if (!changed) break;
    if (i === nodes.length - 1) return null;
  }
  const groups = /* @__PURE__ */ new Map();
  for (const node of nodes) {
    const rank = ranks.get(node.id);
    if (!groups.has(rank)) groups.set(rank, []);
    groups.get(rank).push(node);
  }
  const result = /* @__PURE__ */ new Map();
  let row = 0;
  for (const [, group] of [...groups].sort((a, b) => a[0] - b[0])) {
    group.sort((a, b) => a.id.localeCompare(b.id));
    for (let i = 0; i < group.length; i++) result.set(group[i].id, row + Math.floor(i / capacity));
    row += Math.ceil(group.length / capacity);
  }
  return result;
}
function makeGraph(view, options, profile) {
  const nodes = new Map(view.nodes.map((n) => [n.id, n])), behavioral = behavioralKinds.has(view.kind), actualPorts = new Set(view.nodes.filter((n) => isPort(n, nodes)).map((n) => n.id)), children = new Map(view.nodes.map((n) => [n.id, []]));
  for (const node of view.nodes) if (node.parentId && nodes.has(node.parentId) && !actualPorts.has(node.id)) children.get(node.parentId).push(node.id);
  const roots = view.nodes.filter((n) => !actualPorts.has(n.id) && (!n.parentId || !nodes.has(n.parentId)));
  if (options.grouping === "owner" && !behavioral) roots.sort((a, b) => String(a.layoutGroup || a.id).localeCompare(String(b.layoutGroup || b.id)) || a.id.localeCompare(b.id));
  const rootOf = (id) => {
    let node = nodes.get(id), seen = /* @__PURE__ */ new Set();
    while (node?.parentId && nodes.has(node.parentId)) {
      if (seen.has(node.id)) throw Error("Cyclic native drawing containment");
      seen.add(node.id);
      node = nodes.get(node.parentId);
    }
    return node?.id;
  };
  const rows = profile.capacity ? partitions(roots, view.edges.filter((e) => edgeLayoutHints(e, { viewKind: view.kind }).rank !== "free").map((e) => {
    const [a, b] = orientation(e, behavioral, view.kind);
    return [rootOf(a), rootOf(b)];
  }), profile.capacity) : null;
  const elkNodes = /* @__PURE__ */ new Map(), anchors = /* @__PURE__ */ new Map(), edgeMap = /* @__PURE__ */ new Map(), gap = profile.gap;
  function build(node) {
    const { width, height } = dimensions(node), nested = children.get(node.id), result = { id: node.id, width, height, children: nested.map((id) => build(nodes.get(id))), ports: [], layoutOptions: { "elk.portConstraints": "FIXED_SIDE", "elk.portLabels.placement": "[OUTSIDE]", "elk.padding": `[top=${height + 20},left=24,bottom=24,right=24]` } };
    if (!nested.length) delete result.children;
    if (rows?.has(node.id)) result.layoutOptions["elk.partitioning.partition"] = String(rows.get(node.id));
    elkNodes.set(node.id, result);
    return result;
  }
  const graph = { id: "syspresent-layout-root", children: roots.map(build), edges: [], layoutOptions: {
    "elk.algorithm": "layered",
    "elk.direction": "DOWN",
    "elk.edgeRouting": "ORTHOGONAL",
    "elk.hierarchyHandling": "INCLUDE_CHILDREN",
    "elk.randomSeed": "1",
    "elk.padding": "[top=12,left=12,bottom=12,right=12]",
    "elk.spacing.nodeNode": String(gap),
    "elk.spacing.edgeEdge": "12",
    "elk.spacing.edgeNode": "12",
    "elk.spacing.labelNode": "8",
    "elk.spacing.edgeLabel": "7",
    "elk.layered.spacing.nodeNodeBetweenLayers": String(gap),
    "elk.layered.spacing.edgeEdgeBetweenLayers": "12",
    "elk.layered.spacing.edgeNodeBetweenLayers": "12",
    "elk.layered.mergeEdges": "false",
    "elk.layered.mergeHierarchyEdges": "false",
    "elk.layered.unnecessaryBendpoints": "true",
    "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
    "elk.layered.nodePlacement.strategy": profile.capacity ? "SIMPLE" : "BRANDES_KOEPF",
    ...profile.balanced ? { "elk.layered.nodePlacement.favorStraightEdges": "false", "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED" } : {},
    ...rows ? { "elk.partitioning.activate": "true" } : {},
    ...options.grouping === "owner" && !behavioral ? { "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES" } : {}
  } };
  for (const native of view.nodes.filter((n) => actualPorts.has(n.id))) {
    const owner = elkNodes.get(native.parentId), incoming = view.edges.find((e) => (e.sourceAttachment ?? e.source) === native.id || (e.targetAttachment ?? e.target) === native.id), specified = String(native.portSide ?? native.side ?? "").toUpperCase();
    const side = ["NORTH", "SOUTH", "EAST", "WEST"].includes(specified) ? specified : (incoming?.sourceAttachment ?? incoming?.source) === native.id ? "SOUTH" : "NORTH";
    const text2 = native.label ?? native.name, label2 = text2 ? options.measureLabel?.(text2) ?? { width: String(text2).length * 6.5, height: 16 } : null;
    owner.ports.push({ id: native.id, width: num(native.width, 12), height: num(native.height, 12), ...label2 ? { labels: [{ id: native.id + ":port-label", text: text2, width: num(label2.width, 1), height: num(label2.height, 16) }] } : {}, layoutOptions: { "elk.port.side": side, "elk.port.borderOffset": String(-Math.min(num(native.width, 12), num(native.height, 12)) / 2) } });
    anchors.set(native.id, { identityStatus: native.semanticId ? "actual-model-port" : "modeled-pin", semanticId: native.semanticId ?? null, representationId: native.id, ownerId: native.parentId, ...native.nativePortId ? { nativePortId: native.nativePortId, nativePort: structuredClone(native.nativePort) } : {} });
  }
  function anchor(id, edgeId, side, preferredSide) {
    if (actualPorts.has(id)) return id;
    const portId = `syspresent-anchor:${edgeId}:${side}`, owner = elkNodes.get(id);
    if (!owner) throw Error("Native endpoint has no drawing owner: " + id);
    owner.ports.push({ id: portId, width: 0, height: 0, layoutOptions: { "elk.port.side": preferredSide ?? (side === "source" ? "SOUTH" : "NORTH") } });
    anchors.set(portId, { identityStatus: "drawing-anchor", semanticId: null, representationId: null, ownerId: id });
    return portId;
  }
  for (const [i, edge] of [...view.edges].sort((a, b) => a.id.localeCompare(b.id)).entries()) {
    const [source, target, reversed] = orientation(edge, behavioral, view.kind), id = `syspresent-edge:${i}`, label2 = edge.label ? options.measureLabel?.(edge.label) ?? { width: String(edge.label).length * 7.2 + 4, height: 16 } : null;
    const sourcePin = reversed ? edge.targetAttachment : edge.sourceAttachment, targetPin = reversed ? edge.sourceAttachment : edge.targetAttachment, sides = profile.anchorSides?.get(edge.id);
    graph.edges.push({ id, sources: [anchor(sourcePin ?? source, id, "source", sides?.[0])], targets: [anchor(targetPin ?? target, id, "target", sides?.[1])], ...label2 ? { labels: [{ id: id + ":label", text: edge.label, width: num(label2.width, 1), height: num(label2.height, 16) }] } : {} });
    edgeMap.set(id, { edge, reversed });
  }
  return { graph, nodes, children, actualPorts, anchors, edgeMap };
}
function readLayout(view, data, laid, options, profile) {
  const positions = /* @__PURE__ */ new Map(), routes = /* @__PURE__ */ new Map(), diagnostics = [], ports = [], nativeRoutes = [];
  function walk(item, ox = 0, oy = 0) {
    const x = ox + (item.x ?? 0), y = oy + (item.y ?? 0);
    if (data.nodes.has(item.id)) {
      const native = data.nodes.get(item.id);
      positions.set(item.id, { ...native, x, y, width: item.width, height: item.height, ...item.children?.length ? { headerHeight: dimensions(native).height } : {} });
    }
    for (const port of item.ports ?? []) {
      const anchor = data.anchors.get(port.id), position = { ...anchor, id: port.id, x: x + port.x + port.width / 2, y: y + port.y + port.height / 2, side: port.layoutOptions?.["elk.port.side"] };
      ports.push(position);
      if (data.actualPorts.has(port.id)) {
        const native = data.nodes.get(port.id), label2 = port.labels?.[0], portLabelBox = label2 ? { x: x + port.x + label2.x, y: y + port.y + label2.y, width: label2.width, height: label2.height } : null;
        positions.set(port.id, { ...native, portSide: port.layoutOptions?.["elk.port.side"], x: x + port.x, y: y + port.y, width: port.width, height: port.height, ...portLabelBox ? { portLabelBox } : {} });
        position.portLabelBox = portLabelBox;
      }
    }
    for (const edge of item.edges ?? []) nativeRoutes.push({ edge, x, y });
    for (const child of item.children ?? []) walk(child, x, y);
  }
  walk(laid);
  for (const record of nativeRoutes) {
    const { edge } = record, native = data.edgeMap.get(edge.id);
    if (!native) continue;
    const container = positions.get(edge.container), x = container?.x ?? record.x, y = container?.y ?? record.y;
    const points = simplify2((edge.sections ?? []).flatMap((s) => [s.startPoint, ...s.bendPoints ?? [], s.endPoint]).map((p) => ({ x: p.x + x, y: p.y + y })));
    const label2 = edge.labels?.[0], labelBox = label2 ? { x: label2.x + x, y: label2.y + y, width: label2.width, height: label2.height } : void 0;
    const first = data.anchors.get(edge.sources?.[0]), last = data.anchors.get(edge.targets?.[0]);
    routes.set(native.edge.id, { ...native.edge, points: native.reversed ? [...points].reverse() : points, ...labelBox ? { labelBox, x: labelBox.x, y: labelBox.y + labelBox.height * 0.78 } : {}, sourceAnchor: native.reversed ? last : first, targetAnchor: native.reversed ? first : last, routingEngine: "elk-layered" });
  }
  const nodes = view.nodes.map((n) => positions.get(n.id)).filter(Boolean);
  if (!behavioralKinds.has(view.kind) && nodes.length <= 24 && !nodes.some((n) => n.parentId)) optimizeRoutes([...routes.values()], nodes);
  const ancestors = (id) => {
    const result = /* @__PURE__ */ new Set();
    let node = data.nodes.get(id);
    while (node?.parentId && data.nodes.has(node.parentId)) {
      if (result.has(node.parentId)) throw Error("Cyclic native drawing containment");
      result.add(node.parentId);
      node = data.nodes.get(node.parentId);
    }
    return result;
  };
  if (nodes.length !== view.nodes.length || nodes.some((n) => ![n.x, n.y, n.width, n.height].every(Number.isFinite))) throw Error("ELK returned invalid tile geometry");
  const edges = view.edges.map((native) => {
    const edge = routes.get(native.id) ?? { ...native, points: [] }, anc = /* @__PURE__ */ new Set([...ancestors(native.sourceAttachment ?? native.source), ...ancestors(native.targetAttachment ?? native.target)]);
    const obstacles = nodes.flatMap((n) => data.children.get(n.id)?.length ? anc.has(n.id) ? [{ ...n, height: n.headerHeight }] : [n] : data.actualPorts.has(n.id) && [native.sourceAttachment ?? native.source, native.targetAttachment ?? native.target].includes(n.id) ? [] : [n]);
    const blocked = edge.points.length < 2 || edge.points.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y)) || edge.points.slice(1).some((point2, i) => obstacles.some((n) => segmentHits(edge.points[i], point2, n)));
    if (blocked) {
      diagnostics.push({ reason: "unroutable-connection", relationshipId: native.id, message: "No unobstructed native connection route was found." });
      edge.points = [];
      edge.routingBlocked = true;
    }
    if (edge.labelBox && (![edge.labelBox.x, edge.labelBox.y, edge.labelBox.width, edge.labelBox.height].every(Number.isFinite) || obstacles.some((n) => overlap(edge.labelBox, n, 2)))) {
      delete edge.labelBox;
      edge.labelOmitted = true;
      diagnostics.push({ reason: "unplaceable-connection-label", relationshipId: native.id });
    }
    return edge;
  });
  for (let i = 0; i < edges.length; i++) for (let j = 0; j < i; j++) if (edges[i].labelBox && edges[j].labelBox && overlap(edges[i].labelBox, edges[j].labelBox, 2)) {
    delete edges[i].labelBox;
    edges[i].labelOmitted = true;
    diagnostics.push({ reason: "unplaceable-connection-label", relationshipId: edges[i].id });
  }
  return { ...view, nodes, edges, ports, diagnostics, omissions: [...view.omissions ?? [], ...diagnostics], bounds: { x: 0, y: 0, width: laid.width, height: laid.height }, layoutEngine: "elk-layered", layoutProfile: (profile.capacity ? "responsive-partitions-" + profile.capacity : "layered") + (profile.anchorSides ? "-facing-sides" : "") + (profile.balanced ? "-balanced" : ""), panels: structuredClone(options.panels ?? []) };
}
async function layoutDiagram(nativeView, options = {}) {
  const { width = 1e3, height = 700, elk } = options;
  if (!elk?.layout) throw Error("layoutDiagram requires an ELK engine");
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) throw Error("Invalid viewport");
  const view = applyBehaviorLayout(projectEmbeddedPorts(projectView(nativeView))), area = options.panels?.length ? graphArea(width, height, options.panels) : { width, height };
  if (!view.nodes.length) return { ...view, nodes: [], edges: [], ports: [], diagnostics: [], bounds: { x: 0, y: 0, width: 1, height: 1 }, layoutEngine: "elk-layered" };
  const rootCount = view.nodes.filter((n) => !n.parentId).length, behavioral = behavioralKinds.has(view.kind), profiles2 = [{ gap: 32 }];
  if (!behavioral && rootCount > 2 && area.width < 700) for (const capacity of [2, 1]) profiles2.push({ gap: 28, capacity });
  if (!behavioral && rootCount >= 3 && rootCount <= 9 && requirementFanout(view)) profiles2.push({ gap: 32, balanced: true });
  const candidates = [];
  for (const profile of profiles2) {
    try {
      const data = makeGraph(view, options, profile), laid = await elk.layout(data.graph), candidate = readLayout(view, data, laid, options, profile);
      scoreLayout(candidate, area);
      candidates.push(candidate);
      let previous = candidate;
      const seen = /* @__PURE__ */ new Set();
      for (let retry = 0; !behavioral && profile.capacity && retry < 3; retry++) {
        const anchorSides = facingSides(previous);
        if (!anchorSides.size) break;
        const key2 = JSON.stringify([...anchorSides]);
        if (seen.has(key2)) break;
        seen.add(key2);
        const alternate = { ...profile, anchorSides }, joint = makeGraph(view, options, alternate), result = readLayout(view, joint, await elk.layout(joint.graph), options, alternate);
        scoreLayout(result, area);
        candidates.push(result);
        previous = result;
      }
    } catch (error) {
      candidates.push({ ...view, nodes: [], edges: view.edges.map((e) => ({ ...e, points: [], routingBlocked: true })), ports: [], bounds: { x: 0, y: 0, width: 1, height: 1 }, layoutEngine: "elk-layered", layoutScore: 1e9, diagnostics: [{ reason: "layout-failed", message: error.message }] });
    }
  }
  candidates.sort((a, b) => a.layoutScore - b.layoutScore);
  if (!candidates.some((candidate) => candidate.nodes.length)) throw Error(candidates[0]?.diagnostics[0]?.message ?? "ELK could not lay out the native diagram");
  return candidates[0];
}
function requirementFanout(view) {
  if (!["requirement", "definition", "general"].includes(view.kind) || view.nodes.some((n) => n.parentId) || view.edges.length !== view.nodes.length - 1) return false;
  const oriented = view.edges.map((edge) => edgeLayoutHints(edge, { viewKind: view.kind }).rank === "target-above-source" ? orientation(edge, false, view.kind) : null);
  return oriented.every(Boolean) && oriented.every(([source]) => source === oriented[0][0]) && new Set(oriented.map(([, target]) => target)).size === view.nodes.length - 1;
}
function facingSides(view) {
  const nodes = new Map(view.nodes.map((n) => [n.id, n])), sides = /* @__PURE__ */ new Map();
  for (const edge of view.edges) {
    if (edgeLayoutHints(edge, { viewKind: view.kind }).rank === "free") continue;
    const [from, to] = orientation(edge, false, view.kind), a = nodes.get(from), b = nodes.get(to);
    if (!a || !b || a.parentId || b.parentId || a.kind === "port" || b.kind === "port") continue;
    if (!view.nodes.some((n) => n !== a && n !== b && !n.parentId && n.y >= a.y + a.height - 0.01 && n.y + n.height <= b.y + 0.01)) continue;
    const side = b.x + b.width / 2 < a.x + a.width / 2 ? "WEST" : "EAST";
    sides.set(edge.id, [side, side]);
  }
  return sides;
}
function scoreLayout(candidate, area) {
  let length2 = 0, bends = 0, stretch = 0, crossings = 0;
  for (const edge of candidate.edges) {
    const points = edge.points;
    let route2 = 0;
    for (let i = 1; i < points.length; i++) route2 += Math.abs(points[i].x - points[i - 1].x) + Math.abs(points[i].y - points[i - 1].y);
    length2 += route2;
    bends += Math.max(0, points.length - 2);
    if (points.length > 1) {
      const direct = Math.abs(points[0].x - points.at(-1).x) + Math.abs(points[0].y - points.at(-1).y);
      stretch += Math.max(0, route2 / Math.max(1, direct) - 1);
    }
  }
  for (let i = 0; i < candidate.edges.length; i++) for (let j = 0; j < i; j++) {
    const a = candidate.edges[i].points, b = candidate.edges[j].points;
    for (let ai = 1; ai < a.length; ai++) for (let bi = 1; bi < b.length; bi++) {
      const aa = a[ai - 1], ab = a[ai], ba = b[bi - 1], bb = b[bi], horizontal = aa.y === ab.y, otherHorizontal = ba.y === bb.y;
      if (horizontal === otherHorizontal) continue;
      const h = horizontal ? [aa, ab] : [ba, bb], v = horizontal ? [ba, bb] : [aa, ab];
      if (v[0].x > Math.min(h[0].x, h[1].x) + 0.01 && v[0].x < Math.max(h[0].x, h[1].x) - 0.01 && h[0].y > Math.min(v[0].y, v[1].y) + 0.01 && h[0].y < Math.max(v[0].y, v[1].y) - 0.01) crossings++;
    }
  }
  const occupied = [...candidate.nodes, ...candidate.edges.flatMap((e) => [...e.labelBox ? [e.labelBox] : [], ...e.points.map((p) => ({ ...p, width: 0, height: 0 }))])], minX = Math.min(...occupied.map((n) => n.x)), minY = Math.min(...occupied.map((n) => n.y)), maxX = Math.max(...occupied.map((n) => n.x + n.width)), maxY = Math.max(...occupied.map((n) => n.y + n.height));
  candidate.bounds = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  const scale = Math.min(1, area.width / (candidate.bounds.width + 20), area.height / (candidate.bounds.height + 20));
  candidate.layoutFitScale = scale;
  const extent = candidate.nodes.reduce((sum, n) => sum + n.width + n.height, 0);
  candidate.layoutMetrics = { pathLength: length2, bends, pathStretch: stretch, crossings };
  candidate.layoutScore = candidate.diagnostics.length * 1e4 + 3 / Math.max(0.01, scale) + length2 / Math.max(1, extent) * 0.45 + stretch * 0.3 + bends * 0.05 + crossings * 0.6 + candidate.bounds.width * candidate.bounds.height / 1e8;
}
function optimizeRoutes(edges, nodes) {
  const inflated = (n, padding) => ({ x: n.x - padding, y: n.y - padding, width: n.width + padding * 2, height: n.height + padding * 2 });
  const tileObstacles = nodes.map((n) => inflated(n, 4)), settled = [];
  for (const edge of [...edges].sort((a, b) => String(a.id).localeCompare(String(b.id)))) {
    const original = edge.points;
    if (original.length < 2) continue;
    const obstacles = [...tileObstacles, ...edges.flatMap((other) => other !== edge && other.labelBox ? [inflated(other.labelBox, 3)] : [])];
    const start2 = original[0], end = original.at(-1), normal = (from, to) => ({ x: Math.sign(to.x - from.x), y: Math.sign(to.y - from.y) }), a = normal(start2, original[1]), b = normal(end, original.at(-2));
    if (a.x && a.y || b.x && b.y) continue;
    const stub = { x: start2.x + a.x * 8, y: start2.y + a.y * 8 }, finish = { x: end.x + b.x * 8, y: end.y + b.y * 8 };
    const middle = routeOrthogonal(stub, finish, obstacles, { bendPenalty: 24, segmentCost: (from, to) => {
      let cost = 0;
      for (const points of settled) for (let i = 1; i < points.length; i++) {
        const a2 = points[i - 1], b3 = points[i];
        if (from.y === to.y && a2.y === b3.y && from.y === a2.y) cost += Math.max(0, Math.min(Math.max(from.x, to.x), Math.max(a2.x, b3.x)) - Math.max(Math.min(from.x, to.x), Math.min(a2.x, b3.x))) * 4;
        else if (from.x === to.x && a2.x === b3.x && from.x === a2.x) cost += Math.max(0, Math.min(Math.max(from.y, to.y), Math.max(a2.y, b3.y)) - Math.max(Math.min(from.y, to.y), Math.min(a2.y, b3.y))) * 4;
        else {
          const h = from.y === to.y ? [from, to] : [a2, b3], v = from.x === to.x ? [from, to] : [a2, b3];
          if (h[0].y === h[1].y && v[0].x === v[1].x && v[0].x > Math.min(h[0].x, h[1].x) && v[0].x < Math.max(h[0].x, h[1].x) && h[0].y > Math.min(v[0].y, v[1].y) && h[0].y < Math.max(v[0].y, v[1].y)) cost += 80;
        }
      }
      return cost;
    } });
    if (middle) {
      const points = simplify2([start2, ...middle, end]), length2 = (ps) => ps.slice(1).reduce((sum, p, i) => sum + Math.abs(p.x - ps[i].x) + Math.abs(p.y - ps[i].y), 0);
      if (length2(points) + Math.max(0, points.length - 2) * 24 < length2(original) + Math.max(0, original.length - 2) * 24) edge.points = points;
    }
    if (!relocateLabels([edge], nodes, edges)) edge.points = original;
    settled.push(edge.points);
  }
}
function relocateLabels(edges, nodes, allEdges = edges) {
  const distance3 = (box, points) => {
    const center2 = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    return Math.min(...points.slice(1).map((b, i) => {
      const a = points[i];
      return a.x === b.x ? Math.hypot(center2.x - a.x, center2.y - Math.max(Math.min(a.y, b.y), Math.min(Math.max(a.y, b.y), center2.y))) : Math.hypot(center2.y - a.y, center2.x - Math.max(Math.min(a.x, b.x), Math.min(Math.max(a.x, b.x), center2.x)));
    }));
  };
  for (const edge of edges) {
    const box = edge.labelBox;
    if (!box) continue;
    const crossed = edge.points.slice(1).some((p, i) => segmentHits(edge.points[i], p, box));
    const left = Math.min(...nodes.map((n) => n.x)), right = Math.max(...nodes.map((n) => n.x + n.width));
    if (!crossed && box.x >= left && box.x + box.width <= right && distance3(box, edge.points) < Math.max(box.width, box.height) / 2 + 12) continue;
    const candidates = [];
    for (let i = 1; i < edge.points.length; i++) {
      const a = edge.points[i - 1], b = edge.points[i], length2 = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
      for (const t of [0.5, 0.25, 0.75]) {
        const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
        if (a.y === b.y) candidates.push({ ...box, x: x - box.width / 2, y: y - box.height - 5, score: length2 }, { ...box, x: x - box.width / 2, y: y + 5, score: length2 - 1 });
        else candidates.push({ ...box, x: x + 5, y: y - box.height / 2, score: length2 }, { ...box, x: x - box.width - 5, y: y - box.height / 2, score: length2 - 1 });
      }
    }
    const labelScore = (candidate) => candidate.score - 12 * (Math.max(0, left - candidate.x) + Math.max(0, candidate.x + candidate.width - right));
    const replacement = candidates.sort((a, b) => labelScore(b) - labelScore(a)).find((candidate) => !nodes.some((n) => overlap(candidate, n, 3)) && !allEdges.some((other) => other !== edge && other.labelBox && overlap(candidate, other.labelBox, 4)) && !allEdges.some((other) => other.points.slice(1).some((p, i) => segmentHits(other.points[i], p, { x: candidate.x - 2, y: candidate.y - 2, width: candidate.width + 4, height: candidate.height + 4 }))));
    if (replacement) {
      delete replacement.score;
      edge.labelBox = replacement;
      edge.x = replacement.x;
      edge.y = replacement.y + replacement.height * 0.78;
    } else return false;
  }
  return true;
}

// src/canvas-prototype/camera.mjs
var CAMERA_LIMITS = Object.freeze({ minScale: 5e-3, maxScale: 4 });
var finite = (value, fallback) => Number.isFinite(value) ? value : fallback;
function limits(options = {}) {
  const minScale = clamp(finite(options.minScale, CAMERA_LIMITS.minScale), CAMERA_LIMITS.minScale, CAMERA_LIMITS.maxScale);
  return { minScale, maxScale: clamp(finite(options.maxScale, CAMERA_LIMITS.maxScale), minScale, CAMERA_LIMITS.maxScale) };
}
var clamp = (value, min, max2) => Math.max(min, Math.min(max2, value));
function createCamera(camera = {}, options = {}) {
  const { minScale, maxScale } = limits(options);
  return { x: finite(camera?.x, 0), y: finite(camera?.y, 0), scale: clamp(finite(camera?.scale, 1), minScale, maxScale) };
}
function panCamera(camera, dx, dy) {
  const c = createCamera(camera);
  return { ...c, x: c.x + finite(dx, 0), y: c.y + finite(dy, 0) };
}
function zoomCameraAt(camera, point2, factor, options = {}) {
  const c = createCamera(camera, options), { minScale, maxScale } = limits(options);
  const scale = clamp(c.scale * Math.max(1e-4, finite(factor, 1)), minScale, maxScale);
  const world = { x: (point2.x - c.x) / c.scale, y: (point2.y - c.y) / c.scale };
  return { x: point2.x - world.x * scale, y: point2.y - world.y * scale, scale };
}
function fitCameraToBounds(bounds2, area, padding = 24, options = {}) {
  if (!bounds2 || !area || ![bounds2.x, bounds2.y, bounds2.width, bounds2.height, area.x, area.y, area.width, area.height].every(Number.isFinite) || bounds2.width < 0 || bounds2.height < 0 || area.width <= 0 || area.height <= 0) return createCamera({}, options);
  const inset = Math.max(0, finite(padding, 24)), { minScale, maxScale } = limits(options);
  const scale = clamp(Math.min(Math.max(1, area.width - inset * 2) / Math.max(1, bounds2.width), Math.max(1, area.height - inset * 2) / Math.max(1, bounds2.height)), minScale, maxScale);
  return { x: area.x + area.width / 2 - (bounds2.x + bounds2.width / 2) * scale, y: area.y + area.height / 2 - (bounds2.y + bounds2.height / 2) * scale, scale };
}
function graphTarget(target, element2) {
  if (!target || !element2.contains(target)) return false;
  if (target.closest?.("article,aside,dialog,#selection,#canvas-tools,#loading,[data-camera-ignore]")) return false;
  if (target.closest?.(".node,[data-relationship],[data-camera-surface]")) return true;
  return !target.closest?.('button,a,input,textarea,select,summary,[contenteditable="true"],[role="button"]');
}
var midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
var distance2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function bindCameraControls({ element: element2, getCamera, setCamera, onChange, onGestureStart, getViewportArea, shouldHandleTarget = graphTarget, minScale = 5e-3, maxScale = 4, dragThreshold = 5 }) {
  if (!element2 || typeof getCamera !== "function" || typeof setCamera !== "function") throw new TypeError("Camera controls require element, getCamera and setCamera");
  const options = { minScale, maxScale }, points = /* @__PURE__ */ new Map(), listeners = [], captures = /* @__PURE__ */ new Set();
  const pointerHost = element2.ownerDocument ?? element2;
  let gesture = null, moved = false, suppressClick = false, disposed = false;
  const local = (event) => {
    const r = element2.getBoundingClientRect();
    return { x: event.clientX - r.left, y: event.clientY - r.top };
  };
  const accept = (event) => shouldHandleTarget(event.target, element2, event);
  const listen = (host, type, fn, options2) => {
    host.addEventListener(type, fn, options2);
    listeners.push(() => host.removeEventListener(type, fn, options2));
  };
  const emit = (camera, source) => {
    const next = createCamera(camera, options), current = createCamera(getCamera(), options);
    if (next.x === current.x && next.y === current.y && next.scale === current.scale) return;
    setCamera(next, { source });
    onChange?.(next, { source });
  };
  const rebase = () => {
    gesture = { camera: createCamera(getCamera(), options), points: [...points.values()].map((p) => ({ ...p })) };
  };
  const capture2 = () => {
    for (const id of points.keys()) if (!captures.has(id)) {
      try {
        element2.setPointerCapture?.(id);
        captures.add(id);
      } catch {
      }
    }
  };
  const begin = (source) => {
    if (!moved) {
      moved = true;
      suppressClick = true;
      onGestureStart?.({ source });
      if (gesture) gesture.camera = createCamera(getCamera(), options);
    }
    capture2();
  };
  const down = (event) => {
    if (disposed || event.button > 0 || points.has(event.pointerId) || points.size >= 2 || !accept(event)) return;
    if (!points.size) {
      moved = false;
      suppressClick = false;
    }
    points.set(event.pointerId, local(event));
    rebase();
    if (points.size === 2) {
      begin("pinch");
      event.preventDefault();
    }
  };
  const move = (event) => {
    if (!points.has(event.pointerId) || !gesture) return;
    points.set(event.pointerId, local(event));
    const current = [...points.values()], base = gesture.points;
    if (current.length === 2 && base.length === 2) {
      begin("pinch");
      event.preventDefault();
      const origin = midpoint(...base), now = midpoint(...current), ratio = distance2(...current) / Math.max(1, distance2(...base));
      const zoomed = zoomCameraAt(gesture.camera, origin, ratio, options);
      emit({ ...zoomed, x: zoomed.x + now.x - origin.x, y: zoomed.y + now.y - origin.y }, "pinch");
    } else if (current.length === 1 && base.length === 1) {
      const dx = current[0].x - base[0].x, dy = current[0].y - base[0].y;
      if (!moved && Math.hypot(dx, dy) < dragThreshold) return;
      begin("pan");
      event.preventDefault();
      emit(panCamera(gesture.camera, dx, dy), "pan");
    }
  };
  const release = (id) => {
    if (captures.delete(id)) try {
      element2.releasePointerCapture?.(id);
    } catch {
    }
  };
  const up = (event) => {
    if (!points.has(event.pointerId)) return;
    points.delete(event.pointerId);
    release(event.pointerId);
    if (points.size) rebase();
    else gesture = null;
  };
  const cancel = (event) => {
    if (!points.has(event.pointerId)) return;
    suppressClick = true;
    points.clear();
    gesture = null;
    for (const id of [...captures]) release(id);
  };
  const click = (event) => {
    if (suppressClick && event.detail !== 0 && accept(event)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      suppressClick = false;
    }
  };
  const wheel = (event) => {
    if (!accept(event) || !Number.isFinite(event.deltaY) || !event.deltaY) return;
    event.preventDefault();
    onGestureStart?.({ source: "wheel" });
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element2.getBoundingClientRect().height : 1;
    emit(zoomCameraAt(getCamera(), local(event), Math.exp(clamp(-event.deltaY * unit * 2e-3, -2, 2)), options), "wheel");
  };
  const key2 = (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || !accept(event) || !["+", "=", "-", "0", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    onGestureStart?.({ source: "keyboard" });
    const r = element2.getBoundingClientRect(), area = getViewportArea?.();
    const usable = area && [area.x, area.y, area.width, area.height].every(Number.isFinite) && area.width > 0 && area.height > 0;
    const center2 = usable ? { x: area.x + area.width / 2, y: area.y + area.height / 2 } : { x: r.width / 2, y: r.height / 2 };
    let next;
    if (event.key === "+" || event.key === "=") next = zoomCameraAt(getCamera(), center2, 1.25, options);
    else if (event.key === "-") next = zoomCameraAt(getCamera(), center2, 0.8, options);
    else if (event.key === "0") next = createCamera({}, options);
    else if (event.key === "ArrowLeft") next = panCamera(getCamera(), 48, 0);
    else if (event.key === "ArrowRight") next = panCamera(getCamera(), -48, 0);
    else if (event.key === "ArrowUp") next = panCamera(getCamera(), 0, 48);
    else if (event.key === "ArrowDown") next = panCamera(getCamera(), 0, -48);
    if (next) emit(next, "keyboard");
  };
  listen(element2, "pointerdown", down);
  listen(pointerHost, "pointermove", move, { passive: false });
  listen(pointerHost, "pointerup", up);
  listen(pointerHost, "pointercancel", cancel);
  listen(element2, "lostpointercapture", cancel);
  listen(element2, "click", click, true);
  listen(element2, "wheel", wheel, { passive: false });
  listen(element2, "keydown", key2);
  return () => {
    disposed = true;
    points.clear();
    gesture = null;
    for (const id of [...captures]) release(id);
    for (const remove of listeners) remove();
  };
}

// src/canvas-prototype/scene-regions.mjs
function regionAreas(area, regions, active2 = "primary") {
  if (regions.length < 2) return regions.map((region) => ({ ...region, area: { ...area }, visible: true }));
  const narrow = area.width < 760, gap = 16, header = 36, width = (area.width - gap * (regions.length - 1)) / regions.length;
  return regions.map((region, i) => ({
    ...region,
    visible: !narrow || region.id === active2,
    area: { x: narrow ? area.x : area.x + i * (width + gap), y: area.y + header, width: narrow ? area.width : width, height: Math.max(80, area.height - header) }
  }));
}
var serial2 = 0;
function updateRegionReferences(previous, names) {
  const remaining = [...previous], used = new Set(previous.map((r) => r.id)), result = [];
  for (const view of names) {
    const index = remaining.findIndex((r) => r.view === view);
    if (index >= 0) {
      result.push({ ...remaining.splice(index, 1)[0], view });
      continue;
    }
    let i = 1;
    while (used.has("region-" + i)) i++;
    const id = "region-" + i;
    used.add(id);
    result.push({ id, view });
  }
  return result;
}
async function mountGraphRegion(host, view, { onSelect, onExplore, selectedId, selectedIds: sharedIds, state: state2 = {}, onStateChange, elk, routing = "square", measureLabel } = {}) {
  const doc = host.ownerDocument, ns = "http://www.w3.org/2000/svg";
  const svg = (name, attrs = {}) => {
    const node = doc.createElementNS(ns, name);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    return node;
  };
  const width = host.clientWidth || 480, height = host.clientHeight || 400;
  const layout = await layoutDiagram(view, { width, height, elk, measureLabel });
  const fitted = fitDiagram(layout, { x: 0, y: 0, width, height });
  const viewport = doc.createElement("div");
  viewport.className = "region-graph";
  viewport.tabIndex = 0;
  viewport.setAttribute("aria-label", view.title || "Model graph");
  const world = doc.createElement("div");
  world.className = "region-world";
  viewport.append(world);
  const drawing = svg("svg", { width, height, "aria-label": "Model relationships" }), defs = svg("defs"), prefix = "region-" + ++serial2 + "-";
  for (const name of ["open-arrow", "filled-arrow", "hollow-triangle", "diamond", "hollow-diamond", "containment"]) {
    const { path, fill, ...attrs } = markerDefinition(name), marker = svg("marker", { ...attrs, id: prefix + name, markerUnits: "userSpaceOnUse" });
    marker.append(svg("path", { d: path, fill: fill === "line" ? "#426869" : fill === "background" ? "#fff" : "none", stroke: "#426869" }));
    defs.append(marker);
  }
  drawing.append(defs);
  world.append(drawing);
  const targets = [], edgeTargets = [], notices = [...view.notices ?? [], ...(layout.diagnostics ?? []).map((d) => d.message || d.reason)];
  for (const edge of fitted.edges) {
    const appearance = edgeAppearance(edge, { viewKind: view.kind }), a = fitted.nodes.find((n) => n.id === edge.source), b = fitted.nodes.find((n) => n.id === edge.target);
    if (!appearance.supported) notices.push(appearance.notice);
    const record = { semanticId: edge.semanticId, kind: "relationship", label: edge.label || edge.kind, relationships: [{ semanticId: edge.semanticId, sourceSemanticId: a?.semanticId, targetSemanticId: b?.semanticId, kind: edge.kind, label: edge.label }] };
    if (!edge.points?.length || edge.routingBlocked) {
      notices.push(`Connection route unavailable: ${edge.label || edge.kind}`);
      continue;
    }
    const g = svg("g", { tabindex: 0, role: "button", "aria-label": record.label });
    const path = svg("path", { d: connectionPath(edge.points, { style: routing, edge, nodes: fitted.nodes }), fill: "none", stroke: "#426869", "stroke-width": 1.5 });
    for (const [side, marker] of [["start", appearance.sourceMarker], ["end", appearance.targetMarker]]) if (marker !== "none") path.setAttribute("marker-" + side, `url(#${prefix + marker})`);
    if (appearance.line === "dashed") path.setAttribute("stroke-dasharray", "5 3");
    const hit = path.cloneNode();
    hit.setAttribute("stroke", "transparent");
    hit.setAttribute("stroke-width", 16);
    g.append(hit, path);
    if (edge.label && !edge.labelOmitted && Number.isFinite(edge.x) && Number.isFinite(edge.y)) {
      const label2 = svg("text", { x: edge.x, y: edge.y, "font-size": 12, fill: "#355e60", "paint-order": "stroke", stroke: "white", "stroke-width": 3 });
      label2.textContent = edge.label;
      g.append(label2);
    }
    const choose = () => {
      select2(record.semanticId);
      changed();
      onSelect?.(record);
    };
    g.onclick = (e) => {
      e.stopPropagation();
      choose();
    };
    g.onkeydown = (e) => {
      if (["Enter", " "].includes(e.key)) {
        e.preventDefault();
        choose();
      }
    };
    drawing.append(g);
    edgeTargets.push({ node: g, semanticId: edge.semanticId });
  }
  for (const n of fitted.nodes) {
    const node = doc.createElement("button");
    node.className = `node ${n.kind}${n.container ? " container" : ""}`;
    node.dataset.semanticId = n.semanticId ?? "";
    const scale = fitted.scale || 1;
    node.style.cssText = `left:${n.x}px;top:${n.y}px;width:${n.width / scale}px;height:${n.height / scale}px;transform:scale(${scale});z-index:${n.container ? 1 : 3}`;
    const face2 = behaviorFace(doc, n);
    if (face2) node.append(face2);
    else {
      for (const [cls, text2] of [["kind", `\xAB${n.kind}\xBB`], ["name", n.name], ["detail", n.displayDetail]]) if (text2) {
        const span = doc.createElement("span");
        span.className = cls;
        span.textContent = text2;
        node.append(span);
      }
    }
    node.onclick = (e) => {
      e.stopPropagation();
      select2(n.semanticId);
      changed();
      onSelect?.({ semanticId: n.semanticId, name: n.name, label: n.name, kind: "element" });
    };
    world.append(node);
    targets.push({ node, n });
  }
  host.replaceChildren(viewport);
  if (notices.length) {
    const details = doc.createElement("details");
    details.className = "region-notices";
    const summary = doc.createElement("summary");
    summary.textContent = `View notices (${notices.length})`;
    details.append(summary);
    for (const notice of notices) {
      const p = doc.createElement("p");
      p.textContent = typeof notice === "string" ? notice : JSON.stringify(notice);
      details.append(p);
    }
    host.append(details);
  }
  let camera = createCamera(state2.camera), selected = selectedId, selectedIds = sharedIds ?? state2.selectedIds ?? [selectedId].filter(Boolean);
  const changed = () => onStateChange?.({ camera, selectedId: selected, selectedIds: [...selectedIds] });
  const update = (value) => {
    camera = createCamera(value);
    world.style.transform = `translate(${camera.x}px,${camera.y}px) scale(${camera.scale})`;
    changed();
  };
  const cleanup = bindCameraControls({ element: viewport, getCamera: () => camera, setCamera: update, shouldHandleTarget: (target) => target === viewport || target === world || target === drawing });
  function selectMany(ids) {
    selectedIds = [...new Set(ids.filter(Boolean))];
    selected = selectedIds.length === 1 ? selectedIds[0] : null;
    for (const { node, n } of targets) node.classList.toggle("selected", selectedIds.includes(n.semanticId));
    for (const target of edgeTargets) {
      const active2 = selectedIds.includes(target.semanticId);
      target.node.classList.toggle("selected", active2);
      target.node.setAttribute("aria-pressed", String(active2));
    }
  }
  function select2(id) {
    selectMany([id]);
  }
  world.style.transform = `translate(${camera.x}px,${camera.y}px) scale(${camera.scale})`;
  selectMany(selectedIds);
  return {
    destroy() {
      cleanup();
      viewport.remove();
    },
    getState: () => ({ camera: { ...camera }, selectedId: selected, selectedIds: [...selectedIds] }),
    select: select2,
    selectMany,
    reveal(id) {
      const n = targets.find((t) => t.n.semanticId === id)?.n;
      if (n) update({ ...camera, x: width / 2 - (n.x + n.width / 2) * camera.scale, y: height / 2 - (n.y + n.height / 2) * camera.scale });
    },
    anchors: () => targets.filter((t) => t.n.semanticId).map(({ n }) => ({ semanticId: n.semanticId, representationId: n.id, x: n.x * camera.scale + camera.x, y: n.y * camera.scale + camera.y, width: n.width * camera.scale, height: n.height * camera.scale }))
  };
}

// src/canvas-prototype/preferences.mjs
var PRESENTATION_RELATIONSHIP_KINDS = Object.freeze([
  "connection",
  "transition",
  "succession",
  "flow",
  "binding",
  "specialization",
  "typing",
  "composition",
  "reference",
  "containment",
  "import",
  "satisfy",
  "verify",
  "derive",
  "refine",
  "allocate",
  "association",
  "include",
  "anchor",
  "dependency"
]);
var keys = /* @__PURE__ */ new Set(["compartments", "expanded", "emphasis", "contextBudget", "grouping"]);
var kinds = new Set(PRESENTATION_RELATIONSHIP_KINDS);
var own = (value, key2) => Object.hasOwn(value, key2);
var fail = (message) => {
  throw new TypeError(`Scene presentation: ${message}`);
};
function stringList(value, key2, allowed) {
  if (!Array.isArray(value)) fail(`${key2} must be an array`);
  const result = [];
  for (const entry of value) {
    if (typeof entry !== "string" || !entry.trim() || entry !== entry.trim()) {
      fail(`${key2} entries must be nonempty strings without surrounding whitespace`);
    }
    if (allowed && !allowed.has(entry)) fail(`unsupported ${key2} relationship kind "${entry}"`);
    if (!result.includes(entry)) result.push(entry);
  }
  return result;
}
function validatePresentation(config = {}) {
  if (!config || typeof config !== "object" || Array.isArray(config) || ![Object.prototype, null].includes(Object.getPrototypeOf(config))) {
    fail("configuration must be a plain object");
  }
  if (Object.getOwnPropertySymbols(config).length) fail("symbol keys are not supported");
  for (const key2 of Object.getOwnPropertyNames(config)) {
    if (!keys.has(key2)) fail(`unknown option "${key2}"`);
    const descriptor = Object.getOwnPropertyDescriptor(config, key2);
    if (!descriptor.enumerable || !own(descriptor, "value")) fail(`${key2} must be an ordinary JSON property`);
  }
  const compartments = own(config, "compartments") ? config.compartments : "auto";
  if (!["auto", "compact", "expanded"].includes(compartments)) fail("compartments must be auto, compact or expanded");
  const grouping = own(config, "grouping") ? config.grouping : "none";
  if (!["none", "owner"].includes(grouping)) fail("grouping must be none or owner");
  const expanded = stringList(own(config, "expanded") ? config.expanded : [], "expanded");
  const emphasis = stringList(own(config, "emphasis") ? config.emphasis : [], "emphasis", kinds);
  const result = { compartments, expanded, emphasis, grouping };
  if (own(config, "contextBudget")) {
    if (!Number.isInteger(config.contextBudget) || config.contextBudget < 0 || config.contextBudget > 256) {
      fail("contextBudget must be an integer from 0 through 256");
    }
    result.contextBudget = config.contextBudget;
  }
  return result;
}
function resolvePresentation(config = {}, { width = 1024, resolve: resolve2 } = {}) {
  const presentation = validatePresentation(config);
  if (!Number.isFinite(width) || width <= 0) fail("viewport width must be a positive finite number");
  if (presentation.expanded.length && typeof resolve2 !== "function") {
    fail("expanded references require a native identity resolver");
  }
  const expandedIds = [];
  for (const reference of presentation.expanded) {
    let element2;
    try {
      element2 = resolve2(reference);
    } catch (cause) {
      throw new TypeError(`Scene presentation: cannot resolve expanded reference "${reference}": ${cause?.message ?? String(cause)}`, { cause });
    }
    const id = typeof element2 === "string" ? element2 : element2 && !Array.isArray(element2) ? element2.id : null;
    if (typeof id !== "string" || !id.trim() || id !== id.trim()) {
      fail(`unresolved or ambiguous expanded reference "${reference}"`);
    }
    if (!expandedIds.includes(id)) expandedIds.push(id);
  }
  return { ...presentation, contextBudget: presentation.contextBudget ?? 48, expandedIds };
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
var AUTHOR_SCHEMA = "syspresent.project.v2";
var sourceFile = (name) => /\.(sysml|kerml)$/i.test(name);
var conventionalView = (name) => name === "views.sysml" || /^views\/.+\.sysml$/i.test(name);
var reservedSource = (name) => name.split("/").at(-1).startsWith("__syspresent_");
var strings = (value, label2, { empty = true } = {}) => {
  if (!Array.isArray(value) || !empty && !value.length || !value.every((x) => typeof x === "string" && x) || new Set(value).size !== value.length) throw Error("Invalid " + label2);
  return value;
};
function projectPath(name) {
  if (typeof name !== "string" || !name || name.startsWith("/") || name.includes("\\") || name.includes(":") || /[\u0000-\u001f\u007f]/.test(name) || name.split("/").some((x) => x === ".." || x === "." || !x)) throw Error("Invalid project path: " + name);
  return name;
}
var fileText = (project, name) => {
  projectPath(name);
  if (!Object.hasOwn(project.files, name)) throw Error("Missing project file: " + name);
  const value = project.files[name];
  return typeof value === "string" ? value : strFromU8(value);
};
function normalizeProject(project, { title } = {}) {
  if (!project || !project.files || typeof project.files !== "object") throw Error("Project requires files");
  const files = Object.fromEntries(Object.entries(project.files).map(([name, value]) => [projectPath(name), value]));
  let author = project.authorManifest ?? project.manifest;
  if (project.manifest?.schemaVersion === SCHEMA) return { ...project, files };
  if (author && author.schemaVersion !== AUTHOR_SCHEMA) throw Error("Unsupported project manifest");
  author = author ?? { schemaVersion: AUTHOR_SCHEMA };
  for (const field of ["modelSources", "viewSources", "systemOfInterest", "modelRoots", "requirementSeeds", "entryView", "entryFocus", "runtimeCache"]) if (Object.hasOwn(author, field)) throw Error("Computed project field is not authored in v2: " + field);
  if (author.title !== void 0 && (typeof author.title !== "string" || !author.title.trim())) throw Error("Invalid project title");
  const discovered = Object.keys(files).filter(sourceFile).sort();
  for (const name of discovered) if (reservedSource(name)) throw Error("Reserved runtime source filename: " + name);
  const sources = author.sources === void 0 ? discovered : strings(author.sources, "project sources", { empty: false }).map(projectPath);
  if (!sources.length) throw Error("Project requires at least one SysML or KerML source");
  for (const name of sources) {
    if (!sourceFile(name)) throw Error("Project source must be SysML or KerML: " + name);
    fileText({ files }, name);
  }
  const viewSources = author.views === void 0 ? sources.filter(conventionalView) : strings(author.views, "project views").map(projectPath);
  for (const name of viewSources) {
    if (!sourceFile(name)) throw Error("Project view source must be SysML or KerML: " + name);
    fileText({ files }, name);
  }
  if (!viewSources.length) {
    if (Object.hasOwn(files, "views.sysml") && !sources.includes("views.sysml")) throw Error("Existing views.sysml must be included as a source or editable view");
    files["views.sysml"] ??= "";
    viewSources.push("views.sysml");
  }
  const story = projectPath(author.story ?? "story.md");
  if (author.story !== void 0) fileText({ files }, story);
  else files[story] ??= "";
  if (sourceFile(story) || story === "project.json") throw Error("Story must be a separate presentation file");
  const navigation = author.navigation ?? {};
  if (!navigation || typeof navigation !== "object" || Array.isArray(navigation)) throw Error("Invalid project navigation");
  const roots = navigation.roots === void 0 ? [] : strings(navigation.roots, "navigation roots");
  for (const key2 of ["view", "focus"]) if (navigation[key2] !== void 0 && (typeof navigation[key2] !== "string" || !navigation[key2])) throw Error("Invalid navigation " + key2);
  const scope = author.publication?.scope ?? "complete";
  if (!["complete", "scoped"].includes(scope)) throw Error("Publication scope must be complete or scoped");
  const allSources = /* @__PURE__ */ new Set([...sources, ...viewSources]);
  const manifest = { schemaVersion: SCHEMA, title: author.title ?? title ?? "Imported model", modelSources: sources.filter((name) => !viewSources.includes(name)), viewSources: [...viewSources], systemOfInterest: [...roots], story, assets: Object.keys(files).filter((name) => name !== "project.json" && name !== story && !allSources.has(name)).sort(), publication: { scope }, ...Object.hasOwn(files, "runtime-cache.json") ? { runtimeCache: "runtime-cache.json" } : {}, ...navigation.view ? { entryView: navigation.view } : {}, ...navigation.focus ? { entryFocus: navigation.focus } : {}, ...author.source !== void 0 ? { source: author.source } : {} };
  return { ...project, files, manifest, authorManifest: author };
}
function validateProject(project) {
  if (project?.manifest?.schemaVersion !== SCHEMA) Object.assign(project, normalizeProject(project));
  const m = project.manifest;
  if (m?.schemaVersion !== SCHEMA) throw Error("Unsupported project manifest");
  for (const name of Object.keys(project.files)) projectPath(name);
  for (const key2 of ["modelSources", "viewSources", "systemOfInterest"]) strings(m[key2], "project " + key2, { empty: !!project.authorManifest });
  if (!m.modelSources.length && !m.viewSources.length) throw Error("Project requires source files");
  if (m.requirementSeeds !== void 0) strings(m.requirementSeeds, "native requirement seeds", { empty: !!project.authorManifest });
  if (m.modelRoots !== void 0) strings(m.modelRoots, "native model roots", { empty: false });
  for (const name of [...m.modelSources, ...m.viewSources]) if (reservedSource(name)) throw Error("Reserved runtime source filename: " + name);
  for (const name of [...m.modelSources, ...m.viewSources, m.story, ...m.assets ?? []]) fileText(project, name);
  if ((/* @__PURE__ */ new Set([...m.modelSources, ...m.viewSources])).size !== m.modelSources.length + m.viewSources.length) throw Error("Model and view source files must be separate");
  if (!["complete", "scoped"].includes(m.publication?.scope)) throw Error("Publication scope must be complete or scoped");
  return project;
}
function projectDescriptor(project) {
  validateProject(project);
  if (!project.authorManifest) return project.manifest;
  const author = { ...project.authorManifest }, m = project.manifest;
  if (author.title !== void 0 || m.title !== "Imported model") author.title = m.title;
  const actualSources = [...m.modelSources, ...m.viewSources].sort(), discovered = Object.keys(project.files).filter(sourceFile).sort();
  if (author.sources !== void 0 || JSON.stringify(actualSources) !== JSON.stringify(discovered)) author.sources = actualSources;
  else delete author.sources;
  const conventional = actualSources.filter(conventionalView), views = [...m.viewSources].sort();
  if (author.views !== void 0 || JSON.stringify(views) !== JSON.stringify(conventional)) author.views = views;
  else delete author.views;
  if (author.story !== void 0 || m.story !== "story.md") author.story = m.story;
  else delete author.story;
  return author;
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
    for (const key2 of ["id", "title", "view", "focus"]) if (typeof config[key2] !== "string" || !config[key2]) throw Error("Scene requires " + key2);
    if (scenes.some((s) => s.id === config.id)) throw Error("Duplicate scene " + config.id);
    if (config.journey !== void 0 && (!Array.isArray(config.journey) || !config.journey.every((x) => typeof x === "string" && x))) throw Error("Invalid scene journey");
    if (config.presentation !== void 0) validatePresentation(config.presentation);
    if (config.regions !== void 0) {
      if (!Array.isArray(config.regions) || config.regions.length > 3) throw Error("A scene supports up to three additional view regions");
      const ids = /* @__PURE__ */ new Set(["primary", "comparison"]);
      for (const r of config.regions) {
        if (!r || typeof r.id !== "string" || !r.id || ids.has(r.id) || typeof r.view !== "string" || !r.view || r.focus !== void 0 && (typeof r.focus !== "string" || !r.focus)) throw Error("Invalid or duplicate scene region");
        ids.add(r.id);
      }
    }
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
  const files = /* @__PURE__ */ Object.create(null);
  for (const [name, data] of Object.entries(project.files)) files[projectPath(name)] = typeof data === "string" ? strToU8(data) : data;
  files["project.json"] = strToU8(JSON.stringify(projectDescriptor(project), null, 2) + "\n");
  return zipSync(files, { level: 6 });
}
function unpackProject(bytes) {
  let expanded = 0;
  let files = unzipSync(bytes, { filter: (entry) => {
    projectPath(entry.name.replace(/\/$/, ""));
    if (entry.name.endsWith("/")) return false;
    if (entry.originalSize > 64 * 1024 * 1024 || (expanded += entry.originalSize) > 160 * 1024 * 1024) throw Error("Project archive exceeds prototype size limit");
    return true;
  } });
  const names = Object.keys(files), folder = names[0]?.split("/")[0];
  if (names.length && names.every((name) => name.includes("/") && name.split("/")[0] === folder)) files = Object.fromEntries(names.map((name) => [name.slice(folder.length + 1), files[name]]));
  const manifest = files["project.json"] ? JSON.parse(strFromU8(files["project.json"])) : void 0;
  return validateProject({ manifest, files });
}
function documentsFor(project) {
  return [...project.manifest.modelSources, ...project.manifest.viewSources].map((name) => ({ name, content: fileText(project, name), language: /\.kerml$/i.test(name) ? "kerml" : "sysml" }));
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
function requirementCoverageSource(qualifiedRoots, packageName = "SyspresentRuntimeContext", seeds) {
  const quoted = (s) => "'" + s.replaceAll("\\", "\\\\").replaceAll("'", "\\'") + "'";
  return `package ${packageName} {
 private import StandardViewDefinitions::*;
 view coverage : GeneralView {
${seeds ? "  @OpenSysMLRenderings::RequirementContext { relationshipDepth = 1; }\n" : ""}  filter @SysML::RequirementUsage or @SysML::RequirementDefinition;
${(seeds ?? qualifiedRoots).map((q) => "  expose " + q.split("::").map(quoted).join("::") + (seeds ? ";" : "::**;")).join("\n")}
 }
}
`;
}
async function sourceDigest(documents) {
  const bytes = new TextEncoder().encode(JSON.stringify(documents));
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function verifiedRuntimeCache(project, { trustedHash, engineVersion, engineFingerprint, documents, modelHash }) {
  const filename = project.manifest.runtimeCache;
  if (!filename || !trustedHash) return null;
  const value = project.files[filename], bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  if (!bytes) return null;
  const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map((b) => b.toString(16).padStart(2, "0")).join("");
  if (hash !== trustedHash) return null;
  const cache = JSON.parse(fileText(project, filename));
  if (cache.schemaVersion !== "syspresent.native-cache.v1" || cache.engineVersion !== engineVersion || cache.engineFingerprint !== engineFingerprint || cache.modelHash !== modelHash || cache.sourceDigest !== await sourceDigest(documents)) return null;
  return cache;
}
async function verifiedRuntimeIndex(project, { trustedHash, engineVersion, engineFingerprint, documents }) {
  const filename = project.manifest.runtimeCache;
  if (!filename || !trustedHash) return null;
  const value = project.files[filename], bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  if (!bytes) return null;
  const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map((b) => b.toString(16).padStart(2, "0")).join("");
  if (hash !== trustedHash) return null;
  let cache;
  try {
    cache = JSON.parse(fileText(project, filename));
  } catch {
    return null;
  }
  if (cache.schemaVersion !== "syspresent.native-cache.v1" || cache.engineVersion !== engineVersion || cache.engineFingerprint !== engineFingerprint || cache.inputDigest !== await sourceDigest(documents)) return null;
  if (!Array.isArray(cache.modelRoots) || !cache.modelRoots.length || !cache.modelRoots.every((x) => typeof x === "string" && x) || !Array.isArray(cache.requirementSeeds) || !cache.requirementSeeds.every((x) => typeof x === "string" && x)) return null;
  if (cache.runtimePackage !== void 0 && (typeof cache.runtimePackage !== "string" || !/^[A-Za-z][A-Za-z0-9_]*$/.test(cache.runtimePackage))) return null;
  return { modelRoots: [...cache.modelRoots], requirementSeeds: [...cache.requirementSeeds], ...cache.runtimePackage !== void 0 ? { runtimePackage: cache.runtimePackage } : {} };
}

// src/canvas-prototype/browser-project.mjs
async function projectFromSelection(selection, { folder = false } = {}) {
  const selected = Array.from(selection ?? []);
  if (!selected.length) throw Error("Choose at least one model file.");
  let total = 0;
  for (const file of selected) {
    if (file.size > 64 * 1024 * 1024 || (total += file.size) > 160 * 1024 * 1024) throw Error("Selected files exceed the 160 MB project limit (64 MB per file).");
  }
  const paths = selected.map((file) => file.webkitRelativePath || file.name);
  const common = folder && paths.every((path) => path.includes("/") && path.split("/")[0] === paths[0].split("/")[0]) ? paths[0].split("/")[0] + "/" : "";
  const files = /* @__PURE__ */ Object.create(null);
  for (let i = 0; i < selected.length; i++) {
    const path = projectPath(paths[i].slice(common.length));
    if (Object.hasOwn(files, path)) throw Error("Duplicate selected path: " + path + ". Choose a folder to retain distinct paths.");
    files[path] = new Uint8Array(await selected[i].arrayBuffer());
  }
  let manifest;
  if (files["project.json"]) {
    try {
      manifest = JSON.parse(new TextDecoder().decode(files["project.json"]));
    } catch {
      throw Error("project.json is not valid JSON.");
    }
  }
  return normalizeProject({ manifest, files }, { title: common ? common.slice(0, -1) : selected.length === 1 ? selected[0].name.replace(/\.(sysml|kerml)$/i, "") : "Imported model" });
}

// src/canvas-prototype/native-project.mjs
function discoverNativeIndex(parsed, exported, { modelDocumentCount = parsed.roots?.length ?? 0 } = {}) {
  const rootIDs = new Set((parsed.roots ?? []).slice(0, modelDocumentCount || void 0).flatMap((root) => root.childIds ?? []));
  const modelRoots = [...new Set((exported.elements ?? []).filter((e) => rootIDs.has(e["@id"]) && e.qualifiedName).map((e) => e.qualifiedName))].sort();
  const requirementSeeds = [...new Set((exported.elements ?? []).filter((e) => ["RequirementUsage", "RequirementDefinition"].includes(e["@type"]) && e.declaredName && e.qualifiedName).map((e) => e.qualifiedName))].sort();
  return { modelRoots, requirementSeeds };
}

// src/canvas-prototype/prominence.mjs
var DESCENDANT_CAP = 256;
var DESCENDANT_WORK_CAP = 4096;
var MAX_OVERVIEW_TILES = 10;
var defaultIndexes = /* @__PURE__ */ new WeakMap();
var scopedIndexes = /* @__PURE__ */ new WeakMap();
var packageKind = (kind) => kind === "Package";
var engineeringCategory = /^(?:Package|Namespace)$|^(?:Requirement|Concern|Part|Action|State|VerificationCase|AnalysisCase|UseCase|Case|Constraint|Calculation|Interface|Connection|Port|Attribute|Item|Occurrence|Enumeration|Actor)(?:Definition|Usage)$/;
var excludedConnections = /* @__PURE__ */ new Set(["containment", "composition", "owner", "owningMembership", "ownedMembership", "membership", "documentation", "typing", "type", "specialization"]);
var compareText = (a, b) => a < b ? -1 : a > b ? 1 : 0;
var idText = (id) => typeof id === "string" && id.length > 0;
var copy3 = (value) => structuredClone(value);
var named = (element2) => idText(element2.native?.declaredName) || idText(element2.native?.declaredShortName);
var eligible = (element2) => element2?.layer === "project" && named(element2) && engineeringCategory.test(element2.kind ?? "");
var edgeKey = (edge) => JSON.stringify([edge.semanticId ?? edge.nativeRelationship ?? edge.id ?? null, edge.source, edge.target, edge.kind]);
function nativeStructure(graph) {
  const children = /* @__PURE__ */ new Map(), parents = /* @__PURE__ */ new Map();
  const add = (edge) => {
    if (!idText(edge.source) || !idText(edge.target) || edge.source === edge.target) return;
    if (!children.has(edge.source)) children.set(edge.source, /* @__PURE__ */ new Set());
    if (!parents.has(edge.target)) parents.set(edge.target, /* @__PURE__ */ new Set());
    children.get(edge.source).add(edge.target);
    parents.get(edge.target).add(edge.source);
  };
  for (const edge of graph.containment ?? []) if (edge.nativeRole === "owner") add(edge);
  for (const edge of graph.relationships ?? []) if (edge.kind === "composition") add(edge);
  return { children, parents };
}
function descendantClosure(children, rootIds) {
  const seen = new Set((rootIds ?? []).filter(idText));
  const queue = [...seen];
  for (let i = 0; i < queue.length; i++) for (const child of children.get(queue[i]) ?? []) {
    if (!seen.has(child)) {
      seen.add(child);
      queue.push(child);
    }
  }
  return [...seen].sort(compareText);
}
function nativeScopeIds(graph, rootIds) {
  return descendantClosure(nativeStructure(graph).children, rootIds);
}
function prepare(graph, scopeIds2) {
  const scope = scopeIds2 === void 0 ? null : new Set(scopeIds2);
  const elements = new Map((graph.elements ?? []).filter((element2) => eligible(element2) && (!scope || scope.has(element2.id))).map((element2) => [element2.id, element2]));
  const keys2 = new Map((graph.elements ?? []).map((element2) => [element2.id, element2.qualifiedName ?? element2.native?.declaredName ?? element2.native?.declaredShortName ?? element2.name ?? element2.id]));
  const compareNames = (a, b) => compareText(keys2.get(a) ?? a, keys2.get(b) ?? b) || compareText(a, b);
  const native = nativeStructure(graph), children = /* @__PURE__ */ new Map(), parents = /* @__PURE__ */ new Map();
  for (const id of elements.keys()) {
    children.set(id, [...native.children.get(id) ?? []].filter((child) => elements.has(child)).sort(compareNames));
    parents.set(id, [...native.parents.get(id) ?? []].filter((parent) => elements.has(parent)).sort(compareNames));
  }
  return { elements, children, parents, compareNames };
}
function descendantsOf(id, children) {
  const seen = /* @__PURE__ */ new Set([id]), queue = [id];
  let work = 0, capped = false;
  outer: for (let i = 0; i < queue.length; i++) for (const child of children.get(queue[i]) ?? []) {
    if (++work > DESCENDANT_WORK_CAP) {
      capped = true;
      break outer;
    }
    if (seen.has(child)) continue;
    seen.add(child);
    queue.push(child);
    if (seen.size - 1 >= DESCENDANT_CAP) {
      capped = true;
      break outer;
    }
  }
  return { descendants: seen.size - 1, descendantsCapped: capped };
}
function promotedRoot(id, data) {
  const visited = /* @__PURE__ */ new Set();
  while (packageKind(data.elements.get(id)?.kind) && data.children.get(id)?.length === 1) {
    visited.add(id);
    const next = data.children.get(id)[0];
    if (visited.has(next)) break;
    id = next;
  }
  return id;
}
function branchIdentities(data) {
  const ids = [...data.elements.keys()].sort(data.compareNames), assigned = /* @__PURE__ */ new Map(), queue = [];
  const seedRoot = (root) => {
    if (assigned.has(root)) return;
    assigned.set(root, root);
    const promoted = promotedRoot(root, data);
    let current = root;
    const visited = /* @__PURE__ */ new Set();
    while (current !== promoted && !visited.has(current)) {
      visited.add(current);
      assigned.set(current, root);
      current = data.children.get(current)?.[0];
    }
    assigned.set(promoted, root);
    for (const child of data.children.get(promoted) ?? []) if (!assigned.has(child)) {
      assigned.set(child, child);
      queue.push(child);
    }
  };
  const drain = () => {
    for (let i = 0; i < queue.length; i++) {
      const id = queue[i];
      for (const child of data.children.get(id) ?? []) if (!assigned.has(child)) {
        assigned.set(child, assigned.get(id));
        queue.push(child);
      }
    }
    queue.length = 0;
  };
  for (const id of ids) if (!data.parents.get(id).length) seedRoot(id);
  drain();
  for (const id of ids) if (!assigned.has(id)) {
    seedRoot(id);
    drain();
  }
  return assigned;
}
function createProminenceIndex(graph, { scopeIds: scopeIds2 } = {}) {
  if (scopeIds2 === void 0 && defaultIndexes.has(graph)) return defaultIndexes.get(graph);
  const cacheableScope = scopeIds2 !== null && typeof scopeIds2 === "object";
  if (cacheableScope && scopedIndexes.get(graph)?.has(scopeIds2)) return scopedIndexes.get(graph).get(scopeIds2);
  const data = prepare(graph, scopeIds2), branches = branchIdentities(data), neighbors = /* @__PURE__ */ new Map();
  for (const id of data.elements.keys()) neighbors.set(id, /* @__PURE__ */ new Set());
  for (const edge of graph.relationships ?? []) {
    if (edge.navigationOnly || excludedConnections.has(edge.kind) || edge.source === edge.target || !neighbors.has(edge.source) || !neighbors.has(edge.target)) continue;
    neighbors.get(edge.source).add(edge.target);
    neighbors.get(edge.target).add(edge.source);
  }
  const metrics = /* @__PURE__ */ new Map();
  for (const id of [...data.elements.keys()].sort(data.compareNames)) {
    const children = data.children.get(id).length, descendants = descendantsOf(id, data.children), connections = neighbors.get(id).size;
    const crossBranchConnections = [...neighbors.get(id)].filter((other) => branches.get(other) !== branches.get(id)).length;
    const score = 3 * Math.log2(1 + children) + Math.log2(1 + descendants.descendants) + 2 * Math.log2(1 + connections) + 2 * Math.log2(1 + crossBranchConnections);
    metrics.set(id, { children, ...descendants, connections, crossBranchConnections, score });
  }
  const compare4 = (a, b) => {
    const am = metrics.get(a), bm = metrics.get(b);
    return Number(!!bm) - Number(!!am) || (bm?.score ?? 0) - (am?.score ?? 0) || data.compareNames(a, b);
  };
  const result = { metrics, compare: compare4 };
  if (scopeIds2 === void 0) defaultIndexes.set(graph, result);
  else if (cacheableScope) {
    if (!scopedIndexes.has(graph)) scopedIndexes.set(graph, /* @__PURE__ */ new WeakMap());
    scopedIndexes.get(graph).set(scopeIds2, result);
  }
  return result;
}
function buildSystemOverview(graph, { rootIds, budget = 9 } = {}) {
  if (!Number.isInteger(budget) || budget < 0) throw Error("Overview budget must be a nonnegative integer");
  const limit = Math.min(MAX_OVERVIEW_TILES, budget), all = prepare(graph), structure = nativeStructure(graph), allElements = new Map((graph.elements ?? []).map((element2) => [element2.id, element2]));
  const explicit = Array.isArray(rootIds) && rootIds.length > 0;
  let requested = [...new Set((rootIds ?? []).filter(idText))];
  if (!explicit) {
    requested = [...all.elements.keys()].filter((id) => !all.parents.get(id).length).sort(all.compareNames);
    const covered = new Set(descendantClosure(structure.children, requested));
    for (const id of [...all.elements.keys()].sort(all.compareNames)) if (!covered.has(id)) {
      requested.push(id);
      for (const member of descendantClosure(structure.children, [id])) covered.add(member);
    }
  }
  const scopeIds2 = descendantClosure(structure.children, requested), scope = new Set(scopeIds2), data = prepare(graph, scopeIds2), index = createProminenceIndex(graph, { scopeIds: scopeIds2 });
  const omissions = [], effectiveRoots = [];
  for (const root of [...requested].sort(index.compare)) {
    if (!data.elements.has(root)) {
      omissions.push({ target: root, reason: allElements.has(root) ? "element-policy" : "unavailable-root" });
      continue;
    }
    const promoted = promotedRoot(root, data);
    if (!effectiveRoots.includes(promoted)) effectiveRoots.push(promoted);
  }
  effectiveRoots.sort(index.compare);
  const chosen = /* @__PURE__ */ new Set(), add = (id) => {
    if (chosen.size < limit) chosen.add(id);
  };
  for (const root of effectiveRoots) add(root);
  const rootQueues = effectiveRoots.filter((root) => chosen.has(root)).map((root) => ({
    root,
    ids: [...data.children.get(root)].sort(index.compare),
    offset: 0
  }));
  let partialRootRound = false;
  while (chosen.size < limit) {
    const expandable = [];
    for (const queue of rootQueues) {
      while (queue.offset < queue.ids.length && chosen.has(queue.ids[queue.offset])) queue.offset++;
      if (queue.offset < queue.ids.length) expandable.push(queue);
    }
    if (!expandable.length) break;
    if (rootQueues.length > 1 && expandable.length > limit - chosen.size) {
      partialRootRound = true;
      break;
    }
    for (const queue of expandable) if (chosen.size < limit) add(queue.ids[queue.offset++]);
  }
  const branches = [];
  for (const queue of rootQueues) for (const child of queue.ids) if (chosen.has(child)) {
    branches.push({ ids: (data.children.get(child) ?? []).map((id) => ({ id, depth: 2 })).sort((a, b) => index.compare(a.id, b.id)), offset: 0, queued: /* @__PURE__ */ new Set([child, ...data.children.get(child) ?? []]) });
  }
  while (chosen.size < limit && !partialRootRound) {
    for (const branch of branches) while (branch.offset < branch.ids.length && chosen.has(branch.ids[branch.offset].id)) branch.offset++;
    const depths = branches.filter((branch) => branch.offset < branch.ids.length).map((branch) => branch.ids[branch.offset].depth);
    if (!depths.length) break;
    const depth = Math.min(...depths);
    for (const branch of branches) {
      if (chosen.size >= limit) break;
      const next = branch.ids[branch.offset];
      if (!next || next.depth !== depth || chosen.has(next.id)) continue;
      branch.offset++;
      add(next.id);
      for (const child of [...data.children.get(next.id)].sort(index.compare)) if (!branch.queued.has(child)) {
        branch.queued.add(child);
        branch.ids.push({ id: child, depth: next.depth + 1 });
      }
    }
  }
  const promotedWrappers = /* @__PURE__ */ new Set();
  for (const root of requested) {
    let id = root;
    const seen = /* @__PURE__ */ new Set();
    while (data.elements.has(id) && packageKind(data.elements.get(id).kind) && data.children.get(id)?.length === 1 && !seen.has(id)) {
      seen.add(id);
      if (effectiveRoots.includes(id)) break;
      promotedWrappers.add(id);
      id = data.children.get(id)[0];
    }
  }
  const omittedTargets = new Set(omissions.map((item) => item.target));
  for (const id of scopeIds2) if (!allElements.has(id) && !omittedTargets.has(id)) {
    omissions.push({ target: id, reason: "unavailable" });
    omittedTargets.add(id);
  }
  for (const element2 of graph.elements ?? []) {
    if (!scope.has(element2.id)) {
      if (eligible(element2)) omissions.push({ target: element2.id, reason: "outside-scope" });
      continue;
    }
    if (!eligible(element2)) {
      if (!omittedTargets.has(element2.id)) omissions.push({ target: element2.id, reason: element2.layer === "project" ? "element-policy" : "library" });
      continue;
    }
    if (!chosen.has(element2.id)) omissions.push({ target: element2.id, reason: promotedWrappers.has(element2.id) ? "package-wrapper" : "budget" });
  }
  const compositionPairs = new Set((graph.relationships ?? []).filter((edge) => edge.kind === "composition").map((edge) => JSON.stringify([edge.source, edge.target])));
  const edges = [...graph.relationships ?? [], ...(graph.containment ?? []).filter((edge) => edge.nativeRole === "owner" && !compositionPairs.has(JSON.stringify([edge.source, edge.target])))];
  const seenEdges = /* @__PURE__ */ new Set(), relationships = [];
  for (const edge of [...edges].sort((a, b) => compareText(edgeKey(a), edgeKey(b)))) {
    if (!chosen.has(edge.source) || !chosen.has(edge.target)) continue;
    const key2 = edgeKey(edge);
    if (seenEdges.has(key2)) continue;
    seenEdges.add(key2);
    relationships.push(copy3(edge));
  }
  const ordered = [...chosen], focus = ordered[0] ?? null, shown = ordered.length, total = data.elements.size;
  const descendantsCapped = [...index.metrics.values()].some((metric) => metric.descendantsCapped);
  const summary = {
    message: `${shown} of ${total} named model elements in the loaded native scope. Ranked by structural size and distinct connections; omitted content remains available through exploration.${descendantsCapped ? ` Descendant ranking counts stop at ${DESCENDANT_CAP} identities or ${DESCENDANT_WORK_CAP} inspected links; capped counts are lower bounds. Ranking is a reading aid, not engineering criticality.` : ""}`,
    shown,
    total,
    roots: effectiveRoots.length,
    shownRoots: effectiveRoots.filter((id) => chosen.has(id)).length,
    descendantsCapped
  };
  return {
    elements: ordered.map((id) => copy3(data.elements.get(id))),
    relationships,
    focus,
    metrics: index.metrics,
    omissions: omissions.sort((a, b) => compareText(a.reason, b.reason) || all.compareNames(a.target, b.target)),
    summary,
    rootIds: [...requested].sort(all.compareNames),
    promotedRootIds: effectiveRoots,
    scopeIds: scopeIds2,
    budget: limit
  };
}

// src/canvas-prototype/departures.mjs
var visible = (node) => !!node && (node.opacity ?? 1) > 0.01;
var active = (node) => visible(node) && !node.context && node.kind !== "context-boundary";
var overlaps2 = (a, b, padding = 0) => a.x < b.x + b.width + padding && a.x + a.width + padding > b.x && a.y < b.y + b.height + padding && a.y + a.height + padding > b.y;
var clamp2 = (value) => Math.max(0, Math.min(1, value));
var smooth = (value) => {
  const t = clamp2(value);
  return t * t * (3 - 2 * t);
};
var identity2 = (node) => node.semanticId ?? node.semantic ?? node.id ?? node.key;
var rectangle = (node) => ({ x: node.x, y: node.y, width: node.width, height: node.height });
function nativeObstacles(node, nodes) {
  const byId = new Map(nodes.map((item) => [item.id, item]));
  const ancestorOf = (ancestor, child) => {
    const seen = /* @__PURE__ */ new Set();
    let current = child;
    while (current?.parentId && !seen.has(current.parentId)) {
      seen.add(current.parentId);
      if (current.parentId === ancestor.id) return true;
      current = byId.get(current.parentId);
    }
    return false;
  };
  return nodes.flatMap((other) => {
    if (other.key === node.key || !active(other) || ancestorOf(node, other)) return [];
    if (ancestorOf(other, node)) return other.headerHeight > 0 ? [{ ...rectangle(other), height: Math.min(other.height, other.headerHeight) }] : [];
    return [rectangle(other)];
  });
}
function firstContact(node, destination, obstacle) {
  const dx = destination.x - node.x, dy = destination.y - node.y;
  if (overlaps2(node, obstacle)) return Infinity;
  if (dx && node.y < obstacle.y + obstacle.height && node.y + node.height > obstacle.y) {
    const gap = dx > 0 ? obstacle.x - node.x - node.width : node.x - obstacle.x - obstacle.width;
    return gap >= 0 ? gap / Math.abs(dx) : Infinity;
  }
  if (dy && node.x < obstacle.x + obstacle.width && node.x + node.width > obstacle.x) {
    const gap = dy > 0 ? obstacle.y - node.y - node.height : node.y - obstacle.y - obstacle.height;
    return gap >= 0 ? gap / Math.abs(dy) : Infinity;
  }
  return Infinity;
}
function exitPosition(node, width, height, obstacles) {
  const margin = 24;
  const candidates = [
    { side: "left", x: -node.width - margin, y: node.y },
    { side: "right", x: width + margin, y: node.y },
    { side: "top", x: node.x, y: -node.height - margin },
    { side: "bottom", x: node.x, y: height + margin }
  ];
  for (const candidate of candidates) {
    const swept = { x: Math.min(node.x, candidate.x), y: Math.min(node.y, candidate.y), width: node.width + Math.abs(node.x - candidate.x), height: node.height + Math.abs(node.y - candidate.y) };
    candidate.obstructions = obstacles.filter((obstacle) => !overlaps2(node, obstacle) && overlaps2(swept, obstacle)).length;
    candidate.fadeUntil = Math.min(1, ...obstacles.map((obstacle) => firstContact(node, candidate, obstacle)));
    candidate.fadeUntil = Math.max(0, candidate.fadeUntil - 5e-3);
    candidate.distance = Math.abs(candidate.x - node.x) + Math.abs(candidate.y - node.y);
  }
  return candidates.sort((a, b) => a.obstructions - b.obstructions || a.distance - b.distance)[0];
}
function planDepartures(frames, { width, height, panels = [], offsets, clearAt = 0.28, arriveAfter = 0.31, contextAfter = 0.78 } = {}) {
  if (!Array.isArray(frames) || !frames.length) throw new TypeError("Departure planning requires frames");
  const first = frames[0], last = frames.at(-1);
  width = width ?? last.width ?? first.width;
  height = height ?? last.height ?? first.height;
  if (!(width > 0 && height > 0)) throw new RangeError("Departure planning requires a positive viewport");
  if (!(clearAt > 0 && clearAt < arriveAfter && arriveAfter < contextAfter && contextAfter < 1)) throw new RangeError("Departure phases must be ordered within the journey");
  offsets = offsets ?? frames.map((_, index) => index / (frames.length - 1 || 1));
  if (offsets.length !== frames.length || offsets[0] !== 0 || frames.length > 1 && offsets.at(-1) !== 1 || offsets.some((value, index) => !Number.isFinite(value) || index > 0 && value <= offsets[index - 1])) throw new RangeError("Departure offsets must match frames and increase from zero to one");
  const departures = [], arrivals = /* @__PURE__ */ new Set(), contextReturns = /* @__PURE__ */ new Set(), intervals = [];
  for (let interval = 0; interval < frames.length - 1; interval++) {
    const startFrame = frames[interval], endFrame = frames[interval + 1], finalByKey = new Map(endFrame.nodes.map((node) => [node.key, node]));
    const localDepartures = [], localArrivals = /* @__PURE__ */ new Set();
    for (const node of startFrame.nodes) {
      const final = finalByKey.get(node.key);
      if (!active(node) || active(final)) continue;
      const replacements = endFrame.nodes.filter((next) => active(next) && identity2(next) !== identity2(node) && overlaps2(node, next, 4));
      if (!replacements.length) continue;
      const occupiedPanels = [...panels, ...startFrame.panels ?? [], ...endFrame.panels ?? []];
      const exit = exitPosition(node, width, height, [...occupiedPanels, ...nativeObstacles(node, startFrame.nodes)]);
      localDepartures.push({ key: node.key, semanticId: identity2(node), from: rectangle(node), exit: { x: exit.x, y: exit.y }, side: exit.side, fadeUntil: exit.fadeUntil, clearAt, arriveAfter, replacements: replacements.map((next) => next.key), interval, startAt: offsets[interval], endAt: offsets[interval + 1] });
      for (const next of replacements) {
        localArrivals.add(next.key);
        arrivals.add(next.key);
      }
    }
    const identities = new Set(localDepartures.map((item) => item.semanticId));
    const localReturns = new Set(endFrame.nodes.filter((node) => !active(node) && visible(node) && identities.has(identity2(node))).map((node) => node.key));
    for (const key2 of localReturns) contextReturns.add(key2);
    departures.push(...localDepartures);
    intervals.push({ startAt: offsets[interval], endAt: offsets[interval + 1], byKey: new Map(localDepartures.map((item) => [item.key, item])), arrivals: localArrivals, contextReturns: localReturns });
  }
  function sampleNode(key2, progress, sampleAt) {
    if (progress <= 0) return sampleAt(0);
    if (progress >= 1) return sampleAt(1);
    if (offsets.some((offset) => Math.abs(progress - offset) < 1e-12)) return sampleAt(progress);
    const interval = intervals.find((item) => progress > item.startAt && progress < item.endAt);
    if (!interval) return sampleAt(progress);
    const span = interval.endAt - interval.startAt, local = (progress - interval.startAt) / span;
    const departure = interval.byKey.get(key2);
    if (departure) {
      const base = sampleAt(progress), start2 = sampleAt(interval.startAt), finish = sampleAt(interval.endAt);
      if (local <= clearAt) {
        const t = smooth(local / clearAt);
        return { ...base, ...rectangle(start2), scale: start2.scale, x: start2.x + (departure.exit.x - start2.x) * t, y: start2.y + (departure.exit.y - start2.y) * t, opacity: (start2.opacity ?? 1) * (1 - smooth(departure.fadeUntil > 0 ? t / departure.fadeUntil : 1)) };
      }
      return { ...base, ...rectangle(finish), scale: finish.scale, opacity: (finish.opacity ?? 0) * smooth((local - contextAfter) / (1 - contextAfter)) };
    }
    if (interval.contextReturns.has(key2)) {
      const finish = sampleAt(interval.endAt);
      return { ...finish, opacity: (finish.opacity ?? 0) * smooth((local - contextAfter) / (1 - contextAfter)) };
    }
    if (interval.arrivals.has(key2)) {
      const start2 = sampleAt(interval.startAt), t = clamp2((local - arriveAfter) / (1 - arriveAfter));
      return { ...sampleAt(interval.startAt + smooth(t) * span), ...local <= arriveAfter ? start2 : {} };
    }
    return sampleAt(progress);
  }
  return { departures, arrivals: [...arrivals], contextReturns: [...contextReturns], sampleNode };
}

// src/canvas-prototype/graph.mjs
var refs = (value) => Array.isArray(value) ? value.flatMap(refs) : value && typeof value === "object" && typeof value["@id"] === "string" ? [value["@id"]] : [];
var camel = (value) => Array.isArray(value) ? value.map(camel) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()), camel(v)])) : value;
function adaptNativeView(raw, name) {
  const v = camel(raw);
  return { ...v, id: name, title: name, nodes: v.nodes ?? [], edges: v.edges ?? [], notices: v.notices ?? [] };
}
var isDeclarationKind = (kind) => /^(Package|Namespace|[A-Za-z]+(?:Usage|Definition))$/.test(kind ?? "");
function modelGraph(raw, views = []) {
  const elements = raw.map((e) => ({ id: e["@id"], kind: e["@type"], name: e.declaredName || e.qualifiedName || e["@id"], qualifiedName: e.qualifiedName, description: e.body || "", native: e, layer: e["sysx:sourceLine"] ? "project" : "library" }));
  const index = new Map(elements.map((e) => [e.id, e])), relationships = [], containment = [];
  const declaration = (e) => e?.layer === "project" && isDeclarationKind(e.kind);
  const add = (source, target, kind, id, nativeRelationship) => {
    if (!source || !target) return;
    relationships.push({ id, source, target, kind, label: kind, authority: "native-api", nativeRelationship });
  };
  for (const item of raw) {
    const id = item["@id"];
    if (declaration(index.get(id))) {
      for (const owner of refs(item.owner)) if (declaration(index.get(owner))) containment.push({ id: `owner:${owner}:${id}`, source: owner, target: id, kind: "containment", label: "owns", authority: "native-api", nativeRelationship: refs(item.owningMembership)[0] ?? refs(item.owningRelationship)[0] ?? null, nativeRole: "owner", navigationOnly: true });
    }
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
  return { elements, containment, relationships: relationships.filter((e) => {
    const key2 = JSON.stringify([e.source, e.target, e.kind]);
    if (seen.has(key2)) return false;
    seen.add(key2);
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

// src/canvas-prototype/exploration.mjs
var engineeringKinds = new Set(ENGINEERING_RELATIONSHIPS);
var requirementKinds = /* @__PURE__ */ new Set(["RequirementDefinition", "RequirementUsage"]);
var structuralKinds = /* @__PURE__ */ new Set(["PartDefinition", "PartUsage", "Package", "Namespace"]);
var packageKinds = /* @__PURE__ */ new Set(["Package", "Namespace"]);
var structuralModes = /* @__PURE__ */ new Set(["contents", "container"]);
var structuralEdges = /* @__PURE__ */ new Set(["composition", "reference", "containment"]);
var isStructuralElement = (element2) => structuralKinds.has(element2?.kind);
var engineeringElement = /^(Requirement|Part|Action|State|VerificationCase|AnalysisCase|UseCase|Case|Constraint|Calculation|Interface|Connection|Port|Attribute|Item|Occurrence|Allocation)(Definition|Usage)$/;
var origins = /* @__PURE__ */ new Set(["derive", "derivation", "refine", "refinement"]);
var satisfaction = /* @__PURE__ */ new Set(["satisfy", "satisfaction"]);
var allocation = /* @__PURE__ */ new Set(["allocate", "allocation"]);
var verification = /* @__PURE__ */ new Set(["verify", "verification"]);
var compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
var clone = (value) => structuredClone(value);
var edgeKey2 = (edge) => JSON.stringify([edge.id ?? null, edge.source, edge.target, edge.kind]);
var modes = Object.freeze({
  origins: { label: "Origins", empty: "No upstream derivation or refinement links are known in the loaded model." },
  derived: { label: "Derived requirements", empty: "No downstream derivation or refinement links are known in the loaded model." },
  impact: { label: "Design impact", empty: "No satisfaction or allocation links are known in the loaded model." },
  verification: { label: "Verification", empty: "No verification links are known in the loaded model." },
  contents: { label: "Parts / contents", empty: "No direct contents are known in the loaded model." },
  container: { label: "Containing element", empty: "No containing element is known in the loaded model." },
  context: { label: "Explore connections", empty: "No engineering neighbors are known in the loaded model." }
});
var endpoint2 = (edge, side) => side === "source" ? edge.source ?? edge.fromId ?? edge.from_id ?? edge.from : edge.target ?? edge.toId ?? edge.to_id ?? edge.to;
function accepts(edge, anchor, mode, { root, elements, bridge } = {}) {
  const structural = isStructuralElement(root);
  const ownership = edge.kind === "containment" && (packageKinds.has(elements?.get(edge.source)?.kind) || packageKinds.has(elements?.get(edge.target)?.kind));
  const structure = structuralEdges.has(edge.kind) && (edge.kind !== "containment" || ownership);
  if (structuralModes.has(mode)) return structural && structure && (mode === "contents" ? edge.source === anchor : edge.target === anchor) && (!bridge || mode === "contents" && edge.kind !== "containment");
  if (bridge && root.kind === "PartUsage") return mode === "context" && ["composition", "reference"].includes(edge.kind) && edge.source === anchor;
  if (mode === "context" && structural && ownership) return true;
  if (mode === "origins") return origins.has(edge.kind) && edge.source === anchor;
  if (mode === "derived") return origins.has(edge.kind) && edge.target === anchor;
  if (mode === "impact") return satisfaction.has(edge.kind) && edge.target === anchor || allocation.has(edge.kind);
  if (mode === "verification") return verification.has(edge.kind) && edge.target === anchor;
  return engineeringKinds.has(edge.kind);
}
function prepare2(graph) {
  const elements = new Map((graph.elements ?? []).map((element2) => [element2.id, element2]));
  const compositionPairs = new Set((graph.relationships ?? []).filter((e) => ["composition", "reference"].includes(e.kind)).map((e) => JSON.stringify([endpoint2(e, "source"), endpoint2(e, "target")])));
  const ownership = (graph.containment ?? []).filter((e) => e.kind === "containment" && e.nativeRole === "owner" && !compositionPairs.has(JSON.stringify([e.source, e.target])));
  const keyed = new Map([...graph.relationships ?? [], ...ownership].map((edge) => {
    const value = { ...edge, source: endpoint2(edge, "source"), target: endpoint2(edge, "target") };
    return [edgeKey2(value), value];
  }));
  const edges = [...keyed].sort((a, b) => compare(a[0], b[0])).map(([, edge]) => edge);
  const incident = /* @__PURE__ */ new Map();
  for (const edge of edges) for (const id of /* @__PURE__ */ new Set([edge.source, edge.target])) {
    if (!incident.has(id)) incident.set(id, []);
    incident.get(id).push(edge);
  }
  return { elements, edges, incident };
}
function projection(graph, focus, mode, options = {}, prepared = prepare2(graph)) {
  if (!modes[mode]) throw new Error("Unknown exploration mode: " + mode);
  const { elements, edges, incident } = prepared;
  const root = elements.get(focus), structural = isStructuralElement(root) && ["context", "contents", "container"].includes(mode);
  const omissions = [], seen = /* @__PURE__ */ new Set(), anchors = /* @__PURE__ */ new Map([[focus, null]]), candidates = /* @__PURE__ */ new Map(), unavailable = /* @__PURE__ */ new Set(), filtered = /* @__PURE__ */ new Set();
  const kinds2 = options.relationshipKinds ? new Set(options.relationshipKinds) : null;
  const nodeKinds = options.elementKinds ? new Set(options.elementKinds) : null;
  const scope = options.scopeIds ? new Set(options.scopeIds) : null;
  const omit = (edge, target, reason2, anchor) => {
    const key2 = JSON.stringify([edgeKey2(edge ?? {}), target, reason2, anchor]);
    if (!seen.has(key2)) {
      seen.add(key2);
      omissions.push({ relationshipId: edge?.id ?? null, target, reason: reason2, anchor: anchor ?? null });
    }
  };
  const reason = (id) => {
    const element2 = elements.get(id);
    if (!element2) return "unavailable";
    if (element2.layer === "metamodel" || element2.metamodel === true) return "metamodel-boundary";
    if (scope && !scope.has(id)) return "outside-scope";
    if (!engineeringElement.test(element2.kind ?? "") && !((structural || id === focus) && isDeclarationKind(element2.kind))) return "element-policy";
    if (nodeKinds && !nodeKinds.has(element2.kind)) return "element-filter";
    return null;
  };
  const rootReason = reason(focus);
  if (rootReason) {
    omit(null, focus, rootReason, null);
    return { elements, edges, anchors, candidates, omissions, unavailable, filtered, rootReason, root };
  }
  if (requirementKinds.has(root.kind) || root.kind === "PartUsage" && ["context", "contents"].includes(mode)) for (const edge of incident.get(focus) ?? []) {
    if (!["type", "typing"].includes(edge.kind) || edge.source !== focus && edge.target !== focus) continue;
    const target = edge.source === focus ? edge.target : edge.source, other = elements.get(target);
    if (root.kind === "PartUsage" && edge.source !== focus) continue;
    const opposite = root.kind === "PartUsage" ? "PartDefinition" : root.kind === "RequirementUsage" ? "RequirementDefinition" : "RequirementUsage";
    const excluded = reason(target);
    if (excluded) {
      omit(edge, target, excluded, focus);
      if (excluded === "unavailable") unavailable.add(target);
      continue;
    }
    if (other.kind !== opposite) {
      omit(edge, target, "typing-boundary", focus);
      continue;
    }
    if (!anchors.has(target)) anchors.set(target, edge);
    if (root.kind === "PartUsage" && mode === "context" && (!kinds2 || kinds2.has(edge.kind))) candidates.set(target, [{ edge, anchor: focus, bridge: null }]);
  }
  if (structuralModes.has(mode) && !isStructuralElement(root)) return { elements, edges, anchors, candidates, omissions, unavailable, filtered, rootReason: "not-structural", root };
  if (mode !== "context" && !structuralModes.has(mode) && !requirementKinds.has(root.kind)) return { elements, edges, anchors, candidates, omissions, unavailable, filtered, rootReason: "not-requirement", root };
  for (const [anchor, bridge] of anchors) for (const edge of incident.get(anchor) ?? []) {
    if (edge.source !== anchor && edge.target !== anchor) continue;
    const target = edge.source === anchor ? edge.target : edge.source;
    if (anchors.has(target)) continue;
    if (!accepts(edge, anchor, mode, { root, elements, bridge })) {
      omit(edge, target, "relationship-policy", anchor);
      continue;
    }
    const excluded = kinds2 && !kinds2.has(edge.kind) ? "relationship-filter" : reason(target);
    if (excluded) {
      omit(edge, target, excluded, anchor);
      (excluded === "unavailable" ? unavailable : filtered).add(target);
      continue;
    }
    if (!candidates.has(target)) candidates.set(target, []);
    candidates.get(target).push({ edge, anchor, bridge });
  }
  for (const target of candidates.keys()) filtered.delete(target);
  for (const links of candidates.values()) links.sort((a, b) => Number(Boolean(a.bridge)) - Number(Boolean(b.bridge)) || compare(a.anchor, b.anchor) || compare(edgeKey2(a.edge), edgeKey2(b.edge)));
  return { elements, edges, anchors, candidates, omissions, unavailable, filtered, rootReason: null, root };
}
function summaryFor(data, mode, shown, total) {
  const unavailable = data.unavailable.size, filtered = data.filtered.size;
  let status2 = shown ? "shown" : unavailable ? "unavailable" : filtered ? "filtered" : "no-known-links";
  let message = shown ? `${shown} of ${total} matching ${isStructuralElement(data.root) ? "structural / engineering" : "engineering"} neighbors shown.` : modes[mode].empty;
  if (data.rootReason) {
    status2 = ["not-requirement", "not-structural"].includes(data.rootReason) ? "filtered" : "missing-focus";
    message = data.rootReason === "not-requirement" ? "This action applies to requirement definitions and usages." : data.rootReason === "not-structural" ? "This action applies to parts and packages." : "The focused element is unavailable or excluded from engineering exploration.";
  }
  if (unavailable) message += ` ${unavailable} referenced element${unavailable === 1 ? " is" : "s are"} unavailable; missing context is not evidence that a link is absent.`;
  if (filtered) message += ` ${filtered} matching neighbor${filtered === 1 ? " is" : "s are"} excluded by the active exploration policy.`;
  if (isStructuralElement(data.root) && shown) message += " Package ownership is location context; part definition contents retain their explicit typing link.";
  if (mode === "verification" && shown) message += " These are modeled verification links, not executed results or acceptance verdicts.";
  return { status: status2, message, shown, total, unavailable, filtered };
}
function requirementActions(graph, focus) {
  const prepared = prepare2(graph);
  return Object.entries(modes).filter(([mode]) => !structuralModes.has(mode)).map(([mode, definition]) => {
    const data = projection(graph, focus, mode, {}, prepared), count = data.candidates.size;
    return { mode, label: definition.label, count, total: count + data.unavailable.size + data.filtered.size, unavailable: data.unavailable.size, filtered: data.filtered.size, enabled: count > 0, summary: summaryFor(data, mode, count, count) };
  });
}
function traceContext(graph, options = {}) {
  const { focus, mode = "context", budget = 7, page = 0 } = options;
  if (!Number.isInteger(budget) || budget < 1) throw new Error("Invalid exploration budget");
  if (!Number.isInteger(page) || page < 0) throw new Error("Invalid exploration page");
  const effectiveBudget = Math.max(3, Math.min(24, budget)), data = projection(graph, focus, mode, options);
  const priorities = new Map(["derive", "derivation", "refine", "refinement", "satisfy", "satisfaction", "verify", "verification", "allocate", "allocation", "composition", "connection", "reference", "flow", "dependency"].map((kind, index) => [kind, index]));
  const priority = (id) => Math.min(...data.candidates.get(id).map(({ edge, anchor, bridge }) => {
    if (isStructuralElement(data.root) && ["context", "contents", "container"].includes(mode)) {
      if (structuralEdges.has(edge.kind)) return edge.target === anchor ? 0 : bridge ? 3 : 2;
      if (["type", "typing"].includes(edge.kind)) return 1;
      if (["connection", "flow", "binding"].includes(edge.kind)) return 4;
      return 10 + (priorities.get(edge.kind) ?? 99);
    }
    return mode === "context" ? priorities.get(edge.kind) ?? 99 : 0;
  }));
  const prominence = createProminenceIndex(graph, { scopeIds: options.prominenceScopeIds ?? options.scopeIds });
  const targets = [...data.candidates.keys()].sort((a, b) => priority(a) - priority(b) || prominence.compare(a, b)), pages = [];
  let group = [], ids = /* @__PURE__ */ new Set([focus]);
  for (const target of targets) {
    const best = data.candidates.get(target)[0], addition = [target, ...best.bridge ? [best.anchor] : []];
    const cost = addition.filter((id) => !ids.has(id)).length;
    if (group.length && ids.size + cost > effectiveBudget) {
      pages.push(group);
      group = [];
      ids = /* @__PURE__ */ new Set([focus]);
    }
    group.push(target);
    for (const id of addition) ids.add(id);
  }
  if (group.length) pages.push(group);
  const actualPage = Math.min(page, Math.max(0, pages.length - 1)), shown = pages[actualPage] ?? [], wanted = new Set(data.rootReason ? [] : [focus]), bridges = /* @__PURE__ */ new Map();
  for (const target of shown) {
    wanted.add(target);
    const best = data.candidates.get(target)[0];
    if (best.bridge) {
      wanted.add(best.anchor);
      bridges.set(edgeKey2(best.bridge), best.bridge);
    }
  }
  const relationships = new Map(bridges), omissions = [...data.omissions];
  for (const [target, links] of data.candidates) {
    if (!wanted.has(target)) {
      for (const { edge, anchor } of links) omissions.push({ relationshipId: edge.id ?? null, target, anchor, reason: "budget" });
      continue;
    }
    for (const { edge, anchor, bridge } of links) if (wanted.has(anchor)) {
      relationships.set(edgeKey2(edge), edge);
      if (bridge) relationships.set(edgeKey2(bridge), bridge);
    }
  }
  if (isStructuralElement(data.root) && ["context", "contents"].includes(mode)) {
    for (const edge of data.edges) if (["connection", "flow", "binding"].includes(edge.kind) && wanted.has(edge.source) && wanted.has(edge.target) && (!options.relationshipKinds || options.relationshipKinds.includes(edge.kind))) relationships.set(edgeKey2(edge), edge);
  }
  return clone({
    elements: [...wanted].map((id) => data.elements.get(id)),
    relationships: [...relationships.values()].sort((a, b) => compare(edgeKey2(a), edgeKey2(b))),
    omissions,
    summary: summaryFor(data, mode, shown.length, targets.length),
    mode,
    page: actualPage,
    total: targets.length,
    pages: pages.length,
    shown: shown.length,
    targets: shown,
    typingBridges: [...bridges.values()].map((edge) => edge.id),
    budget: effectiveBudget
  });
}
function structuralActions(graph, focus) {
  const prepared = prepare2(graph);
  return [...structuralModes].map((mode) => {
    const data = projection(graph, focus, mode, {}, prepared), count = data.candidates.size;
    return { mode, label: modes[mode].label, count, enabled: count > 0, summary: summaryFor(data, mode, count, count) };
  });
}

// src/canvas-prototype/context.mjs
var allowedKinds2 = new Set(ENGINEERING_RELATIONSHIPS);
var forbiddenKinds = /* @__PURE__ */ new Set(["type", "specialization", "owner", "owningMembership", "ownedMembership", "documentation", "membership", "succession", "transition"]);
var engineeringElement2 = /^(?:Package|Namespace)$|^(Requirement|Part|Action|State|VerificationCase|AnalysisCase|UseCase|Case|Constraint|Calculation|Interface|Connection|Port|Attribute|Item|Occurrence|Allocation)(Definition|Usage)$/;
var compare2 = (a, b) => a < b ? -1 : a > b ? 1 : 0;
var edgeKey3 = (edge) => JSON.stringify([edge.id, edge.source, edge.target, edge.kind]);
var kindOrder = new Map(["derive", "derivation", "refine", "refinement", "satisfy", "satisfaction", "verify", "verification", "allocate", "allocation", "composition", "connection", "reference", "flow", "item-flow", "control-flow", "causation", "dependency"].map((kind, index) => [kind, index]));
function surroundingContext(graph, activeView, options = {}) {
  const { budget = 48 } = options;
  if (!Number.isInteger(budget) || budget < 0) throw new Error("Invalid surrounding context budget");
  const elements = new Map((graph.elements ?? []).map((element2) => [element2.id, element2]));
  const activeNodes = activeView.nodes ?? [], activeEdges = activeView.edges ?? [];
  const activeIds = [...new Set(activeNodes.map((node) => node.semanticId).filter(Boolean))].sort(compare2);
  const active2 = new Set(activeIds), scope = options.scopeIds ? new Set(options.scopeIds) : null;
  const kinds2 = new Set((options.relationshipKinds ?? [...allowedKinds2, "typing", "containment"]).filter((kind) => (allowedKinds2.has(kind) || ["typing", "containment"].includes(kind)) && !forbiddenKinds.has(kind)));
  const nativePackageOwner = (edge) => edge.kind === "containment" && edge.nativeRole === "owner" && /^(Package|Namespace)$/.test(elements.get(edge.source)?.kind ?? "");
  const directType = (edge) => edge.kind === "typing" && /Usage$/.test(elements.get(edge.source)?.kind ?? "") && elements.get(edge.target)?.kind === elements.get(edge.source)?.kind.replace(/Usage$/, "Definition");
  const structural = (id) => /^(PartUsage|PartDefinition|Package|Namespace)$/.test(elements.get(id)?.kind ?? "");
  const structuralView = options.structural === true || options.relationshipKinds?.includes("containment") === true;
  const allowed = (edge, anchor) => kinds2.has(edge.kind) && (edge.kind !== "containment" || nativePackageOwner(edge) && (structuralView || structural(anchor ?? (active2.has(edge.source) ? edge.source : edge.target)))) && (edge.kind !== "typing" || directType(edge));
  const representations2 = /* @__PURE__ */ new Map();
  for (const node of [...activeNodes].sort((a, b) => compare2(a.id, b.id))) if (node.semanticId && !representations2.has(node.semanticId)) representations2.set(node.semanticId, node.id);
  const edges = [...new Map([...graph.relationships ?? [], ...(graph.containment ?? []).filter(nativePackageOwner)].map((edge) => [edgeKey3(edge), edge])).values()].sort((a, b) => compare2(edgeKey3(a), edgeKey3(b)));
  const omissions = [], seenOmissions = /* @__PURE__ */ new Set();
  const omit = (edge, target, reason, anchor) => {
    const key2 = JSON.stringify([edgeKey3(edge), target, reason]);
    if (seenOmissions.has(key2)) return;
    seenOmissions.add(key2);
    omissions.push({ relationshipId: edge.id ?? null, target, anchor, reason });
  };
  const elementReason = (id, edge) => {
    const element2 = elements.get(id);
    if (!element2) return "unavailable";
    if (scope && !scope.has(id)) return "outside-scope";
    if (element2.layer === "metamodel" || element2.metamodel === true) return "metamodel-boundary";
    if (!engineeringElement2.test(element2.kind ?? "") && !(edge && nativePackageOwner(edge) && isDeclarationKind(element2.kind))) return "element-policy";
    return null;
  };
  const candidates = /* @__PURE__ */ new Map();
  for (const edge of edges) {
    const sourceActive = active2.has(edge.source), targetActive = active2.has(edge.target);
    if (sourceActive === targetActive) continue;
    const target = sourceActive ? edge.target : edge.source, anchor = sourceActive ? edge.source : edge.target;
    const reason = !allowed(edge, anchor) ? "relationship-policy" : elementReason(target, edge);
    if (reason) {
      omit(edge, target, reason, anchor);
      continue;
    }
    if (!candidates.has(target)) candidates.set(target, []);
    candidates.get(target).push(edge);
  }
  const priority = (target, anchor) => Math.min(...candidates.get(target).filter((edge) => edge.source === anchor || edge.target === anchor).map((edge) => {
    const structural2 = /^(Part(?:Usage|Definition)|Package|Namespace)$/.test(elements.get(anchor)?.kind ?? "");
    if (structural2) {
      const order = ["composition", "containment", "typing", "connection", "reference", "flow"].indexOf(edge.kind);
      if (order >= 0) return order;
    }
    return 10 + (kindOrder.get(edge.kind) ?? 99);
  }));
  const prominence = createProminenceIndex(graph, { scopeIds: options.prominenceScopeIds ?? options.scopeIds });
  const focus = options.focusId ?? options.focus, anchors = [...activeIds].sort((a, b) => Number(b === focus) - Number(a === focus) || prominence.compare(a, b));
  const chosen = /* @__PURE__ */ new Set(), pending = new Map(anchors.map((id) => [id, [...candidates.keys()].filter((target) => candidates.get(target).some((edge) => edge.source === id || edge.target === id)).sort((a, b) => priority(a, id) - priority(b, id) || prominence.compare(a, b))]));
  while (chosen.size < budget) {
    let progress = false;
    for (const id of anchors) {
      const queue = pending.get(id);
      while (queue.length && chosen.has(queue[0])) queue.shift();
      if (queue.length && chosen.size < budget) {
        chosen.add(queue.shift());
        progress = true;
      }
    }
    if (!progress) break;
  }
  const relationships = [];
  for (const [target, links] of candidates) {
    if (chosen.has(target)) relationships.push(...links);
    else for (const edge of links) omit(edge, target, "budget", active2.has(edge.source) ? edge.source : edge.target);
  }
  for (const edge of edges) if (chosen.has(edge.source) && chosen.has(edge.target)) {
    if (allowed(edge)) relationships.push(edge);
    else omit(edge, edge.target, "relationship-policy", edge.source);
  }
  for (const edge of edges) {
    const sourceChosen = chosen.has(edge.source), targetChosen = chosen.has(edge.target);
    if (sourceChosen === targetChosen) continue;
    const target = sourceChosen ? edge.target : edge.source, anchor = sourceChosen ? edge.source : edge.target;
    if (active2.has(target)) continue;
    const reason = !allowed(edge, anchor) ? "relationship-policy" : elementReason(target, edge) ?? "depth";
    omit(edge, target, reason, anchor);
  }
  const contextElements = [...chosen].map((id) => elements.get(id));
  const projected = graphView(graph, { elements: contextElements, relationships: [] }, "Surrounding engineering context");
  const contextIDs = new Map(contextElements.map((element2) => [element2.id, `context:${activeView.id ?? "view"}:${element2.id}`]));
  const endpoint3 = (id) => representations2.get(id) ?? contextIDs.get(id);
  const byReason = {};
  for (const omission of omissions) byReason[omission.reason] = (byReason[omission.reason] ?? 0) + 1;
  const boundary = { omitted: omissions.length, byReason, budget, depth: 1, shown: contextElements.length };
  return {
    activeView,
    activeIds,
    activeNodes,
    activeEdges,
    elements: contextElements,
    relationships,
    omissions,
    boundary,
    view: {
      ...projected,
      id: `context:${activeView.id ?? "view"}`,
      kind: "general",
      context: true,
      fit: false,
      boundary,
      nodes: projected.nodes.map((node) => ({ ...node, id: contextIDs.get(node.semanticId), detail: "", type: "", parentId: null, context: true, fit: false, notation: "general" })),
      edges: relationships.map((edge) => ({ ...edge, id: `context:${edge.id ?? edgeKey3(edge)}`, semanticSource: edge.source, semanticTarget: edge.target, source: endpoint3(edge.source), target: endpoint3(edge.target), context: true, fit: false, notation: "general" }))
    }
  };
}
function decisionOrder(edge) {
  const { rank } = edgeLayoutHints(edge, { viewKind: "general" });
  if (rank === "target-above-source") return { above: edge.target, below: edge.source };
  if (rank === "source-above-target") return { above: edge.source, below: edge.target };
  return null;
}

// src/canvas-prototype/peripheral-routing.mjs
var eps = 0.05;
var overlap2 = (a, b, gap = 0) => a.x < b.x + b.width + gap && a.x + a.width + gap > b.x && a.y < b.y + b.height + gap && a.y + a.height + gap > b.y;
var length = (points) => points.slice(1).reduce((s, p, i) => s + Math.abs(p.x - points[i].x) + Math.abs(p.y - points[i].y), 0);
var simplify3 = (points) => points.filter((p, i) => !i || p.x !== points[i - 1].x || p.y !== points[i - 1].y).filter((p, i, a) => !i || i === a.length - 1 || !(a[i - 1].x === p.x && p.x === a[i + 1].x || a[i - 1].y === p.y && p.y === a[i + 1].y));
var segments = (points) => (points ?? []).slice(1).map((p, i) => [points[i], p]);
function routeConflicts(points, otherPoints) {
  const crossingPoints = /* @__PURE__ */ new Set();
  let overlapLength = 0;
  for (const [a, b] of segments(points)) for (const [c, d] of segments(otherPoints)) {
    const av = Math.abs(a.x - b.x) < eps, cv = Math.abs(c.x - d.x) < eps;
    if (av === cv) {
      if (Math.abs((av ? a.x : a.y) - (cv ? c.x : c.y)) > eps) continue;
      const common = Math.min(Math.max(av ? a.y : a.x, av ? b.y : b.x), Math.max(cv ? c.y : c.x, cv ? d.y : d.x)) - Math.max(Math.min(av ? a.y : a.x, av ? b.y : b.x), Math.min(cv ? c.y : c.x, cv ? d.y : d.x));
      if (common > eps) overlapLength += common;
    } else {
      const v = av ? [a, b] : [c, d], h = av ? [c, d] : [a, b], x = v[0].x, y = h[0].y;
      if (x >= Math.min(h[0].x, h[1].x) - eps && x <= Math.max(h[0].x, h[1].x) + eps && y >= Math.min(v[0].y, v[1].y) - eps && y <= Math.max(v[0].y, v[1].y) + eps) {
        const isTerminal = (path) => [path[0], path.at(-1)].some((p) => Math.abs(p.x - x) < eps && Math.abs(p.y - y) < eps);
        if (!(isTerminal(points) && isTerminal(otherPoints))) crossingPoints.add(`${Math.round(x / eps)},${Math.round(y / eps)}`);
      }
    }
  }
  return { crossings: crossingPoints.size, overlapLength };
}
function peripheralRoutingMetrics(edges, activeEdges = []) {
  const metrics = { crossings: 0, overlapLength: 0, length: 0, bends: 0, blocked: 0 };
  edges.forEach((edge, i) => {
    if (!edge.points?.length) {
      metrics.blocked++;
      return;
    }
    metrics.length += length(edge.points);
    metrics.bends += Math.max(0, edge.points.length - 2);
    for (const other of [...activeEdges, ...edges.slice(0, i)]) {
      const c = routeConflicts(edge.points, other.points);
      metrics.crossings += c.crossings;
      metrics.overlapLength += c.overlapLength;
    }
  });
  return metrics;
}
var peripheralRouteScore = (m) => m.blocked * 1e8 + m.crossings * 1e6 + m.overlapLength * 1e4 + m.length + m.bends * 12;
var normals = { NORTH: { x: 0, y: -1 }, SOUTH: { x: 0, y: 1 }, EAST: { x: 1, y: 0 }, WEST: { x: -1, y: 0 } };
function terminals(a, b) {
  if (!a.width && !a.height) return [{ point: { x: a.x, y: a.y }, stub: { x: a.x, y: a.y } }];
  const dx = b.x + b.width / 2 - a.x - a.width / 2, dy = b.y + b.height / 2 - a.y - a.height / 2;
  const preferred = Math.abs(dy) > Math.abs(dx) * 0.5 ? dy > 0 ? "SOUTH" : "NORTH" : dx > 0 ? "EAST" : "WEST";
  const secondary = preferred === "NORTH" || preferred === "SOUTH" ? dx >= 0 ? "EAST" : "WEST" : dy >= 0 ? "SOUTH" : "NORTH";
  const fixed = a.kind === "port" ? a.portSide ?? a.side : null;
  return (fixed && normals[fixed] ? [fixed] : [preferred, secondary]).flatMap((side) => (fixed ? [0.5] : side === preferred ? [0.5, 0.25, 0.75] : [0.5]).map((f) => {
    const n = normals[side], point2 = n.x ? { x: a.x + (n.x > 0 ? a.width : 0), y: a.y + a.height * f } : { x: a.x + a.width * f, y: a.y + (n.y > 0 ? a.height : 0) };
    return { point: point2, stub: { x: point2.x + n.x * 8, y: point2.y + n.y * 8 } };
  }));
}
function cardObstacles(edge, nodes) {
  const byID = new Map(nodes.map((n) => [n.id, n])), ancestors = /* @__PURE__ */ new Set(), leafPortOwners = /* @__PURE__ */ new Set();
  for (const id of [edge.source, edge.target]) {
    let n = byID.get(id);
    if (n?.kind === "port" && n.parentId && !byID.get(n.parentId)?.headerHeight) leafPortOwners.add(n.parentId);
    const seen = /* @__PURE__ */ new Set();
    while (n?.parentId && !seen.has(n.parentId)) {
      seen.add(n.parentId);
      ancestors.add(n.parentId);
      n = byID.get(n.parentId);
    }
  }
  return nodes.filter((n) => n.width > 0 && n.height > 0).flatMap((n) => ancestors.has(n.id) && !leafPortOwners.has(n.id) ? n.headerHeight ? [{ ...n, height: n.headerHeight }] : [] : [n]);
}
var segmentHitsRect = (a, b, r) => Math.abs(a.x - b.x) < eps ? a.x > r.x + eps && a.x < r.x + r.width - eps && Math.max(a.y, b.y) > r.y + eps && Math.min(a.y, b.y) < r.y + r.height - eps : a.y > r.y + eps && a.y < r.y + r.height - eps && Math.max(a.x, b.x) > r.x + eps && Math.min(a.x, b.x) < r.x + r.width - eps;
var segmentBox = (a, b, pad = 1) => ({ x: Math.min(a.x, b.x) - pad, y: Math.min(a.y, b.y) - pad, width: Math.abs(a.x - b.x) + pad * 2, height: Math.abs(a.y - b.y) + pad * 2 });
var clearLabel = (box, nodes, labels, paths, area) => box.x >= area.x && box.y >= area.y && box.x + box.width <= area.x + area.width && box.y + box.height <= area.y + area.height && !nodes.some((n) => n.width > 0 && n.height > 0 && overlap2(box, n, 3)) && !labels.some((r) => overlap2(box, r, 3)) && !paths.some((path) => segments(path).some(([a, b]) => overlap2(box, segmentBox(a, b, 1))));
function labelFor(edge, points, nodes, labels, paths, area, measureLabel) {
  if (!edge.label) return null;
  const measured = measureLabel?.(edge.label) ?? { width: String(edge.label).length * 6.5 + 4, height: 14 }, size = { width: Math.max(1, measured.width), height: Math.max(1, measured.height) }, slots = [];
  for (const [a, b] of segments(points)) for (const t of [0.5, 0.25, 0.75]) {
    const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
    if (Math.abs(a.y - b.y) < eps) slots.push({ x: x - size.width / 2, y: y - size.height - 4, ...size }, { x: x - size.width / 2, y: y + 4, ...size });
    else slots.push({ x: x + 5, y: y - size.height / 2, ...size }, { x: x - size.width - 5, y: y - size.height / 2, ...size });
  }
  return slots.find((box) => clearLabel(box, nodes, labels, paths, area, measureLabel)) ?? null;
}
function routePeripheralEdges(edges, nodes, area, { activeEdges = [], obstacles = [], measureLabel, candidateBudget = 16, reverse = true, visibilitySearches = 2 } = {}) {
  const byID = new Map(nodes.map((n) => [n.id, n])), activePaths = activeEdges.map((e) => e.points).filter((p) => p?.length), activeLabels = [...obstacles, ...activeEdges.flatMap((e) => e.labelBox ? [e.labelBox] : [])];
  const run = (ordered2) => {
    const results = [], labels = [...activeLabels];
    for (const edge of ordered2) {
      const a = byID.get(edge.source), b = byID.get(edge.target);
      if (!a || !b) {
        results.push({ ...edge, points: [], d: "", routingBlocked: true });
        continue;
      }
      const paths = [...activePaths, ...results.map((e) => e.points)], hard = [...cardObstacles(edge, nodes).map((n) => ({ x: n.x - 4, y: n.y - 4, width: n.width + 8, height: n.height + 8 })), ...labels.map((r) => ({ x: r.x - 2, y: r.y - 2, width: r.width + 4, height: r.height + 4 }))];
      const laneXs = [area.x + 2, area.x + area.width - 2, ...hard.flatMap((r) => [r.x, r.x + r.width]), ...paths.flatMap((points) => points.flatMap((p) => [p.x - 7, p.x + 7]))], laneYs = [area.y + 2, area.y + area.height - 2, ...hard.flatMap((r) => [r.y, r.y + r.height]), ...paths.flatMap((points) => points.flatMap((p) => [p.y - 7, p.y + 7]))];
      const uniqueLanes = (values, mid, min, max2) => [...new Set(values)].filter((v) => v >= min && v <= max2).sort((a2, b3) => Math.abs(a2 - mid) - Math.abs(b3 - mid)).slice(0, candidateBudget <= 4 ? 4 : 12);
      const xs = uniqueLanes(laneXs, (a.x + a.width / 2 + b.x + b.width / 2) / 2, area.x, area.x + area.width), ys = uniqueLanes(laneYs, (a.y + a.height / 2 + b.y + b.height / 2) / 2, area.y, area.y + area.height);
      let best = null;
      const inspect = (from, to, middle) => {
        const points = simplify3([from.point, ...middle, to.point]);
        if (points.some((p) => p.x < area.x || p.y < area.y || p.x > area.x + area.width || p.y > area.y + area.height) || !routeIsClear(points, edge, nodes)) return;
        if (segments(points).some(([p, q]) => labels.some((r) => segmentHitsRect(p, q, r)))) return;
        if (segments(middle).some(([p, q]) => hard.some((r) => segmentHitsRect(p, q, r)))) return;
        const metric = peripheralRoutingMetrics([{ points }], paths.map((points2) => ({ points: points2 }))), score = peripheralRouteScore(metric);
        if (best && score >= best.score) return;
        const labelBox = labelFor(edge, points, nodes, labels, paths, area, measureLabel);
        if (edge.label && !labelBox) return;
        best = { points, labelBox, score };
      };
      const froms = terminals(a, b), tos = terminals(b, a), pairs = froms.flatMap((from, i) => tos.map((to, j) => ({ from, to, i, j }))).sort((a2, b3) => Math.abs(a2.i - a2.j) - Math.abs(b3.i - b3.j) || a2.i + a2.j - b3.i - b3.j).slice(0, Math.max(1, candidateBudget));
      for (const { from, to } of pairs) {
        const p = from.stub, q = to.stub;
        inspect(from, to, [p, { x: p.x, y: q.y }, q]);
        inspect(from, to, [p, { x: q.x, y: p.y }, q]);
        for (const x of [.../* @__PURE__ */ new Set([(p.x + q.x) / 2, ...xs])]) inspect(from, to, [p, { x, y: p.y }, { x, y: q.y }, q]);
        for (const y of [.../* @__PURE__ */ new Set([(p.y + q.y) / 2, ...ys])]) inspect(from, to, [p, { x: p.x, y }, { x: q.x, y }, q]);
      }
      if (candidateBudget > 4 && (!best || best.score >= 1e4)) for (const { from, to } of pairs) {
        const p = from.stub, q = to.stub;
        for (const x of [.../* @__PURE__ */ new Set([area.x + 2, area.x + area.width - 2, ...xs.slice(0, 2)])]) for (const y of [.../* @__PURE__ */ new Set([area.y + 2, area.y + area.height - 2, ...ys.slice(0, 2)])]) {
          inspect(from, to, [p, { x, y: p.y }, { x, y }, { x: q.x, y }, q]);
          inspect(from, to, [p, { x: p.x, y }, { x, y }, { x, y: q.y }, q]);
        }
      }
      if (!best && candidateBudget > 4) for (const { from, to } of pairs.slice(0, visibilitySearches)) {
        const middle = routeOrthogonal(from.stub, to.stub, hard, { bendPenalty: 12 });
        if (middle) inspect(from, to, middle);
      }
      if (!best) {
        results.push({ ...edge, points: [], d: "", routingBlocked: true, labelOmitted: !!edge.label });
        continue;
      }
      const result = { ...edge, points: best.points, d: best.points.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" "), routingBlocked: false };
      if (best.labelBox) {
        labels.push(best.labelBox);
        result.labelBox = best.labelBox;
        result.x = best.labelBox.x;
        result.y = best.labelBox.y + best.labelBox.height * 0.78;
      }
      results.push(result);
    }
    return { edges: results, metrics: peripheralRoutingMetrics(results, activeEdges) };
  };
  const ordered = [...edges].sort((a, b) => String(a.id).localeCompare(String(b.id))), first = run(ordered);
  if (!reverse || !first.metrics.crossings && !first.metrics.overlapLength && !first.metrics.blocked) return first;
  const second = run([...ordered].reverse());
  return peripheralRouteScore(second.metrics) < peripheralRouteScore(first.metrics) ? second : first;
}

// src/canvas-prototype/neighborhood.mjs
var compare3 = (a, b) => String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0;
var overlap3 = (a, b, g = 0) => a.x < b.x + b.width + g && a.x + a.width + g > b.x && a.y < b.y + b.height + g && a.y + a.height + g > b.y;
var center = (n) => ({ x: n.x + n.width / 2, y: n.y + n.height / 2 });
var clamp3 = (v, min, max2) => Math.max(min, Math.min(max2, v));
var bounds = (rects) => {
  const x = Math.min(...rects.map((r) => r.x)), y = Math.min(...rects.map((r) => r.y));
  return { x, y, width: Math.max(...rects.map((r) => r.x + r.width)) - x, height: Math.max(...rects.map((r) => r.y + r.height)) - y };
};
var pathBoxes = (edges) => edges.flatMap((e) => (e.points ?? []).slice(1).map((b, i) => {
  const a = e.points[i];
  return { x: Math.min(a.x, b.x) - 5, y: Math.min(a.y, b.y) - 5, width: Math.abs(a.x - b.x) + 10, height: Math.abs(a.y - b.y) + 10 };
}));
function prepareNeighborhood(context, activeNodes, area, options = {}) {
  const { width = 156, height = 70, gap = 72, activeEdges = [], labelObstacles = [], obstacles = [], measureLabel } = options;
  if (![area?.x, area?.y, area?.width, area?.height, width, height, gap].every(Number.isFinite) || area.width <= 0 || area.height <= 0 || width <= 0 || height <= 0 || gap < 0) throw new Error("Invalid neighborhood geometry");
  const active2 = activeNodes ?? [], known = new Map(active2.map((n) => [n.id, n])), drafts = [...context.view.nodes].sort((a, b) => compare3(a.name, b.name) || compare3(a.id, b.id));
  const byID = new Map(drafts.map((n) => [n.id, { ...n, width: Number.isFinite(n.width) && n.width > 0 ? n.width : width, height: Number.isFinite(n.height) && n.height > 0 ? n.height : height }])), edges = context.view.edges ?? [], orders = edges.map(decisionOrder).filter(Boolean), hull = active2.length ? bounds(active2) : area;
  const blocked = [...active2, ...obstacles, ...labelObstacles, ...pathBoxes(activeEdges)], nodes = [], notices = [];
  const limits2 = new Map(drafts.map((n) => [n.id, { min: -Infinity, max: Infinity }]));
  const lower = (id) => known.has(id) ? known.get(id).y : limits2.get(id)?.min ?? -Infinity;
  const upper = (id) => known.has(id) ? known.get(id).y : limits2.get(id)?.max ?? Infinity;
  const nodeHeight = (id) => known.get(id)?.height ?? byID.get(id)?.height ?? height;
  const rankGap = (id) => Math.max(gap, orders.filter((o) => o.above === id || o.below === id).length * 10 + 24);
  for (let i = 0; i < drafts.length + 1; i++) {
    let changed = false;
    for (const { above, below } of orders) {
      const lo = limits2.get(below), hi = limits2.get(above), nextMin = lower(above) + nodeHeight(above) + rankGap(above), nextMax = upper(below) - nodeHeight(above) - rankGap(above);
      if (lo && nextMin > lo.min) {
        lo.min = nextMin;
        changed = true;
      }
      if (hi && nextMax < hi.max) {
        hi.max = nextMax;
        changed = true;
      }
    }
    if (!changed) break;
  }
  const remaining = new Set(drafts.map((n) => n.id)), ordered = [];
  while (remaining.size) {
    const ready = [...remaining].filter((id) => !orders.some((o) => o.below === id && remaining.has(o.above))).sort(compare3);
    if (!ready.length) {
      notices.push({ reason: "context-rank-conflict", targets: [...remaining] });
      ordered.push(...[...remaining].sort(compare3));
      break;
    }
    for (const id of ready) {
      ordered.push(id);
      remaining.delete(id);
    }
  }
  for (const id of ordered) {
    const node = byID.get(id), width2 = node.width, height2 = node.height, links = edges.filter((e) => e.source === id || e.target === id), linked = links.map((e) => known.get(e.source === id ? e.target : e.source)).filter(Boolean), activeAnchors = linked.filter((n) => active2.some((a) => a.id === n.id)), anchors = activeAnchors.length ? activeAnchors : linked, anchor = anchors.length ? { x: anchors.reduce((s, n) => s + center(n).x, 0) / anchors.length, y: anchors.reduce((s, n) => s + center(n).y, 0) / anchors.length } : center(hull);
    let { min, max: max2 } = limits2.get(id);
    for (const { above, below } of orders) {
      if (below === id && known.has(above)) min = Math.max(min, known.get(above).y + known.get(above).height + rankGap(above));
      if (above === id && known.has(below)) max2 = Math.min(max2, known.get(below).y - height2 - rankGap(id));
    }
    if (min > max2) {
      notices.push({ reason: "context-rank-conflict", target: node.semanticId });
      min = -Infinity;
      max2 = Infinity;
    }
    const idealY = clamp3(anchor.y - height2 / 2, min, max2), idealX = anchor.x - width2 / 2, dx = width2 + gap, dy = height2 + gap;
    let placed = null;
    for (let ring = 0; ring < drafts.length + blocked.length + 8 && !placed; ring++) {
      const candidates = [];
      const ranked = orders.some((o) => o.above === id || o.below === id);
      for (let row = ranked ? 0 : -ring; row <= (ranked ? 0 : ring); row++) for (let col = -ring; col <= ring; col++) {
        if (Math.max(Math.abs(row), Math.abs(col)) !== ring) continue;
        for (const offset of [0, dx / 2]) {
          const candidate = { x: idealX + col * dx + offset, y: clamp3(idealY + row * dy, min, max2), width: width2, height: height2 };
          if (blocked.some((other) => overlap3(candidate, other, gap / 2))) continue;
          const stemBlocked = orders.some((order) => {
            const other = active2.find((n) => n.id === (order.above === id ? order.below : order.below === id ? order.above : null));
            if (!other) return false;
            const x = candidate.x + candidate.width / 2, top = order.below === id ? other.y + other.height : candidate.y + height2, bottom = order.below === id ? candidate.y : other.y;
            return nodes.some((n) => x > n.x - 6 && x < n.x + n.width + 6 && n.y < bottom && n.y + n.height > top);
          });
          if (stemBlocked) continue;
          candidates.push(candidate);
        }
      }
      candidates.sort((a, b) => Math.abs(center(a).x - anchor.x) + Math.abs(center(a).y - anchor.y) - Math.abs(center(b).x - anchor.x) - Math.abs(center(b).y - anchor.y) || a.y - b.y || a.x - b.x);
      if (candidates.length) placed = { ...node, ...candidates[0], context: true, fit: false, parentId: null };
    }
    if (!placed) throw new Error("Unable to place neighborhood tile in world space");
    nodes.push(placed);
    blocked.push(placed);
    known.set(id, placed);
  }
  const allNodes = [...active2, ...nodes], extent = bounds([...allNodes, ...obstacles, ...labelObstacles, area]), padding = Math.max(60, gap * 2), worldBounds = { x: extent.x - padding, y: extent.y - padding, width: extent.width + padding * 2, height: extent.height + padding * 2 };
  const attachments = /* @__PURE__ */ new Map(), sideFor = (a, b) => {
    const order = edges.find((e) => e.source === a.id && e.target === b.id || e.target === a.id && e.source === b.id), rank = order && decisionOrder(order);
    if (rank) return rank.above === a.id ? "SOUTH" : "NORTH";
    const ac = center(a), bc = center(b);
    return Math.abs(bc.y - ac.y) > Math.abs(bc.x - ac.x) * 0.65 ? bc.y >= ac.y ? "SOUTH" : "NORTH" : bc.x >= ac.x ? "EAST" : "WEST";
  };
  for (const node of allNodes) {
    const incident = edges.filter((e) => e.source === node.id || e.target === node.id);
    for (const side of ["NORTH", "SOUTH", "EAST", "WEST"]) {
      const neighbors = incident.map((e) => ({ edge: e, other: known.get(e.source === node.id ? e.target : e.source) })).filter(({ other }) => other && sideFor(node, other) === side);
      neighbors.sort((a, b) => {
        const ac = center(a.other), bc = center(b.other);
        return (side === "NORTH" || side === "SOUTH" ? ac.x - bc.x : ac.y - bc.y) || compare3(a.edge.id, b.edge.id);
      });
      const byDistance = [...neighbors].sort((a, b) => Math.abs(center(b.other).x - center(node).x) - Math.abs(center(a.other).x - center(node).x) || compare3(a.edge.id, b.edge.id));
      neighbors.forEach(({ edge }, i) => {
        const fraction = (i + 1) / (neighbors.length + 1), point2 = side === "NORTH" || side === "SOUTH" ? { x: node.x + node.width * fraction, y: node.y + (side === "SOUTH" ? node.height : 0) } : { x: node.x + (side === "EAST" ? node.width : 0), y: node.y + node.height * fraction };
        attachments.set(`${edge.id}:${node.id}`, { ...point2, side, lane: (byDistance.findIndex((n) => n.edge.id === edge.id) + 1) / (neighbors.length + 1) });
      });
    }
  }
  let routed = [];
  const fanCandidates = /* @__PURE__ */ new Map();
  const sorted = [...edges].sort((a, b) => compare3(a.id, b.id));
  for (const edge of sorted) {
    const endpoints2 = /* @__PURE__ */ new Set([edge.source, edge.target]), proxyNodes = allNodes.flatMap((node) => {
      if (!endpoints2.has(node.id)) return [node];
      const point2 = attachments.get(`${edge.id}:${node.id}`);
      if (!point2) return [node];
      const interior = { ...node, id: `interior:${node.id}`, x: node.x + 6, y: node.y + 6, width: Math.max(0, node.width - 12), height: Math.max(0, node.height - 12), parentId: null };
      return [interior, { ...node, ...point2, width: 0.01, height: 0.01, kind: "port", portSide: point2.side, parentId: null }];
    });
    const routingOptions = { activeEdges: [...activeEdges, ...routed.filter((e) => !e.routingBlocked)], obstacles: [...obstacles, ...labelObstacles], measureLabel, candidateBudget: 4, reverse: false, visibilitySearches: 0 };
    const routingEdge = { ...edge, label: "" };
    let result = routePeripheralEdges([routingEdge], proxyNodes, worldBounds, routingOptions).edges[0];
    const order = decisionOrder(edge);
    if (order) {
      const above = known.get(order.above), below = known.get(order.below), top = attachments.get(`${edge.id}:${order.above}`), bottom = attachments.get(`${edge.id}:${order.below}`);
      if (above && below && top?.side === "SOUTH" && bottom?.side === "NORTH" && bottom.y - top.y > 20) {
        let laneMin = top.y + 8, laneMax = bottom.y - 8;
        for (const obstacle of [...obstacles, ...labelObstacles, ...activeEdges.flatMap((e) => e.labelBox ? [e.labelBox] : [])]) {
          if (top.x > obstacle.x - 5 && top.x < obstacle.x + obstacle.width + 5 && obstacle.y >= top.y + 8 && obstacle.y < bottom.y) laneMax = Math.min(laneMax, obstacle.y - 8);
          if (bottom.x > obstacle.x - 5 && bottom.x < obstacle.x + obstacle.width + 5 && obstacle.y + obstacle.height > top.y && obstacle.y + obstacle.height <= bottom.y - 8) laneMin = Math.max(laneMin, obstacle.y + obstacle.height + 8);
        }
        const lane = laneMin + (laneMax - laneMin) * top.lane, path = [{ x: top.x, y: top.y }, { x: top.x, y: lane }, { x: bottom.x, y: lane }, { x: bottom.x, y: bottom.y }], points = edge.source === order.above ? path : [...path].reverse(), candidate = { ...edge, points, routingBlocked: false, d: points.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ") };
        const avoids = laneMin <= laneMax && ![...obstacles, ...labelObstacles, ...activeEdges.flatMap((e) => e.labelBox ? [e.labelBox] : [])].some((r) => pathBoxes([candidate]).some((box) => overlap3(box, r)));
        if (avoids && routeIsClear(points, edge, allNodes, { orthogonalOnly: true })) {
          fanCandidates.set(edge.id, candidate);
        }
        if (avoids && routeIsClear(points, edge, allNodes, { orthogonalOnly: true }) && peripheralRouteScore(peripheralRoutingMetrics([candidate], routingOptions.activeEdges)) < peripheralRouteScore(peripheralRoutingMetrics([result], routingOptions.activeEdges))) result = candidate;
      }
    }
    if (result.routingBlocked) result = routePeripheralEdges([routingEdge], proxyNodes, worldBounds, { ...routingOptions, candidateBudget: 8, visibilitySearches: 1 }).edges[0];
    result = { ...result, label: edge.label };
    if (!result.routingBlocked && (!routeIsClear(result.points, edge, allNodes, { orthogonalOnly: true }) || !routeConnectsEndpoints(result.points, edge, allNodes))) result = { ...result, points: [], d: "", routingBlocked: true };
    if (result.routingBlocked) {
      const fallback = routePeripheralEdges([routingEdge], allNodes, worldBounds, { ...routingOptions, candidateBudget: 16, visibilitySearches: 2 }).edges[0];
      if (!fallback.routingBlocked && routeIsClear(fallback.points, edge, allNodes, { orthogonalOnly: true }) && routeConnectsEndpoints(fallback.points, edge, allNodes)) result = { ...fallback, label: edge.label };
    }
    routed.push(result);
  }
  const allFans = routed.map((edge) => fanCandidates.get(edge.id) ?? edge);
  if (peripheralRouteScore(peripheralRoutingMetrics(allFans, activeEdges)) < peripheralRouteScore(peripheralRoutingMetrics(routed, activeEdges))) routed = allFans;
  const protectedRects = [...obstacles, ...labelObstacles, ...activeEdges.flatMap((e) => e.labelBox ? [e.labelBox] : [])];
  const safe = (edge) => routeConnectsEndpoints(edge.points, edge, allNodes) && routeIsClear(edge.points, edge, allNodes, { orthogonalOnly: true }) && !pathBoxes([edge]).some((box) => protectedRects.some((r) => overlap3(box, r)));
  const clipPoints = (points) => {
    const paths = [];
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i];
      if (Math.abs(a.x - b.x) < 0.01) {
        if (a.x < area.x || a.x > area.x + area.width) continue;
        const low = Math.max(Math.min(a.y, b.y), area.y), high = Math.min(Math.max(a.y, b.y), area.y + area.height);
        if (low <= high) paths.push([{ x: a.x, y: low }, { x: a.x, y: high }]);
      } else {
        if (a.y < area.y || a.y > area.y + area.height) continue;
        const low = Math.max(Math.min(a.x, b.x), area.x), high = Math.min(Math.max(a.x, b.x), area.x + area.width);
        if (low <= high) paths.push([{ x: low, y: a.y }, { x: high, y: a.y }]);
      }
    }
    return paths;
  };
  const visibleCrossings = (edge, other) => clipPoints(edge.points).reduce((total, path) => total + other.reduce((sum, e) => sum + routeConflicts(path, e.points ?? []).crossings, 0), 0);
  const laneScore = (metrics, edge, other) => metrics.blocked * 1e12 + metrics.overlapLength * 1e8 + visibleCrossings(edge, other) * 1e7 + metrics.crossings * 1e5 + metrics.length + metrics.bends * 12;
  for (let pass = 0; pass < 3; pass++) {
    let improved = false;
    for (let index = 0; index < routed.length; index++) {
      const current = routed[index];
      if (current.routingBlocked) continue;
      const other = [...activeEdges, ...routed.filter((_, i) => i !== index)], metric = peripheralRoutingMetrics([current], other);
      if (metric.overlapLength < 0.05 && !metric.crossings) continue;
      let best = current, bestScore = laneScore(metric, current, other);
      for (let segment = 0; segment < current.points.length - 1; segment++) for (const offset of [-7, 7, -14, 14, -28, 28, -49, 49, -98, 98, -196, 196]) {
        const points = current.points.map((p) => ({ ...p })), a = points[segment], b = points[segment + 1];
        if (Math.abs(a.x - b.x) < 0.01) {
          a.x += offset;
          b.x += offset;
        } else if (Math.abs(a.y - b.y) < 0.01) {
          a.y += offset;
          b.y += offset;
        } else continue;
        const candidate = { ...current, points };
        if (!safe(candidate)) continue;
        const score = laneScore(peripheralRoutingMetrics([candidate], other), candidate, other);
        if (score < bestScore) {
          best = candidate;
          bestScore = score;
        }
      }
      if (best !== current) {
        routed[index] = { ...best, d: best.points.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ") };
        improved = true;
      }
    }
    if (!improved) break;
  }
  const reserved = [...obstacles, ...labelObstacles, ...activeEdges.flatMap((e) => e.labelBox ? [e.labelBox] : [])], corridors = pathBoxes([...activeEdges, ...routed]);
  for (const edge of routed) {
    if (!edge.label || edge.routingBlocked) continue;
    const measured = measureLabel?.(edge.label) ?? { width: String(edge.label).length * 6.5 + 4, height: 14 }, size = { width: Math.max(1, measured.width), height: Math.max(1, measured.height) }, slots = [];
    for (let i = 1; i < edge.points.length; i++) {
      const a = edge.points[i - 1], b = edge.points[i];
      for (const fraction of [0.5, 0.25, 0.75]) {
        const x = a.x + (b.x - a.x) * fraction, y = a.y + (b.y - a.y) * fraction;
        if (a.y === b.y) slots.push({ x: x - size.width / 2, y: y - size.height - 8, ...size }, { x: x - size.width / 2, y: y + 8, ...size });
        else slots.push({ x: x + 8, y: y - size.height / 2, ...size }, { x: x - size.width - 8, y: y - size.height / 2, ...size });
      }
    }
    const box = slots.find((box2) => box2.x >= worldBounds.x && box2.y >= worldBounds.y && box2.x + box2.width <= worldBounds.x + worldBounds.width && box2.y + box2.height <= worldBounds.y + worldBounds.height && ![...allNodes, ...reserved, ...corridors].some((r) => overlap3(box2, r, 2)));
    if (box) {
      edge.labelBox = box;
      edge.x = box.x;
      edge.y = box.y + box.height * 0.78;
      reserved.push(box);
    } else edge.labelOmitted = true;
  }
  const routing = { edges: routed, metrics: peripheralRoutingMetrics(routed, activeEdges) };
  const omissions = [...context.omissions ?? []], routedEdges = routing.edges.filter((e) => !e.routingBlocked);
  for (const edge of routing.edges.filter((e) => e.routingBlocked)) omissions.push({ relationshipId: edge.semanticId ?? edge.id, source: edge.semanticSource, target: edge.semanticTarget, reason: "context-route-unavailable" });
  const omittedLabels = routedEdges.filter((e) => e.labelOmitted);
  if (omittedLabels.length) notices.push({ reason: "context-label-space", relationships: omittedLabels.map((e) => e.semanticId ?? e.id), count: omittedLabels.length });
  if (routing.metrics.blocked) notices.push({ reason: "context-route-unavailable", count: routing.metrics.blocked });
  if (routing.metrics.crossings || routing.metrics.overlapLength) notices.push({ reason: "context-route-conflict", ...routing.metrics });
  const byReason = {};
  for (const omission of omissions) byReason[omission.reason] = (byReason[omission.reason] ?? 0) + 1;
  const finalBounds = bounds([worldBounds, ...routedEdges.flatMap((e) => [...(e.points ?? []).map((p) => ({ ...p, width: 0, height: 0 })), ...e.labelBox ? [e.labelBox] : []])]);
  return { ...context.view, nodes, edges, routedEdges, stubEdges: [], boundaryMarkers: [], worldBounds: finalBounds, routingMetrics: routing.metrics, notices, omissions, boundary: { ...context.boundary, cards: nodes.length, markers: 0, omitted: omissions.length, byReason } };
}

// src/canvas-prototype/motion.mjs
function sampleTrack(track, offsets, progress) {
  if (progress <= 0) return { ...track[0] };
  if (progress >= 1) return { ...track.at(-1) };
  let i = 0;
  while (i < offsets.length - 2 && progress > offsets[i + 1]) i++;
  const t = (progress - offsets[i]) / (offsets[i + 1] - offsets[i]), a = track[i], b = track[i + 1], result = {};
  for (const key2 of Object.keys(a)) {
    if (typeof a[key2] !== "number") {
      result[key2] = t < 0.5 ? a[key2] : b[key2];
      continue;
    }
    const derivative = (index) => {
      const slope = (j) => (track[j + 1][key2] - track[j][key2]) / (offsets[j + 1] - offsets[j]);
      if (index === 0) return slope(0);
      if (index === track.length - 1) return slope(index - 1);
      const left = slope(index - 1), right = slope(index);
      if (left * right <= 0) return 0;
      const h0 = offsets[index] - offsets[index - 1], h1 = offsets[index + 1] - offsets[index], w0 = 2 * h1 + h0, w1 = h1 + 2 * h0;
      return (w0 + w1) / (w0 / left + w1 / right);
    };
    const width = offsets[i + 1] - offsets[i], m0 = derivative(i) * width, m1 = derivative(i + 1) * width;
    const value = (2 * t ** 3 - 3 * t ** 2 + 1) * a[key2] + (t ** 3 - 2 * t ** 2 + t) * m0 + (-2 * t ** 3 + 3 * t ** 2) * b[key2] + (t ** 3 - t ** 2) * m1;
    result[key2] = Math.max(Math.min(a[key2], b[key2]), Math.min(Math.max(a[key2], b[key2]), value));
  }
  return result;
}
var easeJourney = (t) => (1 - Math.cos(Math.PI * Math.max(0, Math.min(1, t)))) / 2;
function startTimeline({ duration, update, request = (fn) => requestAnimationFrame(fn), cancel = (id) => cancelAnimationFrame(id), now = () => performance.now() }) {
  let handle, stopped = false, resolve2;
  const finished = new Promise((r) => resolve2 = r), start2 = now();
  const finish = (cancelled) => {
    if (stopped) return;
    stopped = true;
    if (handle !== void 0) cancel(handle);
    resolve2({ cancelled });
  };
  const tick = (time) => {
    if (stopped) return;
    const t = Math.min(1, Math.max(0, (time - start2) / duration));
    update(easeJourney(t), t);
    if (t >= 1) finish(false);
    else handle = request(tick);
  };
  if (duration <= 0) {
    update(1, 1);
    finish(false);
  } else {
    update(0, 0);
    handle = request(tick);
  }
  return { finished, cancel: () => finish(true), finish: () => {
    if (!stopped) {
      update(1, 1);
      finish(false);
    }
  } };
}
function samplePolyline(points, count = 20) {
  const lengths = [0];
  for (let i = 1; i < points.length; i++) lengths.push(lengths.at(-1) + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
  const total = lengths.at(-1);
  return Array.from({ length: count }, (_, i) => {
    const distance3 = total * i / (count - 1);
    let j = 1;
    while (j < lengths.length - 1 && lengths[j] < distance3) j++;
    const amount = (distance3 - lengths[j - 1]) / (lengths[j] - lengths[j - 1] || 1);
    return { x: points[j - 1].x + (points[j].x - points[j - 1].x) * amount, y: points[j - 1].y + (points[j].y - points[j - 1].y) * amount };
  });
}
function visibleTrackKeys(frames, collection) {
  return [...new Set(frames.flatMap((frame2) => frame2[collection].filter((item) => (item.opacity ?? 1) > 0).map((item) => item.key)))];
}

// src/canvas-prototype/journey-camera.mjs
var clamp4 = (value, min, max2) => Math.max(min, Math.min(max2, value));
var validNode = (node) => node && (node.opacity ?? 1) > 0 && [node.x, node.y, node.width, node.height].every(Number.isFinite) && node.width >= 0 && node.height >= 0;
var identity3 = (node) => node.semanticId ?? node.key ?? node.id;
function boundsFor(nodes) {
  if (!nodes.length) return null;
  const x = Math.min(...nodes.map((n) => n.x)), y = Math.min(...nodes.map((n) => n.y));
  return { x, y, width: Math.max(...nodes.map((n) => n.x + n.width)) - x, height: Math.max(...nodes.map((n) => n.y + n.height)) - y };
}
function frameArea(frame2) {
  const area = frame2.area;
  if (area && [area.x, area.y, area.width, area.height].every(Number.isFinite) && area.width > 0 && area.height > 0) return { ...area };
  return { x: 0, y: 0, width: Math.max(1, Number.isFinite(frame2.width) ? frame2.width : 1e3), height: Math.max(1, Number.isFinite(frame2.height) ? frame2.height : 700) };
}
function focusNode(frame2, nodes) {
  const focus = frame2.focus ?? frame2.view?.focus;
  return nodes.find((n) => identity3(n) === focus || n.id === focus || n.key === focus);
}
function viewpoint(frame2, nodes, { maximumScale = 0.78, padding = 24 } = {}) {
  const area = frameArea(frame2), bounds2 = boundsFor(nodes);
  if (!bounds2) return createCamera();
  const fit = fitCameraToBounds(bounds2, area, padding), scale = Math.min(maximumScale, fit.scale);
  const focus = focusNode(frame2, nodes), center2 = focus ? { x: focus.x + focus.width / 2, y: focus.y + focus.height / 2 } : { x: bounds2.x + bounds2.width / 2, y: bounds2.y + bounds2.height / 2 };
  const desired = { x: area.x + area.width / 2 - center2.x * scale, y: area.y + area.height / 2 - center2.y * scale };
  const marginX = Math.min(padding, area.width / 2), marginY = Math.min(padding, area.height / 2);
  const minX = area.x + marginX - bounds2.x * scale, maxX = area.x + area.width - marginX - (bounds2.x + bounds2.width) * scale;
  const minY = area.y + marginY - bounds2.y * scale, maxY = area.y + area.height - marginY - (bounds2.y + bounds2.height) * scale;
  return createCamera({ x: minX <= maxX ? clamp4(desired.x, minX, maxX) : fit.x, y: minY <= maxY ? clamp4(desired.y, minY, maxY) : fit.y, scale });
}
function normalizedOffsets(frames, offsets) {
  if (offsets === void 0) return frames.map((_, index) => index / (frames.length - 1 || 1));
  if (frames.length === 1 && offsets.length === 1 && offsets[0] === 0) return [0];
  if (offsets.length !== frames.length || offsets[0] !== 0 || offsets.at(-1) !== 1 || offsets.some((value, index) => !Number.isFinite(value) || index > 0 && value <= offsets[index - 1])) throw new TypeError("Journey camera offsets must strictly increase from 0 to 1 for every frame");
  return [...offsets];
}
function journeyCameraTrack(frames, { initialCamera = createCamera(), finalCamera = createCamera(), offsets } = {}) {
  if (!Array.isArray(frames) || !frames.length) throw new TypeError("Journey camera requires at least one prepared frame");
  const start2 = createCamera(initialCamera), finish = createCamera(finalCamera), times = normalizedOffsets(frames, offsets), poses = [];
  const add = (progress, camera, phase, frameIndex) => poses.push({ progress, camera: createCamera(camera), phase, frameIndex });
  if (frames.length === 1) {
    add(0, finish, "destination", 0);
    add(1, finish, "destination", 0);
  } else {
    add(0, start2, "source", 0);
    if (frames.length > 2) {
      const routeIds = /* @__PURE__ */ new Set();
      for (const frame2 of frames.slice(1, -1)) for (const node of frame2.nodes ?? []) if (validNode(node) && !node.context) routeIds.add(identity3(node));
      const source = frames[0], sourceNodes = (source.nodes ?? []).filter(validNode), focus = focusNode(source, sourceNodes);
      const openingNodes = sourceNodes.filter((node) => routeIds.has(identity3(node)) || node === focus);
      if (openingNodes.length) add(Math.min(0.1, times[1] * 0.5), viewpoint(source, openingNodes, { maximumScale: 0.82 }), "open-route", 0);
      for (let index = 1; index < frames.length - 1; index++) {
        const frame2 = frames[index], nodes = (frame2.nodes ?? []).filter((node) => validNode(node) && !node.context);
        add(times[index], viewpoint(frame2, nodes), "follow-route", index);
      }
    } else {
      const source = frames[0], destination = frames[1], a = focusNode(source, (source.nodes ?? []).filter(validNode)), b = focusNode(destination, (destination.nodes ?? []).filter(validNode));
      const area = frameArea(source), travel = a && b ? Math.hypot(a.x + a.width / 2 - b.x - b.width / 2, a.y + a.height / 2 - b.y - b.height / 2) : 0;
      if (travel > Math.min(area.width, area.height) * 0.35) {
        add(0.5, viewpoint(source, [a, b], { maximumScale: 0.9 }), "reflow", 0);
      }
    }
    add(1, finish, "destination", frames.length - 1);
  }
  const track = poses.map((p) => p.camera), cameraOffsets = poses.map((p) => p.progress);
  return { poses, track, offsets: cameraOffsets, sample: (progress) => createCamera(sampleTrack(track, cameraOffsets, Number.isFinite(progress) ? clamp4(progress, 0, 1) : 0)) };
}

// src/canvas-prototype/documentation.mjs
var indexes = /* @__PURE__ */ new WeakMap();
function documentationFor(graph, id) {
  let index = indexes.get(graph);
  if (!index) {
    index = new Map((graph?.elements ?? []).map((e) => [e.id, e]));
    if (graph) indexes.set(graph, index);
  }
  const own2 = index.get(id);
  if (own2?.description) return { text: own2.description, source: own2 };
  const types = own2?.native?.type;
  const references = Array.isArray(types) ? types : types ? [types] : [];
  for (const reference of references) {
    const type = index.get(reference?.["@id"]);
    if (type?.description) return { text: type.description, source: type };
  }
  return { text: "", source: own2 };
}
function measureCard(document2, node, detail) {
  const width = Math.max(Number(node.width) || 0, detail ? 280 : 160);
  const card = document2.createElement("div");
  card.className = "node";
  card.style.cssText = `position:fixed;left:-10000px;top:0;visibility:hidden;width:${width}px;height:auto;transform:none;`;
  for (const [className, text2] of [["kind", `\xAB${node.kind}\xBB${node.displayID ? " " + node.displayID : ""}${node.type ? " : " + node.type : ""}`], ["name", (node.name?.split("::").at(-1) || node.kind).replace(/([a-z0-9])([A-Z])/g, "$1\u200B$2")], ...detail ? [["detail", detail]] : [], ...node.overviewLabel ? [["prominence", node.overviewLabel]] : []]) {
    const part = document2.createElement("span");
    part.className = className;
    part.textContent = text2;
    card.append(part);
  }
  document2.body.append(card);
  const height = Math.max(76, Math.ceil(card.getBoundingClientRect().height), card.scrollHeight);
  card.remove();
  return { width, height };
}

// src/canvas-prototype/engine/client.mjs
function createSemanticEngine({ assetBase, assetVersion, workerURL = new URL("./worker.js", import.meta.url), WorkerClass = globalThis.Worker } = {}) {
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
  const ready = request("Initialize", { assetBase: base, assetVersion });
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

// src/canvas-prototype/app.mjs
var buildVersion = document.querySelector('meta[name="syspresent-build"]')?.content || "development";
var $ = (id) => document.getElementById(id);
var el = (name, text2, cls) => {
  const e = document.createElement(name);
  if (text2 !== void 0) e.textContent = text2;
  if (cls) e.className = cls;
  return e;
};
var button = (text2, fn) => {
  const e = el("button", text2);
  e.type = "button";
  e.onclick = () => Promise.resolve(fn()).catch(report);
  return e;
};
var state = { engine: null, project: null, graph: null, views: /* @__PURE__ */ new Map(), scenes: [], sceneIndex: 0, focus: null, selected: null, view: null, displayed: null, exploring: false, expanded: /* @__PURE__ */ new Set(), collapsed: /* @__PURE__ */ new Set(), rects: /* @__PURE__ */ new Map(), reduce: matchMedia("(prefers-reduced-motion: reduce)").matches, revision: 0, loadRevision: 0, animations: [], transitioning: false, provenance: null, history: [], future: [], presentation: {}, traceRequest: null, camera: createCamera(), cameraRevision: 0, neighborhoodBudget: null };
try {
  state.reader = loadReaderSettings(localStorage);
} catch {
  state.reader = loadReaderSettings(null);
}
state.surfaceStates = {};
state.surfaces = [];
state.selectedIds = [];
state.comparison = null;
state.activeRegion = "primary";
var report = (error) => {
  const message = error.message || String(error);
  $("status").textContent = message;
  $("editor-error").textContent = message;
  if (!$("landing").hidden) {
    $("landing-error").textContent = message;
    $("landing-error").hidden = false;
    $("landing-status").textContent = "";
  }
  console.error(error);
};
var elementIndexes = /* @__PURE__ */ new WeakMap();
function element(id) {
  if (!state.graph) return;
  let index = elementIndexes.get(state.graph);
  if (!index) {
    index = new Map(state.graph.elements.map((e) => [e.id, e]));
    elementIndexes.set(state.graph, index);
  }
  return index.get(id);
}
var label = (id) => element(id)?.name || id;
function resolveInGraph(graph, value) {
  const exact = graph?.elements.find((e) => e.id === value);
  if (exact) return exact.id;
  const matches = graph?.elements.filter((e) => e.qualifiedName === value) ?? [];
  if (matches.length > 1) throw Error("Ambiguous native qualified reference: " + value);
  return matches[0]?.id;
}
var resolve = (value) => resolveInGraph(state.graph, value);
var qname = (id) => element(id)?.qualifiedName;
var scene = () => state.scenes[state.sceneIndex];
function scopeIds() {
  const roots = state.project.manifest.systemOfInterest;
  return state.graph.elements.filter((e) => roots.some((root) => e.qualifiedName === root || e.qualifiedName?.startsWith(root + "::"))).map((e) => e.id);
}
function status(text2) {
  $("status").textContent = text2;
  $("loading-phase").textContent = text2;
  if (!$("landing").hidden) $("landing-status").textContent = text2;
}
function inline(parent, text2) {
  let start2 = 0;
  for (const m of text2.matchAll(/\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*/g)) {
    parent.append(document.createTextNode(text2.slice(start2, m.index)));
    parent.append(el(m[1] ? "strong" : m[2] ? "code" : "em", m[1] ?? m[2] ?? m[3]));
    start2 = m.index + m[0].length;
  }
  parent.append(document.createTextNode(text2.slice(start2)));
}
function markdown(text2) {
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
  for (const line2 of text2.split("\n")) {
    const heading = /^(#{1,6})\s+(.+)$/.exec(line2), item = /^[-*]\s+(.+)$/.exec(line2);
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
    } else if (!line2.trim()) flush();
    else paragraph.push(line2);
  }
  flush();
  return host;
}
var engineReady;
var demoCatalog;
async function ensureEngine() {
  if (engineReady) return engineReady;
  status("Starting the model engine\u2026");
  state.layoutEngine ??= createLayoutEngine({ workerUrl: new URL("./layout/elk-worker.js?v=" + buildVersion, location.href).href });
  state.engine = createSemanticEngine({ assetBase: new URL("./engine/", location.href), assetVersion: buildVersion, workerURL: new URL("./engine/worker.js?v=" + buildVersion, location.href) });
  engineReady = (async () => {
    state.engineInfo = await state.engine.ready;
    const response = await fetch("./engine/provenance.json?v=" + buildVersion);
    if (!response.ok) throw Error("Model engine provenance is unavailable.");
    state.provenance = await response.json();
  })().catch((error) => {
    state.engine?.terminate();
    engineReady = null;
    throw error;
  });
  return engineReady;
}
async function demos() {
  if (demoCatalog) return demoCatalog;
  const response = await fetch("./demos.json?v=" + buildVersion);
  if (!response.ok) throw Error("Demo catalog is unavailable. You can still open your own model files.");
  const catalog = await response.json();
  if (catalog.schemaVersion !== "syspresent.demos.v1" || !Array.isArray(catalog.demos)) throw Error("Unsupported demo catalog");
  const seen = /* @__PURE__ */ new Set();
  for (const item of catalog.demos) {
    if (typeof item.id !== "string" || !item.id || seen.has(item.id) || typeof item.title !== "string") throw Error("Invalid demo catalog");
    seen.add(item.id);
    projectPath(item.project);
  }
  demoCatalog = catalog.demos;
  return demoCatalog;
}
async function openDemo(id) {
  const request = ++state.loadRevision;
  ++state.revision;
  busy(true);
  $("landing-error").hidden = true;
  status("Opening demo\u2026");
  try {
    const demo = (await demos()).find((item) => item.id === id);
    if (!demo) throw Error("Demo not found: " + id);
    const response = await fetch("./" + demo.project + "?v=" + buildVersion);
    if (!response.ok) throw Error("Demo files are unavailable.");
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (request !== state.loadRevision) return;
    await loadProject(unpackProject(bytes), { cacheHash: demo.runtimeCacheHash, loadToken: request });
  } catch (error) {
    if (request === state.loadRevision) throw error;
  } finally {
    if (request === state.loadRevision) busy(false);
  }
}
function home() {
  ++state.loadRevision;
  ++state.revision;
  cancelAnimations();
  $("project-menu").open = false;
  $("selection").hidden = true;
  $("find").hidden = true;
  for (const dialog of document.querySelectorAll("dialog[open]")) dialog.close();
  busy(false);
  showLanding(document, true);
  $("landing-status").textContent = "";
  $("landing-error").hidden = true;
  $("resume-model").hidden = !state.view;
  document.title = "Syspresent";
}
async function compile(project, { cacheHash = state.trustedCacheHash, progress = status } = {}) {
  const documents = documentsFor(project), scenes = parseStory(fileText(project, project.manifest.story));
  const m = project.manifest;
  let parsed, exported, roots = m.modelRoots, seeds = m.requirementSeeds, runtimePackage;
  const check = (result) => {
    const errors = (result.diagnostics ?? []).filter((d) => String(d.severity).toLowerCase().includes("error"));
    if (errors.length) throw Error(errors.map((d) => `${d.message} (${d.span?.file ?? "source"}:${d.span?.startLine ?? "?"})`).join("\n"));
    if (!result.modelHash) throw Error("Native engine returned no model identity");
  };
  const index = await verifiedRuntimeIndex(project, { trustedHash: cacheHash, engineVersion: state.engineInfo?.version, engineFingerprint: state.provenance?.assets?.["sysml-wasm.wasm"]?.sha256, documents });
  if (index) {
    roots = index.modelRoots;
    seeds = index.requirementSeeds;
    runtimePackage = index.runtimePackage;
  }
  if (!roots?.length || seeds === void 0 || !runtimePackage) {
    parsed = await state.engine.call("ParseSources", { documents });
    check(parsed);
    exported = await state.engine.call("ExportModel", { modelHash: parsed.modelHash, projection: "declarations" });
    const discovered = discoverNativeIndex(parsed, exported, { modelDocumentCount: m.modelSources.length });
    roots = roots?.length ? roots : discovered.modelRoots;
    seeds ??= discovered.requirementSeeds;
    runtimePackage = "SyspresentRuntimeContext";
    const names = new Set(exported.elements.map((e) => e.qualifiedName));
    while (names.has(runtimePackage)) runtimePackage += "X";
  }
  if (!roots.length) throw Error("No named model declarations were found in the supplied files.");
  progress("Resolving the complete project with OpenSysML WASM\u2026");
  const allDocuments = [...documents, { name: "__syspresent_runtime_context.sysml", content: requirementCoverageSource(roots, runtimePackage, seeds) }];
  parsed = await state.engine.call("ParseSources", { documents: allDocuments });
  check(parsed);
  const cache = await verifiedRuntimeCache(project, { trustedHash: cacheHash, engineVersion: state.engineInfo?.version, engineFingerprint: state.provenance?.assets?.["sysml-wasm.wasm"]?.sha256, documents: allDocuments, modelHash: parsed.modelHash });
  progress("Loading model declarations and requirement relationships\u2026");
  exported = structuredClone(cache?.exported ?? await state.engine.call("ExportModel", { modelHash: parsed.modelHash, projection: "declarations" }));
  if (!Array.isArray(exported.elements)) throw Error("Native model export has no element array");
  if (m.modelRoots?.length) {
    const modelRootIDs = parsed.roots.slice(0, m.modelSources.length).flatMap((r) => r.childIds ?? []), actual = exported.elements.filter((e) => modelRootIDs.includes(e["@id"]) && e.qualifiedName).map((e) => e.qualifiedName);
    const missing = actual.filter((name) => !roots.includes(name));
    if (missing.length) throw Error("Native model roots need rebuilding: " + missing.join(", "));
  }
  const coverage = requireNativeIdentity(adaptNativeView(seeds.length ? cache?.coverage ?? await state.engine.call("RenderView", { modelHash: parsed.modelHash, view: runtimePackage + "::coverage", includeSemanticIdentity: true }) : { kind: "definition", nodes: [], edges: [] }, runtimePackage + "::coverage"));
  exported.elements = exported.elements.filter((e) => e.qualifiedName !== runtimePackage && !e.qualifiedName?.startsWith(runtimePackage + "::"));
  const availableViews = exported.elements.filter((e) => e["@type"] === "ViewUsage" && e.qualifiedName && e["sysx:sourceLine"]).map((e) => e.qualifiedName);
  const needed = /* @__PURE__ */ new Set([...scenes.flatMap((s) => [s.view, ...(s.regions ?? []).map((r) => r.view)]), ...m.entryView ? [m.entryView] : []]), views = /* @__PURE__ */ new Map();
  for (const name of needed) {
    if (!availableViews.includes(name)) throw Error("Native view does not resolve: " + name);
    progress("Preparing " + (scenes.find((s) => s.view === name)?.title || "model view") + "\u2026");
    const raw = cache?.views?.[name] ?? await state.engine.call("RenderView", { modelHash: parsed.modelHash, view: name, includeSemanticIdentity: true });
    const view = requireNativeIdentity(adaptNativeView(raw, name));
    if (!supportsView(view)) throw Error("Unsupported native view kind: " + view.kind);
    views.set(name, view);
  }
  if (!m.systemOfInterest.length) m.systemOfInterest = [...roots];
  const graph = modelGraph(exported.elements, [...views.values(), coverage]);
  for (const root of project.manifest.systemOfInterest) if (!resolveInGraph(graph, root)) throw Error("System of interest does not resolve: " + root);
  const byName = (value) => resolveInGraph(graph, value);
  for (const [sceneIndex, item] of scenes.entries()) {
    resolvePresentation(item.presentation, { resolve: byName });
    if (item.journey?.length && (byName(item.journey.at(-1)) !== byName(item.focus) || sceneIndex > 0 && byName(item.journey[0]) !== byName(scenes[sceneIndex - 1].focus))) throw Error(`Scene ${item.id}: saved journey must connect the previous scene focus to this focus`);
    if (!views.has(item.view)) throw Error(`Scene ${item.id}: native view ${item.view} does not resolve`);
    if (!byName(item.focus)) throw Error(`Scene ${item.id}: focus ${item.focus} does not resolve`);
    for (let i = 1; i < (item.journey ?? []).length; i++) {
      const from = byName(item.journey[i - 1]), to = byName(item.journey[i]);
      if (!from || !to || !findEngineeringRoute(graph, { from, to, maxHops: 1 }).found && !findHierarchyRoute(graph, { from, to, maxHops: 1 }).found) throw Error(`Scene ${item.id}: saved journey has a missing engineering connection`);
    }
  }
  const scoped = graph.elements.filter((e) => project.manifest.systemOfInterest.some((root) => e.qualifiedName === root || e.qualifiedName?.startsWith(root + "::"))).map((e) => e.id);
  for (const item of scenes) for (const region of item.regions ?? []) if (region.focus && !byName(region.focus)) throw Error(`Scene ${item.id}: region ${region.id} focus does not resolve`);
  for (let i = 1; i < scenes.length; i++) {
    const a = scenes[i - 1], b = scenes[i], plan = planTransition({ view: views.get(a.view), focus: byName(a.focus) }, { view: views.get(b.view), focus: byName(b.focus) }, { graph, scopeIds: scoped, journey: b.journey?.map(byName) });
    if (b.journey?.length && !plan.route.found) throw Error(`Scene ${b.id}: saved journey no longer resolves within the presentation boundary`);
    if (plan.mode === "cross-kind" && !plan.route.found) throw Error(`Scene ${b.id}: no engineering route from the previous scene within the presentation boundary`);
  }
  if (m.entryFocus && !byName(m.entryFocus)) throw Error("Starting element does not resolve: " + m.entryFocus);
  return { project, modelHash: parsed.modelHash, exported, graph, views, scenes, coverage, availableViews };
}
var rankingScope;
function prominenceScope() {
  const roots = state.project.manifest.systemOfInterest.map(resolve).filter(Boolean), key2 = JSON.stringify(roots);
  if (rankingScope?.graph !== state.graph || rankingScope.key !== key2) rankingScope = { graph: state.graph, key: key2, ids: nativeScopeIds(state.graph, roots) };
  return rankingScope.ids;
}
function busy(value) {
  $("landing").setAttribute("aria-busy", String(value));
  for (const control of $("landing").querySelectorAll("button:not(#resume-model)")) control.disabled = value;
  $("loading").hidden = !value;
  for (const id of ["previous", "next", "scenes", "standalone", "return", "system-overview", "fit", "show-neighborhood", "zoom-in", "zoom-out", "find-toggle", "edit"]) $(id).disabled = value;
}
async function loadProject(project, { cacheHash = state.trustedCacheHash, loadToken } = {}) {
  const revision = loadToken ?? ++state.loadRevision;
  if (revision !== state.loadRevision) return;
  ++state.revision;
  $("landing-error").hidden = true;
  $("landing-error").textContent = "";
  busy(true);
  status("Parsing project with OpenSysML WASM\u2026");
  $("selection").hidden = true;
  let compiled;
  try {
    await ensureEngine();
    if (revision !== state.loadRevision) return;
    compiled = await compile(validateProject(project), { cacheHash, progress: (text2) => {
      if (revision === state.loadRevision) status(text2);
    } });
  } catch (error) {
    if (revision !== state.loadRevision) return;
    busy(false);
    $("previous").disabled = state.sceneIndex === 0;
    $("next").disabled = state.sceneIndex === state.scenes.length - 1;
    throw error;
  }
  if (revision !== state.loadRevision) return;
  disposeSurfaces();
  Object.assign(state, compiled, { sceneIndex: 0, selected: null, selectedIds: [], exploring: false, expanded: /* @__PURE__ */ new Set(), collapsed: /* @__PURE__ */ new Set(), rects: /* @__PURE__ */ new Map(), view: null, displayed: null, history: [], future: [], traceRequest: null, traceInfo: null, presentation: {}, extraViews: /* @__PURE__ */ new Map(), neighborhoodBudget: null, surfaceStates: {}, comparison: null, activeRegion: "primary" });
  state.trustedCacheHash = cacheHash ?? null;
  showLanding(document, false);
  document.title = project.manifest.title + " \xB7 Syspresent";
  $("resume-model").hidden = false;
  busy(false);
  updateLists();
  $("editor-error").textContent = "";
  $("project-menu").open = false;
  if (state.scenes.length) await showScene(0, false);
  else if (project.manifest.entryView || project.manifest.entryFocus) {
    state.focus = resolve(project.manifest.entryFocus ?? project.manifest.systemOfInterest[0]);
    const entry = state.views.get(project.manifest.entryView);
    if (entry) await openExploration(entry, state.focus, { record: false });
    else await explore(state.focus);
  } else await openSystemOverview({ record: false });
  status(`OpenSysML WASM \xB7 ${state.graph.elements.length} native elements \xB7 ${state.availableViews.length} views`);
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
  for (const name of state.availableViews) {
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
function panelGeometry(view = state.view) {
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
    panel.style.maxHeight = (narrow ? Math.max(140, Math.min(height * (height < 560 && (view?.nodes.length ?? 0) > 3 ? 0.3 : 0.42), height - 260)) : Math.max(140, height * 0.25)) + "px";
  } else {
    panel.style.top = "16px";
    panel.style[placement === "left" ? "left" : "right"] = "16px";
    panel.style.maxHeight = Math.max(140, height - 90) + "px";
  }
  const a = panel.getBoundingClientRect(), b = stage.getBoundingClientRect();
  return [{ id: "narrative", x: a.x - b.x, y: a.y - b.y, width: a.width, height: a.height }];
}
function sizeView(view, focus, { compact = false } = {}) {
  return { ...view, nodes: view.nodes.map((n) => {
    const preferences = displayPreferences(), expanded = compartmentVisible(n, { mode: state.reader.compartments, focus, expanded: state.expanded, collapsed: state.collapsed }), documentation = documentationFor(state.graph, n.semanticId);
    const detail = [...new Set([behaviorNodeDetail(n), ...expanded ? [documentation.text || n.detail] : []].filter(Boolean))].join("\n");
    const attribution = detail && documentation.text && documentation.source?.id !== n.semanticId ? `Statement from ${documentation.source.qualifiedName || documentation.source.name}
` : "";
    const displayDetail = attribution + detail;
    const displayID = element(n.semanticId)?.native?.declaredShortName || documentation.source?.native?.declaredShortName || "";
    const measured = ["initial", "final", "fork", "join", "decision", "merge", "port"].includes(n.kind) && !n.overviewLabel ? {} : measureCard(document, { ...n, displayID }, displayDetail);
    return { ...n, ...measured, layoutGroup: preferences.grouping === "owner" ? element(n.semanticId)?.native?.owner?.["@id"] ?? "" : "", displayDetail, displayID: element(n.semanticId)?.native?.declaredShortName || documentation.source?.native?.declaredShortName || "" };
  }) };
}
function cancelAnimations() {
  state.motion?.cancel();
  state.motion = null;
  for (const a of state.animations) a.cancel();
  state.animations = [];
}
function svgel(name, attrs = {}) {
  const e = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}
var nodeKey = (node, counts, view) => {
  const base = node.kind === "context-boundary" ? "boundary:" + node.id : node.semanticId ? "semantic:" + node.semanticId : "notation:" + view.id + ":" + node.id;
  const count = counts.get(base) ?? 0;
  counts.set(base, count + 1);
  return base + ":" + count;
};
function labelSize(text2) {
  const span = el("span", text2);
  span.style.cssText = "position:fixed;visibility:hidden;left:-10000px;white-space:pre;font:12px system-ui,sans-serif";
  document.body.append(span);
  const rect = span.getBoundingClientRect();
  span.remove();
  return { width: Math.ceil(rect.width) + 4, height: 16 };
}
async function prepareFrame(view, focus, panels, { journey = false } = {}) {
  const stage = $("stage"), area = primaryArea(view, panels, journey);
  const layoutFor = (compact) => layoutDiagram(sizeView(view, focus, { compact }), { width: area.width, height: area.height, elk: state.layoutEngine, measureLabel: labelSize, grouping: displayPreferences().grouping });
  let layout = await layoutFor(false), fitted = fitDiagram(layout, area);
  const active2 = fitted.nodes.map((n) => ({ ...n, scale: fitted.scale, opacity: 1, context: false }));
  const routed = fitted.edges;
  const labelObstacles = [...routed.filter((e) => e.labelBox).map((e, i) => ({ ...e.labelBox, id: "label-obstacle:" + i })), ...active2.flatMap((n) => n.portLabelBox ? [{ ...n.portLabelBox, id: "port-label:" + n.id }] : [])];
  const routeObstacles = routed.flatMap((e) => e.points.slice(1).map((p, i) => ({ id: "route:" + e.id + ":" + i, x: Math.min(p.x, e.points[i].x) - 3, y: Math.min(p.y, e.points[i].y) - 3, width: Math.max(6, Math.abs(p.x - e.points[i].x) + 6), height: Math.max(6, Math.abs(p.y - e.points[i].y) + 6) })));
  const budget = state.neighborhoodBudget ?? displayPreferences().contextBudget, context = view.overview && !journey ? { view: { nodes: [], edges: [] }, elements: [], omissions: [] } : surroundingContext(state.graph, layout, { budget: journey ? Math.min(8, budget) : budget, focus, prominenceScopeIds: prominenceScope() });
  context.view.nodes = context.view.nodes.map((node) => ({ ...node, ...measureCard(document, node, "") }));
  const fringe = prepareNeighborhood(context, active2, area, { width: 160, height: 80, gap: 72, activeEdges: routed, labelObstacles, obstacles: [...labelObstacles, ...routeObstacles], measureLabel: labelSize });
  const ghosts = fringe.nodes.map((n) => ({ ...n, scale: 1, opacity: 0.3, context: true, displayDetail: "", displayID: "" }));
  const markers = fringe.boundaryMarkers.map((n) => ({ ...n, scale: 1, opacity: 0.22, context: true, interactive: false }));
  const nodes = [...active2, ...ghosts, ...markers], counts = /* @__PURE__ */ new Map(), byID = /* @__PURE__ */ new Map();
  for (const n of nodes) {
    n.key = nodeKey(n, counts, view);
    n.container = active2.some((c) => c.parentId === n.id);
    byID.set(n.id, n);
  }
  const peripheral = fringe.routedEdges;
  const edgeCounts = /* @__PURE__ */ new Map(), edges = [...routed, ...peripheral].map((e) => {
    const a = byID.get(e.sourceAttachment ?? e.source), b = byID.get(e.targetAttachment ?? e.target), ownerA = byID.get(e.source), ownerB = byID.get(e.target), base = [a?.semanticId || a?.key, b?.semanticId || b?.key, e.kind, e.label || ""].join("|"), ordinal = edgeCounts.get(base) ?? 0;
    edgeCounts.set(base, ordinal + 1);
    return { ...e, journey: journey && !e.context, sourceClipped: a?.kind === "context-boundary", targetClipped: b?.kind === "context-boundary", key: base + ":" + ordinal, sourceKey: a?.key, targetKey: b?.key, sourceSemantic: a?.semanticId || ownerA?.semanticId, targetSemantic: b?.semanticId || ownerB?.semanticId, opacity: e.context ? 0.18 : !journey && displayPreferences().emphasis.length && !displayPreferences().emphasis.includes(e.kind) ? 0.28 : 1, routePoints: e.points, points: samplePolyline(e.points.length ? e.points : [{ x: 0, y: 0 }, { x: 0, y: 0 }]) };
  });
  const notationNotices = layout.edges.map((e) => ({ e, appearance: edgeAppearance(e, { viewKind: view.kind }) })).filter((p) => !p.appearance.supported).map((p) => ({ reason: "unsupported-notation", target: p.e.target, relationshipId: p.e.id, message: p.appearance.notice }));
  const omissions = [...layout.omissions ?? view.omissions ?? [], ...(view.notices ?? []).map((message) => ({ reason: "native-view", message: typeof message === "string" ? message : JSON.stringify(message) })), ...notationNotices, ...fringe.omissions, ...fringe.notices, ...routed.filter((e) => e.labelOmitted || e.routingBlocked).map((e) => ({ reason: e.labelOmitted ? "label-space" : "route-space", target: e.semanticTarget || e.target, relationshipId: e.semanticId || e.id }))];
  return { view, focus, journey, nodes, edges, area, width: stage.clientWidth, height: stage.clientHeight, panels, scale: fitted.scale, layout, omissions, routingMetrics: fringe.routingMetrics, worldBounds: fringe.worldBounds, neighborhood: { shown: context.elements.length, total: context.elements.length + new Set(context.omissions.filter((o) => o.reason === "budget").map((o) => o.target)).size, budget } };
}
function face(n) {
  const behavior = behaviorFace(document, n);
  if (behavior) {
    if (n.overviewLabel) behavior.append(el("span", n.overviewLabel, "prominence"));
    return behavior;
  }
  const host = el("span", void 0, "node-face");
  if (n.kind === "port" && !n.overviewLabel) {
    const text2 = n.label ?? n.name ?? "";
    if (text2) host.append(el("span", text2, "port-name"));
    return host;
  }
  const short = (n.name?.split("::").at(-1) || n.kind).replace(/([a-z0-9])([A-Z])/g, "$1\u200B$2");
  host.append(el("span", `\xAB${n.kind}\xBB${n.displayID ? " " + n.displayID : ""}${n.type ? " : " + n.type : ""}`, "kind"), el("span", short, "name"));
  if (n.displayDetail) host.append(el("span", n.displayDetail, "detail"));
  if (n.overviewLabel) host.append(el("span", n.overviewLabel, "prominence"));
  return host;
}
function visualNode(n) {
  if (n.kind === "context-boundary") {
    const marker = el("span", void 0, "node context-boundary");
    marker.title = "Additional model context: " + (n.name || n.semanticId);
    marker.setAttribute("role", "img");
    marker.setAttribute("aria-label", marker.title);
    marker.dataset.context = "true";
    const glyph = el("span", "\u203A", "continuation-glyph");
    glyph.style.transform = `rotate(${{ EAST: 0, SOUTH: 90, WEST: 180, NORTH: 270 }[n.continuationDirection] ?? 0}deg)`;
    marker.append(glyph);
    return marker;
  }
  const node = el("button", void 0, `node ${n.kind}${n.overviewLabel ? " overview-card" : ""}${n.container ? " container" : ""}${n.context ? " peripheral" : ""}${n.semanticId && n.semanticId === state.selected ? " selected" : ""}`);
  node.type = "button";
  node.dataset.representation = n.id;
  if (n.semanticId) node.dataset.semanticId = n.semanticId;
  node.dataset.context = String(!!n.context);
  node.setAttribute("aria-label", `${n.name || n.kind}: select ${n.kind}${n.context ? " (surrounding context)" : ""}`);
  node.style.zIndex = String(n.context ? 0 : n.container ? 1 : 3);
  node.append(face(n));
  node.onclick = (event) => {
    event.stopPropagation();
    select(n.semanticId, n);
  };
  node.oncontextmenu = (event) => {
    event.preventDefault();
    select(n.semanticId, n);
  };
  return node;
}
var rectValues = (n) => ({ x: n.x, y: n.y, width: n.width, height: n.height, scale: n.scale ?? 1, opacity: n.opacity ?? 1, context: n.context ? 1 : 0 });
function presenceTrack(frames, key2, collection) {
  return frames.map((f, index) => {
    const item = f[collection].find((n) => n.key === key2);
    if (item) return item;
    let nearest;
    for (let distance3 = 1; distance3 < frames.length && !nearest; distance3++) nearest = frames[index - distance3]?.[collection].find((n) => n.key === key2) ?? frames[index + distance3]?.[collection].find((n) => n.key === key2);
    return { ...nearest, opacity: 0 };
  });
}
function applyCamera(value) {
  state.camera = createCamera(value);
  const c = state.camera;
  $("graph-world").style.transform = `translate(${c.x}px,${c.y}px) scale(${c.scale})`;
}
function cameraCenter() {
  const a = state.visualSnapshot?.area ?? graphArea($("stage").clientWidth, $("stage").clientHeight);
  return { x: a.x + a.width / 2, y: a.y + a.height / 2 };
}
function takeCameraControl() {
  ++state.cameraRevision;
  state.motion?.finish();
}
function zoomBy(factor) {
  takeCameraControl();
  applyCamera(zoomCameraAt(state.camera, cameraCenter(), factor));
}
function fitNeighborhood() {
  takeCameraControl();
  const f = state.visualSnapshot;
  if (f?.worldBounds) applyCamera(fitCameraToBounds(f.worldBounds, f.area, 20));
  $("camera-menu").open = false;
}
async function resetCamera() {
  ++state.cameraRevision;
  if (state.transitioning && state.pendingDestination) await frame(state.view);
  else state.motion?.finish();
  applyCamera(createCamera());
  $("camera-menu").open = false;
}
async function moreNeighbors() {
  if (!state.view) return;
  remember();
  state.neighborhoodBudget = Math.min(256, (state.neighborhoodBudget ?? displayPreferences().contextBudget) + 48);
  await frame(state.view);
  $("camera-menu").open = false;
}
async function paintFrames(frames, { duration = 0, caption = "", outgoingPanel, cameraTarget = state.camera } = {}) {
  const cameraFrom = { ...state.camera }, cameraTo = createCamera(cameraTarget);
  clearTrace();
  cancelAnimations();
  const destination = frames.at(-1), svg = $("connections"), host = $("nodes"), stage = $("stage");
  svg.replaceChildren();
  host.replaceChildren();
  svg.setAttribute("viewBox", `0 0 ${stage.clientWidth} ${stage.clientHeight}`);
  const defs = svgel("defs");
  for (const name of ["open-arrow", "filled-arrow", "hollow-triangle", "diamond", "hollow-diamond", "containment"]) {
    const { path, fill, ...attrs } = markerDefinition(name), marker = svgel("marker", { id: "edge-" + name, ...attrs, markerUnits: "userSpaceOnUse" });
    marker.append(svgel("path", { d: path, fill: fill === "line" ? "#426869" : fill === "background" ? "#f5f7f7" : "none", stroke: "#426869", "stroke-width": 1.2 }));
    defs.append(marker);
  }
  svg.append(defs);
  const offsets = frames.length === 5 ? [0, 0.18, 0.5, 0.74, 1] : frames.map((_, i) => i / (frames.length - 1 || 1));
  const cameraTrack = journeyCameraTrack(frames, { initialCamera: cameraFrom, finalCamera: cameraTo, offsets });
  const departurePlan = planDepartures(frames, { width: stage.clientWidth, height: stage.clientHeight, panels: destination.panels ?? [], offsets });
  stage.dataset.departureCount = String(departurePlan.departures.length);
  const nodeKeys = visibleTrackKeys(frames, "nodes"), edgeKeys = visibleTrackKeys(frames, "edges").sort((a2, b) => {
    const edge = (key2) => destination.edges.find((e) => e.key === key2) ?? frames.flatMap((f) => f.edges).find((e) => e.key === key2);
    return Number(!!edge(b)?.context) - Number(!!edge(a2)?.context);
  });
  const nodeTracks = nodeKeys.map((key2) => {
    const track = presenceTrack(frames, key2, "nodes"), latest = destination.nodes.find((n) => n.key === key2) ?? track.filter((n) => n.opacity > 0).at(-1), node = visualNode(latest);
    host.append(node);
    const first = track.find((n) => n.opacity > 0), oldFace = latest.kind !== "context-boundary" && first && JSON.stringify([first.kind, first.displayDetail, first.type, first.container, first.overviewLabel]) !== JSON.stringify([latest.kind, latest.displayDetail, latest.type, latest.container, latest.overviewLabel]) ? face(first) : null;
    if (oldFace) {
      oldFace.classList.add("old-face");
      oldFace.setAttribute("aria-hidden", "true");
      node.append(oldFace);
    }
    return { key: key2, node, latest, oldFace, newFace: node.firstChild, track: track.map(rectValues) };
  });
  const edgeTracks = edgeKeys.map((key2) => {
    const track = presenceTrack(frames, key2, "edges"), latest = destination.edges.find((e) => e.key === key2) ?? track.filter((e) => e.opacity > 0).at(-1), appearance = edgeAppearance(latest, { viewKind: destination.view.kind });
    const group = svgel("g", { "data-relationship": latest.semanticId || latest.id, "data-context": String(!!latest.context), "data-source": latest.sourceSemantic || "", "data-target": latest.targetSemantic || "", role: "button", tabindex: 0, "aria-label": `${latest.label || latest.kind}: ${label(latest.sourceSemantic)} to ${label(latest.targetSemantic)}`, "data-kind": latest.kind });
    const line2 = svgel("path", { class: "edge-line", fill: "none", stroke: "#426869", "stroke-width": latest.context ? 1.1 : 1.5 });
    for (const [side, marker] of [["start", appearance.sourceMarker], ["end", appearance.targetMarker]]) if (marker !== "none" && !(side === "start" ? latest.sourceClipped : latest.targetClipped)) line2.setAttribute("marker-" + side, "url(#edge-" + marker + ")");
    if (appearance.line === "dashed") line2.setAttribute("stroke-dasharray", "5 3");
    const oldLine = line2.cloneNode();
    oldLine.classList.add("edge-outgoing");
    oldLine.style.opacity = 0;
    const hit = svgel("path", { class: "edge-hit", fill: "none", stroke: "transparent", "stroke-width": latest.context ? 8 : 18, "pointer-events": "stroke" });
    group.append(hit, oldLine, line2);
    const title = svgel("title");
    title.textContent = latest.label || latest.kind;
    group.append(title);
    let text2;
    if (latest.label && !latest.labelOmitted) {
      text2 = svgel("text", { "font-size": 12 * (latest.labelScale ?? 1), "font-family": "system-ui, sans-serif", fill: "#355e60", "paint-order": "stroke", stroke: "#f5f7f7", "stroke-width": 4, "text-anchor": "start" });
      text2.textContent = latest.label;
      group.append(text2);
    }
    group.onclick = (event) => {
      event.stopPropagation();
      traceEdge(latest, key2);
    };
    group.onkeydown = (event) => {
      if (["Enter", " "].includes(event.key)) {
        event.preventDefault();
        traceEdge(latest, key2);
      }
    };
    svg.append(group);
    const numeric = track.map((e) => {
      const r = { opacity: e.opacity ?? 1, x: e.x ?? 0, y: e.y ?? 0, labelOpacity: e.label && !e.labelOmitted ? 1 : 0, journey: e.journey ? 1 : 0, context: e.context ? 1 : 0 };
      for (const [i, p] of e.points.entries()) {
        r["x" + i] = p.x;
        r["y" + i] = p.y;
      }
      return r;
    });
    return { key: key2, group, line: line2, oldLine, hit, text: text2, latest, track: numeric };
  });
  const draw = (progress, clock) => {
    const contextFade = duration ? Math.max(0, 1 - clock / 0.16, (clock - 0.84) / 0.16) : 1;
    applyCamera(cameraTrack.sample(progress));
    const nodes = [], edges = [];
    for (const item of nodeTracks) {
      const r = departurePlan.sampleNode(item.key, progress, (p) => sampleTrack(item.track, offsets, p)), n = item.node;
      if (r.context > 0.5) r.opacity *= contextFade;
      n.classList.toggle("peripheral", r.context > 0.5);
      n.dataset.context = String(r.context > 0.5);
      n.style.width = r.width / (r.scale || 1) + "px";
      n.style.height = r.height / (r.scale || 1) + "px";
      n.style.transform = `translate(${r.x}px,${r.y}px) scale(${r.scale})`;
      n.style.opacity = r.opacity;
      n.style.pointerEvents = item.latest.interactive !== false && r.opacity > 0.12 ? "auto" : "none";
      n.setAttribute("aria-hidden", String(r.opacity < 0.05));
      if (item.latest.portLabelBox) {
        const label2 = n.querySelector(".port-name"), box = item.latest.portLabelBox;
        if (label2) {
          label2.style.left = (box.x - item.latest.x) / (item.latest.scale || 1) + "px";
          label2.style.top = (box.y - item.latest.y) / (item.latest.scale || 1) + "px";
          label2.style.width = box.width / (item.latest.scale || 1) + "px";
          label2.style.height = box.height / (item.latest.scale || 1) + "px";
        }
      }
      if (item.oldFace) {
        const fade = Math.max(0, Math.min(1, (progress - 0.25) / 0.5));
        item.oldFace.style.opacity = 1 - fade;
        item.newFace.style.opacity = fade;
      }
      nodes.push({ ...item.latest, ...r, context: r.context > 0.5 });
    }
    const currentNodes = nodes.map((n) => ({ ...n, id: n.key, parentId: n.parentId ? nodes.find((p) => p.id === n.parentId)?.key : void 0 }));
    const sampledEdges = edgeTracks.map((item) => ({ item, r: sampleTrack(item.track, offsets, progress) })), journeySizes = /* @__PURE__ */ new Map();
    const liveEdges = sampledEdges.filter(({ r }) => clock !== 1 && r.journey > 0.5 && r.opacity > 0.01).map(({ item }) => {
      const text2 = item.latest.label ?? "", box = item.latest.labelBox ?? { width: Math.max(16, text2.length * 7), height: 16 }, old = journeySizes.get(text2);
      journeySizes.set(text2, { width: Math.max(old?.width ?? 0, box.width), height: Math.max(old?.height ?? 0, box.height) });
      return { ...item.latest, id: item.key, source: item.latest.sourceKey, target: item.latest.targetKey, label: text2 };
    });
    const liveRoutes = new Map(routeEdges(liveEdges, currentNodes, { area: destination.area, measureLabel: (text2) => journeySizes.get(text2) }).map((route2) => [route2.id, route2]));
    const shapeFor = ({ item, r }) => {
      if (r.context > 0.5 && r.journey < 0.5 && contextFade < 0.01) return { points: [], edge: { ...item.latest, id: item.key, source: item.latest.sourceKey, target: item.latest.targetKey }, journeyEdge: false };
      const interpolated = Array.from({ length: 20 }, (_, i) => ({ x: r["x" + i], y: r["y" + i] }));
      const edge = { ...item.latest, id: item.key, source: item.latest.sourceKey, target: item.latest.targetKey, context: r.context > 0.5 && r.journey < 0.5 };
      let points = clock === 1 ? item.latest.routePoints ?? [] : interpolated, liveLabel;
      const journeyEdge = clock !== 1 && r.journey > 0.5;
      if (journeyEdge) {
        const live = liveRoutes.get(item.key);
        points = live?.points ?? [];
        if (live?.labelBox && !live.labelLeader && ![...liveRoutes.values()].some((other) => other.points.length > 1 && !routeIsClear(other.points, other, currentNodes.concat([{ ...live.labelBox, id: "journey-label:" + item.key }]), { orthogonalOnly: true }))) liveLabel = live;
      }
      if (!journeyEdge && clock !== 1 && (!routeIsClear(points, edge, currentNodes, { orthogonalOnly: true }) || !routeConnectsEndpoints(points, edge, currentNodes))) {
        points = routeEdges([{ ...edge, label: "" }], currentNodes)[0]?.points ?? [];
      }
      if (!routeIsClear(points, edge, currentNodes) || !routeConnectsEndpoints(points, edge, currentNodes)) points = [];
      return { points, edge, journeyEdge, liveLabel };
    };
    const shapes = new Map(sampledEdges.map((sample) => [sample.item.key, shapeFor(sample)]));
    const visibleNodes = currentNodes.filter((n) => (n.opacity ?? 1) > 0.08), visibleIDs = new Set(visibleNodes.map((n) => n.id));
    const currentActive = sampledEdges.filter(({ item, r }) => (r.context < 0.5 || r.journey > 0.5) && r.opacity > 0.01).map(({ item, r }) => {
      const shape = shapes.get(item.key), box = shape.liveLabel?.labelBox ?? item.latest.labelBox;
      const labelBox = shape.liveLabel?.labelBox ?? (box && (clock === 1 || clock > 0.85) ? { ...box, x: r.x, y: r.y - box.height * 0.78 } : void 0);
      return { ...shape.edge, points: shape.points, ...labelBox ? { labelBox } : {} };
    }).filter((edge) => edge.points.length > 1 && visibleIDs.has(edge.source) && visibleIDs.has(edge.target));
    if (clock > 0 && clock < 1 && contextFade > 0.01) {
      const contextSizes = /* @__PURE__ */ new Map(), movingContext = sampledEdges.filter(({ item, r }) => r.context > 0.5 && r.journey < 0.5 && r.opacity > 0.01).map(({ item }) => {
        const shape = shapes.get(item.key), text2 = item.latest.label ?? "", box = item.latest.labelBox ?? { width: Math.max(16, text2.length * 7), height: 16 }, old = contextSizes.get(text2);
        contextSizes.set(text2, { width: Math.max(old?.width ?? 0, box.width), height: Math.max(old?.height ?? 0, box.height) });
        return { ...shape.edge, points: shape.points };
      }).filter((edge) => visibleIDs.has(edge.source) && visibleIDs.has(edge.target));
      const before = peripheralRoutingMetrics(movingContext, currentActive);
      if (before.crossings || before.overlapLength || before.blocked) {
        const optimized = routePeripheralEdges(movingContext, visibleNodes, destination.area, { activeEdges: currentActive, measureLabel: (text2) => contextSizes.get(text2), candidateBudget: 4, reverse: false, visibilitySearches: 0 });
        if (peripheralRouteScore(optimized.metrics) < peripheralRouteScore(before)) for (const route2 of optimized.edges) {
          const shape = shapes.get(route2.id);
          shape.points = route2.points;
          shape.liveLabel = route2.labelBox ? route2 : void 0;
        }
      }
    }
    const currentContext = sampledEdges.filter(({ item, r }) => r.context > 0.5 && r.journey < 0.5 && r.opacity > 0.01).map(({ item }) => {
      const shape = shapes.get(item.key);
      return { ...shape.edge, points: shape.points };
    });
    const visibleLabels = [...currentActive.flatMap((edge) => edge.labelBox ? [edge.labelBox] : []), ...sampledEdges.filter(({ item, r }) => r.context > 0.5 && r.journey < 0.5 && clock > 0.85 && r.labelOpacity > 0.05).flatMap(({ item, r }) => {
      const box = shapes.get(item.key).liveLabel?.labelBox ?? item.latest.labelBox;
      return box ? [{ ...box, x: shapes.get(item.key).liveLabel?.x ?? r.x, y: (shapes.get(item.key).liveLabel?.y ?? r.y) - box.height * 0.78, id: "live-label:" + item.key }] : [];
    })];
    for (const { item, r } of sampledEdges) {
      const { points, edge, journeyEdge, liveLabel } = shapes.get(item.key);
      const pathOf = (path2) => connectionPath(path2, { style: state.reader.routing, edge, nodes: currentNodes.concat(visibleLabels) }), signature = points.slice(1).map((p, i) => Math.abs(p.x - points[i].x) < 0.01 ? "V" : "H").filter((v, i, a2) => !i || v !== a2[i - 1]).join("");
      if (clock !== 1 && item.signature && signature !== item.signature) {
        item.outgoingPoints = item.drawnPoints;
        item.routeChangedAt = clock;
      }
      const routeFade = clock === 1 ? 1 : Math.min(1, Math.max(0, (clock - (item.routeChangedAt ?? -1)) * duration / 140));
      let outgoing = item.outgoingPoints?.map((p) => ({ ...p }));
      if (outgoing?.length > 1 && points.length > 1) {
        const first = outgoing[0], second = outgoing[1], last = outgoing.at(-1), penultimate = outgoing.at(-2), horizontalFirst = Math.abs(first.y - second.y) < 0.01, horizontalLast = Math.abs(last.y - penultimate.y) < 0.01;
        outgoing[0] = { ...points[0] };
        outgoing[outgoing.length - 1] = { ...points.at(-1) };
        if (horizontalFirst) second.y = points[0].y;
        else second.x = points[0].x;
        if (horizontalLast) penultimate.y = points.at(-1).y;
        else penultimate.x = points.at(-1).x;
      }
      const protectedPaths = [...currentActive, ...currentContext.filter((other) => other.id !== edge.id)];
      const oldClear = outgoing && routeIsClear(outgoing, edge, currentNodes.concat(visibleLabels), { orthogonalOnly: true }) && routeConnectsEndpoints(outgoing, edge, currentNodes) && (!edge.context || peripheralRouteScore(peripheralRoutingMetrics([{ ...edge, points: outgoing }], protectedPaths)) <= peripheralRouteScore(peripheralRoutingMetrics([{ ...edge, points }], protectedPaths)));
      item.oldLine.setAttribute("d", oldClear ? pathOf(outgoing) : "");
      item.oldLine.style.opacity = oldClear ? 1 - routeFade : 0;
      const path = pathOf(points);
      item.line.setAttribute("d", path);
      item.line.style.opacity = routeFade;
      item.hit.setAttribute("d", path);
      item.signature = signature;
      item.drawnPoints = points;
      const traveling = duration && clock > 0 && clock < 1, emphasis = traveling && !journeyEdge ? 0.2 + 0.8 * Math.abs(Math.cos(Math.PI * clock)) : 1;
      const endpoints2 = [currentNodes.find((n) => n.id === edge.source), currentNodes.find((n) => n.id === edge.target)], presence = Math.min(1, ...endpoints2.map((n) => n ? (n.opacity ?? 1) / (n.context ? 0.3 : 1) : 0));
      const effectiveOpacity = points.length ? r.opacity * emphasis * presence * (edge.context ? contextFade : 1) : 0;
      item.group.style.opacity = effectiveOpacity;
      item.group.style.pointerEvents = effectiveOpacity > 0.1 ? "auto" : "none";
      item.group.setAttribute("aria-hidden", String(effectiveOpacity < 0.05));
      item.group.setAttribute("tabindex", effectiveOpacity > 0.1 ? "0" : "-1");
      if (item.text) {
        item.text.setAttribute("x", liveLabel?.x ?? r.x);
        item.text.setAttribute("y", liveLabel?.y ?? r.y);
        item.text.style.opacity = journeyEdge ? liveLabel ? r.labelOpacity * routeFade : 0 : traveling ? Math.max(0, (clock - 0.85) / 0.15) : r.labelOpacity;
      }
      edges.push({ ...item.latest, points, opacity: effectiveOpacity, x: r.x, y: r.y });
    }
    if (outgoingPanel) outgoingPanel.style.opacity = Math.max(0, 1 - clock * 3);
    $("narrative").style.opacity = duration ? Math.min(1, clock * 2) : 1;
    stage.dataset.motionProgress = String(clock);
    state.visualSnapshot = { ...destination, nodes, edges };
  };
  const a = destination.area;
  $("graph-viewport").style.clipPath = `inset(${a.y}px ${Math.max(0, stage.clientWidth - a.x - a.width)}px ${Math.max(0, stage.clientHeight - a.y - a.height)}px ${a.x}px)`;
  const neighborhood = destination.neighborhood;
  $("more-neighbors").hidden = !neighborhood || neighborhood.shown >= neighborhood.total;
  $("more-neighbors").disabled = (neighborhood?.budget ?? 0) >= 256;
  $("more-neighbors").textContent = neighborhood ? `More neighbors (${neighborhood.shown} of ${neighborhood.total})` : "More neighbors";
  const omissions = destination.omissions;
  $("transition").dataset.notice = String(!!caption);
  $("context-details").hidden = !destination.view.overview && !omissions.length && !neighborhood?.shown;
  $("context-details").textContent = destination.view.overview ? "Overview selection" : neighborhood?.shown ? `Neighbors (${neighborhood.shown})` : "Context limits";
  $("transition").textContent = caption || `${destination.view.kind} \xB7 ${destination.view.nodes.length} active elements`;
  const motion = startTimeline({ duration: state.reduce ? 0 : duration, update: draw });
  state.motion = motion;
  const result = await motion.finished;
  if (!result.cancelled) {
    state.visualSnapshot = destination;
    for (const item of nodeTracks) {
      if (!destination.nodes.some((n) => n.key === item.key)) item.node.remove();
      else {
        item.oldFace?.remove();
        if (item.newFace?.style) item.newFace.style.opacity = 1;
      }
    }
    for (const item of edgeTracks) if (!destination.edges.some((e) => e.key === item.key)) item.group.remove();
    state.layout = { ...destination.layout, displayNodes: destination.nodes.filter((n) => !n.context), scale: destination.scale, area: destination.area };
    state.displayed = destination.view;
    state.displayOmissions = omissions;
    delete stage.dataset.motionProgress;
  }
  outgoingPanel?.remove();
  if (state.motion === motion) state.motion = null;
  return result;
}
async function frame(view, caption = "", duration = 0, focus = state.focus) {
  if (state.transitioning && state.pendingDestination) {
    const pending = state.pendingDestination;
    return transitionTo(pending.view, pending.focus, { animate: false, allowDisconnected: true, journey: pending.journey, camera: pending.cameraRevision === state.cameraRevision ? pending.camera : state.camera });
  }
  const revision = ++state.revision;
  saveSurfaces();
  disposeSurfaces();
  const panels = panelGeometry(view);
  if (rendererFamily(view) !== "graph") {
    await renderSurfaces(view, focus, panels, revision);
    return;
  }
  const destination = await prepareFrame(view, focus, panels), previous = state.visualSnapshot;
  if (revision !== state.revision) return;
  const result = await paintFrames(duration && previous ? [previous, destination] : [destination], { duration, caption });
  if (!result?.cancelled && revision === state.revision) await renderSurfaces(view, focus, panels, revision);
  return result;
}
function sceneRegions(view = state.view) {
  const regions = [{ id: "primary", view, focus: state.focus, title: view?.title || "Primary view" }];
  if (!state.exploring) for (const r of scene()?.regions ?? []) regions.push({ ...r, view: state.views.get(r.view), focus: resolve(r.focus ?? scene().focus) });
  if (state.comparison) regions.push({ ...state.comparison, id: "comparison" });
  return regions.filter((r) => r.view);
}
function primaryArea(view, panels, journey = false) {
  const area = graphArea($("stage").clientWidth, $("stage").clientHeight, panels);
  return journey ? area : regionAreas(area, sceneRegions(view), state.activeRegion)[0].area;
}
function saveSurfaces() {
  for (const s of state.surfaces) state.surfaceStates[s.key] = s.controller.getState();
}
function disposeSurfaces() {
  for (const s of state.surfaces) s.controller.destroy();
  state.surfaces = [];
  $("view-regions").replaceChildren();
  $("region-tabs").replaceChildren();
  $("graph-viewport").hidden = false;
}
function surfaceAnchorSnapshot() {
  const primary = state.surfaces.find((s) => s.id === "primary");
  if (!primary) return;
  const area = primary.area, anchors = primary.controller.anchors().filter((a) => a.width > 0 && a.height > 0 && a.x + a.width > 0 && a.y + a.height > 0 && a.x < area.width && a.y < area.height).slice(0, 24), counts = /* @__PURE__ */ new Map();
  const nodes = anchors.map((a) => {
    const node = { id: a.representationId, semanticId: a.semanticId, name: label(a.semanticId), kind: "element", x: area.x + a.x, y: area.y + a.y, width: a.width, height: a.height, scale: 1, opacity: 1, context: false };
    return { ...node, key: nodeKey(node, counts, state.view) };
  });
  state.visualSnapshot = { view: state.view, focus: state.focus, nodes, edges: [], area, panels: [], width: $("stage").clientWidth, height: $("stage").clientHeight, omissions: [], layout: { nodes, edges: [] }, scale: 1 };
}
function destinationAnchors(view, focus, panels, base) {
  const family = rendererFamily(view);
  if (family === "graph") return null;
  const area = primaryArea(view, panels), host = el("section", void 0, "view-region"), key2 = "primary:" + view.id;
  host.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;left:${area.x}px;top:${area.y}px;width:${area.width}px;height:${area.height}px`;
  $("stage").append(host);
  const options = { state: structuredClone(state.surfaceStates[key2] ?? {}), selectedId: state.selected, selectedIds: state.selectedIds, labelFor: label }, controller = family === "grid" ? mountGrid(host, view, options) : mountSequence(host, view, options);
  try {
    const anchors = controller.anchors(), counts = /* @__PURE__ */ new Map(), wanted = /* @__PURE__ */ new Set();
    const nodes = anchors.filter((a) => a.width > 0 && a.height > 0 && element(a.semanticId) && !wanted.has(a.semanticId) && (wanted.add(a.semanticId), true)).slice(0, 24).map((a) => {
      const node = { id: a.representationId, semanticId: a.semanticId, kind: "element", name: label(a.semanticId), x: area.x + a.x, y: area.y + a.y, width: a.width, height: a.height, scale: 1, opacity: 1, context: false };
      return { ...node, key: nodeKey(node, counts, view) };
    });
    return nodes.length ? { ...base, view, focus, nodes, edges: [], area, layout: { nodes, edges: [] }, worldBounds: void 0, neighborhood: null, omissions: [] } : null;
  } finally {
    controller.destroy();
    host.remove();
  }
}
async function renderSurfaces(view, focus, panels, revision) {
  const area = graphArea($("stage").clientWidth, $("stage").clientHeight, panels), regions = regionAreas(area, sceneRegions(view), state.activeRegion), primary = regions[0];
  $("graph-viewport").hidden = rendererFamily(view) !== "graph" || !primary.visible;
  const grid = rendererFamily(view) !== "graph";
  for (const id of ["fit", "show-neighborhood", "zoom-in", "zoom-out", "more-neighbors"]) $(id).disabled = grid || !primary.visible || id === "more-neighbors" && !!view.overview;
  $("region-tabs").replaceChildren();
  $("region-tabs").hidden = regions.length < 2;
  $("region-tabs").style.cssText = `left:${area.x}px;top:${area.y}px;width:${area.width}px`;
  if (regions.length > 1) for (const region of regions) {
    const tab = button(region.title || region.view.title, async () => {
      saveSurfaces();
      state.activeRegion = region.id;
      await frame(state.view);
    });
    tab.setAttribute("aria-pressed", String(region.visible));
    $("region-tabs").append(tab);
  }
  if (state.comparison) $("region-tabs").append(button("Close comparison", async () => {
    saveSurfaces();
    state.comparison = null;
    state.activeRegion = "primary";
    await frame(state.view);
  }));
  for (const region of regions) {
    if (!region.visible || region.id === "primary" && rendererFamily(region.view) === "graph") continue;
    const host = el("section", void 0, "view-region");
    host.setAttribute("aria-label", region.title || region.view.title);
    host.dataset.regionId = region.id;
    const r = region.area;
    host.style.cssText = `left:${r.x}px;top:${r.y}px;width:${r.width}px;height:${r.height}px`;
    $("view-regions").append(host);
    const key2 = region.id + ":" + region.view.id, family = rendererFamily(region.view), options = { state: structuredClone(state.surfaceStates[key2] ?? {}), selectedId: state.selected, selectedIds: [...state.selectedIds], labelFor: label, onSelect: (selection) => selectSurface(selection, key2), onExplore: (selection) => exploreSurface(selection).catch(report), onStateChange: (value) => {
      if (revision === state.revision) state.surfaceStates[key2] = structuredClone(value);
    } };
    const controller = await (family === "grid" ? mountGrid(host, region.view, options) : family === "sequence" ? mountSequence(host, region.view, options) : mountGraphRegion(host, sizeView(region.view, region.focus ?? focus), { ...options, elk: state.layoutEngine, routing: state.reader.routing, measureLabel: labelSize }));
    if (revision !== state.revision) {
      controller.destroy();
      host.remove();
      return;
    }
    if (family === "graph" || JSON.stringify(options.selectedIds) !== JSON.stringify(state.selectedIds)) controller.selectMany?.(state.selectedIds);
    state.surfaces.push({ id: region.id, key: key2, family, controller, area: r });
  }
  if (grid) {
    state.displayed = view;
    state.displayOmissions = (view.notices ?? []).map((message) => ({ reason: "native-view", message }));
    $("context-details").hidden = !view.notices?.length;
    $("transition").textContent = `${view.kind} \xB7 ${representedIdentities(view).length} represented elements`;
  }
}
function highlightSelection(ids, origin) {
  state.selectedIds = [...new Set(ids.filter(Boolean))];
  state.selected = state.selectedIds.length === 1 ? state.selectedIds[0] : null;
  for (const s of state.surfaces) if (s.key !== origin) {
    if (s.controller.selectMany) s.controller.selectMany(state.selectedIds);
    else s.controller.select(state.selected);
  }
  for (const n of $("nodes").children) n.classList.toggle("selected", state.selectedIds.includes(n.dataset.semanticId));
  for (const g of $("connections").querySelectorAll("g[data-relationship]")) {
    const selected = state.selectedIds.includes(g.dataset.relationship);
    g.classList.toggle("traced", selected);
    g.setAttribute("aria-pressed", String(selected));
  }
}
function selectSurface(selection, origin) {
  const surface = state.surfaces.find((s) => s.key === origin);
  if (surface && surface.family !== "graph") {
    highlightSelection(selection.relationships?.length ? selection.relationships.map((r) => r.semanticId) : [selection.semanticId], origin);
    $("selection").hidden = true;
    return;
  }
  if (selection.relationships?.length) {
    highlightSelection(selection.relationships.map((r) => r.semanticId), origin);
    const menu = $("selection");
    menu.replaceChildren(el("strong", selection.label || "Relationships"));
    for (const r of selection.relationships) menu.append(el("p", `${label(r.sourceSemanticId)} \u2192 ${label(r.targetSemanticId)} \xB7 ${r.kind}`));
    menu.append(button("Explore relationship", () => exploreSurface(selection)), button("Close", () => {
      menu.hidden = true;
    }));
    menu.hidden = false;
  } else if (selection.semanticId) select(selection.semanticId, { name: selection.name || selection.label }, origin);
  else {
    highlightSelection([], origin);
    const menu = $("selection");
    menu.replaceChildren(el("p", selection.kind === "relationship-cell" && !selection.label ? "No matching relationship in this view." : "No native semantic identity is available for this record."), button("Close", () => {
      menu.hidden = true;
    }));
    menu.hidden = false;
  }
}
async function exploreSurface(selection) {
  if (selection.relationships?.length) {
    const relationships = selection.relationships.map((r, i) => ({ id: r.semanticId || "native-cell:" + i, semanticId: r.semanticId, source: r.sourceSemanticId, target: r.targetSemanticId, kind: r.kind, label: r.label || r.kind, authority: "native-view" }));
    const ids = new Set(relationships.flatMap((r) => [r.source, r.target])), elements = state.graph.elements.filter((e) => ids.has(e.id));
    if (elements.length !== ids.size) throw Error("A native relationship endpoint is unavailable in this loaded declaration projection.");
    await openExploration(graphView(state.graph, { elements, relationships }, "Selected native relationships"), selection.semanticId && element(selection.semanticId) ? selection.semanticId : relationships[0].source);
  } else if (selection.semanticId) await explore(selection.semanticId);
}
function gather(ids, relationships) {
  const set = new Set(ids), elements = state.graph.elements.filter((e) => set.has(e.id));
  return graphView(state.graph, { elements, relationships: (relationships ?? state.graph.relationships).filter((e) => set.has(e.source) && set.has(e.target)) }, "General View journey");
}
async function transitionTo(view, focus, { animate = true, journey, allowDisconnected = false, camera = createCamera() } = {}) {
  const revision = ++state.revision, previous = state.view, cameraRevision = state.cameraRevision;
  const savedJourney = journey?.length > 1 && resolve(journey[0]) === state.previousFocus && resolve(journey.at(-1)) === focus ? journey.map(resolve) : void 0;
  const plan = previous ? planTransition({ view: previous, focus: state.previousFocus }, { view, focus }, { graph: state.graph, scopeIds: state.exploring ? void 0 : scopeIds(), reducedMotion: state.reduce, journey: savedJourney }) : null;
  if (savedJourney && !plan?.route?.found) throw Error("Saved journey no longer resolves within the presentation boundary");
  const disconnected = plan?.journeyRequired && plan.route?.found === false;
  if (disconnected && !state.exploring && !allowDisconnected) throw Error("No engineering route connects these viewpoints within the presentation system. Explore the model to open a disconnected viewpoint explicitly.");
  saveSurfaces();
  surfaceAnchorSnapshot();
  disposeSurfaces();
  cancelAnimations();
  for (const p of $("stage").querySelectorAll(".narrative-outgoing")) p.remove();
  $("selection").hidden = true;
  state.transitioning = true;
  $("stage").setAttribute("aria-busy", "true");
  state.pendingDestination = { view, focus, journey, camera, cameraRevision };
  state.lastTransition = plan;
  let oldPanel;
  try {
    oldPanel = !$("narrative").hidden ? $("narrative").cloneNode(true) : null;
    if (oldPanel) {
      oldPanel.removeAttribute("id");
      oldPanel.classList.add("narrative-outgoing");
      oldPanel.setAttribute("aria-hidden", "true");
      $("stage").append(oldPanel);
    }
    const panels = panelGeometry(view), projection2 = rendererFamily(view) === "graph" ? view : gather(representedIdentities(view).filter((id) => element(id)).slice(0, 24)), target = await prepareFrame(projection2, focus, panels), frames = [];
    if (revision !== state.revision) {
      oldPanel?.remove();
      return;
    }
    if (state.visualSnapshot && animate && !state.reduce && cameraRevision === state.cameraRevision) {
      frames.push(state.visualSnapshot);
      if (plan?.journeyRequired && !disconnected) {
        for (const step of plan.stages.filter((step2) => step2.viewKind === "gv")) {
          frames.push(await prepareFrame(gather(step.semanticIds, step.route), step.focusId ?? focus, panels, { journey: true }));
          if (revision !== state.revision) {
            oldPanel?.remove();
            return;
          }
        }
      }
      frames.push(target);
      const anchors = destinationAnchors(view, focus, panels, target);
      if (anchors) frames.push(anchors);
    } else frames.push(target);
    if (revision !== state.revision) {
      oldPanel?.remove();
      return;
    }
    if (cameraRevision !== state.cameraRevision) frames.splice(0, frames.length, target);
    const result = await paintFrames(frames, { duration: frames.length > 2 ? Math.max(1700, (frames.length - 1) * 420) : frames.length > 1 ? 780 : 0, caption: disconnected ? "No engineering route \xB7 explicit view jump" : plan?.route?.strategy === "ownership-ancestor" ? "Model ownership route \xB7 location, not derivation" : "", outgoingPanel: oldPanel, cameraTarget: cameraRevision === state.cameraRevision ? camera : state.camera });
    if (result.cancelled || revision !== state.revision) return;
    state.view = view;
    state.focus = focus;
    state.previousFocus = focus;
    await renderSurfaces(view, focus, panels, revision);
    if (revision !== state.revision) return;
    updateExplorationControls();
    if (!state.exploring) status(`OpenSysML WASM \xB7 ${state.graph.elements.length} native elements \xB7 ${state.availableViews.length} views`);
    else status(state.traceInfo?.summary.message ?? "Explore this native view \xB7 select an element for contextual actions");
    $("boundary").textContent = !scopeIds().includes(focus) ? "Outside presentation boundary \xB7 loaded model context" : state.project.manifest.publication.scope === "scoped" ? "Scoped publication \xB7 supplied model context only" : "Complete project \xB7 standalone exploration available";
  } finally {
    oldPanel?.remove();
    if (revision === state.revision) {
      state.transitioning = false;
      $("stage").setAttribute("aria-busy", "false");
      state.pendingDestination = null;
    }
  }
}
async function showScene(index, animate = true, { record = false } = {}) {
  if (index < 0 || index >= state.scenes.length) return;
  const saved = snapshot(), savedHistory = [...state.history], savedFuture = [...state.future];
  if (record) remember();
  state.sceneIndex = index;
  state.exploring = false;
  state.neighborhoodBudget = null;
  state.traceRequest = null;
  state.traceInfo = null;
  state.comparison = null;
  state.activeRegion = "primary";
  state.presentation = structuredClone(state.scenes[index].presentation ?? {});
  state.expanded = /* @__PURE__ */ new Set();
  state.collapsed = /* @__PURE__ */ new Set();
  updateExplorationControls();
  const s = scene();
  const focus = resolve(s.focus), view = state.views.get(s.view);
  let navigationRevision;
  try {
    if (!focus || !view) throw Error("Scene focus or native view is unavailable");
    const pending = transitionTo(view, focus, { animate, journey: s.journey, allowDisconnected: true });
    navigationRevision = state.revision;
    await pending;
  } catch (error) {
    if (navigationRevision !== void 0 && navigationRevision !== state.revision) return;
    state.history = savedHistory;
    state.future = savedFuture;
    restoreValues(saved);
    if (saved.view) await transitionTo(saved.view, saved.focus, { animate: false, allowDisconnected: true, camera: saved.camera });
    throw error;
  } finally {
    updateExplorationControls();
    $("scenes").value = state.sceneIndex;
    $("previous").disabled = state.sceneIndex === 0;
    $("next").disabled = state.sceneIndex === state.scenes.length - 1;
    $("return").hidden = !state.exploring || !state.scenes.length;
    $("standalone").hidden = state.exploring;
  }
}
function displayPreferences() {
  return { ...resolvePresentation(state.presentation, { width: $("stage").clientWidth, resolve }), compartments: { all: "expanded", none: "compact", focused: "auto" }[state.reader.compartments] };
}
function snapshot() {
  saveSurfaces();
  return { view: state.pendingDestination?.view ?? state.view, focus: state.pendingDestination?.focus ?? state.focus, sceneIndex: state.sceneIndex, exploring: state.exploring, selected: state.selected, selectedIds: [...state.selectedIds], expanded: [...state.expanded], collapsed: [...state.collapsed], presentation: structuredClone(state.presentation), traceRequest: structuredClone(state.traceRequest), traceInfo: structuredClone(state.traceInfo ?? null), camera: { ...state.camera }, neighborhoodBudget: state.neighborhoodBudget, surfaceStates: structuredClone(state.surfaceStates), comparison: state.comparison, activeRegion: state.activeRegion };
}
function restoreValues(target) {
  disposeSurfaces();
  Object.assign(state, { sceneIndex: target.sceneIndex, exploring: target.exploring, selected: target.selected, selectedIds: [...target.selectedIds ?? [target.selected].filter(Boolean)], expanded: new Set(target.expanded), collapsed: new Set(target.collapsed), presentation: structuredClone(target.presentation), traceRequest: structuredClone(target.traceRequest), neighborhoodBudget: target.neighborhoodBudget ?? null, surfaceStates: structuredClone(target.surfaceStates ?? {}), comparison: target.comparison ?? null, activeRegion: target.activeRegion ?? "primary" });
  state.traceInfo = structuredClone(target.traceInfo ?? null);
}
function remember() {
  if (!state.view) return;
  state.history.push(snapshot());
  if (state.history.length > 40) state.history.shift();
  state.future = [];
  updateExplorationControls();
}
function updateExplorationControls() {
  const exploring = state.exploring;
  document.querySelector("header nav").hidden = exploring;
  $("exploration-controls").hidden = !exploring && !state.history.length && !state.future.length;
  $("explore-back").disabled = !state.history.length;
  $("explore-forward").disabled = !state.future.length;
  $("return").hidden = !exploring || !state.scenes.length;
  $("standalone").hidden = exploring;
  const request = state.traceRequest, info = state.traceInfo;
  $("exploration-label").textContent = exploring ? state.view?.overview ? "System overview \xB7 " + label(state.focus) : request && info ? `${info.mode === "context" ? "Context" : { origins: "Origins", derived: "Derived requirements", impact: "Design impact", verification: "Verification", contents: "Parts / contents", container: "Containing element" }[info.mode]} \xB7 ${label(request.focus)} \xB7 ${info.shown} of ${info.total}` : label(state.focus) : "Guided scene";
  $("exploration-label").title = $("exploration-label").textContent;
  $("trace-previous").hidden = !request || !info || info.pages < 2;
  $("trace-next").hidden = !request || !info || info.pages < 2;
  $("trace-previous").disabled = !info || info.page === 0;
  $("trace-next").disabled = !info || info.page >= info.pages - 1;
  if (info?.pages > 1) $("trace-next").textContent = `More (${info.page + 1}/${info.pages})`;
}
async function restoreHistory(direction) {
  const from = direction === "back" ? state.history : state.future, to = direction === "back" ? state.future : state.history;
  if (!from.length) return;
  const target = from.pop(), current = snapshot();
  to.push(current);
  restoreValues(target);
  updateExplorationControls();
  const revision = state.revision + 1;
  try {
    await transitionTo(target.view, target.focus, { allowDisconnected: true, camera: target.camera });
    if (revision !== state.revision) return;
    $("scenes").value = state.sceneIndex;
    updateExplorationControls();
    if (state.traceInfo) status(state.traceInfo.summary.message);
  } catch (error) {
    if (revision !== state.revision) return;
    to.pop();
    from.push(target);
    restoreValues(current);
    updateExplorationControls();
    await transitionTo(current.view, current.focus, { animate: false, allowDisconnected: true, camera: current.camera });
    throw error;
  }
}
async function openExploration(view, id, { request = null, info = null, record = true, resetRegions = false } = {}) {
  const previous = snapshot(), history = [...state.history], future = [...state.future];
  if (record) remember();
  if (resetRegions) {
    state.comparison = null;
    state.activeRegion = "primary";
  }
  state.neighborhoodBudget = null;
  state.exploring = true;
  state.traceRequest = request;
  state.traceInfo = info;
  if (request) state.presentation = { ...state.presentation, emphasis: [] };
  updateExplorationControls();
  const revision = state.revision + 1;
  try {
    await transitionTo(view, id, { allowDisconnected: true });
    if (revision !== state.revision) return;
    updateExplorationControls();
    status(info ? info.summary.message : "Explore this native view \xB7 select an element for contextual actions");
  } catch (error) {
    if (revision !== state.revision) return;
    state.history = history;
    state.future = future;
    restoreValues(previous);
    updateExplorationControls();
    if (previous.view) await transitionTo(previous.view, previous.focus, { animate: false, allowDisconnected: true, camera: previous.camera });
    throw error;
  }
}
async function openSystemOverview({ record = true } = {}) {
  const rootIds = state.project.manifest.systemOfInterest.map(resolve).filter(Boolean), budget = $("stage").clientWidth < 700 ? 6 : 9;
  const context = buildSystemOverview(state.graph, { rootIds, budget });
  if (!context.elements.length) throw Error("No named project declarations are available for a system overview.");
  const view = graphView(state.graph, context, "System overview");
  view.id = "overview:" + JSON.stringify([rootIds, budget, context.elements.map((e) => e.id)]);
  view.overview = { rootIds, budget, metrics: Object.fromEntries(context.elements.map((e) => [e.id, context.metrics.get(e.id)])), summary: context.summary };
  view.nodes = view.nodes.map((node) => {
    const m = context.metrics.get(node.semanticId);
    return { ...node, overviewLabel: m ? `${m.children} children \xB7 ${m.connections} neighbors` : void 0 };
  });
  await openExploration(view, context.focus, { record, resetRegions: true });
}
async function explore(id, kind) {
  if (!id || !element(id)) throw Error("Model target unavailable");
  const revision = ++state.revision, modelHash = state.modelHash;
  if (kind) {
    const q = qname(id);
    if (!q) throw Error("Native view requires a qualified model identity");
    const raw = await state.engine.call("RenderView", { modelHash, view: `#${kind}:${q}`, includeSemanticIdentity: true });
    if (revision !== state.revision || modelHash !== state.modelHash) return;
    const view = { ...requireNativeIdentity(adaptNativeView(raw, `#${kind}:${q}`)), capture: { definition: { action: "ActionFlowView", state: "StateTransitionView", sequence: "SequenceView", interconnection: "InterconnectionView" }[kind], root: q } };
    state.extraViews ??= /* @__PURE__ */ new Map();
    state.extraViews.set(view.id, view);
    state.graph = modelGraph(state.exported.elements, [...state.views.values(), state.coverage, ...state.extraViews.values()]);
    await openExploration(view, id);
  } else await followTrace(id, "context");
}
async function followTrace(id, mode, page = 0) {
  const request = { focus: id, mode, budget: $("stage").clientWidth < 700 ? 5 : 7, page }, context = traceContext(state.graph, { ...request, prominenceScopeIds: prominenceScope() }), view = graphView(state.graph, context, mode + " of " + label(id));
  view.traceRequest = request;
  await openExploration(view, id, { request, info: context });
}
function select(id, node, origin) {
  clearTrace();
  highlightSelection([id], origin);
  const menu = $("selection");
  menu.replaceChildren(el("strong", node?.name || label(id)));
  menu.hidden = false;
  if (!id) {
    menu.append(el("p", "This native notation element or embedded port has no independent model-element identity in this projection."), button("Close", () => {
      menu.hidden = true;
    }));
    return;
  }
  const documentation = documentationFor(state.graph, id);
  if (documentation.text) menu.append(button("Read full statement", () => {
    $("information").classList.add("statement");
    $("information-title").textContent = "Full statement";
    $("information-text").textContent = (documentation.source?.qualifiedName || label(id)) + "\n\n" + documentation.text;
    $("information").showModal();
  }));
  const prominence = state.view?.overview?.metrics[id];
  if (prominence) {
    menu.append(el("p", `${prominence.children} direct children \xB7 ${prominence.connections} distinct connected elements. Structural prominence describes the loaded model, not engineering criticality.`));
    if (prominence.children > 0 && isStructuralElement(element(id))) menu.append(button("Expand contents", () => followTrace(id, "contents")));
  }
  menu.append(button("Focus", () => explore(id)), button(state.expanded.has(id) || !!node?.displayDetail ? "Collapse compartment" : "Show statement / compartment", async () => {
    if (state.expanded.has(id) || !!node?.displayDetail) {
      state.expanded.delete(id);
      state.collapsed.add(id);
    } else {
      state.collapsed.delete(id);
      state.expanded.add(id);
    }
    await frame(state.view);
    select(id, node);
  }));
  const e = element(id);
  if (isStructuralElement(e)) {
    const actions = el("div", void 0, "requirement-actions");
    for (const action of structuralActions(state.graph, id)) {
      const control = button(`${action.label} (${action.count})`, () => followTrace(id, action.mode));
      control.disabled = !action.enabled;
      control.title = action.summary.message;
      actions.append(control);
    }
    menu.append(actions);
  }
  if (["PartUsage", "PartDefinition", "Package"].includes(e?.kind)) menu.append(button("Internal view", () => explore(id, "interconnection")));
  if (["ActionUsage", "ActionDefinition"].includes(e?.kind)) menu.append(button("Activity view", () => explore(id, "action")));
  if (["StateUsage", "StateDefinition"].includes(e?.kind)) menu.append(button("State view", () => explore(id, "state")));
  if (["RequirementUsage", "RequirementDefinition"].includes(e?.kind)) {
    const actions = el("div", void 0, "requirement-actions");
    for (const action of requirementActions(state.graph, id).filter((a) => a.mode !== "context")) {
      const control = button(`${action.label} (${action.count})`, () => followTrace(id, action.mode));
      control.disabled = action.count === 0 && action.unavailable === 0 && action.filtered === 0;
      control.title = action.summary?.message ?? "";
      actions.append(control);
    }
    menu.append(actions, el("p", "Counts describe links in this loaded projection. Missing links are not proof that none exist.", "projection-note"));
  }
  const advanced = el("details"), summary = el("summary", "Other relationships");
  advanced.append(summary);
  const kinds2 = [...new Set(state.graph.relationships.filter((r) => r.source === id || r.target === id).map((r) => r.kind))].filter((k) => !["typing", "owner", "specialization"].includes(k));
  for (const kind of kinds2) advanced.append(button(`Follow ${kind} relationships`, async () => {
    const context = engineeringContext(state.graph, { focus: id, relationshipKinds: [kind], depth: 1, budget: 7 });
    await openExploration(graphView(state.graph, context), id);
  }));
  menu.append(advanced);
  const typing = directTypingContext(state.graph, id);
  if (typing.elements.length > 1) menu.append(button("Show direct type context", async () => {
    await openExploration(graphView(state.graph, typing, "Explicit typing context"), id);
  }));
  menu.append(button("Close", () => {
    menu.hidden = true;
  }));
}
function clearTrace() {
  $("stage").classList.remove("tracing");
  for (const n of $("nodes").children) n.classList.remove("trace-endpoint");
  for (const e of $("connections").querySelectorAll("g[data-relationship]")) {
    e.classList.remove("traced");
    e.removeAttribute("aria-pressed");
  }
}
function traceEdge(edge, key2) {
  clearTrace();
  highlightSelection([edge.semanticId || edge.id]);
  $("stage").classList.add("tracing");
  for (const n of $("nodes").children) n.classList.toggle("trace-endpoint", [edge.sourceSemantic, edge.targetSemantic].includes(n.dataset.semanticId));
  for (const g of $("connections").querySelectorAll("g[data-relationship]")) {
    const match = g.dataset.relationship === String(edge.semanticId || edge.id) && g.dataset.source === (edge.sourceSemantic || "") && g.dataset.target === (edge.targetSemantic || "");
    g.classList.toggle("traced", match);
    g.setAttribute("aria-pressed", String(match));
  }
  const menu = $("selection");
  menu.replaceChildren(el("strong", edge.label || edge.kind), el("p", `${label(edge.sourceSemantic)} \u2192 ${label(edge.targetSemantic)}`));
  for (const id of [.../* @__PURE__ */ new Set([edge.sourceSemantic, edge.targetSemantic])].filter(Boolean)) menu.append(button("Focus " + label(id), () => explore(id)));
  menu.append(button("Close", () => {
    clearTrace();
    menu.hidden = true;
  }));
  menu.hidden = false;
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
function editorPresentation() {
  const config = { compartments: $("presentation-compartments").value, expanded: $("presentation-expanded").value.split("\n").map((s) => s.trim()).filter(Boolean), emphasis: [...$("presentation-emphasis").selectedOptions].map((o) => o.value), grouping: $("presentation-grouping").value };
  if ($("presentation-context").value !== "") config.contextBudget = Number($("presentation-context").value);
  resolvePresentation(config, { resolve });
  return validatePresentation(config);
}
function openEditor() {
  if (!state.project) return;
  $("scene-regions").value = (scene()?.regions ?? []).map((r) => r.view).join("\n");
  $("scene-title").value = scene()?.title || "New scene";
  $("scene-prose").value = scene()?.markdown || "";
  $("panel-placement").value = scene()?.panel?.placement || "right";
  $("view-source").value = fileText(state.project, $("view-file").value);
  const p = validatePresentation(scene()?.presentation);
  $("presentation-compartments").value = p.compartments;
  $("presentation-expanded").value = p.expanded.join("\n");
  for (const o of [...$("presentation-emphasis").options]) o.selected = p.emphasis.includes(o.value);
  $("presentation-context").value = p.contextBudget ?? "";
  $("presentation-grouping").value = p.grouping;
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
  const s = { type: "scene", id: "captured-" + Date.now(), title: $("scene-title").value || "Captured view", view: viewName, focus: qname(state.focus), panel: { placement: $("panel-placement").value }, presentation: editorPresentation(), markdown: $("scene-prose").value };
  if (!s.focus) throw Error("Captured focus needs a native qualified identity");
  appendScene(project, s);
  await loadProject(project);
  await showScene(state.scenes.length - 1, false);
  $("editor").close();
  status("Scene captured. Export the project ZIP or Markdown to keep it.");
}
function contextNotice(notice) {
  if (notice.message) return notice.message;
  if (notice.reason === "context-route-fallback") return `Connection layout: ${notice.continued ?? 0} shortened; ${notice.unrepresented ?? 0} not drawn in this view. Native relationships: ${(notice.relationships ?? []).join(", ")}.`;
  if (notice.reason === "context-route-continuation") return `Shortened context: ${(notice.targets ?? []).map((id) => label(id) ?? id).join(", ")}; ${notice.continued ?? 0} labeled connections.`;
  if (notice.reason === "context-route-conflict") return `Layout notice: ${notice.crossings} context crossings; ${Math.round(notice.overlapLength ?? 0)} pixels of shared path remain.`;
  const target = notice.target ?? notice.relationshipId ?? "connection", name = label(target) ?? target;
  const prefix = notice.reason === "context-route-continuation" ? "Shortened connection" : ["unavailable", "outside-scope", "metamodel-boundary"].includes(notice.reason) ? "Unavailable / boundary" : "Hidden by view policy";
  return `${prefix}: ${notice.reason} \xB7 ${name} (${target})`;
}
function omissionDisclosure(omissions, overview) {
  if (!overview) return omissions.map(contextNotice).join("\n");
  const counts = /* @__PURE__ */ new Map();
  for (const item of omissions) counts.set(item.reason, (counts.get(item.reason) ?? 0) + 1);
  const heading = [...counts].map(([reason, count]) => `${reason}: ${count}`).join(" \xB7 ");
  return heading + "\n\n" + omissions.slice(0, 100).map(contextNotice).join("\n") + (omissions.length > 100 ? `

Showing 100 of ${omissions.length} omitted records. Use Find to locate another named model element.` : "");
}
function bind() {
  $("global-compartments").value = state.reader.compartments;
  $("global-routing").value = state.reader.routing;
  for (const [id, key2] of [["global-compartments", "compartments"], ["global-routing", "routing"]]) $(id).onchange = async () => {
    try {
      state.reader = { ...state.reader, [key2]: $(id).value };
      try {
        saveReaderSettings(localStorage, state.reader);
      } catch {
      }
      if (key2 === "compartments") {
        state.expanded.clear();
        state.collapsed.clear();
      }
      if (state.view) await frame(state.view);
    } catch (e) {
      report(e);
    }
  };
  $("open-folder").hidden = !("webkitdirectory" in $("folder-files"));
  for (const kind of PRESENTATION_RELATIONSHIP_KINDS) {
    const option = el("option", kind);
    option.value = kind;
    $("presentation-emphasis").append(option);
  }
  $("explore-back").onclick = () => restoreHistory("back").catch(report);
  $("explore-forward").onclick = () => restoreHistory("forward").catch(report);
  $("trace-next").onclick = () => followTrace(state.traceRequest.focus, state.traceRequest.mode, state.traceInfo.page + 1).catch(report);
  $("trace-previous").onclick = () => followTrace(state.traceRequest.focus, state.traceRequest.mode, state.traceInfo.page - 1).catch(report);
  $("previous").onclick = () => showScene(state.sceneIndex - 1).catch(report);
  $("next").onclick = () => showScene(state.sceneIndex + 1).catch(report);
  $("scenes").onchange = () => showScene(Number($("scenes").value)).catch(report);
  $("standalone").onclick = async () => {
    try {
      await openExploration(state.view, state.focus);
    } catch (error) {
      report(error);
    }
  };
  $("return").onclick = () => showScene(state.sceneIndex, true, { record: true }).catch(report);
  $("system-overview").onclick = () => {
    $("camera-menu").open = false;
    openSystemOverview().catch(report);
  };
  $("fit").onclick = () => resetCamera().catch(report);
  $("show-neighborhood").onclick = fitNeighborhood;
  $("zoom-in").onclick = () => zoomBy(1.25);
  $("zoom-out").onclick = () => zoomBy(0.8);
  $("more-neighbors").onclick = () => moreNeighbors().catch(report);
  bindCameraControls({ element: $("stage"), getViewportArea: () => state.visualSnapshot?.area, getCamera: () => state.camera, setCamera: applyCamera, onGestureStart: takeCameraControl, shouldHandleTarget: (target) => target === $("stage") || !!target?.closest?.("#graph-viewport") });
  $("reduce").setAttribute("aria-pressed", state.reduce);
  $("reduce").onclick = () => {
    state.reduce = !state.reduce;
    $("reduce").setAttribute("aria-pressed", state.reduce);
    if (state.reduce) state.motion?.finish();
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
  const openNative = async (compare4) => {
    const revision = ++state.revision, modelHash = state.modelHash, name = $("views").value;
    let view = state.views.get(name);
    if (!view) {
      const raw = await state.engine.call("RenderView", { modelHash, view: name, includeSemanticIdentity: true });
      if (revision !== state.revision || modelHash !== state.modelHash) return;
      view = requireNativeIdentity(adaptNativeView(raw, name));
      if (!supportsView(view)) throw Error("Unsupported native notation: " + view.kind);
      state.views.set(name, view);
      state.graph = modelGraph(state.exported.elements, [...state.views.values(), state.coverage, ...state.extraViews.values()]);
    }
    const target = representedIdentities(view).find((id) => element(id)) ?? state.focus;
    $("find").hidden = true;
    if (compare4) {
      remember();
      state.comparison = { view, focus: target, title: name };
      state.activeRegion = "comparison";
      await frame(state.view);
    } else {
      state.comparison = null;
      state.activeRegion = "primary";
      await openExploration(view, target);
    }
  };
  $("open-view").onclick = () => openNative(false).catch(report);
  $("compare-view").onclick = () => openNative(true).catch(report);
  $("context-details").onclick = () => {
    $("information").classList.remove("statement");
    $("information-title").textContent = state.view?.overview ? "Overview selection" : "Prepared neighborhood";
    const omissions = state.displayOmissions ?? state.displayed?.omissions ?? [], n = state.visualSnapshot?.neighborhood;
    const summary = state.view?.overview ? state.view.overview.summary.message + "\n\nRanked by direct children, damped descendants, distinct connected elements and cross-branch links. Branches share the display budget; ties use native names and identities. Counts refer to eligible project elements in the selected native scope. These signals describe structural prominence, not engineering criticality. Select a subsystem and choose Expand contents to explore further.\n\n" : n ? `${n.shown} of ${n.total} eligible one-hop neighbors prepared (limit ${n.budget}). Every included neighbor has a real tile. Pan or zoom to reveal tiles outside the active fit. Camera movement does not expand the model.

` : "";
    $("information-text").textContent = summary + omissionDisclosure(omissions, !!state.view?.overview) + "\n\nCoverage: part composition, dependencies and direct types come from the native API. Other engineering links come from native requirement and declared views. Unprojected relationship kinds may be unavailable.";
    $("information").showModal();
  };
  $("edit").onclick = openEditor;
  $("view-file").onchange = () => {
    $("view-source").value = fileText(state.project, $("view-file").value);
  };
  $("save-scene").onclick = async () => {
    try {
      if (!scene()) throw Error("Capture a first scene before editing it");
      const presentation = editorPresentation(), regions = updateRegionReferences(scene().regions ?? [], $("scene-regions").value.split("\n").map((s) => s.trim()).filter(Boolean)), index = state.sceneIndex, project = structuredClone(state.project), scenes = structuredClone(state.scenes);
      Object.assign(scenes[index], { presentation, regions, title: $("scene-title").value, markdown: $("scene-prose").value, panel: { placement: $("panel-placement").value } });
      project.files[project.manifest.story] = writeStory(project.manifest.title, scenes);
      await loadProject(project);
      $("editor").close();
      await showScene(index, false);
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
  $("open-sysml").onclick = () => $("sysml-files").click();
  $("open-folder").onclick = () => $("folder-files").click();
  $("landing-project").onclick = () => $("project-file").click();
  for (const [id, folder] of [["sysml-files", false], ["folder-files", true]]) $(id).onchange = async () => {
    const request = ++state.loadRevision;
    ++state.revision;
    try {
      if ($(id).files.length) {
        busy(true);
        $("landing-error").hidden = true;
        const project = await projectFromSelection($(id).files, { folder });
        if (request !== state.loadRevision) return;
        await loadProject(project, { cacheHash: null, loadToken: request });
      }
    } catch (error) {
      if (request === state.loadRevision) report(error);
    } finally {
      if (request === state.loadRevision) busy(false);
      $(id).value = "";
    }
  };
  for (const demo of document.querySelectorAll("[data-demo]")) demo.onclick = () => openDemo(demo.dataset.demo).catch(report);
  $("home").onclick = home;
  $("resume-model").onclick = async () => {
    ++state.loadRevision;
    ++state.revision;
    busy(false);
    showLanding(document, false);
    document.title = state.project.manifest.title + " \xB7 Syspresent";
    await frame(state.view).catch(report);
  };
  $("import-project").onclick = () => {
    $("project-file").click();
  };
  $("project-file").onchange = async () => {
    const request = ++state.loadRevision;
    ++state.revision;
    try {
      const file = $("project-file").files[0];
      if (file) {
        busy(true);
        const bytes = new Uint8Array(await file.arrayBuffer());
        if (request !== state.loadRevision) return;
        await loadProject(unpackProject(bytes), { cacheHash: null, loadToken: request });
      }
    } catch (e) {
      if (request === state.loadRevision) report(e);
    } finally {
      if (request === state.loadRevision) busy(false);
      $("project-file").value = "";
    }
  };
  $("import-markdown").onclick = () => {
    $("markdown-file").click();
  };
  $("markdown-file").onchange = async () => {
    const request = ++state.loadRevision;
    ++state.revision;
    try {
      const file = $("markdown-file").files[0];
      if (file) {
        busy(true);
        const project = structuredClone(state.project);
        project.files[project.manifest.story] = await file.text();
        if (request !== state.loadRevision) return;
        await loadProject(project, { loadToken: request });
      }
    } catch (e) {
      if (request === state.loadRevision) report(e);
    } finally {
      if (request === state.loadRevision) busy(false);
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
  $("load-example").textContent = "Choose another demo";
  $("load-example").onclick = home;
  $("about").onclick = () => {
    $("information").classList.remove("statement");
    $("information-title").textContent = "Engine and project details";
    $("information-text").textContent = JSON.stringify({ engine: state.provenance, project: state.project.manifest, modelHash: state.modelHash, graph: { elements: state.graph.elements.length, relationships: state.graph.relationships.length }, routing: state.visualSnapshot?.routingMetrics, camera: state.camera, neighborhood: state.visualSnapshot?.neighborhood, view: state.view.id, lastTransition: state.lastTransition, notice: state.exported.notice }, null, 2);
    $("information").showModal();
  };
  let keyboardFocus = false;
  document.addEventListener("keydown", () => {
    keyboardFocus = true;
  }, true);
  document.addEventListener("pointerdown", () => {
    keyboardFocus = false;
  }, true);
  $("nodes").addEventListener("focusin", (event) => {
    if (!keyboardFocus || state.transitioning || !event.target.matches(".node")) return;
    const a = state.visualSnapshot?.area;
    if (!a) return;
    const r = event.target.getBoundingClientRect(), s = $("stage").getBoundingClientRect(), x = r.x - s.x, y = r.y - s.y;
    if (x < a.x || y < a.y || x + r.width > a.x + a.width || y + r.height > a.y + a.height) {
      takeCameraControl();
      applyCamera({ ...state.camera, x: state.camera.x + a.x + a.width / 2 - x - r.width / 2, y: state.camera.y + a.y + a.height / 2 - y - r.height / 2 });
    }
  });
  $("stage").onclick = (e) => {
    if (e.target === $("stage") || e.target === $("nodes") || e.target === $("connections")) {
      clearTrace();
      $("selection").hidden = true;
    }
  };
  let resize;
  new ResizeObserver(() => {
    clearTimeout(resize);
    resize = setTimeout(() => {
      if ($("stage").hidden || $("stage").clientWidth <= 0 || $("stage").clientHeight <= 0) return;
      if (state.transitioning && state.pendingDestination) {
        const pending = state.pendingDestination;
        transitionTo(pending.view, pending.focus, { journey: pending.journey, allowDisconnected: true, camera: pending.cameraRevision === state.cameraRevision ? pending.camera : state.camera }).catch(report);
      } else if (state.view) frame(state.view).catch(report);
    }, 100);
  }).observe($("stage"));
}
async function start() {
  bind();
  busy(false);
  showLanding(document, true);
  const demo = new URLSearchParams(location.search).get("demo");
  if (demo) await openDemo(demo);
}
start().catch(report);
//# sourceMappingURL=app.js.map

"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
var log = require("loglevel");
var isect = require("isect");
var d3 = require("d3-quadtree");
var vector_1 = require("../vector");
/**
 * Node located along any intersection or point along the simplified road polylines
 */
var Node = /** @class */ (function () {
    function Node(value, neighbors) {
        if (neighbors === void 0) { neighbors = new Set(); }
        this.value = value;
        this.neighbors = neighbors;
        this.segments = new Set();
    }
    Node.prototype.addSegment = function (segment) {
        this.segments.add(segment);
    };
    Node.prototype.addNeighbor = function (node) {
        if (node !== this) {
            this.neighbors.add(node);
            node.neighbors.add(this);
        }
    };
    return Node;
}());
exports.Node = Node;
var Graph = /** @class */ (function () {
    /**
     * Create a graph from a set of streamlines
     * Finds all intersections, and creates a list of Nodes
     */
    function Graph(streamlines, dstep, deleteDangling) {
        var e_1, _a, e_2, _b, e_3, _c, e_4, _d, e_5, _e, e_6, _f;
        if (deleteDangling === void 0) { deleteDangling = false; }
        var intersections = isect.bush(this.streamlinesToSegment(streamlines)).run();
        var quadtree = d3.quadtree().x(function (n) { return n.value.x; }).y(function (n) { return n.value.y; });
        var nodeAddRadius = 0.001;
        try {
            // Add all segment start and endpoints
            for (var streamlines_1 = __values(streamlines), streamlines_1_1 = streamlines_1.next(); !streamlines_1_1.done; streamlines_1_1 = streamlines_1.next()) {
                var streamline = streamlines_1_1.value;
                for (var i = 0; i < streamline.length; i++) {
                    var node = new Node(streamline[i]);
                    if (i > 0) {
                        node.addSegment(this.vectorsToSegment(streamline[i - 1], streamline[i]));
                    }
                    if (i < streamline.length - 1) {
                        node.addSegment(this.vectorsToSegment(streamline[i], streamline[i + 1]));
                    }
                    this.fuzzyAddToQuadtree(quadtree, node, nodeAddRadius);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (streamlines_1_1 && !streamlines_1_1.done && (_a = streamlines_1.return)) _a.call(streamlines_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        try {
            // Add all intersections
            for (var intersections_1 = __values(intersections), intersections_1_1 = intersections_1.next(); !intersections_1_1.done; intersections_1_1 = intersections_1.next()) {
                var intersection = intersections_1_1.value;
                var node = new Node(new vector_1.default(intersection.point.x, intersection.point.y));
                try {
                    for (var _g = (e_3 = void 0, __values(intersection.segments)), _h = _g.next(); !_h.done; _h = _g.next()) {
                        var s = _h.value;
                        node.addSegment(s);
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_h && !_h.done && (_c = _g.return)) _c.call(_g);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                this.fuzzyAddToQuadtree(quadtree, node, nodeAddRadius);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (intersections_1_1 && !intersections_1_1.done && (_b = intersections_1.return)) _b.call(intersections_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        try {
            // For each simplified streamline, build list of nodes in order along streamline
            for (var streamlines_2 = __values(streamlines), streamlines_2_1 = streamlines_2.next(); !streamlines_2_1.done; streamlines_2_1 = streamlines_2.next()) {
                var streamline = streamlines_2_1.value;
                for (var i = 0; i < streamline.length - 1; i++) {
                    var nodesAlongSegment = this.getNodesAlongSegment(this.vectorsToSegment(streamline[i], streamline[i + 1]), quadtree, nodeAddRadius, dstep);
                    if (nodesAlongSegment.length > 1) {
                        for (var j = 0; j < nodesAlongSegment.length - 1; j++) {
                            nodesAlongSegment[j].addNeighbor(nodesAlongSegment[j + 1]);
                        }
                    }
                    else {
                        log.error("Error Graph.js: segment with less than 2 nodes");
                    }
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (streamlines_2_1 && !streamlines_2_1.done && (_d = streamlines_2.return)) _d.call(streamlines_2);
            }
            finally { if (e_4) throw e_4.error; }
        }
        try {
            for (var _j = __values(quadtree.data()), _k = _j.next(); !_k.done; _k = _j.next()) {
                var n = _k.value;
                if (deleteDangling) {
                    this.deleteDanglingNodes(n, quadtree);
                }
                n.adj = Array.from(n.neighbors);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_k && !_k.done && (_e = _j.return)) _e.call(_j);
            }
            finally { if (e_5) throw e_5.error; }
        }
        this.nodes = quadtree.data();
        this.intersections = [];
        try {
            for (var intersections_2 = __values(intersections), intersections_2_1 = intersections_2.next(); !intersections_2_1.done; intersections_2_1 = intersections_2.next()) {
                var i = intersections_2_1.value;
                this.intersections.push(new vector_1.default(i.point.x, i.point.y));
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (intersections_2_1 && !intersections_2_1.done && (_f = intersections_2.return)) _f.call(intersections_2);
            }
            finally { if (e_6) throw e_6.error; }
        }
    }
    /**
     * Remove dangling edges from graph to facilitate polygon finding
     */
    Graph.prototype.deleteDanglingNodes = function (n, quadtree) {
        var e_7, _a;
        if (n.neighbors.size === 1) {
            quadtree.remove(n);
            try {
                for (var _b = __values(n.neighbors), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var neighbor = _c.value;
                    neighbor.neighbors.delete(n);
                    this.deleteDanglingNodes(neighbor, quadtree);
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_7) throw e_7.error; }
            }
        }
    };
    /**
     * Given a segment, step along segment and find all nodes along it
     */
    Graph.prototype.getNodesAlongSegment = function (segment, quadtree, radius, step) {
        // Walk dstep along each streamline, adding nodes within dstep/2
        // and connected to this streamline (fuzzy - nodeAddRadius) to list, removing from
        // quadtree and adding them all back at the end
        var e_8, _a;
        var _this = this;
        var foundNodes = [];
        var nodesAlongSegment = [];
        var start = new vector_1.default(segment.from.x, segment.from.y);
        var end = new vector_1.default(segment.to.x, segment.to.y);
        var differenceVector = end.clone().sub(start);
        step = Math.min(step, differenceVector.length() / 2); // Min of 2 step along vector
        var steps = Math.ceil(differenceVector.length() / step);
        var differenceVectorLength = differenceVector.length();
        for (var i = 0; i <= steps; i++) {
            var currentPoint = start.clone().add(differenceVector.clone().multiplyScalar(i / steps));
            // Order nodes, not by 'closeness', but by dot product
            var nodesToAdd = [];
            var closestNode = quadtree.find(currentPoint.x, currentPoint.y, radius + step / 2);
            while (closestNode !== undefined) {
                quadtree.remove(closestNode);
                foundNodes.push(closestNode);
                var nodeOnSegment = false;
                try {
                    for (var _b = (e_8 = void 0, __values(closestNode.segments)), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var s = _c.value;
                        if (this.fuzzySegmentsEqual(s, segment)) {
                            nodeOnSegment = true;
                            break;
                        }
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
                if (nodeOnSegment) {
                    nodesToAdd.push(closestNode);
                }
                closestNode = quadtree.find(currentPoint.x, currentPoint.y, radius + step / 2);
            }
            nodesToAdd.sort(function (first, second) {
                return _this.dotProductToSegment(first, start, differenceVector) - _this.dotProductToSegment(second, start, differenceVector);
            });
            nodesAlongSegment.push.apply(nodesAlongSegment, __spreadArray([], __read(nodesToAdd), false));
        }
        quadtree.addAll(foundNodes);
        return nodesAlongSegment;
    };
    Graph.prototype.fuzzySegmentsEqual = function (s1, s2, tolerance) {
        if (tolerance === void 0) { tolerance = 0.0001; }
        // From
        if (s1.from.x - s2.from.x > tolerance) {
            return false;
        }
        if (s1.from.y - s2.from.y > tolerance) {
            return false;
        }
        // To
        if (s1.to.x - s2.to.x > tolerance) {
            return false;
        }
        if (s1.to.y - s2.to.y > tolerance) {
            return false;
        }
        return true;
    };
    Graph.prototype.dotProductToSegment = function (node, start, differenceVector) {
        var dotVector = node.value.clone().sub(start);
        return differenceVector.dot(dotVector);
    };
    Graph.prototype.fuzzyAddToQuadtree = function (quadtree, node, radius) {
        var e_9, _a, e_10, _b;
        // Only add if there isn't a node within radius
        // Remember to check for double radius when querying tree, or point might be missed
        var existingNode = quadtree.find(node.value.x, node.value.y, radius);
        if (existingNode === undefined) {
            quadtree.add(node);
        }
        else {
            try {
                for (var _c = __values(node.neighbors), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var neighbor = _d.value;
                    existingNode.addNeighbor(neighbor);
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_9) throw e_9.error; }
            }
            try {
                for (var _e = __values(node.segments), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var segment = _f.value;
                    existingNode.addSegment(segment);
                }
            }
            catch (e_10_1) { e_10 = { error: e_10_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_10) throw e_10.error; }
            }
        }
    };
    Graph.prototype.streamlinesToSegment = function (streamlines) {
        var e_11, _a;
        var out = [];
        try {
            for (var streamlines_3 = __values(streamlines), streamlines_3_1 = streamlines_3.next(); !streamlines_3_1.done; streamlines_3_1 = streamlines_3.next()) {
                var s = streamlines_3_1.value;
                for (var i = 0; i < s.length - 1; i++) {
                    out.push(this.vectorsToSegment(s[i], s[i + 1]));
                }
            }
        }
        catch (e_11_1) { e_11 = { error: e_11_1 }; }
        finally {
            try {
                if (streamlines_3_1 && !streamlines_3_1.done && (_a = streamlines_3.return)) _a.call(streamlines_3);
            }
            finally { if (e_11) throw e_11.error; }
        }
        return out;
    };
    Graph.prototype.vectorsToSegment = function (v1, v2) {
        return {
            from: v1,
            to: v2
        };
    };
    return Graph;
}());
exports.default = Graph;

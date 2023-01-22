"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var log = require("loglevel");
var polygon_util_1 = require("./polygon_util");
/**
 * Finds polygons in a graph, used for finding lots and parks
 */
var PolygonFinder = /** @class */ (function () {
    function PolygonFinder(nodes, params, tensorField) {
        this.nodes = nodes;
        this.params = params;
        this.tensorField = tensorField;
        this._polygons = [];
        this._shrunkPolygons = [];
        this._dividedPolygons = [];
        this.toShrink = [];
        this.toDivide = [];
    }
    Object.defineProperty(PolygonFinder.prototype, "polygons", {
        get: function () {
            if (this._dividedPolygons.length > 0) {
                return this._dividedPolygons;
            }
            if (this._shrunkPolygons.length > 0) {
                return this._shrunkPolygons;
            }
            return this._polygons;
        },
        enumerable: false,
        configurable: true
    });
    PolygonFinder.prototype.reset = function () {
        this.toShrink = [];
        this.toDivide = [];
        this._polygons = [];
        this._shrunkPolygons = [];
        this._dividedPolygons = [];
    };
    PolygonFinder.prototype.update = function () {
        var change = false;
        if (this.toShrink.length > 0) {
            var resolve = this.toShrink.length === 1;
            if (this.stepShrink(this.toShrink.pop())) {
                change = true;
            }
            if (resolve)
                this.resolveShrink();
        }
        if (this.toDivide.length > 0) {
            var resolve = this.toDivide.length === 1;
            if (this.stepDivide(this.toDivide.pop())) {
                change = true;
            }
            if (resolve)
                this.resolveDivide();
        }
        return change;
    };
    /**
     * Properly shrink polygon so the edges are all the same distance from the road
     */
    PolygonFinder.prototype.shrink = function (animate) {
        if (animate === void 0) { animate = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var e_1, _a;
                        if (_this._polygons.length === 0) {
                            _this.findPolygons();
                        }
                        if (animate) {
                            if (_this._polygons.length === 0) {
                                resolve();
                                return;
                            }
                            _this.toShrink = _this._polygons.slice();
                            _this.resolveShrink = resolve;
                        }
                        else {
                            _this._shrunkPolygons = [];
                            try {
                                for (var _b = __values(_this._polygons), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var p = _c.value;
                                    _this.stepShrink(p);
                                }
                            }
                            catch (e_1_1) { e_1 = { error: e_1_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_1) throw e_1.error; }
                            }
                            resolve();
                        }
                    })];
            });
        });
    };
    PolygonFinder.prototype.stepShrink = function (polygon) {
        var shrunk = polygon_util_1.default.resizeGeometry(polygon, -this.params.shrinkSpacing);
        if (shrunk.length > 0) {
            this._shrunkPolygons.push(shrunk);
            return true;
        }
        return false;
    };
    PolygonFinder.prototype.divide = function (animate) {
        if (animate === void 0) { animate = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var e_2, _a;
                        if (_this._polygons.length === 0) {
                            _this.findPolygons();
                        }
                        var polygons = _this._polygons;
                        if (_this._shrunkPolygons.length > 0) {
                            polygons = _this._shrunkPolygons;
                        }
                        if (animate) {
                            if (polygons.length === 0) {
                                resolve();
                                return;
                            }
                            _this.toDivide = polygons.slice();
                            _this.resolveDivide = resolve;
                        }
                        else {
                            _this._dividedPolygons = [];
                            try {
                                for (var polygons_1 = __values(polygons), polygons_1_1 = polygons_1.next(); !polygons_1_1.done; polygons_1_1 = polygons_1.next()) {
                                    var p = polygons_1_1.value;
                                    _this.stepDivide(p);
                                }
                            }
                            catch (e_2_1) { e_2 = { error: e_2_1 }; }
                            finally {
                                try {
                                    if (polygons_1_1 && !polygons_1_1.done && (_a = polygons_1.return)) _a.call(polygons_1);
                                }
                                finally { if (e_2) throw e_2.error; }
                            }
                            resolve();
                        }
                    })];
            });
        });
    };
    PolygonFinder.prototype.stepDivide = function (polygon) {
        var _a;
        // TODO need to filter shrunk polygons using aspect ratio, area 
        // this skips the filter in PolygonUtil.subdividePolygon
        if (this.params.chanceNoDivide > 0 && Math.random() < this.params.chanceNoDivide) {
            this._dividedPolygons.push(polygon);
            return true;
        }
        var divided = polygon_util_1.default.subdividePolygon(polygon, this.params.minArea);
        if (divided.length > 0) {
            (_a = this._dividedPolygons).push.apply(_a, __spreadArray([], __read(divided), false));
            return true;
        }
        return false;
    };
    PolygonFinder.prototype.findPolygons = function () {
        // Node
        // x, y, value (Vector2), adj (list of node refs)
        // Gonna edit adj for now
        var e_3, _a, e_4, _b;
        // Walk a clockwise path until polygon found or limit reached
        // When we find a polygon, mark all edges as traversed (in particular direction)
        // Each edge separates two polygons
        // If edge already traversed in this direction, this polygon has already been found
        this._shrunkPolygons = [];
        this._dividedPolygons = [];
        var polygons = [];
        try {
            for (var _c = __values(this.nodes), _d = _c.next(); !_d.done; _d = _c.next()) {
                var node = _d.value;
                if (node.adj.length < 2)
                    continue;
                try {
                    for (var _e = (e_4 = void 0, __values(node.adj)), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var nextNode = _f.value;
                        var polygon = this.recursiveWalk([node, nextNode]);
                        if (polygon !== null && polygon.length < this.params.maxLength) {
                            this.removePolygonAdjacencies(polygon);
                            polygons.push(polygon.map(function (n) { return n.value.clone(); }));
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_3) throw e_3.error; }
        }
        console.log('polygons size - ' + polygons.length);
        this._polygons = this.filterPolygonsByWater(polygons);
    };
    PolygonFinder.prototype.filterPolygonsByWater = function (polygons) {
        var e_5, _a;
        var out = [];
        try {
            for (var polygons_2 = __values(polygons), polygons_2_1 = polygons_2.next(); !polygons_2_1.done; polygons_2_1 = polygons_2.next()) {
                var p = polygons_2_1.value;
                var averagePoint = polygon_util_1.default.averagePoint(p);
                if (this.tensorField.onLand(averagePoint) && !this.tensorField.inParks(averagePoint))
                    out.push(p);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (polygons_2_1 && !polygons_2_1.done && (_a = polygons_2.return)) _a.call(polygons_2);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return out;
    };
    PolygonFinder.prototype.removePolygonAdjacencies = function (polygon) {
        for (var i = 0; i < polygon.length; i++) {
            var current = polygon[i];
            var next = polygon[(i + 1) % polygon.length];
            var index = current.adj.indexOf(next);
            if (index >= 0) {
                current.adj.splice(index, 1);
            }
            else {
                log.error("PolygonFinder - node not in adj");
            }
        }
    };
    PolygonFinder.prototype.recursiveWalk = function (visited, count) {
        if (count === void 0) { count = 0; }
        if (count >= this.params.maxLength)
            return null;
        // TODO backtracking to find polygons with dead end roads inside them
        var nextNode = this.getRightmostNode(visited[visited.length - 2], visited[visited.length - 1]);
        if (nextNode === null) {
            return null; // Currently ignores polygons with dead end inside
        }
        var visitedIndex = visited.indexOf(nextNode);
        if (visitedIndex >= 0) {
            return visited.slice(visitedIndex);
        }
        else {
            visited.push(nextNode);
            return this.recursiveWalk(visited, count++);
        }
    };
    PolygonFinder.prototype.getRightmostNode = function (nodeFrom, nodeTo) {
        var e_6, _a;
        // We want to turn right at every junction
        if (nodeTo.adj.length === 0)
            return null;
        var backwardsDifferenceVector = nodeFrom.value.clone().sub(nodeTo.value);
        var transformAngle = Math.atan2(backwardsDifferenceVector.y, backwardsDifferenceVector.x);
        var rightmostNode = null;
        var smallestTheta = Math.PI * 2;
        try {
            for (var _b = __values(nodeTo.adj), _c = _b.next(); !_c.done; _c = _b.next()) {
                var nextNode = _c.value;
                if (nextNode !== nodeFrom) {
                    var nextVector = nextNode.value.clone().sub(nodeTo.value);
                    var nextAngle = Math.atan2(nextVector.y, nextVector.x) - transformAngle;
                    if (nextAngle < 0) {
                        nextAngle += Math.PI * 2;
                    }
                    if (nextAngle < smallestTheta) {
                        smallestTheta = nextAngle;
                        rightmostNode = nextNode;
                    }
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
        }
        return rightmostNode;
    };
    return PolygonFinder;
}());
exports.default = PolygonFinder;

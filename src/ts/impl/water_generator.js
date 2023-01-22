"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var streamlines_1 = require("./streamlines");
var polygon_util_1 = require("./polygon_util");
/**
 * Integrates polylines to create coastline and river, with controllable noise
 */
var WaterGenerator = /** @class */ (function (_super) {
    __extends(WaterGenerator, _super);
    function WaterGenerator(integrator, origin, worldDimensions, params, tensorField) {
        var _this = _super.call(this, integrator, origin, worldDimensions, params) || this;
        _this.params = params;
        _this.tensorField = tensorField;
        _this.TRIES = 100;
        _this.coastlineMajor = true;
        _this._coastline = []; // Noisy line
        _this._seaPolygon = []; // Uses screen rectangle and simplified road
        _this._riverPolygon = []; // Simplified
        _this._riverSecondaryRoad = [];
        return _this;
    }
    Object.defineProperty(WaterGenerator.prototype, "coastline", {
        get: function () {
            return this._coastline;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WaterGenerator.prototype, "seaPolygon", {
        get: function () {
            return this._seaPolygon;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WaterGenerator.prototype, "riverPolygon", {
        get: function () {
            return this._riverPolygon;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WaterGenerator.prototype, "riverSecondaryRoad", {
        get: function () {
            return this._riverSecondaryRoad;
        },
        enumerable: false,
        configurable: true
    });
    WaterGenerator.prototype.createCoast = function () {
        var coastStreamline;
        var seed;
        var major;
        if (this.params.coastNoise.noiseEnabled) {
            this.tensorField.enableGlobalNoise(this.params.coastNoise.noiseAngle, this.params.coastNoise.noiseSize);
        }
        for (var i = 0; i < this.TRIES; i++) {
            major = Math.random() < 0.5;
            seed = this.getSeed(major);
            coastStreamline = this.extendStreamline(this.integrateStreamline(seed, major));
            if (this.reachesEdges(coastStreamline)) {
                break;
            }
        }
        this.tensorField.disableGlobalNoise();
        this._coastline = coastStreamline;
        this.coastlineMajor = major;
        var road = this.simplifyStreamline(coastStreamline);
        this._seaPolygon = this.getSeaPolygon(road);
        this.allStreamlinesSimple.push(road);
        this.tensorField.sea = (this._seaPolygon);
        // Create intermediate samples
        var complex = this.complexifyStreamline(road);
        this.grid(major).addPolyline(complex);
        this.streamlines(major).push(complex);
        this.allStreamlines.push(complex);
    };
    WaterGenerator.prototype.createRiver = function () {
        var _this = this;
        var riverStreamline;
        var seed;
        // Need to ignore sea when integrating for edge check
        var oldSea = this.tensorField.sea;
        this.tensorField.sea = [];
        if (this.params.riverNoise.noiseEnabled) {
            this.tensorField.enableGlobalNoise(this.params.riverNoise.noiseAngle, this.params.riverNoise.noiseSize);
        }
        for (var i = 0; i < this.TRIES; i++) {
            seed = this.getSeed(!this.coastlineMajor);
            riverStreamline = this.extendStreamline(this.integrateStreamline(seed, !this.coastlineMajor));
            if (this.reachesEdges(riverStreamline)) {
                break;
            }
            else if (i === this.TRIES - 1) {
                log.error('Failed to find river reaching edge');
            }
        }
        this.tensorField.sea = oldSea;
        this.tensorField.disableGlobalNoise();
        // Create river roads
        var expandedNoisy = this.complexifyStreamline(polygon_util_1.default.resizeGeometry(riverStreamline, this.params.riverSize, false));
        this._riverPolygon = polygon_util_1.default.resizeGeometry(riverStreamline, this.params.riverSize - this.params.riverBankSize, false);
        // Make sure riverPolygon[0] is off screen
        var firstOffScreen = expandedNoisy.findIndex(function (v) { return _this.vectorOffScreen(v); });
        for (var i = 0; i < firstOffScreen; i++) {
            expandedNoisy.push(expandedNoisy.shift());
        }
        // Create river roads
        var riverSplitPoly = this.getSeaPolygon(riverStreamline);
        var road1 = expandedNoisy.filter(function (v) {
            return !polygon_util_1.default.insidePolygon(v, _this._seaPolygon)
                && !_this.vectorOffScreen(v)
                && polygon_util_1.default.insidePolygon(v, riverSplitPoly);
        });
        var road1Simple = this.simplifyStreamline(road1);
        var road2 = expandedNoisy.filter(function (v) {
            return !polygon_util_1.default.insidePolygon(v, _this._seaPolygon)
                && !_this.vectorOffScreen(v)
                && !polygon_util_1.default.insidePolygon(v, riverSplitPoly);
        });
        var road2Simple = this.simplifyStreamline(road2);
        if (road1.length === 0 || road2.length === 0)
            return;
        if (road1[0].distanceToSquared(road2[0]) < road1[0].distanceToSquared(road2[road2.length - 1])) {
            road2Simple.reverse();
        }
        this.tensorField.river = road1Simple.concat(road2Simple);
        // Road 1
        this.allStreamlinesSimple.push(road1Simple);
        this._riverSecondaryRoad = road2Simple;
        this.grid(!this.coastlineMajor).addPolyline(road1);
        this.grid(!this.coastlineMajor).addPolyline(road2);
        this.streamlines(!this.coastlineMajor).push(road1);
        this.streamlines(!this.coastlineMajor).push(road2);
        this.allStreamlines.push(road1);
        this.allStreamlines.push(road2);
    };
    /**
     * Assumes simplified
     * Used for adding river roads
     */
    WaterGenerator.prototype.manuallyAddStreamline = function (s, major) {
        this.allStreamlinesSimple.push(s);
        // Create intermediate samples
        var complex = this.complexifyStreamline(s);
        this.grid(major).addPolyline(complex);
        this.streamlines(major).push(complex);
        this.allStreamlines.push(complex);
    };
    /**
     * Might reverse input array
     */
    WaterGenerator.prototype.getSeaPolygon = function (polyline) {
        // const seaPolygon = PolygonUtil.sliceRectangle(this.origin, this.worldDimensions,
        //     polyline[0], polyline[polyline.length - 1]);
        // // Replace the longest side with coastline
        // let longestIndex = 0;
        // let longestLength = 0;
        // for (let i = 0; i < seaPolygon.length; i++) {
        //     const next = (i + 1) % seaPolygon.length;
        //     const d = seaPolygon[i].distanceToSquared(seaPolygon[next]);
        //     if (d > longestLength) {
        //         longestLength = d;
        //         longestIndex = i;
        //     }
        // }
        // const insertBackwards = seaPolygon[longestIndex].distanceToSquared(polyline[0]) > seaPolygon[longestIndex].distanceToSquared(polyline[polyline.length - 1]);
        // if (insertBackwards) {
        //     polyline.reverse();
        // }
        // seaPolygon.splice((longestIndex + 1) % seaPolygon.length, 0, ...polyline);
        return polygon_util_1.default.lineRectanglePolygonIntersection(this.origin, this.worldDimensions, polyline);
        // return PolygonUtil.boundPolyToScreen(this.origin, this.worldDimensions, seaPolygon);
    };
    /**
     * Insert samples in streamline until separated by dstep
     */
    WaterGenerator.prototype.complexifyStreamline = function (s) {
        var out = [];
        for (var i = 0; i < s.length - 1; i++) {
            out.push.apply(out, __spreadArray([], __read(this.complexifyStreamlineRecursive(s[i], s[i + 1])), false));
        }
        return out;
    };
    WaterGenerator.prototype.complexifyStreamlineRecursive = function (v1, v2) {
        if (v1.distanceToSquared(v2) <= this.paramsSq.dstep) {
            return [v1, v2];
        }
        var d = v2.clone().sub(v1);
        var halfway = v1.clone().add(d.multiplyScalar(0.5));
        var complex = this.complexifyStreamlineRecursive(v1, halfway);
        complex.push.apply(complex, __spreadArray([], __read(this.complexifyStreamlineRecursive(halfway, v2)), false));
        return complex;
    };
    /**
     * Mutates streamline
     */
    WaterGenerator.prototype.extendStreamline = function (streamline) {
        streamline.unshift(streamline[0].clone().add(streamline[0].clone().sub(streamline[1]).setLength(this.params.dstep * 5)));
        streamline.push(streamline[streamline.length - 1].clone().add(streamline[streamline.length - 1].clone().sub(streamline[streamline.length - 2]).setLength(this.params.dstep * 5)));
        return streamline;
    };
    WaterGenerator.prototype.reachesEdges = function (streamline) {
        return this.vectorOffScreen(streamline[0]) && this.vectorOffScreen(streamline[streamline.length - 1]);
    };
    WaterGenerator.prototype.vectorOffScreen = function (v) {
        var toOrigin = v.clone().sub(this.origin);
        return toOrigin.x <= 0 || toOrigin.y <= 0 ||
            toOrigin.x >= this.worldDimensions.x || toOrigin.y >= this.worldDimensions.y;
    };
    return WaterGenerator;
}(streamlines_1.default));
exports.default = WaterGenerator;

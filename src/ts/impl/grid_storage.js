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
Object.defineProperty(exports, "__esModule", { value: true });
var vector_1 = require("../vector");
/**
 * Cartesian grid accelerated data structure
 * Grid of cells, each containing a list of vectors
 */
var GridStorage = /** @class */ (function () {
    /**
     * worldDimensions assumes origin of 0,0
     * @param {number} dsep Separation distance between samples
     */
    function GridStorage(worldDimensions, origin, dsep) {
        this.worldDimensions = worldDimensions;
        this.origin = origin;
        this.dsep = dsep;
        this.dsepSq = this.dsep * this.dsep;
        this.gridDimensions = worldDimensions.clone().divideScalar(this.dsep);
        this.grid = [];
        for (var x = 0; x < this.gridDimensions.x; x++) {
            this.grid.push([]);
            for (var y = 0; y < this.gridDimensions.y; y++) {
                this.grid[x].push([]);
            }
        }
    }
    /**
     * Add all samples from another grid to this one
     */
    GridStorage.prototype.addAll = function (gridStorage) {
        var e_1, _a, e_2, _b, e_3, _c;
        try {
            for (var _d = __values(gridStorage.grid), _e = _d.next(); !_e.done; _e = _d.next()) {
                var row = _e.value;
                try {
                    for (var row_1 = (e_2 = void 0, __values(row)), row_1_1 = row_1.next(); !row_1_1.done; row_1_1 = row_1.next()) {
                        var cell = row_1_1.value;
                        try {
                            for (var cell_1 = (e_3 = void 0, __values(cell)), cell_1_1 = cell_1.next(); !cell_1_1.done; cell_1_1 = cell_1.next()) {
                                var sample = cell_1_1.value;
                                this.addSample(sample);
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (cell_1_1 && !cell_1_1.done && (_c = cell_1.return)) _c.call(cell_1);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (row_1_1 && !row_1_1.done && (_b = row_1.return)) _b.call(row_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    GridStorage.prototype.addPolyline = function (line) {
        var e_4, _a;
        try {
            for (var line_1 = __values(line), line_1_1 = line_1.next(); !line_1_1.done; line_1_1 = line_1.next()) {
                var v = line_1_1.value;
                this.addSample(v);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (line_1_1 && !line_1_1.done && (_a = line_1.return)) _a.call(line_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    /**
     * Does not enforce separation
     * Does not clone
     */
    GridStorage.prototype.addSample = function (v, coords) {
        if (!coords) {
            coords = this.getSampleCoords(v);
        }
        this.grid[coords.x][coords.y].push(v);
    };
    /**
     * Tests whether v is at least d away from samples
     * Performance very important - this is called at every integration step
     * @param dSq=this.dsepSq squared test distance
     * Could be dtest if we are integrating a streamline
     */
    GridStorage.prototype.isValidSample = function (v, dSq) {
        // Code duplication with this.getNearbyPoints but much slower when calling
        // this.getNearbyPoints due to array creation in that method
        if (dSq === void 0) { dSq = this.dsepSq; }
        var coords = this.getSampleCoords(v);
        // Check samples in 9 cells in 3x3 grid
        for (var x = -1; x <= 1; x++) {
            for (var y = -1; y <= 1; y++) {
                var cell = coords.clone().add(new vector_1.default(x, y));
                if (!this.vectorOutOfBounds(cell, this.gridDimensions)) {
                    if (!this.vectorFarFromVectors(v, this.grid[cell.x][cell.y], dSq)) {
                        return false;
                    }
                }
            }
        }
        return true;
    };
    /**
     * Test whether v is at least d away from vectors
     * Performance very important - this is called at every integration step
     * @param {number}   dSq     squared test distance
     */
    GridStorage.prototype.vectorFarFromVectors = function (v, vectors, dSq) {
        var e_5, _a;
        try {
            for (var vectors_1 = __values(vectors), vectors_1_1 = vectors_1.next(); !vectors_1_1.done; vectors_1_1 = vectors_1.next()) {
                var sample = vectors_1_1.value;
                if (sample !== v) {
                    var distanceSq = sample.distanceToSquared(v);
                    if (distanceSq < dSq) {
                        return false;
                    }
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (vectors_1_1 && !vectors_1_1.done && (_a = vectors_1.return)) _a.call(vectors_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return true;
    };
    /**
     * Returns points in cells surrounding v
     * Results include v, if it exists in the grid
     * @param {number} returns samples (kind of) closer than distance - returns all samples in
     * cells so approximation (square to approximate circle)
     */
    GridStorage.prototype.getNearbyPoints = function (v, distance) {
        var e_6, _a;
        var radius = Math.ceil((distance / this.dsep) - 0.5);
        var coords = this.getSampleCoords(v);
        var out = [];
        for (var x = -1 * radius; x <= 1 * radius; x++) {
            for (var y = -1 * radius; y <= 1 * radius; y++) {
                var cell = coords.clone().add(new vector_1.default(x, y));
                if (!this.vectorOutOfBounds(cell, this.gridDimensions)) {
                    try {
                        for (var _b = (e_6 = void 0, __values(this.grid[cell.x][cell.y])), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var v2 = _c.value;
                            out.push(v2);
                        }
                    }
                    catch (e_6_1) { e_6 = { error: e_6_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_6) throw e_6.error; }
                    }
                }
            }
        }
        return out;
    };
    GridStorage.prototype.worldToGrid = function (v) {
        return v.clone().sub(this.origin);
    };
    GridStorage.prototype.gridToWorld = function (v) {
        return v.clone().add(this.origin);
    };
    GridStorage.prototype.vectorOutOfBounds = function (gridV, bounds) {
        return (gridV.x < 0 || gridV.y < 0 ||
            gridV.x >= bounds.x || gridV.y >= bounds.y);
    };
    /**
     * @return {Vector}   Cell coords corresponding to vector
     * Performance important - called at every integration step
     */
    GridStorage.prototype.getSampleCoords = function (worldV) {
        var v = this.worldToGrid(worldV);
        if (this.vectorOutOfBounds(v, this.worldDimensions)) {
            // log.error("Tried to access out-of-bounds sample in grid");
            return vector_1.default.zeroVector();
        }
        return new vector_1.default(Math.floor(v.x / this.dsep), Math.floor(v.y / this.dsep));
    };
    return GridStorage;
}());
exports.default = GridStorage;

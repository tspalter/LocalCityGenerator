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
// import * as noise from 'noisejs';
var SimplexNoise = require("simplex-noise");
var tensor_1 = require("./tensor");
var basis_field_1 = require("./basis_field");
var polygon_util_1 = require("./polygon_util");
/**
 * Combines basis fields
 * Noise added when sampling a point in a park
 */
var TensorField = /** @class */ (function () {
    function TensorField(noiseParams) {
        this.noiseParams = noiseParams;
        this.basisFields = [];
        this.parks = [];
        this.sea = [];
        this.river = [];
        this.ignoreRiver = false;
        this.smooth = false;
        this.noise = new SimplexNoise();
    }
    /**
     * Used when integrating coastline and river
     */
    TensorField.prototype.enableGlobalNoise = function (angle, size) {
        this.noiseParams.globalNoise = true;
        this.noiseParams.noiseAngleGlobal = angle;
        this.noiseParams.noiseSizeGlobal = size;
    };
    TensorField.prototype.disableGlobalNoise = function () {
        this.noiseParams.globalNoise = false;
    };
    TensorField.prototype.addGrid = function (centre, size, decay, theta) {
        var grid = new basis_field_1.Grid(centre, size, decay, theta);
        this.addField(grid);
    };
    TensorField.prototype.addRadial = function (centre, size, decay) {
        var radial = new basis_field_1.Radial(centre, size, decay);
        this.addField(radial);
    };
    TensorField.prototype.addField = function (field) {
        this.basisFields.push(field);
    };
    TensorField.prototype.removeField = function (field) {
        var index = this.basisFields.indexOf(field);
        if (index > -1) {
            this.basisFields.splice(index, 1);
        }
    };
    TensorField.prototype.reset = function () {
        this.basisFields = [];
        this.parks = [];
        this.sea = [];
        this.river = [];
    };
    TensorField.prototype.getCentrePoints = function () {
        return this.basisFields.map(function (field) { return field.centre; });
    };
    TensorField.prototype.getBasisFields = function () {
        return this.basisFields;
    };
    TensorField.prototype.samplePoint = function (point) {
        var _this = this;
        if (!this.onLand(point)) {
            // Degenerate point
            return tensor_1.default.zero;
        }
        // Default field is a grid
        if (this.basisFields.length === 0) {
            return new tensor_1.default(1, [0, 0]);
        }
        var tensorAcc = tensor_1.default.zero;
        this.basisFields.forEach(function (field) { return tensorAcc.add(field.getWeightedTensor(point, _this.smooth), _this.smooth); });
        // Add rotational noise for parks - range -pi/2 to pi/2
        if (this.parks.some(function (p) { return polygon_util_1.default.insidePolygon(point, p); })) {
            // TODO optimise insidePolygon e.g. distance
            tensorAcc.rotate(this.getRotationalNoise(point, this.noiseParams.noiseSizePark, this.noiseParams.noiseAnglePark));
        }
        if (this.noiseParams.globalNoise) {
            tensorAcc.rotate(this.getRotationalNoise(point, this.noiseParams.noiseSizeGlobal, this.noiseParams.noiseAngleGlobal));
        }
        return tensorAcc;
    };
    /**
     * Noise Angle is in degrees
     */
    TensorField.prototype.getRotationalNoise = function (point, noiseSize, noiseAngle) {
        return this.noise.noise2D(point.x / noiseSize, point.y / noiseSize) * noiseAngle * Math.PI / 180;
    };
    TensorField.prototype.onLand = function (point) {
        var inSea = polygon_util_1.default.insidePolygon(point, this.sea);
        if (this.ignoreRiver) {
            return !inSea;
        }
        return !inSea && !polygon_util_1.default.insidePolygon(point, this.river);
    };
    TensorField.prototype.inParks = function (point) {
        var e_1, _a;
        try {
            for (var _b = __values(this.parks), _c = _b.next(); !_c.done; _c = _b.next()) {
                var p = _c.value;
                if (polygon_util_1.default.insidePolygon(point, p))
                    return true;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return false;
    };
    return TensorField;
}());
exports.default = TensorField;

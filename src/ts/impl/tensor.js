"use strict";
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
var vector_1 = require("../vector");
var Tensor = /** @class */ (function () {
    function Tensor(r, matrix) {
        this.r = r;
        this.matrix = matrix;
        // Represent the matrix as a 2 element list
        // [ 0, 1
        //   1, -0 ]
        this.oldTheta = false;
        this._theta = this.calculateTheta();
    }
    Tensor.fromAngle = function (angle) {
        return new Tensor(1, [Math.cos(angle * 4), Math.sin(angle * 4)]);
    };
    Tensor.fromVector = function (vector) {
        var t1 = Math.pow(vector.x, 2) - Math.pow(vector.y, 2);
        var t2 = 2 * vector.x * vector.y;
        var t3 = Math.pow(t1, 2) - Math.pow(t2, 2);
        var t4 = 2 * t1 * t2;
        return new Tensor(1, [t3, t4]);
    };
    Object.defineProperty(Tensor, "zero", {
        get: function () {
            return new Tensor(0, [0, 0]);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tensor.prototype, "theta", {
        get: function () {
            if (this.oldTheta) {
                this._theta = this.calculateTheta();
                this.oldTheta = false;
            }
            return this._theta;
        },
        enumerable: false,
        configurable: true
    });
    Tensor.prototype.add = function (tensor, smooth) {
        var _this = this;
        this.matrix = this.matrix.map(function (v, i) { return v * _this.r + tensor.matrix[i] * tensor.r; });
        if (smooth) {
            this.r = Math.hypot.apply(Math, __spreadArray([], __read(this.matrix), false));
            this.matrix = this.matrix.map(function (v) { return v / _this.r; });
        }
        else {
            this.r = 2;
        }
        this.oldTheta = true;
        return this;
    };
    Tensor.prototype.scale = function (s) {
        this.r *= s;
        this.oldTheta = true;
        return this;
    };
    // Radians
    Tensor.prototype.rotate = function (theta) {
        if (theta === 0) {
            return this;
        }
        var newTheta = this.theta + theta;
        if (newTheta < Math.PI) {
            newTheta += Math.PI;
        }
        if (newTheta >= Math.PI) {
            newTheta -= Math.PI;
        }
        this.matrix[0] = Math.cos(2 * newTheta) * this.r;
        this.matrix[1] = Math.sin(2 * newTheta) * this.r;
        this._theta = newTheta;
        return this;
    };
    Tensor.prototype.getMajor = function () {
        // Degenerate case
        if (this.r === 0) {
            return vector_1.default.zeroVector();
        }
        return new vector_1.default(Math.cos(this.theta), Math.sin(this.theta));
    };
    Tensor.prototype.getMinor = function () {
        // Degenerate case
        if (this.r === 0) {
            return vector_1.default.zeroVector();
        }
        var angle = this.theta + Math.PI / 2;
        return new vector_1.default(Math.cos(angle), Math.sin(angle));
    };
    Tensor.prototype.calculateTheta = function () {
        if (this.r === 0) {
            return 0;
        }
        return Math.atan2(this.matrix[1] / this.r, this.matrix[0] / this.r) / 2;
    };
    return Tensor;
}());
exports.default = Tensor;

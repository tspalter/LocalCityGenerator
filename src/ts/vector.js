"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log = require("loglevel");
var Vector = /** @class */ (function () {
    function Vector(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector.zeroVector = function () {
        return new Vector(0, 0);
    };
    Vector.fromScalar = function (s) {
        return new Vector(s, s);
    };
    /**
     * -pi to pi
     */
    Vector.angleBetween = function (v1, v2) {
        // -2pi to 2pi
        var angleBetween = v1.angle() - v2.angle();
        if (angleBetween > Math.PI) {
            angleBetween -= 2 * Math.PI;
        }
        else if (angleBetween <= -Math.PI) {
            angleBetween += 2 * Math.PI;
        }
        return angleBetween;
    };
    /**
     * Tests whether a point lies to the left of a line
     * @param  {Vector} linePoint     Point on the line
     * @param  {Vector} lineDirection
     * @param  {Vector} point
     * @return {Vector}               true if left, false otherwise
     */
    Vector.isLeft = function (linePoint, lineDirection, point) {
        var perpendicularVector = new Vector(lineDirection.y, -lineDirection.x);
        return point.clone().sub(linePoint).dot(perpendicularVector) < 0;
    };
    Vector.prototype.add = function (v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    };
    /**
     * Angle in radians to positive x-axis between -pi and pi
     */
    Vector.prototype.angle = function () {
        return Math.atan2(this.y, this.x);
    };
    Vector.prototype.clone = function () {
        return new Vector(this.x, this.y);
    };
    Vector.prototype.copy = function (v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    };
    Vector.prototype.cross = function (v) {
        return this.x * v.y - this.y * v.x;
    };
    Vector.prototype.distanceTo = function (v) {
        return Math.sqrt(this.distanceToSquared(v));
    };
    Vector.prototype.distanceToSquared = function (v) {
        var dx = this.x - v.x;
        var dy = this.y - v.y;
        return dx * dx + dy * dy;
    };
    Vector.prototype.divide = function (v) {
        if (v.x === 0 || v.y === 0) {
            log.warn("Division by zero");
            return this;
        }
        this.x /= v.x;
        this.y /= v.y;
        return this;
    };
    Vector.prototype.divideScalar = function (s) {
        if (s === 0) {
            log.warn("Division by zero");
            return this;
        }
        return this.multiplyScalar(1 / s);
    };
    Vector.prototype.dot = function (v) {
        return this.x * v.x + this.y * v.y;
    };
    Vector.prototype.equals = function (v) {
        return ((v.x === this.x) && (v.y === this.y));
    };
    Vector.prototype.length = function () {
        return Math.sqrt(this.lengthSq());
    };
    Vector.prototype.lengthSq = function () {
        return this.x * this.x + this.y * this.y;
    };
    Vector.prototype.multiply = function (v) {
        this.x *= v.x;
        this.y *= v.y;
        return this;
    };
    Vector.prototype.multiplyScalar = function (s) {
        this.x *= s;
        this.y *= s;
        return this;
    };
    Vector.prototype.negate = function () {
        return this.multiplyScalar(-1);
    };
    Vector.prototype.normalize = function () {
        var l = this.length();
        if (l === 0) {
            log.warn("Zero Vector");
            return this;
        }
        return this.divideScalar(this.length());
    };
    /**
     * Angle in radians
     */
    Vector.prototype.rotateAround = function (center, angle) {
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        var x = this.x - center.x;
        var y = this.y - center.y;
        this.x = x * cos - y * sin + center.x;
        this.y = x * sin + y * cos + center.y;
        return this;
    };
    Vector.prototype.set = function (v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    };
    Vector.prototype.setX = function (x) {
        this.x = x;
        return this;
    };
    Vector.prototype.setY = function (y) {
        this.y = y;
        return this;
    };
    Vector.prototype.setLength = function (length) {
        return this.normalize().multiplyScalar(length);
    };
    Vector.prototype.sub = function (v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    };
    return Vector;
}());
exports.default = Vector;

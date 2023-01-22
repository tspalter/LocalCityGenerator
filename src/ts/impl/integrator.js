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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RK4Integrator = exports.EulerIntegrator = void 0;
var vector_1 = require("../vector");
var FieldIntegrator = /** @class */ (function () {
    function FieldIntegrator(field) {
        this.field = field;
    }
    FieldIntegrator.prototype.sampleFieldVector = function (point, major) {
        var tensor = this.field.samplePoint(point);
        if (major)
            return tensor.getMajor();
        return tensor.getMinor();
    };
    FieldIntegrator.prototype.onLand = function (point) {
        return this.field.onLand(point);
    };
    return FieldIntegrator;
}());
exports.default = FieldIntegrator;
var EulerIntegrator = /** @class */ (function (_super) {
    __extends(EulerIntegrator, _super);
    function EulerIntegrator(field, params) {
        var _this = _super.call(this, field) || this;
        _this.params = params;
        return _this;
    }
    EulerIntegrator.prototype.integrate = function (point, major) {
        return this.sampleFieldVector(point, major).multiplyScalar(this.params.dstep);
    };
    return EulerIntegrator;
}(FieldIntegrator));
exports.EulerIntegrator = EulerIntegrator;
var RK4Integrator = /** @class */ (function (_super) {
    __extends(RK4Integrator, _super);
    function RK4Integrator(field, params) {
        var _this = _super.call(this, field) || this;
        _this.params = params;
        return _this;
    }
    RK4Integrator.prototype.integrate = function (point, major) {
        var k1 = this.sampleFieldVector(point, major);
        var k23 = this.sampleFieldVector(point.clone().add(vector_1.default.fromScalar(this.params.dstep / 2)), major);
        var k4 = this.sampleFieldVector(point.clone().add(vector_1.default.fromScalar(this.params.dstep)), major);
        return k1.add(k23.multiplyScalar(4)).add(k4).multiplyScalar(this.params.dstep / 6);
    };
    return RK4Integrator;
}(FieldIntegrator));
exports.RK4Integrator = RK4Integrator;

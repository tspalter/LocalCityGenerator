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
exports.RoughCanvasWrapper = exports.DefaultCanvasWrapper = void 0;
var svg_js_1 = require("@svgdotjs/svg.js");
var util_1 = require("../util");
/**
 * Thin wrapper around HTML canvas, abstracts drawing functions so we can use the RoughJS canvas or the default one
 */
var CanvasWrapper = /** @class */ (function () {
    function CanvasWrapper(canvas, _scale, resizeToWindow) {
        if (_scale === void 0) { _scale = 1; }
        if (resizeToWindow === void 0) { resizeToWindow = true; }
        var _this = this;
        this.canvas = canvas;
        this._scale = _scale;
        this.needsUpdate = false;
        this.setDimensions();
        this.resizeCanvas();
        if (resizeToWindow) {
            window.addEventListener('resize', function () {
                _this.setDimensions();
                _this.resizeCanvas();
            });
        }
    }
    CanvasWrapper.prototype.appendSvgNode = function (node) {
        if (this.svgNode) {
            this.svgNode.appendChild(node);
        }
    };
    CanvasWrapper.prototype.createSVG = function (svgElement) {
        this.svgNode = svgElement;
    };
    CanvasWrapper.prototype.setDimensions = function () {
        this._width = window.innerWidth * this._scale;
        this._height = window.innerHeight * this._scale;
    };
    Object.defineProperty(CanvasWrapper.prototype, "width", {
        get: function () {
            return this._width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CanvasWrapper.prototype, "height", {
        get: function () {
            return this._height;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CanvasWrapper.prototype, "canvasScale", {
        get: function () {
            return this._scale;
        },
        set: function (s) {
            this._scale = s;
            this.setDimensions();
            this.resizeCanvas();
        },
        enumerable: false,
        configurable: true
    });
    CanvasWrapper.prototype.zoomVectors = function (vs) {
        var _this = this;
        if (this._scale === 1)
            return vs;
        return vs.map(function (v) { return v.clone().multiplyScalar(_this._scale); });
    };
    CanvasWrapper.prototype.resizeCanvas = function () {
        this.canvas.width = this._width;
        this.canvas.height = this._height;
        this.needsUpdate = true;
    };
    return CanvasWrapper;
}());
exports.default = CanvasWrapper;
var DefaultCanvasWrapper = /** @class */ (function (_super) {
    __extends(DefaultCanvasWrapper, _super);
    function DefaultCanvasWrapper(canvas, scale, resizeToWindow) {
        if (scale === void 0) { scale = 1; }
        if (resizeToWindow === void 0) { resizeToWindow = true; }
        var _this = _super.call(this, canvas, scale, resizeToWindow) || this;
        _this.ctx = canvas.getContext("2d");
        _this.ctx.fillStyle = 'black';
        _this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        return _this;
    }
    DefaultCanvasWrapper.prototype.createSVG = function (svgElement) {
        _super.prototype.createSVG.call(this, svgElement);
        this.svg = (0, svg_js_1.SVG)(svgElement);
    };
    DefaultCanvasWrapper.prototype.setFillStyle = function (colour) {
        this.ctx.fillStyle = colour;
    };
    DefaultCanvasWrapper.prototype.clearCanvas = function () {
        if (this.svgNode) {
            // Expanded to cover whole drawn area
            var startW = window.innerWidth * (util_1.default.DRAW_INFLATE_AMOUNT - 1) / 2;
            var startH = window.innerHeight * (util_1.default.DRAW_INFLATE_AMOUNT - 1) / 2;
            this.drawRectangle(-startW, -startH, window.innerWidth * util_1.default.DRAW_INFLATE_AMOUNT, window.innerHeight * util_1.default.DRAW_INFLATE_AMOUNT);
        }
        else {
            this.drawRectangle(0, 0, window.innerWidth, window.innerHeight);
        }
    };
    DefaultCanvasWrapper.prototype.drawFrame = function (left, right, up, down) {
        this.drawRectangle(0, 0, this._width / this._scale, up);
        this.drawRectangle(0, 0, left, this._height / this._scale);
        this.drawRectangle(this._width / this._scale - right, 0, right, this._height / this._scale);
        this.drawRectangle(0, this._height / this._scale - down, this._width / this._scale, down);
    };
    DefaultCanvasWrapper.prototype.drawCityName = function () {
        var fontSize = 50 * this._scale;
        this.ctx.font = "small-caps ".concat(fontSize, "px Verdana");
        this.ctx.textAlign = "center";
        this.ctx.fillText("san francisco", this._width / 2, this._height - (80 * this._scale - fontSize));
    };
    DefaultCanvasWrapper.prototype.drawRectangle = function (x, y, width, height) {
        if (this._scale !== 1) {
            x *= this._scale;
            y *= this._scale;
            width *= this._scale;
            height *= this._scale;
        }
        this.ctx.fillRect(x, y, width, height);
        if (this.svg) {
            this.svg.rect({
                fill: this.ctx.fillStyle,
                'fill-opacity': 1,
                stroke: this.ctx.strokeStyle,
                'stroke-width': this.ctx.lineWidth,
                x: x,
                y: y,
                width: width,
                height: height,
            });
        }
    };
    DefaultCanvasWrapper.prototype.drawPolygon = function (polygon) {
        if (polygon.length === 0) {
            return;
        }
        polygon = this.zoomVectors(polygon);
        this.ctx.beginPath();
        this.ctx.moveTo(polygon[0].x, polygon[0].y);
        for (var i = 1; i < polygon.length; i++) {
            this.ctx.lineTo(polygon[i].x, polygon[i].y);
        }
        this.ctx.lineTo(polygon[0].x, polygon[0].y);
        this.ctx.fill();
        this.ctx.stroke();
        if (this.svg) {
            var vectorArray = polygon.map(function (v) { return [v.x, v.y]; });
            vectorArray.push(vectorArray[0]);
            this.svg.polyline(vectorArray).attr({
                fill: this.ctx.fillStyle,
                'fill-opacity': 1,
                stroke: this.ctx.strokeStyle,
                'stroke-width': this.ctx.lineWidth,
            });
        }
    };
    DefaultCanvasWrapper.prototype.drawCircle = function (centre, radius) {
        var TAU = 2 * Math.PI;
        this.ctx.beginPath();
        this.ctx.arc(centre.x, centre.y, radius, 0, TAU);
        this.ctx.fill();
    };
    DefaultCanvasWrapper.prototype.drawSquare = function (centre, radius) {
        this.drawRectangle(centre.x - radius, centre.y - radius, 2 * radius, 2 * radius);
    };
    DefaultCanvasWrapper.prototype.setLineWidth = function (width) {
        if (this._scale !== 1) {
            width *= this._scale;
        }
        this.ctx.lineWidth = width;
    };
    DefaultCanvasWrapper.prototype.setStrokeStyle = function (colour) {
        this.ctx.strokeStyle = colour;
    };
    DefaultCanvasWrapper.prototype.drawPolyline = function (line) {
        if (line.length < 2) {
            return;
        }
        line = this.zoomVectors(line);
        this.ctx.beginPath();
        this.ctx.moveTo(line[0].x, line[0].y);
        for (var i = 1; i < line.length; i++) {
            this.ctx.lineTo(line[i].x, line[i].y);
        }
        this.ctx.stroke();
        if (this.svg) {
            var vectorArray = line.map(function (v) { return [v.x, v.y]; });
            this.svg.polyline(vectorArray).attr({
                'fill-opacity': 0,
                stroke: this.ctx.strokeStyle,
                'stroke-width': this.ctx.lineWidth,
            });
        }
    };
    return DefaultCanvasWrapper;
}(CanvasWrapper));
exports.DefaultCanvasWrapper = DefaultCanvasWrapper;
var RoughCanvasWrapper = /** @class */ (function (_super) {
    __extends(RoughCanvasWrapper, _super);
    function RoughCanvasWrapper(canvas, scale, resizeToWindow) {
        if (scale === void 0) { scale = 1; }
        if (resizeToWindow === void 0) { resizeToWindow = true; }
        var _this = _super.call(this, canvas, scale, resizeToWindow) || this;
        _this.r = require('roughjs/bundled/rough.cjs');
        _this.options = {
            roughness: 1,
            bowing: 1,
            stroke: '#000000',
            strokeWidth: 1,
            fill: '#000000',
            fillStyle: 'solid',
        };
        _this.rc = _this.r.canvas(canvas);
        return _this;
    }
    RoughCanvasWrapper.prototype.createSVG = function (svgElement) {
        _super.prototype.createSVG.call(this, svgElement);
        this.rc = this.r.svg(this.svgNode);
    };
    RoughCanvasWrapper.prototype.drawFrame = function (left, right, up, down) {
    };
    RoughCanvasWrapper.prototype.setOptions = function (options) {
        if (options.strokeWidth) {
            options.strokeWidth *= this._scale;
        }
        Object.assign(this.options, options);
    };
    RoughCanvasWrapper.prototype.clearCanvas = function () {
        if (this.svgNode) {
            // Expanded to cover whole drawn area
            var startW = window.innerWidth * (util_1.default.DRAW_INFLATE_AMOUNT - 1) / 2;
            var startH = window.innerHeight * (util_1.default.DRAW_INFLATE_AMOUNT - 1) / 2;
            this.drawRectangle(-startW, -startH, window.innerWidth * util_1.default.DRAW_INFLATE_AMOUNT, window.innerHeight * util_1.default.DRAW_INFLATE_AMOUNT);
        }
        else {
            this.drawRectangle(0, 0, window.innerWidth, window.innerHeight);
        }
    };
    RoughCanvasWrapper.prototype.drawRectangle = function (x, y, width, height) {
        if (this._scale !== 1) {
            x *= this._scale;
            y *= this._scale;
            width *= this._scale;
            height *= this._scale;
        }
        this.appendSvgNode(this.rc.rectangle(x, y, width, height, this.options));
    };
    RoughCanvasWrapper.prototype.drawPolygon = function (polygon) {
        var _this = this;
        if (polygon.length === 0) {
            return;
        }
        if (this._scale !== 1) {
            polygon = polygon.map(function (v) { return v.clone().multiplyScalar(_this._scale); });
        }
        this.appendSvgNode(this.rc.polygon(polygon.map(function (v) { return [v.x, v.y]; }), this.options));
    };
    RoughCanvasWrapper.prototype.drawSquare = function (centre, radius) {
        var prevStroke = this.options.stroke;
        this.options.stroke = 'none';
        this.drawRectangle(centre.x - radius, centre.y - radius, 2 * radius, 2 * radius);
        this.options.stroke = prevStroke;
    };
    RoughCanvasWrapper.prototype.drawPolyline = function (line) {
        var _this = this;
        if (line.length < 2) {
            return;
        }
        if (this._scale !== 1) {
            line = line.map(function (v) { return v.clone().multiplyScalar(_this._scale); });
        }
        this.appendSvgNode(this.rc.linearPath(line.map(function (v) { return [v.x, v.y]; }), this.options));
    };
    return RoughCanvasWrapper;
}(CanvasWrapper));
exports.RoughCanvasWrapper = RoughCanvasWrapper;

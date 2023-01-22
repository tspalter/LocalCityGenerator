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
exports.RoughStyle = exports.DefaultStyle = void 0;
var log = require("loglevel");
var canvas_wrapper_1 = require("./canvas_wrapper");
var util_1 = require("../util");
var domain_controller_1 = require("./domain_controller");
/**
 * Controls how screen-space data is drawn
 */
var Style = /** @class */ (function () {
    function Style(dragController, colourScheme) {
        this.dragController = dragController;
        this.colourScheme = colourScheme;
        this.domainController = domain_controller_1.default.getInstance();
        // Polygons
        this.seaPolygon = [];
        this.lots = [];
        this.buildingModels = [];
        this.parks = [];
        // Polylines
        this.coastline = [];
        this.river = [];
        this.secondaryRiver = [];
        this.minorRoads = [];
        this.majorRoads = [];
        this.mainRoads = [];
        this.coastlineRoads = [];
        if (!colourScheme.bgColour)
            log.error("ColourScheme Error - bgColour not defined");
        if (!colourScheme.seaColour)
            log.error("ColourScheme Error - seaColour not defined");
        if (!colourScheme.minorRoadColour)
            log.error("ColourScheme Error - minorRoadColour not defined");
        // Default colourscheme cascade
        if (!colourScheme.bgColourIn)
            colourScheme.bgColourIn = colourScheme.bgColour;
        if (!colourScheme.buildingColour)
            colourScheme.buildingColour = colourScheme.bgColour;
        if (!colourScheme.buildingStroke)
            colourScheme.buildingStroke = colourScheme.bgColour;
        if (!colourScheme.grassColour)
            colourScheme.grassColour = colourScheme.bgColour;
        if (!colourScheme.minorRoadOutline)
            colourScheme.minorRoadOutline = colourScheme.minorRoadColour;
        if (!colourScheme.majorRoadColour)
            colourScheme.majorRoadColour = colourScheme.minorRoadColour;
        if (!colourScheme.majorRoadOutline)
            colourScheme.majorRoadOutline = colourScheme.minorRoadOutline;
        if (!colourScheme.mainRoadColour)
            colourScheme.mainRoadColour = colourScheme.majorRoadColour;
        if (!colourScheme.mainRoadOutline)
            colourScheme.mainRoadOutline = colourScheme.majorRoadOutline;
        if (!colourScheme.outlineSize)
            colourScheme.outlineSize = 1;
        if (!colourScheme.zoomBuildings)
            colourScheme.zoomBuildings = false;
        if (!colourScheme.buildingModels)
            colourScheme.buildingModels = false;
        if (!colourScheme.minorWidth)
            colourScheme.minorWidth = 2;
        if (!colourScheme.majorWidth)
            colourScheme.majorWidth = 4;
        if (!colourScheme.mainWidth)
            colourScheme.mainWidth = 5;
        if (!colourScheme.mainWidth)
            colourScheme.mainWidth = 5;
        if (!colourScheme.frameColour)
            colourScheme.frameColour = colourScheme.bgColour;
        if (!colourScheme.frameTextColour)
            colourScheme.frameTextColour = colourScheme.minorRoadOutline;
        if (!colourScheme.buildingSideColour) {
            var parsedRgb = util_1.default.parseCSSColor(colourScheme.buildingColour).map(function (v) { return Math.max(0, v - 40); });
            if (parsedRgb) {
                colourScheme.buildingSideColour = "rgb(".concat(parsedRgb[0], ",").concat(parsedRgb[1], ",").concat(parsedRgb[2], ")");
            }
            else {
                colourScheme.buildingSideColour = colourScheme.buildingColour;
            }
        }
    }
    Style.prototype.update = function () { };
    Object.defineProperty(Style.prototype, "zoomBuildings", {
        set: function (b) {
            this.colourScheme.zoomBuildings = b;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "showBuildingModels", {
        get: function () {
            return this.colourScheme.buildingModels;
        },
        set: function (b) {
            this.colourScheme.buildingModels = b;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "canvasScale", {
        set: function (scale) {
            this.canvas.canvasScale = scale;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Style.prototype, "needsUpdate", {
        get: function () {
            return this.canvas.needsUpdate;
        },
        set: function (n) {
            this.canvas.needsUpdate = n;
        },
        enumerable: false,
        configurable: true
    });
    return Style;
}());
exports.default = Style;
var DefaultStyle = /** @class */ (function (_super) {
    __extends(DefaultStyle, _super);
    function DefaultStyle(c, dragController, colourScheme, heightmap) {
        if (heightmap === void 0) { heightmap = false; }
        var _this = _super.call(this, dragController, colourScheme) || this;
        _this.heightmap = heightmap;
        _this.canvas = _this.createCanvasWrapper(c, 1, true);
        return _this;
    }
    DefaultStyle.prototype.createCanvasWrapper = function (c, scale, resizeToWindow) {
        if (scale === void 0) { scale = 1; }
        if (resizeToWindow === void 0) { resizeToWindow = true; }
        return new canvas_wrapper_1.DefaultCanvasWrapper(c, scale, resizeToWindow);
    };
    DefaultStyle.prototype.draw = function (canvas) {
        var e_1, _a, e_2, _b, e_3, _c, e_4, _d, e_5, _e, e_6, _f, e_7, _g, e_8, _h, e_9, _j, e_10, _k, e_11, _l, e_12, _m, e_13, _o, e_14, _p;
        if (canvas === void 0) { canvas = this.canvas; }
        var bgColour;
        if (this.colourScheme.zoomBuildings) {
            bgColour = this.domainController.zoom >= 2 ? this.colourScheme.bgColourIn : this.colourScheme.bgColour;
        }
        else {
            bgColour = this.colourScheme.bgColour;
        }
        canvas.setFillStyle(bgColour);
        canvas.clearCanvas();
        // Sea
        canvas.setFillStyle(this.colourScheme.seaColour);
        canvas.setStrokeStyle(this.colourScheme.seaColour);
        canvas.setLineWidth(0.1);
        canvas.drawPolygon(this.seaPolygon);
        // Coastline
        canvas.setStrokeStyle(bgColour);
        canvas.setLineWidth(30 * this.domainController.zoom);
        canvas.drawPolyline(this.coastline);
        // Parks
        canvas.setLineWidth(1);
        canvas.setFillStyle(this.colourScheme.grassColour);
        try {
            for (var _q = __values(this.parks), _r = _q.next(); !_r.done; _r = _q.next()) {
                var p = _r.value;
                canvas.drawPolygon(p);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_r && !_r.done && (_a = _q.return)) _a.call(_q);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // River
        canvas.setFillStyle(this.colourScheme.seaColour);
        canvas.setStrokeStyle(this.colourScheme.seaColour);
        canvas.setLineWidth(1);
        canvas.drawPolygon(this.river);
        // Road outline
        canvas.setStrokeStyle(this.colourScheme.minorRoadOutline);
        canvas.setLineWidth(this.colourScheme.outlineSize + this.colourScheme.minorWidth * this.domainController.zoom);
        try {
            for (var _s = __values(this.minorRoads), _t = _s.next(); !_t.done; _t = _s.next()) {
                var s = _t.value;
                canvas.drawPolyline(s);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_t && !_t.done && (_b = _s.return)) _b.call(_s);
            }
            finally { if (e_2) throw e_2.error; }
        }
        canvas.setStrokeStyle(this.colourScheme.majorRoadOutline);
        canvas.setLineWidth(this.colourScheme.outlineSize + this.colourScheme.majorWidth * this.domainController.zoom);
        try {
            for (var _u = __values(this.majorRoads), _v = _u.next(); !_v.done; _v = _u.next()) {
                var s = _v.value;
                canvas.drawPolyline(s);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_v && !_v.done && (_c = _u.return)) _c.call(_u);
            }
            finally { if (e_3) throw e_3.error; }
        }
        canvas.drawPolyline(this.secondaryRiver);
        canvas.setStrokeStyle(this.colourScheme.mainRoadOutline);
        canvas.setLineWidth(this.colourScheme.outlineSize + this.colourScheme.mainWidth * this.domainController.zoom);
        try {
            for (var _w = __values(this.mainRoads), _x = _w.next(); !_x.done; _x = _w.next()) {
                var s = _x.value;
                canvas.drawPolyline(s);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_x && !_x.done && (_d = _w.return)) _d.call(_w);
            }
            finally { if (e_4) throw e_4.error; }
        }
        try {
            for (var _y = __values(this.coastlineRoads), _z = _y.next(); !_z.done; _z = _y.next()) {
                var s = _z.value;
                canvas.drawPolyline(s);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_z && !_z.done && (_e = _y.return)) _e.call(_y);
            }
            finally { if (e_5) throw e_5.error; }
        }
        // Road inline
        canvas.setStrokeStyle(this.colourScheme.minorRoadColour);
        canvas.setLineWidth(this.colourScheme.minorWidth * this.domainController.zoom);
        try {
            for (var _0 = __values(this.minorRoads), _1 = _0.next(); !_1.done; _1 = _0.next()) {
                var s = _1.value;
                canvas.drawPolyline(s);
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_1 && !_1.done && (_f = _0.return)) _f.call(_0);
            }
            finally { if (e_6) throw e_6.error; }
        }
        canvas.setStrokeStyle(this.colourScheme.majorRoadColour);
        canvas.setLineWidth(this.colourScheme.majorWidth * this.domainController.zoom);
        try {
            for (var _2 = __values(this.majorRoads), _3 = _2.next(); !_3.done; _3 = _2.next()) {
                var s = _3.value;
                canvas.drawPolyline(s);
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_3 && !_3.done && (_g = _2.return)) _g.call(_2);
            }
            finally { if (e_7) throw e_7.error; }
        }
        canvas.drawPolyline(this.secondaryRiver);
        canvas.setStrokeStyle(this.colourScheme.mainRoadColour);
        canvas.setLineWidth(this.colourScheme.mainWidth * this.domainController.zoom);
        try {
            for (var _4 = __values(this.mainRoads), _5 = _4.next(); !_5.done; _5 = _4.next()) {
                var s = _5.value;
                canvas.drawPolyline(s);
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (_5 && !_5.done && (_h = _4.return)) _h.call(_4);
            }
            finally { if (e_8) throw e_8.error; }
        }
        try {
            for (var _6 = __values(this.coastlineRoads), _7 = _6.next(); !_7.done; _7 = _6.next()) {
                var s = _7.value;
                canvas.drawPolyline(s);
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (_7 && !_7.done && (_j = _6.return)) _j.call(_6);
            }
            finally { if (e_9) throw e_9.error; }
        }
        canvas.setLineWidth(1);
        if (this.heightmap) {
            var _loop_1 = function (b) {
                // Colour based on height
                var parsedRgb = util_1.default.parseCSSColor(this_1.colourScheme.bgColour).map(function (v) { return Math.min(255, v + (b.height * 3.5)); });
                canvas.setFillStyle("rgb(".concat(parsedRgb[0], ",").concat(parsedRgb[1], ",").concat(parsedRgb[2], ")"));
                canvas.setStrokeStyle("rgb(".concat(parsedRgb[0], ",").concat(parsedRgb[1], ",").concat(parsedRgb[2], ")"));
                canvas.drawPolygon(b.lotScreen);
            };
            var this_1 = this;
            try {
                for (var _8 = __values(this.buildingModels), _9 = _8.next(); !_9.done; _9 = _8.next()) {
                    var b = _9.value;
                    _loop_1(b);
                }
            }
            catch (e_10_1) { e_10 = { error: e_10_1 }; }
            finally {
                try {
                    if (_9 && !_9.done && (_k = _8.return)) _k.call(_8);
                }
                finally { if (e_10) throw e_10.error; }
            }
        }
        else {
            // Buildings
            if (!this.colourScheme.zoomBuildings || this.domainController.zoom >= 2) {
                canvas.setFillStyle(this.colourScheme.buildingColour);
                canvas.setStrokeStyle(this.colourScheme.buildingStroke);
                try {
                    for (var _10 = __values(this.lots), _11 = _10.next(); !_11.done; _11 = _10.next()) {
                        var b = _11.value;
                        canvas.drawPolygon(b);
                    }
                }
                catch (e_11_1) { e_11 = { error: e_11_1 }; }
                finally {
                    try {
                        if (_11 && !_11.done && (_l = _10.return)) _l.call(_10);
                    }
                    finally { if (e_11) throw e_11.error; }
                }
            }
            // Pseudo-3D
            if (this.colourScheme.buildingModels && (!this.colourScheme.zoomBuildings || this.domainController.zoom >= 2.5)) {
                canvas.setFillStyle(this.colourScheme.buildingSideColour);
                canvas.setStrokeStyle(this.colourScheme.buildingSideColour);
                try {
                    // This is a cheap approximation that often creates visual artefacts
                    // Draws building sides, then rooves instead of properly clipping polygons etc.
                    for (var _12 = __values(this.buildingModels), _13 = _12.next(); !_13.done; _13 = _12.next()) {
                        var b = _13.value;
                        try {
                            for (var _14 = (e_13 = void 0, __values(b.sides)), _15 = _14.next(); !_15.done; _15 = _14.next()) {
                                var s = _15.value;
                                canvas.drawPolygon(s);
                            }
                        }
                        catch (e_13_1) { e_13 = { error: e_13_1 }; }
                        finally {
                            try {
                                if (_15 && !_15.done && (_o = _14.return)) _o.call(_14);
                            }
                            finally { if (e_13) throw e_13.error; }
                        }
                    }
                }
                catch (e_12_1) { e_12 = { error: e_12_1 }; }
                finally {
                    try {
                        if (_13 && !_13.done && (_m = _12.return)) _m.call(_12);
                    }
                    finally { if (e_12) throw e_12.error; }
                }
                canvas.setFillStyle(this.colourScheme.buildingColour);
                canvas.setStrokeStyle(this.colourScheme.buildingStroke);
                try {
                    for (var _16 = __values(this.buildingModels), _17 = _16.next(); !_17.done; _17 = _16.next()) {
                        var b = _17.value;
                        canvas.drawPolygon(b.roof);
                    }
                }
                catch (e_14_1) { e_14 = { error: e_14_1 }; }
                finally {
                    try {
                        if (_17 && !_17.done && (_p = _16.return)) _p.call(_16);
                    }
                    finally { if (e_14) throw e_14.error; }
                }
            }
        }
        if (this.showFrame) {
            canvas.setFillStyle(this.colourScheme.frameColour);
            canvas.setStrokeStyle(this.colourScheme.frameColour);
            canvas.drawFrame(30, 30, 30, 30);
            // canvas.setFillStyle(this.colourScheme.frameTextColour);
            // canvas.drawCityName();
        }
    };
    return DefaultStyle;
}(Style));
exports.DefaultStyle = DefaultStyle;
var RoughStyle = /** @class */ (function (_super) {
    __extends(RoughStyle, _super);
    function RoughStyle(c, dragController, colourScheme) {
        var _this = _super.call(this, dragController, colourScheme) || this;
        _this.dragging = false;
        _this.canvas = _this.createCanvasWrapper(c, 1, true);
        return _this;
    }
    RoughStyle.prototype.createCanvasWrapper = function (c, scale, resizeToWindow) {
        if (scale === void 0) { scale = 1; }
        if (resizeToWindow === void 0) { resizeToWindow = true; }
        return new canvas_wrapper_1.RoughCanvasWrapper(c, scale, resizeToWindow);
    };
    RoughStyle.prototype.update = function () {
        var dragging = this.dragController.isDragging || this.domainController.isScrolling;
        if (!dragging && this.dragging)
            this.canvas.needsUpdate = true;
        this.dragging = dragging;
    };
    RoughStyle.prototype.draw = function (canvas) {
        var e_15, _a, e_16, _b, e_17, _c, e_18, _d, e_19, _e;
        if (canvas === void 0) { canvas = this.canvas; }
        canvas.setOptions({
            fill: this.colourScheme.bgColour,
            roughness: 1,
            bowing: 1,
            fillStyle: 'solid',
            stroke: "none",
        });
        canvas.clearCanvas();
        // Sea
        canvas.setOptions({
            roughness: 0,
            fillWeight: 1,
            fill: this.colourScheme.seaColour,
            fillStyle: 'solid',
            stroke: "none",
            strokeWidth: 1,
        });
        canvas.drawPolygon(this.seaPolygon);
        canvas.setOptions({
            stroke: this.colourScheme.bgColour,
            strokeWidth: 30,
        });
        canvas.drawPolyline(this.coastline);
        canvas.setOptions({
            roughness: 0,
            fillWeight: 1,
            fill: this.colourScheme.seaColour,
            fillStyle: 'solid',
            stroke: "none",
            strokeWidth: 1,
        });
        canvas.drawPolygon(this.river);
        // Parks
        canvas.setOptions({
            fill: this.colourScheme.grassColour,
        });
        this.parks.forEach(function (p) { return canvas.drawPolygon(p); });
        // Roads
        canvas.setOptions({
            stroke: this.colourScheme.minorRoadColour,
            strokeWidth: 1,
            fill: 'none',
        });
        this.minorRoads.forEach(function (s) { return canvas.drawPolyline(s); });
        canvas.setOptions({
            strokeWidth: 2,
            stroke: this.colourScheme.majorRoadColour,
        });
        this.majorRoads.forEach(function (s) { return canvas.drawPolyline(s); });
        canvas.drawPolyline(this.secondaryRiver);
        canvas.setOptions({
            strokeWidth: 3,
            stroke: this.colourScheme.mainRoadColour,
        });
        this.mainRoads.forEach(function (s) { return canvas.drawPolyline(s); });
        this.coastlineRoads.forEach(function (s) { return canvas.drawPolyline(s); });
        // Buildings
        if (!this.dragging) {
            // Lots
            if (!this.colourScheme.zoomBuildings || this.domainController.zoom >= 2) {
                // Lots
                canvas.setOptions({
                    roughness: 1.2,
                    stroke: this.colourScheme.buildingStroke,
                    strokeWidth: 1,
                    fill: '',
                });
                try {
                    for (var _f = __values(this.lots), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var b = _g.value;
                        canvas.drawPolygon(b);
                    }
                }
                catch (e_15_1) { e_15 = { error: e_15_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
                    }
                    finally { if (e_15) throw e_15.error; }
                }
            }
            // Pseudo-3D
            if (this.colourScheme.buildingModels && (!this.colourScheme.zoomBuildings || this.domainController.zoom >= 2.5)) {
                // Pseudo-3D
                canvas.setOptions({
                    roughness: 1.2,
                    stroke: this.colourScheme.buildingStroke,
                    strokeWidth: 1,
                    fill: this.colourScheme.buildingSideColour,
                });
                // TODO this can be hugely improved
                var allSidesDistances = [];
                var camera = this.domainController.getCameraPosition();
                try {
                    for (var _h = __values(this.buildingModels), _j = _h.next(); !_j.done; _j = _h.next()) {
                        var b = _j.value;
                        try {
                            for (var _k = (e_17 = void 0, __values(b.sides)), _l = _k.next(); !_l.done; _l = _k.next()) {
                                var s = _l.value;
                                var averagePoint = s[0].clone().add(s[1]).divideScalar(2);
                                allSidesDistances.push([averagePoint.distanceToSquared(camera), s]);
                            }
                        }
                        catch (e_17_1) { e_17 = { error: e_17_1 }; }
                        finally {
                            try {
                                if (_l && !_l.done && (_c = _k.return)) _c.call(_k);
                            }
                            finally { if (e_17) throw e_17.error; }
                        }
                    }
                }
                catch (e_16_1) { e_16 = { error: e_16_1 }; }
                finally {
                    try {
                        if (_j && !_j.done && (_b = _h.return)) _b.call(_h);
                    }
                    finally { if (e_16) throw e_16.error; }
                }
                allSidesDistances.sort(function (a, b) { return b[0] - a[0]; });
                try {
                    for (var allSidesDistances_1 = __values(allSidesDistances), allSidesDistances_1_1 = allSidesDistances_1.next(); !allSidesDistances_1_1.done; allSidesDistances_1_1 = allSidesDistances_1.next()) {
                        var p = allSidesDistances_1_1.value;
                        canvas.drawPolygon(p[1]);
                    }
                }
                catch (e_18_1) { e_18 = { error: e_18_1 }; }
                finally {
                    try {
                        if (allSidesDistances_1_1 && !allSidesDistances_1_1.done && (_d = allSidesDistances_1.return)) _d.call(allSidesDistances_1);
                    }
                    finally { if (e_18) throw e_18.error; }
                }
                canvas.setOptions({
                    roughness: 1.2,
                    stroke: this.colourScheme.buildingStroke,
                    strokeWidth: 1,
                    fill: this.colourScheme.buildingColour,
                });
                try {
                    for (var _m = __values(this.buildingModels), _o = _m.next(); !_o.done; _o = _m.next()) {
                        var b = _o.value;
                        canvas.drawPolygon(b.roof);
                    }
                }
                catch (e_19_1) { e_19 = { error: e_19_1 }; }
                finally {
                    try {
                        if (_o && !_o.done && (_e = _m.return)) _e.call(_m);
                    }
                    finally { if (e_19) throw e_19.error; }
                }
            }
        }
    };
    return RoughStyle;
}(Style));
exports.RoughStyle = RoughStyle;

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
Object.defineProperty(exports, "__esModule", { value: true });
var graph_1 = require("../impl/graph");
var vector_1 = require("../vector");
var polygon_finder_1 = require("../impl/polygon_finder");
/**
 * Pseudo 3D buildings
 */
var BuildingModels = /** @class */ (function () {
    function BuildingModels(lots) {
        var e_1, _a;
        // private domainController = DomainController.getInstance();
        this.origin = vector_1.default.zeroVector();
        this.worldDimensions = new vector_1.default(1440, 1080);
        this.zoom = 1;
        this.orthographic = false;
        this._buildingModels = [];
        try {
            for (var lots_1 = __values(lots), lots_1_1 = lots_1.next(); !lots_1_1.done; lots_1_1 = lots_1.next()) {
                var lot = lots_1_1.value;
                this._buildingModels.push({
                    height: Math.random() * 20 + 20,
                    lotWorld: lot,
                    lotScreen: [],
                    roof: [],
                    sides: []
                });
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (lots_1_1 && !lots_1_1.done && (_a = lots_1.return)) _a.call(lots_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this._buildingModels.sort(function (a, b) { return a.height - b.height; });
    }
    Object.defineProperty(BuildingModels.prototype, "buildingModels", {
        get: function () {
            return this._buildingModels;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Recalculated when the camera moves
     */
    BuildingModels.prototype.setBuildingProjections = function () {
        var e_2, _a;
        var _this = this;
        var d = 1000 / this.zoom;
        var cameraPos = this.getCameraPosition();
        var _loop_1 = function (b) {
            b.lotScreen = b.lotWorld.map(function (v) { return _this.worldToScreen(v.clone()); });
            b.roof = b.lotScreen.map(function (v) { return _this.heightVectorToScreen(v, b.height, d, cameraPos); });
            b.sides = this_1.getBuildingSides(b);
        };
        var this_1 = this;
        try {
            for (var _b = __values(this._buildingModels), _c = _b.next(); !_c.done; _c = _b.next()) {
                var b = _c.value;
                _loop_1(b);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    BuildingModels.prototype.heightVectorToScreen = function (v, h, d, camera) {
        var scale = (d / (d - h)); // 0.1
        if (this.orthographic) {
            // const diff = this.domainController.cameraDirection.multiplyScalar(-h * scale);
            return v.clone().add(vector_1.default.zeroVector());
        }
        else {
            return v.clone().sub(camera).multiplyScalar(scale).add(camera);
        }
    };
    /**
     * Get sides of buildings by joining corresponding edges between the roof and ground
     */
    BuildingModels.prototype.getBuildingSides = function (b) {
        var polygons = [];
        for (var i = 0; i < b.lotScreen.length; i++) {
            var next = (i + 1) % b.lotScreen.length;
            polygons.push([b.lotScreen[i], b.lotScreen[next], b.roof[next], b.roof[i]]);
        }
        return polygons;
    };
    /**
 * Edits vector
 */
    BuildingModels.prototype.zoomToWorld = function (v) {
        return v.divideScalar(this.zoom);
    };
    /**
     * Edits vector
     */
    BuildingModels.prototype.zoomToScreen = function (v) {
        return v.multiplyScalar(this.zoom);
    };
    /**
     * Edits vector
     */
    BuildingModels.prototype.screenToWorld = function (v) {
        return this.zoomToWorld(v).add(this.origin);
    };
    /**
     * Edits vector
     */
    BuildingModels.prototype.worldToScreen = function (v) {
        return this.zoomToScreen(v.sub(this.origin));
    };
    BuildingModels.prototype.getCameraPosition = function () {
        var centre = new vector_1.default(this.worldDimensions.x / 2, this.worldDimensions.y / 2);
        if (this.orthographic) {
            return centre.add(centre.clone().multiply(vector_1.default.zeroVector()).multiplyScalar(100));
        }
        return centre.add(centre.clone().multiply(vector_1.default.zeroVector()));
        // this.screenDimensions.divideScalar(2);
    };
    return BuildingModels;
}());
/**
 * Finds building lots and optionally pseudo3D buildings
 */
var Buildings = /** @class */ (function () {
    function Buildings(tensorField, 
    /*folder: dat.GUI,*/
    redraw, dstep, _animate) {
        this.tensorField = tensorField;
        this.redraw = redraw;
        this.dstep = dstep;
        this._animate = _animate;
        this.allStreamlines = [];
        // private domainController = DomainController.getInstance();
        this.origin = vector_1.default.zeroVector();
        this.worldDimensions = new vector_1.default(1440, 1080);
        this.zoom = 1;
        this.preGenerateCallback = function () { };
        this.postGenerateCallback = function () { };
        this._models = new BuildingModels([]);
        this._blocks = [];
        this.buildingParams = {
            maxLength: 20,
            minArea: 50,
            shrinkSpacing: 4,
            chanceNoDivide: 0.05,
        };
        // folder.add({'AddBuildings': () => this.generate(this._animate)}, 'AddBuildings');
        // folder.add(this.buildingParams, 'minArea');
        // folder.add(this.buildingParams, 'shrinkSpacing');
        // folder.add(this.buildingParams, 'chanceNoDivide');
        this.polygonFinder = new polygon_finder_1.default([], this.buildingParams, this.tensorField);
    }
    Object.defineProperty(Buildings.prototype, "animate", {
        set: function (v) {
            this._animate = v;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Buildings.prototype, "lots", {
        get: function () {
            var _this = this;
            return this.polygonFinder.polygons.map(function (p) { return p.map(function (v) { return _this.worldToScreen(v.clone()); }); });
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Only used when creating the 3D model to 'fake' the roads
     */
    Buildings.prototype.getBlocks = function () {
        var _this = this;
        var g = new graph_1.default(this.allStreamlines, this.dstep, true);
        var blockParams = Object.assign({}, this.buildingParams);
        blockParams.shrinkSpacing = blockParams.shrinkSpacing / 2;
        var polygonFinder = new polygon_finder_1.default(g.nodes, blockParams, this.tensorField);
        polygonFinder.findPolygons();
        return polygonFinder.shrink(false).then(function () { return polygonFinder.polygons.map(function (p) { return p.map(function (v) { return _this.worldToScreen(v.clone()); }); }); });
    };
    Object.defineProperty(Buildings.prototype, "models", {
        get: function () {
            this._models.setBuildingProjections();
            return this._models.buildingModels;
        },
        enumerable: false,
        configurable: true
    });
    Buildings.prototype.setAllStreamlines = function (s) {
        this.allStreamlines = s;
    };
    Buildings.prototype.reset = function () {
        this.polygonFinder.reset();
        this._models = new BuildingModels([]);
    };
    Buildings.prototype.update = function () {
        return this.polygonFinder.update();
    };
    /**
     * Finds blocks, shrinks and divides them to create building lots
     */
    Buildings.prototype.generate = function (animate) {
        return __awaiter(this, void 0, void 0, function () {
            var g;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('begin of buildings.generate');
                        console.log('  calling preGenerateCallback');
                        console.log('  allStreamlines.length - ' + this.allStreamlines.length);
                        this.preGenerateCallback();
                        console.log('  allStreamlines.length - ' + this.allStreamlines.length);
                        this._models = new BuildingModels([]);
                        g = new graph_1.default(this.allStreamlines, this.dstep, true);
                        this.polygonFinder = new polygon_finder_1.default(g.nodes, this.buildingParams, this.tensorField);
                        this.polygonFinder.findPolygons();
                        return [4 /*yield*/, this.polygonFinder.shrink(animate)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.polygonFinder.divide(animate)];
                    case 2:
                        _a.sent();
                        this.redraw();
                        console.log('  polygons length - ' + this.polygonFinder.polygons.length);
                        this._models = new BuildingModels(this.polygonFinder.polygons);
                        this.postGenerateCallback();
                        return [2 /*return*/];
                }
            });
        });
    };
    Buildings.prototype.setPreGenerateCallback = function (callback) {
        this.preGenerateCallback = callback;
    };
    Buildings.prototype.setPostGenerateCallback = function (callback) {
        this.postGenerateCallback = callback;
    };
    /**
     * Edits vector
     */
    Buildings.prototype.zoomToWorld = function (v) {
        return v.divideScalar(this.zoom);
    };
    /**
     * Edits vector
     */
    Buildings.prototype.zoomToScreen = function (v) {
        return v.multiplyScalar(this.zoom);
    };
    /**
     * Edits vector
     */
    Buildings.prototype.screenToWorld = function (v) {
        return this.zoomToWorld(v).add(this.origin);
    };
    /**
     * Edits vector
     */
    Buildings.prototype.worldToScreen = function (v) {
        return this.zoomToScreen(v.sub(this.origin));
    };
    return Buildings;
}());
exports.default = Buildings;

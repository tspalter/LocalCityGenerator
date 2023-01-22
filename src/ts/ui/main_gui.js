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
var integrator_1 = require("../impl/integrator");
var graph_1 = require("../impl/graph");
var road_gui_1 = require("./road_gui");
var water_gui_1 = require("./water_gui");
var vector_1 = require("../vector");
var polygon_finder_1 = require("../impl/polygon_finder");
var style_1 = require("./style");
var buildings_1 = require("./buildings");
var polygon_util_1 = require("../impl/polygon_util");
var model_generator_1 = require("../model_generator");
var util_1 = require("../util");
/**
 * Handles Map folder, glues together impl
 */
var MainGUI = /** @class */ (function () {
    function MainGUI(/*private guiFolder: dat.GUI, */ tensorField /*, private closeTensorFolder: () => void*/) {
        // guiFolder.add(this, 'generateEverything');
        // guiFolder.add(this, 'simpleBenchMark');
        // const animateController = guiFolder.add(this, 'animate');
        // guiFolder.add(this, 'animationSpeed');
        var _this = this;
        this.tensorField = tensorField;
        this.numBigParks = 2;
        this.numSmallParks = 0;
        this.clusterBigParks = false;
        // private domainController = DomainController.getInstance();
        this.moved = false;
        this.zoom = 1;
        this.origin = vector_1.default.zeroVector();
        this.screenDimensions = new vector_1.default(1440, 1080);
        this.intersections = [];
        this.bigParks = [];
        this.smallParks = [];
        this.animate = true;
        this.animationSpeed = 30;
        this.minorParams = {
            dsep: 20,
            dtest: 15,
            dstep: 1,
            dlookahead: 40,
            dcirclejoin: 5,
            joinangle: 0.1,
            pathIterations: 1000,
            seedTries: 300,
            simplifyTolerance: 0.5,
            collideEarly: 0,
        };
        this.redraw = true;
        this.coastlineParams = Object.assign({
            coastNoise: {
                noiseEnabled: true,
                noiseSize: 30,
                noiseAngle: 20,
            },
            riverNoise: {
                noiseEnabled: true,
                noiseSize: 30,
                noiseAngle: 20,
            },
            riverBankSize: 10,
            riverSize: 30,
        }, this.minorParams);
        this.coastlineParams.pathIterations = 10000;
        this.coastlineParams.simplifyTolerance = 10;
        this.majorParams = Object.assign({}, this.minorParams);
        this.majorParams.dsep = 100;
        this.majorParams.dtest = 30;
        this.majorParams.dlookahead = 200;
        this.majorParams.collideEarly = 0;
        this.mainParams = Object.assign({}, this.minorParams);
        this.mainParams.dsep = 400;
        this.mainParams.dtest = 200;
        this.mainParams.dlookahead = 500;
        this.mainParams.collideEarly = 0;
        var integrator = new integrator_1.RK4Integrator(tensorField, this.minorParams);
        var redraw = function () { return _this.redraw = true; };
        this.coastline = new water_gui_1.default(tensorField, this.coastlineParams, integrator, 'Water', redraw);
        this.mainRoads = new road_gui_1.default(this.mainParams, integrator, 'Main', redraw);
        this.majorRoads = new road_gui_1.default(this.majorParams, integrator, 'Major', redraw, this.animate);
        this.minorRoads = new road_gui_1.default(this.minorParams, integrator, 'Minor', redraw, this.animate);
        // const parks = guiFolder.addFolder('Parks');
        // parks.add({Generate: () => {
        //     this.buildings.reset();
        //     this.addParks();
        //     this.redraw = true;
        // }}, 'Generate');
        // parks.add(this, 'clusterBigParks');
        // parks.add(this, 'numBigParks');
        // parks.add(this, 'numSmallParks');
        // const buildingsFolder = guiFolder.addFolder('Buildings');
        this.buildings = new buildings_1.default(tensorField, redraw, this.minorParams.dstep, this.animate);
        this.buildings.setPreGenerateCallback(function () {
            console.log('I got here');
            var allStreamlines = [];
            allStreamlines.push.apply(allStreamlines, __spreadArray([], __read(_this.mainRoads.allStreamlines), false));
            allStreamlines.push.apply(allStreamlines, __spreadArray([], __read(_this.majorRoads.allStreamlines), false));
            allStreamlines.push.apply(allStreamlines, __spreadArray([], __read(_this.minorRoads.allStreamlines), false));
            allStreamlines.push.apply(allStreamlines, __spreadArray([], __read(_this.coastline.streamlinesWithSecondaryRoad), false));
            _this.buildings.setAllStreamlines(allStreamlines);
        });
        // animateController.onChange((b: boolean) => {
        //     this.majorRoads.animate = b;
        //     this.minorRoads.animate = b;
        //     this.buildings.animate = b;
        // });
        this.minorRoads.setExistingStreamlines([this.coastline, this.mainRoads, this.majorRoads]);
        this.majorRoads.setExistingStreamlines([this.coastline, this.mainRoads]);
        this.mainRoads.setExistingStreamlines([this.coastline]);
        this.coastline.setPreGenerateCallback(function () {
            _this.mainRoads.clearStreamlines();
            _this.majorRoads.clearStreamlines();
            _this.minorRoads.clearStreamlines();
            _this.bigParks = [];
            _this.smallParks = [];
            _this.buildings.reset();
            tensorField.parks = [];
            tensorField.sea = [];
            tensorField.river = [];
        });
        this.mainRoads.setPreGenerateCallback(function () {
            _this.majorRoads.clearStreamlines();
            _this.minorRoads.clearStreamlines();
            _this.bigParks = [];
            _this.smallParks = [];
            _this.buildings.reset();
            tensorField.parks = [];
            tensorField.ignoreRiver = true;
        });
        this.mainRoads.setPostGenerateCallback(function () {
            tensorField.ignoreRiver = false;
        });
        this.majorRoads.setPreGenerateCallback(function () {
            _this.minorRoads.clearStreamlines();
            _this.bigParks = [];
            _this.smallParks = [];
            _this.buildings.reset();
            tensorField.parks = [];
            tensorField.ignoreRiver = true;
        });
        this.majorRoads.setPostGenerateCallback(function () {
            tensorField.ignoreRiver = false;
            _this.addParks();
            _this.redraw = true;
        });
        this.minorRoads.setPreGenerateCallback(function () {
            _this.buildings.reset();
            _this.smallParks = [];
            tensorField.parks = _this.bigParks;
        });
        this.minorRoads.setPostGenerateCallback(function () {
            _this.addParks();
        });
    }
    MainGUI.prototype.addParks = function () {
        var _a, _b, _c;
        var g = new graph_1.default(this.majorRoads.allStreamlines
            .concat(this.mainRoads.allStreamlines)
            .concat(this.minorRoads.allStreamlines), this.minorParams.dstep);
        this.intersections = g.intersections;
        var p = new polygon_finder_1.default(g.nodes, {
            maxLength: 20,
            minArea: 80,
            shrinkSpacing: 4,
            chanceNoDivide: 1,
        }, this.tensorField);
        p.findPolygons();
        var polygons = p.polygons;
        if (this.minorRoads.allStreamlines.length === 0) {
            // Big parks
            this.bigParks = [];
            this.smallParks = [];
            if (polygons.length > this.numBigParks) {
                if (this.clusterBigParks) {
                    // Group in adjacent polygons 
                    var parkIndex = Math.floor(Math.random() * (polygons.length - this.numBigParks));
                    for (var i = parkIndex; i < parkIndex + this.numBigParks; i++) {
                        this.bigParks.push(polygons[i]);
                    }
                }
                else {
                    for (var i = 0; i < this.numBigParks; i++) {
                        var parkIndex = Math.floor(Math.random() * polygons.length);
                        this.bigParks.push(polygons[parkIndex]);
                    }
                }
            }
            else {
                (_a = this.bigParks).push.apply(_a, __spreadArray([], __read(polygons), false));
            }
        }
        else {
            // Small parks
            this.smallParks = [];
            for (var i = 0; i < this.numSmallParks; i++) {
                var parkIndex = Math.floor(Math.random() * polygons.length);
                this.smallParks.push(polygons[parkIndex]);
            }
        }
        this.tensorField.parks = [];
        (_b = this.tensorField.parks).push.apply(_b, __spreadArray([], __read(this.bigParks), false));
        (_c = this.tensorField.parks).push.apply(_c, __spreadArray([], __read(this.smallParks), false));
    };
    MainGUI.prototype.generateEverything = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('generateEverything');
                        console.log('generating coastline');
                        return [4 /*yield*/, this.coastline.generateRoads()];
                    case 1:
                        _a.sent();
                        console.log('generating mainRoads');
                        return [4 /*yield*/, this.mainRoads.generateRoads()];
                    case 2:
                        _a.sent();
                        console.log('generating majorRoads');
                        return [4 /*yield*/, this.majorRoads.generateRoads(this.animate)];
                    case 3:
                        _a.sent();
                        console.log('generating minorRoads');
                        return [4 /*yield*/, this.minorRoads.generateRoads(this.animate)];
                    case 4:
                        _a.sent();
                        this.redraw = true;
                        console.log('generating buildings');
                        return [4 /*yield*/, this.buildings.generate(this.animate)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MainGUI.prototype.update = function () {
        var continueUpdate = true;
        var start = performance.now();
        while (continueUpdate && performance.now() - start < this.animationSpeed) {
            var minorChanged = this.minorRoads.update();
            var majorChanged = this.majorRoads.update();
            var mainChanged = this.mainRoads.update();
            var buildingsChanged = this.buildings.update();
            continueUpdate = minorChanged || majorChanged || mainChanged || buildingsChanged;
        }
        this.redraw = this.redraw || continueUpdate;
    };
    MainGUI.prototype.draw = function (style, forceDraw, customCanvas) {
        var _a, _b;
        var _this = this;
        if (forceDraw === void 0) { forceDraw = false; }
        if (!style.needsUpdate && !forceDraw && !this.redraw && !this.moved) {
            return;
        }
        style.needsUpdate = false;
        this.moved = false;
        this.redraw = false;
        style.seaPolygon = this.coastline.seaPolygon;
        style.coastline = this.coastline.coastline;
        style.river = this.coastline.river;
        style.lots = this.buildings.lots;
        if (style instanceof style_1.DefaultStyle && style.showBuildingModels || style instanceof style_1.RoughStyle) {
            style.buildingModels = this.buildings.models;
        }
        style.parks = [];
        (_a = style.parks).push.apply(_a, __spreadArray([], __read(this.bigParks.map(function (p) { return p.map(function (v) { return _this.worldToScreen(v.clone()); }); })), false));
        (_b = style.parks).push.apply(_b, __spreadArray([], __read(this.smallParks.map(function (p) { return p.map(function (v) { return _this.worldToScreen(v.clone()); }); })), false));
        style.minorRoads = this.minorRoads.roads;
        style.majorRoads = this.majorRoads.roads;
        style.mainRoads = this.mainRoads.roads;
        style.coastlineRoads = this.coastline.roads;
        style.secondaryRiver = this.coastline.secondaryRiver;
        style.draw(customCanvas);
    };
    MainGUI.prototype.roadsEmpty = function () {
        return this.majorRoads.roadsEmpty()
            && this.minorRoads.roadsEmpty()
            && this.mainRoads.roadsEmpty()
            && this.coastline.roadsEmpty();
    };
    Object.defineProperty(MainGUI.prototype, "seaPolygon", {
        // OBJ Export methods
        get: function () {
            return this.coastline.seaPolygon;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MainGUI.prototype, "riverPolygon", {
        get: function () {
            return this.coastline.river;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MainGUI.prototype, "buildingModels", {
        get: function () {
            return this.buildings.models;
        },
        enumerable: false,
        configurable: true
    });
    MainGUI.prototype.getBlocks = function () {
        return this.buildings.getBlocks();
    };
    Object.defineProperty(MainGUI.prototype, "minorRoadPolygons", {
        get: function () {
            var _this = this;
            return this.minorRoads.roads.map(function (r) { return polygon_util_1.default.resizeGeometry(r, 1 * _this.zoom, false); });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MainGUI.prototype, "majorRoadPolygons", {
        get: function () {
            var _this = this;
            return this.majorRoads.roads.concat([this.coastline.secondaryRiver]).map(function (r) { return polygon_util_1.default.resizeGeometry(r, 2 * _this.zoom, false); });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MainGUI.prototype, "mainRoadPolygons", {
        get: function () {
            var _this = this;
            return this.mainRoads.roads.concat(this.coastline.roads).map(function (r) { return polygon_util_1.default.resizeGeometry(r, 2.5 * _this.zoom, false); });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MainGUI.prototype, "coastlinePolygon", {
        get: function () {
            return polygon_util_1.default.resizeGeometry(this.coastline.coastline, 15 * this.zoom, false);
        },
        enumerable: false,
        configurable: true
    });
    MainGUI.prototype.downloadSTL = function () {
        return __awaiter(this, void 0, void 0, function () {
            var extendScreenX, extendScreenY, ground, blocks, modelGenerator, blob;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('downloadSTL');
                        extendScreenX = this.screenDimensions.x * ((util_1.default.DRAW_INFLATE_AMOUNT - 1) / 2);
                        extendScreenY = this.screenDimensions.y * ((util_1.default.DRAW_INFLATE_AMOUNT - 1) / 2);
                        ground = [
                            new vector_1.default(-extendScreenX, -extendScreenY),
                            new vector_1.default(-extendScreenX, this.screenDimensions.y + extendScreenY),
                            new vector_1.default(this.screenDimensions.x + extendScreenX, this.screenDimensions.y + extendScreenY),
                            new vector_1.default(this.screenDimensions.x + extendScreenX, -extendScreenY),
                        ];
                        return [4 /*yield*/, this.getBlocks()];
                    case 1:
                        blocks = _a.sent();
                        console.log('blocks - ' + JSON.stringify(blocks));
                        modelGenerator = new model_generator_1.default(ground, this.seaPolygon, this.coastlinePolygon, this.riverPolygon, this.mainRoadPolygons, this.majorRoadPolygons, this.minorRoadPolygons, this.buildingModels, blocks);
                        return [4 /*yield*/, modelGenerator.getSTL()];
                    case 2:
                        blob = _a.sent();
                        console.log(blob);
                        this.downloadFile('model.zip', blob);
                        return [2 /*return*/];
                }
            });
        });
    };
    MainGUI.prototype.downloadFile = function (filename, file) {
        saveAs(file, filename);
    };
    /**
     * Edits vector
     */
    MainGUI.prototype.zoomToWorld = function (v) {
        return v.divideScalar(this.zoom);
    };
    /**
     * Edits vector
     */
    MainGUI.prototype.zoomToScreen = function (v) {
        return v.multiplyScalar(this.zoom);
    };
    /**
     * Edits vector
     */
    MainGUI.prototype.screenToWorld = function (v) {
        return this.zoomToWorld(v).add(this.origin);
    };
    /**
     * Edits vector
     */
    MainGUI.prototype.worldToScreen = function (v) {
        return this.zoomToScreen(v.sub(this.origin));
    };
    return MainGUI;
}());
exports.default = MainGUI;

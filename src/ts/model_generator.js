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
var log = require("loglevel");
var THREE = require("three");
var three_csg_ts_1 = require("three-csg-ts");
var ModelGeneratorStates;
(function (ModelGeneratorStates) {
    ModelGeneratorStates[ModelGeneratorStates["WAITING"] = 0] = "WAITING";
    ModelGeneratorStates[ModelGeneratorStates["SUBTRACT_OCEAN"] = 1] = "SUBTRACT_OCEAN";
    ModelGeneratorStates[ModelGeneratorStates["ADD_COASTLINE"] = 2] = "ADD_COASTLINE";
    ModelGeneratorStates[ModelGeneratorStates["SUBTRACT_RIVER"] = 3] = "SUBTRACT_RIVER";
    ModelGeneratorStates[ModelGeneratorStates["ADD_ROADS"] = 4] = "ADD_ROADS";
    ModelGeneratorStates[ModelGeneratorStates["ADD_BLOCKS"] = 5] = "ADD_BLOCKS";
    ModelGeneratorStates[ModelGeneratorStates["ADD_BUILDINGS"] = 6] = "ADD_BUILDINGS";
    ModelGeneratorStates[ModelGeneratorStates["CREATE_ZIP"] = 7] = "CREATE_ZIP";
})(ModelGeneratorStates || (ModelGeneratorStates = {}));
var ModelGenerator = /** @class */ (function () {
    function ModelGenerator(ground, sea, coastline, river, mainRoads, majorRoads, minorRoads, buildings, blocks) {
        this.ground = ground;
        this.sea = sea;
        this.coastline = coastline;
        this.river = river;
        this.mainRoads = mainRoads;
        this.majorRoads = majorRoads;
        this.minorRoads = minorRoads;
        this.buildings = buildings;
        this.blocks = blocks;
        this.groundLevel = 20; // Thickness of groundMesh
        this.exportSTL = require('threejs-export-stl');
        this.resolve = function (b) { };
        this.state = ModelGeneratorStates.WAITING;
        this.polygonsToProcess = [];
        this.roadsGeometry = new THREE.Geometry();
        this.blocksGeometry = new THREE.Geometry();
        this.buildingsGeometry = new THREE.Geometry();
    }
    ModelGenerator.prototype.getSTL = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        _this.resolve = resolve;
                        var JSZip = require("jszip");
                        _this.zip = new JSZip();
                        _this.zip.file("model/README.txt", "For a tutorial on putting these models together to create a city, go to https://maps.probabletrain.com/#/stl");
                        _this.groundMesh = _this.polygonToMesh(_this.ground, _this.groundLevel);
                        _this.groundBsp = three_csg_ts_1.CSG.fromMesh(_this.groundMesh);
                        _this.setState(ModelGeneratorStates.SUBTRACT_OCEAN);
                    })];
            });
        });
    };
    ModelGenerator.prototype.setState = function (s) {
        this.state = s;
        log.info(ModelGeneratorStates[s]);
    };
    /**
     * Return true if processing a model
     * Work done in update loop so main thread isn't swamped
     */
    ModelGenerator.prototype.update = function () {
        var _this = this;
        switch (this.state) {
            case ModelGeneratorStates.WAITING: {
                return false;
            }
            case ModelGeneratorStates.SUBTRACT_OCEAN: {
                var seaLevelMesh = this.polygonToMesh(this.ground, 0);
                this.threeToBlender(seaLevelMesh);
                var seaLevelSTL = this.exportSTL.fromMesh(seaLevelMesh);
                this.zip.file("model/domain.stl", seaLevelSTL);
                var seaMesh = this.polygonToMesh(this.sea, 0);
                this.threeToBlender(seaMesh);
                var seaMeshSTL = this.exportSTL.fromMesh(seaMesh);
                this.zip.file("model/sea.stl", seaMeshSTL);
                this.setState(ModelGeneratorStates.ADD_COASTLINE);
                break;
            }
            case ModelGeneratorStates.ADD_COASTLINE: {
                var coastlineMesh = this.polygonToMesh(this.coastline, 0);
                this.threeToBlender(coastlineMesh);
                var coastlineSTL = this.exportSTL.fromMesh(coastlineMesh);
                this.zip.file("model/coastline.stl", coastlineSTL);
                this.setState(ModelGeneratorStates.SUBTRACT_RIVER);
                break;
            }
            case ModelGeneratorStates.SUBTRACT_RIVER: {
                var riverMesh = this.polygonToMesh(this.river, 0);
                this.threeToBlender(riverMesh);
                var riverSTL = this.exportSTL.fromMesh(riverMesh);
                this.zip.file("model/river.stl", riverSTL);
                this.setState(ModelGeneratorStates.ADD_ROADS);
                this.polygonsToProcess = this.minorRoads.concat(this.majorRoads).concat(this.mainRoads);
                break;
            }
            case ModelGeneratorStates.ADD_ROADS: {
                if (this.polygonsToProcess.length === 0) {
                    var mesh = new THREE.Mesh(this.roadsGeometry);
                    this.threeToBlender(mesh);
                    var buildingsSTL = this.exportSTL.fromMesh(mesh);
                    this.zip.file("model/roads.stl", buildingsSTL);
                    this.setState(ModelGeneratorStates.ADD_BLOCKS);
                    this.polygonsToProcess = __spreadArray([], __read(this.blocks), false);
                    break;
                }
                var road = this.polygonsToProcess.pop();
                var roadsMesh = this.polygonToMesh(road, 0);
                this.roadsGeometry.merge(roadsMesh.geometry, this.groundMesh.matrix);
                break;
            }
            case ModelGeneratorStates.ADD_BLOCKS: {
                if (this.polygonsToProcess.length === 0) {
                    var mesh = new THREE.Mesh(this.blocksGeometry);
                    this.threeToBlender(mesh);
                    var blocksSTL = this.exportSTL.fromMesh(mesh);
                    this.zip.file("model/blocks.stl", blocksSTL);
                    this.setState(ModelGeneratorStates.ADD_BUILDINGS);
                    this.buildingsToProcess = __spreadArray([], __read(this.buildings), false);
                    break;
                }
                var block = this.polygonsToProcess.pop();
                var blockMesh = this.polygonToMesh(block, 1);
                this.blocksGeometry.merge(blockMesh.geometry, this.groundMesh.matrix);
                break;
            }
            case ModelGeneratorStates.ADD_BUILDINGS: {
                if (this.buildingsToProcess.length === 0) {
                    var mesh = new THREE.Mesh(this.buildingsGeometry);
                    this.threeToBlender(mesh);
                    var buildingsSTL = this.exportSTL.fromMesh(mesh);
                    this.zip.file("model/buildings.stl", buildingsSTL);
                    this.setState(ModelGeneratorStates.CREATE_ZIP);
                    break;
                }
                var b = this.buildingsToProcess.pop();
                var buildingMesh = this.polygonToMesh(b.lotScreen, b.height);
                this.buildingsGeometry.merge(buildingMesh.geometry, this.groundMesh.matrix);
                break;
            }
            case ModelGeneratorStates.CREATE_ZIP: {
                this.zip.generateAsync({ type: "blob" }).then(function (blob) { return _this.resolve(blob); });
                this.setState(ModelGeneratorStates.WAITING);
                break;
            }
            default: {
                break;
            }
        }
        return true;
    };
    /**
     * Rotate and scale mesh so up is in the right direction
     */
    ModelGenerator.prototype.threeToBlender = function (mesh) {
        mesh.scale.multiplyScalar(0.02);
        mesh.updateMatrixWorld(true);
    };
    /**
     * Extrude a polygon into a THREE.js mesh
     */
    ModelGenerator.prototype.polygonToMesh = function (polygon, height) {
        if (polygon.length < 3) {
            log.error("Tried to export empty polygon as OBJ");
            return null;
        }
        var shape = new THREE.Shape();
        shape.moveTo(polygon[0].x, polygon[0].y);
        for (var i = 1; i < polygon.length; i++) {
            shape.lineTo(polygon[i].x, polygon[i].y);
        }
        shape.lineTo(polygon[0].x, polygon[0].y);
        if (height === 0) {
            return new THREE.Mesh(new THREE.ShapeGeometry(shape));
        }
        var extrudeSettings = {
            steps: 1,
            depth: height,
            bevelEnabled: false,
        };
        var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        var mesh = new THREE.Mesh(geometry);
        // mesh.translateZ(-height);
        mesh.updateMatrixWorld(true);
        return mesh;
    };
    return ModelGenerator;
}());
exports.default = ModelGenerator;

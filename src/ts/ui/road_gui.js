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
// import DomainController from './domain_controller';
var util_1 = require("../util");
var streamlines_1 = require("../impl/streamlines");
var vector_1 = require("../vector");
/**
 * Handles creation of roads
 */
var RoadGUI = /** @class */ (function () {
    function RoadGUI(params, integrator, 
    /*protected guiFolder: dat.GUI,
    protected closeTensorFolder: () => void,*/
    folderName, redraw, _animate) {
        if (_animate === void 0) { _animate = false; }
        this.params = params;
        this.integrator = integrator;
        this.folderName = folderName;
        this.redraw = redraw;
        this._animate = _animate;
        this.existingStreamlines = [];
        // protected domainController = DomainController.getInstance();
        this.preGenerateCallback = function () { };
        this.postGenerateCallback = function () { };
        this.streamlinesInProgress = false;
        this.origin = vector_1.default.zeroVector();
        this.worldDimensions = new vector_1.default(1440, 1080);
        this.zoom = 1;
        this.streamlines = new streamlines_1.default(this.integrator, this.origin, this.worldDimensions, this.params);
        // Update path iterations based on window size
        this.setPathIterations();
        // window.addEventListener('resize', (): void => this.setPathIterations());
    }
    RoadGUI.prototype.initFolder = function () {
        // const roadGUI = {
        //     Generate: () => this.generateRoads(this._animate).then(() => this.redraw()),
        //     JoinDangling: (): void => {
        //         this.streamlines.joinDanglingStreamlines();
        //         this.redraw();
        //     },
        // };
        // const folder = this.guiFolder.addFolder(this.folderName);
        // folder.add(roadGUI, 'Generate');
        // folder.add(roadGUI, 'JoinDangling');
        // const paramsFolder = folder.addFolder('Params');
        // paramsFolder.add(this.params, 'dsep');
        // paramsFolder.add(this.params, 'dtest');
        // const devParamsFolder = paramsFolder.addFolder('Dev');
        // this.addDevParamsToFolder(this.params, devParamsFolder);
        return this;
    };
    Object.defineProperty(RoadGUI.prototype, "animate", {
        set: function (b) {
            this._animate = b;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RoadGUI.prototype, "allStreamlines", {
        get: function () {
            return this.streamlines.allStreamlinesSimple;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RoadGUI.prototype, "roads", {
        get: function () {
            var _this = this;
            // For drawing not generation, probably fine to leave map
            return this.streamlines.allStreamlinesSimple.map(function (s) {
                return s.map(function (v) { return _this.worldToScreen(v.clone()); });
            });
        },
        enumerable: false,
        configurable: true
    });
    RoadGUI.prototype.roadsEmpty = function () {
        return this.streamlines.allStreamlinesSimple.length === 0;
    };
    RoadGUI.prototype.setExistingStreamlines = function (existingStreamlines) {
        this.existingStreamlines = existingStreamlines;
    };
    RoadGUI.prototype.setPreGenerateCallback = function (callback) {
        this.preGenerateCallback = callback;
    };
    RoadGUI.prototype.setPostGenerateCallback = function (callback) {
        this.postGenerateCallback = callback;
    };
    RoadGUI.prototype.clearStreamlines = function () {
        this.streamlines.clearStreamlines();
    };
    RoadGUI.prototype.generateRoads = function (animate) {
        if (animate === void 0) { animate = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, s;
            var e_1, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        console.log('begin of generateRoads');
                        console.log('  calling preGenerateCallback');
                        this.preGenerateCallback();
                        console.log('  calculatingZoom');
                        this.zoom = this.zoom / util_1.default.DRAW_INFLATE_AMOUNT;
                        console.log('  instantiating StreamlineGenerator');
                        this.streamlines = new streamlines_1.default(this.integrator, this.origin, this.worldDimensions, Object.assign({}, this.params));
                        console.log('  recalculating zoom');
                        this.zoom = this.zoom * util_1.default.DRAW_INFLATE_AMOUNT;
                        console.log('  Adding existing streamlines');
                        try {
                            for (_a = __values(this.existingStreamlines), _b = _a.next(); !_b.done; _b = _a.next()) {
                                s = _b.value;
                                this.streamlines.addExistingStreamlines(s.streamlines);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        // this.closeTensorFolder();
                        console.log('  Redraing');
                        this.redraw();
                        console.log('  awaiting createAllStreamlines');
                        return [4 /*yield*/, this.streamlines.createAllStreamlines(animate)];
                    case 1:
                        _d.sent();
                        console.log('  calling postGenerateCallback');
                        this.postGenerateCallback();
                        console.log('  allStreamlines.length - ' + this.allStreamlines.length);
                        console.log('end of generateRoads');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Returns true if streamlines changes
     */
    RoadGUI.prototype.update = function () {
        return this.streamlines.update();
    };
    RoadGUI.prototype.addDevParamsToFolder = function (params) {
        // folder.add(params, 'pathIterations');
        // folder.add(params, 'seedTries');
        // folder.add(params, 'dstep');
        // folder.add(params, 'dlookahead');
        // folder.add(params, 'dcirclejoin');
        // folder.add(params, 'joinangle');
        // folder.add(params, 'simplifyTolerance');
        // folder.add(params, 'collideEarly');
    };
    /**
     * Sets path iterations so that a road can cover the screen
     */
    RoadGUI.prototype.setPathIterations = function () {
        // const max = 1.5 * Math.max(window.innerWidth, window.innerHeight);
        // this.params.pathIterations = max/this.params.dstep;
        // Util.updateGui(this.guiFolder);
    };
    /**
 * Edits vector
 */
    RoadGUI.prototype.zoomToWorld = function (v) {
        return v.divideScalar(this.zoom);
    };
    /**
     * Edits vector
     */
    RoadGUI.prototype.zoomToScreen = function (v) {
        return v.multiplyScalar(this.zoom);
    };
    /**
     * Edits vector
     */
    RoadGUI.prototype.screenToWorld = function (v) {
        return this.zoomToWorld(v).add(this.origin);
    };
    /**
     * Edits vector
     */
    RoadGUI.prototype.worldToScreen = function (v) {
        return this.zoomToScreen(v.sub(this.origin));
    };
    return RoadGUI;
}());
exports.default = RoadGUI;

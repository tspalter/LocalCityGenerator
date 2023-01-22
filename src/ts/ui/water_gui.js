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
// import DomainController from './domain_controller';
var util_1 = require("../util");
var water_generator_1 = require("../impl/water_generator");
var road_gui_1 = require("./road_gui");
/**
 * Handles generation of river and coastline
 */
var WaterGUI = /** @class */ (function (_super) {
    __extends(WaterGUI, _super);
    function WaterGUI(tensorField, params, integrator, 
    /*guiFolder: dat.GUI,
    closeTensorFolder: () => void,*/
    folderName, redraw) {
        var _this = _super.call(this, params, integrator, folderName, redraw) || this;
        _this.tensorField = tensorField;
        _this.params = params;
        _this.streamlines = new water_generator_1.default(_this.integrator, _this.origin, _this.worldDimensions, Object.assign({}, _this.params), _this.tensorField);
        return _this;
    }
    WaterGUI.prototype.initFolder = function () {
        // const folder = this.guiFolder.addFolder(this.folderName);
        // folder.add({Generate: () => this.generateRoads()}, 'Generate');
        // const coastParamsFolder = folder.addFolder('CoastParams');
        // coastParamsFolder.add(this.params.coastNoise, 'noiseEnabled');
        // coastParamsFolder.add(this.params.coastNoise, 'noiseSize');
        // coastParamsFolder.add(this.params.coastNoise, 'noiseAngle');
        // const riverParamsFolder = folder.addFolder('RiverParams');
        // riverParamsFolder.add(this.params.riverNoise, 'noiseEnabled');
        // riverParamsFolder.add(this.params.riverNoise, 'noiseSize');
        // riverParamsFolder.add(this.params.riverNoise, 'noiseAngle');
        // folder.add(this.params, 'simplifyTolerance');
        // const devParamsFolder = folder.addFolder('Dev');
        // this.addDevParamsToFolder(this.params, devParamsFolder);
        return this;
    };
    WaterGUI.prototype.generateRoads = function () {
        this.preGenerateCallback();
        this.zoom = this.zoom / util_1.default.DRAW_INFLATE_AMOUNT;
        this.streamlines = new water_generator_1.default(this.integrator, this.origin, this.worldDimensions, Object.assign({}, this.params), this.tensorField);
        this.zoom = this.zoom * util_1.default.DRAW_INFLATE_AMOUNT;
        this.streamlines.createCoast();
        this.streamlines.createRiver();
        // this.closeTensorFolder();
        this.redraw();
        this.postGenerateCallback();
        return new Promise(function (resolve) { return resolve(); });
    };
    Object.defineProperty(WaterGUI.prototype, "streamlinesWithSecondaryRoad", {
        /**
         * Secondary road runs along other side of river
         */
        get: function () {
            var withSecondary = this.streamlines.allStreamlinesSimple.slice();
            withSecondary.push(this.streamlines.riverSecondaryRoad);
            return withSecondary;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WaterGUI.prototype, "river", {
        get: function () {
            var _this = this;
            return this.streamlines.riverPolygon.map(function (v) { return _this.worldToScreen(v.clone()); });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WaterGUI.prototype, "secondaryRiver", {
        get: function () {
            var _this = this;
            return this.streamlines.riverSecondaryRoad.map(function (v) { return _this.worldToScreen(v.clone()); });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WaterGUI.prototype, "coastline", {
        get: function () {
            var _this = this;
            // Use unsimplified noisy streamline as coastline
            // Visual only, no road logic performed using this
            return this.streamlines.coastline.map(function (v) { return _this.worldToScreen(v.clone()); });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WaterGUI.prototype, "seaPolygon", {
        get: function () {
            var _this = this;
            return this.streamlines.seaPolygon.map(function (v) { return _this.worldToScreen(v.clone()); });
        },
        enumerable: false,
        configurable: true
    });
    WaterGUI.prototype.addDevParamsToFolder = function (params) {
        // folder.add(params, 'dsep');
        // folder.add(params, 'dtest');
        // folder.add(params, 'pathIterations');
        // folder.add(params, 'seedTries');
        // folder.add(params, 'dstep');
        // folder.add(params, 'dlookahead');
        // folder.add(params, 'dcirclejoin');
        // folder.add(params, 'joinangle');
    };
    return WaterGUI;
}(road_gui_1.default));
exports.default = WaterGUI;

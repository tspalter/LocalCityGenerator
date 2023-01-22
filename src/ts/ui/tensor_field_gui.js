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
var tensor_field_1 = require("../impl/tensor_field");
var util_1 = require("../util");
var vector_1 = require("../vector");
/**
 * Extension of TensorField that handles interaction with dat.GUI
 */
var TensorFieldGUI = /** @class */ (function (_super) {
    __extends(TensorFieldGUI, _super);
    function TensorFieldGUI(/*private guiFolder: dat.GUI, private dragController: DragController,*/ drawCentre, noiseParams) {
        var _this = _super.call(this, noiseParams) || this;
        _this.drawCentre = drawCentre;
        _this.TENSOR_LINE_DIAMETER = 20;
        _this.TENSOR_SPAWN_SCALE = 0.7; // How much to shrink worldDimensions to find spawn point
        // private domainController = DomainController.getInstance();
        // vars used by domainController that aren't necessary for my app
        _this.worldDimensions = new vector_1.default(1440, 1080);
        _this.origin = new vector_1.default(0, 0);
        _this.zoom = 1;
        // For custom naming of gui buttons
        var tensorFieldGuiObj = {
            reset: function () { return _this.reset(); },
            setRecommended: function () { return _this.setRecommended(); },
            addRadial: function () { return _this.addRadialRandom(); },
            addGrid: function () { return _this.addGridRandom(); },
        };
        return _this;
        // this.guiFolder.add(tensorFieldGuiObj, 'reset');
        // this.guiFolder.add(this, 'smooth');
        // this.guiFolder.add(tensorFieldGuiObj, 'setRecommended');
        // this.guiFolder.add(tensorFieldGuiObj, 'addRadial');
        // this.guiFolder.add(tensorFieldGuiObj, 'addGrid');
    }
    /**
     * 4 Grids, one radial
     */
    TensorFieldGUI.prototype.setRecommended = function () {
        this.reset();
        var size = new vector_1.default(611.8, 522.2);
        var newOrigin = new vector_1.default(131.1, 111.9);
        this.addGridAtLocation(newOrigin);
        this.addGridAtLocation(newOrigin.clone().add(size));
        this.addGridAtLocation(newOrigin.clone().add(new vector_1.default(size.x, 0)));
        this.addGridAtLocation(newOrigin.clone().add(new vector_1.default(0, size.y)));
        this.addRadialRandom();
    };
    TensorFieldGUI.prototype.addRadialRandom = function () {
        var width = this.worldDimensions.x;
        this.addRadial(this.randomLocation(), util_1.default.randomRange(width / 10, width / 5), // Size
        util_1.default.randomRange(50)); // Decay
    };
    TensorFieldGUI.prototype.addGridRandom = function () {
        this.addGridAtLocation(this.randomLocation());
    };
    TensorFieldGUI.prototype.addGridAtLocation = function (location) {
        var width = this.worldDimensions.x;
        this.addGrid(location, util_1.default.randomRange(width / 4, width), // Size
        util_1.default.randomRange(50), // Decay
        util_1.default.randomRange(Math.PI / 2));
    };
    /**
     * World-space random location for tensor field spawn
     * Sampled from middle of screen (shrunk rectangle)
     */
    TensorFieldGUI.prototype.randomLocation = function () {
        var size = this.worldDimensions.multiplyScalar(this.TENSOR_SPAWN_SCALE);
        var location = new vector_1.default(Math.random(), Math.random()).multiply(size);
        var newOrigin = this.worldDimensions.multiplyScalar((1 - this.TENSOR_SPAWN_SCALE) / 2);
        return location.add(this.origin).add(newOrigin);
    };
    TensorFieldGUI.prototype.getCrossLocations = function () {
        // Gets grid of points for vector field vis in world space
        var diameter = this.TENSOR_LINE_DIAMETER / this.zoom;
        var worldDimensions = this.worldDimensions;
        var nHor = Math.ceil(worldDimensions.x / diameter) + 1; // Prevent pop-in
        var nVer = Math.ceil(worldDimensions.y / diameter) + 1;
        var originX = diameter * Math.floor(this.origin.x / diameter);
        var originY = diameter * Math.floor(this.origin.y / diameter);
        var out = [];
        for (var x = 0; x <= nHor; x++) {
            for (var y = 0; y <= nVer; y++) {
                out.push(new vector_1.default(originX + (x * diameter), originY + (y * diameter)));
            }
        }
        return out;
    };
    TensorFieldGUI.prototype.getTensorLine = function (point, tensorV) {
        var transformedPoint = this.worldToScreen(point.clone());
        var diff = tensorV.multiplyScalar(this.TENSOR_LINE_DIAMETER / 2); // Assumes normalised
        var start = transformedPoint.clone().sub(diff);
        var end = transformedPoint.clone().add(diff);
        return [start, end];
    };
    TensorFieldGUI.prototype.draw = function (canvas) {
        var _this = this;
        // Draw tensor field
        canvas.setFillStyle('black');
        canvas.clearCanvas();
        canvas.setStrokeStyle('white');
        canvas.setLineWidth(1);
        var tensorPoints = this.getCrossLocations();
        tensorPoints.forEach(function (p) {
            var t = _this.samplePoint(p);
            canvas.drawPolyline(_this.getTensorLine(p, t.getMajor()));
            canvas.drawPolyline(_this.getTensorLine(p, t.getMinor()));
        });
        // Draw centre points of fields
        if (this.drawCentre) {
            canvas.setFillStyle('red');
            this.getBasisFields().forEach(function (field) {
                return field.FIELD_TYPE === 1 /* FIELD_TYPE.Grid */ ?
                    canvas.drawSquare(_this.worldToScreen(field.centre), 7) :
                    canvas.drawCircle(_this.worldToScreen(field.centre), 7);
            });
        }
    };
    TensorFieldGUI.prototype.addField = function (field) {
        _super.prototype.addField.call(this, field);
        // const folder = this.guiFolder.addFolder(`${field.FOLDER_NAME}`);
        // Function to deregister from drag controller
        // const deregisterDrag = this.dragController.register(
        //     () => field.centre,
        //     field.dragMoveListener.bind(field),
        //     field.dragStartListener.bind(field)
        // );
        // const removeFieldObj = {remove: () => this.removeFieldGUI(field, deregisterDrag)};
        // Give dat gui removeField button
        // folder.add(removeFieldObj, 'remove');
        // field.setGui();
    };
    // private removeFieldGUI(field: BasisField, deregisterDrag: (() => void)): void {
    //     super.removeField(field);
    //     field.removeFolderFromParent();
    //     // Deregister from drag controller
    //     deregisterDrag();
    // }
    TensorFieldGUI.prototype.reset = function () {
        // TODO kind of hacky - calling remove callbacks from gui object, should store callbacks
        // in addfield and call them (requires making sure they're idempotent)
        // for (const fieldFolderName in this.guiFolder.__folders) {
        //     const fieldFolder = this.guiFolder.__folders[fieldFolderName];
        //     (fieldFolder.__controllers[0] as any).initialValue();
        // }
        _super.prototype.reset.call(this);
    };
    // functions from DomainController
    /**
     * Edits vector
     */
    TensorFieldGUI.prototype.zoomToWorld = function (v) {
        return v.divideScalar(this.zoom);
    };
    /**
     * Edits vector
     */
    TensorFieldGUI.prototype.zoomToScreen = function (v) {
        return v.multiplyScalar(this.zoom);
    };
    /**
     * Edits vector
     */
    TensorFieldGUI.prototype.screenToWorld = function (v) {
        return this.zoomToWorld(v).add(this.origin);
    };
    /**
     * Edits vector
     */
    TensorFieldGUI.prototype.worldToScreen = function (v) {
        return this.zoomToScreen(v.sub(this.origin));
    };
    return TensorFieldGUI;
}(tensor_field_1.default));
exports.default = TensorFieldGUI;

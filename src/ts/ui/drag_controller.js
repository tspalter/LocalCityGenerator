"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interactjs_1 = require("interactjs");
var util_1 = require("../util");
var Vector_1 = require("../Vector");
var domain_controller_1 = require("./domain_controller");
/**
* Register multiple centre points
* Closest one to mouse click will be selected to drag
* Up to caller to actually move their centre point via callback
*/
var DragController = /** @class */ (function () {
    function DragController( /*private gui: dat.GUI*/) {
        // How close to drag handle pointer needs to be
        this.MIN_DRAG_DISTANCE = 50;
        this.draggables = [];
        this.currentlyDragging = null; // Tensor field
        this._isDragging = false;
        this.disabled = false;
        this.domainController = domain_controller_1.default.getInstance();
        (0, interactjs_1.default)("#".concat(util_1.default.CANVAS_ID)).draggable({
            onstart: this.dragStart.bind(this),
            onmove: this.dragMove.bind(this),
            onend: this.dragEnd.bind(this),
            cursorChecker: this.getCursor.bind(this),
        });
    }
    DragController.prototype.setDragDisabled = function (disable) {
        this.disabled = disable;
    };
    /**
     * Change cursor style
     */
    DragController.prototype.getCursor = function (action, interactable, element, interacting) {
        if (interacting)
            return 'grabbing';
        return 'grab';
    };
    DragController.prototype.dragStart = function (event) {
        var _this = this;
        this._isDragging = true;
        // Transform screen space to world space
        var origin = this.domainController.screenToWorld(new Vector_1.default(event.x0, event.y0));
        var closestDistance = Infinity;
        this.draggables.forEach(function (draggable) {
            var d = draggable.getCentre().distanceTo(origin);
            if (d < closestDistance) {
                closestDistance = d;
                _this.currentlyDragging = draggable;
            }
        });
        // Zoom screen size to world size for consistent drag distance while zoomed in
        var scaledDragDistance = this.MIN_DRAG_DISTANCE / this.domainController.zoom;
        if (closestDistance > scaledDragDistance) {
            this.currentlyDragging = null;
        }
        else {
            this.currentlyDragging.startListener();
        }
    };
    DragController.prototype.dragMove = function (event) {
        var delta = new Vector_1.default(event.delta.x, event.delta.y);
        this.domainController.zoomToWorld(delta);
        if (!this.disabled && this.currentlyDragging !== null) {
            // Drag field
            this.currentlyDragging.moveListener(delta);
        }
        else {
            // Move map
            this.domainController.pan(delta);
        }
    };
    DragController.prototype.dragEnd = function () {
        this._isDragging = false;
        this.domainController.pan(Vector_1.default.zeroVector()); // Triggers canvas update
        this.currentlyDragging = null;
        // Util.updateGui(this.gui);
    };
    Object.defineProperty(DragController.prototype, "isDragging", {
        get: function () {
            return this._isDragging;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @param {(() => Vector)} Gets centre point
     * @param {((v: Vector) => void)} Called on move with delta vector
     * @param {(() => void)} Called on start
     * @returns {(() => void)} Function to deregister callback
     */
    DragController.prototype.register = function (getCentre, onMove, onStart) {
        var _this = this;
        var draggable = {
            getCentre: getCentre,
            moveListener: onMove,
            startListener: onStart,
        };
        this.draggables.push(draggable);
        return (function () {
            var index = _this.draggables.indexOf(draggable);
            if (index >= 0) {
                _this.draggables.splice(index, 1);
            }
        }).bind(this);
    };
    return DragController;
}());
exports.default = DragController;

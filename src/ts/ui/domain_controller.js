"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vector_1 = require("../vector");
var util_1 = require("../util");
/**
 * Singleton
 * Controls panning and zooming
 */
var DomainController = /** @class */ (function () {
    function DomainController() {
        var _this = this;
        this.ZOOM_SPEED = 0.96;
        this.SCROLL_DELAY = 100;
        // Location of screen origin in world space
        this._origin = vector_1.default.zeroVector();
        // Screen-space width and height
        this._screenDimensions = new vector_1.default(1440, 1080);
        // Ratio of screen pixels to world pixels
        this._zoom = 1;
        this.zoomCallback = function () { };
        this.lastScrolltime = -this.SCROLL_DELAY;
        this.refreshedAfterScroll = false;
        this._cameraDirection = vector_1.default.zeroVector();
        this._orthographic = false;
        // Set after pan or zoom
        this.moved = false;
        this.setScreenDimensions();
        window.addEventListener('resize', function () { return _this.setScreenDimensions(); });
        window.addEventListener('wheel', function (e) {
            if (e.target.id === util_1.default.CANVAS_ID) {
                _this.lastScrolltime = Date.now();
                _this.refreshedAfterScroll = false;
                var delta = e.deltaY;
                // TODO scale by value of delta
                if (delta > 0) {
                    _this.zoom = _this._zoom * _this.ZOOM_SPEED;
                }
                else {
                    _this.zoom = _this._zoom / _this.ZOOM_SPEED;
                }
            }
        });
    }
    Object.defineProperty(DomainController.prototype, "isScrolling", {
        /**
         * Used to stop drawing buildings while scrolling for certain styles
         * to keep the framerate up
         */
        get: function () {
            return Date.now() - this.lastScrolltime < this.SCROLL_DELAY;
        },
        enumerable: false,
        configurable: true
    });
    DomainController.prototype.setScreenDimensions = function () {
        // this.moved = true;
        // this._screenDimensions.setX(window.innerWidth);
        // this._screenDimensions.setY(window.innerHeight);
    };
    DomainController.getInstance = function () {
        if (!DomainController.instance) {
            DomainController.instance = new DomainController();
        }
        return DomainController.instance;
    };
    /**
     * @param {Vector} delta in world space
     */
    DomainController.prototype.pan = function (delta) {
        this.moved = true;
        this._origin.sub(delta);
    };
    Object.defineProperty(DomainController.prototype, "origin", {
        /**
         * Screen origin in world space
         */
        get: function () {
            return this._origin.clone();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DomainController.prototype, "zoom", {
        get: function () {
            return this._zoom;
        },
        set: function (z) {
            if (z >= 0.3 && z <= 20) {
                this.moved = true;
                var oldWorldSpaceMidpoint = this.origin.add(this.worldDimensions.divideScalar(2));
                this._zoom = z;
                var newWorldSpaceMidpoint = this.origin.add(this.worldDimensions.divideScalar(2));
                this.pan(newWorldSpaceMidpoint.sub(oldWorldSpaceMidpoint));
                this.zoomCallback();
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DomainController.prototype, "screenDimensions", {
        get: function () {
            return this._screenDimensions.clone();
        },
        set: function (v) {
            this.moved = true;
            this._screenDimensions.copy(v);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DomainController.prototype, "worldDimensions", {
        /**
         * @return {Vector} world-space w/h visible on screen
         */
        get: function () {
            return this.screenDimensions.divideScalar(this._zoom);
        },
        enumerable: false,
        configurable: true
    });
    DomainController.prototype.onScreen = function (v) {
        var screenSpace = this.worldToScreen(v.clone());
        return screenSpace.x >= 0 && screenSpace.y >= 0
            && screenSpace.x <= this.screenDimensions.x && screenSpace.y <= this.screenDimensions.y;
    };
    Object.defineProperty(DomainController.prototype, "orthographic", {
        get: function () {
            return this._orthographic;
        },
        set: function (v) {
            this._orthographic = v;
            this.moved = true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DomainController.prototype, "cameraDirection", {
        get: function () {
            return this._cameraDirection.clone();
        },
        set: function (v) {
            this._cameraDirection = v;
            // Screen update
            this.moved = true;
        },
        enumerable: false,
        configurable: true
    });
    DomainController.prototype.getCameraPosition = function () {
        var centre = new vector_1.default(this._screenDimensions.x / 2, this._screenDimensions.y / 2);
        if (this._orthographic) {
            return centre.add(centre.clone().multiply(this._cameraDirection).multiplyScalar(100));
        }
        return centre.add(centre.clone().multiply(this._cameraDirection));
        // this.screenDimensions.divideScalar(2);
    };
    DomainController.prototype.setZoomUpdate = function (callback) {
        this.zoomCallback = callback;
    };
    /**
     * Edits vector
     */
    DomainController.prototype.zoomToWorld = function (v) {
        return v.divideScalar(this._zoom);
    };
    /**
     * Edits vector
     */
    DomainController.prototype.zoomToScreen = function (v) {
        return v.multiplyScalar(this._zoom);
    };
    /**
     * Edits vector
     */
    DomainController.prototype.screenToWorld = function (v) {
        return this.zoomToWorld(v).add(this._origin);
    };
    /**
     * Edits vector
     */
    DomainController.prototype.worldToScreen = function (v) {
        return this.zoomToScreen(v.sub(this._origin));
    };
    return DomainController;
}());
exports.default = DomainController;

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
exports.Radial = exports.Grid = exports.BasisField = void 0;
var tensor_1 = require("./tensor");
;
/**
 * Grid or Radial field to be combined with others to create the tensor field
 */
var BasisField = /** @class */ (function () {
    function BasisField(centre, _size, _decay) {
        this._size = _size;
        this._decay = _decay;
        this._centre = centre.clone();
    }
    Object.defineProperty(BasisField.prototype, "centre", {
        get: function () {
            return this._centre.clone();
        },
        set: function (centre) {
            this._centre.copy(centre);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BasisField.prototype, "decay", {
        set: function (decay) {
            this._decay = decay;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BasisField.prototype, "size", {
        set: function (size) {
            this._size = size;
        },
        enumerable: false,
        configurable: true
    });
    BasisField.prototype.dragStartListener = function () {
        this.setFolder();
    };
    BasisField.prototype.dragMoveListener = function (delta) {
        // Delta assumed to be in world space (only relevant when zoomed)
        this._centre.add(delta);
    };
    BasisField.prototype.getWeightedTensor = function (point, smooth) {
        return this.getTensor(point).scale(this.getTensorWeight(point, smooth));
    };
    BasisField.prototype.setFolder = function () {
        // if (this.parentFolder.__folders) {
        //     for (const folderName in this.parentFolder.__folders) {
        //         this.parentFolder.__folders[folderName].close();
        //     }
        //     this.folder.open();
        // }
    };
    BasisField.prototype.removeFolderFromParent = function () {
        // if (this.parentFolder.__folders && Object.values(this.parentFolder.__folders).indexOf(this.folder) >= 0) {
        //     this.parentFolder.removeFolder(this.folder);
        // }
    };
    /**
     * Creates a folder and adds it to the GUI to control params
     */
    BasisField.prototype.setGui = function ( /*parent: dat.GUI, folder: dat.GUI*/) {
        // this.parentFolder = parent;
        // this.folder = folder;
        // folder.add(this._centre, 'x');
        // folder.add(this._centre, 'y');
        // folder.add(this, '_size');
        // folder.add(this, '_decay', -50, 50);
    };
    /**
     * Interpolates between (0 and 1)^decay
     */
    BasisField.prototype.getTensorWeight = function (point, smooth) {
        var normDistanceToCentre = point.clone().sub(this._centre).length() / this._size;
        if (smooth) {
            return Math.pow(normDistanceToCentre, -this._decay);
        }
        // Stop (** 0) turning weight into 1, filling screen even when outside 'size'
        if (this._decay === 0 && normDistanceToCentre >= 1) {
            return 0;
        }
        return Math.pow(Math.max(0, (1 - normDistanceToCentre)), this._decay);
    };
    BasisField.folderNameIndex = 0;
    return BasisField;
}());
exports.BasisField = BasisField;
var Grid = /** @class */ (function (_super) {
    __extends(Grid, _super);
    function Grid(centre, size, decay, _theta) {
        var _this = _super.call(this, centre, size, decay) || this;
        _this._theta = _theta;
        _this.FOLDER_NAME = "Grid ".concat(Grid.folderNameIndex++);
        _this.FIELD_TYPE = 1 /* FIELD_TYPE.Grid */;
        return _this;
    }
    Object.defineProperty(Grid.prototype, "theta", {
        set: function (theta) {
            this._theta = theta;
        },
        enumerable: false,
        configurable: true
    });
    Grid.prototype.setGui = function ( /*parent: dat.GUI, folder: dat.GUI*/) {
        _super.prototype.setGui.call(this);
        // GUI in degrees, convert to rads
        // const thetaProp = {theta: this._theta * 180 / Math.PI};
        // const thetaController = folder.add(thetaProp, 'theta', -90, 90);
        // thetaController.onChange(theta => this._theta = theta * (Math.PI / 180));
    };
    Grid.prototype.getTensor = function (point) {
        var cos = Math.cos(2 * this._theta);
        var sin = Math.sin(2 * this._theta);
        return new tensor_1.default(1, [cos, sin]);
    };
    return Grid;
}(BasisField));
exports.Grid = Grid;
var Radial = /** @class */ (function (_super) {
    __extends(Radial, _super);
    function Radial(centre, size, decay) {
        var _this = _super.call(this, centre, size, decay) || this;
        _this.FOLDER_NAME = "Radial ".concat(Radial.folderNameIndex++);
        _this.FIELD_TYPE = 0 /* FIELD_TYPE.Radial */;
        return _this;
    }
    Radial.prototype.getTensor = function (point) {
        var t = point.clone().sub(this._centre);
        var t1 = Math.pow(t.y, 2) - Math.pow(t.x, 2);
        var t2 = -2 * t.x * t.y;
        return new tensor_1.default(1, [t1, t2]);
    };
    return Radial;
}(BasisField));
exports.Radial = Radial;

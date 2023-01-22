"use strict";
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
var PolyK = require("polyk");
var vector_1 = require("../vector");
var jsts = require("jsts");
var PolygonUtil = /** @class */ (function () {
    function PolygonUtil() {
    }
    /**
     * Slices rectangle by line, returning smallest polygon
     */
    PolygonUtil.sliceRectangle = function (origin, worldDimensions, p1, p2) {
        var rectangle = [
            origin.x, origin.y,
            origin.x + worldDimensions.x, origin.y,
            origin.x + worldDimensions.x, origin.y + worldDimensions.y,
            origin.x, origin.y + worldDimensions.y,
        ];
        var sliced = PolyK.Slice(rectangle, p1.x, p1.y, p2.x, p2.y).map(function (p) { return PolygonUtil.polygonArrayToPolygon(p); });
        var minArea = PolygonUtil.calcPolygonArea(sliced[0]);
        if (sliced.length > 1 && PolygonUtil.calcPolygonArea(sliced[1]) < minArea) {
            return sliced[1];
        }
        return sliced[0];
    };
    /**
     * Used to create sea polygon
     */
    PolygonUtil.lineRectanglePolygonIntersection = function (origin, worldDimensions, line) {
        var jstsLine = PolygonUtil.lineToJts(line);
        var bounds = [
            origin,
            new vector_1.default(origin.x + worldDimensions.x, origin.y),
            new vector_1.default(origin.x + worldDimensions.x, origin.y + worldDimensions.y),
            new vector_1.default(origin.x, origin.y + worldDimensions.y),
        ];
        var boundingPoly = PolygonUtil.polygonToJts(bounds);
        var union = boundingPoly.getExteriorRing().union(jstsLine);
        var polygonizer = new jsts.operation.polygonize.Polygonizer();
        polygonizer.add(union);
        var polygons = polygonizer.getPolygons();
        var smallestArea = Infinity;
        var smallestPoly;
        for (var i = polygons.iterator(); i.hasNext();) {
            var polygon = i.next();
            var area = polygon.getArea();
            if (area < smallestArea) {
                smallestArea = area;
                smallestPoly = polygon;
            }
        }
        if (!smallestPoly)
            return [];
        return smallestPoly.getCoordinates().map(function (c) { return new vector_1.default(c.x, c.y); });
    };
    PolygonUtil.calcPolygonArea = function (polygon) {
        var total = 0;
        for (var i = 0; i < polygon.length; i++) {
            var addX = polygon[i].x;
            var addY = polygon[i == polygon.length - 1 ? 0 : i + 1].y;
            var subX = polygon[i == polygon.length - 1 ? 0 : i + 1].x;
            var subY = polygon[i].y;
            total += (addX * addY * 0.5);
            total -= (subX * subY * 0.5);
        }
        return Math.abs(total);
    };
    /**
     * Recursively divide a polygon by its longest side until the minArea stopping condition is met
     */
    PolygonUtil.subdividePolygon = function (p, minArea) {
        var e_1, _a;
        var area = PolygonUtil.calcPolygonArea(p);
        if (area < 0.5 * minArea) {
            return [];
        }
        var divided = []; // Array of polygons
        var longestSideLength = 0;
        var longestSide = [p[0], p[1]];
        var perimeter = 0;
        for (var i = 0; i < p.length; i++) {
            var sideLength = p[i].clone().sub(p[(i + 1) % p.length]).length();
            perimeter += sideLength;
            if (sideLength > longestSideLength) {
                longestSideLength = sideLength;
                longestSide = [p[i], p[(i + 1) % p.length]];
            }
        }
        // Shape index
        // Using rectangle ratio of 1:4 as limit
        // if (area / perimeter * perimeter < 0.04) {
        if (area / (perimeter * perimeter) < 0.04) {
            return [];
        }
        if (area < 2 * minArea) {
            return [p];
        }
        // Between 0.4 and 0.6
        var deviation = (Math.random() * 0.2) + 0.4;
        var averagePoint = longestSide[0].clone().add(longestSide[1]).multiplyScalar(deviation);
        var differenceVector = longestSide[0].clone().sub(longestSide[1]);
        var perpVector = (new vector_1.default(differenceVector.y, -1 * differenceVector.x))
            .normalize()
            .multiplyScalar(100);
        var bisect = [averagePoint.clone().add(perpVector), averagePoint.clone().sub(perpVector)];
        // Array of polygons
        try {
            var sliced = PolyK.Slice(PolygonUtil.polygonToPolygonArray(p), bisect[0].x, bisect[0].y, bisect[1].x, bisect[1].y);
            try {
                // Recursive call
                for (var sliced_1 = __values(sliced), sliced_1_1 = sliced_1.next(); !sliced_1_1.done; sliced_1_1 = sliced_1.next()) {
                    var s = sliced_1_1.value;
                    divided.push.apply(divided, __spreadArray([], __read(PolygonUtil.subdividePolygon(PolygonUtil.polygonArrayToPolygon(s), minArea)), false));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (sliced_1_1 && !sliced_1_1.done && (_a = sliced_1.return)) _a.call(sliced_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return divided;
        }
        catch (error) {
            log.error(error);
            return [];
        }
    };
    /**
     * Shrink or expand polygon
     */
    PolygonUtil.resizeGeometry = function (geometry, spacing, isPolygon) {
        if (isPolygon === void 0) { isPolygon = true; }
        try {
            var jstsGeometry = isPolygon ? PolygonUtil.polygonToJts(geometry) : PolygonUtil.lineToJts(geometry);
            var resized = jstsGeometry.buffer(spacing, undefined, jsts.operation.buffer.BufferParameters.CAP_FLAT);
            if (!resized.isSimple()) {
                return [];
            }
            return resized.getCoordinates().map(function (c) { return new vector_1.default(c.x, c.y); });
        }
        catch (error) {
            log.error(error);
            return [];
        }
    };
    PolygonUtil.averagePoint = function (polygon) {
        var e_2, _a;
        if (polygon.length === 0)
            return vector_1.default.zeroVector();
        var sum = vector_1.default.zeroVector();
        try {
            for (var polygon_1 = __values(polygon), polygon_1_1 = polygon_1.next(); !polygon_1_1.done; polygon_1_1 = polygon_1.next()) {
                var v = polygon_1_1.value;
                sum.add(v);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (polygon_1_1 && !polygon_1_1.done && (_a = polygon_1.return)) _a.call(polygon_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return sum.divideScalar(polygon.length);
    };
    PolygonUtil.insidePolygon = function (point, polygon) {
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
        if (polygon.length === 0) {
            return false;
        }
        var inside = false;
        for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            var xi = polygon[i].x, yi = polygon[i].y;
            var xj = polygon[j].x, yj = polygon[j].y;
            var intersect = ((yi > point.y) != (yj > point.y))
                && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
            if (intersect)
                inside = !inside;
        }
        return inside;
    };
    PolygonUtil.pointInRectangle = function (point, origin, dimensions) {
        return point.x >= origin.x && point.y >= origin.y && point.x <= dimensions.x && point.y <= dimensions.y;
    };
    PolygonUtil.lineToJts = function (line) {
        var coords = line.map(function (v) { return new jsts.geom.Coordinate(v.x, v.y); });
        return PolygonUtil.geometryFactory.createLineString(coords);
    };
    PolygonUtil.polygonToJts = function (polygon) {
        var geoInput = polygon.map(function (v) { return new jsts.geom.Coordinate(v.x, v.y); });
        geoInput.push(geoInput[0]); // Create loop
        return PolygonUtil.geometryFactory.createPolygon(PolygonUtil.geometryFactory.createLinearRing(geoInput), []);
    };
    /**
     * [ v.x, v.y, v.x, v.y ]...
     */
    PolygonUtil.polygonToPolygonArray = function (p) {
        var e_3, _a;
        var outP = [];
        try {
            for (var p_1 = __values(p), p_1_1 = p_1.next(); !p_1_1.done; p_1_1 = p_1.next()) {
                var v = p_1_1.value;
                outP.push(v.x);
                outP.push(v.y);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (p_1_1 && !p_1_1.done && (_a = p_1.return)) _a.call(p_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return outP;
    };
    /**
     * [ v.x, v.y, v.x, v.y ]...
     */
    PolygonUtil.polygonArrayToPolygon = function (p) {
        var outP = [];
        for (var i = 0; i < p.length / 2; i++) {
            outP.push(new vector_1.default(p[2 * i], p[2 * i + 1]));
        }
        return outP;
    };
    PolygonUtil.geometryFactory = new jsts.geom.GeometryFactory();
    return PolygonUtil;
}());
exports.default = PolygonUtil;

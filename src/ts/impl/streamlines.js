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
var simplify = require("simplify-js");
var vector_1 = require("../vector");
var grid_storage_1 = require("./grid_storage");
/**
 * Creates polylines that make up the roads by integrating the tensor field
 * See the paper 'Interactive Procedural Street Modeling' for a thorough explanation
 */
var StreamlineGenerator = /** @class */ (function () {
    /**
     * Uses world-space coordinates
     */
    function StreamlineGenerator(integrator, origin, worldDimensions, params) {
        this.integrator = integrator;
        this.origin = origin;
        this.worldDimensions = worldDimensions;
        this.params = params;
        this.SEED_AT_ENDPOINTS = false;
        this.NEAR_EDGE = 3; // Sample near edge
        this.candidateSeedsMajor = [];
        this.candidateSeedsMinor = [];
        this.streamlinesDone = true;
        this.lastStreamlineMajor = true;
        this.allStreamlines = [];
        this.streamlinesMajor = [];
        this.streamlinesMinor = [];
        this.allStreamlinesSimple = []; // Reduced vertex count
        if (params.dstep > params.dsep) {
            log.error("STREAMLINE SAMPLE DISTANCE BIGGER THAN DSEP");
        }
        // Enforce test < sep
        params.dtest = Math.min(params.dtest, params.dsep);
        // Needs to be less than circlejoin
        this.dcollideselfSq = Math.pow((params.dcirclejoin / 2), 2);
        this.nStreamlineStep = Math.floor(params.dcirclejoin / params.dstep);
        this.nStreamlineLookBack = 2 * this.nStreamlineStep;
        this.majorGrid = new grid_storage_1.default(this.worldDimensions, this.origin, params.dsep);
        this.minorGrid = new grid_storage_1.default(this.worldDimensions, this.origin, params.dsep);
        this.setParamsSq();
    }
    StreamlineGenerator.prototype.clearStreamlines = function () {
        this.allStreamlinesSimple = [];
        this.streamlinesMajor = [];
        this.streamlinesMinor = [];
        this.allStreamlines = [];
    };
    /**
     * Edits streamlines
     */
    StreamlineGenerator.prototype.joinDanglingStreamlines = function () {
        var e_1, _a, e_2, _b, e_3, _c, e_4, _d, e_5, _e;
        try {
            // TODO do in update method
            for (var _f = __values([true, false]), _g = _f.next(); !_g.done; _g = _f.next()) {
                var major = _g.value;
                try {
                    for (var _h = (e_2 = void 0, __values(this.streamlines(major))), _j = _h.next(); !_j.done; _j = _h.next()) {
                        var streamline = _j.value;
                        // Ignore circles
                        if (streamline[0].equals(streamline[streamline.length - 1])) {
                            continue;
                        }
                        var newStart = this.getBestNextPoint(streamline[0], streamline[4], streamline);
                        if (newStart !== null) {
                            try {
                                for (var _k = (e_3 = void 0, __values(this.pointsBetween(streamline[0], newStart, this.params.dstep))), _l = _k.next(); !_l.done; _l = _k.next()) {
                                    var p = _l.value;
                                    streamline.unshift(p);
                                    this.grid(major).addSample(p);
                                }
                            }
                            catch (e_3_1) { e_3 = { error: e_3_1 }; }
                            finally {
                                try {
                                    if (_l && !_l.done && (_c = _k.return)) _c.call(_k);
                                }
                                finally { if (e_3) throw e_3.error; }
                            }
                        }
                        var newEnd = this.getBestNextPoint(streamline[streamline.length - 1], streamline[streamline.length - 4], streamline);
                        if (newEnd !== null) {
                            try {
                                for (var _m = (e_4 = void 0, __values(this.pointsBetween(streamline[streamline.length - 1], newEnd, this.params.dstep))), _o = _m.next(); !_o.done; _o = _m.next()) {
                                    var p = _o.value;
                                    streamline.push(p);
                                    this.grid(major).addSample(p);
                                }
                            }
                            catch (e_4_1) { e_4 = { error: e_4_1 }; }
                            finally {
                                try {
                                    if (_o && !_o.done && (_d = _m.return)) _d.call(_m);
                                }
                                finally { if (e_4) throw e_4.error; }
                            }
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_j && !_j.done && (_b = _h.return)) _b.call(_h);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // Reset simplified streamlines
        this.allStreamlinesSimple = [];
        try {
            for (var _p = __values(this.allStreamlines), _q = _p.next(); !_q.done; _q = _p.next()) {
                var s = _q.value;
                this.allStreamlinesSimple.push(this.simplifyStreamline(s));
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_q && !_q.done && (_e = _p.return)) _e.call(_p);
            }
            finally { if (e_5) throw e_5.error; }
        }
    };
    /**
     * Returns array of points from v1 to v2 such that they are separated by at most dsep
     * not including v1
     */
    StreamlineGenerator.prototype.pointsBetween = function (v1, v2, dstep) {
        var d = v1.distanceTo(v2);
        var nPoints = Math.floor(d / dstep);
        if (nPoints === 0)
            return [];
        var stepVector = v2.clone().sub(v1);
        var out = [];
        var i = 1;
        var next = v1.clone().add(stepVector.clone().multiplyScalar(i / nPoints));
        for (i = 1; i <= nPoints; i++) {
            if (this.integrator.integrate(next, true).lengthSq() > 0.001) { // Test for degenerate point
                out.push(next);
            }
            else {
                return out;
            }
            next = v1.clone().add(stepVector.clone().multiplyScalar(i / nPoints));
        }
        return out;
    };
    /**
     * Gets next best point to join streamline
     * returns null if there are no good candidates
     */
    StreamlineGenerator.prototype.getBestNextPoint = function (point, previousPoint, streamline) {
        var e_6, _a;
        var nearbyPoints = this.majorGrid.getNearbyPoints(point, this.params.dlookahead);
        nearbyPoints.push.apply(nearbyPoints, __spreadArray([], __read(this.minorGrid.getNearbyPoints(point, this.params.dlookahead)), false));
        var direction = point.clone().sub(previousPoint);
        var closestSample = null;
        var closestDistance = Infinity;
        try {
            for (var nearbyPoints_1 = __values(nearbyPoints), nearbyPoints_1_1 = nearbyPoints_1.next(); !nearbyPoints_1_1.done; nearbyPoints_1_1 = nearbyPoints_1.next()) {
                var sample = nearbyPoints_1_1.value;
                if (!sample.equals(point) && !sample.equals(previousPoint)) { // && !streamline.includes(sample)) {
                    var differenceVector = sample.clone().sub(point);
                    if (differenceVector.dot(direction) < 0) {
                        // Backwards
                        continue;
                    }
                    // Acute angle between vectors (agnostic of CW, ACW)
                    var distanceToSample = point.distanceToSquared(sample);
                    if (distanceToSample < 2 * this.paramsSq.dstep) {
                        closestSample = sample;
                        break;
                    }
                    var angleBetween = Math.abs(vector_1.default.angleBetween(direction, differenceVector));
                    // Filter by angle
                    if (angleBetween < this.params.joinangle && distanceToSample < closestDistance) {
                        closestDistance = distanceToSample;
                        closestSample = sample;
                    }
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (nearbyPoints_1_1 && !nearbyPoints_1_1.done && (_a = nearbyPoints_1.return)) _a.call(nearbyPoints_1);
            }
            finally { if (e_6) throw e_6.error; }
        }
        // TODO is reimplement simplify-js to preserve intersection points
        //  - this is the primary reason polygons aren't found
        // If trying to find intersections in the simplified graph
        // prevent ends getting pulled away from simplified lines
        if (closestSample !== null) {
            closestSample = closestSample.clone().add(direction.setLength(this.params.simplifyTolerance * 4));
        }
        return closestSample;
    };
    /**
     * Assumes s has already generated
     */
    StreamlineGenerator.prototype.addExistingStreamlines = function (s) {
        this.majorGrid.addAll(s.majorGrid);
        this.minorGrid.addAll(s.minorGrid);
    };
    StreamlineGenerator.prototype.setGrid = function (s) {
        this.majorGrid = s.majorGrid;
        this.minorGrid = s.minorGrid;
    };
    /**
     * returns true if state updates
     */
    StreamlineGenerator.prototype.update = function () {
        if (!this.streamlinesDone) {
            this.lastStreamlineMajor = !this.lastStreamlineMajor;
            if (!this.createStreamline(this.lastStreamlineMajor)) {
                this.streamlinesDone = true;
                this.resolve();
            }
            return true;
        }
        return false;
    };
    /**
     * All at once - will freeze if dsep small
     */
    StreamlineGenerator.prototype.createAllStreamlines = function (animate) {
        if (animate === void 0) { animate = false; }
        return __awaiter(this, void 0, void 0, function () {
            var major;
            return __generator(this, function (_a) {
                console.log('begin of createAllStreamlines');
                this.streamlinesDone = false;
                if (!animate) {
                    major = true;
                    while (this.createStreamline(major)) {
                        console.log('  createStreamline returned true');
                        major = !major;
                    }
                }
                this.joinDanglingStreamlines();
                return [2 /*return*/];
            });
        });
    };
    StreamlineGenerator.prototype.simplifyStreamline = function (streamline) {
        var e_7, _a;
        var simplified = [];
        try {
            for (var _b = __values(simplify(streamline, this.params.simplifyTolerance)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var point = _c.value;
                simplified.push(new vector_1.default(point.x, point.y));
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_7) throw e_7.error; }
        }
        return simplified;
    };
    /**
     * Finds seed and creates a streamline from that point
     * Pushes new candidate seeds to queue
     * @return {Vector[]} returns false if seed isn't found within params.seedTries
     */
    StreamlineGenerator.prototype.createStreamline = function (major) {
        var seed = this.getSeed(major);
        if (seed === null) {
            return false;
        }
        var streamline = this.integrateStreamline(seed, major);
        if (this.validStreamline(streamline)) {
            this.grid(major).addPolyline(streamline);
            this.streamlines(major).push(streamline);
            this.allStreamlines.push(streamline);
            this.allStreamlinesSimple.push(this.simplifyStreamline(streamline));
            // Add candidate seeds
            if (!streamline[0].equals(streamline[streamline.length - 1])) {
                this.candidateSeeds(!major).push(streamline[0]);
                this.candidateSeeds(!major).push(streamline[streamline.length - 1]);
            }
        }
        return true;
    };
    StreamlineGenerator.prototype.validStreamline = function (s) {
        return s.length > 5;
    };
    StreamlineGenerator.prototype.setParamsSq = function () {
        this.paramsSq = Object.assign({}, this.params);
        for (var p in this.paramsSq) {
            if (typeof this.paramsSq[p] === "number") {
                this.paramsSq[p] *= this.paramsSq[p];
            }
        }
    };
    StreamlineGenerator.prototype.samplePoint = function () {
        // TODO better seeding scheme
        return new vector_1.default(Math.random() * this.worldDimensions.x, Math.random() * this.worldDimensions.y)
            .add(this.origin);
    };
    /**
     * Tries this.candidateSeeds first, then samples using this.samplePoint
     */
    StreamlineGenerator.prototype.getSeed = function (major) {
        // Candidate seeds first
        if (this.SEED_AT_ENDPOINTS && this.candidateSeeds(major).length > 0) {
            while (this.candidateSeeds(major).length > 0) {
                var seed_1 = this.candidateSeeds(major).pop();
                if (this.isValidSample(major, seed_1, this.paramsSq.dsep)) {
                    return seed_1;
                }
            }
        }
        var seed = this.samplePoint();
        var i = 0;
        while (!this.isValidSample(major, seed, this.paramsSq.dsep)) {
            if (i >= this.params.seedTries) {
                return null;
            }
            seed = this.samplePoint();
            i++;
        }
        return seed;
    };
    StreamlineGenerator.prototype.isValidSample = function (major, point, dSq, bothGrids) {
        if (bothGrids === void 0) { bothGrids = false; }
        // dSq = dSq * point.distanceToSquared(Vector.zeroVector());
        var gridValid = this.grid(major).isValidSample(point, dSq);
        if (bothGrids) {
            gridValid = gridValid && this.grid(!major).isValidSample(point, dSq);
        }
        return this.integrator.onLand(point) && gridValid;
    };
    StreamlineGenerator.prototype.candidateSeeds = function (major) {
        return major ? this.candidateSeedsMajor : this.candidateSeedsMinor;
    };
    StreamlineGenerator.prototype.streamlines = function (major) {
        return major ? this.streamlinesMajor : this.streamlinesMinor;
    };
    StreamlineGenerator.prototype.grid = function (major) {
        return major ? this.majorGrid : this.minorGrid;
    };
    StreamlineGenerator.prototype.pointInBounds = function (v) {
        return (v.x >= this.origin.x
            && v.y >= this.origin.y
            && v.x < this.worldDimensions.x + this.origin.x
            && v.y < this.worldDimensions.y + this.origin.y);
    };
    /**
     * Didn't end up using - bit expensive, used streamlineTurned instead
     * Stops spirals from forming
     * uses 0.5 dcirclejoin so that circles are still joined up
     * testSample is candidate to pushed on end of streamlineForwards
     * returns true if streamline collides with itself
     */
    StreamlineGenerator.prototype.doesStreamlineCollideSelf = function (testSample, streamlineForwards, streamlineBackwards) {
        // Streamline long enough
        if (streamlineForwards.length > this.nStreamlineLookBack) {
            // Forwards check
            for (var i = 0; i < streamlineForwards.length - this.nStreamlineLookBack; i += this.nStreamlineStep) {
                if (testSample.distanceToSquared(streamlineForwards[i]) < this.dcollideselfSq) {
                    return true;
                }
            }
            // Backwards check
            for (var i = 0; i < streamlineBackwards.length; i += this.nStreamlineStep) {
                if (testSample.distanceToSquared(streamlineBackwards[i]) < this.dcollideselfSq) {
                    return true;
                }
            }
        }
        return false;
    };
    /**
     * Tests whether streamline has turned through greater than 180 degrees
     */
    StreamlineGenerator.prototype.streamlineTurned = function (seed, originalDir, point, direction) {
        if (originalDir.dot(direction) < 0) {
            // TODO optimise
            var perpendicularVector = new vector_1.default(originalDir.y, -originalDir.x);
            var isLeft = point.clone().sub(seed).dot(perpendicularVector) < 0;
            var directionUp = direction.dot(perpendicularVector) > 0;
            return isLeft === directionUp;
        }
        return false;
    };
    /**
     * // TODO this doesn't work well - consider something disallowing one direction (F/B) to turn more than 180 deg
     * One step of the streamline integration process
     */
    StreamlineGenerator.prototype.streamlineIntegrationStep = function (params, major, collideBoth) {
        if (params.valid) {
            params.streamline.push(params.previousPoint);
            var nextDirection = this.integrator.integrate(params.previousPoint, major);
            // Stop at degenerate point
            if (nextDirection.lengthSq() < 0.01) {
                params.valid = false;
                return;
            }
            // Make sure we travel in the same direction
            if (nextDirection.dot(params.previousDirection) < 0) {
                nextDirection.negate();
            }
            var nextPoint = params.previousPoint.clone().add(nextDirection);
            // Visualise stopping points
            // if (this.streamlineTurned(params.seed, params.originalDir, nextPoint, nextDirection)) {
            //     params.valid = false;
            //     params.streamline.push(Vector.zeroVector());
            // }
            if (this.pointInBounds(nextPoint)
                && this.isValidSample(major, nextPoint, this.paramsSq.dtest, collideBoth)
                && !this.streamlineTurned(params.seed, params.originalDir, nextPoint, nextDirection)) {
                params.previousPoint = nextPoint;
                params.previousDirection = nextDirection;
            }
            else {
                // One more step
                params.streamline.push(nextPoint);
                params.valid = false;
            }
        }
    };
    /**
     * By simultaneously integrating in both directions we reduce the impact of circles not joining
     * up as the error matches at the join
     */
    StreamlineGenerator.prototype.integrateStreamline = function (seed, major) {
        var _a;
        var count = 0;
        var pointsEscaped = false; // True once two integration fronts have moved dlookahead away
        // Whether or not to test validity using both grid storages
        // (Collide with both major and minor)
        var collideBoth = Math.random() < this.params.collideEarly;
        var d = this.integrator.integrate(seed, major);
        var forwardParams = {
            seed: seed,
            originalDir: d,
            streamline: [seed],
            previousDirection: d,
            previousPoint: seed.clone().add(d),
            valid: true,
        };
        forwardParams.valid = this.pointInBounds(forwardParams.previousPoint);
        var negD = d.clone().negate();
        var backwardParams = {
            seed: seed,
            originalDir: negD,
            streamline: [],
            previousDirection: negD,
            previousPoint: seed.clone().add(negD),
            valid: true,
        };
        backwardParams.valid = this.pointInBounds(backwardParams.previousPoint);
        while (count < this.params.pathIterations && (forwardParams.valid || backwardParams.valid)) {
            this.streamlineIntegrationStep(forwardParams, major, collideBoth);
            this.streamlineIntegrationStep(backwardParams, major, collideBoth);
            // Join up circles
            var sqDistanceBetweenPoints = forwardParams.previousPoint.distanceToSquared(backwardParams.previousPoint);
            if (!pointsEscaped && sqDistanceBetweenPoints > this.paramsSq.dcirclejoin) {
                pointsEscaped = true;
            }
            if (pointsEscaped && sqDistanceBetweenPoints <= this.paramsSq.dcirclejoin) {
                forwardParams.streamline.push(forwardParams.previousPoint);
                forwardParams.streamline.push(backwardParams.previousPoint);
                backwardParams.streamline.push(backwardParams.previousPoint);
                break;
            }
            count++;
        }
        (_a = backwardParams.streamline.reverse()).push.apply(_a, __spreadArray([], __read(forwardParams.streamline), false));
        return backwardParams.streamline;
    };
    return StreamlineGenerator;
}());
exports.default = StreamlineGenerator;

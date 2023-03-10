import * as log from 'loglevel';
// import DomainController from './domain_controller';
import TensorField from '../impl/tensor_field';
import Graph from '../impl/graph';
import Vector from '../vector';
import PolygonFinder from '../impl/polygon_finder';
import {PolygonParams} from '../impl/polygon_finder';


export interface BuildingModel {
    height: number;
    lotWorld: Vector[]; // In world space
    lotScreen: Vector[]; // In screen space
    roof: Vector[]; // In screen space
    sides: Vector[][]; // In screen space
}

/**
 * Pseudo 3D buildings
 */
class BuildingModels {
    // private domainController = DomainController.getInstance();
    protected origin = Vector.zeroVector();
    protected worldDimensions = new Vector(1440, 1080);
    protected zoom = 1;
    protected orthographic = false;
    private _buildingModels: BuildingModel[] = [];

    constructor(lots: Vector[][]) {  // Lots in world space
        for (const lot of lots) {
            this._buildingModels.push({
                height: Math.random() * 20 + 20,
                lotWorld: lot,
                lotScreen: [],
                roof: [],
                sides: []
            });
        }
        this._buildingModels.sort((a, b) => a.height - b.height);
    }

    get buildingModels(): BuildingModel[] {
        return this._buildingModels;
    }

    /**
     * Recalculated when the camera moves
     */
    setBuildingProjections(): void {
        const d = 1000 / this.zoom;
        const cameraPos = this.getCameraPosition();
        for (const b of this._buildingModels) {
            b.lotScreen = b.lotWorld.map(v => this.worldToScreen(v.clone()));
            b.roof = b.lotScreen.map(v => this.heightVectorToScreen(v, b.height, d, cameraPos));
            b.sides = this.getBuildingSides(b);
        }
    }

    private heightVectorToScreen(v: Vector, h: number, d: number, camera: Vector): Vector {
        const scale = (d / (d - h)); // 0.1
        if (this.orthographic) {
            // const diff = this.domainController.cameraDirection.multiplyScalar(-h * scale);
            return v.clone().add(Vector.zeroVector());
        } else {
            return v.clone().sub(camera).multiplyScalar(scale).add(camera);
        }
    }

    /**
     * Get sides of buildings by joining corresponding edges between the roof and ground
     */
    private getBuildingSides(b: BuildingModel): Vector[][] {
        const polygons: Vector[][] = [];
        for (let i = 0; i < b.lotScreen.length; i++) {
            const next = (i + 1) % b.lotScreen.length;
            polygons.push([b.lotScreen[i], b.lotScreen[next], b.roof[next], b.roof[i]]);
        }
        return polygons;
    }

        /**
     * Edits vector
     */
        zoomToWorld(v: Vector): Vector {
            return v.divideScalar(this.zoom);
        }
    
        /**
         * Edits vector
         */
        zoomToScreen(v: Vector): Vector {
            return v.multiplyScalar(this.zoom);
        }
    
        /**
         * Edits vector
         */
        screenToWorld(v: Vector): Vector {
            return this.zoomToWorld(v).add(this.origin);
        }
    
        /**
         * Edits vector
         */
        worldToScreen(v: Vector): Vector {
            return this.zoomToScreen(v.sub(this.origin));
        }

        getCameraPosition(): Vector {
            const centre = new Vector(this.worldDimensions.x / 2, this.worldDimensions.y / 2);
            if (this.orthographic) {
                return centre.add(centre.clone().multiply(Vector.zeroVector()).multiplyScalar(100));
            }
            return centre.add(centre.clone().multiply(Vector.zeroVector()));
            // this.screenDimensions.divideScalar(2);
        }
}

/**
 * Finds building lots and optionally pseudo3D buildings
 */
export default class Buildings {
    private polygonFinder: PolygonFinder;
    private allStreamlines: Vector[][] = [];
    // private domainController = DomainController.getInstance();
    protected origin = Vector.zeroVector();
    protected worldDimensions = new Vector(1440, 1080);
    protected zoom = 1;
    private preGenerateCallback: () => any = () => {};
    private postGenerateCallback: () => any = () => {};
    private _models: BuildingModels = new BuildingModels([]);
    private _blocks: Vector[][] = [];

    private buildingParams: PolygonParams = {
        maxLength: 20,
        minArea: 50,
        shrinkSpacing: 4,
        chanceNoDivide: 0.05,
    };

    constructor(private tensorField: TensorField,
                /*folder: dat.GUI,*/
                private redraw: () => void,
                private dstep: number,
                private _animate: boolean) {
        // folder.add({'AddBuildings': () => this.generate(this._animate)}, 'AddBuildings');
        // folder.add(this.buildingParams, 'minArea');
        // folder.add(this.buildingParams, 'shrinkSpacing');
        // folder.add(this.buildingParams, 'chanceNoDivide');
        this.polygonFinder = new PolygonFinder([], this.buildingParams, this.tensorField);
    }

    set animate(v: boolean) {
        this._animate = v;
    }

    get lots(): Vector[][] {
        return this.polygonFinder.polygons.map(p => p.map(v => this.worldToScreen(v.clone())));
    }

    /**
     * Only used when creating the 3D model to 'fake' the roads
     */
    getBlocks(): Promise<Vector[][]> {
        const g = new Graph(this.allStreamlines, this.dstep, true);
        const blockParams = Object.assign({}, this.buildingParams);
        blockParams.shrinkSpacing = blockParams.shrinkSpacing/2;
        const polygonFinder = new PolygonFinder(g.nodes, blockParams, this.tensorField);
        polygonFinder.findPolygons();
        return polygonFinder.shrink(false).then(() => polygonFinder.polygons.map(p => p.map(v => this.worldToScreen(v.clone()))));
    }

    get models(): BuildingModel[] {
        this._models.setBuildingProjections();
        return this._models.buildingModels;
    }

    setAllStreamlines(s: Vector[][]): void {
        this.allStreamlines = s;
    }

    reset(): void {
        this.polygonFinder.reset();
        this._models = new BuildingModels([]);
    }

    update(): boolean {
        return this.polygonFinder.update();
    }

    /**
     * Finds blocks, shrinks and divides them to create building lots
     */
    async generate(animate: boolean): Promise<void> {
        console.log('begin of buildings.generate');
        console.log('  calling preGenerateCallback');
        console.log('  allStreamlines.length - ' + this.allStreamlines.length);
        this.preGenerateCallback();
        console.log('  allStreamlines.length - ' + this.allStreamlines.length);
        this._models = new BuildingModels([]);
        const g = new Graph(this.allStreamlines, this.dstep, true);

        this.polygonFinder = new PolygonFinder(g.nodes, this.buildingParams, this.tensorField);
        console.log('  polygons length after initialization - ' + this.polygonFinder.polygons.length);
        await this.polygonFinder.findPolygons();
        console.log('  polygons length after findPolygons - ' + this.polygonFinder.polygons.length);
        await this.polygonFinder.shrink(animate);
        console.log('  polygons length after shrink - ' + this.polygonFinder.polygons.length);
        await this.polygonFinder.divide(animate);
        this.redraw();
        console.log('  polygons length after divide - ' + this.polygonFinder.polygons.length);
        this._models = new BuildingModels(this.polygonFinder.polygons);

        this.postGenerateCallback();
    }

    setPreGenerateCallback(callback: () => any): void {
        this.preGenerateCallback = callback;
    }

    setPostGenerateCallback(callback: () => any): void {
        this.postGenerateCallback = callback;
    }

    /**
     * Edits vector
     */
        zoomToWorld(v: Vector): Vector {
            return v.divideScalar(this.zoom);
        }
    
        /**
         * Edits vector
         */
        zoomToScreen(v: Vector): Vector {
            return v.multiplyScalar(this.zoom);
        }
    
        /**
         * Edits vector
         */
        screenToWorld(v: Vector): Vector {
            return this.zoomToWorld(v).add(this.origin);
        }
    
        /**
         * Edits vector
         */
        worldToScreen(v: Vector): Vector {
            return this.zoomToScreen(v.sub(this.origin));
        }
}
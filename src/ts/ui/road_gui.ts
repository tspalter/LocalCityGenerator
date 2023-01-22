import * as log from 'loglevel';
import CanvasWrapper from './canvas_wrapper';
// import DomainController from './domain_controller';
import Util from '../util';
import FieldIntegrator from '../impl/integrator';
import {StreamlineParams} from '../impl/streamlines';
import StreamlineGenerator from '../impl/streamlines';
import Vector from '../vector';

/**
 * Handles creation of roads
 */
export default class RoadGUI {
    protected streamlines: StreamlineGenerator;
    private existingStreamlines: RoadGUI[] = [];
    // protected domainController = DomainController.getInstance();
    protected preGenerateCallback: () => any = () => {};
    protected postGenerateCallback: () => any = () => {};

    private streamlinesInProgress: boolean = false;

    protected origin = Vector.zeroVector();
    protected worldDimensions = new Vector(1440, 1080);
    protected zoom = 1;

    constructor(protected params: StreamlineParams,
                protected integrator: FieldIntegrator,
                /*protected guiFolder: dat.GUI,
                protected closeTensorFolder: () => void,*/
                protected folderName: string,
                protected redraw: () => void,
                protected _animate=false) {
        this.streamlines = new StreamlineGenerator(
            this.integrator, this.origin,
            this.worldDimensions, this.params);

        // Update path iterations based on window size
        this.setPathIterations();
        // window.addEventListener('resize', (): void => this.setPathIterations());
    }

    initFolder(): RoadGUI {
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
    }

    set animate(b: boolean) {
        this._animate = b;
    }

    get allStreamlines(): Vector[][] {
        return this.streamlines.allStreamlinesSimple;
    }

    get roads(): Vector[][] {
        // For drawing not generation, probably fine to leave map
        return this.streamlines.allStreamlinesSimple.map(s =>
            s.map(v => this.worldToScreen(v.clone()))
        );
    }

    roadsEmpty(): boolean {
        return this.streamlines.allStreamlinesSimple.length === 0;
    }

    setExistingStreamlines(existingStreamlines: RoadGUI[]): void {
        this.existingStreamlines = existingStreamlines;
    }

    setPreGenerateCallback(callback: () => any) {
        this.preGenerateCallback = callback;
    }

    setPostGenerateCallback(callback: () => any) {
        this.postGenerateCallback = callback;
    }

    clearStreamlines(): void {
        this.streamlines.clearStreamlines();
    }

    async generateRoads(animate=false): Promise<void> {
        console.log('begin of generateRoads');
        console.log('  calling preGenerateCallback');
        this.preGenerateCallback();

        console.log('  calculatingZoom');
        this.zoom = this.zoom / Util.DRAW_INFLATE_AMOUNT;

        console.log('  instantiating StreamlineGenerator');
        this.streamlines = new StreamlineGenerator(
            this.integrator, this.origin,
            this.worldDimensions, Object.assign({},this.params));
        
        console.log('  recalculating zoom');
        this.zoom = this.zoom * Util.DRAW_INFLATE_AMOUNT;

        console.log('  Adding existing streamlines');
        for (const s of this.existingStreamlines) {
            this.streamlines.addExistingStreamlines(s.streamlines)   
        }

        // this.closeTensorFolder();
        console.log('  Redraing');
        this.redraw();

        console.log('  awaiting createAllStreamlines');
        await this.streamlines.createAllStreamlines(animate);

        console.log('  calling postGenerateCallback');
        this.postGenerateCallback();

        console.log('  allStreamlines.length - ' + this.allStreamlines.length);

        console.log('end of generateRoads');
        //return this.streamlines.createAllStreamlines(animate).then(() => this.postGenerateCallback());
    }

    /**
     * Returns true if streamlines changes
     */
    update(): boolean {
        return this.streamlines.update();
    }

    protected addDevParamsToFolder(params: StreamlineParams): void {
        // folder.add(params, 'pathIterations');
        // folder.add(params, 'seedTries');
        // folder.add(params, 'dstep');
        // folder.add(params, 'dlookahead');
        // folder.add(params, 'dcirclejoin');
        // folder.add(params, 'joinangle');
        // folder.add(params, 'simplifyTolerance');
        // folder.add(params, 'collideEarly');
    }

    /**
     * Sets path iterations so that a road can cover the screen
     */
    private setPathIterations(): void {
        // const max = 1.5 * Math.max(window.innerWidth, window.innerHeight);
        // this.params.pathIterations = max/this.params.dstep;
        // Util.updateGui(this.guiFolder);
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

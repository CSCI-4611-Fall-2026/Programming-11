/* Programming 11
 * CSCI 4611, Fall 2026, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'
import { GUI } from 'dat.gui'

import { RobotArm } from './RobotArm';

export class App extends gfx.GfxApp
{
    private cameraControls: gfx.OrbitControls;
    private robotArm: RobotArm;

    public upperArmRotate: number;
    public upperArmBend: number;
    public middleArmBend: number;
    public lowerArmBend: number;

    // --- Create the App class ---
    constructor()
    {
        // initialize the base class gfx.GfxApp
        super();

        this.cameraControls = new gfx.OrbitControls(this.camera);

        this.robotArm = new RobotArm();

        this.upperArmRotate = 0;
        this.upperArmBend = 0;
        this.middleArmBend = 0;
        this.lowerArmBend = 0;
    }


    // --- Initialize the graphics scene ---
    createScene(): void 
    {
        // Setup camera
        this.camera.setPerspectiveCamera(60, 1920/1080, .1, 20)
        this.cameraControls.setTargetPoint(new gfx.Vector3(0, 0.75, 0));
        this.cameraControls.setDistance(1.6);

        // Set a black background
        this.renderer.background.set(0, 0, 0);
        
        // Create an ambient light
        const ambientLight = new gfx.AmbientLight(new gfx.Vector3(0.3, 0.3, 0.3));
        this.scene.add(ambientLight);

        // Create a directional light
        const directionalLight = new gfx.DirectionalLight(new gfx.Vector3(0.6, 0.6, 0.6));
        directionalLight.position.set(2, 1, 3)
        this.scene.add(directionalLight);

        const gridSize = 12;
        const gridVertices: gfx.Vector3[] = [];
        const gridColors: gfx.Color[] = [];

        const gridColor1 = new gfx.Color(0.75, 0.75, 0.75);
        const gridColor2 = new gfx.Color(0.25, 0.25, 0.25);

        for(let i=-gridSize/2; i <= gridSize/2; i++)
        {
            gridVertices.push(new gfx.Vector3(-gridSize/2, 0, i));
            gridVertices.push(new gfx.Vector3(gridSize/2, 0, i));
            gridVertices.push(new gfx.Vector3(i, 0, -gridSize/2));
            gridVertices.push(new gfx.Vector3(i, 0, gridSize/2));

            if(i % 2 == 0)
                gridColors.push(gridColor1, gridColor1, gridColor1, gridColor1);
            else
                gridColors.push(gridColor2, gridColor2, gridColor2, gridColor2);
        }

        const gridLines = new gfx.Line3(gfx.LineMode3.LINES);
        gridLines.setVertices(gridVertices);
        gridLines.setColors(gridColors);
        this.scene.add(gridLines);

        this.robotArm.showAxes = true;
        this.robotArm.createHierarchy();
        this.robotArm.createGeometry();
        this.scene.add(this.robotArm);

        // Keep the arm upright with bones extending along local negative Z
        this.robotArm.rotation.setRotationX(
            gfx.MathUtils.degreesToRadians(90)
        );

        // Create the GUI
        const gui = new GUI();

        const upperArmControls = gui.addFolder('Upper Arm Controls');
        upperArmControls.open();

        const upperRotateController = upperArmControls.add(this, 'upperArmRotate', -180, 180);
        upperRotateController.name('rotate');
        upperRotateController.onChange((value: number) => { 
             this.robotArm.bones.get("upperArm")!.rotation.setEulerAngles(
                gfx.MathUtils.degreesToRadians(this.upperArmBend),
                0, 
                gfx.MathUtils.degreesToRadians(this.upperArmRotate)
            );
        });

        const upperBendController = upperArmControls.add(this, 'upperArmBend', -45, 45);
        upperBendController.name('bend');
        upperBendController.onChange((value: number) => { 
            this.robotArm.bones.get("upperArm")!.rotation.setEulerAngles(
                gfx.MathUtils.degreesToRadians(this.upperArmBend),
                gfx.MathUtils.degreesToRadians(0), 
                gfx.MathUtils.degreesToRadians(this.upperArmRotate)
            );
         });

        const middleArmControls = gui.addFolder('Middle Arm Controls');
        middleArmControls.open();

        const middleBendController = middleArmControls.add(this, 'middleArmBend', -135, 135);
        middleBendController.name('bend');
        middleBendController.onChange((value: number) => { 
            this.robotArm.bones.get("middleArm")!.rotation.setRotationX(
                gfx.MathUtils.degreesToRadians(this.middleArmBend)
            );
        });

        const lowerArmControls = gui.addFolder('Lower Arm Controls');
        lowerArmControls.open();

        const lowerBendController = lowerArmControls.add(this, 'lowerArmBend', -135, 135);
        lowerBendController.name('bend');
        lowerBendController.onChange((value: number) => { 
            this.robotArm.bones.get("lowerArm")!.rotation.setRotationX(
                gfx.MathUtils.degreesToRadians(this.lowerArmBend),
            );
         });
    }

    
    // --- Update is called once each frame by the main graphics loop ---
    update(deltaTime: number): void 
    {
        this.cameraControls.update(deltaTime);
    }
}
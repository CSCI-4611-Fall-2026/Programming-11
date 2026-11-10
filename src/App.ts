/* Programming 11
 * CSCI 4611, Fall 2026, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'

import { RobotArm } from './RobotArm';

export class App extends gfx.GfxApp
{
    private cameraControls: gfx.OrbitControls;
    private robotArm: RobotArm;

    // --- Create the App class ---
    constructor()
    {
        // initialize the base class gfx.GfxApp
        super();

        this.cameraControls = new gfx.OrbitControls(this.camera);

        this.robotArm = new RobotArm();
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

        this.robotArm.bones.get("upperArm")!.rotation.setRotationZ(
            gfx.MathUtils.degreesToRadians(-10)
        );

        this.robotArm.bones.get("middleArm")!.rotation.setRotationZ(
            gfx.MathUtils.degreesToRadians(-30)
        );

        this.robotArm.bones.get("lowerArm")!.rotation.setRotationZ(
            gfx.MathUtils.degreesToRadians(-45)
        );
    }

    
    // --- Update is called once each frame by the main graphics loop ---
    update(deltaTime: number): void 
    {
        this.cameraControls.update(deltaTime);
    }
}
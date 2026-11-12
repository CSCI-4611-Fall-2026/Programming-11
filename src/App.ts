/* Programming 11
 * CSCI 4611, Fall 2026, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'
import { GUI } from 'dat.gui'

import { RobotArm } from './RobotArm';
import { Animation } from './animation/Animation';
import { Keyframe } from './animation/Keyframe';

export class App extends gfx.GfxApp
{
    private cameraControls: gfx.OrbitControls;
    private robotArm: RobotArm;
    private animation: Animation;
    private playbackTime: number;

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
        this.animation = new Animation();
        this.playbackTime = -1;

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

         gui.add(this, 'createKeyframe').name('Create Keyframe');
         gui.add(this, 'playAnimation').name('Play Animation');
    }

    
    // --- Update is called once each frame by the main graphics loop ---
    update(deltaTime: number): void 
    {
        this.cameraControls.update(deltaTime);

        const fps = 1;

        // A negative playback time means the animation is stopped.
        if(this.playbackTime >= 0)
        {
            this.playbackTime += deltaTime;
            const lastFrame = this.animation.frames.length - 1;

            // Convert elapsed seconds to a fractional frame index and clamp
            // it to the final keyframe so playback cannot run past the end.
            const fractionalFrame = Math.min(this.playbackTime * fps, lastFrame);

            // Find the two keyframes surrounding the current playback time.
            const currentFrame = Math.floor(fractionalFrame);
            const nextFrame = Math.min(currentFrame + 1, lastFrame);
            
            // The fractional part gives the blend weight: 0 is the current
            // keyframe, and values approaching 1 move toward the next one.
            const alpha = fractionalFrame - currentFrame;

            // Interpolate a copy so the recorded keyframes stay unchanged.
            const pose = this.animation.frames[currentFrame].clone();

            // Keyframe.lerp blends positions linearly and rotations with slerp.
            pose.lerp(this.animation.frames[nextFrame], alpha);

            // Apply each blended joint rotation to its corresponding bone.
            this.robotArm.bones.forEach((bone, name) => {
                bone.rotation.copy(pose.getJointRotation(name));
            });

            // Stop at the end, leaving the arm in the final recorded pose.
            if(fractionalFrame == lastFrame)
                this.playbackTime = -1;
        }
    }

    public createKeyframe(): void
    {
        // Give the new pose the next index in the animation's frame sequence.
        const pose = new Keyframe();
        pose.frame = this.animation.frames.length;

        // Save each bone's local rotation by name. Clone the quaternion so
        // later changes to the arm do not change the recorded pose.
        this.robotArm.bones.forEach((bone, name) => {
            pose.setJointRotation(name, bone.rotation.clone());
        });

        // Append the pose so keyframes play in the order they were recorded.
        this.animation.appendKeyframe(pose);
    }

    public playAnimation(): void
    {
        // Start playback only when at least one pose has been recorded.
        if(this.animation.frames.length > 0)
        {
            // Reset elapsed time to start (or restart) at the first keyframe.
            this.playbackTime = 0;
        }
    }
}
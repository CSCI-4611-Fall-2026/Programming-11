/* Programming 11
 * CSCI 4611, Fall 2026, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import { Bone } from './animation/Bone'
import { Skeleton } from './animation/Skeleton'
import * as gfx from 'gophergfx'

export class RobotArm extends Skeleton
{
    public showAxes: boolean;

    constructor()
    {
        super();

        this.showAxes = false;
    }

    public createHierarchy(): void
    {
         // Create the upper arm and add the bone as a child
        const upperArm = new Bone();
        upperArm.name = "upperArm";
        upperArm.direction.set(0, 0, -1);
        upperArm.direction.normalize();
        upperArm.length = 0.5;
        this.add(upperArm);

        const middleArm = new Bone();
        middleArm.name = "middleArm";
        middleArm.direction.set(0, 0, -1);
        middleArm.length = 0.25;
        middleArm.position = gfx.Vector3.multiplyScalar(
            upperArm.direction,
            upperArm.length
        );
        upperArm.add(middleArm);

        const lowerArm = new Bone();
        lowerArm.name = "lowerArm";
        lowerArm.direction.set(0, 0, -1);
        lowerArm.length = 0.25;
        lowerArm.position = gfx.Vector3.multiplyScalar(
            middleArm.direction,
            middleArm.length
        );
        middleArm.add(lowerArm);

        const endEffector = new Bone();
        endEffector.name = "endEffector";
        endEffector.direction.set(0, 0, -1);
        endEffector.length = 0.075;
        endEffector.position = gfx.Vector3.multiplyScalar(
            lowerArm.direction,
            lowerArm.length
        );
        lowerArm.add(endEffector);

        // Adds a key value pair to look up a bone by name
        // without having to traverse the scene graph
        // It doesn't actually add the bone as a child
        this.bones.set(upperArm.name, upperArm);
        this.bones.set(middleArm.name, middleArm);
        this.bones.set(lowerArm.name, lowerArm);
        this.bones.set(endEffector.name, endEffector);
    }

    public createGeometry(): void
    {
        this.children.forEach((child: gfx.Node3) => {
            if(child instanceof Bone)
            {
                this.createGeometryRecursive(child);
            }
        });
    }

    private createGeometryRecursive(bone: Bone): void
    {
        if(this.showAxes)
        {
            const axes = gfx.Geometry3Factory.createAxes(0.25);
            bone.add(axes);
        }

        // Create the geometry for the bone
        if(bone.name == 'upperArm')
        {
            const armMesh = gfx.Geometry3Factory.createBox();
            const S = gfx.Matrix4.makeScale(new gfx.Vector3(0.05, 0.05, bone.length));
            const R = gfx.Matrix4.makeAlign(new gfx.Vector3(0, 0, -1), bone.direction);
            const T = gfx.Matrix4.makeTranslation(new gfx.Vector3(0, 0, -bone.length/2));
            const M = gfx.Matrix4.multiplyAll(T, R, S);
            armMesh.setLocalToParentMatrix(M, false);
            bone.add(armMesh);
        }
        else if(bone.name == 'middleArm')
        {
            const armMesh = gfx.Geometry3Factory.createBox();
            const S = gfx.Matrix4.makeScale(new gfx.Vector3(0.05, 0.05, bone.length));
            const R = gfx.Matrix4.makeAlign(new gfx.Vector3(0, 0, -1), bone.direction);
            const T = gfx.Matrix4.makeTranslation(new gfx.Vector3(0, 0, -bone.length/2));
            const M = gfx.Matrix4.multiplyAll(T, R, S);
            armMesh.setLocalToParentMatrix(M, false);
            bone.add(armMesh);

            const sphere = gfx.Geometry3Factory.createSphere(0.05, 1);
            bone.add(sphere);
        }
        else if(bone.name == 'lowerArm')
        {
            const armMesh = gfx.Geometry3Factory.createBox();
            const S = gfx.Matrix4.makeScale(new gfx.Vector3(0.05, 0.05, bone.length));
            const R = gfx.Matrix4.makeAlign(new gfx.Vector3(0, 0, -1), bone.direction);
            const T = gfx.Matrix4.makeTranslation(new gfx.Vector3(0, 0, -bone.length/2));
            const M = gfx.Matrix4.multiplyAll(T, R, S);
            armMesh.setLocalToParentMatrix(M, false);
            bone.add(armMesh);

            const sphere = gfx.Geometry3Factory.createSphere(0.05, 1);
            bone.add(sphere);
        }
        else if(bone.name == 'endEffector')
        {
            const pincherRoot = new gfx.Node3();
            const S = gfx.Matrix4.makeScale(new gfx.Vector3(1, 1, 1));
            const R = gfx.Matrix4.makeAlign(new gfx.Vector3(0, 0, -1), bone.direction);
            const T = gfx.Matrix4.makeTranslation(new gfx.Vector3(0, 0, -bone.length/2));
            const M = gfx.Matrix4.multiplyAll(R, T, S);
            pincherRoot.setLocalToParentMatrix(M, false);
            bone.add(pincherRoot);

            const pincher = gfx.Geometry3Factory.createBox(0.025, 0.025, 0.1);
            const leftPincher1 = pincher.createInstance();
            const leftPincher2 = pincher.createInstance();
            const rightPincher1 = pincher.createInstance();
            const rightPincher2 = pincher.createInstance();

            leftPincher1.rotation.setRotationY(gfx.MathUtils.degreesToRadians(45));
            leftPincher1.position.set(-0.05, 0, 0);
            pincherRoot.add(leftPincher1);

            rightPincher1.rotation.setRotationY(gfx.MathUtils.degreesToRadians(-45));
            rightPincher1.position.set(0.05, 0, 0);
            pincherRoot.add(rightPincher1);

            const LT = gfx.Matrix4.makeTranslation(new gfx.Vector3(0, 0, -0.04));
            const LR = gfx.Matrix4.makeRotationY(gfx.MathUtils.degreesToRadians(-75));
            const LM = gfx.Matrix4.multiplyAll(LT, LR, LT);
            leftPincher2.setLocalToParentMatrix(LM, false);
            leftPincher1.add(leftPincher2);

            const RT = gfx.Matrix4.makeTranslation(new gfx.Vector3(0, 0, -0.04));
            const RR = gfx.Matrix4.makeRotationY(gfx.MathUtils.degreesToRadians(75));
            const RM = gfx.Matrix4.multiplyAll(RT, RR, RT);
            rightPincher2.setLocalToParentMatrix(RM, false);
            rightPincher1.add(rightPincher2);

            const sphere = gfx.Geometry3Factory.createSphere(0.05, 1);
            bone.add(sphere);
        }

        bone.children.forEach((child: gfx.Node3) => {
            if(child instanceof Bone)
            {
                this.createGeometryRecursive(child);
            }
        });
    }
}
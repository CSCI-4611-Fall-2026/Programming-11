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
        upperArm.direction.set(0, 1, 0);
        upperArm.direction.normalize();
        upperArm.length = 0.5;
        this.add(upperArm);

        const middleArm = new Bone();
        middleArm.name = "middleArm";
        middleArm.direction.set(0, 1, 0);
        middleArm.length = 0.25;
        middleArm.position = gfx.Vector3.multiplyScalar(
            upperArm.direction,
            upperArm.length
        );
        upperArm.add(middleArm);

        const lowerArm = new Bone();
        lowerArm.name = "lowerArm";
        lowerArm.direction.set(0, 1, 0);
        lowerArm.length = 0.25;
        lowerArm.position = gfx.Vector3.multiplyScalar(
            middleArm.direction,
            middleArm.length
        );
        middleArm.add(lowerArm);

        // Adds a key value pair to look up a bone by name
        // without having to traverse the scene graph
        // It doesn't actually add the bone as a child
        this.bones.set(upperArm.name, upperArm);
        this.bones.set(middleArm.name, middleArm);
        this.bones.set(lowerArm.name, lowerArm);
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
            const armMesh = gfx.Geometry3Factory.createBox(0.1, bone.length, 0.1);
            armMesh.position.set(0, bone.length/2, 0);
            armMesh.material.setColor(new gfx.Color(0, 1, 0));
            bone.add(armMesh);
        }
        else if(bone.name == 'middleArm')
        {
            const armMesh = gfx.Geometry3Factory.createBox(0.1, bone.length, 0.1);
            armMesh.position.set(0, bone.length/2, 0);
            armMesh.material.setColor(new gfx.Color(0, 0, 1));
            bone.add(armMesh);
        }
        else if(bone.name == 'lowerArm')
        {
            const armMesh = gfx.Geometry3Factory.createBox(0.1, bone.length, 0.1);
            armMesh.position.set(0, bone.length/2, 0);
            armMesh.material.setColor(new gfx.Color(1, 0, 0));
            bone.add(armMesh);
        }

        bone.children.forEach((child: gfx.Node3) => {
            if(child instanceof Bone)
            {
                this.createGeometryRecursive(child);
            }
        });
    }
}
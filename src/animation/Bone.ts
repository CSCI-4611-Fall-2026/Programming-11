/* Assignment 4: So You Think Ants Can Dance
 * CSCI 4611, Fall 2026, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 */

import { Keyframe } from "./Keyframe";
import * as gfx from 'gophergfx'

// A bone is a scene graph node, so its transform also affects its descendants.
export class Bone extends gfx.Node3
{
    // The name connects this bone to its joint rotation in a keyframe.
    public name: string;
    // The unrotated direction and length define the bone's offset.
    public direction: gfx.Vector3;
    public length: number;
    // Degrees of freedom indicate allowed rotations about x, y, and z.
    // These flags store metadata; updatePose does not enforce them.
    public dofs: boolean[];

    /** Creates a bone with empty geometry and joint metadata. */
    constructor()
    {
        super();

        // Start with an unnamed, zero-length bone and no enabled rotation axes.
        this.name = '';
        this.direction = new gfx.Vector3();
        this.length = 0;
        this.dofs = [false, false, false];
    }

    /** Applies the keyframe to this bone and its descendant bones. */
    public updatePose(pose: Keyframe): void
    {
        // Scale the direction into an offset, then rotate it by this joint's pose.
        // Node3 interprets this position relative to the parent node.
        this.position.copy(this.direction);
        this.position.multiplyScalar(this.length);
        this.position.rotate(pose.getJointRotation(this.name));

        // Set the local orientation; ancestor transforms are applied by the scene graph.
        this.rotation.copy(pose.getJointRotation(this.name));

        // Propagate the pose through the bone hierarchy, skipping meshes and other nodes.
        this.children.forEach((child: gfx.Node3) => {
            if(child instanceof Bone)
                child.updatePose(pose);
        });
    }

}

/* Assignment 4: So You Think Ants Can Dance
 * CSCI 4611, Fall 2026, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 */

import { Bone } from "./Bone";
import * as gfx from 'gophergfx'

// The skeleton is a scene graph node that can contain a hierarchy of bones.
export class Skeleton extends gfx.Node3
{
    // Look up bones by name without traversing the scene graph hierarchy.
    public bones: Map<string, Bone>;
    // Store coordinate-system conversions between bone space and the space
    // used to specify joint rotations; the two maps represent opposite directions.
    public boneToRotationSpaceMap: Map<string, gfx.Quaternion>;
    public rotationToBoneSpaceMap: Map<string, gfx.Quaternion>;

    // Store root pose data separately from Node3's position and rotation.
    // Assigning these values alone does not update the scene graph transform.
    public rootPosition: gfx.Vector3;
    public rootRotation: gfx.Quaternion;

    /** Creates a skeleton with empty bone maps and a default root transform. */
    constructor()
    {
        super();

        // Subclasses or loading code populate these maps when building a skeleton.
        this.bones = new Map();
        this.boneToRotationSpaceMap = new Map();
        this.rotationToBoneSpaceMap = new Map();

        // Initialize the root pose to the origin with the identity rotation.
        this.rootPosition = new gfx.Vector3();
        this.rootRotation = new gfx.Quaternion();
    }
}

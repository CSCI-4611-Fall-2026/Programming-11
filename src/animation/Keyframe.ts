/* Assignment 4: So You Think Ants Can Dance
 * CSCI 4611, Fall 2026, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 */

import * as gfx from 'gophergfx'

// A keyframe stores the skeleton's pose at one frame of an animation.
export class Keyframe
{
    public frame: number;
    // The root transform positions and orients the entire skeleton.
    public rootPosition: gfx.Vector3;
    public rootRotation: gfx.Quaternion;

    // Each named bone has a local joint rotation represented by a quaternion.
    private jointRotations: Map<string, gfx.Quaternion>;

    /** Creates a default root pose with an empty set of joint rotations. */
    constructor()
    {
        // Begin at frame zero, with the root at the origin and no rotation.
        this.frame = 0;
        this.rootPosition = new gfx.Vector3();
        this.rootRotation = new gfx.Quaternion();

        this.jointRotations = new Map();
    }

    /** Returns the stored rotation for a named bone or an identity quaternion if it is missing. */
    public getJointRotation(boneName: string): gfx.Quaternion
    {
        // Return the stored quaternion itself, rather than a copy.
        const jointRotation = this.jointRotations.get(boneName);

        if(jointRotation)
            return jointRotation;
        else
            // Missing joints default to the identity quaternion (no rotation).
            return new gfx.Quaternion();
    }

    /** Assigns the supplied quaternion to a named bone in this pose. */
    public setJointRotation(boneName: string, rotation: gfx.Quaternion): void
    {
        // Store the supplied quaternion by reference, replacing any previous entry.
        this.jointRotations.set(boneName, rotation);
    }

    /** Blends this pose in place toward another pose by the given weight. */
    public lerp(other: Keyframe, alpha: number): void
    {
        // Blend this keyframe in place toward other: alpha = 0 keeps this pose,
        // and alpha = 1 reaches the other pose for the joints stored here.
        // Round the interpolated frame number to retain an integer frame index.
        this.frame = Math.round(gfx.MathUtils.lerp(this.frame, other.frame, alpha));
        // Use linear interpolation for position and spherical interpolation for rotation.
        this.rootPosition.lerp(this.rootPosition, other.rootPosition, alpha);
        this.rootRotation.slerp(this.rootRotation, other.rootRotation, alpha);

        // Blend only joints already in this keyframe. A missing joint in other
        // blends toward identity through getJointRotation's default value.
        this.jointRotations.forEach((value: gfx.Quaternion, key: string) => {
            value.slerp(value, other.getJointRotation(key), alpha);
        });
    }

    /** Creates an independent copy of this keyframe and its transforms. */
    public clone(): Keyframe
    {
        // Copy into new vector/quaternion objects so edits to the clone do not
        // change this keyframe's root transform or joint rotations.
        const pose = new Keyframe();
        pose.frame = this.frame;
        pose.rootRotation.copy(this.rootRotation);
        pose.rootPosition.copy(this.rootPosition);
        
        this.jointRotations.forEach((value: gfx.Quaternion, key: string) => {
            pose.setJointRotation(key, value.clone());
        });

        return pose;
    }
}

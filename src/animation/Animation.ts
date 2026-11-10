/* Assignment 4: So You Think Ants Can Dance
 * CSCI 4611, Fall 2026, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 */

import { Keyframe } from './Keyframe'

// An animation clip stores its keyframes in playback order.
export class Animation
{
    public frames: Keyframe[];

    constructor()
    {
        this.frames = [];
    }

    // Remove frames from the start of the clip.
    public trimFront(numFrames: number): void
    {
        this.frames.splice(0, numFrames);
    }

    // Remove frames from the end of the clip.
    public trimBack(numFrames: number): void
    {
        this.frames.splice(this.frames.length-numFrames, numFrames);
    }

    // Insert a keyframe before the first frame.
    public prependKeyframe(frame: Keyframe): void
    {
        this.frames.unshift(frame);
    }

    // Insert a keyframe after the last frame.
    public appendKeyframe(frame: Keyframe): void
    {
        this.frames.push(frame);
    }
    
    public makeLoop(numBlendFrames: number): void
    {
        // Move the last few frames into a temporary clip, preserving their order.
        const tempClip = new Animation();
        for(let i=0; i < numBlendFrames; i++)
        {
            tempClip.prependKeyframe(this.frames.pop()!);
        }

        // Replace the opening frames with a blend that moves from the old
        // ending pose sequence back into the original opening sequence.
        for(let i=0; i < numBlendFrames; i++)
        {
            const alpha = i / (tempClip.frames.length-1);
            tempClip.frames[i].lerp(this.frames[i], alpha);
            this.frames[i] = tempClip.frames[i];
        }
    }
}
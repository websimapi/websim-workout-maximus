import { calculateAngle } from 'pose-detection';

let twistState = {
    left: false,
    right: false,
    reps: 0,
    progress: 0
};
const repsToComplete = 3;

export const exercises = [
    {
        name: 'Overhead Torso Twist',
        instructions: 'Raise both arms and twist your torso left and right!',
        damage: 15,
    }
];

function validateOverheadTorsoTwist(landmarks) {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    // Check if arms are raised
    const leftArmAngle = calculateAngle(leftHip, leftShoulder, leftElbow);
    const rightArmAngle = calculateAngle(rightHip, rightShoulder, rightElbow);
    const armsUp = leftArmAngle > 140 && rightArmAngle > 140;

    if (!armsUp) {
        // Reset if arms are lowered
        twistState.left = false;
        twistState.right = false;
        return { completed: false, progress: twistState.progress / repsToComplete };
    }

    // Check torso twist
    // A simple proxy for torso twist is the horizontal position of shoulders relative to hips
    const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
    const hipMidX = (leftHip.x + rightHip.x) / 2;
    const twistOffset = shoulderMidX - hipMidX;

    if (twistOffset > 0.05) { // Twisted right
        twistState.right = true;
    } else if (twistOffset < -0.05) { // Twisted left
        twistState.left = true;
    }
    
    // Check for a complete rep
    if (twistState.left && twistState.right) {
        twistState.reps++;
        twistState.left = false;
        twistState.right = false;
        twistState.progress = twistState.reps;
    }

    if (twistState.reps >= repsToComplete) {
        twistState.reps = 0;
        twistState.progress = 0;
        return { completed: true, progress: 1 };
    }
    
    return { completed: false, progress: twistState.progress / repsToComplete };
}


export function validatePose(exerciseName, landmarks) {
    switch (exerciseName) {
        case 'Overhead Torso Twist':
            return validateOverheadTorsoTwist(landmarks);
        default:
            return { completed: false, progress: 0 };
    }
}


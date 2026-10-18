package BlueDogWavePerformance {
    private import ScalarValues::*;
    part policy {
        attribute phaseCount : Integer = 16;
        attribute smallWaveHeightM : Real = 0.04;
        attribute maximumMotionRad : Real = 0.20;
        attribute maximumSteepness : Real = 0.05;
        attribute viscousDampingRatio : Real = 0.05;
        attribute maximumHeaveDraftRatio : Real = 0.5;
        attribute maximumMeanHeelDeg : Real = 25;
        attribute meshResolution : Integer = 5;
        attribute refinedMeshResolution : Integer = 9;
        attribute meshTolerance : Real = 0.15;
        attribute phaseTolerance : Real = 0.02;
        metadata rationale : ModelingMetadata::Rationale { text = "Fixed 1.4 m geometry. Linear potential-flow response includes heave, roll and pitch, with mesh-derived distributed component inertia and explicit 5 percent additional damping hypothesis. Mean wetted geometry is upright; mean heel limited to 25 degrees as an engineering screen, not a validation result. Wave phase loads are averaged while controls stay fixed during each cycle; SciPy solves mean surge, sway, yaw and roll balance and maximizes VMG. Added wave resistance retains the existing coefficient sensitivity once only, separately from first-order BEM response; it is not validated second-order drift. No surge/sway/yaw wave-frequency response, slamming or separated-flow claim."; }
        metadata issue : ModelingMetadata::Issue { text = "Equipment intrinsic inertia and viscous damping need identification. Rotating-wing inertia is evaluated at reference trim. Linear-response coverage is provisional. Mean-water neutral wind profile is rejected below its minimum supported height, rather than relabeled as a moving-surface profile. No aerodynamic extrapolation earns accepted performance. Mission seas outside the solved regular-wave grid are coverage failures, not physical mission failures."; }
        comment sources /* https://capytaine.org/stable/user_manual/problem_setup.html
         * https://capytaine.org/stable/user_manual/hydrostatics.html
         * https://capytaine.org/stable/user_manual/post_pro.html */
    }
    analysis Inputs {
        out attribute settings : Real [10] ordered nonunique = (policy.phaseCount,policy.smallWaveHeightM,policy.maximumMotionRad,policy.maximumSteepness,policy.viscousDampingRatio,policy.maximumHeaveDraftRatio,policy.maximumMeanHeelDeg,policy.meshResolution,policy.meshTolerance,policy.phaseTolerance);
        out attribute periods : Real [3] ordered nonunique = (2,3,5);
        out attribute speeds : Real [5] ordered nonunique = (0,0.75,1.5,2.25,3);
        out attribute directions : Real [4] ordered nonunique = (0,90,180,270);
        out attribute refinement : Real = policy.refinedMeshResolution;
    }
    dependency progress from policy to BlueDogRequirements::legProgress;
    dependency environment from policy to BlueDogRequirements::gorgeWaves;
    dependency recovery from policy to BlueDogRequirements::capsizeControlRecovery;
}

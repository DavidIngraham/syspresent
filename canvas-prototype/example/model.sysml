package Flashlight {
    doc /* A small teaching model, not a qualified product design. Values are illustrative design inputs. */
    private import ScalarValues::*;
    private import ISQ::*;
    private import SI::*;

    requirement <'FL-01'> portable {
        doc /* The assembled flashlight shall have a mass no greater than 0.30 kg. */
    }
    requirement <'FL-02'> controllable {
        doc /* The user shall be able to switch the light on and off. */
    }
    part def Battery {
        doc /* Stores electrical energy. This model does not calculate battery life. */
        attribute mass : ISQ::MassValue = 0.08 [kg];
    }
    part def Lamp;
    part def Switch;
    part light {
        doc /* A design claims satisfaction through its parts and behavior. Claims are distinct from test results. */
        part battery : Battery;
        part lamp : Lamp;
        part switch : Switch;
        attribute mass : ISQ::MassValue = 0.22 [kg];
        satisfy portable;
        satisfy controllable;
    }
    verification def MassCheck {
        doc /* Weigh a complete assembled article. No physical measurement has been recorded in this tutorial. */
        objective { verify portable; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification massCheck : MassCheck;
    action turnOn {
        doc /* A possible ordering, not a recorded execution. Electrical and thermal checks may proceed concurrently. */
        first start;
        action closeSwitch;
        fork checks;
        action supplyPower;
        action checkTemperature;
        join ready;
        action emitLight;
        succession first start then closeSwitch;
        succession first closeSwitch then checks;
        succession first checks then supplyPower;
        succession first checks then checkTemperature;
        succession first supplyPower then ready;
        succession first checkTemperature then ready;
        succession first ready then emitLight;
        succession first emitLight then done;
    }
    state operating {
        doc /* Possible operating states. A transition arrow does not assert that the transition occurred. */
        entry; then off;
        state off;
        state on;
        transition first off then on;
        transition first on then off;
    }
    dependency operatingDesign from turnOn to light;
    comment teachingAssumption /* The mass values are deliberately simple teaching inputs; no measured specimen or test result is implied. */
}

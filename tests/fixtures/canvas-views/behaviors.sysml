package BehaviorViews {
    view sequence : StandardViewDefinitions::SequenceView { expose DeskFan::StartupExchange; }
    view states : StandardViewDefinitions::StateTransitionView { expose DeskFan::operating; }
    use case def StartFan;
    analysis def SpinUp;
    verification def StartupCheck;
    part control;
    use case launch : StartFan;
    view cases : OpenSysMLRenderings::CaseView {
        expose StartFan; expose SpinUp; expose StartupCheck; expose launch;
    }
    view mixed : OpenSysMLRenderings::MixedView {
        expose StartFan; expose SpinUp; expose StartupCheck; expose launch; expose control;
        expose DeskFan::operating; expose DeskFan::StartCycle;
    }
}
package PowerSupply {
    private import FailureAnalysis::*;
    private import CauseAndEffect::*;
    occurrence a : BasicEvent;
    occurrence b : BasicEvent;
    occurrence common : BasicEvent;
    occurrence left : OrGate { ref occurrence :>> inputs = (a,common); }
    occurrence right : OrGate { ref occurrence :>> inputs = (b,common); }
    occurrence loss : AndGate { ref occurrence :>> inputs = (left,right); }
    connection al : Causation connect a to left;
    connection cl : Causation connect common to left;
    connection br : Causation connect b to right;
    connection cr : Causation connect common to right;
    connection lt : Causation connect left to loss;
    connection rt : Causation connect right to loss;
    view tree : OpenSysMLRenderings::FaultTreeView { expose PowerSupply::*; }
}

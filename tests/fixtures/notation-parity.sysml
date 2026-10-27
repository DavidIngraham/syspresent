package NativeNotationParity {
    private import StandardViewDefinitions::*;
    private import RequirementDerivation::*;
    private import ModelingMetadata::*;
    requirement sourceRequirement;
    requirement detailedRequirement;
    #derivation connection derivedFrom {
        end #original basis ::> sourceRequirement;
        end #derive detail ::> detailedRequirement;
    }
    #refinement dependency refinedBy from detailedRequirement to sourceRequirement;
    view requirements : GeneralView {
        filter @SysML::RequirementUsage;
        expose sourceRequirement; expose detailedRequirement;
    }
    item def Value;
    action def Source { out value : Value; }
    action def Sink { in value : Value; }
    action def Pipeline {
        action source : Source;
        then action sink : Sink;
        flow source.value to sink.value;
    }
    view pipeline : ActionFlowView { expose Pipeline; }
    state def Machine {
        entry; then Active;
        state Active parallel {
            entry action initialize;
            do action monitor;
            exit action stop;
            state leftRegion;
            state rightRegion;
        }
    }
    view states : StateTransitionView { expose Machine; }
}

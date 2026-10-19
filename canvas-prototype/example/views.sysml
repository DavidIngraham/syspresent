package CanvasViews {
    private import StandardViewDefinitions::*;
    view requirements : GeneralView {
        filter @SysML::RequirementUsage;
        expose Flashlight::controllable;
    }
    view structure : GeneralView {
        filter @SysML::PartUsage or @SysML::PartDefinition;
        expose Flashlight::light;
    }
    view assembly : InterconnectionView {
        expose Flashlight::light;
    }
    view operation : ActionFlowView {
        expose Flashlight::turnOn;
    }
}

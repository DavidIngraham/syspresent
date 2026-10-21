# A flashlight: requirement, assembly and switching

```syspresent
{"type": "scene", "id": "control", "title": "Switching the light on and off", "view": "CanvasViews::requirements", "focus": "Flashlight::controllable", "panel": {"placement": "right"}, "chapter": {"id": "flashlight-design", "title": "The flashlight design"}}
```

The user needs [control of the light](model:Flashlight::controllable). Select the requirement to expand its statement or follow its satisfaction link to the proposed assembly. The model records an intended design claim.

```syspresent
{"type": "scene", "id": "assembly", "title": "The battery, switch and lamp assembly", "view": "CanvasViews::assembly", "focus": "Flashlight::light", "panel": {"placement": "bottom"}, "journey": ["Flashlight::controllable", "Flashlight::light"], "chapter": {"id": "flashlight-design", "title": "The flashlight design"}, "figures": [{"id": "mass-budget", "title": "Mass budget", "asset": "assets/mass-budget.svg", "alt": "Design mass 0.22 kg compared with a 0.30 kg maximum; both bars start from zero.", "caption": "The design input is below the stated limit. A model value does not establish the mass of a physical flashlight.", "provenance": {"source": "Flashlight::light.mass and Flashlight::portable", "context": "Prepared illustration of tutorial model inputs"}, "modelRefs": ["Flashlight::light", "Flashlight::portable"], "evidence": {"classification": "prepared-analysis", "source": "Flashlight::light.mass and Flashlight::portable; model.sysml", "configuration": "Bundled flashlight teaching model; illustrative values, no specimen", "inputs": {"designMassKg": 0.22, "maximumMassKg": 0.3}}}], "context": [{"kind": "evidence", "title": "Physical verification remains open", "text": "MassCheck specifies weighing an assembled article. This tutorial has no recorded physical result; its native verdict remains inconclusive.", "modelRefs": ["Flashlight::MassCheck"]}]}
```

The General View gathers the assembly before it becomes an internal view. The parts shown here belong to the proposed flashlight. Containment does not establish an electrical flow.

```syspresent
{"type": "scene", "id": "switching", "title": "Checks before the lamp emits light", "view": "CanvasViews::operation", "focus": "Flashlight::turnOn", "panel": {"placement": "right"}, "journey": ["Flashlight::light", "Flashlight::turnOn"], "chapter": {"id": "flashlight-design", "title": "The flashlight design"}}
```

An explicit design dependency connects this behavior to the assembly. The action view preserves the model's fork and join: power and temperature checks can proceed concurrently. This is modeled possible behavior, not an execution trace.

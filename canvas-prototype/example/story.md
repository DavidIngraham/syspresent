# A flashlight: requirement, assembly and switching

```syspresent
{"type":"scene","id":"control","title":"Switching the light on and off","view":"CanvasViews::requirements","focus":"Flashlight::controllable","panel":{"placement":"right"}}
```

The user needs control of the light. Select the requirement to expand its statement or follow its satisfaction link to the proposed assembly. The model records an intended design claim.

```syspresent
{"type":"scene","id":"assembly","title":"The battery, switch and lamp assembly","view":"CanvasViews::assembly","focus":"Flashlight::light","panel":{"placement":"bottom"},"journey":["Flashlight::controllable","Flashlight::light"]}
```

The General View gathers the assembly before it becomes an internal view. The parts shown here belong to the proposed flashlight. Containment does not establish an electrical flow.

```syspresent
{"type":"scene","id":"switching","title":"Checks before the lamp emits light","view":"CanvasViews::operation","focus":"Flashlight::turnOn","panel":{"placement":"right"},"journey":["Flashlight::light","Flashlight::turnOn"]}
```

An explicit design dependency connects this behavior to the assembly. The action view preserves the model's fork and join: power and temperature checks can proceed concurrently. This is modeled possible behavior, not an execution trace.

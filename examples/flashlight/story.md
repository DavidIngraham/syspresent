# A flashlight model: requirements, parts and operation

A flashlight gives us a small engineering question: what would make this design portable and controllable, and what evidence would justify believing it? The model separates the job, the proposed design and the test. You can read those distinctions without knowing every symbol.

```syspresent
{"type":"stop","id":"job","title":"Mass and on/off requirements","view":"requirements","focus":"Flashlight__portable","annotations":[{"target":"Flashlight__portable","text":"An obligation to meet, not a measured result."}],"modelRefs":["Flashlight__portable","Flashlight__controllable"]}
```

The [portability requirement](model:Flashlight::portable) sets a maximum assembled mass. The control requirement says the user must be able to switch the light on and off. These are statements about the finished system. They leave room for different batteries, lamps and switches.

A requirement identifier makes the obligation easy to refer to elsewhere. The shape, colors and placement you see are this tool's presentation of the native model; they are not a claim that the standard mandates this particular page layout.

```syspresent
{"type":"stop","id":"parts","title":"The battery, lamp and switch assembly","view":"structure","focus":"Flashlight__light","annotations":[{"target":"Flashlight__light","text":"The proposed assembly owns its battery, lamp and switch."}],"modelRefs":["Flashlight__light","Flashlight__Battery","Flashlight__teachingAssumption"]}
```

`Battery` is a part definition: it describes a kind of component. The battery inside `light` is a part usage: a particular role in this assembly, typed by that definition. Containment tells us which assembly owns the part. It does not, by itself, tell us how electricity flows or how long the light will run.

The model expresses mass using the standard International System of Quantities (ISQ) and SI units. A mass value has a physical quantity kind and a unit, rather than being an unexplained decimal. The small numerical inputs here are teaching assumptions. No assembled specimen has been weighed, and the battery model does not calculate endurance.

```syspresent
{"type":"stop","id":"claims","title":"Requirement coverage and the inconclusive mass check","view":"matrix","modelRefs":["Flashlight__light","Flashlight__portable","Flashlight__massCheck","Flashlight__teachingAssumption"]}
```

The design declares that it satisfies the requirements. Read a satisfaction relationship as a design claim to investigate. A verification relationship identifies the requirement a test addresses. It does not mean the test passed.

Here the mass check calls for weighing a complete assembly, but its verdict is **inconclusive**. The illustrative mass input cannot turn that verdict into a physical measurement. A table makes it possible to compare the claims and checks side by side without remembering the previous drawing.

```syspresent
{"type":"stop","id":"ordering","title":"Turning on the flashlight","view":"actions","focus":"Flashlight__turnOn","modelRefs":["Flashlight__turnOn"]}
```

The turn-on action gives a possible ordering of work. Closing the switch leads to a fork: power supply and temperature checking can proceed concurrently. A join brings those branches together before light emission.

Follow the directed connections to read the ordering. Do not infer it from left-to-right placement alone. The diagram describes possible behavior; it contains no recorded timestamps and does not show that a real flashlight executed these steps successfully.

```syspresent
{"type":"stop","id":"modes","title":"Off and on states","view":"states","focus":"Flashlight__operating","modelRefs":["Flashlight__operating"]}
```

The state model distinguishes off and on and permits transitions between them. That is a different question from the action diagram's ordering of work. A transition arrow says a change is modeled as possible, not that it happened during a test. This teaching model does not yet supply detailed event triggers, guards or failure states; those would need explicit modeling before drawing stronger conclusions.

The requirement, parts, actions and states are different views of one model. When you explore, keep track of the selected semantic element and the relationships being shown. A hidden relationship is not necessarily an absent relationship.

```syspresent
{"type":"closing","id":"next","title":"Measurements still needed to verify the flashlight","supports":"The model separates requirements, a proposed assembly, possible behavior and an inconclusive verification case. It uses core SysML concepts and standard quantity/unit libraries to make those distinctions explicit.","open":"The numerical inputs remain teaching assumptions. There is no measured assembled mass, demonstrated switching behavior, battery-life prediction or accepted physical product here.","next":"Use the portability requirement to find its design claim and verification case. Then identify the measurement that would let the inconclusive verdict change, without treating the drawing itself as evidence.","modelRefs":["Flashlight__teachingAssumption","Flashlight__portable","Flashlight__massCheck"]}
```

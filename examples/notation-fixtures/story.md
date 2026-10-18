# Follow the meaning through four views

This small desk-fan model makes four notation questions visible: which branch is allowed, which work can overlap, where a state belongs, and who sends a message to whom. The purpose is to inspect how faithfully the views carry those meanings. There is no tested fan or recorded execution behind this example.

```syspresent
{"type":"stop","id":"guarded-work","title":"A guard selects a branch; a fork enables concurrent work","view":"actions","focus":"DeskFan__StartCycle__permission","annotations":[{"target":"DeskFan__StartCycle__permission","text":"Follow the guardEnabled and not guardEnabled labels on the outgoing branches."},{"target":"DeskFan__StartCycle__prepare","text":"Both outgoing branches participate in the modeled preparation; the join reunites them."}],"modelRefs":["DeskFan__StartCycle"]}
```

The decision tests the supplied guard input. An enabled guard permits preparation; a disabled guard leads to refusal. These conditions belong to the directed connections. Their meaning must survive a change in node placement.

After the fork, energizing the motor and recording the request can proceed concurrently. The join waits for those branches before the running action. This describes permitted ordering, not measured duration or evidence that both actions succeeded on hardware. Check that you can follow each branch through to its destination without relying on color alone.

```syspresent
{"type":"stop","id":"nested-modes","title":"A nested state belongs inside its parent mode","view":"states","focus":"DeskFan__operating__active","annotations":[{"target":"DeskFan__operating__active","text":"Accelerating and steady are nested states of active, not peers of idle."}],"modelRefs":["DeskFan__operating"]}
```

At the outer level, the fan can be idle or active. Inside active, it begins in accelerating and can progress to steady. The inner initial marker is different from the outer entry into idle. Flattening those boundaries would lose part of the model.

Transitions describe possible changes of state. They do not record a run, prove a safety interlock, or supply event triggers that this small fixture has not modeled. Inspect both the state boundaries and the transition endpoints.

```syspresent
{"type":"stop","id":"ordered-messages","title":"Message order comes from the modeled events","view":"sequence","focus":"DeskFan__StartupExchange__control","annotations":[{"target":"DeskFan__StartupExchange__control","text":"The middle selfCheck message leaves and returns to this same participant."}],"modelRefs":["DeskFan__StartupExchange"]}
```

The panel sends a request to control. Control then performs a self-check message and sends a ready reply to the panel. The source deliberately declares these messages in a different order; the event successions establish the sequence shown here.

The self-message must remain attached to control at both ends. It should not look like a message to a third participant or disappear as a zero-length connection. Read request, selfCheck and ready in order, then identify the sender and receiver of each. The sequence is a modeled possibility, with no measured timestamps.

```syspresent
{"type":"stop","id":"relationship-directions","title":"A matrix makes relationship direction inspectable","view":"matrix","modelRefs":["DeskFan__controlled","DeskFan__guardedStart","DeskFan__fan","DeskFan__GuardCheck","DeskFan__startCycle","DeskFan__controller"]}
```

Read a row as the source and a column as the target. The derivation connects the original control requirement to the derived guarded-start requirement. The fan claims satisfaction; the guard check identifies what it verifies; the start-cycle action is allocated to the controller.

Those cells express different relationships. A verification link does not mean a passing test: this fixture's verdict is inconclusive. Allocation assigns responsibility without proving that the implementation performs it. The standard language and requirement-derivation library supply the model meanings; the native renderer chooses their drawing and table presentation.

```syspresent
{"type":"closing","id":"inspection-result","title":"What should a faithful presentation preserve?","supports":"The native fixture contains explicit guards and concurrency, composite-state ownership, event-ordered participant messages with a self-message, and distinct directed trace relationships.","open":"Native validation and rendering do not establish that every browser view is readable, accessible or semantically faithful. They also do not establish execution or physical verification of a fan.","next":"Inspect each rendered view for those meanings, including the disabled branch, inner initial state, self-message and verification cell. Record any lost or ambiguous detail before treating the presentation as supported.","modelRefs":["DeskFan__StartCycle","DeskFan__operating","DeskFan__StartupExchange","DeskFan__GuardCheck"]}
```

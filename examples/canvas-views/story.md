# A desk fan: behavior, grids and shared failures

```syspresent
{"type": "scene", "id": "requirements", "title": "Fan control requirements", "view": "ViewDemo::ViewCatalog::requirements", "focus": "ViewDemo::DeskFan::guardedStart", "panel": {"placement": "right"}, "regions": [{"id": "matrix", "view": "ViewDemo::ViewCatalog::matrix", "title": "Responsibility matrix", "focus": "ViewDemo::DeskFan::controller"}]}
```

The requirement graph shows modeled obligations and native relationships. All available compartments are shown by default. Use View to choose All, None, or Focused compartments and Square or Mind-map connections.

```syspresent
{"type": "scene", "id": "matrix", "title": "Controller and motor dependencies", "view": "ViewDemo::ViewCatalog::matrix", "focus": "ViewDemo::DeskFan::controller", "panel": {"placement": "right"}}
```

This matrix has two distinct native dependencies in one controller cell. Select the cell to inspect both, then Explore relationship. Back restores your place in the matrix. A blank cell describes only this view.

```syspresent
{"type": "scene", "id": "records", "title": "Requirement and component records", "view": "ViewDemo::ViewCatalog::records", "focus": "ViewDemo::DeskFan::controlled", "panel": {"placement": "right"}}
```

Read native element records at normal text size. Sort a table column or adjust its width; these changes affect presentation only.

```syspresent
{"type": "scene", "id": "activity", "title": "Guarded fan startup", "view": "ViewDemo::ViewCatalog::activity", "focus": "ViewDemo::DeskFan::StartCycle", "panel": {"placement": "right"}}
```

Native guards control the decision. The two preparation branches can proceed concurrently before joining. This is possible behavior, not a recorded execution.

```syspresent
{"type": "scene", "id": "states", "title": "Idle, accelerating and steady", "view": "ViewDemo::BehaviorViews::states", "focus": "ViewDemo::DeskFan::operating", "panel": {"placement": "right"}}
```

State containment and transitions retain their native boundaries and meaning. Required behavior details stay visible even when optional compartments are hidden.

```syspresent
{"type": "scene", "id": "messages", "title": "Startup messages and a self-check", "view": "ViewDemo::BehaviorViews::sequence", "focus": "ViewDemo::DeskFan::StartupExchange", "panel": {"placement": "right"}}
```

Participant columns and messages follow native ordering. The self-check is a message to the same participant. Vertical spacing does not measure elapsed time.

```syspresent
{"type": "scene", "id": "cases", "title": "Starting and checking the fan", "view": "ViewDemo::BehaviorViews::cases", "focus": "ViewDemo::BehaviorViews::launch", "panel": {"placement": "right"}}
```

Use, analysis and verification cases retain their native distinctions. A modeled verification case does not establish that a physical test passed.

```syspresent
{"type": "scene", "id": "failures", "title": "Shared causes of power loss", "view": "ViewDemo::PowerSupply::tree", "focus": "ViewDemo::PowerSupply::loss", "panel": {"placement": "right"}}
```

The shared basic event contributes to both OR gates. Native cause-to-effect connections feed the AND gate. This qualitative tree supplies no probability calculation.

```syspresent
{"type": "scene", "id": "mixed", "title": "Cases, structure and behavior together", "view": "ViewDemo::BehaviorViews::mixed", "focus": "ViewDemo::BehaviorViews::launch", "panel": {"placement": "right"}}
```

The native mixed view combines model families with their own notation. Each represented item retains its semantic identity.


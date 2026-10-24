# Chapters, figures and evidence in canvas stories

The standalone canvas uses ordinary `story.md`, presentation-owned SysML views
and bundled assets. These features extend `type: scene` blocks; they do not change
native view selection or run an analysis. The previous viewer's stop/figure block
format remains separate.

## Chapters and direct links

Add `chapter: {"id":"gorge", "title":"The Gorge challenge"}` to each scene in a
chapter. IDs and titles must agree, and chapters must be contiguous. Ungrouped
scenes remain valid. Contents lists the ordered chapters and scenes, the scene
selector groups them, and the prose panel shows chapter and overall progress.

Share opens a copyable URL for a packaged demo. It retains the publication path,
selects `?demo=…`, and identifies the scene and native model in its fragment. New
builds also include the digest of the complete demo archive. A changed publication
or missing target produces an error instead of silently opening another version.
Use the original hosted snapshot URL for frozen reviews; the digest is a version
check, not a service that retrieves archived deployments. `#chapter=gorge` opens
the first scene of that chapter; `#scene=gorge-challenge` selects a scene directly.
Browser Back/Forward restores scene navigation.

At a chapter boundary, `allowDisconnected: true` explicitly permits a disclosed
view jump when no engineering route connects the scenes. It does not create a
model relationship or override an invalid saved journey.

Local imports and edited projects have no published URL. Share explains how to
export their project ZIP; it never copies the built-in demo URL for edited data.

## Figures alongside the model

Keep a native `view` and `focus` on every scene. `figures` adds image regions beside
that view. Native regions and figures share a limit of three companion regions.
Narrow layouts use the existing explicit tabs. Enlarge figure opens the same image,
caption and provenance without changing the scene or graph camera.

```syspresent
{"type":"scene","id":"gorge-challenge","title":"The Gorge challenge","view":"BlueDogCanvasViews::challengeOverview","focus":"GorgeChallenge::transGorgeChallenge","chapter":{"id":"gorge","title":"The Gorge challenge"},"figures":[{"id":"course-map","title":"The course","asset":"assets/gorge-course.svg","alt":"Outbound from Bingen to the Stevenson rounding, then back to Bingen.","caption":"Schematic gate order; geographic geometry is omitted.","provenance":{"source":"TransGorgeCourse; models/missions/course.sysml","context":"Identified Blue Dog source revision; schematic"},"modelRefs":["GorgeChallenge::courseCompletion"]}]}
```

Supported images are SVG, PNG, JPEG, WebP and GIF. Assets must exist inside the
project; absolute paths, traversal and external URLs are rejected. They render
through image elements, never injected SVG/HTML or embedded executable documents.
Captions, alt text and both provenance fields are required. ZIP export preserves
asset bytes. Import a folder or ZIP containing images to author new figures.

## Model references in prose

Write `[the protected reserve](model:BlueDogRequirements::recoveryEnergy)`.
References resolve by exact native identity or qualified name; labels are not
lookup keys. Percent encoding is supported. Clicking selects without relayout.
A loaded target outside the current views is disclosed with an explicit Focus
action, and exploration retains Return to scene.

HTTP(S) source links open separately. HTML is literal text, unsupported protocols
are inert, and inline/fenced code does not create model links. Paragraphs,
headings, emphasis, code and ordered/unordered lists are supported. Model-value
substitution and general Markdown tables remain outside this canvas extension;
use native grid views for model tables.

## Context cards and evidence provenance

Add a `context` array to a scene. Each card requires `kind`, `title`, `text` and a
nonempty `modelRefs` array. Cards start collapsed to preserve space for the model.
Kinds are `challenge-requirement`, `owner-constraint`, `assumption`, `allocation`,
`decision`, `candidate`, `analysis` and `evidence`. These are authored explanatory
categories, not statuses inferred by the renderer.

```json
{
  "kind": "decision",
  "title": "A numerical sizing baseline",
  "text": "The rotating wing supplies the initial sizing representation; the rig trade remains open.",
  "modelRefs": ["BlueDogDesignDecisions::sizingBaseline"]
}
```

Figures and cards optionally carry `evidence`:

```json
{
  "classification": "prepared-analysis",
  "source": "Identified native analysis and source record",
  "configuration": "Identified candidate and source revision",
  "inputs": {"massKg": 12}
}
```

`recorded-execution` additionally requires `runId`. Name simulation or physical
specimens explicitly in source/configuration. A displayed record does not imply
a native verification verdict or accepted physical evidence. Missing inputs are
an error; an explicit empty object means there were no inputs to record.

## Editing and publication checks

The editor's Chapter and supporting content section exposes chapter fields and
the figures/context JSON arrays. Ordinary Markdown/ZIP import and export retain
all fields. Invalid edits leave the loaded presentation intact. Publication and
browser imports validate assets, chapter consistency, exact native references and
evidence context; the native compiler remains authoritative for SysML.

Build with `npm run build:canvas`. The native cache preparation and static builder
both validate story references, including the shipped secondary demos. The latter
uses native declarations directly when no prepared cache is supplied.

The Blue Dog example contains the 24 October 2026 working-tree model snapshot,
including uncommitted cleanups based on `b94b6e0231587b52cb5bec800dba408456ca701d`.
Its `source.json` distinguishes `baseRevision` from the exact captured content:
98 hashed files comprise 96 model sources, the model README and publication
queries. The engineering-source digest covers sorted path/NUL/file-hash/LF records.
Syspresent's committed copy and frozen publication identify the actual bytes;
the base commit is ancestry, not a claim that it contains the updated model.
The example includes a complete newcomer narrative with 31 scenes in 14 chapters, from the
Gorge challenge through requirements, trades, candidate architecture and the
qualification campaign. The flashlight example supplies a small prepared
analysis illustration with explicit inputs and no recorded physical result.

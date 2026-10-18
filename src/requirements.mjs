/** Requirement reading uses explicit native identities and edge directions only. */
export const isRequirement = e => ['RequirementDefinition','RequirementUsage'].includes(e?.kind);
export function requirementFamily(bundle, focus) {
  const index = new Map([...(bundle.searchIndex??[]),...bundle.elements].map(e=>[e.id,e]));
  if (!isRequirement(index.get(focus))) return [];
  const family = new Set([focus]);
  for (const e of bundle.relationships) {
    if (e.kind !== 'type') continue;
    if (e.source === focus && index.get(e.target)?.kind === 'RequirementDefinition') family.add(e.target);
    if (e.target === focus && index.get(e.source)?.kind === 'RequirementUsage') family.add(e.source);
  }
  return [...family];
}
const semantic = e => ['native-render-view','native-api-relationship'].includes(e.authority);
export function requirementReading(bundle, focus, limit = 24) {
  const index = new Map([...(bundle.searchIndex??[]),...bundle.elements].map(e=>[e.id,e]));
  const allFamily = requirementFamily(bundle,focus), family=allFamily.slice(0,Math.max(2,limit)), ids = new Set(family);
  const unique = new Map();
  for(const e of bundle.relationships.filter(semantic)) unique.set(JSON.stringify([e.source,e.target,e.kind,e.label,e.nativeRelationship??e.nativeQualifiedName??'']),e);
  const edges = [...unique.values()];
  const groups = {sources:[],derived:[],affected:[],verification:[],constraints:[]};
  const unavailable=new Set(bundle.unavailableTargets??[]);
  const row = (edge,id,via=null) => ({id,edge,via,element:index.get(id),available:!unavailable.has(id)&&(index.has(id)||!!bundle.modelStore)});
  for(const e of edges) {
    if(ids.has(e.source) && !ids.has(e.target) && ['derive','dependency'].includes(e.kind)) groups.sources.push(row(e,e.target));
    if(ids.has(e.target) && !ids.has(e.source)) {
      if(e.kind==='derive') groups.derived.push(row(e,e.source));
      if(['satisfy','refine','dependency'].includes(e.kind)) groups.affected.push(row(e,e.source));
      if(e.kind==='verify') groups.verification.push(row(e,e.source));
    }
    if(e.kind==='allocate' && ids.has(e.source) !== ids.has(e.target)) groups.affected.push(row(e,ids.has(e.source)?e.target:e.source));
  }
  // One explicitly identified downstream step reveals implementation and tests
  // of a derived requirement. It does not imply satisfaction of the parent.
  for(const derived of [...new Map(groups.derived.map(r=>[r.id,r])).values()].slice(0,limit)) for(const e of edges) {
    if(e.target!==derived.id || !['satisfy','verify','refine'].includes(e.kind) || ids.has(e.source)) continue;
    groups[e.kind==='verify'?'verification':'affected'].push(row(e,e.source,derived.id));
  }
  for(const e of bundle.relationships) if(e.kind==='ownedMember' && ids.has(e.source)
    && ['ConstraintUsage','ConstraintDefinition','AssertConstraintUsage'].includes(index.get(e.target)?.kind)) groups.constraints.push(row(e,e.target));
  for(const key of Object.keys(groups)) {
    const merged=new Map();
    for(const r of groups[key]) {
      const identity=JSON.stringify([r.id,r.edge.kind]);
      if(!merged.has(identity))merged.set(identity,{...r,paths:[]});
      merged.get(identity).paths.push({via:r.via,edge:r.edge});
    }
    groups[key]=[...merged.values()];
  }
  groups.affected.sort((a,b)=>Number(a.edge.kind==='dependency')-Number(b.edge.kind==='dependency'));
  const records = family.flatMap(id=>(index.get(id)?.readingRecords??[]).map(record=>({...record,owner:id})));
  const rationaleRecord = r=>r.name?.toLowerCase()==='rationale' || r.types?.some(t=>t.split('::').at(-1)==='Rationale');
  const relationshipOwners = new Set(groups.sources.slice(0,limit).flatMap(r=>r.paths.map(p=>p.edge.nativeRelationship)).filter(Boolean));
  const rationale = [...records.filter(rationaleRecord),...[...relationshipOwners].flatMap(id=>(index.get(id)?.readingRecords??[]).filter(rationaleRecord).map(record=>({...record,owner:id,onRelationship:true})))];
  const notes = records.filter(r=>!rationaleRecord(r));
  const statements = family.map(id=>index.get(id)).filter(e=>e?.description?.trim());
  return {focus:index.get(focus),family,omittedApplications:allFamily.length-family.length,statements,rationale,notes,groups,
    visible:Object.fromEntries(Object.entries(groups).map(([k,rows])=>[k,rows.slice(0,limit)])),
    omitted:Object.fromEntries(Object.entries(groups).map(([k,rows])=>[k,Math.max(0,rows.length-limit)]))};
}

/** Load complete records only for bounded question results, not the whole graph. */
export async function loadRequirementReading(store,bundle,focus,limit=24) {
  let reading = requirementReading(bundle,focus,limit);
  if(!reading.family.length || !store) return reading;
  const requireLoad = async (ids,allowUnavailable=false) => {
    const result=await store.ensureNeighborhood([...new Set(ids)]);
    if(result.unavailable.length&&!allowUnavailable) throw Error('Requirement context unavailable for '+result.unavailable.length+' model targets');
  };
  await requireLoad(reading.family);
  reading=requirementReading(bundle,focus,limit);
  await requireLoad(reading.family);
  reading=requirementReading(bundle,focus,limit);
  await requireLoad(Object.values(reading.visible).flat().filter(r=>r.available).map(r=>r.id),true);
  reading=requirementReading(bundle,focus,limit);
  // Loading a derived requirement can reveal previously unloaded parts/cases.
  await requireLoad(Object.values(reading.visible).flat().filter(r=>r.available).map(r=>r.id),true);
  reading=requirementReading(bundle,focus,limit);
  // A usage's statement is on its classifier. Preserve both identities.
  await requireLoad([...new Set(Object.values(reading.visible).flat().flatMap(r=>requirementFamily(bundle,r.id).slice(0,Math.max(2,limit))))]);
  reading=requirementReading(bundle,focus,limit);
  await requireLoad(Object.values(reading.visible).flat().flatMap(r=>r.paths.map(p=>p.edge.nativeRelationship)).filter(Boolean),true);
  return requirementReading(bundle,focus,limit);
}

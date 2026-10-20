/** Discover indexes from native parse/export results, never source text or names. */
export function discoverNativeIndex(parsed, exported, {modelDocumentCount=parsed.roots?.length??0}={}) {
 const rootIDs=new Set((parsed.roots??[]).slice(0,modelDocumentCount||undefined).flatMap(root=>root.childIds??[]));
 const modelRoots=[...new Set((exported.elements??[]).filter(e=>rootIDs.has(e['@id'])&&e.qualifiedName).map(e=>e.qualifiedName))].sort();
 const requirementSeeds=[...new Set((exported.elements??[]).filter(e=>['RequirementUsage','RequirementDefinition'].includes(e['@type'])&&e.declaredName&&e.qualifiedName).map(e=>e.qualifiedName))].sort();
 return {modelRoots,requirementSeeds};
}

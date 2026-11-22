/** Discover indexes from native parse/export results, never source text or names. */
export function discoverNativeIndex(parsed, exported, {modelDocumentCount=parsed.roots?.length??0}={}) {
 const rootIDs=new Set((parsed.roots??[]).slice(0,modelDocumentCount||undefined).flatMap(root=>root.childIds??[]));
 const modelRoots=[...new Set((exported.elements??[]).filter(e=>rootIDs.has(e['@id'])&&e.qualifiedName).map(e=>e.qualifiedName))].sort();
 const requirementSeeds=[...new Set((exported.elements??[]).filter(e=>['RequirementUsage','RequirementDefinition'].includes(e['@type'])&&e.declaredName&&e.qualifiedName).map(e=>e.qualifiedName))].sort();
 return {modelRoots,requirementSeeds};
}

/** Prepare native discovery only; callers still request the complete declaration objects. */
export async function discoverModelIndex(engine,parsed,{capabilities=[],modelDocumentCount}={}){
 const lightweight=capabilities.includes('declaration_index');
 const response=await engine.call('ExportModel',{modelHash:parsed.modelHash,projection:lightweight?'declaration-index':'declarations'});
 if(!lightweight)return {...discoverNativeIndex(parsed,response,{modelDocumentCount}),qualifiedNames:(response.elements??[]).map(e=>e.qualifiedName).filter(Boolean)};
 if(response.projection!=='declaration-index'||!Array.isArray(response.declarationIndex))throw Error('Invalid native declaration index');
 const entries=response.declarationIndex;
 for(const entry of entries)if(typeof entry.id!=='string'||!entry.id||typeof entry.qualifiedName!=='string'||!entry.qualifiedName||entry.requirementSeed!==undefined&&typeof entry.requirementSeed!=='boolean')throw Error('Invalid native declaration index entry');
 const rootIDs=new Set((parsed.roots??[]).slice(0,modelDocumentCount||undefined).flatMap(root=>root.childIds??[]));
 return {modelRoots:[...new Set(entries.filter(e=>rootIDs.has(e.id)).map(e=>e.qualifiedName))].sort(),requirementSeeds:[...new Set(entries.filter(e=>e.requirementSeed===true).map(e=>e.qualifiedName))].sort(),qualifiedNames:entries.map(e=>e.qualifiedName)};
}

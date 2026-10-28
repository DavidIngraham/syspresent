import {graphView} from './graph.mjs';

/** Native declaration kinds are full cards; port declarations are not port glyphs. */
export function completeChildView(graph,context,title='Complete contents'){
 const view=graphView(graph,context,title),byId=new Map(graph.elements.map(e=>[e.id,e]));
 const projection=context.childProjection;
 if(!projection?.complete)throw Error('A complete native child projection is required');
 view.childProjection=projection;
 const counts=new Map();for(const id of projection.childIds){const owner=projection.declaredOn[id];counts.set(owner,(counts.get(owner)??0)+1);}
 view.nodes=view.nodes.map(node=>{
  const native=byId.get(node.semanticId),children=counts.get(node.semanticId)??0;
  const named=!!native.native?.declaredName||!!native.native?.declaredShortName;
  return {...node,kind:native.kind,childDeclaration:true,name:named?node.name:'Unnamed '+native.kind,
   ...(children?{overviewLabel:children+' immediate declarations'}:{})};
 });
 return view;
}

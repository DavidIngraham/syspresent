/** Native notation kinds from OpenSysML internal/ir/view/{case,fault_tree,dot}.go.
 * Labels are display data, never a source for classifying model semantics. */
const cases = new Set(['case','case def','use case','use case def','analysis','analysis def','verification','verification def','analysis case','analysis case def','verification case','verification case def']);
const events = new Set(['event','basic event','house event','undeveloped event','AND','OR']);
const controls = new Set(['start','initial','final','end','terminate','terminate action','fork','join','decision','merge','choice','junction','shallow history','deep history']);
const behaviors = new Set(['state','state def','region','action','action def','accept','send','perform action','exhibit state']);
export const behaviorNodeDetail = node => behaviorNotation(node)?[...new Set([node.text,node.detail].filter(Boolean))].join('\n'):'';
const visibleDetail=node=>{
  const native=behaviorNodeDetail(node),shown=node.displayDetail??'';
  return shown.includes(native)?shown:[native,shown].filter(Boolean).join('\n');
};

export function behaviorNotation(node) {
  if (cases.has(node.kind)) return {family:'case',shape:'ellipse'};
  if (node.kind==='objective') return {family:'case',shape:'note'};
  if (['actor','subject'].includes(node.kind)) return {family:'case',shape:'box'};
  if (events.has(node.kind)) return {family:'fault-tree',shape:node.kind};
  if (controls.has(node.kind)) return {family:'control',shape:node.kind};
  if (behaviors.has(node.kind)) return {family:'behavior',shape:node.kind==='region'?'region':'rounded'};
  return null;
}

/** Render a face inside the application's existing selectable node button. */
export function behaviorFace(document,node) {
  const notation=behaviorNotation(node); if(!notation)return null;
  const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
  const face=make('span',null,`node-face behavior-face behavior-${notation.family}`);
  face.dataset.shape=notation.shape;
  if(notation.family==='control'){
    const glyph=make('span',{'shallow history':'H','deep history':'H*'}[node.kind]??'','behavior-control');
    glyph.setAttribute('aria-hidden','true');face.append(glyph);
    const name=(node.nameSynthesized??node.name_synthesized)?'':node.name;
    const label=[name,behaviorNodeDetail(node)].filter(Boolean).join('\n');
    if(label)face.append(make('span',label,'control-caption'));
    return face;
  }
  if(notation.family==='fault-tree'){
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 80 60');svg.setAttribute('aria-hidden','true');svg.classList.add('fault-symbol');
    const path=document.createElementNS(svg.namespaceURI,'path');
    path.setAttribute('d',{
      AND:'M16 54 V30 A24 24 0 0 1 64 30 V54 Z',
      OR:'M16 54 Q20 20 40 6 Q60 20 64 54 Q40 43 16 54 Z',
      'basic event':'M64 30 A24 24 0 1 1 16 30 A24 24 0 1 1 64 30 Z',
      'undeveloped event':'M40 6 L70 30 L40 54 L10 30 Z',
      'house event':'M12 54 V24 L40 6 L68 24 V54 Z',
      event:'M10 10 H70 V50 H10 Z'
    }[node.kind]);svg.append(path);face.append(svg);
  }
  face.append(make('span',`«${node.kind}»${node.type?' : '+node.type:''}`,'kind'));
  const name=(node.nameSynthesized??node.name_synthesized)?'':node.name;
  if(name)face.append(make('span',name,'name'));
  const detail=visibleDetail(node);
  if(detail)face.append(make('span',detail,'detail'));
  return face;
}

/** Presentation geometry only; keep all native containment and shared identities. */
export function applyBehaviorLayout(view){
  return {...view,nodes:view.nodes.map(node=>{
    const notation=behaviorNotation(node);if(!notation||notation.family==='control')return node;
    const text=visibleDetail(node),lines=text.split('\n').reduce((sum,line)=>sum+Math.max(1,Math.ceil(line.length/28)),0);
    const base=notation.family==='fault-tree'?132:notation.family==='case'?110:80;
    return {...node,width:Math.max(node.width??0,notation.shape==='ellipse'?200:170),height:Math.max(node.height??0,base+(text?lines*18:0)),behaviorFamily:notation.family};
  })};
}

/** Curves change drawing geometry only. Native endpoint/port/marker data is untouched. */
import {routeIsClear,connectionObstacles} from './geometry.mjs';
const point = p => `${p.x},${p.y}`;
const line = points => points.map((p,i)=>(i?'L':'M')+point(p)).join(' ');
const mix = (a,b,t) => ({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
function cubic(a,b,c,d,t) {
  return mix(mix(mix(a,b,t),mix(b,c,t),t),mix(mix(b,c,t),mix(c,d,t),t),t);
}
/** Prefer a flowing endpoint-tangent curve; fall back to safe rounded routing corridors. */
export function connectionPath(points, {style='square',edge={},nodes=[]}={}) {
  if (!points?.length) return '';
  if (style !== 'mind-map' || points.length < 3) return line(points);
  const a=points[0],d=points.at(-1),start=points[1],end=points.at(-2);
  const handle=Math.min(140,distance(a,d)*.45),l1=distance(a,start)||1,l2=distance(d,end)||1;
  const b={x:a.x+(start.x-a.x)/l1*handle,y:a.y+(start.y-a.y)/l1*handle};
  const c={x:d.x+(end.x-d.x)/l2*handle,y:d.y+(end.y-d.y)/l2*handle};
  // A conservative control-polygon hull test ensures the entire curve avoids
  // unrelated tiles. Sampling alone would miss a narrow obstacle between samples.
  const xmin=Math.min(a.x,b.x,c.x,d.x),xmax=Math.max(a.x,b.x,c.x,d.x);
  const ymin=Math.min(a.y,b.y,c.y,d.y),ymax=Math.max(a.y,b.y,c.y,d.y);
  const blocks=connectionObstacles(edge,nodes);
  const hullClear=!blocks.some(n=>xmin<n.x+n.width&&xmax>n.x&&ymin<n.y+n.height&&ymax>n.y);
  const samples=Array.from({length:33},(_,i)=>cubic(a,b,c,d,i/32));
  if(hullClear&&routeIsClear(samples,edge,nodes))return `M${point(a)} C${point(b)} ${point(c)} ${point(d)}`;
  let path='M'+point(a);
  for(let i=1;i<points.length-1;i++){
    const p=points[i],prev=points[i-1],next=points[i+1];
    let r=Math.min(28,distance(prev,p)/3,distance(p,next)/3);
    // A quadratic curve stays inside this small corner box.
    let before,after;
    while(r>.5){
      before=mix(p,prev,r/(distance(prev,p)||1));after=mix(p,next,r/(distance(p,next)||1));
      const x=Math.min(before.x,p.x,after.x),y=Math.min(before.y,p.y,after.y),right=Math.max(before.x,p.x,after.x),bottom=Math.max(before.y,p.y,after.y);
      if(!blocks.some(n=>x<n.x+n.width&&right>n.x&&y<n.y+n.height&&bottom>n.y))break;
      r/=2;
    }
    path+=r>.5?` L${point(before)} Q${point(p)} ${point(after)}`:` L${point(p)}`;
  }
  return path+' L'+point(d);
}

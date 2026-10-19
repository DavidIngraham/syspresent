/** A single clock for the entire semantic journey, with no per-stage easing/pauses. */
export const journeyOffsets=count=>count===2?[0,1]:Array.from({length:count},(_,i)=>i/(count-1));
export function sampleTrack(track,offsets,progress){
 if(progress<=0)return {...track[0]};if(progress>=1)return {...track.at(-1)};
 let i=0;while(i<offsets.length-2&&progress>offsets[i+1])i++;
 const t=(progress-offsets[i])/(offsets[i+1]-offsets[i]),a=track[i],b=track[i+1],result={};
 for(const key of Object.keys(a)){
  if(typeof a[key]!=='number'){result[key]=t<.5?a[key]:b[key];continue;}
  // Monotone Hermite: retain velocity through intermediate stops, without overshoot.
  const derivative=index=>{
   const slope=j=>(track[j+1][key]-track[j][key])/(offsets[j+1]-offsets[j]);
   if(index===0)return slope(0);if(index===track.length-1)return slope(index-1);
   const left=slope(index-1),right=slope(index);if(left*right<=0)return 0;
   const h0=offsets[index]-offsets[index-1],h1=offsets[index+1]-offsets[index],w0=2*h1+h0,w1=h1+2*h0;
   return (w0+w1)/(w0/left+w1/right);
  };
  const width=offsets[i+1]-offsets[i],m0=derivative(i)*width,m1=derivative(i+1)*width;
  const value=(2*t**3-3*t**2+1)*a[key]+(t**3-2*t**2+t)*m0+(-2*t**3+3*t**2)*b[key]+(t**3-t**2)*m1;
  result[key]=Math.max(Math.min(a[key],b[key]),Math.min(Math.max(a[key],b[key]),value));
 }
 return result;
}
export const easeJourney=t=>(1-Math.cos(Math.PI*Math.max(0,Math.min(1,t))))/2;
export function startTimeline({duration,update,request=fn=>requestAnimationFrame(fn),cancel=id=>cancelAnimationFrame(id),now=()=>performance.now()}){
 let handle,stopped=false,resolve;const finished=new Promise(r=>resolve=r),start=now();
 const finish=cancelled=>{if(stopped)return;stopped=true;if(handle!==undefined)cancel(handle);resolve({cancelled});};
 const tick=time=>{if(stopped)return;const t=Math.min(1,Math.max(0,(time-start)/duration));update(easeJourney(t),t);if(t>=1)finish(false);else handle=request(tick);};
 if(duration<=0){update(1,1);finish(false);}else{update(0,0);handle=request(tick);}
 return {finished,cancel:()=>finish(true),finish:()=>{if(!stopped){update(1,1);finish(false);}}};
}
export function samplePolyline(points,count=20){
 const lengths=[0];for(let i=1;i<points.length;i++)lengths.push(lengths.at(-1)+Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y));
 const total=lengths.at(-1);return Array.from({length:count},(_,i)=>{const distance=total*i/(count-1);let j=1;while(j<lengths.length-1&&lengths[j]<distance)j++;const amount=(distance-lengths[j-1])/(lengths[j]-lengths[j-1]||1);return {x:points[j-1].x+(points[j].x-points[j-1].x)*amount,y:points[j-1].y+(points[j].y-points[j-1].y)*amount};});
}

/** An interrupted journey can retain not-yet-visible content from abandoned stops.
 * It must not create a paint item unless some current timeline actually shows it. */
export function visibleTrackKeys(frames,collection){return [...new Set(frames.flatMap(frame=>frame[collection].filter(item=>(item.opacity??1)>0).map(item=>item.key)))];}

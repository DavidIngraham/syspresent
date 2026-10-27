/** Acceptance policy for one uninterrupted WASM worker's measured stress cycles. */
export const MiB=1024*1024;
export const MEMORY_STABILITY_POLICY=Object.freeze({minimumCycles:6,maximumCycles:10,windowCycles:3,maximumWindowGrowthBytes:16*MiB,maximumCycleGrowthBytes:4*MiB,minimumHeadroomBytes:512*MiB,addressSpaceBytes:4096*MiB,stopLinearBytes:3584*MiB});
export function memorySafetyFailure(linearMemoryBytes,policy=MEMORY_STABILITY_POLICY){
 if(!Number.isSafeInteger(linearMemoryBytes)||linearMemoryBytes<0)return 'Invalid WASM linear-memory measurement';
 if(linearMemoryBytes>=policy.stopLinearBytes)return 'WASM linear memory reached the protective stress limit';
 if(policy.addressSpaceBytes-linearMemoryBytes<policy.minimumHeadroomBytes)return 'Insufficient WASM address-space headroom';
}
export function evaluateMemoryStability(cycles,overrides={}){
 const policy={...MEMORY_STABILITY_POLICY,...overrides};
 if(!Number.isInteger(policy.minimumCycles)||policy.minimumCycles<policy.windowCycles||policy.maximumCycles<policy.minimumCycles)throw Error('Invalid memory stability policy');
 const failed=reason=>({status:'failed',reason,completedCycles:cycles.length});
 let previous=0;
 for(const [index,cycle] of cycles.entries()){
  if(cycle.cycle!==index+1)return failed('Stress cycles must be consecutive in one worker');
  if(![cycle.startLinearMemoryBytes,cycle.endLinearMemoryBytes,cycle.maxLinearMemoryBytes].every(value=>Number.isSafeInteger(value)&&value>=0))return failed('Invalid per-cycle linear-memory measurement');
  if(cycle.settledRetainedModels!==1||!Number.isInteger(cycle.reviewRetainedModels)||cycle.reviewRetainedModels<1||cycle.reviewRetainedModels>2)return failed('Native model retention exceeded the allowed settled/review ownership');
  const safety=memorySafetyFailure(cycle.maxLinearMemoryBytes,policy);if(safety)return failed(safety);
  if(cycle.startLinearMemoryBytes<previous||cycle.endLinearMemoryBytes<cycle.startLinearMemoryBytes||cycle.maxLinearMemoryBytes!==cycle.endLinearMemoryBytes)return failed('Linear memory decreased or worker continuity was lost');
  previous=cycle.endLinearMemoryBytes;
 }
 const latest=cycles.at(-1),headroomBytes=policy.addressSpaceBytes-(latest?.maxLinearMemoryBytes??0);
 if(cycles.length<policy.minimumCycles)return {status:'continue',reason:'Minimum uninterrupted cycle count has not been reached',completedCycles:cycles.length,headroomBytes};
 const window=cycles.slice(-policy.windowCycles);
 const growthBytes=window.map(cycle=>cycle.maxLinearMemoryBytes-(cycles[cycle.cycle-2]?.maxLinearMemoryBytes??cycle.startLinearMemoryBytes));
 const windowGrowthBytes=growthBytes.reduce((sum,value)=>sum+value,0);
 const plateau=growthBytes.every(bytes=>bytes<=policy.maximumCycleGrowthBytes)&&windowGrowthBytes<=policy.maximumWindowGrowthBytes&&headroomBytes>=policy.minimumHeadroomBytes;
 const detail={completedCycles:cycles.length,headroomBytes,windowGrowthBytes,cycleGrowthBytes:growthBytes,windowCycles:window.map(cycle=>cycle.cycle)};
 if(plateau)return {status:'passed',reason:'Late uninterrupted cycles meet the measured high-water plateau policy',...detail};
 if(cycles.length>=policy.maximumCycles)return {status:'failed',reason:'Maximum cycle count reached without a high-water plateau',...detail};
 return {status:'continue',reason:'Late high-water growth has not met the plateau policy',...detail};
}
